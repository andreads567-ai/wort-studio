import type { DemoModel, PlanItem, ServiceItem, CommercialSettings } from '../types/index.js';

export const INITIAL_SETTINGS: CommercialSettings = {
  whatsappNumber: '5511987654321', // Configurable in the Admin panel
  whatsappDisplay: '(11) 98765-4321',
  contactEmail: 'contato@wortsite.com.br',
  businessHours: 'Segunda a Sexta, das 09h às 18h',
  addressCity: 'São Paulo - SP (Atendimento Nacional Remoto)',
  sloganPrincipal: 'Transforme sua ideia em um site profissional.',
  sloganSecundario: 'Criamos sites, landing pages e páginas de vendas para empresas, profissionais e empreendedores que querem fortalecer sua presença digital.',
  aboutText: 'A WortSite é especializada no desenvolvimento de sites institucionais, landing pages e páginas de vendas de alto padrão. Unimos design contemporâneo, usabilidade intuitiva e código de alta performance para dar autoridade e presença sólida aos negócios de nossos clientes.',
  // Senha padrão original de acesso administrativo (pode ser sobrescrita pela variável ADMIN_PASSWORD na Vercel ou no painel)
  adminPasswordHash: 'Wortsite@admin2026##',
  zohoAuthType: 'oauth2',
  zohoHost: 'smtp.zoho.com',
  zohoPort: 465,
  zohoUser: 'andredesouza@aliandre.com.br',
  zohoPass: '',
  zohoClientId: '',
  zohoClientSecret: '',
  zohoAccountId: '',
  zohoRefreshToken: '',
  zohoAccessToken: '',
  zohoRedirectUri: 'https://wortsite.com.br',
  zohoSenderName: 'WortSite Studio',
  zohoAlertRecipient: 'andredesouza@aliandre.com.br',
  zohoEnabled: true,
};

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'sites-institucionais',
    title: 'Sites Institucionais',
    subtitle: 'Apresentação sólida, autoridade e estrutura corporativa completa',
    iconName: 'Building2',
    shortDescription: 'Apresente sua empresa, seus serviços e seus diferenciais com um site profissional.',
    detailedDescription: 'Estrutura multi-página com arquitetura de informação planejada para transmitir credibilidade e facilitar o contato de potenciais clientes e parceiros.',
    targetAudience: [
      'Empresas de médio e pequeno porte',
      'Escritórios de advocacia, contabilidade e consultoria',
      'Indústrias, construtoras e prestadoras de serviços corporativos',
      'Profissionais liberais que desejam consolidar sua marca'
    ],
    keyFeatures: [
      'Páginas institucionais estruturadas (Início, Quem Somos, Serviços, Portfólio, Contato)',
      'Navegação fluida e design 100% responsivo para celulares e desktops',
      'Integração direta com WhatsApp e formulários de contato',
      'Arquitetura limpa preparada para indexação orgânica',
      'Otimização de carregamento e acessibilidade'
    ],
    practicalExamples: [
      'Apresentação de portfólio de engenharia ou arquitetura',
      'Estrutura digital de consultoria empresarial',
      'Portal institucional de clínica multidisciplinar'
    ],
    scopeNote: 'Inclui apresentação institucional e catálogo demonstrativo. Módulos avançados com área restrita de membros ou sistemas legados são orçados sob medida.'
  },
  {
    id: 'landing-pages',
    title: 'Landing Pages',
    subtitle: 'Foco exclusivo em conversão para campanhas e ofertas direcionadas',
    iconName: 'Zap',
    shortDescription: 'Páginas focadas em divulgar um serviço, captar contatos ou promover uma campanha.',
    detailedDescription: 'Página única orientada a um objetivo específico: captar leads qualificados, agendar reuniões ou direcionar o visitante para um canal de atendimento direto.',
    targetAudience: [
      'Empresas anunciando no Google Ads ou Meta Ads',
      'Prestadores de serviços focados em captação de clientes diretos',
      'Clínicas e estéticas promovendo procedimentos específicos',
      'Negócios lançando um novo produto ou serviço no mercado'
    ],
    keyFeatures: [
      'Estrutura narrativa orientada à clareza da proposta de valor',
      'Gatilhos de contato rápidos (WhatsApp, agendamento ou formulário)',
      'Carregamento ultra-rápido otimizado para tráfego pago',
      'Seções de diferenciais, etapas de contratação e tira-dúvidas',
      'Sem distrações ou links externos desnecessários'
    ],
    practicalExamples: [
      'Captação de leads para serviços de perícia ou assessoria tributária',
      'Divulgação de procedimentos estéticos específicos',
      'Página de captação para eventos corporativos'
    ],
    scopeNote: 'Focada em página única de alta conversão. Adequada para tráfego direto ou anúncios.'
  },
  {
    id: 'paginas-de-vendas',
    title: 'Páginas de Vendas',
    subtitle: 'Comunicação persuasiva e estruturada para produtos e treinamentos',
    iconName: 'TrendingUp',
    shortDescription: 'Para cursos, produtos digitais e serviços, com informações organizadas e chamadas para ação.',
    detailedDescription: 'Apresentação detalhada de soluções educacionais, infoprodutos ou serviços de alto valor, estruturando o programa, módulos, garantias e direcionamento para checkout externo.',
    targetAudience: [
      'Criadores de cursos, mentorias e workshops',
      'Produtores de softwares ou ferramentas digitais',
      'Profissionais vendendo pacotes de consultoria fechados',
      'Autores e especialistas em sua área de atuação'
    ],
    keyFeatures: [
      'Apresentação do método, cronograma ou módulos do produto',
      'Bloco de perfil do especialista e diferenciais da metodologia',
      'Links integrados diretamente com seu checkout de preferência (Hotmart, Kiwify, Eduzz, Stripe, etc.)',
      'Seção de perguntas frequentes estruturada para sanar objeções',
      'Layout atraente e adaptado à leitura em smartphones'
    ],
    practicalExamples: [
      'Página de oferta para masterclasses e treinamentos executivos',
      'Apresentação de toolkit digital ou templates profissionais',
      'Oferta de programa de imersão corporativa'
    ],
    scopeNote: 'Não inclui processamento nativo de pagamentos com carrinho interno. O botão de compra conecta-se ao checkout da plataforma que você utiliza.'
  },
  {
    id: 'projetos-personalizados',
    title: 'Projetos Personalizados',
    subtitle: 'Arquitetura e funcionalidades sob medida para o seu modelo operacional',
    iconName: 'Code2',
    shortDescription: 'Soluções sob medida para necessidades específicas, integrações e funcionalidades.',
    detailedDescription: 'Desenvolvimento específico para projetos que exigem fluxos diferenciados, formulários dinâmicos de múltiplas etapas, catálogos extensos ou integrações sob medida.',
    targetAudience: [
      'Negócios com requisitos técnicos específicos',
      'Empresas que necessitam de integrações com APIs ou CRMs próprios',
      'Portais com múltiplos segmentos ou calculadoras interativas',
      'Projetos que extrapolam a estrutura padrão dos outros planos'
    ],
    keyFeatures: [
      'Levantamento aprofundado de requisitos e prototipagem',
      'Funcionalidades programadas sob medida conforme especificação',
      'Integrações com ferramentas externas e webhooks',
      'Testes rigorosos de usabilidade e segurança',
      'Cronograma e fases de entrega customizadas'
    ],
    practicalExamples: [
      'Simuladores de orçamento ou calculadoras de serviços',
      'Portais institucionais com múltiplos departamentos e filiais',
      'Páginas integradas a sistemas de atendimento e CRM interno'
    ],
    scopeNote: 'Importante: Não confunda uma página de apresentação institucional ou catálogo com uma loja virtual completa (e-commerce). Caso seu negócio precise de carrinho persistente de compras, gestão de frete integrada aos Correios, controle automático de estoque em tempo real ou checkout multi-vendedor, esses recursos devem ser avaliados e tratados com escopo técnico específico.'
  }
];

