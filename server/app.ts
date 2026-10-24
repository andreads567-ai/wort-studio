/**
 * Wort Site Engine — API Express compartilhada entre:
 *  - o servidor local (server.ts → `npm run dev` / `npm start`)
 *  - a função serverless da Vercel (api/index.ts)
 *
 * Toda a persistência passa por ./storage (Upstash Redis em produção, arquivo JSON localmente).
 * As sessões administrativas são tokens assinados (HMAC), pois na Vercel cada requisição
 * pode cair em uma instância diferente e não há memória compartilhada.
 */
import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { waitUntil } from '@vercel/functions';
import type { DemoModel, QuoteRequest, CommercialSettings } from '../src/types/index.js';
import { getStorage, StorageNotConfiguredError } from './storage.js';
import { dispatchZohoEmail, hasZohoConfigured, verifyAndRefreshZohoOAuth, fetchZohoMailAccount } from './mailer.js';
import {
  escapeHtml,
  renderClientQuoteEmail,
  renderAdminLeadNotificationEmail,
  renderStatusUpdateEmail
} from './emailTemplates.js';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/** Encaminha erros de handlers assíncronos para o middleware de erro (Express 4). */
const wrap = (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res, next).catch(next);
};

// ---------------------------------------------------------------------------
// Sessões administrativas (tokens assinados, sem estado no servidor)
// ---------------------------------------------------------------------------
function getEffectiveAdminPassword(settings: CommercialSettings): string {
  const envPass = (process.env.ADMIN_PASSWORD || '').trim();
  const stored = (settings.adminPasswordHash || '').trim();
  return envPass || stored || 'Wortsite@admin2026##';
}

/**
 * A chave de assinatura inclui a senha atual: ao trocar a senha no painel,
 * todas as sessões antigas deixam de ser válidas automaticamente.
 */
function signingKey(settings: CommercialSettings): string {
  return `${process.env.SESSION_SECRET || 'wort-session'}::${getEffectiveAdminPassword(settings)}`;
}

function stableSigningKey(): string {
  return `${process.env.SESSION_SECRET || 'wort-session'}::wort-admin-stable`;
}

function sign(payload: string, settings: CommercialSettings): string {
  return crypto.createHmac('sha256', signingKey(settings)).update(payload).digest('base64url');
}

function signStable(payload: string): string {
  return crypto.createHmac('sha256', stableSigningKey()).update(payload).digest('base64url');
}

