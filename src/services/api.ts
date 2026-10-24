import { DemoModel, PlanItem, QuoteRequest, CommercialSettings, ServiceItem } from '../types';
import { INITIAL_MODELS, INITIAL_PLANS, INITIAL_SERVICES, INITIAL_SETTINGS } from '../data/initialData';

export interface ApiResponse<T> {
  data: T;
  isBackendConnected: boolean;
  error?: string;
}

// Token da sessão administrativa (mantido apenas em memória; exige novo login ao recarregar a página)
let adminToken = typeof window !== 'undefined' ? (sessionStorage.getItem('wort_admin_session_token') || '') : '';

export function getStoredAdminToken(): string {
  if (!adminToken && typeof window !== 'undefined') {
    adminToken = sessionStorage.getItem('wort_admin_session_token') || '';
  }
  return adminToken;
}

export function setStoredAdminToken(token: string) {
  adminToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('wort_admin_session_token', token);
    } else {
      sessionStorage.removeItem('wort_admin_session_token');
    }
  }
}

/** fetch autenticado para rotas administrativas protegidas no servidor. */
function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getStoredAdminToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...init, headers });
}

export const api = {
  getStoredAdminToken,
  setStoredAdminToken,
  async getHealthInfo(): Promise<{ ok: boolean; storage?: string; supabaseConnected?: boolean }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        return { ok: true, storage: data.storage, supabaseConnected: data.supabaseConnected };
      }
      return { ok: false };
    } catch {
      return { ok: false };
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/health');
      return res.ok;
    } catch {
      return false;
    }
  },

  async getInitialData(): Promise<{
    models: DemoModel[];
    plans: PlanItem[];
    services: ServiceItem[];
    settings: CommercialSettings;
    isBackendConnected: boolean;
  }> {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        return {
          models: json.models || INITIAL_MODELS,
          plans: json.plans || INITIAL_PLANS,
          services: json.services || INITIAL_SERVICES,
          settings: { ...INITIAL_SETTINGS, ...(json.settings || {}) },
          isBackendConnected: true
        };
      }
    } catch {
      // Fallback if network fails
    }

    // Fallback: check localStorage for any offline modifications
    const localModels = localStorage.getItem('wort_models');
    const localPlans = localStorage.getItem('wort_plans');
    const localSettings = localStorage.getItem('wort_settings');

    return {
      models: localModels ? JSON.parse(localModels) : INITIAL_MODELS,
      plans: localPlans ? JSON.parse(localPlans) : INITIAL_PLANS,
      services: INITIAL_SERVICES,
      settings: localSettings ? JSON.parse(localSettings) : INITIAL_SETTINGS,
      isBackendConnected: false
    };
  },

  async submitQuote(payload: Omit<QuoteRequest, 'id' | 'protocol' | 'createdAt' | 'status'>): Promise<{
    success: boolean;
    quote?: QuoteRequest;
    error?: string;
    isBackendConnected: boolean;
  }> {
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          quote: data.quote,
          isBackendConnected: true
        };
      } else {
        const errorData = await res.json();
        return {
          success: false,
          error: errorData.error || 'Erro ao processar solicitação no servidor.',
          isBackendConnected: true
        };
      }
    } catch {
      // Offline fallback: save locally and inform user
      const protocol = `WORT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackQuote: QuoteRequest = {
        ...payload,
        id: `local-${Date.now()}`,
        protocol,
        createdAt: new Date().toISOString(),
        status: 'pendente'
      };

      const existing = JSON.parse(localStorage.getItem('wort_quotes') || '[]');
      existing.unshift(fallbackQuote);
      localStorage.setItem('wort_quotes', JSON.stringify(existing));

      return {
        success: true,
        quote: fallbackQuote,
        isBackendConnected: false
      };
    }
  },

  async getQuotes(): Promise<{ quotes: QuoteRequest[]; isBackendConnected: boolean }> {
    try {
      const res = await adminFetch('/api/quotes');
      if (res.ok) {
        const quotes = await res.json();
        return { quotes, isBackendConnected: true };
      }
    } catch {
      // fallback
    }

    const localQuotes = JSON.parse(localStorage.getItem('wort_quotes') || '[]');
    return { quotes: localQuotes, isBackendConnected: false };
  },

  async updateQuoteStatus(
    id: string,
    status: QuoteRequest['status'],
    adminNotes?: string,
    notifyClient?: boolean
  ): Promise<{ success: boolean; clientNotified?: boolean; error?: string }> {
    try {
      const res = await adminFetch(`/api/quotes/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes, notifyClient })
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, clientNotified: data.clientNotified };
      }
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || `Falha ao persistir no servidor (HTTP ${res.status})` };
    } catch {
      // Local fallback
      const localQuotes: QuoteRequest[] = JSON.parse(localStorage.getItem('wort_quotes') || '[]');
      const updated = localQuotes.map(q => (q.id === id ? { ...q, status, adminNotes } : q));
      localStorage.setItem('wort_quotes', JSON.stringify(updated));
      return { success: false, error: 'Falha de comunicação com o servidor. A alteração não foi salva no banco de dados.' };
    }
  },

  async testZohoEmail(payload: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    accessToken?: string;
    authType?: 'smtp' | 'oauth2';
    senderName?: string;
    testRecipient: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await adminFetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        return { success: false, error: `Servidor retornou resposta inesperada (${res.status}): ${text || 'Vazio'}` };
      }
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Falha ao conectar ao servidor Zoho Mail.' };
    } catch (err: any) {
      return { success: false, error: `Não foi possível conectar à API de e-mail: ${err?.message || 'Erro de rede'}` };
    }
  },

  async exchangeZohoToken(code: string, redirectUri?: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    hasRefreshToken?: boolean;
    refreshToken?: string;
    accessToken?: string;
  }> {
    try {
      const res = await adminFetch('/api/zoho/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri })
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        return { success: false, error: `Servidor retornou status ${res.status}: ${text || 'O servidor Node precisa ser reiniciado para carregar a nova rota.'}` };
      }
      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message,
          hasRefreshToken: data.hasRefreshToken,
          refreshToken: data.refreshToken,
          accessToken: data.accessToken
        };
      }
      return { success: false, error: data.error || 'Falha ao validar código na Zoho API' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro de conexão com o servidor' };
    }
  },

  async deleteQuote(id: string): Promise<boolean> {
    try {
      const res = await adminFetch(`/api/quotes/${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async saveModel(model: DemoModel, isEdit: boolean): Promise<boolean> {
    try {
      const url = isEdit ? `/api/models/${model.id}` : '/api/models';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteModel(id: string): Promise<boolean> {
    try {
      const res = await adminFetch(`/api/models/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async updatePlan(plan: PlanItem): Promise<boolean> {
    try {
      const res = await adminFetch(`/api/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async updateSettings(settings: CommercialSettings): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Ao trocar a senha, o servidor invalida as sessões antigas e devolve um novo token
        if (data.newAdminToken) setStoredAdminToken(data.newAdminToken);
        return { success: true };
      }
      return { success: false, error: data.error || 'Erro ao salvar configurações no servidor.' };
    } catch {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  },

  async adminLogin(password: string): Promise<{ success: boolean; error?: string }> {
    const cleanPassword = (password || '').trim();
    if (!cleanPassword) {
      return { success: false, error: 'Por favor, informe a senha de acesso administrativo.' };
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: cleanPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        setStoredAdminToken(data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Senha incorreta.' };
    } catch {
      return { success: false, error: 'Não foi possível validar as credenciais.' };
    }
  },

  async adminLogout(): Promise<void> {
    try {
      if (adminToken) await adminFetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignora falhas de rede no logout
    } finally {
      setStoredAdminToken('');
    }
  },

  /** Configurações completas (inclui credenciais) — somente para administradores autenticados. */
  async getAdminSettings(): Promise<CommercialSettings | null> {
    try {
      const res = await adminFetch('/api/settings');
      if (res.ok) return await res.json();
    } catch {
      // fallback abaixo
    }
    return null;
  }
};

/**
 * Generates an accessible, RFC-compliant WhatsApp direct link.
 * Does not make assumptions if phone is not set.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  if (!cleanPhone) {
    // If no phone is configured yet, opens WhatsApp web compose without phone
    return `https://wa.me/?text=${encodedText}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
