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
  zohoEnabled?: boolean;
}
