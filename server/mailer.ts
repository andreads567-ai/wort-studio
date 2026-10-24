/** Envio de e-mails e gerenciamento de tokens via Zoho Mail (API REST OAuth 2.0 com fallback para SMTP). */
import nodemailer from 'nodemailer';
import type { CommercialSettings } from '../src/types/index.js';
import { getStorage } from './storage.js';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface MailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ZohoVerificationResult {
  valid: boolean;
  clientCredentialsValid: boolean;
  tokenValid: boolean;
  accessToken?: string;
  refreshToken?: string;
  accountId?: string;
  mailboxAddress?: string;
  message?: string;
  error?: string;
}

export function hasZohoConfigured(settings: CommercialSettings): boolean {
  return Boolean(
    settings.zohoRefreshToken ||
      process.env.ZOHO_REFRESH_TOKEN ||
      ((settings.zohoUser || process.env.ZOHO_USER) && (settings.zohoPass || process.env.ZOHO_PASS))
  );
}

/**
 * Consulta a API Zoho Mail para obter o accountId e endereço de e-mail oficial da conta autenticada.
 */
export async function fetchZohoMailAccount(accessToken: string): Promise<{ accountId?: string; mailboxAddress?: string }> {
  try {
    const accRes = await fetch('https://mail.zoho.com/api/accounts', {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    });
    if (!accRes.ok) return {};
    const accJson: any = await accRes.json();
    if (accJson?.data && Array.isArray(accJson.data) && accJson.data[0]) {
      return {
        accountId: accJson.data[0].accountId ? String(accJson.data[0].accountId) : undefined,
        mailboxAddress: accJson.data[0].mailboxAddress ? String(accJson.data[0].mailboxAddress) : undefined
      };
    }
  } catch (err) {
    console.warn('[Zoho] Aviso ao consultar /api/accounts:', err);
  }
  return {};
}

/**
 * Verifica a validade de Client ID, Client Secret e Refresh Token na Zoho API
 * e renova automaticamente o Access Token (e substitui caso o campo contenha um Grant Code válido).
 */
export async function verifyAndRefreshZohoOAuth(
  settings: CommercialSettings,
  persistToStorage = true
): Promise<ZohoVerificationResult> {
  const clientId = (settings.zohoClientId || process.env.ZOHO_CLIENT_ID || '').trim();
  const clientSecret = (settings.zohoClientSecret || process.env.ZOHO_CLIENT_SECRET || '').trim();
  let refreshToken = (settings.zohoRefreshToken || process.env.ZOHO_REFRESH_TOKEN || '').trim();

  if (!clientId || !clientSecret) {
    return {
      valid: false,
      clientCredentialsValid: false,
      tokenValid: false,
      error: 'Client ID e Client Secret são obrigatórios para autenticação OAuth 2.0.'
    };
  }

  if (!refreshToken) {
    // Valida ao menos se Client ID e Client Secret são reconhecidos pela Zoho
    try {
      const probeRes = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: '1000.probe_validation_check',
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token'
        })
      });
      const probeData: any = await probeRes.json().catch(() => ({}));
      const credsOk = probeData.error !== 'invalid_client';
      return {
        valid: false,
        clientCredentialsValid: credsOk,
        tokenValid: false,
        error: credsOk
          ? 'Client ID e Client Secret são válidos! Falta apenas colar o Grant Token e clicar em "Conectar & Gerar Tokens".'
          : 'Client ID ou Client Secret inválidos na Zoho API (invalid_client).'
      };
    } catch {
      return {
        valid: false,
        clientCredentialsValid: false,
        tokenValid: false,
        error: 'Refresh Token ainda não configurado.'
      };
    }
  }

  try {
    // 1. Tenta renovar o Access Token usando o Refresh Token atual
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

    let data: any = await res.json().catch(() => ({}));

    // 2. Se retornou invalid_code, verifica se o usuário colou um Grant Code diretamente no campo de Refresh Token
    if (data.error === 'invalid_code') {
      const codeExchangeRes = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code'
        })
      });
      const codeData: any = await codeExchangeRes.json().catch(() => ({}));
      if (codeData.access_token) {
        data = codeData;
        if (codeData.refresh_token) {
          refreshToken = codeData.refresh_token;
        }
      }
    }

    if (data.error === 'invalid_client') {
      return {
        valid: false,
        clientCredentialsValid: false,
        tokenValid: false,
        error: 'Client ID ou Client Secret inválidos (invalid_client). Confira os dados no Zoho API Console.'
      };
    }

    if (data.error || !data.access_token) {
      return {
        valid: false,
        clientCredentialsValid: true,
        tokenValid: false,
        error:
          data.error === 'invalid_code'
            ? 'Client ID e Client Secret estão corretos, mas o Refresh Token atual expirou ou pertence a outro Client ID. Gere um novo código no Zoho API Console (Self Client), cole no campo de Grant Token e clique em "Conectar & Gerar Tokens".'
            : `Falha ao validar token na Zoho API: ${data.error || 'Erro desconhecido'}`
      };
    }

    const accessToken = String(data.access_token);
    let accountId = settings.zohoAccountId || '';
    const userConfiguredEmail = (settings.zohoUser || '').trim();
    let mailboxAddress = userConfiguredEmail;

    const accountInfo = await fetchZohoMailAccount(accessToken);
    if (accountInfo.accountId) accountId = accountInfo.accountId;
    if (!mailboxAddress && accountInfo.mailboxAddress) {
      mailboxAddress = accountInfo.mailboxAddress;
    }

    if (persistToStorage) {
      try {
        const storage = getStorage();
        const content = await storage.getContent();
        content.settings = {
          ...content.settings,
          zohoClientId: clientId,
          zohoClientSecret: clientSecret,
          zohoRefreshToken: refreshToken,
          zohoAccessToken: accessToken,
          ...(accountId ? { zohoAccountId: accountId } : {}),
          ...(userConfiguredEmail ? { zohoUser: userConfiguredEmail } : (!content.settings.zohoUser && mailboxAddress ? { zohoUser: mailboxAddress } : {}))
        };
        await storage.saveContent(content);
      } catch (err) {
        console.warn('[Zoho] Aviso ao persistir token renovado no banco:', err);
      }
    }

    return {
      valid: true,
      clientCredentialsValid: true,
      tokenValid: true,
      accessToken,
      refreshToken,
      accountId,
      mailboxAddress: userConfiguredEmail || mailboxAddress,
      message: 'Client ID, Client Secret e Refresh Token verificados com sucesso! Access Token renovado automaticamente.'
    };
  } catch (err: any) {
    return {
      valid: false,
      clientCredentialsValid: false,
      tokenValid: false,
      error: `Erro de comunicação com a API Zoho: ${err?.message || 'Falha de rede'}`
    };
  }
}

