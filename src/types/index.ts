export type ProjectType =
  | 'site_institucional'
  | 'landing_page'
  | 'pagina_de_vendas'
  | 'site_comercio'
  | 'pagina_curso'
  | 'projeto_personalizado';

export type ModelCategory =
  | 'Empresas'
  | 'Serviços profissionais'
  | 'Saúde e estética'
  | 'Restaurantes e comércios'
  | 'Cursos e educação'
  | 'Produtos digitais'
  | 'Eventos e campanhas';

export interface DemoModel {
  id: string;
  name: string;
  slug: string;
  category: ModelCategory;
  description: string;
  shortDescription: string;
  targetAudience: string;
  accentColor: string;
  previewImage?: string;
  features: string[];
  recommendedFor: string[];
  mockupData: {
    heroTitle: string;
    heroSubtitle: string;
    ctaText: string;
    sections: {
      title: string;
      description: string;
      items: string[];
    }[];
  };
}

export interface PlanItem {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  priceDisplay: string;
  isPriceCustom: boolean;
  priceNumber?: number;
  billingPeriod: string;
  highlighted?: boolean;
  isAvailable: boolean;
  estimatedTimeline: string;
  deliverables: string[];
  serviceLimits: string[];
  additionalServices: string[];
  commercialTerms: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'Building2' | 'Zap' | 'TrendingUp' | 'Code2';
  shortDescription: string;
  detailedDescription: string;
  targetAudience: string[];
  keyFeatures: string[];
  practicalExamples: string[];
  scopeNote?: string;
}

export interface QuoteRequest {
  id: string;
  protocol: string;
  createdAt: string;
  name: string;
  email: string;
  whatsapp: string;
  projectType: ProjectType;
  businessSegment: string;
  budgetRange: string;
  timeline: string;
  description: string;
  referenceModelId?: string;
  status: 'pendente' | 'em_analise' | 'proposta_enviada' | 'concluido';
  adminNotes?: string;
}

export interface CommercialSettings {
  whatsappNumber: string; // e.g., "5511999999999" (empty by default if not set, configurable in admin)
  whatsappDisplay: string;
  contactEmail: string;
  businessHours: string;
  addressCity: string;
  sloganPrincipal: string;
  sloganSecundario: string;
  aboutText: string;
  adminPasswordHash: string; // simple pin or pass
  // Zoho Mail & API Configuration
  zohoAuthType?: 'smtp' | 'oauth2';
  zohoHost?: string;
  zohoPort?: number;
  zohoUser?: string;
  zohoPass?: string;
  zohoClientId?: string;
  zohoClientSecret?: string;
  zohoAccountId?: string;
  zohoRefreshToken?: string;
  zohoAccessToken?: string;
  zohoRedirectUri?: string;
  zohoSenderName?: string;
  zohoAlertRecipient?: string;
  zohoMailboxAddress?: string;
  zohoEnabled?: boolean;
}

// =============================================================================
// MÓDULO DE ORÇAMENTOS E PROPOSTAS COMERCIAIS (WORT STUDIO)
// =============================================================================

export type ProposalStatus = 'rascunho' | 'enviada' | 'aprovada' | 'recusada' | 'expirada';

export interface CompanyProfile {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  responsavel: string;
  cargo: string;
  telefone: string;
  whatsapp: string;
  email: string;
  site?: string;
  endereco: string;
}

export type ClientType = 'PJ' | 'PF';

