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
