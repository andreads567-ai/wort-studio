import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_MODELS, INITIAL_PLANS, INITIAL_SERVICES, INITIAL_SETTINGS } from '../src/data/initialData.js';
import type { DemoModel, PlanItem, QuoteRequest, CommercialSettings, ServiceItem } from '../src/types/index.js';
import type { Storage, SiteContent } from './storage.js';

function sortQuotes(quotes: QuoteRequest[]): QuoteRequest[] {
  return quotes.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

/**
 * Converte um QuoteRequest da aplicação para o formato de colunas do Supabase (snake_case padrão do PostgreSQL).
 */
export function quoteToSupabaseRow(quote: QuoteRequest): Record<string, unknown> {
  return {
    id: quote.id,
    protocol: quote.protocol,
    created_at: quote.createdAt || new Date().toISOString(),
    name: quote.name,
    email: quote.email,
    whatsapp: quote.whatsapp,
    project_type: quote.projectType,
    business_segment: quote.businessSegment || '',
    budget_range: quote.budgetRange || '',
    timeline: quote.timeline || '',
    description: quote.description || '',
    reference_model_id: quote.referenceModelId || null,
    status: quote.status || 'pendente',
    admin_notes: quote.adminNotes || null
  };
}

export function normalizeStatus(st: any): QuoteRequest['status'] {
  const s = String(st || '').toLowerCase().trim();
  if (s.includes('anál') || s.includes('anal')) return 'em_analise';
  if (s.includes('prop')) return 'proposta_enviada';
  if (s.includes('concl')) return 'concluido';
  return 'pendente';
}

/**
 * Converte uma linha retornada pelo Supabase para o modelo QuoteRequest da aplicação.
 * Suporta tanto colunas snake_case (padrão) quanto camelCase caso criadas assim no Supabase.
 */
export function supabaseRowToQuote(row: any): QuoteRequest {
  return {
    id: String(row.id),
    protocol: String(row.protocol || ''),
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
    name: String(row.name || ''),
    email: String(row.email || ''),
    whatsapp: String(row.whatsapp || ''),
    projectType: (row.project_type || row.projectType || 'site_institucional') as any,
    businessSegment: String(row.business_segment || row.businessSegment || ''),
    budgetRange: String(row.budget_range || row.budgetRange || ''),
    timeline: String(row.timeline || ''),
    description: String(row.description || ''),
    referenceModelId: row.reference_model_id || row.referenceModelId || undefined,
    status: normalizeStatus(row.status),
    adminNotes: row.admin_notes || row.adminNotes || undefined
  };
}

/**
 * Mapeia as configurações comerciais e credenciais de API para colunas do Supabase.
 * Conforme requerido, mapeia exatamente: status, client_id, client_secret, refresh_token, access_token, etc.
 */
export function mapSettingsToSupabase(settings: CommercialSettings): Record<string, unknown> {
  const hasOAuth = Boolean(settings.zohoClientId || settings.zohoRefreshToken);
  const authType = settings.zohoAuthType === 'smtp' && settings.zohoPass ? 'smtp' : hasOAuth ? 'oauth2' : (settings.zohoAuthType || 'oauth2');
  return {
    id: 'default',
    client_id: settings.zohoClientId || null,
    client_secret: settings.zohoClientSecret || null,
    refresh_token: settings.zohoRefreshToken || null,
    access_token: settings.zohoAccessToken || null,
    account_id: settings.zohoAccountId || null,
    zoho_user: settings.zohoUser || null,
    zoho_pass: settings.zohoPass || null,
    zoho_sender_name: settings.zohoSenderName || null,
    zoho_alert_recipient: settings.zohoAlertRecipient || null,
    zoho_auth_type: authType,
    zoho_host: settings.zohoHost || 'smtp.zoho.com',
    zoho_port: settings.zohoPort || 465,
    zoho_redirect_uri: settings.zohoRedirectUri || null,
    admin_password_hash: settings.adminPasswordHash || null,
    whatsapp_number: settings.whatsappNumber || '',
    whatsapp_display: settings.whatsappDisplay || '',
    contact_email: settings.contactEmail || '',
    business_hours: settings.businessHours || '',
    address_city: settings.addressCity || '',
    slogan_principal: settings.sloganPrincipal || '',
    slogan_secundario: settings.sloganSecundario || '',
    about_text: settings.aboutText || '',
    data: { ...settings, zohoAuthType: authType },
    content: { ...settings, zohoAuthType: authType },
    updated_at: new Date().toISOString()
  };
}

/**
 * Converte o registro retornado do Supabase para o CommercialSettings do front-end.
 */
export function mapSupabaseToSettings(row: any, base: CommercialSettings = INITIAL_SETTINGS): CommercialSettings {
  if (!row) return base;
  const jsonContent = (typeof row.content === 'object' && row.content) || 
                      (typeof row.data === 'object' && row.data) || 
                      {};

  const zohoClientId = row.client_id || row.zoho_client_id || row.zohoClientId || jsonContent.zohoClientId || base.zohoClientId || '';
  const zohoClientSecret = row.client_secret || row.zoho_client_secret || row.zohoClientSecret || jsonContent.zohoClientSecret || base.zohoClientSecret || '';
  const zohoRefreshToken = row.refresh_token || row.zoho_refresh_token || row.zohoRefreshToken || jsonContent.zohoRefreshToken || base.zohoRefreshToken || '';
  const zohoAccessToken = row.access_token || row.zoho_access_token || row.zohoAccessToken || jsonContent.zohoAccessToken || base.zohoAccessToken || '';
  const zohoAccountId = row.account_id || row.zoho_account_id || row.zohoAccountId || jsonContent.zohoAccountId || base.zohoAccountId || '';
  const zohoPass = row.zoho_pass ?? row.pass ?? row.zohoPass ?? jsonContent.zohoPass ?? base.zohoPass ?? '';
  const rawAuthType = row.zoho_auth_type || row.auth_type || row.zohoAuthType || jsonContent.zohoAuthType || base.zohoAuthType || 'oauth2';
  const zohoAuthType = ((zohoClientId || zohoRefreshToken) && !zohoPass) ? 'oauth2' : (rawAuthType as 'smtp' | 'oauth2');

  return {
    ...base,
    ...jsonContent,
    zohoClientId,
    zohoClientSecret,
    zohoRefreshToken,
    zohoAccessToken,
    zohoAccountId,
    zohoUser: row.zoho_user || row.user_email || row.user || row.zohoUser || jsonContent.zohoUser || base.zohoUser || 'wort.studio@aliandre.com.br',
    zohoPass,
    zohoSenderName: row.zoho_sender_name || row.sender_name || row.zohoSenderName || jsonContent.zohoSenderName || base.zohoSenderName || 'WortSite Studio',
    zohoAlertRecipient: row.zoho_alert_recipient ?? row.alert_recipient ?? row.zohoAlertRecipient ?? jsonContent.zohoAlertRecipient ?? base.zohoAlertRecipient ?? '',
    zohoAuthType,
    zohoHost: row.zoho_host || row.host || row.zohoHost || jsonContent.zohoHost || base.zohoHost || 'smtp.zoho.com',
    zohoPort: Number(row.zoho_port || row.port || row.zohoPort || jsonContent.zohoPort || base.zohoPort || 465),
    zohoRedirectUri: row.zoho_redirect_uri ?? row.redirect_uri ?? row.zohoRedirectUri ?? jsonContent.zohoRedirectUri ?? base.zohoRedirectUri ?? '',
    adminPasswordHash: row.admin_password_hash || row.admin_password || row.adminPasswordHash || jsonContent.adminPasswordHash || base.adminPasswordHash || '',
    whatsappNumber: row.whatsapp_number ?? row.whatsappNumber ?? jsonContent.whatsappNumber ?? base.whatsappNumber ?? '',
    whatsappDisplay: row.whatsapp_display ?? row.whatsappDisplay ?? jsonContent.whatsappDisplay ?? base.whatsappDisplay ?? '',
    contactEmail: row.contact_email ?? row.contactEmail ?? jsonContent.contactEmail ?? base.contactEmail ?? '',
    businessHours: row.business_hours ?? row.businessHours ?? jsonContent.businessHours ?? base.businessHours ?? '',
    addressCity: row.address_city ?? row.addressCity ?? jsonContent.addressCity ?? base.addressCity ?? '',
    sloganPrincipal: row.slogan_principal ?? row.sloganPrincipal ?? jsonContent.sloganPrincipal ?? base.sloganPrincipal ?? '',
    sloganSecundario: row.slogan_secundario ?? row.sloganSecundario ?? jsonContent.sloganSecundario ?? base.sloganSecundario ?? '',
    aboutText: row.about_text ?? row.aboutText ?? jsonContent.aboutText ?? base.aboutText ?? ''
  };
}

export function createSupabaseStorage(supabaseUrl: string, supabaseKey: string): Storage {
  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const memoryFailures = new Map<string, { count: number; expiresAt: number }>();

  return {
    kind: 'supabase',

    async getContent(): Promise<SiteContent> {
      let settings = INITIAL_SETTINGS;
      let models = INITIAL_MODELS;
      let plans = INITIAL_PLANS;
      let services = INITIAL_SERVICES;

      // 1. Carrega catálogo (models, plans, services) da tabela 'site_content'
      try {
        const { data: contentRows, error: contentErr } = await supabase
          .from('site_content')
          .select('*');

        if (!contentErr && contentRows && contentRows.length > 0) {
          for (const row of contentRows) {
            const key = row.key || row.id;
            const val = row.value || row.data || row.content;
            if (key === 'models' && Array.isArray(val)) models = val;
            if (key === 'plans' && Array.isArray(val)) plans = val;
            if (key === 'services' && Array.isArray(val)) services = val;
            if (key === 'settings' && typeof val === 'object' && val) {
              settings = mapSupabaseToSettings({ content: val }, settings);
            }
          }
        }
      } catch (err: any) {
        console.warn('[Supabase Storage] Aviso ao ler site_content:', err?.message || err);
      }

      // 2. Carrega configurações e credenciais de API da tabela 'settings' (fonte autoritativa)
      try {
        let { data: settingsRow, error: settingsErr } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (!settingsRow && !settingsErr) {
          const fallbackRes = await supabase.from('settings').select('*').limit(1).maybeSingle();
          settingsRow = fallbackRes.data;
          settingsErr = fallbackRes.error;
        }

        if (settingsErr) {
          console.warn('[Supabase Storage] Aviso ao consultar tabela settings:', settingsErr.message);
        } else if (settingsRow) {
          settings = mapSupabaseToSettings(settingsRow, settings);
        }
      } catch (err: any) {
        console.error('[Supabase Storage] Erro ao carregar settings:', err?.message || err);
      }

      return {
        models,
        plans,
        services,
        settings
      };
    },

    async saveContent(content: SiteContent): Promise<void> {
      const now = new Date().toISOString();

      // 1. Grava permanentemente as credenciais e configurações na tabela 'settings'
      try {
        const settingsRow = mapSettingsToSupabase(content.settings);
        
        const { error: upsertErr } = await supabase
          .from('settings')
          .upsert(settingsRow, { onConflict: 'id' });

        if (upsertErr) {
          console.warn('[Supabase Storage] Tentando upsert simplificado em settings:', upsertErr.message);
          const apiOnlyRow = {
            id: 'default',
            client_id: content.settings.zohoClientId || null,
            client_secret: content.settings.zohoClientSecret || null,
            refresh_token: content.settings.zohoRefreshToken || null,
            access_token: content.settings.zohoAccessToken || null,
            account_id: content.settings.zohoAccountId || null,
            zoho_user: content.settings.zohoUser || null,
            data: content.settings,
            content: content.settings
          };
          const { error: fallbackErr } = await supabase
            .from('settings')
            .upsert(apiOnlyRow, { onConflict: 'id' });

          if (fallbackErr) {
            console.error('[Supabase Storage CRITICAL] Falha ao gravar settings no Supabase:', fallbackErr.message);
            throw new Error(`Erro ao gravar configurações no Supabase: ${fallbackErr.message}`);
          }
        }
        console.log('[Supabase Storage] Configurações e credenciais de API salvas com sucesso na tabela settings.');
      } catch (err: any) {
        console.error('[Supabase Storage] Erro ao salvar settings:', err?.message || err);
        throw err;
      }

      // 2. Grava modelos, planos, serviços e settings na tabela 'site_content'
      try {
        const { error: contentErr } = await supabase.from('site_content').upsert([
          { key: 'models', value: content.models, updated_at: now },
          { key: 'plans', value: content.plans, updated_at: now },
          { key: 'services', value: content.services, updated_at: now },
          { key: 'settings', value: content.settings, updated_at: now }
        ], { onConflict: 'key' });

        if (contentErr) {
          console.error('[Supabase Storage CRITICAL] Falha ao gravar site_content no Supabase:', contentErr.message);
          throw new Error(`Erro ao gravar modelos/planos no Supabase: ${contentErr.message}`);
        }
        console.log('[Supabase Storage] Modelos, planos e conteúdo salvos com sucesso na tabela site_content.');
      } catch (err: any) {
        console.error('[Supabase Storage] Erro ao salvar site_content:', err?.message || err);
        throw err;
      }
    },

    async listQuotes(): Promise<QuoteRequest[]> {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          // Se falhou ao ordenar por created_at, tenta select simples
          console.warn('[Supabase Storage] Falha ao ordenar por created_at, tentando sem ordenação:', error.message);
          const { data: rawData, error: rawError } = await supabase
            .from('quotes')
            .select('*');

          if (rawError) {
            console.error('[Supabase Storage] Erro ao listar orçamentos/leads no Supabase:', rawError.message);
            throw new Error(`Falha ao ler orçamentos do banco de dados: ${rawError.message}`);
          }
          return sortQuotes((rawData || []).map(supabaseRowToQuote));
        }

        return (data || []).map(supabaseRowToQuote);
      } catch (err: any) {
        console.error('[Supabase Storage Exception] listQuotes:', err?.message || err);
        throw err;
      }
    },

    async getQuote(id: string): Promise<QuoteRequest | null> {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error(`[Supabase Storage] Erro ao buscar orçamento ${id}:`, error.message);
          return null;
        }

        return data ? supabaseRowToQuote(data) : null;
      } catch (err: any) {
        console.error(`[Supabase Storage Exception] getQuote ${id}:`, err?.message || err);
        return null;
      }
    },

    async saveQuote(quote: QuoteRequest): Promise<void> {
      try {
        const row = quoteToSupabaseRow(quote);
        console.log(`[Supabase Storage] Gravando lead/orçamento ${quote.id} (${quote.protocol}) - Status: ${quote.status}`);

        const { error } = await supabase
          .from('quotes')
          .upsert(row, { onConflict: 'id' });

        if (error) {
          console.error(`[Supabase Storage CRITICAL] Erro ao salvar orçamento ${quote.id}:`, error.message);
          throw new Error(`Falha ao gravar lead no Supabase: ${error.message}`);
        }

        console.log(`[Supabase Storage] Lead ${quote.id} gravado com sucesso no Supabase.`);
      } catch (err: any) {
        console.error('[Supabase Storage Exception] saveQuote:', err?.message || err);
        throw err;
      }
    },

    async updateQuoteStatus(id: string, status: QuoteRequest['status'], adminNotes?: string): Promise<QuoteRequest | null> {
      try {
        console.log(`[Supabase Storage] Atualizando status no banco: id=${id}, novo_status=${status}, adminNotes=${adminNotes ?? '(inalterado)'}`);

        const updatePayload: Record<string, unknown> = { status };
        if (adminNotes !== undefined) {
          updatePayload.admin_notes = adminNotes;
        }

        // 1. Tenta atualizar diretamente com snake_case (status, admin_notes)
        let { data, error } = await supabase
          .from('quotes')
          .update(updatePayload)
          .eq('id', id)
          .select();

        // 2. Se a coluna admin_notes não existir, tenta com adminNotes ou apenas status
        if (error && (error.message?.includes('admin_notes') || error.code === 'PGRST204')) {
          console.warn('[Supabase Storage] Tentando update sem a coluna admin_notes:', error.message);
          delete updatePayload.admin_notes;
          const retry = await supabase
            .from('quotes')
            .update(updatePayload)
            .eq('id', id)
            .select();
          data = retry.data;
          error = retry.error;
        }

        if (error) {
          console.error(`[Supabase Storage CRITICAL] Erro ao atualizar status no Supabase:`, error.message);
          throw new Error(`Falha ao persistir status no banco de dados: ${error.message}`);
        }

        if (!data || data.length === 0) {
          // Busca o registro atualizado caso select() não retorne em alguns modos de RLS
          const refreshed = await this.getQuote(id);
          if (refreshed) return refreshed;
          throw new Error(`Orçamento com ID ${id} não encontrado no banco de dados.`);
        }

        console.log(`[Supabase Storage] Status do orçamento ${id} gravado permanentemente como "${status}" no Supabase.`);
        return supabaseRowToQuote(data[0]);
      } catch (err: any) {
        console.error('[Supabase Storage Exception] updateQuoteStatus:', err?.message || err);
        throw err;
      }
    },

    async deleteQuote(id: string): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('quotes')
          .delete()
          .eq('id', id);

        if (error) {
          console.error(`[Supabase Storage] Erro ao excluir orçamento ${id}:`, error.message);
          throw new Error(`Erro ao excluir do Supabase: ${error.message}`);
        }

        return true;
      } catch (err: any) {
        console.error('[Supabase Storage Exception] deleteQuote:', err?.message || err);
        throw err;
      }
    },

    async registerLoginFailure(ip: string, windowMs: number): Promise<number> {
      const now = Date.now();
      const current = memoryFailures.get(ip);
      if (!current || current.expiresAt < now) {
        memoryFailures.set(ip, { count: 1, expiresAt: now + windowMs });
        return 1;
      }
      current.count += 1;
      return current.count;
    },

    async getLoginFailures(ip: string): Promise<number> {
      const now = Date.now();
      const current = memoryFailures.get(ip);
      if (!current || current.expiresAt < now) {
        memoryFailures.delete(ip);
        return 0;
      }
      return current.count;
    },

    async clearLoginFailures(ip: string): Promise<void> {
      memoryFailures.delete(ip);
    }
  };
}
