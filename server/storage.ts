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

export interface SiteContent {
  models: DemoModel[];
  plans: PlanItem[];
  services: ServiceItem[];
  settings: CommercialSettings;
}

export interface Storage {
  readonly kind: 'redis' | 'file' | 'memory';
  getContent(): Promise<SiteContent>;
  saveContent(content: SiteContent): Promise<void>;
  listQuotes(): Promise<QuoteRequest[]>;
  getQuote(id: string): Promise<QuoteRequest | null>;
  saveQuote(quote: QuoteRequest): Promise<void>;
  deleteQuote(id: string): Promise<boolean>;
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

    async deleteQuote(id) {
      return (await redis.hdel(KEY_QUOTES, id)) > 0;
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

    async deleteQuote(id) {
      const before = quotes.length;
      quotes = quotes.filter(q => q.id !== id);
      return quotes.length < before;
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
          quotes: parsed.quotes || []
        };
      }
    } catch (err) {
      console.error('Erro ao ler data/database.json, usando estado inicial', err);
    }
    const initial: FileSchema = { ...defaultContent(), quotes: [] };
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

    async deleteQuote(id) {
      const db = read();
      const before = db.quotes.length;
      db.quotes = db.quotes.filter(q => q.id !== id);
      write(db);
      return db.quotes.length < before;
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
let instance: Storage | null = null;

export function getStorage(): Storage {
  if (instance) return instance;

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    instance = createRedisStorage(url, token);
  } else if (process.env.VERCEL) {
    // Na Vercel sem Redis configurado, opera em memória para garantir que login e visualização nunca quebrem
    instance = createMemoryStorage();
  } else {
    instance = createFileStorage();
  }
  return instance;
}
