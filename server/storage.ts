/**
 * Camada de persistência do Wort Site Engine.
 *
 * - Produção (Vercel): Upstash Redis (via Vercel Marketplace). Variáveis aceitas:
 *     KV_REST_API_URL / KV_REST_API_TOKEN  ou  UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 * - Desenvolvimento local (sem Redis configurado): arquivo data/database.json
 * - Fallback de segurança (Vercel sem Redis configurado): memória temporária para garantir
 *   que o login, visualização e testes funcionem perfeitamente.
 */
import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { INITIAL_MODELS, INITIAL_PLANS, INITIAL_SERVICES, INITIAL_SETTINGS } from '../src/data/initialData.js';
import type { DemoModel, PlanItem, QuoteRequest, CommercialSettings, ServiceItem } from '../src/types/index.js';
import { DEFAULT_COMPANY_PROFILE, SAMPLE_CLIENT, createDefaultProposal } from '../src/data/proposalTemplates.js';
import type { CommercialProposal, ClientProfile, CompanyProfile } from '../src/types/index.js';
import { createSupabaseStorage } from './supabaseStorage.js';

export interface SiteContent {
  models: DemoModel[];
  plans: PlanItem[];
  services: ServiceItem[];
  settings: CommercialSettings;
}

export interface Storage {
  readonly kind: 'supabase' | 'redis' | 'file' | 'memory';
  getContent(): Promise<SiteContent>;
  saveContent(content: SiteContent): Promise<void>;
  listQuotes(): Promise<QuoteRequest[]>;
  getQuote(id: string): Promise<QuoteRequest | null>;
  saveQuote(quote: QuoteRequest): Promise<void>;
  updateQuoteStatus?(id: string, status: QuoteRequest['status'], adminNotes?: string): Promise<QuoteRequest | null>;
  deleteQuote(id: string): Promise<boolean>;

  // Módulo de Orçamentos e Propostas Comerciais
  listProposals(): Promise<CommercialProposal[]>;
  getProposal(id: string): Promise<CommercialProposal | null>;
  saveProposal(proposal: CommercialProposal): Promise<void>;
  deleteProposal(id: string): Promise<boolean>;

  // Gestão de Clientes
  listClients(): Promise<ClientProfile[]>;
  getClient(id: string): Promise<ClientProfile | null>;
  saveClient(client: ClientProfile): Promise<void>;
  deleteClient(id: string): Promise<boolean>;

  // Perfil da Empresa (Wort Studio)
  getCompanyProfile(): Promise<CompanyProfile>;
  saveCompanyProfile(profile: CompanyProfile): Promise<void>;
  /** Incrementa e retorna o número de tentativas de login falhas do IP dentro da janela. */
  registerLoginFailure(ip: string, windowMs: number): Promise<number>;
  getLoginFailures(ip: string): Promise<number>;
  clearLoginFailures(ip: string): Promise<void>;
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      'Banco de dados não configurado. No painel da Vercel, conecte um banco Upstash Redis ao projeto (Storage → Upstash → Redis) para salvar dados de forma permanente.'
    );
  }
}

function defaultContent(): SiteContent {
  return {
    models: INITIAL_MODELS,
    plans: INITIAL_PLANS,
    services: INITIAL_SERVICES,
    settings: INITIAL_SETTINGS
  };
}

