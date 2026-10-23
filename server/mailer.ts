/** Envio de e-mails via Zoho Mail (API REST OAuth 2.0 com fallback para SMTP). */
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

export function hasZohoConfigured(settings: CommercialSettings): boolean {
  return Boolean(
    settings.zohoRefreshToken ||
      process.env.ZOHO_REFRESH_TOKEN ||
      ((settings.zohoUser || process.env.ZOHO_USER) && (settings.zohoPass || process.env.ZOHO_PASS))
  );
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
    // Persiste o novo access token para reutilização nas próximas requisições
    try {
      const storage = getStorage();
      const content = await storage.getContent();
      content.settings.zohoAccessToken = data.access_token;
      await storage.saveContent(content);
    } catch (err) {
      console.warn('[Zoho] Não foi possível persistir o novo access token:', err);
    }
    return data.access_token;
  }
  throw new Error(`Falha ao renovar token Zoho: ${data.error || 'Erro desconhecido'}`);
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

      // Se o token expirou (ou não existe), renova e tenta novamente uma vez
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
      }
      throw new Error(data.status?.description || data.error || text);
    } catch (err: any) {
      console.error('Erro no despacho via Zoho REST API:', err);
      // Fallback para SMTP se houver senha configurada
      if (settings.zohoPass || process.env.ZOHO_PASS) {
        return sendViaSmtp(settings, options);
      }
      return { success: false, error: err?.message || 'Falha no envio via Zoho Mail API' };
    }
  }

  return sendViaSmtp(settings, options);
}
