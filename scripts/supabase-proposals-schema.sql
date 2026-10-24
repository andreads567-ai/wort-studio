-- ==============================================================================
-- Wort Studio — Módulo de Orçamentos e Propostas Comerciais
-- Esquema Oficial para o Banco de Dados no Supabase
--
-- Execute este script no SQL Editor do Supabase (supabase.com/dashboard/project/...)
-- para criar as tabelas dedicadas de propostas, clientes e perfil da empresa.
-- ==============================================================================

-- 1. TABELA DE PROPOSTAS COMERCIAIS
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

-- Índices para buscas ultrarrápidas e filtros
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals (status);
CREATE INDEX IF NOT EXISTS idx_proposals_numero ON public.proposals (numero);
CREATE INDEX IF NOT EXISTS idx_proposals_client_name ON public.proposals (client_name);

-- 2. TABELA DE CLIENTES CADASTRADOS (PF E PJ)
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL DEFAULT 'PJ', -- 'PJ' ou 'PF'
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
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients (created_at DESC);

-- 3. TABELA DE PERFIL DA EMPRESA (WORT STUDIO)
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

-- Inserção padrão da Wort Studio
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

-- 4. POLÍTICAS DE ACESSO (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso total para backend com service_role ou anon com permissão
DROP POLICY IF EXISTS "Acesso total a proposals" ON public.proposals;
CREATE POLICY "Acesso total a proposals" ON public.proposals
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total a clients" ON public.clients;
CREATE POLICY "Acesso total a clients" ON public.clients
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total a company_profile" ON public.company_profile;
CREATE POLICY "Acesso total a company_profile" ON public.company_profile
  FOR ALL
  USING (true)
  WITH CHECK (true);
