/**
 * Copia os dados locais (data/database.json) para o Upstash Redis de produção.
 *
 * Uso (PowerShell), com as credenciais copiadas do painel da Vercel → Storage → seu banco → .env.local:
 *   $env:KV_REST_API_URL="https://...upstash.io"; $env:KV_REST_API_TOKEN="..."; npm run migrate:redis
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.error('Defina KV_REST_API_URL e KV_REST_API_TOKEN (ou UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).');
  process.exit(1);
}

const file = path.resolve(process.cwd(), 'data', 'database.json');
if (!fs.existsSync(file)) {
  console.error(`Arquivo não encontrado: ${file}`);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(file, 'utf-8'));
const redis = new Redis({ url, token });

const { quotes = [], ...content } = db;
await redis.set('wort:content', content);

for (const quote of quotes) {
  await redis.hset('wort:quotes', { [quote.id]: quote });
}

console.log(`Migração concluída: conteúdo do site + ${quotes.length} orçamento(s) enviados ao Redis.`);
