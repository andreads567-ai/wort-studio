import {
  CompanyProfile,
  CommercialProposal,
  ProposalTemplate,
  ScopeModule,
  ClientProfile
} from '../types';

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  razaoSocial: 'WORT STUDIO DESENVOLVIMENTO DE SISTEMAS LTDA',
  nomeFantasia: 'Wort Studio',
  cnpj: '48.123.456/0001-90',
  responsavel: 'Rômulo de Souza',
  cargo: 'Diretor',
  telefone: '(11) 99999-9999',
  whatsapp: '(11) 99999-9999',
  email: 'contato@wortstudio.com.br',
  site: 'www.wortstudio.com.br',
  endereco: 'Rua das Tecnologias, 123 - Sala 10 - Centro - São Paulo / SP - CEP 01000-000'
};

export const SAMPLE_CLIENT: ClientProfile = {
  id: 'client-exemplo-01',
  tipo: 'PJ',
  nome: 'Empresa Exemplo',
  razaoSocial: 'EMPRESA EXEMPLO LTDA',
  cnpjCpf: '12.345.678/0001-99',
  responsavel: 'João da Silva',
  cargo: 'Sócio Administrador',
  telefone: '(11) 98888-8888',
  whatsapp: '(11) 98888-8888',
  email: 'joao@empresaexemplo.com.br',
  endereco: 'Av. Paulista, 1000 - Bela Vista - São Paulo / SP - CEP 01310-100'
};

/**
 * Exemplo Oficial do Escopo Financeiro e Comercial (Conforme Item 8 do documento e Mockup)
 */