export const INITIAL_MODELS: DemoModel[] = [
  {
    id: 'modelo-empresa-b2b',
    name: 'Site Institucional',
    slug: 'site-institucional',
    category: 'Empresas',
    shortDescription: 'Ideal para empresas, comércios e prestadores de serviços.',
    description: 'Um modelo refinado com paleta sóbria, hierarquia executiva, seções para portfólio corporativo, áreas de atuação e canais de contato institucionais.',
    targetAudience: 'Empresas B2B, consultorias corporativas, prestadores de serviços de engenharia e logística.',
    accentColor: '#0866FF',
    previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    features: [
      'Hero com apresentação institucional e proposta de valor clara',
      'Grade de serviços com detalhamento de escopo técnico',
      'Linha do tempo corporativa e pilares de atuação',
      'Formulário institucional de contato e localização'
    ],
    recommendedFor: ['Empresas de engenharia', 'Consultoria estratégica', 'Serviços terceirizados', 'Distribuidoras'],
    mockupData: {
      heroTitle: 'Engenharia e Soluções Estratégicas para o Mercado Corporativo',
      heroSubtitle: 'Desenvolvemos projetos de alta complexidade com rigor técnico, governança e conformidade com normas internacionais.',
      ctaText: 'Solicitar Apresentação Técnica',
      sections: [
        {
          title: 'Áreas de Atuação',
          description: 'Soluções integradas com foco em eficiência e governança',
          items: ['Engenharia de Infraestrutura', 'Gestão de Ativos', 'Conformidade Regulatória', 'Sustentabilidade Operacional']
        },
        {
          title: 'Metodologia de Entrega',
          description: 'Processos estruturados do diagnóstico à homologação',
          items: ['1. Diagnóstico e Viabilidade', '2. Planejamento Técnico', '3. Execução Controlada', '4. Homologação e Suporte']
        }
      ]
    }
  },
  {
    id: 'modelo-servicos-especializados',
    name: 'Landing Page',
    slug: 'landing-page-servicos',
    category: 'Serviços profissionais',
    shortDescription: 'Perfeita para divulgar serviços e captar novos clientes.',
    description: 'Foco em clareza imediata do serviço oferecido, resolução de dúvidas frequentes do contratante e canal direto para atendimento via WhatsApp ou agendamento.',
    targetAudience: 'Peritos judiciais, contadores, advogados consultivos, arquitetos e profissionais autônomos.',
    accentColor: '#00CFFF',
    previewImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    features: [
      'Chamada direta focada no problema do cliente',
      'Bloco de credenciais e qualificações do profissional',
      'Passo a passo simplificado de contratação',
      'Botões de contato rápido para WhatsApp sem fricção'
    ],
    recommendedFor: ['Peritos judiciais', 'Consultores tributários', 'Assessores contábeis', 'Avaliadores de imóveis'],
    mockupData: {
      heroTitle: 'Perícia Técnica e Laudos Especializados para Demandas Judiciais',
      heroSubtitle: 'Emissão de laudos periciais com rigor metodológico, atendimento aos prazos processuais e atuação em todo o território nacional.',
      ctaText: 'Falar com o Perito Especialista',
      sections: [
        {
          title: 'Serviços Prestados',
          description: 'Especialidades técnicas para suporte contencioso e extrajudicial',
          items: ['Laudos de Avaliação Patrimonial', 'Perícia Contábil e Financeira', 'Assistência Técnica em Audiências', 'Pareceres Técnicos Conclusivos']
        },
        {
          title: 'Diferenciais de Atuação',
          description: 'Por que profissionais e escritórios contam com este suporte',
          items: ['Cumprimento estrito de prazos legais', 'Embasamento doutrinário atualizado', 'Comunicação direta e assertiva']
        }
      ]
    }
  },
  {
    id: 'modelo-clinica-saude',
    name: 'Clínicas e Profissionais',
    slug: 'clinicas-e-profissionais',
    category: 'Saúde e estética',
    shortDescription: 'Para clínicas, consultórios e profissionais da área da saúde.',
    description: 'Design limpo com ênfase no bem-estar, apresentação do corpo clínico, especialidades médicas, fotos do espaço físico e integração para agendamentos.',
    targetAudience: 'Clínicas médicas, dermatologia, consultórios odontológicos, fisioterapia e nutrição clínica.',
    accentColor: '#0866FF',
    previewImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    features: [
      'Apresentação humanizada dos profissionais e especialidades',
      'Galeria fotográfica de instalações e equipamentos modernos',
      'Orientações sobre consultas e convênios aceitos',
      'Botão de agendamento de consulta via WhatsApp ou telefone'
    ],
    recommendedFor: ['Clínicas odontológicas', 'Dermatologia & estética', 'Ortopedia', 'Psicologia & psiquiatria'],
    mockupData: {
      heroTitle: 'Cuidado Humanizado e Tecnologia em Saúde e Estética Integrada',
      heroSubtitle: 'Ambiente acolhedor com corpo clínico qualificado para proporcionar bem-estar, diagnóstico preciso e tratamentos seguros.',
      ctaText: 'Agendar Horário pelo WhatsApp',
      sections: [
        {
          title: 'Especialidades Médicas',
          description: 'Tratamentos orientados por evidências científicas',
          items: ['Dermatologia Clínica e Estética', 'Harmonização Facial Segura', 'Odontologia Preventiva', 'Medicina Integrativa']
        },
        {
          title: 'Nossa Estrutura',
          description: 'Espaço planejado para seu conforto e privacidade',
          items: ['Salas climatizadas e individualizadas', 'Protocolos rigorosos de biossegurança', 'Estacionamento privativo para pacientes']
        }
      ]
    }
  },
  {
    id: 'modelo-restaurante-comercio',
    name: 'Restaurante e Comércio',
    slug: 'restaurante-e-comercio',
    category: 'Restaurantes e comércios',
    shortDescription: 'Ideal para bares, restaurantes e lojas.',
    description: 'Projetado para encantar pela fotografia, apresentar a proposta gastronômica, disponibilizar o menu completo e facilitar pedidos ou reservas.',
    targetAudience: 'Restaurantes, bistrôs, cafeterias especiais, confeitarias artesanais e empórios.',
    accentColor: '#00CFFF',
    previewImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    features: [
      'Cardápio digital organizado por categorias e harmonizações',
      'Módulo de reservas de mesas ou eventos com link direto',
      'Horários de funcionamento claros e mapa de localização',
      'Apresentação da filosofia da cozinha e ingredientes selecionados'
    ],
    recommendedFor: ['Bistrôs e restaurantes', 'Cafeterias e brunches', 'Hamburguerias artesanais', 'Pizzarias contemporâneas'],
    mockupData: {
      heroTitle: 'Gastronomia Autoral com Ingredientes Locais e Sazonais',
      heroSubtitle: 'Uma experiência sensorial pensada em cada detalhe, combinando técnicas contemporâneas e tradição culinária.',
      ctaText: 'Reservar Mesa / Ver Cardápio',
      sections: [
        {
          title: 'Destaques do Cardápio',
          description: 'Pratos criados pelo nosso chef executivo',
          items: ['Massas frescas artesanais', 'Carnes nobres com crosta de ervas', 'Sobremesas com frutas nativas', 'Carta de vinhos e coquetéis autorais']
        },
        {
          title: 'Horários e Reservas',
          description: 'Esperamos sua visita em nosso espaço acolhedor',
          items: ['Almoço executivo: Terça a Sexta 12h-15h', 'Jantar: Terça a Sábado 19h-23h30', 'Brunch: Domingos 10h-16h']
        }
      ]
    }
  },
  {
    id: 'modelo-cursos-treinamentos',
    name: 'Cursos e Treinamentos',
    slug: 'cursos-e-treinamentos',
    category: 'Cursos e educação',
    shortDescription: 'Para vender cursos, mentorias e treinamentos.',
    description: 'Apresenta a ementa do curso, perfil do instrutor, metodologia aplicada, datas das próximas turmas e botão de inscrição direta.',
    targetAudience: 'Professores, palestrantes, consultores de liderança, institutos de educação corporativa.',
    accentColor: '#0866FF',
    previewImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    features: [
      'Cronograma detalhado módulo por módulo',
      'Perfil e credenciais acadêmicas do instrutor',
      'Certificação concedida e material didático incluso',
      'Chamada para inscrição e canal para tirar dúvidas'
    ],
    recommendedFor: ['Workshops de gestão', 'Cursos de formação executiva', 'Treinamentos de vendas', 'Mentorias de carreira'],
    mockupData: {
      heroTitle: 'Imersão Estratégica em Liderança e Negociação Corporativa',
      heroSubtitle: 'Domine metodologias comprovadas para liderar equipes de alta performance, fechar contratos complexos e acelerar decisões.',
      ctaText: 'Garantir Vaga na Próxima Turma',
      sections: [
        {
          title: 'Conteúdo Programático',
          description: '40 horas de imersão prática com estudos de caso reais',
          items: ['Módulo 1: Fundamentos da Tomada de Decisão', 'Módulo 2: Negociação Baseada em Interesses', 'Módulo 3: Comunicação Assertiva para Líderes', 'Módulo 4: Simulações e Laboratório Prático']
        },
        {
          title: 'O que está incluso',
          description: 'Materiais de apoio completos para sua formação',
          items: ['Apostila e templates editáveis', 'Certificado oficial de conclusão', 'Acesso à comunidade exclusiva de ex-alunos']
        }
      ]
    }
  },
  {
    id: 'modelo-produtos-digitais',
    name: 'Produtos Digitais',
    slug: 'produtos-digitais',
    category: 'Produtos digitais',
    shortDescription: 'Para e-books, templates, softwares e muito mais.',
    description: 'Interface tecnológica limpa destacando funcionalidades do produto, requisitos do sistema, telas do software e link de compra seguro.',
    targetAudience: 'Desenvolvedores independentes, startups early-stage, criadores de templates e ferramentas digitais.',
    accentColor: '#00CFFF',
    previewImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    features: [
      'Apresentação dos recursos e benefícios da ferramenta',
      'Telas ilustrativas com demonstração do fluxo de uso',
      'Perguntas frequentes sobre licenciamento e suporte',
      'Botão de aquisição com redirecionamento para checkout seguro'
    ],
    recommendedFor: ['Templates para produtividade', 'Softwares como serviço (SaaS)', 'Pacotes de plugins', 'Planilhas inteligentes'],
    mockupData: {
      heroTitle: 'O Kit Completo de Automação e Produtividade para Gestores',
      heroSubtitle: 'Economize horas semanais de trabalho operacional com ferramentas pré-configuradas e prontas para uso imediato.',
      ctaText: 'Adquirir Licença de Uso',
      sections: [
        {
          title: 'Recursos Principais',
          description: 'Tudo o que você precisa centralizado em uma única solução',
          items: ['Painel de métricas intuitivo', 'Exportação automática de relatórios', 'Compatibilidade multiplataforma', 'Atualizações contínuas de versão']
        },
        {
          title: 'Licenciamento e Suporte',
          description: 'Transparência total nas condições de uso',
          items: ['Acesso vitalício à versão contratada', 'Documentação passo a passo detalhada', 'Canal de suporte técnico via e-mail']
        }
      ]
    }
  }
];

