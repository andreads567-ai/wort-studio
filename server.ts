import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { INITIAL_MODELS, INITIAL_PLANS, INITIAL_SERVICES, INITIAL_SETTINGS } from './src/data/initialData.ts';
import { DemoModel, PlanItem, QuoteRequest, CommercialSettings, ServiceItem } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

interface DatabaseSchema {
  models: DemoModel[];
  plans: PlanItem[];
  services: ServiceItem[];
  settings: CommercialSettings;
  quotes: QuoteRequest[];
}

function ensureDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      models: INITIAL_MODELS,
      plans: INITIAL_PLANS,
      services: INITIAL_SERVICES,
      settings: INITIAL_SETTINGS,
      quotes: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading database file, fallback to initial state', err);
    return {
      models: INITIAL_MODELS,
      plans: INITIAL_PLANS,
      services: INITIAL_SERVICES,
      settings: INITIAL_SETTINGS,
      quotes: []
    };
  }
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());
  app.set('trust proxy', 1);

  // ---------------------------------------------------------------------------
  // Segurança: sessões administrativas e filtragem de dados sensíveis
  // ---------------------------------------------------------------------------
  const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas
  const adminSessions = new Map<string, number>(); // token -> expiração (timestamp)

  const LOGIN_MAX_ATTEMPTS = 5;
  const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
  const loginAttempts = new Map<string, { count: number; firstAt: number }>();

  function createAdminSession(): string {
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, Date.now() + SESSION_TTL_MS);
    return token;
  }

  function getBearerToken(req: Request): string {
    const header = req.headers.authorization || '';
    return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  }

  function isValidSession(token: string): boolean {
    if (!token) return false;
    const expiresAt = adminSessions.get(token);
    if (!expiresAt) return false;
    if (expiresAt < Date.now()) {
      adminSessions.delete(token);
      return false;
    }
    return true;
  }

  function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!isValidSession(getBearerToken(req))) {
      return res.status(401).json({ error: 'Sessão administrativa inválida ou expirada. Faça login novamente.' });
    }
    next();
  }

  function safeEqual(a: string, b: string): boolean {
    const ha = crypto.createHash('sha256').update(a).digest();
    const hb = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(ha, hb);
  }

  /** Remove senha do admin e todas as credenciais/configurações do Zoho antes de expor publicamente. */
  function toPublicSettings(settings: CommercialSettings): Partial<CommercialSettings> {
    const publicSettings: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(settings || {})) {
      if (key === 'adminPasswordHash' || key.startsWith('zoho')) continue;
      publicSettings[key] = value;
    }
    return publicSettings as Partial<CommercialSettings>;
  }

  // Limpeza periódica de sessões e tentativas expiradas
  setInterval(() => {
    const now = Date.now();
    for (const [token, expiresAt] of adminSessions) if (expiresAt < now) adminSessions.delete(token);
    for (const [ip, info] of loginAttempts) if (now - info.firstAt > LOGIN_WINDOW_MS) loginAttempts.delete(ip);
  }, 10 * 60 * 1000).unref();

  // 1. Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Wort Site Engine',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // 2. Public initial data
  app.get('/api/data', (req: Request, res: Response) => {
    const db = ensureDatabase();
    res.json({
      models: db.models,
      plans: db.plans,
      services: db.services,
      settings: toPublicSettings(db.settings)
    });
  });

  // 3. Models endpoints
  app.get('/api/models', (req: Request, res: Response) => {
    const db = ensureDatabase();
    res.json(db.models);
  });

  app.post('/api/models', requireAdmin, (req: Request, res: Response) => {
    const db = ensureDatabase();
    const newModel: DemoModel = {
      ...req.body,
      id: req.body.id || `modelo-${Date.now()}`
    };
    db.models.unshift(newModel);
    saveDatabase(db);
    res.status(201).json(newModel);
  });

  app.put('/api/models/:id', requireAdmin, (req: Request, res: Response) => {
    const db = ensureDatabase();
    const index = db.models.findIndex(m => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Modelo não encontrado' });
    }
    db.models[index] = { ...db.models[index], ...req.body };
    saveDatabase(db);
    res.json(db.models[index]);
  });

  app.delete('/api/models/:id', requireAdmin, (req: Request, res: Response) => {
    const db = ensureDatabase();
    const index = db.models.findIndex(m => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Modelo não encontrado' });
    }
    const removed = db.models.splice(index, 1);
    saveDatabase(db);
    res.json(removed[0]);
  });

  // 4. Plans endpoints
  app.get('/api/plans', (req: Request, res: Response) => {
    const db = ensureDatabase();
    res.json(db.plans);
  });

  app.put('/api/plans/:id', requireAdmin, (req: Request, res: Response) => {
    const db = ensureDatabase();
    const index = db.plans.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }
    db.plans[index] = { ...db.plans[index], ...req.body };
    saveDatabase(db);
    res.json(db.plans[index]);
  });

  // 5. Settings endpoints
  app.get('/api/settings', requireAdmin, (req: Request, res: Response) => {
    const db = ensureDatabase();
    res.json(db.settings);
  });

  app.put('/api/settings', requireAdmin, (req: Request, res: Response) => {
    const db = ensureDatabase();
    const incoming = { ...req.body };

    // Safeguard: Never allow adminPasswordHash to be empty or whitespace!
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
      incoming.adminPasswordHash = db.settings.adminPasswordHash || process.env.ADMIN_PASSWORD || '';
    }

    // Safeguard: Never wipe out existing OAuth tokens if client sent empty string
    if (!incoming.zohoRefreshToken && db.settings.zohoRefreshToken) {
      incoming.zohoRefreshToken = db.settings.zohoRefreshToken;
    }
    if (!incoming.zohoAccessToken && db.settings.zohoAccessToken) {
      incoming.zohoAccessToken = db.settings.zohoAccessToken;
    }
    if (!incoming.zohoClientId && db.settings.zohoClientId) {
      incoming.zohoClientId = db.settings.zohoClientId;
    }
    if (!incoming.zohoClientSecret && db.settings.zohoClientSecret) {
      incoming.zohoClientSecret = db.settings.zohoClientSecret;
    }
    db.settings = { ...db.settings, ...incoming };
    saveDatabase(db);
    res.json(db.settings);
  });

  // 6. Quote requests endpoints & Zoho Mail Integration
  function escapeHtml(text: string): string {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function refreshZohoAccessToken(settings: CommercialSettings): Promise<string> {
    const clientId = settings.zohoClientId || process.env.ZOHO_CLIENT_ID || '';
    const clientSecret = settings.zohoClientSecret || process.env.ZOHO_CLIENT_SECRET || '';
    const refreshToken = settings.zohoRefreshToken || process.env.ZOHO_REFRESH_TOKEN || '';

    if (!refreshToken) {
      throw new Error('Refresh token da Zoho não configurado.');
    }

    const res = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token'
      })
    });

    const data: any = await res.json();
    if (data.access_token) {
      const db = ensureDatabase();
      db.settings.zohoAccessToken = data.access_token;
      saveDatabase(db);
      return data.access_token;
    }
    throw new Error(`Falha ao renovar token Zoho: ${data.error || 'Erro desconhecido'}`);
  }

  async function sendViaSmtp(
    settings: CommercialSettings,
    options: { to: string; subject: string; html: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const host = settings.zohoHost || 'smtp.zoho.com';
      const port = Number(settings.zohoPort || 465);
      const user = process.env.ZOHO_USER || settings.zohoUser || '';
      const pass = process.env.ZOHO_PASS || settings.zohoPass || '';

      if (!user || !pass) {
        return { success: false, error: 'Credenciais SMTP incompletas.' };
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });

      const info = await transporter.sendMail({
        from: `"${settings.zohoSenderName || 'WortSite Studio'}" <${user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      });

      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Falha no envio SMTP' };
    }
  }

  async function dispatchZohoEmail(
    settings: CommercialSettings,
    options: { to: string; subject: string; html: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const isOAuth = settings.zohoAuthType === 'oauth2' || (settings.zohoClientId && settings.zohoRefreshToken);

    if (isOAuth) {
      let token = settings.zohoAccessToken;
      const accountId = settings.zohoAccountId || process.env.ZOHO_ACCOUNT_ID || '';
      const fromAddress = settings.zohoUser || process.env.ZOHO_USER || '';

      const trySendWithToken = async (authToken: string) => {
        return fetch(`https://mail.zoho.com/api/accounts/${accountId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Zoho-oauthtoken ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fromAddress,
            toAddress: options.to,
            subject: options.subject,
            content: options.html,
            mailFormat: 'html'
          })
        });
      };

      try {
        let res = await trySendWithToken(token || '');

        // If unauthorized or token expired, refresh and retry once
        if (res.status === 401 || !token) {
          token = await refreshZohoAccessToken(settings);
          res = await trySendWithToken(token);
        }

        const text = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Resposta inválida da Zoho API (${res.status}): ${text}`);
        }

        if (res.ok && (data.status?.code === 200 || data.data?.messageId)) {
          return {
            success: true,
            messageId: data.data?.messageId || data.data?.mailId || 'zoho-api-msg'
          };
        } else {
          throw new Error(data.status?.description || data.error || text);
        }
      } catch (err: any) {
        console.error('Erro no despacho via Zoho REST API:', err);
        // Fallback to SMTP if user has pass configured
        if (settings.zohoPass) {
          return sendViaSmtp(settings, options);
        }
        return { success: false, error: err?.message || 'Falha no envio via Zoho Mail API' };
      }
    }

    return sendViaSmtp(settings, options);
  }

  function renderClientQuoteEmail(quote: QuoteRequest, settings: CommercialSettings): string {
    return `
      <div style="background-color: #05070D; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 16px; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0D1322; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #06152B 0%, #0866FF 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">WortSite Studio</h1>
            <p style="margin: 6px 0 0; color: #00CFFF; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Confirmação de Solicitação de Orçamento</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #FFFFFF; margin-top: 0;">Olá, <strong>${escapeHtml(quote.name)}</strong>!</p>
            <p style="font-size: 14px; color: #B8C1D1; line-height: 1.6;">Recebemos com sucesso sua solicitação de orçamento. Nossa equipe de especialistas já está avaliando o escopo para estruturar uma proposta personalizada com os mais altos padrões de design e engenharia web.</p>
            
            <!-- Protocol Card -->
            <div style="background-color: #05070D; border: 1px solid #171D2B; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <div style="margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #1E293B;">
                <span style="font-size: 11px; text-transform: uppercase; color: #B8C1D1; letter-spacing: 0.5px; display: block;">Protocolo de Atendimento</span>
                <span style="font-size: 20px; font-weight: bold; color: #00CFFF; font-family: 'Courier New', Courier, monospace;">${quote.protocol}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #FFFFFF; font-size: 13px;">Tipo de Projeto:</strong>
                <span style="color: #B8C1D1; font-size: 13px;"> ${escapeHtml(quote.projectType.replace(/_/g, ' '))}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #FFFFFF; font-size: 13px;">Segmento / Ramo:</strong>
                <span style="color: #B8C1D1; font-size: 13px;"> ${escapeHtml(quote.businessSegment)}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #FFFFFF; font-size: 13px;">Expectativa de Prazo:</strong>
                <span style="color: #B8C1D1; font-size: 13px;"> ${escapeHtml(quote.timeline)}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <strong style="color: #FFFFFF; font-size: 13px;">Faixa Estimada de Investimento:</strong>
                <span style="color: #B8C1D1; font-size: 13px;"> ${escapeHtml(quote.budgetRange)}</span>
              </div>
              ${quote.description ? `
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #1E293B;">
                <strong style="color: #FFFFFF; font-size: 13px; display: block; margin-bottom: 4px;">Informações Adicionais:</strong>
                <p style="color: #B8C1D1; font-size: 13px; margin: 0; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(quote.description)}</p>
              </div>` : ''}
            </div>

            <!-- Next steps -->
            <div style="background: rgba(8, 102, 255, 0.08); border-left: 3px solid #0866FF; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 13px; color: #FFFFFF; font-weight: 600;">Próximas Etapas</p>
              <p style="margin: 6px 0 0; font-size: 13px; color: #B8C1D1; line-height: 1.5;">
                Nossa equipe entrará em contato em breve via WhatsApp <strong>${escapeHtml(quote.whatsapp)}</strong> ou por este e-mail para validar detalhes técnicos e apresentar sua proposta comercial.
              </p>
            </div>

            <p style="font-size: 13px; color: #B8C1D1; margin-bottom: 0;">Fique à vontade para responder a esta mensagem caso deseje anexar referências ou solicitar ajustes.</p>
          </div>

          <!-- Footer -->
          <div style="background-color: #06152B; padding: 20px 24px; text-align: center; border-top: 1px solid #1E293B;">
            <p style="margin: 0; font-size: 12px; color: #FFFFFF; font-weight: 600;">WortSite Studio • Tecnologia e Soluções Digitais</p>
            <p style="margin: 4px 0 0; font-size: 11px; color: #B8C1D1;">Atendimento: ${escapeHtml(settings.businessHours || 'Segunda a Sexta, das 09h às 18h')} | ${escapeHtml(settings.contactEmail || 'contato@wortsite.com.br')}</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderAdminLeadNotificationEmail(quote: QuoteRequest, settings: CommercialSettings): string {
    const cleanPhone = quote.whatsapp.replace(/\D/g, '');
    const waText = encodeURIComponent(`Olá, ${quote.name}! Sou da equipe WortSite. Recebemos sua solicitação de orçamento (Protocolo: ${quote.protocol}) e gostaríamos de apresentar os detalhes para o seu projeto!`);
    const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

    return `
      <div style="background-color: #05070D; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 16px; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0D1322; border: 1px solid #0866FF; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="background: #0866FF; padding: 24px; text-align: center;">
            <span style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; color: #FFFFFF; margin-bottom: 8px;">NOVO LEAD RECEBIDO</span>
            <h2 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: bold;">Solicitação de Orçamento</h2>
            <p style="margin: 4px 0 0; color: #00CFFF; font-size: 14px; font-family: monospace; font-weight: bold;">Protocolo: ${quote.protocol}</p>
          </div>

          <!-- Body -->
          <div style="padding: 28px 24px;">
            <div style="margin-bottom: 20px;">
              <h3 style="color: #00CFFF; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px;">Identificação do Cliente</h3>
              <div style="background-color: #05070D; border: 1px solid #1E293B; border-radius: 10px; padding: 16px;">
                <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Nome:</strong> <span style="color: #FFFFFF;">${escapeHtml(quote.name)}</span></p>
                <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">E-mail:</strong> <a href="mailto:${escapeHtml(quote.email)}" style="color: #00CFFF; text-decoration: none;">${escapeHtml(quote.email)}</a></p>
                <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">WhatsApp:</strong> <span style="color: #10B981; font-weight: bold;">${escapeHtml(quote.whatsapp)}</span></p>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #00CFFF; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px;">Especificações do Projeto</h3>
              <div style="background-color: #05070D; border: 1px solid #1E293B; border-radius: 10px; padding: 16px;">
                <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Tipo de Projeto:</strong> <span style="color: #B8C1D1; text-transform: capitalize;">${escapeHtml(quote.projectType.replace(/_/g, ' '))}</span></p>
                <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Segmento de Atuação:</strong> <span style="color: #B8C1D1;">${escapeHtml(quote.businessSegment)}</span></p>
                <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Investimento Previsto:</strong> <span style="color: #B8C1D1;">${escapeHtml(quote.budgetRange)}</span></p>
                <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Prazo Estimado:</strong> <span style="color: #B8C1D1;">${escapeHtml(quote.timeline)}</span></p>
                <p style="margin: 4px 0; font-size: 13px;"><strong style="color: #FFFFFF;">Data de Recebimento:</strong> <span style="color: #B8C1D1;">${new Date(quote.createdAt).toLocaleString('pt-BR')}</span></p>
              </div>
            </div>

            ${quote.description ? `
            <div style="margin-bottom: 24px;">
              <h3 style="color: #00CFFF; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px;">Descrição do Cliente</h3>
              <div style="background: #05070D; border: 1px solid #1E293B; border-radius: 10px; padding: 14px;">
                <p style="color: #B8C1D1; font-size: 13px; margin: 0; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(quote.description)}</p>
              </div>
            </div>` : ''}

            <!-- Direct WhatsApp CTA -->
            <div style="text-align: center; margin-top: 24px;">
              <a href="${waUrl}" target="_blank" style="display: inline-block; background-color: #10B981; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 14px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                Iniciar Atendimento no WhatsApp
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #06152B; padding: 16px 24px; text-align: center; border-top: 1px solid #1E293B;">
            <p style="margin: 0; font-size: 11px; color: #B8C1D1;">Notificação automática gerada pelo sistema WortSite</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderStatusUpdateEmail(quote: QuoteRequest, newStatus: string, adminNotes?: string): string {
    const statusMap: Record<string, { label: string; color: string; desc: string }> = {
      pendente: {
        label: 'Pendente',
        color: '#F59E0B',
        desc: 'Sua solicitação de orçamento está em nossa fila de atendimento e será distribuída para um consultor técnico.'
      },
      em_analise: {
        label: 'Em Análise',
        color: '#00CFFF',
        desc: 'Nossa equipe de especialistas está avaliando o escopo técnico, viabilidade de arquitetura e prazos do seu projeto.'
      },
      proposta_enviada: {
        label: 'Proposta Enviada',
        color: '#0866FF',
        desc: 'Sua proposta comercial completa foi gerada! Entramos em contato via WhatsApp e e-mail com os detalhes da contratação.'
      },
      concluido: {
        label: 'Conclusão',
        color: '#10B981',
        desc: 'Parabéns! O processo de orçamento e alinhamento foi concluído com sucesso. Seja bem-vindo à WortSite!'
      }
    };

    const current = statusMap[newStatus] || { label: newStatus, color: '#0866FF', desc: 'O status do seu orçamento foi atualizado.' };

    return `
      <div style="background-color: #05070D; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 16px; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0D1322; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="background: #06152B; border-bottom: 1px solid #1E293B; padding: 28px 24px; text-align: center;">
            <h2 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: bold;">Atualização do seu Orçamento</h2>
            <p style="margin: 4px 0 0; color: #00CFFF; font-size: 14px; font-family: monospace;">Protocolo: ${quote.protocol}</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #FFFFFF; margin-top: 0;">Olá, <strong>${escapeHtml(quote.name)}</strong>!</p>
            <p style="font-size: 14px; color: #B8C1D1;">O andamento da sua solicitação de orçamento registrou uma nova atualização:</p>

            <!-- Status Card -->
            <div style="background-color: #05070D; border: 1px solid #171D2B; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 11px; text-transform: uppercase; color: #B8C1D1; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Novo Status</span>
              <span style="display: inline-block; padding: 6px 18px; border-radius: 20px; font-size: 14px; font-weight: bold; background: ${current.color}22; color: ${current.color}; border: 1px solid ${current.color}55;">
                ${current.label}
              </span>
              <p style="font-size: 13px; color: #B8C1D1; margin: 14px 0 0; line-height: 1.5;">${current.desc}</p>
            </div>

            ${adminNotes ? `
            <div style="background: rgba(8, 102, 255, 0.08); border-left: 3px solid #0866FF; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
              <strong style="color: #FFFFFF; font-size: 13px; display: block; margin-bottom: 4px;">Mensagem da nossa equipe:</strong>
              <p style="color: #B8C1D1; font-size: 13px; margin: 0; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(adminNotes)}</p>
            </div>` : ''}

            <p style="font-size: 13px; color: #B8C1D1; margin-bottom: 0;">Estamos permanentemente à disposição no WhatsApp ou respondendo a este e-mail.</p>
          </div>

          <!-- Footer -->
          <div style="background-color: #06152B; padding: 20px 24px; text-align: center; border-top: 1px solid #1E293B;">
            <p style="margin: 0; font-size: 12px; color: #FFFFFF; font-weight: 600;">WortSite Studio • Desenvolvimento Web</p>
            <p style="margin: 4px 0 0; font-size: 11px; color: #B8C1D1;">www.wortsite.com.br</p>
          </div>
        </div>
      </div>
    `;
  }

  app.get('/api/quotes', requireAdmin, (req: Request, res: Response) => {
    const db = ensureDatabase();
    res.json(db.quotes);
  });

  app.post('/api/quotes', async (req: Request, res: Response) => {
    const { name, email, whatsapp, projectType, businessSegment, budgetRange, timeline, description, referenceModelId } = req.body;

    if (!name || !email || !whatsapp || !projectType) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios: Nome, E-mail, WhatsApp e Tipo de Projeto.' });
    }

    const db = ensureDatabase();
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const currentYear = new Date().getFullYear();
    const protocol = `WORT-${currentYear}-${randomHex}`;

    const newQuote: QuoteRequest = {
      id: `quote-${Date.now()}`,
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

    db.quotes.unshift(newQuote);
    saveDatabase(db);

    // Enviar resposta imediata ao cliente para confirmação instantânea na interface
    res.status(201).json({
      success: true,
      message: 'Solicitação de orçamento recebida com sucesso.',
      quote: newQuote
    });

    // Disparo dos e-mails via Zoho Mail em segundo plano (não bloqueia a resposta do usuário)
    const hasZoho = db.settings.zohoRefreshToken || process.env.ZOHO_REFRESH_TOKEN || (db.settings.zohoUser && db.settings.zohoPass);
    if (hasZoho) {
      const adminRecipient = db.settings.zohoAlertRecipient || db.settings.contactEmail || db.settings.zohoUser;
      
      Promise.allSettled([
        dispatchZohoEmail(db.settings, {
          to: newQuote.email,
          subject: `Confirmação de Solicitação de Orçamento - Protocolo ${newQuote.protocol} | Wort Studio`,
          html: renderClientQuoteEmail(newQuote, db.settings)
        }).then(res => {
          if (res.success) {
            console.log(`[Zoho Mail] Confirmação enviada com sucesso para cliente: ${newQuote.email}`);
          } else {
            console.warn(`[Zoho Mail] Aviso no envio ao cliente (${newQuote.email}):`, res.error);
          }
        }),
        adminRecipient
          ? dispatchZohoEmail(db.settings, {
              to: adminRecipient,
              subject: `[Novo Lead Wort Studio] ${newQuote.name} - Protocolo ${newQuote.protocol}`,
              html: renderAdminLeadNotificationEmail(newQuote, db.settings)
            }).then(res => {
              if (res.success) {
                console.log(`[Zoho Mail] Alerta de lead enviado com sucesso para admin: ${adminRecipient}`);
              } else {
                console.warn(`[Zoho Mail] Aviso no alerta admin (${adminRecipient}):`, res.error);
              }
            })
          : Promise.resolve()
      ]).catch(err => {
        console.error('[Zoho Mail] Falha no disparo assíncrono de notificações:', err?.message || err);
      });
    }
  });

  app.patch('/api/quotes/:id/status', requireAdmin, async (req: Request, res: Response) => {
    const { status, adminNotes, notifyClient } = req.body;
    const db = ensureDatabase();
    const quote = db.quotes.find(q => q.id === req.params.id);
    if (!quote) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    const previousStatus = quote.status;
    if (status) quote.status = status;
    if (adminNotes !== undefined) quote.adminNotes = adminNotes;

    saveDatabase(db);

    let clientNotified = false;
    let notificationError = '';

    if (notifyClient && quote.email && status && status !== previousStatus) {
      const hasZoho = db.settings.zohoRefreshToken || process.env.ZOHO_REFRESH_TOKEN || (db.settings.zohoUser && db.settings.zohoPass);
      if (hasZoho) {
        try {
          const statusLabels: Record<string, string> = {
            pendente: 'Pendente',
            em_analise: 'Em Análise',
            proposta_enviada: 'Proposta Enviada',
            concluido: 'Conclusão'
          };
          const dispatchRes = await dispatchZohoEmail(db.settings, {
            to: quote.email,
            subject: `Atualização de Orçamento (${quote.protocol}) - Status: ${statusLabels[status] || status} | WortSite`,
            html: renderStatusUpdateEmail(quote, status, adminNotes)
          });
          if (dispatchRes.success) {
            clientNotified = true;
          } else {
            notificationError = dispatchRes.error || 'Falha no envio';
          }
        } catch (err: any) {
          console.error('Erro ao notificar cliente via Zoho:', err?.message);
          notificationError = err?.message || 'Falha no envio';
        }
      }
    }

    res.json({
      ...quote,
      clientNotified,
      notificationError: notificationError || undefined
    });
  });

  app.delete('/api/quotes/:id', requireAdmin, (req: Request, res: Response) => {
    const db = ensureDatabase();
    const index = db.quotes.findIndex(q => q.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }
    const removed = db.quotes.splice(index, 1);
    saveDatabase(db);
    res.json(removed[0]);
  });

  // 7. Zoho OAuth2 Exchange Token Endpoint
  app.post('/api/zoho/exchange-token', requireAdmin, async (req: Request, res: Response) => {
    const { code, redirectUri } = req.body;
    const db = ensureDatabase();

    const clientId = db.settings.zohoClientId || process.env.ZOHO_CLIENT_ID || '';
    const clientSecret = db.settings.zohoClientSecret || process.env.ZOHO_CLIENT_SECRET || '';

    if (!code) {
      return res.status(400).json({ error: 'Por favor, informe o Código de Concessão (Grant Token / Code) gerado no Zoho API Console.' });
    }

    try {
      const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
      const bodyParams = new URLSearchParams({
        code: String(code).trim(),
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code'
      });

      // Include redirect_uri only if provided and not the default Self Client placeholder
      if (redirectUri && redirectUri !== 'https://wortsite.com.br' && redirectUri !== '') {
        bodyParams.append('redirect_uri', redirectUri);
      }

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        return res.status(500).json({
          success: false,
          error: `Resposta inesperada da Zoho API (${response.status}): ${text}`
        });
      }

      if (data.error) {
        let msg = data.error;
        if (data.error === 'invalid_code') {
          msg = 'Código inválido ou já expirado. Como os Grant Tokens da Zoho duram poucos minutos e só podem ser usados UMA única vez, gere um novo código no Self Client do Zoho Console e clique em Conectar.';
        }
        return res.status(400).json({
          success: false,
          error: msg,
          rawError: data.error
        });
      }

      if (data.refresh_token) {
        db.settings.zohoRefreshToken = data.refresh_token;
      }
      if (data.access_token) {
        db.settings.zohoAccessToken = data.access_token;
      }
      db.settings.zohoAuthType = 'oauth2';

      // Auto-detect accountId if possible
      try {
        if (data.access_token) {
          const accRes = await fetch('https://mail.zoho.com/api/accounts', {
            headers: { 'Authorization': `Zoho-oauthtoken ${data.access_token}` }
          });
          const accJson: any = await accRes.json();
          if (accJson.data && accJson.data[0]) {
            db.settings.zohoAccountId = accJson.data[0].accountId;
            if (accJson.data[0].mailboxAddress) {
              db.settings.zohoUser = accJson.data[0].mailboxAddress;
            }
          }
        }
      } catch (e) {
        console.warn('Could not auto-fetch Zoho accountId on token exchange', e);
      }

      saveDatabase(db);

      return res.json({
        success: true,
        message: 'Tokens OAuth2 gerados e vinculados com sucesso à plataforma WortSite!',
        hasRefreshToken: !!data.refresh_token,
        hasAccessToken: !!data.access_token,
        refreshToken: data.refresh_token,
        accessToken: data.access_token,
        apiDomain: data.api_domain
      });
    } catch (err: any) {
      console.error('Erro na troca do token Zoho OAuth:', err);
      return res.status(500).json({
        success: false,
        error: `Falha na requisição à Zoho: ${err?.message || 'Erro de rede'}`
      });
    }
  });

  // 7.1 Zoho Mail Test Endpoint (Supports OAuth2 & SMTP)
  app.post('/api/test-email', requireAdmin, async (req: Request, res: Response) => {
    const { host, port, user, pass, clientId, clientSecret, refreshToken, accessToken, authType, senderName, testRecipient } = req.body;
    const db = ensureDatabase();

    const mergedSettings: CommercialSettings = {
      ...db.settings,
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
      return res.status(400).json({
        success: false,
        error: 'Informe um e-mail de destino para envio do teste.'
      });
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
                <p style="margin: 4px 0;"><strong style="color: #FFFFFF;">Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              </div>
              <p style="color: #10B981; font-size: 13px; font-weight: 600; margin-bottom: 0;">Tudo pronto! Seus clientes receberão confirmações imediatas de orçamento e a equipe será notificada de novos leads em tempo real.</p>
            </div>
          </div>
        </div>
      `;

      const result = await dispatchZohoEmail(mergedSettings, {
        to: recipient,
        subject: `[WortSite] Teste de Conexão Zoho Mail (${isOAuth ? 'OAuth 2.0' : 'SMTP'}) - ${new Date().toLocaleTimeString('pt-BR')}`,
        html: testHtml
      });

      if (result.success) {
        return res.json({
          success: true,
          message: `E-mail de teste enviado com sucesso para ${recipient} via Zoho ${isOAuth ? 'API OAuth 2.0' : 'SMTP'}!`,
          messageId: result.messageId
        });
      } else {
        return res.status(500).json({
          success: false,
          error: `Falha no envio via Zoho (${isOAuth ? 'OAuth 2.0' : 'SMTP'}): ${result.error}`,
          code: 'DISPATCH_ERROR'
        });
      }
    } catch (err: any) {
      console.error('Zoho Test Error:', err);
      return res.status(500).json({
        success: false,
        error: `Falha no teste Zoho: ${err?.message || 'Erro desconhecido'}`,
        code: 'TEST_ERROR'
      });
    }
  });

  // 8. Admin auth
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const attempt = loginAttempts.get(ip);
    if (attempt && now - attempt.firstAt < LOGIN_WINDOW_MS && attempt.count >= LOGIN_MAX_ATTEMPTS) {
      const minutes = Math.ceil((LOGIN_WINDOW_MS - (now - attempt.firstAt)) / 60000);
      return res.status(429).json({ error: `Muitas tentativas de login. Tente novamente em ${minutes} minuto(s).` });
    }

    const { password } = req.body;
    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({ error: 'A senha de acesso administrativo é obrigatória e não pode ficar em branco.' });
    }
    const cleanPassword = password.trim();
    const db = ensureDatabase();
    const effectiveAdminPassword = (db.settings.adminPasswordHash && db.settings.adminPasswordHash.trim())
      ? db.settings.adminPasswordHash.trim()
      : (process.env.ADMIN_PASSWORD || '').trim();

    if (effectiveAdminPassword && safeEqual(cleanPassword, effectiveAdminPassword)) {
      loginAttempts.delete(ip);
      return res.json({ success: true, token: createAdminSession() });
    }

    if (!attempt || now - attempt.firstAt >= LOGIN_WINDOW_MS) {
      loginAttempts.set(ip, { count: 1, firstAt: now });
    } else {
      attempt.count += 1;
    }
    return res.status(401).json({ error: 'Senha administrativa incorreta.' });
  });

  app.post('/api/admin/logout', (req: Request, res: Response) => {
    adminSessions.delete(getBearerToken(req));
    res.json({ success: true });
  });

  // Vite Integration
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Wort Site Engine] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