export const SAMPLE_FINANCIAL_MODULES: ScopeModule[] = [
  {
    id: 'mod-financeiro',
    codigo: 'MÓDULO 1',
    nome: 'FINANCEIRO',
    descricao: 'Gestão completa das operações financeiras, entradas, saídas e projeções da empresa.',
    objetivo: 'Centralizar o controle financeiro para tomada de decisões estratégicas.',
    observacoes: 'Inclui integração bancária e conciliação por extrato.',
    ordem: 1,
    subescopos: [
      {
        id: 'sub-1-1',
        codigo: '1.1',
        nome: 'CONTAS A PAGAR',
        objetivo: 'Controle de compromissos a quitar com fornecedores e terceiros.',
        descricao:
          'Permitir cadastrar despesas, fornecedores, categorias, valores, datas de vencimento e formas de pagamento. O sistema deverá permitir consultar despesas, editar informações conforme as permissões, registrar pagamentos, identificar contas pendentes e vencidas e emitir alertas de vencimento.',
        acoes: [
          'Cadastrar despesas operacionais e custos fixos',
          'Informar fornecedor, valor, vencimento e categoria contábil',
          'Registrar pagamentos realizados com upload de comprovantes',
          'Controlar pendências e identificar contas vencidas',
          'Permitir anexar comprovantes fiscais e bancários'
        ],
        regras: [
          'Alertar sobre vencimentos prévios via e-mail e painel',
          'Impedir marcar como pago sem informar data e forma de pagamento',
          'Controlar juros e multas por atraso de quitação',
          'Permitir negociação de valores e prazos com histórico',
          'Diferenciar despesas pendentes, pagas, vencidas e canceladas'
        ],
        campos: ['Fornecedor', 'Categoria', 'Valor Original', 'Data de Vencimento', 'Forma de Pagamento', 'Comprovante'],
        validacoes: ['Valor não pode ser negativo ou nulo', 'Data de vencimento obrigatória'],
        alertas: ['Notificação 3 dias antes do vencimento', 'Alerta diário de contas em atraso'],
        criteriosAceite: ['Despesa registrada e listada com status correto', 'Baixa de pagamento gerando comprovante'],
        ordem: 1
      },
      {
        id: 'sub-1-2',
        codigo: '1.2',
        nome: 'CONTAS A RECEBER',
        objetivo: 'Gerenciamento dos recebimentos de clientes e contratos ativos.',
        descricao:
          'Permitir cadastrar receitas, clientes, valores, vencimentos e condições de recebimento. Registrar recebimentos integrais ou parciais, consultar valores pendentes, identificar atrasos e disponibilizar informações para acompanhamento financeiro.',
        acoes: [
          'Cadastrar títulos a receber de clientes e faturas',
          'Informar valor, vencimento e forma de recebimento (PIX, boleto, cartão)',
          'Registrar recebimentos (parciais ou totais)',
          'Consultar valores pendentes por cliente e contrato',
          'Enviar lembretes automáticos de cobrança amigável'
        ],
        regras: [
          'Identificar títulos vencidos e calcular automaticamente juros contratuais',
          'Permitir baixa parcial ou total com recalculo de saldo restante',
          'Controlar juros e multas por atraso',
          'Emissão de recibos e comprovantes automáticos',
          'Histórico completo de conciliação por cliente'
        ],
        campos: ['Cliente', 'Valor Nominal', 'Vencimento', 'Forma de Recebimento', 'Status de Liquidação'],
        validacoes: ['Cliente e vencimento obrigatórios', 'Valor recebido não pode ultrapassar o saldo pendente'],
        alertas: ['Lembrete no dia do vencimento', 'Aviso de cobrança em atraso'],
        criteriosAceite: ['Recebimento registrado com baixa de fatura e emissão de recibo digital'],
        ordem: 2
      },
      {
        id: 'sub-1-3',
        codigo: '1.3',
        nome: 'FLUXO DE CAIXA',
        objetivo: 'Acompanhamento do saldo atual e projeção de entradas e saídas.',
        descricao:
          'Apresentar entradas, saídas, saldo por período e projeções financeiras com base nos lançamentos registrados.',
        acoes: [
          'Visualizar entradas e saídas consolidadas por período',
          'Projeção de fluxo de caixa futuro estimado',
          'Filtros por categoria, conta bancária e centro de custo',
          'Exportação de dados para Excel e PDF'
        ],
        regras: [
          'Saldos atualizados em tempo real conforme liquidações',
          'Projeções baseadas em dados reais de contas a pagar e receber',
          'Permissão por perfil de usuário (sigilo financeiro)',
          'Conciliação de saldos diários e fechamento mensal'
        ],
        campos: ['Período', 'Conta Bancária', 'Entradas Previstas', 'Saídas Previstas', 'Saldo Líquido'],
        criteriosAceite: ['Gráfico e tabela de fluxo de caixa batendo com a soma dos lançamentos do período'],
        ordem: 3
      }
    ]
  },
  {
    id: 'mod-comercial',
    codigo: 'MÓDULO 2',
    nome: 'COMERCIAL',
    descricao: 'Gestão de relacionamento com clientes, oportunidades de venda e pedidos.',
    objetivo: 'Aumentar a conversão e gerenciar o ciclo de vendas da equipe comercial.',
    ordem: 2,
    subescopos: [
      {
        id: 'sub-2-1',
        codigo: '2.1',
        nome: 'CADASTRO DE CLIENTES',
        objetivo: 'Manutenção da base de clientes PF e PJ da empresa.',
        descricao: 'Cadastro detalhado de clientes, contatos, dados fiscais, limite de crédito e histórico de negociações.',
        acoes: [
          'Cadastrar clientes e contatos principais',
          'Informar dados fiscais e comerciais (CNPJ/CPF, Inscrição Estadual)',
          'Classificação por categorias, tags e segmento de mercado'
        ],
        regras: [
          'Validação estrita de CPF/CNPJ com checagem de duplicidade',
          'Evitar duplicidade de cadastros por documento ou e-mail',
          'Controle de limite de crédito pré-aprovado'
        ],
        criteriosAceite: ['Cliente salvo com sucesso e visível nas buscas comerciais'],
        ordem: 1
      },
      {
        id: 'sub-2-2',
        codigo: '2.2',
        nome: 'PROPOSTAS E PEDIDOS',
        objetivo: 'Elaboração e acompanhamento de orçamentos e pedidos de venda.',
        descricao: 'Criação de propostas comerciais personalizadas, conversão em pedidos de venda e disparo automático.',
        acoes: [
          'Criar propostas comerciais estruturadas',
          'Converter propostas aprovadas em pedidos de venda',
          'Acompanhar status dos pedidos em pipeline visual',
          'Envio direto por e-mail e WhatsApp'
        ],
        regras: [
          'Numeração automática e sequencial de propostas',
          'Aprovação prévia antes da conversão para pedido em faturamento',
          'Registro de alterações para auditoria interna'
        ],
        criteriosAceite: ['Proposta gerada em PDF e passível de aprovação digital pelo cliente'],
        ordem: 2
      }
    ]
  }
];