export interface ClientProfile {
  id: string;
  tipo: ClientType;
  // Campos comuns
  nome: string; // Nome fantasia ou nome completo PF
  razaoSocial?: string;
  cnpjCpf: string;
  responsavel?: string; // Nome do representante se PJ
  cpfResponsavel?: string;
  cargo?: string;
  telefone: string;
  whatsapp?: string;
  email: string;
  endereco: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscopeItem {
  id: string;
  codigo: string; // Ex: "1.1", "1.2"
  nome: string; // Ex: "Contas a pagar"
  objetivo?: string;
  descricao: string; // Descrição funcional detalhada
  acoes: string[]; // Ações permitidas para o usuário
  regras: string[]; // Regras de negócio e comportamentos
  campos?: string[]; // Campos e informações cadastrados
  validacoes?: string[]; // Validações e restrições
  alertas?: string[]; // Alertas e notificações
  calculos?: string[]; // Cálculos e automatizações
  relatorios?: string[]; // Relatórios necessários
  integracoes?: string[]; // Integrações externas
  criteriosAceite?: string[]; // Critérios de aceite / conclusão
  observacoes?: string;
  ordem: number;
}

export interface ScopeModule {
  id: string;
  codigo: string; // Ex: "MÓDULO 1"
  nome: string; // Ex: "FINANCEIRO"
  descricao?: string;
  objetivo?: string;
  observacoes?: string;
  ordem: number;
  subescopos: SubscopeItem[];
}

export interface ProposalAttachment {
  id: string;
  nome: string;
  tipo: 'imagem' | 'documento';
  url: string;
  tamanho?: number;
  mimeType?: string;
  incluirNoPdf: boolean;
  moduloId?: string;
  subescopoId?: string;
}

export interface ProjectGeneralInfo {
  numeroProposta: string; // Ex: "2024-0001"
  nomeProjeto: string;
  dataEmissao: string;
  validadeDias: number; // Ex: 10
  dataValidade?: string;
  prazoEstimado: string; // Ex: "90 dias úteis"
  dataPrevistaInicio: string; // Ex: "Após aprovação da proposta e envio de materiais"
  revisoesIncluidas: string; // Ex: "3 rodadas"
  objetivoProjeto: string;
  descricaoGeral?: string;
  observacoesGerais: string;
}

export type PaymentMethod =
  | 'pix'
  | 'cartao'
  | 'transferencia'
  | 'boleto'
  | 'etapas'
  | 'personalizado';

export interface FinancialTerms {
  valorTotal: number;
  tipoDesconto: 'valor' | 'porcentagem';
  desconto: number;
  valorFinal: number;
  formaPagamento: PaymentMethod;
  formaPagamentoCustom?: string;
  parcelas: number;
  valorParcela: number;
  valorEntrada?: number;
  condicoesPagamento: string[];
  custosRecorrentes?: {
    item: string;
    valor: string;
    periodo: string; // Ex: "/mês", "/ano"
  }[];
  taxasJuros?: string;
  observacoesFinanceiras?: string;
}

export interface DeliveryAndWarranty {
  prazoEntrega: string;
  garantia: string; // Ex: "90 dias para ajustes de funcionamento após a entrega."
  condicoesInicio?: string;
  entregaveis?: string[];
  dependenciasCliente?: string[];
  materiaisFornecidos?: string[];
  revisoes?: string;
  suporte?: string;
  itensNaoIncluidos?: string[];
}

export interface ProposalSignatures {
  wortStudio: {
    nome: string;
    cargo: string;
    email: string;
    data: string;
    assinaturaTexto: string;
    assinaturaBase64?: string;
  };
  cliente: {
    nome: string;
    cargo: string;
    email: string;
    data: string;
    assinaturaTexto?: string;
    assinaturaBase64?: string;
    aprovadoEm?: string;
    ipAprovacao?: string;
    hashAprovacao?: string;
  };
  termosAceite: string;
}

export interface ProposalHistoryEntry {
  data: string;
  usuario: string;
  descricao: string;
  versao: number;
}

export interface CommercialProposal {
  id: string;
  numero: string; // Ex: "2024-0001"
  versao: number;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  empresa: CompanyProfile;
  cliente: ClientProfile;
  informacoesProjeto: ProjectGeneralInfo;
  modulos: ScopeModule[];
  outrosModulos?: {
    id: string;
    codigo: string;
    nome: string;
    descricao: string;
    icone?: string;
  }[];
  financeiro: FinancialTerms;
  prazosGarantia: DeliveryAndWarranty;
  anexos: ProposalAttachment[];
  assinaturas: ProposalSignatures;
  historico: ProposalHistoryEntry[];
}

export interface ProposalTemplate {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  icone?: string;
  modulos: ScopeModule[];
  outrosModulos?: {
    id: string;
    codigo: string;
    nome: string;
    descricao: string;
    icone?: string;
  }[];
  prazosSugeridos: {
    prazoEntrega: string;
    revisoes: string;
    garantia: string;
  };
}