function sortQuotes(quotes: QuoteRequest[]): QuoteRequest[] {
  return quotes.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

// ---------------------------------------------------------------------------
// Redis (produção permanente)
// ---------------------------------------------------------------------------
const KEY_CONTENT = 'wort:content';
const KEY_QUOTES = 'wort:quotes';
const KEY_PROPOSALS = 'wort:proposals';
const KEY_CLIENTS = 'wort:clients';
const KEY_COMPANY_PROFILE = 'wort:company-profile';
const KEY_LOGIN = (ip: string) => `wort:login-fail:${ip}`;

function createRedisStorage(url: string, token: string): Storage {
  const redis = new Redis({ url, token });

  return {
    kind: 'redis',

    async getContent() {
      const stored = await redis.get<SiteContent>(KEY_CONTENT);
      if (!stored) {
        const initial = defaultContent();
        await redis.set(KEY_CONTENT, initial);
        return initial;
      }
      return {
        models: stored.models || INITIAL_MODELS,
        plans: stored.plans || INITIAL_PLANS,
        services: stored.services || INITIAL_SERVICES,
        settings: { ...INITIAL_SETTINGS, ...(stored.settings || {}) }
      };
    },

    async saveContent(content) {
      await redis.set(KEY_CONTENT, content);
    },

    async listQuotes() {
      const all = await redis.hgetall<Record<string, QuoteRequest>>(KEY_QUOTES);
      return sortQuotes(Object.values(all || {}));
    },

    async getQuote(id) {
      return (await redis.hget<QuoteRequest>(KEY_QUOTES, id)) || null;
    },

    async saveQuote(quote) {
      await redis.hset(KEY_QUOTES, { [quote.id]: quote });
    },

    async updateQuoteStatus(id, status, adminNotes) {
      const quote = (await redis.hget<QuoteRequest>(KEY_QUOTES, id)) || null;
      if (!quote) return null;
      quote.status = status;
      if (adminNotes !== undefined) quote.adminNotes = adminNotes;
      await redis.hset(KEY_QUOTES, { [id]: quote });
      return quote;
    },

    async deleteQuote(id) {
      return (await redis.hdel(KEY_QUOTES, id)) > 0;
    },

    async listProposals() {
      const all = await redis.hgetall<Record<string, CommercialProposal>>(KEY_PROPOSALS);
      const list = Object.values(all || {});
      if (list.length === 0) return [createDefaultProposal()];
      return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    },

    async getProposal(id) {
      const p = await redis.hget<CommercialProposal>(KEY_PROPOSALS, id);
      if (!p && id.includes('0001')) return createDefaultProposal();
      return p || null;
    },

    async saveProposal(proposal) {
      await redis.hset(KEY_PROPOSALS, { [proposal.id]: proposal });
    },

    async deleteProposal(id) {
      return (await redis.hdel(KEY_PROPOSALS, id)) > 0;
    },

    async listClients() {
      const all = await redis.hgetall<Record<string, ClientProfile>>(KEY_CLIENTS);
      const list = Object.values(all || {});
      if (list.length === 0) return [SAMPLE_CLIENT];
      return list;
    },

    async getClient(id) {
      return (await redis.hget<ClientProfile>(KEY_CLIENTS, id)) || null;
    },

    async saveClient(client) {
      await redis.hset(KEY_CLIENTS, { [client.id]: client });
    },

    async deleteClient(id) {
      return (await redis.hdel(KEY_CLIENTS, id)) > 0;
    },

    async getCompanyProfile() {
      const stored = await redis.get<CompanyProfile>(KEY_COMPANY_PROFILE);
      return stored || DEFAULT_COMPANY_PROFILE;
    },

    async saveCompanyProfile(profile) {
      await redis.set(KEY_COMPANY_PROFILE, profile);
    },

    async registerLoginFailure(ip, windowMs) {
      const key = KEY_LOGIN(ip);
      const count = await redis.incr(key);
      if (count === 1) await redis.pexpire(key, windowMs);
      return count;
    },

    async getLoginFailures(ip) {
      return Number((await redis.get<number>(KEY_LOGIN(ip))) || 0);
    },

    async clearLoginFailures(ip) {
      await redis.del(KEY_LOGIN(ip));
    }
  };
}

// ---------------------------------------------------------------------------
// Memória (fallback seguro na Vercel quando Upstash Redis ainda não foi vinculado)
// ---------------------------------------------------------------------------
function createMemoryStorage(): Storage {
  let content = defaultContent();
  let quotes: QuoteRequest[] = [];
  let proposals: CommercialProposal[] = [createDefaultProposal()];
  let clients: ClientProfile[] = [SAMPLE_CLIENT];
  let companyProfile: CompanyProfile = { ...DEFAULT_COMPANY_PROFILE };
  const loginFailures = new Map<string, { count: number; expiresAt: number }>();

  function activeFailures(ip: string) {
    const entry = loginFailures.get(ip);
    if (entry && entry.expiresAt < Date.now()) {
      loginFailures.delete(ip);
      return undefined;
    }
    return entry;
  }

  return {
    kind: 'memory',

    async getContent() {
      return content;
    },

    async saveContent(newContent) {
      content = newContent;
    },

    async listQuotes() {
      return sortQuotes(quotes);
    },

    async getQuote(id) {
      return quotes.find(q => q.id === id) || null;
    },

    async saveQuote(quote) {
      const index = quotes.findIndex(q => q.id === quote.id);
      if (index === -1) quotes.unshift(quote);
      else quotes[index] = quote;
    },

    async updateQuoteStatus(id, status, adminNotes) {
      const quote = quotes.find(q => q.id === id);
      if (!quote) return null;
      quote.status = status;
      if (adminNotes !== undefined) quote.adminNotes = adminNotes;
      return quote;
    },

    async deleteQuote(id) {
      const before = quotes.length;
      quotes = quotes.filter(q => q.id !== id);
      return quotes.length < before;
    },

    async listProposals() {
      return [...proposals].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    },

    async getProposal(id) {
      return proposals.find(p => p.id === id) || (id.includes('0001') ? createDefaultProposal() : null);
    },

    async saveProposal(proposal) {
      const idx = proposals.findIndex(p => p.id === proposal.id);
      if (idx === -1) proposals.unshift(proposal);
      else proposals[idx] = proposal;
    },

    async deleteProposal(id) {
      const before = proposals.length;
      proposals = proposals.filter(p => p.id !== id);
      return proposals.length < before;
    },

    async listClients() {
      return [...clients];
    },

    async getClient(id) {
      return clients.find(c => c.id === id) || null;
    },

    async saveClient(client) {
      const idx = clients.findIndex(c => c.id === client.id);
      if (idx === -1) clients.unshift(client);
      else clients[idx] = client;
    },

    async deleteClient(id) {
      const before = clients.length;
      clients = clients.filter(c => c.id !== id);
      return clients.length < before;
    },

    async getCompanyProfile() {
      return { ...companyProfile };
    },

    async saveCompanyProfile(profile) {
      companyProfile = { ...profile };
    },

    async registerLoginFailure(ip, windowMs) {
      const entry = activeFailures(ip);
      if (!entry) {
        loginFailures.set(ip, { count: 1, expiresAt: Date.now() + windowMs });
        return 1;
      }
      entry.count += 1;
      return entry.count;
    },

    async getLoginFailures(ip) {
      return activeFailures(ip)?.count || 0;
    },

    async clearLoginFailures(ip) {
      loginFailures.delete(ip);
    }
  };
}

// ---------------------------------------------------------------------------
// Arquivo JSON (desenvolvimento local)
// ---------------------------------------------------------------------------
interface FileSchema extends SiteContent {
  quotes: QuoteRequest[];
  proposals?: CommercialProposal[];
  clients?: ClientProfile[];
  companyProfile?: CompanyProfile;
}

function createFileStorage(): Storage {
  const DATA_DIR = path.resolve(process.cwd(), 'data');
  const DB_FILE = path.resolve(DATA_DIR, 'database.json');
  const loginFailures = new Map<string, { count: number; expiresAt: number }>();

  function read(): FileSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as Partial<FileSchema>;
        return {
          models: parsed.models || INITIAL_MODELS,
          plans: parsed.plans || INITIAL_PLANS,
          services: parsed.services || INITIAL_SERVICES,
          settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
          quotes: parsed.quotes || [],
          proposals: parsed.proposals && parsed.proposals.length > 0 ? parsed.proposals : [createDefaultProposal()],
          clients: parsed.clients && parsed.clients.length > 0 ? parsed.clients : [SAMPLE_CLIENT],
          companyProfile: parsed.companyProfile || DEFAULT_COMPANY_PROFILE
        };
      }
    } catch (err) {
      console.error('Erro ao ler data/database.json, usando estado inicial', err);
    }
    const initial: FileSchema = {
      ...defaultContent(),
      quotes: [],
      proposals: [createDefaultProposal()],
      clients: [SAMPLE_CLIENT],
      companyProfile: DEFAULT_COMPANY_PROFILE
    };
    write(initial);
    return initial;
  }

  function write(db: FileSchema) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }

  function activeFailures(ip: string) {
    const entry = loginFailures.get(ip);
    if (entry && entry.expiresAt < Date.now()) {
      loginFailures.delete(ip);
      return undefined;
    }
    return entry;
  }

  return {
    kind: 'file',

    async getContent() {
      const { quotes: _quotes, ...content } = read();
      return content;
    },

    async saveContent(content) {
      const db = read();
      write({ ...db, ...content });
    },

    async listQuotes() {
      return sortQuotes(read().quotes);
    },

    async getQuote(id) {
      return read().quotes.find(q => q.id === id) || null;
    },

    async saveQuote(quote) {
      const db = read();
      const index = db.quotes.findIndex(q => q.id === quote.id);
      if (index === -1) db.quotes.unshift(quote);
      else db.quotes[index] = quote;
      write(db);
    },

    async updateQuoteStatus(id, status, adminNotes) {
      const db = read();
      const quote = db.quotes.find(q => q.id === id);
      if (!quote) return null;
      quote.status = status;
      if (adminNotes !== undefined) quote.adminNotes = adminNotes;
      write(db);
      return quote;
    },

    async deleteQuote(id) {
      const db = read();
      const before = db.quotes.length;
      db.quotes = db.quotes.filter(q => q.id !== id);
      write(db);
      return db.quotes.length < before;
    },

    async listProposals() {
      const db = read();
      const list = db.proposals || [createDefaultProposal()];
      return [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    },

    async getProposal(id) {
      const db = read();
      const list = db.proposals || [createDefaultProposal()];
      return list.find(p => p.id === id) || (id.includes('0001') ? createDefaultProposal() : null);
    },

    async saveProposal(proposal) {
      const db = read();
      if (!db.proposals) db.proposals = [];
      const idx = db.proposals.findIndex(p => p.id === proposal.id);
      if (idx === -1) db.proposals.unshift(proposal);
      else db.proposals[idx] = proposal;
      write(db);
    },

    async deleteProposal(id) {
      const db = read();
      if (!db.proposals) return false;
      const before = db.proposals.length;
      db.proposals = db.proposals.filter(p => p.id !== id);
      write(db);
      return db.proposals.length < before;
    },

    async listClients() {
      const db = read();
      return db.clients && db.clients.length > 0 ? [...db.clients] : [SAMPLE_CLIENT];
    },

    async getClient(id) {
      const db = read();
      return (db.clients || []).find(c => c.id === id) || null;
    },

    async saveClient(client) {
      const db = read();
      if (!db.clients) db.clients = [SAMPLE_CLIENT];
      const idx = db.clients.findIndex(c => c.id === client.id);
      if (idx === -1) db.clients.unshift(client);
      else db.clients[idx] = client;
      write(db);
    },

    async deleteClient(id) {
      const db = read();
      if (!db.clients) return false;
      const before = db.clients.length;
      db.clients = db.clients.filter(c => c.id !== id);
      write(db);
      return db.clients.length < before;
    },

    async getCompanyProfile() {
      const db = read();
      return db.companyProfile || DEFAULT_COMPANY_PROFILE;
    },

    async saveCompanyProfile(profile) {
      const db = read();
      db.companyProfile = profile;
      write(db);
    },

    async registerLoginFailure(ip, windowMs) {
      const entry = activeFailures(ip);
      if (!entry) {
        loginFailures.set(ip, { count: 1, expiresAt: Date.now() + windowMs });
        return 1;
      }
      entry.count += 1;
      return entry.count;
    },

    async getLoginFailures(ip) {
      return activeFailures(ip)?.count || 0;
    },

    async clearLoginFailures(ip) {
      loginFailures.delete(ip);
    }
  };
}