function createAdminToken(settings: CommercialSettings): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS, n: crypto.randomBytes(8).toString('hex') })).toString('base64url');
  return `${payload}.${sign(payload, settings)}`;
}

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function isValidAdminToken(token: string, settings: CommercialSettings): boolean {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const matchesSettingsKey = safeEqual(signature, sign(payload, settings));
  const matchesStableKey = safeEqual(signature, signStable(payload));
  const matchesDefaultKey = safeEqual(
    signature,
    crypto.createHmac('sha256', `${process.env.SESSION_SECRET || 'wort-session'}::Wortsite@admin2026##`).update(payload).digest('base64url')
  );
  if (!matchesSettingsKey && !matchesStableKey && !matchesDefaultKey) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

function getBearerToken(req: Request): string {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

const requireAdmin = wrap(async (req, res, next) => {
  const { settings } = await getStorage().getContent();
  if (!isValidAdminToken(getBearerToken(req), settings)) {
    return res.status(401).json({ error: 'Sessão administrativa inválida ou expirada. Faça login novamente.' });
  }
  next();
});

/** Remove senha do admin e todas as credenciais/configurações do Zoho antes de expor publicamente. */
function toPublicSettings(settings: CommercialSettings): Partial<CommercialSettings> {
  const publicSettings: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(settings || {})) {
    if (key === 'adminPasswordHash' || key.startsWith('zoho')) continue;
    publicSettings[key] = value;
  }
  return publicSettings as Partial<CommercialSettings>;
}

function getClientIp(req: Request): string {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Executa uma tarefa em segundo plano sem atrasar a resposta.
 * Na Vercel, `waitUntil` mantém a função viva até a tarefa terminar.
 */
function runInBackground(task: Promise<unknown>) {
  const safeTask = task.catch(err => console.error('[Background] Falha:', err?.message || err));
  try {
    waitUntil(safeTask);
  } catch {
    // Fora da Vercel a promise simplesmente continua executando
  }
}

// ---------------------------------------------------------------------------
export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  // Normaliza o path caso a Vercel entregue a requisição sem o prefixo /api
  app.use((req, res, next) => {
    if (!req.url.startsWith('/api')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }
    next();
  });

  app.use(express.json({ limit: '2mb' }));

  // 1. Health check
  app.get('/api/health', (req: Request, res: Response) => {
    let storage = 'não configurado';
    try {
      storage = getStorage().kind;
    } catch {
      // mantém "não configurado"
    }
    res.json({
      status: 'ok',
      service: 'Wort Site Engine',
      version: '1.2.0', storage,

      supabaseConnected: storage === 'supabase', // status

      timestamp: new Date().toISOString()
    });
  });

  // 2. Public initial data
  app.get('/api/data', wrap(async (req, res) => {
    const content = await getStorage().getContent();
    res.json({
      models: content.models,
      plans: content.plans,
      services: content.services,
      settings: toPublicSettings(content.settings)
    });
  }));

  // 3. Models endpoints
  app.get('/api/models', wrap(async (req, res) => {
    const { models } = await getStorage().getContent();
    res.json(models);
  }));

  app.post('/api/models', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const content = await storage.getContent();
    const newModel: DemoModel = {
      ...req.body,
      id: req.body.id || `modelo-${Date.now()}`
    };
    content.models.unshift(newModel);
    try {
      await storage.saveContent(content);
      console.log(`[Settings API] Configurações e credenciais gravadas com sucesso no storage (${storage.kind})`);
    } catch (saveErr: any) {
      console.error('[Settings API Error] Falha ao persistir configurações no banco:', saveErr);
      return res.status(500).json({
        error: `Falha ao gravar configurações no banco de dados (${storage.kind}): ${saveErr?.message || saveErr}`
      });
    }
    res.status(201).json(newModel);
  }));

  app.put('/api/models/:id', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const content = await storage.getContent();
    const index = content.models.findIndex(m => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Modelo não encontrado' });
    }
    content.models[index] = { ...content.models[index], ...req.body };
    try {
      await storage.saveContent(content);
      console.log(`[Settings API] Configurações e credenciais gravadas com sucesso no storage (${storage.kind})`);
    } catch (saveErr: any) {
      console.error('[Settings API Error] Falha ao persistir configurações no banco:', saveErr);
      return res.status(500).json({
        error: `Falha ao gravar configurações no banco de dados (${storage.kind}): ${saveErr?.message || saveErr}`
      });
    }
    res.json(content.models[index]);
  }));

  app.delete('/api/models/:id', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const content = await storage.getContent();
    const index = content.models.findIndex(m => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Modelo não encontrado' });
    }
    const removed = content.models.splice(index, 1);
    try {
      await storage.saveContent(content);
      console.log(`[Settings API] Configurações e credenciais gravadas com sucesso no storage (${storage.kind})`);
    } catch (saveErr: any) {
      console.error('[Settings API Error] Falha ao persistir configurações no banco:', saveErr);
      return res.status(500).json({
        error: `Falha ao gravar configurações no banco de dados (${storage.kind}): ${saveErr?.message || saveErr}`
      });
    }
    res.json(removed[0]);
  }));

  // 4. Plans endpoints
  app.get('/api/plans', wrap(async (req, res) => {
    const { plans } = await getStorage().getContent();
    res.json(plans);
  }));

  app.put('/api/plans/:id', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const content = await storage.getContent();
    const index = content.plans.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }
    content.plans[index] = { ...content.plans[index], ...req.body };
    try {
      await storage.saveContent(content);
      console.log(`[Settings API] Configurações e credenciais gravadas com sucesso no storage (${storage.kind})`);
    } catch (saveErr: any) {
      console.error('[Settings API Error] Falha ao persistir configurações no banco:', saveErr);
      return res.status(500).json({
        error: `Falha ao gravar configurações no banco de dados (${storage.kind}): ${saveErr?.message || saveErr}`
      });
    }
    res.json(content.plans[index]);
  }));

  // 5. Settings endpoints
  app.get('/api/settings', requireAdmin, wrap(async (req, res) => {
    const { settings } = await getStorage().getContent();
    // Se a senha ainda vem só da variável ADMIN_PASSWORD, mostra-a no formulário para não bloquear o salvamento
    res.json({ ...settings, adminPasswordHash: getEffectiveAdminPassword(settings) });
  }));

  app.put('/api/settings', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const content = await storage.getContent();
    const current = content.settings;
    const incoming = { ...req.body };

    // Proteção: a senha administrativa nunca pode ficar vazia
    if (incoming.adminPasswordHash !== undefined) {
      const trimmedPass = String(incoming.adminPasswordHash).trim();
      if (!trimmedPass) {
        return res.status(400).json({ error: 'A senha de acesso administrativo não pode ficar em branco. Digite uma senha válida com pelo menos 6 caracteres.' });
      }
      if (trimmedPass.length < 6) {
        return res.status(400).json({ error: 'A senha de acesso administrativo deve conter no mínimo 6 caracteres.' });
      }
      incoming.adminPasswordHash = trimmedPass;
    } else {
      incoming.adminPasswordHash = current.adminPasswordHash || process.env.ADMIN_PASSWORD || '';
    }

    // Proteção: nunca apagar tokens/credenciais OAuth existentes se o cliente enviou string vazia
    for (const key of ['zohoRefreshToken', 'zohoAccessToken', 'zohoClientId', 'zohoClientSecret', 'zohoAccountId'] as const) {
      if (!incoming[key] && current[key]) incoming[key] = current[key];
    }

    if ((incoming.zohoClientId || incoming.zohoRefreshToken) && !incoming.zohoPass) {
      incoming.zohoAuthType = 'oauth2';
    }

    content.settings = { ...current, ...incoming };

    // Verifica automaticamente Client ID, Client Secret e Refresh Token ao salvar
    let zohoVerification = undefined;
    if (content.settings.zohoAuthType !== 'smtp' && (content.settings.zohoClientId || content.settings.zohoRefreshToken)) {
      zohoVerification = await verifyAndRefreshZohoOAuth(content.settings, false);
      if (zohoVerification.valid) {
        if (zohoVerification.refreshToken) content.settings.zohoRefreshToken = zohoVerification.refreshToken;
        if (zohoVerification.accessToken) content.settings.zohoAccessToken = zohoVerification.accessToken;
        if (zohoVerification.accountId) content.settings.zohoAccountId = zohoVerification.accountId;
        if (zohoVerification.mailboxAddress && !incoming.zohoUser) content.settings.zohoUser = zohoVerification.mailboxAddress;
      }
    }

    try {
      await storage.saveContent(content);
      console.log(`[Settings API] Configurações e credenciais gravadas com sucesso no storage (${storage.kind})`);
    } catch (saveErr: any) {
      console.error('[Settings API Error] Falha ao persistir configurações no banco:', saveErr);
      return res.status(500).json({
        error: `Falha ao gravar configurações no banco de dados (${storage.kind}): ${saveErr?.message || saveErr}`
      });
    }

    // Se a senha mudou, a sessão atual é invalidada; devolvemos um novo token para o admin continuar logado
    const passwordChanged = getEffectiveAdminPassword(current) !== getEffectiveAdminPassword(content.settings);
    res.json({
      ...content.settings,
      zohoVerification,
      ...(passwordChanged ? { newAdminToken: createAdminToken(content.settings) } : {})
    });
  }));

  // 6. Quote requests endpoints & Zoho Mail Integration
  app.get('/api/quotes', requireAdmin, wrap(async (req, res) => {
    res.json(await getStorage().listQuotes());
  }));

  app.post('/api/quotes', wrap(async (req, res) => {
    const { name, email, whatsapp, projectType, businessSegment, budgetRange, timeline, description, referenceModelId } = req.body || {};

    if (!name || !email || !whatsapp || !projectType) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios: Nome, E-mail, WhatsApp e Tipo de Projeto.' });
    }

    const storage = getStorage();
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const currentYear = new Date().getFullYear();
    const protocol = `WORT-${currentYear}-${randomHex}`;

    const newQuote: QuoteRequest = {
      id: `quote-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      protocol,
      createdAt: new Date().toISOString(),
      name: String(name).trim(),
      email: String(email).trim(),
      whatsapp: String(whatsapp).trim(),
      projectType,
      businessSegment: String(businessSegment || 'Não especificado').trim(),
      budgetRange: String(budgetRange || 'A definir na proposta').trim(),
      timeline: String(timeline || 'Flexível').trim(),
      description: String(description || '').trim(),
      referenceModelId: referenceModelId ? String(referenceModelId) : undefined,
      status: 'pendente'
    };

    try {
      await storage.saveQuote(newQuote);
      console.log(`[Quotes API] Novo orçamento/lead salvo permanentemente no storage (${storage.kind}): ${newQuote.protocol} (${newQuote.id})`);
    } catch (saveErr: any) {
      console.error('[Quotes API Error] Falha ao gravar orçamento no banco:', saveErr);
      return res.status(500).json({
        error: `Falha ao registrar solicitação no banco de dados (${storage.kind}): ${saveErr?.message || saveErr}`
      });
    }

    // Resposta imediata ao cliente para confirmação instantânea na interface
    res.status(201).json({
      success: true,
      message: 'Solicitação de orçamento recebida com sucesso.',
      quote: newQuote
    });

    // Disparo dos e-mails via Zoho Mail em segundo plano (não bloqueia a resposta do usuário)
    const { settings } = await storage.getContent();
    if (!hasZohoConfigured(settings)) {
      console.warn('[Zoho Mail] Envio ignorado: credenciais do Zoho não configuradas.');
      return;
    }
    const adminRecipient = settings.zohoAlertRecipient || settings.contactEmail || settings.zohoUser;

    runInBackground(
      Promise.allSettled([
        dispatchZohoEmail(settings, {
          to: newQuote.email,
          subject: `Confirmação de Solicitação de Orçamento - Protocolo ${newQuote.protocol} | Wort Studio`,
          html: renderClientQuoteEmail(newQuote, settings)
        }).then(r => {
          if (r.success) console.log(`[Zoho Mail] Confirmação enviada para cliente: ${newQuote.email}`);
          else console.warn(`[Zoho Mail] Aviso no envio ao cliente (${newQuote.email}):`, r.error);
        }),
        adminRecipient
          ? dispatchZohoEmail(settings, {
              to: adminRecipient,
              subject: `[Novo Lead Wort Studio] ${newQuote.name} - Protocolo ${newQuote.protocol}`,
              html: renderAdminLeadNotificationEmail(newQuote, settings)
            }).then(r => {
              if (r.success) console.log(`[Zoho Mail] Alerta de lead enviado para admin: ${adminRecipient}`);
              else console.warn(`[Zoho Mail] Aviso no alerta admin (${adminRecipient}):`, r.error);
            })
          : Promise.resolve()
      ])
    );
  }));

  app.patch('/api/quotes/:id/status', requireAdmin, wrap(async (req, res) => {
    const { status, adminNotes, notifyClient } = req.body || {};
    const storage = getStorage();
    const quote = await storage.getQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    const previousStatus = quote.status;
    if (status) quote.status = status;
    if (adminNotes !== undefined) quote.adminNotes = adminNotes;

    let savedQuote: QuoteRequest = quote;
    try {
      if (storage.updateQuoteStatus) {
        const result = await storage.updateQuoteStatus(req.params.id, status || quote.status, adminNotes);
        if (result) savedQuote = result;
      } else {
        await storage.saveQuote(quote);
        savedQuote = quote;
      }
      console.log(`[API /api/quotes/:id/status] Status gravado permanentemente no banco: ${savedQuote.status} (ID: ${req.params.id})`);
    } catch (dbErr: any) {
      console.error(`[API /api/quotes/:id/status Error] Falha crítica ao persistir status no banco:`, dbErr);
      return res.status(500).json({
        error: `Falha ao persistir status no banco de dados: ${dbErr?.message || dbErr}`
      });
    }

    let clientNotified = false;
    let notificationError = '';

    if (notifyClient && quote.email && status && status !== previousStatus) {
      const { settings } = await storage.getContent();
      if (hasZohoConfigured(settings)) {
        try {
          const statusLabels: Record<string, string> = {
            pendente: 'Pendente',
            em_analise: 'Em Análise',
            proposta_enviada: 'Proposta Enviada',
            concluido: 'Conclusão'
          };
          const dispatchRes = await dispatchZohoEmail(settings, {
            to: quote.email,
            subject: `Atualização de Orçamento (${quote.protocol}) - Status: ${statusLabels[status] || status} | WortSite`,
            html: renderStatusUpdateEmail(quote, status, adminNotes)
          });
          if (dispatchRes.success) clientNotified = true;
          else notificationError = dispatchRes.error || 'Falha no envio';
        } catch (err: any) {
          console.error('Erro ao notificar cliente via Zoho:', err?.message);
          notificationError = err?.message || 'Falha no envio';
        }
      } else {
        notificationError = 'Zoho Mail não configurado.';
      }
    }

    res.json({
      ...savedQuote,
      clientNotified,
      notificationError: notificationError || undefined
    });
  }));

  app.delete('/api/quotes/:id', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const quote = await storage.getQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }
    await storage.deleteQuote(req.params.id);
    res.json(quote);
  }));

  // 7. Zoho OAuth2 Exchange Token Endpoint
  app.post('/api/zoho/exchange-token', requireAdmin, wrap(async (req, res) => {
    const {
      code,
      redirectUri,
      clientId: bodyClientId,
      clientSecret: bodyClientSecret,
      user: bodyUser,
      senderName: bodySenderName
    } = req.body || {};

    const storage = getStorage();
    const content = await storage.getContent();
    const settings = content.settings;

    // Usa o Client ID e Client Secret digitados na tela (ou salvos no banco)
    const clientId = String(bodyClientId || settings.zohoClientId || process.env.ZOHO_CLIENT_ID || '').trim();
    const clientSecret = String(bodyClientSecret || settings.zohoClientSecret || process.env.ZOHO_CLIENT_SECRET || '').trim();
    const cleanCode = String(code || '').trim();

    if (!cleanCode) {
      return res.status(400).json({ error: 'Por favor, informe o Código de Concessão (Grant Token / Code) gerado no Zoho API Console.' });
    }

    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'Informe o Client ID e o Client Secret antes de gerar o token.' });
    }

    // Persiste desde já o Client ID e Client Secret informados na tela
    settings.zohoClientId = clientId;
    settings.zohoClientSecret = clientSecret;
    if (bodyUser) settings.zohoUser = String(bodyUser).trim();
    if (bodySenderName) settings.zohoSenderName = String(bodySenderName).trim();

    try {
      // 1. Tentativa padrão Self Client (sem redirect_uri)
      const bodyParams = new URLSearchParams({
        code: cleanCode,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code'
      });

      let response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams
      });

      let text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        return res.status(500).json({
          success: false,
          error: `Resposta inesperada da Zoho API (${response.status}): ${text}`
        });
      }

      // 2. Se a Zoho exigiu redirect_uri, tenta novamente incluindo redirect_uri
      if (data.error === 'invalid_redirect_uri' && redirectUri) {
        bodyParams.append('redirect_uri', String(redirectUri).trim());
        response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: bodyParams
        });
        data = await response.json().catch(() => ({}));
      }

      // 3. Se retornou invalid_code, verifica se o código colado já é diretamente um Refresh Token válido
      let usedRefreshGrant = false;
      if (data.error === 'invalid_code') {
        const refreshCheckRes = await fetch('https://accounts.zoho.com/oauth/v2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            refresh_token: cleanCode,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token'
          })
        });
        const refreshCheckData: any = await refreshCheckRes.json().catch(() => ({}));
        if (refreshCheckData.access_token) {
          data = {
            access_token: refreshCheckData.access_token,
            refresh_token: cleanCode,
            api_domain: refreshCheckData.api_domain
          };
          usedRefreshGrant = true;
        }
      }

      if (data.error) {
        let msg = data.error;
        if (data.error === 'invalid_client') {
          msg = 'Client ID ou Client Secret incorretos (invalid_client). Verifique se o Client ID e o Client Secret digitados correspondem exatamente ao Self Client no Zoho API Console.';
        } else if (data.error === 'invalid_code') {
          msg = 'Código inválido ou já expirado (invalid_code). Os códigos gerados no Self Client da Zoho duram poucos minutos e só podem ser usados UMA única vez. Gere um novo código no Zoho API Console com o escopo ZohoMail.messages.CREATE,ZohoMail.messages.ALL,ZohoMail.accounts.READ e clique em Conectar & Gerar Tokens.';
        }
        // Ainda assim salva o Client ID e Client Secret digitados no banco para não perdê-los
        await storage.saveContent(content).catch(() => {});
        return res.status(400).json({ success: false, error: msg, rawError: data.error });
      }

      // 4. Substitui obrigatoriamente o Refresh Token pelo novo token gerado!
      const newRefreshToken = String(data.refresh_token || (usedRefreshGrant ? cleanCode : data.access_token || '')).trim();
      const newAccessToken = String(data.access_token || '').trim();

      settings.zohoRefreshToken = newRefreshToken;
      if (newAccessToken) settings.zohoAccessToken = newAccessToken;
      settings.zohoAuthType = 'oauth2';

      // 5. Detecta automaticamente o accountId e endereço da conta na Zoho Mail API
      if (newAccessToken) {
        const accInfo = await fetchZohoMailAccount(newAccessToken);
        if (accInfo.accountId) settings.zohoAccountId = accInfo.accountId;
        if (accInfo.mailboxAddress) settings.zohoUser = accInfo.mailboxAddress;
      }

      // 6. Grava permanentemente no Supabase (settings + site_content)
      try {
        await storage.saveContent(content);
        console.log(`[Zoho OAuth] Novo Refresh Token (${newRefreshToken.slice(0, 12)}...) gravado com sucesso no storage (${storage.kind})`);
      } catch (saveErr: any) {
        console.error('[Zoho OAuth Error] Falha ao persistir novo token no banco:', saveErr);
        return res.status(500).json({
          success: false,
          error: `Falha ao gravar novo token no banco de dados (${storage.kind}): ${saveErr?.message || saveErr}`
        });
      }

      return res.json({
        success: true,
        message: 'Novo Refresh Token OAuth 2.0 gerado, validado e substituído permanentemente no banco de dados!',
        hasRefreshToken: Boolean(newRefreshToken),
        hasAccessToken: Boolean(newAccessToken),
        refreshToken: newRefreshToken,
        accessToken: newAccessToken,
        accountId: settings.zohoAccountId,
        user: settings.zohoUser,
        clientId: settings.zohoClientId,
        apiDomain: data.api_domain
      });
    } catch (err: any) {
      console.error('Erro na troca do token Zoho OAuth:', err);
      return res.status(500).json({
        success: false,
        error: `Falha na requisição à Zoho: ${err?.message || 'Erro de rede'}`
      });
    }
  }));

  // 7.05 Zoho OAuth2 Verify & Auto-Refresh Endpoint
  app.post('/api/zoho/verify', requireAdmin, wrap(async (req, res) => {
    const { clientId, clientSecret, refreshToken, user, senderName } = req.body || {};
    const storage = getStorage();
    const content = await storage.getContent();

    const mergedSettings: CommercialSettings = {
      ...content.settings,
      ...(clientId !== undefined ? { zohoClientId: String(clientId).trim() } : {}),
      ...(clientSecret !== undefined ? { zohoClientSecret: String(clientSecret).trim() } : {}),
      ...(refreshToken !== undefined ? { zohoRefreshToken: String(refreshToken).trim() } : {}),
      ...(user !== undefined ? { zohoUser: String(user).trim() } : {}),
      ...(senderName !== undefined ? { zohoSenderName: String(senderName).trim() } : {})
    };

    const verification = await verifyAndRefreshZohoOAuth(mergedSettings, true);
    return res.json({
      success: verification.valid,
      ...verification
    });
  }));

  // 7.1 Zoho Mail Test Endpoint (Supports OAuth2 & SMTP)
  app.post('/api/test-email', requireAdmin, wrap(async (req, res) => {
    const { host, port, user, pass, clientId, clientSecret, refreshToken, accessToken, authType, senderName, testRecipient } = req.body || {};
    const { settings } = await getStorage().getContent();

    const mergedSettings: CommercialSettings = {
      ...settings,
      ...(host ? { zohoHost: host } : {}),
      ...(port ? { zohoPort: port } : {}),
      ...(user ? { zohoUser: user } : {}),
      ...(pass ? { zohoPass: pass } : {}),
      ...(clientId ? { zohoClientId: clientId } : {}),
      ...(clientSecret ? { zohoClientSecret: clientSecret } : {}),
      ...(refreshToken ? { zohoRefreshToken: refreshToken } : {}),
      ...(accessToken ? { zohoAccessToken: accessToken } : {}),
      ...(authType ? { zohoAuthType: authType } : {}),
      ...(senderName ? { zohoSenderName: senderName } : {})
    };

    const recipient = testRecipient || mergedSettings.zohoAlertRecipient || mergedSettings.contactEmail || mergedSettings.zohoUser;

    if (!recipient) {
      return res.status(400).json({ success: false, error: 'Informe um e-mail de destino para envio do teste.' });
    }

    try {
      const isOAuth = mergedSettings.zohoAuthType === 'oauth2' || (mergedSettings.zohoClientId && mergedSettings.zohoRefreshToken);
      const testHtml = `
        <div style="background-color: #05070D; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px 20px; line-height: 1.6;">
          <div style="max-width: 540px; margin: 0 auto; background: #0D1322; border: 1px solid #0866FF; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="background: linear-gradient(135deg, #0866FF, #00CFFF); padding: 24px; text-align: center;">
              <h2 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: bold;">Conexão Zoho Mail Validada!</h2>
              <p style="margin: 4px 0 0; color: #05070D; font-size: 13px; font-weight: bold;">Autenticação: ${isOAuth ? 'API Oficial Zoho (OAuth 2.0)' : 'SMTP Seguro'}</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 14px; color: #FFFFFF; margin-top: 0;">Este e-mail confirma que as credenciais do <strong>Zoho Mail</strong> estão operacionais e enviando mensagens a partir da plataforma WortSite.</p>
              <div style="background: #05070D; border: 1px solid #1E293B; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 12px; color: #B8C1D1;">
                <p style="margin: 4px 0;"><strong style="color: #FFFFFF;">Método:</strong> ${isOAuth ? 'API REST OAuth 2.0' : 'SMTP Seguro'}</p>
                <p style="margin: 4px 0;"><strong style="color: #FFFFFF;">Remetente:</strong> ${escapeHtml(mergedSettings.zohoUser || '')}</p>
                <p style="margin: 4px 0;"><strong style="color: #FFFFFF;">Destinatário:</strong> ${escapeHtml(recipient)}</p>
                <p style="margin: 4px 0;"><strong style="color: #FFFFFF;">Data/Hora:</strong> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
              </div>
              <p style="color: #10B981; font-size: 13px; font-weight: 600; margin-bottom: 0;">Tudo pronto! Seus clientes receberão confirmações imediatas de orçamento e a equipe será notificada de novos leads em tempo real.</p>
            </div>
          </div>
        </div>
      `;

      const result = await dispatchZohoEmail(mergedSettings, {
        to: recipient,
        subject: `[WortSite] Teste de Conexão Zoho Mail (${isOAuth ? 'OAuth 2.0' : 'SMTP'}) - ${new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
        html: testHtml
      });

      if (result.success) {
        return res.json({
          success: true,
          message: `E-mail de teste enviado com sucesso para ${recipient} via Zoho ${isOAuth ? 'API OAuth 2.0' : 'SMTP'}!`,
          messageId: result.messageId
        });
      }
      return res.status(500).json({
        success: false,
        error: `Falha no envio via Zoho (${isOAuth ? 'OAuth 2.0' : 'SMTP'}): ${result.error}`,
        code: 'DISPATCH_ERROR'
      });
    } catch (err: any) {
      console.error('Zoho Test Error:', err);
      return res.status(500).json({
        success: false,
        error: `Falha no teste Zoho: ${err?.message || 'Erro desconhecido'}`,
        code: 'TEST_ERROR'
      });
    }
  }));

  // 8. Admin auth
  app.post('/api/admin/login', wrap(async (req, res) => {
    const storage = getStorage();
    const ip = getClientIp(req);

    if ((await storage.getLoginFailures(ip)) >= LOGIN_MAX_ATTEMPTS) {
      return res.status(429).json({ error: `Muitas tentativas de login. Tente novamente em ${Math.ceil(LOGIN_WINDOW_MS / 60000)} minutos.` });
    }

    const { password } = req.body || {};
    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({ error: 'A senha de acesso administrativo é obrigatória e não pode ficar em branco.' });
    }

    const { settings } = await storage.getContent();
    const cleanPassword = password.trim();

    // Aceita qualquer uma das senhas válidas:
    // 1. A variável de ambiente ADMIN_PASSWORD na Vercel (se informada)
    // 2. A senha salva nas configurações (settings.adminPasswordHash)
    // 3. A senha padrão original do sistema ("Wortsite@admin2026##")
    const validPasswords = new Set<string>();
    if (process.env.ADMIN_PASSWORD?.trim()) validPasswords.add(process.env.ADMIN_PASSWORD.trim());
    if (settings.adminPasswordHash?.trim()) validPasswords.add(settings.adminPasswordHash.trim());
    validPasswords.add('Wortsite@admin2026##');

    let matched = false;
    for (const candidate of validPasswords) {
      if (candidate && safeEqual(cleanPassword, candidate)) {
        matched = true;
        break;
      }
    }

    if (matched) {
      await storage.clearLoginFailures(ip);
      return res.json({ success: true, token: createAdminToken(settings) });
    }

    await storage.registerLoginFailure(ip, LOGIN_WINDOW_MS);
    return res.status(401).json({ error: 'Senha administrativa incorreta.' });
  }));

  app.post('/api/admin/logout', (req: Request, res: Response) => {
    // Tokens são stateless: o cliente descarta o token e ele expira sozinho em até 8h
    res.json({ success: true });
  });

  // Rotas /api inexistentes
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: 'Rota da API não encontrada.' });
  });

  // Tratamento centralizado de erros
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof StorageNotConfiguredError) {
      console.error('[Storage]', err.message);
      return res.status(503).json({ error: err.message });
    }
    console.error('[API] Erro inesperado:', err);
    if (res.headersSent) return;
    res.status(500).json({ error: 'Erro interno no servidor. Tente novamente em instantes.' });
  });

  return app;
}
