-- ==============================================================================
-- Wort Studio — Esquema Oficial do Banco de Dados no Supabase
--
-- Execute este script no SQL Editor do Supabase (supabase.com/dashboard/project/...)
-- para criar todas as tabelas necessárias com as colunas mapeadas perfeitamente.
-- ==============================================================================

-- 1. TABELA DE ORÇAMENTOS / FORMULÁRIOS (LEADS)
CREATE TABLE IF NOT EXISTS public.quotes (
  id TEXT PRIMARY KEY,
  protocol TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  project_type TEXT NOT NULL,
  business_segment TEXT DEFAULT '',
  budget_range TEXT DEFAULT '',
  timeline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  reference_model_id TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  admin_notes TEXT
);

-- Índices para buscas rápidas e ordenação
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes (status);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON public.quotes (email);

-- 2. TABELA DE CONFIGURAÇÕES COMERCIAIS E CREDENCIAIS DE API (ZOHO OAUTH)
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  client_id TEXT,
  client_secret TEXT,
  refresh_token TEXT,
  access_token TEXT,
  account_id TEXT,
  zoho_user TEXT DEFAULT 'wort.studio@aliandre.com.br',
  zoho_pass TEXT,
  zoho_sender_name TEXT DEFAULT 'WortSite Studio',
  zoho_alert_recipient TEXT,
  zoho_auth_type TEXT DEFAULT 'oauth2',
  zoho_host TEXT DEFAULT 'smtp.zoho.com',
  zoho_port INTEGER DEFAULT 465,
  zoho_redirect_uri TEXT,
  admin_password_hash TEXT,
  whatsapp_number TEXT DEFAULT '',
  whatsapp_display TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  business_hours TEXT DEFAULT '',
  address_city TEXT DEFAULT '',
  slogan_principal TEXT DEFAULT '',
  slogan_secundario TEXT DEFAULT '',
  about_text TEXT DEFAULT '',
  content JSONB,
  data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garante pelo menos um registro default inicial
INSERT INTO public.settings (id, zoho_user, zoho_sender_name, zoho_auth_type)
VALUES ('default', 'wort.studio@aliandre.com.br', 'WortSite Studio', 'oauth2')
ON CONFLICT (id) DO NOTHING;

-- 3. TABELA DE CONTEÚDO DINÂMICO DO SITE (MODELOS, PLANOS, SERVIÇOS)
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POLÍTICAS DE ACESSO (RLS)
-- Como a chave 'service_role' ou anon com acesso total é utilizada pelo backend,
-- habilitamos acesso total às operações da plataforma.
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Políticas para quotes
DROP POLICY IF EXISTS "Acesso total a quotes" ON public.quotes;
CREATE POLICY "Acesso total a quotes" ON public.quotes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para settings
DROP POLICY IF EXISTS "Acesso total a settings" ON public.settings;
CREATE POLICY "Acesso total a settings" ON public.settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para site_content
DROP POLICY IF EXISTS "Acesso total a site_content" ON public.site_content;
CREATE POLICY "Acesso total a site_content" ON public.site_content
  FOR ALL
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- 5. TABELAS DO MÓDULO DE ORÇAMENTOS E PROPOSTAS COMERCIAIS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.proposals (
  id TEXT PRIMARY KEY,
  numero TEXT NOT NULL,
  versao INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'rascunho',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_id TEXT,
  client_name TEXT,
  client_document TEXT,
  project_name TEXT,
  total_value NUMERIC(12, 2) DEFAULT 0,
  discount_value NUMERIC(12, 2) DEFAULT 0,
  final_value NUMERIC(12, 2) DEFAULT 0,
  data JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals (status);
CREATE INDEX IF NOT EXISTS idx_proposals_numero ON public.proposals (numero);

CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL DEFAULT 'PJ',
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj_cpf TEXT,
  responsavel TEXT,
  cpf_responsavel TEXT,
  cargo TEXT,
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  endereco TEXT,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_nome ON public.clients (nome);
CREATE INDEX IF NOT EXISTS idx_clients_cnpj_cpf ON public.clients (cnpj_cpf);

CREATE TABLE IF NOT EXISTS public.company_profile (
  id TEXT PRIMARY KEY DEFAULT 'default',
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  cargo TEXT NOT NULL,
  telefone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  site TEXT,
  endereco TEXT NOT NULL,
  data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.company_profile (
  id, razao_social, nome_fantasia, cnpj, responsavel, cargo, telefone, whatsapp, email, site, endereco
) VALUES (
  'default',
  'WORT STUDIO DESENVOLVIMENTO DE SISTEMAS LTDA',
  'Wort Studio',
  '48.123.456/0001-90',
  'Rômulo de Souza',
  'Diretor',
  '(11) 99999-9999',
  '(11) 99999-9999',
  'contato@wortstudio.com.br',
  'www.wortstudio.com.br',
  'Rua das Tecnologias, 123 - Sala 10 - Centro - São Paulo / SP - CEP 01000-000'
) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total a proposals" ON public.proposals;
CREATE POLICY "Acesso total a proposals" ON public.proposals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total a clients" ON public.clients;
CREATE POLICY "Acesso total a clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total a company_profile" ON public.company_profile;
CREATE POLICY "Acesso total a company_profile" ON public.company_profile FOR ALL USING (true) WITH CHECK (true);