// ---------------------------------------------------------------------------
const DEFAULT_SUPABASE_URL = 'https://incrhyxhwfmvytjpncts.supabase.co';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluY3JoeXhod2Ztdnl0anBuY3RzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjc4MDA1NiwiZXhwIjoyMTA4MzU2MDU2fQ.WvwiGZe2WvS4rxXVDX8WCWzpfI_pKkxn-7WOPNQ5s8U';

let instance: Storage | null = null;

export function resetStorageInstance() {
  instance = null;
}

export function getStorage(): Storage {
  if (instance) return instance;

  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  ).trim();

  // Prioriza a chave JWT service_role (acesso total ao PostgREST sem bloqueio de RLS)
  const envServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const envSecretKey = (process.env.SUPABASE_SECRET_KEY || '').trim();
  const supabaseKey = (
    (envServiceKey.startsWith('eyJ') ? envServiceKey : '') ||
    (envSecretKey.startsWith('eyJ') ? envSecretKey : '') ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY ||
    envSecretKey ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (supabaseUrl && supabaseKey) {
    console.log(`[Storage] Inicializando conexão oficial com Supabase: ${supabaseUrl}`);
    instance = createSupabaseStorage(supabaseUrl, supabaseKey);
  } else if (url && token) {
    console.log('[Storage] Inicializando Upstash Redis');
    instance = createRedisStorage(url, token);
  } else if (process.env.VERCEL) {
    console.warn('[Storage] Fallback para Supabase padrão na Vercel.');
    instance = createSupabaseStorage(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_SERVICE_ROLE_KEY);
  } else {
    instance = createFileStorage();
  }
  return instance;
}
