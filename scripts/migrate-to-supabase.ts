/**
 * Copia os dados locais (data/database.json) para o Supabase oficial.
 *
 * Uso (PowerShell):
 *   $env:SUPABASE_URL="https://xyz.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="..."; npm run migrate:supabase
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { quoteToSupabaseRow, mapSettingsToSupabase } from '../server/supabaseStorage.js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.SUPABASE_KEY || 
                    process.env.SUPABASE_SECRET_KEY || 
                    process.env.SUPABASE_ANON_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                    process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_KEY).');
  process.exit(1);
}

const file = path.resolve(process.cwd(), 'data', 'database.json');
if (!fs.existsSync(file)) {
  console.error(`Arquivo não encontrado: ${file}`);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(file, 'utf-8'));
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { quotes = [], models = [], plans = [], services = [], settings = {} } = db;

  console.log(`Iniciando migração para Supabase (${supabaseUrl})...`);

  // 1. Migrar configurações
  if (settings && Object.keys(settings).length > 0) {
    const settingsRow = mapSettingsToSupabase(settings);
    const { error: sErr } = await supabase.from('settings').upsert(settingsRow, { onConflict: 'id' });
    if (sErr) console.warn('Aviso ao migrar settings:', sErr.message);
    else console.log('Configurações e credenciais de API migradas com sucesso para tabela settings.');
  }

  // 2. Migrar orçamentos (quotes)
  let countQuotes = 0;
  for (const quote of quotes) {
    const row = quoteToSupabaseRow(quote);
    const { error: qErr } = await supabase.from('quotes').upsert(row, { onConflict: 'id' });
    if (qErr) {
      console.error(`Erro ao migrar quote ${quote.id}:`, qErr.message);
    } else {
      countQuotes++;
    }
  }
  console.log(`${countQuotes} de ${quotes.length} orçamento(s) migrado(s) para tabela quotes.`);

  // 3. Migrar site_content
  try {
    await supabase.from('site_content').upsert([
      { key: 'models', value: models },
      { key: 'plans', value: plans },
      { key: 'services', value: services },
      { key: 'settings', value: settings }
    ], { onConflict: 'key' });
    console.log('Modelos, planos e serviços migrados com sucesso para site_content.');
  } catch (err: any) {
    console.warn('site_content opcional não migrado:', err?.message);
  }

  console.log('Migração para Supabase concluída!');
}

run().catch(console.error);