export const SAMPLE_OTHER_MODULES = [
  {
    id: 'mod-3',
    codigo: 'MÓDULO 3',
    nome: 'ESTOQUE',
    descricao: 'Gestão de produtos, entradas, saídas, inventário e relatórios.'
  },
  {
    id: 'mod-4',
    codigo: 'MÓDULO 4',
    nome: 'RELATÓRIOS',
    descricao: 'Relatórios gerenciais, financeiros e indicadores de desempenho.'
  },
  {
    id: 'mod-5',
    codigo: 'MÓDULO 5',
    nome: 'APLICATIVO MOBILE',
    descricao: 'Aplicativo para Android e iOS com funções principais do sistema.'
  },
  {
    id: 'mod-6',
    codigo: 'MÓDULO 6',
    nome: 'CONFIGURAÇÕES',
    descricao: 'Usuários, permissões, parametrizações e integrações.'
  }
];

/**
 * 14 Modelos de Projetos Pré-configurados (Item 9 do Prompt)
 */
export const PROJECT_TEMPLATES: ProposalTemplate[] = [
  {
    id: 'template-erp',
    nome: 'Sistema de Gestão Empresarial (ERP)',
    categoria: 'Sistemas Personalizados',
    descricao: 'Plataforma empresarial robusta com financeiro, comercial, estoque, relatórios e app mobile.',
    modulos: SAMPLE_FINANCIAL_MODULES,
    outrosModulos: SAMPLE_OTHER_MODULES,
    prazosSugeridos: {
      prazoEntrega: '90 dias úteis',
      revisoes: '3 rodadas',
      garantia: '90 dias para ajustes de funcionamento após a entrega.'
    }
  },
  {
    id: 'template-site-institucional',
    nome: 'Site Institucional',
    categoria: 'Websites & Portais',
    descricao: 'Website profissional para posicionamento institucional de autoridade com design de alta conversão.',
    modulos: [
      {
        id: 'mod-inst-1',
        codigo: 'MÓDULO 1',
        nome: 'ESTRUTURA & DESIGN INSTITUCIONAL',
        descricao: 'Arquitetura de informação, identidade visual moderna e páginas de posicionamento.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-inst-1',
            codigo: '1.1',
            nome: 'PÁGINA INICIAL (HOME)',
            descricao: 'Banner hero de alto impacto visual, apresentação da empresa, diferenciais competitivos e chamadas para ação estratégicas.',
            acoes: ['Navegação intuitiva', 'Carrossel interativo de serviços', 'Depoimentos de clientes', 'Integração direta com WhatsApp'],
            regras: ['Responsividade total para smartphones e computadores', 'Tempo de carregamento inferior a 2 segundos', 'SEO estruturado'],
            ordem: 1
          },
          {
            id: 'sub-inst-2',
            codigo: '1.2',
            nome: 'QUEM SOMOS & DIFERENCIAIS',
            descricao: 'História, missão, visão, equipe profissional e certificações de credibilidade.',
            acoes: ['Exibição multimídia com fotos da sede e equipe', 'Timeline interativa de conquistas'],
            regras: ['Layout alinhado com a identidade corporativa'],
            ordem: 2
          },
          {
            id: 'sub-inst-3',
            codigo: '1.3',
            nome: 'CATÁLOGO DE SERVIÇOS / PRODUTOS',
            descricao: 'Exibição detalhada dos serviços com fichas explicativas, fotos e botão de solicitação de orçamento.',
            acoes: ['Filtros por categoria', 'Galeria de fotos de alta definição', 'Botão para cotação rápida'],
            regras: ['Cada serviço com URL própria para indexação no Google'],
            ordem: 3
          }
        ]
      },
      {
        id: 'mod-inst-2',
        codigo: 'MÓDULO 2',
        nome: 'COMUNICAÇÃO & CAPTAÇÃO DE LEADS',
        descricao: 'Canais integrados de contato, formulários seguros e captação de clientes.',
        ordem: 2,
        subescopos: [
          {
            id: 'sub-lead-1',
            codigo: '2.1',
            nome: 'FORMULÁRIO DE ORÇAMENTO & CONTATO',
            descricao: 'Formulário dinâmico com validação em tempo real e notificações automáticas no WhatsApp e e-mail da equipe.',
            acoes: ['Preenchimento amigável', 'Notificação por e-mail e webhook', 'Confirmação visual instantânea'],
            regras: ['Proteção anti-spam (honeypot e validação)', 'Gravação dos leads em banco de dados'],
            ordem: 1
          }
        ]
      }
    ],
    outrosModulos: [
      { id: 'inst-m3', codigo: 'MÓDULO 3', nome: 'PAINEL DE EDIÇÃO (CMS)', descricao: 'Área administrativa para alteração de textos, fotos e telefones.' },
      { id: 'inst-m4', codigo: 'MÓDULO 4', nome: 'OTIMIZAÇÃO SEO & ANALYTICS', descricao: 'Google Analytics 4, Tag Manager e Meta Tags.' }
    ],
    prazosSugeridos: {
      prazoEntrega: '15 a 20 dias úteis',
      revisoes: '3 rodadas',
      garantia: '60 dias de suporte e ajustes pós-publicação.'
    }
  },
  {
    id: 'template-landing-page',
    nome: 'Landing Page de Alta Conversão',
    categoria: 'Marketing & Vendas',
    descricao: 'Página única ultrarrápida focada em capturar leads e impulsionar campanhas pagas (Google/Meta Ads).',
    modulos: [
      {
        id: 'mod-lp-1',
        codigo: 'MÓDULO 1',
        nome: 'EXPERIÊNCIA DE CONVERSÃO',
        descricao: 'Copywriting estratégico, gatilhos mentais e design focado no botão de ação principal.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-lp-1',
            codigo: '1.1',
            nome: 'HERO SECTION COM CTA DIRETO',
            descricao: 'Título magnético, subtítulo explicativo, prova social imediata e formulário de alta conversão.',
            acoes: ['Abertura direta do WhatsApp com mensagem pré-preenchida', 'Envio de dados do lead sem recarregar a tela'],
            regras: ['Carregamento instantâneo', 'Pixel do Facebook e tags de conversão integradas'],
            ordem: 1
          },
          {
            id: 'sub-lp-2',
            codigo: '1.2',
            nome: 'SEÇÃO DE DÚVIDAS (FAQ) & PROVA SOCIAL',
            descricao: 'Perguntas frequentes em acordeão para quebrar objeções e prints de avaliações 5 estrelas do Google.',
            acoes: ['Expansão interativa de dúvidas', 'Carrossel de depoimentos reais'],
            regras: ['Otimização para leitura ágil em celulares'],
            ordem: 2
          }
        ]
      }
    ],
    prazosSugeridos: {
      prazoEntrega: '7 a 10 dias úteis',
      revisoes: '2 rodadas',
      garantia: '30 dias de suporte pós-publicação.'
    }
  },
  {
    id: 'template-loja-virtual',
    nome: 'Loja Virtual (E-commerce)',
    categoria: 'E-commerce & Varejo',
    descricao: 'Plataforma completa de vendas online com catálogo de produtos, carrinho, gateway de pagamento e cálculo de frete.',
    modulos: [
      {
        id: 'mod-ecom-1',
        codigo: 'MÓDULO 1',
        nome: 'CATÁLOGO & CHECKOUT DE VENDAS',
        descricao: 'Gestão de produtos com variações (tamanho/cor), carrinho de compras e checkout transparente.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-ecom-1',
            codigo: '1.1',
            nome: 'CHECKOUT TRANSPARENTE (PIX & CARTÃO)',
            descricao: 'Pagamento integrado via Mercado Pago, Asaas ou PagBank sem redirecionamento externo.',
            acoes: ['Geração instantânea de PIX com QR Code copia-e-cola', 'Parcelamento em até 12x no cartão de crédito'],
            regras: ['Confirmação de pagamento via Webhook em tempo real', 'Atualização automática de estoque'],
            ordem: 1
          },
          {
            id: 'sub-ecom-2',
            codigo: '1.2',
            nome: 'CÁLCULO DE FRETE AUTOMÁTICO',
            descricao: 'Integração com Correios e Melhor Envio para cotação em tempo real pelo CEP.',
            acoes: ['Cálculo de PAC, SEDEX e transportadoras privadas'],
            regras: ['Rastreamento de pedidos integrado'],
            ordem: 2
          }
        ]
      }
    ],
    outrosModulos: [
      { id: 'ecom-m2', codigo: 'MÓDULO 2', nome: 'PAINEL DO CLIENTE', descricao: 'Área restrita para consulta de pedidos e notas fiscais.' },
      { id: 'ecom-m3', codigo: 'MÓDULO 3', nome: 'PAINEL DO LOJISTA', descricao: 'Gestão de vendas, estoque, cupons de desconto e relatórios.' }
    ],
    prazosSugeridos: {
      prazoEntrega: '30 a 45 dias úteis',
      revisoes: '3 rodadas',
      garantia: '90 dias de suporte e ajustes pós-publicação.'
    }
  },
  {
    id: 'template-blog',
    nome: 'Blog & Portal de Conteúdo',
    categoria: 'Mídia & Conteúdo',
    descricao: 'Portal jornalístico ou blog corporativo com categorização, newsletter e sistema de comentários.',
    modulos: [
      {
        id: 'mod-blog-1',
        codigo: 'MÓDULO 1',
        nome: 'GESTÃO EDITORIAL DE ARTIGOS',
        descricao: 'Editor de texto rico, agendamento de postagens, tags e SEO completo.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-blog-1',
            codigo: '1.1',
            nome: 'FEED DE NOTÍCIAS & ARTIGOS',
            descricao: 'Listagem dinâmica com paginação infinita, busca por palavras-chave e artigos recomendados.',
            acoes: ['Compartilhamento em redes sociais', 'Tempo estimado de leitura', 'Comentários moderados'],
            regras: ['Otimização para Google Discover e SEO On-page'],
            ordem: 1
          }
        ]
      }
    ],
    prazosSugeridos: {
      prazoEntrega: '15 a 20 dias úteis',
      revisoes: '2 rodadas',
      garantia: '60 dias de garantia.'
    }
  },
  {
    id: 'template-app-mobile',
    nome: 'Aplicativo Android & iOS',
    categoria: 'Mobile & Apps',
    descricao: 'Aplicativo nativo ou híbrido para Google Play Store e Apple App Store.',
    modulos: [
      {
        id: 'mod-app-1',
        codigo: 'MÓDULO 1',
        nome: 'APLICATIVO DO USUÁRIO',
        descricao: 'Interface moderna, login social, notificações push e funcionamento offline parcial.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-app-1',
            codigo: '1.1',
            nome: 'AUTENTICAÇÃO & PERFIL',
            descricao: 'Login com Google, Apple ID e e-mail com recuperação de senha por SMS/WhatsApp.',
            acoes: ['Cadastro ágil em 2 passos', 'Edição de foto e preferências'],
            regras: ['Criptografia de ponta a ponta', 'Compatibilidade iOS 15+ e Android 10+'],
            ordem: 1
          },
          {
            id: 'sub-app-2',
            codigo: '1.2',
            nome: 'NOTIFICAÇÕES PUSH EM TEMPO REAL',
            descricao: 'Disparo de alertas segmentados via Firebase Cloud Messaging.',
            acoes: ['Abertura direta na tela correspondente pelo push'],
            regras: ['Respeito às diretrizes de privacidade da Apple e Google'],
            ordem: 2
          }
        ]
      }
    ],
    outrosModulos: [
      { id: 'app-m2', codigo: 'MÓDULO 2', nome: 'PUBLICAÇÃO NAS LOJAS', descricao: 'Homologação na Google Play Store e Apple App Store.' },
      { id: 'app-m3', codigo: 'MÓDULO 3', nome: 'PAINEL ADMINISTRATIVO WEB', descricao: 'Gestão de usuários, banners do app e relatórios.' }
    ],
    prazosSugeridos: {
      prazoEntrega: '60 a 90 dias úteis',
      revisoes: '4 rodadas',
      garantia: '120 dias de garantia e manutenção pós-publicação.'
    }
  },
  {
    id: 'template-ead',
    nome: 'Plataforma de Cursos Online (EAD)',
    categoria: 'Educação & Cursos',
    descricao: 'Ambiente virtual de aprendizagem com vídeo-aulas, módulos, quizzes e emissão de certificados.',
    modulos: [
      {
        id: 'mod-ead-1',
        codigo: 'MÓDULO 1',
        nome: 'SALA DE AULA VIRTUAL',
        descricao: 'Player de vídeo protegido anti-pirataria, controle de progresso do aluno e material de apoio.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-ead-1',
            codigo: '1.1',
            nome: 'PLAYER & PROGRESSO DO ALUNO',
            descricao: 'Vídeos com marcação de aula concluída, anotações do aluno e download de PDFs.',
            acoes: ['Velocidade 1.5x e 2x', 'Salvar onde parou'],
            regras: ['Vídeos protegidos contra download indevido'],
            ordem: 1
          },
          {
            id: 'sub-ead-2',
            codigo: '1.2',
            nome: 'EMISSÃO DE CERTIFICADOS DIGITAIS',
            descricao: 'Geração automática de certificado em PDF com código QR de autenticidade ao atingir 100%.',
            acoes: ['Download em PDF de alta qualidade', 'Validador público de certificados'],
            regras: ['Exige aprovação em quiz final com pontuação mínima'],
            ordem: 2
          }
        ]
      }
    ],
    prazosSugeridos: {
      prazoEntrega: '45 a 60 dias úteis',
      revisoes: '3 rodadas',
      garantia: '90 dias de suporte e ajustes.'
    }
  },
  {
    id: 'template-financeiro',
    nome: 'Sistema Financeiro Especializado',
    categoria: 'Sistemas Personalizados',
    descricao: 'Controle de contas a pagar, receber, conciliação bancária OFX, relatórios DRE e fluxo de caixa.',
    modulos: SAMPLE_FINANCIAL_MODULES,
    prazosSugeridos: {
      prazoEntrega: '60 dias úteis',
      revisoes: '3 rodadas',
      garantia: '90 dias de suporte.'
    }
  },
  {
    id: 'template-restaurante',
    nome: 'Site para Restaurantes & Gastronomia',
    categoria: 'Alimentação & Bares',
    descricao: 'Cardápio digital interativo, sistema de pedidos no WhatsApp sem taxas e módulo de reservas de mesas.',
    modulos: [
      {
        id: 'mod-rest-1',
        codigo: 'MÓDULO 1',
        nome: 'CARDÁPIO DIGITAL & PEDIDOS ONLINE',
        descricao: 'Cardápio com fotos suculentas, adicionais, observações e envio do pedido formatado no WhatsApp do restaurante.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-rest-1',
            codigo: '1.1',
            nome: 'CARDÁPIO COM ADICIONAIS & COMBOS',
            descricao: 'Seleção de adicionais (ex: ponto da carne, molhos), cálculo automático do total e taxa de entrega por bairro.',
            acoes: ['Pedido direto sem taxa percentual por venda', 'Opção para retirada no local ou entrega'],
            regras: ['Controle de horário de funcionamento automático'],
            ordem: 1
          }
        ]
      }
    ],
    prazosSugeridos: {
      prazoEntrega: '12 a 15 dias úteis',
      revisoes: '2 rodadas',
      garantia: '60 dias de garantia.'
    }
  },
  {
    id: 'template-construcao',
    nome: 'Site para Construção Civil & Engenharia',
    categoria: 'Construção & Engenharia',
    descricao: 'Portfólio de obras concluídas e em andamento com galeria antes/depois e captação de orçamentos técnicos.',
    modulos: [
      {
        id: 'mod-const-1',
        codigo: 'MÓDULO 1',
        nome: 'PORTFÓLIO DE EMPREENDIMENTOS & OBRAS',
        descricao: 'Ficha técnica da obra, fotos de alta qualidade, localização no mapa e plantas baixas interativas.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-const-1',
            codigo: '1.1',
            nome: 'GALERIA DE OBRAS & STATUS DA CONSTRUÇÃO',
            descricao: 'Acompanhamento do percentual de evolução da obra (Fundação, Estrutura, Acabamento).',
            acoes: ['Gráficos de evolução da obra para compradores'],
            regras: ['Upload facilitado de fotos mensais'],
            ordem: 1
          }
        ]
      }
    ],
    prazosSugeridos: {
      prazoEntrega: '15 a 20 dias úteis',
      revisoes: '2 rodadas',
      garantia: '60 dias de suporte.'
    }
  },
  {
    id: 'template-portal-servicos',
    nome: 'Portal de Serviços & Agendamento',
    categoria: 'Serviços & Atendimento',
    descricao: 'Agendamento online de consultas ou serviços com calendário sincronizado e lembretes automáticos.',
    modulos: [
      {
        id: 'mod-serv-1',
        codigo: 'MÓDULO 1',
        nome: 'SISTEMA DE AGENDAMENTO INTELIGENTE',
        descricao: 'Calendário com horários disponíveis em tempo real e bloqueio automático de conflitos.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-serv-1',
            codigo: '1.1',
            nome: 'CALENDÁRIO & CONFIRMAÇÃO DE HORÁRIOS',
            descricao: 'O cliente escolhe o profissional, data e horário disponível, recebendo confirmação imediata.',
            acoes: ['Lembrete por WhatsApp 2 horas antes do atendimento'],
            regras: ['Sincronização com Google Calendar'],
            ordem: 1
          }
        ]
      }
    ],
    prazosSugeridos: {
      prazoEntrega: '20 a 30 dias úteis',
      revisoes: '3 rodadas',
      garantia: '60 dias de suporte.'
    }
  },
  {
    id: 'template-painel-admin',
    nome: 'Painel Administrativo & Dashboard',
    categoria: 'Sistemas Personalizados',
    descricao: 'Dashboard moderno com métricas em tempo real, gestão de permissões RBAC e auditoria.',
    modulos: [
      {
        id: 'mod-dash-1',
        codigo: 'MÓDULO 1',
        nome: 'DASHBOARD ANALÍTICO & BI',
        descricao: 'Gráficos interativos, KPIs de desempenho e exportação de relatórios.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-dash-1',
            codigo: '1.1',
            nome: 'GRÁFICOS & INDICADORES CHAVE',
            descricao: 'Painel com gráficos em linha, barras e pizza para acompanhamento diário de metas da diretoria.',
            acoes: ['Filtros por período personalizado', 'Exportação em PDF e CSV'],
            regras: ['Atualização de cache rápida para alta volumetria de dados'],
            ordem: 1
          }
        ]
      }
    ],
    prazosSugeridos: {
      prazoEntrega: '30 a 45 dias úteis',
      revisoes: '3 rodadas',
      garantia: '90 dias de suporte.'
    }
  },
  {
    id: 'template-integracao-apis',
    nome: 'Integrações & APIs Personalizadas',
    categoria: 'Backend & Integrações',
    descricao: 'Desenvolvimento de microsserviços, conectores de ERP, webhooks e automações entre plataformas.',
    modulos: [
      {
        id: 'mod-api-1',
        codigo: 'MÓDULO 1',
        nome: 'ARQUITETURA DE INTEGRAÇÃO',
        descricao: 'Endpoints RESTful autenticados, filas de processamento e documentação Swagger/OpenAPI.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-api-1',
            codigo: '1.1',
            nome: 'CONECTORES & SINCRONIZAÇÃO ASSÍNCRONA',
            descricao: 'Troca de dados segura com garantia de entrega e re-tentativa automática em caso de instabilidade.',
            acoes: ['Logs detalhados de requisição e resposta para auditoria'],
            regras: ['Rate limiting e autenticação via Bearer Token / API Key'],
            ordem: 1
          }
        ]
      }
    ],
    prazosSugeridos: {
      prazoEntrega: '20 a 30 dias úteis',
      revisoes: '2 rodadas',
      garantia: '60 dias de garantia.'
    }
  },
  {
    id: 'template-manutencao-suporte',
    nome: 'Manutenção, Suporte & Hospedagem Gerenciada',
    categoria: 'SLA & Recorrente',
    descricao: 'Plano mensal de sustentação técnica com backups diários, atualizações de segurança e horas dedicadas.',
    modulos: [
      {
        id: 'mod-sup-1',
        codigo: 'MÓDULO 1',
        nome: 'SUSTENTAÇÃO & SEGURANÇA CONTÍNUA',
        descricao: 'Monitoramento 24/7 de uptime, atualização periódica de pacotes e correções preventivas.',
        ordem: 1,
        subescopos: [
          {
            id: 'sub-sup-1',
            codigo: '1.1',
            nome: 'SUPORTE TÉCNICO PRIORITÁRIO',
            descricao: 'Atendimento via canal exclusivo de WhatsApp e abertura de chamados com SLA de até 4 horas.',
            acoes: ['Backups diários automatizados e retenção por 30 dias'],
            regras: ['Banco de dados com replicação e certificados SSL renovados automaticamente'],
            ordem: 1
          }
        ]
      }
    ],
    prazosSugeridos: {
      prazoEntrega: 'Contrato Recorrente Mensal / Anual',
      revisoes: 'Inclusas no pacote de horas contratadas',
      garantia: 'Vigência contínua durante a contratação do plano.'
    }
  }
];