export async function refreshZohoAccessToken(settings: CommercialSettings): Promise<{
  accessToken: string;
  accountId?: string;
  mailboxAddress?: string;
}> {
  const result = await verifyAndRefreshZohoOAuth(settings, true);
  if (result.valid && result.accessToken) {
    return {
      accessToken: result.accessToken,
      accountId: result.accountId,
      mailboxAddress: result.mailboxAddress
    };
  }
  throw new Error(result.error || 'Falha ao renovar Access Token da Zoho.');
}

async function sendViaSmtp(settings: CommercialSettings, options: MailOptions): Promise<MailResult> {
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

export async function dispatchZohoEmail(settings: CommercialSettings, options: MailOptions): Promise<MailResult> {
  const isOAuth =
    settings.zohoAuthType === 'oauth2' ||
    Boolean((settings.zohoClientId || process.env.ZOHO_CLIENT_ID) && (settings.zohoRefreshToken || process.env.ZOHO_REFRESH_TOKEN));

  if (isOAuth && (settings.zohoRefreshToken || process.env.ZOHO_REFRESH_TOKEN || settings.zohoAccessToken)) {
    let token = settings.zohoAccessToken || '';
    let accountId = settings.zohoAccountId || process.env.ZOHO_ACCOUNT_ID || '';
    let fromAddress = settings.zohoUser || process.env.ZOHO_USER || '';

    const trySendWithToken = async (authToken: string, accId: string, senderEmail: string) => {
      return fetch(`https://mail.zoho.com/api/accounts/${accId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromAddress: senderEmail,
          toAddress: options.to,
          subject: options.subject,
          content: options.html,
          mailFormat: 'html'
        })
      });
    };

    try {
      // Se não há token ou accountId, renova automaticamente antes da primeira tentativa
      if (!token || !accountId) {
        const refreshed = await refreshZohoAccessToken(settings);
        token = refreshed.accessToken;
        if (refreshed.accountId) accountId = refreshed.accountId;
        if (!fromAddress && refreshed.mailboxAddress) fromAddress = refreshed.mailboxAddress;
      }

      let res = await trySendWithToken(token, accountId, fromAddress);

      // Se o token expirou (401) ou a conta mudou (400/404), renova automaticamente via Refresh Token e tenta novamente
      if (!res.ok) {
        const refreshed = await refreshZohoAccessToken(settings);
        token = refreshed.accessToken;
        if (refreshed.accountId) accountId = refreshed.accountId;
        res = await trySendWithToken(token, accountId, fromAddress || refreshed.mailboxAddress || '');
        if (!res.ok && refreshed.mailboxAddress && refreshed.mailboxAddress !== fromAddress) {
          res = await trySendWithToken(token, accountId, refreshed.mailboxAddress);
        }
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
      }
      throw new Error(data.status?.description || data.data?.moreInfo || data.error || text);
    } catch (err: any) {
      console.error('Erro no despacho via Zoho REST API:', err);
      // Fallback para SMTP somente se o modo for SMTP ou se houver senha de aplicativo Zoho válida
      if (settings.zohoAuthType === 'smtp' && (settings.zohoPass || process.env.ZOHO_PASS)) {
        return sendViaSmtp(settings, options);
      }
      return { success: false, error: err?.message || 'Falha no envio via Zoho Mail API' };
    }
  }

  return sendViaSmtp(settings, options);
}