export const INITIAL_PLANS: PlanItem[] = [
  {
    id: 'plano-landing-page',
    name: 'Landing Page Essencial',
    slug: 'landing-page-essencial',
    subtitle: 'Ideal para campanhas',
    description: 'Estrutura compacta e direta, ideal para quem precisa colocar uma campanha no ar com agilidade e foco na captação de contatos.',
    priceDisplay: 'Sob consulta',
    isPriceCustom: true,
    priceNumber: 890,
    billingPeriod: 'Pagamento único por projeto',
    highlighted: false,
    isAvailable: true,
    estimatedTimeline: '5 a 8 dias úteis após recebimento do briefing',
    deliverables: [
      '1 página com seções definidas',
      'Design responsivo',
      'Botões de contato e WhatsApp',
      'Publicação conforme escopo'
    ],
    serviceLimits: [
      'Não inclui criação de páginas adicionais além da página principal',
      'Não inclui redação técnica de textos complexos (o cliente fornece as informações base)',
      'Não inclui carrinho de compras nem checkout nativo no site'
    ],
    additionalServices: [
      'Produção e refinamento de copywriting comercial',
      'Integração com ferramentas de CRM e automação de e-mail',
      'Página de agradecimento (Thank You Page)'
    ],
    commercialTerms: 'Domínio, hospedagem e eventuais licenças externas dependem das condições de cada contratação.'
  },
  {
    id: 'plano-site-profissional',
    name: 'Site Profissional',
    slug: 'site-profissional',
    subtitle: 'Ideal para empresas',
    description: 'Estrutura multi-páginas completa para fortalecer a imagem corporativa, apresentar portfólio e organizar múltiplos serviços.',
    priceDisplay: 'Sob consulta',
    isPriceCustom: true,
    priceNumber: 1790,
    billingPeriod: 'Pagamento único por projeto',
    highlighted: true,
    isAvailable: true,
    estimatedTimeline: '10 a 18 dias úteis após recebimento do briefing',
    deliverables: [
      'Páginas institucionais conforme escopo',
      'Navegação entre páginas',
      'Layout responsivo',
      'Formulário de contato (quando contratado)'
    ],
    serviceLimits: [
      'Não inclui loja virtual completa com estoque e frete automático',
      'Não inclui área com login de clientes ou painel restrito de usuários',
      'O cliente fornece os dados institucionais e fotos da empresa'
    ],
    additionalServices: [
      'Páginas adicionais de serviços ou áreas',
      'Plano de suporte e manutenção periódica',
      'Treinamento para atualização de conteúdos'
    ],
    commercialTerms: 'Domínio, hospedagem, integrações e manutenção dependem das condições de cada contratação.'
  },
  {
    id: 'plano-projeto-personalizado',
    name: 'Projeto Personalizado',
    slug: 'projeto-personalizado',
    subtitle: 'Solução sob medida',
    description: 'Soluções sob medida para marcas que exigem fluxos diferenciados, catálogos extensos, calculadoras interativas ou integrações com sistemas externos.',
    priceDisplay: 'Sob consulta',
    isPriceCustom: true,
    billingPeriod: 'Definido na proposta conforme escopo',
    highlighted: false,
    isAvailable: true,
    estimatedTimeline: 'Definido na proposta conforme complexidade do escopo',
    deliverables: [
      'Planejamento personalizado',
      'Funcionalidades sob demanda',
      'Integrações avaliadas individualmente',
      'Escopo, prazo e valor por proposta'
    ],
    serviceLimits: [
      'Escopo, prazos e responsabilidades rigorosamente formalizados em proposta técnica antes do início',
      'Funcionalidades que dependem de APIs de terceiros estão sujeitas às políticas dos respectivos fornecedores'
    ],
    additionalServices: [
      'Design system exclusivo',
      'Consultoria de arquitetura da informação',
      'Módulos de integração dedicados'
    ],
    commercialTerms: 'Domínio, hospedagem, manutenção e integrações são medidas conforme proposta contratada.'
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '1',
    title: 'Escolha o serviço',
    description: 'Informe o que deseja criar.'
  },
  {
    step: '2',
    title: 'Briefing',
    description: 'Definimos objetivos, conteúdo, identidade visual e funcionalidades.'
  },
  {
    step: '3',
    title: 'Desenvolvimento',
    description: 'Criamos a página e apresentamos para sua aprovação.'
  },
  {
    step: '4',
    title: 'Publicação',
    description: 'Após a aprovação, seu site é publicado conforme o combinado.'
  }
];

export const DIFFERENTIALS_LIST = [
  {
    title: 'Design alinhado à sua marca',
    description: 'Visual exclusivo e moderno pensado para fortalecer o posicionamento do seu negócio.'
  },
  {
    title: 'Layout adaptado a dispositivos móveis',
    description: 'Navegação fluida e leitura confortável em celulares, tablets e computadores.'
  },
  {
    title: 'Navegação intuitiva e organizada',
    description: 'Estrutura clara para que o visitante encontre rapidamente o que procura.'
  },
  {
    title: 'Páginas conforme seu objetivo',
    description: 'Seções estratégicas desenhadas para gerar contatos e facilitar orçamentos.'
  },
  {
    title: 'Aprovação antes da publicação',
    description: 'Acompanhe as etapas de entrega com validação antes de publicar seu projeto.'
  },
  {
    title: 'Planos e orçamento personalizado',
    description: 'Flexibilidade comercial com escopos claros para cada fase da sua empresa.'
  }
];