/**
 * Cria uma nova proposta comercial pré-preenchida com os dados oficiais da Wort Studio
 * e com o exemplo demonstrativo financeiro da proposta nº 2024-0001
 */
export function createDefaultProposal(customNumero?: string): CommercialProposal {
  const currentYear = new Date().getFullYear();
  const defaultNum = customNumero || `${currentYear}-0001`;
  const todayStr = new Date().toLocaleDateString('pt-BR');

  return {
    id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    numero: defaultNum,
    versao: 1,
    status: 'rascunho',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    empresa: { ...DEFAULT_COMPANY_PROFILE },
    cliente: { ...SAMPLE_CLIENT },
    informacoesProjeto: {
      numeroProposta: defaultNum,
      nomeProjeto: 'Sistema de Gestão Empresarial',
      dataEmissao: todayStr,
      validadeDias: 10,
      prazoEstimado: '90 dias úteis',
      dataPrevistaInicio: 'Após aprovação da proposta e envio de todos os materiais necessários.',
      revisoesIncluidas: '3 rodadas',
      objetivoProjeto:
        'Desenvolver um sistema completo para gestão empresarial, integrando os módulos financeiro, comercial, estoque e relatórios gerenciais, acessível via web e aplicativo mobile.',
      observacoesGerais:
        'O prazo de entrega inicia-se após aprovação da proposta e envio de todos os materiais necessários.'
    },
    modulos: JSON.parse(JSON.stringify(SAMPLE_FINANCIAL_MODULES)),
    outrosModulos: JSON.parse(JSON.stringify(SAMPLE_OTHER_MODULES)),
    financeiro: {
      valorTotal: 28900.0,
      tipoDesconto: 'valor',
      desconto: 1900.0,
      valorFinal: 27000.0,
      formaPagamento: 'cartao',
      parcelas: 6,
      valorParcela: 4500.0,
      valorEntrada: 8100.0,
      condicoesPagamento: [
        'Entrada de 30% para início do projeto',
        'Parcelamento restante conforme opção selecionada',
        'Juros do cartão por conta do cliente',
        'Emissão da nota fiscal após pagamento da entrada'
      ],
      custosRecorrentes: [
        { item: 'Hospedagem em nuvem de alta performance & SSL', valor: 'R$ 180,00', periodo: '/mês' },
        { item: 'Manutenção preventiva & backup automático diário', valor: 'R$ 350,00', periodo: '/mês' }
      ],
      taxasJuros: 'Parcelamento em até 12x no cartão com taxas da operadora.',
      observacoesFinanceiras: 'Hospedagem e domínio identificados separadamente após o término da garantia inicial.'
    },
    prazosGarantia: {
      prazoEntrega: '90 dias úteis após aprovação e envio de materiais.',
      garantia: '90 dias para ajustes de funcionamento após a entrega.',
      condicoesInicio: 'O cronograma inicia-se após a confirmação do pagamento da entrada e entrega do briefing.',
      entregaveis: [
        'Código-fonte completo e documentação técnica',
        'Ambiente de homologação e produção implantados',
        'Treinamento operacional para a equipe',
        'Manual de parametrização e uso do sistema'
      ],
      dependenciasCliente: [
        'Fornecimento de logotipos em vetor e manuais de marca',
        'Definição de representantes para homologação das entregas',
        'Liberação de credenciais de serviços externos necessários'
      ],
      materiaisFornecidos: ['Identidade visual, regras de comissão e tabelas de preços'],
      revisoes: '3 rodadas de ajustes de layout e comportamento incluídas por módulo.',
      suporte: 'Suporte técnico por WhatsApp e e-mail em dias úteis das 09h às 18h.',
      itensNaoIncluidos: [
        'Produção de fotos profissionais de produtos ou ensaios fotográficos',
        'Compra de licenças pagas de softwares de terceiros',
        'Custos de veiculação de anúncios em mídia paga'
      ]
    },
    anexos: [
      {
        id: 'anexo-briefing',
        nome: 'Briefing_do_Projeto.pdf',
        tipo: 'documento',
        url: '#',
        tamanho: 450000,
        mimeType: 'application/pdf',
        incluirNoPdf: true
      },
      {
        id: 'anexo-logo',
        nome: 'Logo_Empresa_Exemplo.png',
        tipo: 'imagem',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
        tamanho: 250000,
        mimeType: 'image/png',
        incluirNoPdf: true
      },
      {
        id: 'anexo-manual',
        nome: 'Manual_Identidade_Visual.pdf',
        tipo: 'documento',
        url: '#',
        tamanho: 1200000,
        mimeType: 'application/pdf',
        incluirNoPdf: true
      }
    ],
    assinaturas: {
      wortStudio: {
        nome: 'Rômulo de Souza',
        cargo: 'Diretor',
        email: 'contato@wortstudio.com.br',
        data: todayStr,
        assinaturaTexto: 'Romulo de Souza'
      },
      cliente: {
        nome: 'João da Silva',
        cargo: 'Sócio Administrador',
        email: 'joao@empresaexemplo.com.br',
        data: todayStr,
        assinaturaTexto: ''
      },
      termosAceite:
        'Ao assinar esta proposta, ambas as partes declaram estar de acordo com o escopo, valores, prazos e condições descritas neste documento.'
    },
    historico: [
      {
        data: new Date().toISOString(),
        usuario: 'Wort Studio (Rômulo de Souza)',
        descricao: 'Criação inicial da proposta comercial.',
        versao: 1
      }
    ]
  };
}
