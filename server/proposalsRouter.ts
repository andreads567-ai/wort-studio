import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import type {
  CommercialProposal,
  ClientProfile,
  CompanyProfile
} from '../src/types/index.js';
import { getStorage } from './storage.js';
import { DEFAULT_COMPANY_PROFILE, SAMPLE_CLIENT } from '../src/data/proposalTemplates.js';

interface ProposalsRouterOptions {
  requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
  wrap: (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => void;
  getClientIp: (req: Request) => string;
}

export function createProposalsRouter({ requireAdmin, wrap, getClientIp }: ProposalsRouterOptions): Router {
  const router = Router();

  // =========================================================================
  // 1. DADOS DA EMPRESA (WORT STUDIO)
  // =========================================================================

  router.get('/company-profile', wrap(async (req, res) => {
    const storage = getStorage();
    const profile = await storage.getCompanyProfile();
    res.json(profile || DEFAULT_COMPANY_PROFILE);
  }));

  router.put('/company-profile', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const incoming: CompanyProfile = req.body || {};
    if (!incoming.razaoSocial || !incoming.nomeFantasia) {
      return res.status(400).json({ error: 'Razão Social e Nome Fantasia da empresa são obrigatórios.' });
    }
    await storage.saveCompanyProfile(incoming);
    res.json({ success: true, profile: incoming });
  }));

  // =========================================================================
  // 2. CADASTRO DE CLIENTES (PF / PJ)
  // =========================================================================

  router.get('/clients', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const clients = await storage.listClients();
    res.json(clients);
  }));

  router.post('/clients', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const incoming = req.body || {};
    if (!incoming.nome && !incoming.razaoSocial) {
      return res.status(400).json({ error: 'Informe o nome do cliente ou razão social.' });
    }

    const newClient: ClientProfile = {
      id: incoming.id || `cli-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tipo: incoming.tipo || (incoming.cnpjCpf && incoming.cnpjCpf.length > 14 ? 'PJ' : 'PF'),
      nome: String(incoming.nome || incoming.razaoSocial || '').trim(),
      razaoSocial: incoming.razaoSocial ? String(incoming.razaoSocial).trim() : undefined,
      cnpjCpf: String(incoming.cnpjCpf || '').trim(),
      responsavel: incoming.responsavel ? String(incoming.responsavel).trim() : undefined,
      cpfResponsavel: incoming.cpfResponsavel ? String(incoming.cpfResponsavel).trim() : undefined,
      cargo: incoming.cargo ? String(incoming.cargo).trim() : undefined,
      telefone: String(incoming.telefone || '').trim(),
      whatsapp: String(incoming.whatsapp || incoming.telefone || '').trim(),
      email: String(incoming.email || '').trim(),
      endereco: String(incoming.endereco || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await storage.saveClient(newClient);
    res.status(201).json(newClient);
  }));

  router.put('/clients/:id', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const current = await storage.getClient(req.params.id);
    if (!current) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    const updated: ClientProfile = {
      ...current,
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    await storage.saveClient(updated);
    res.json(updated);
  }));

  router.delete('/clients/:id', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const ok = await storage.deleteClient(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Cliente não encontrado.' });
    res.json({ success: true, id: req.params.id });
  }));

  // =========================================================================
  // 3. ORÇAMENTOS E PROPOSTAS COMERCIAIS
  // =========================================================================

  router.get('/proposals', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const proposals = await storage.listProposals();
    res.json(proposals);
  }));

  router.get('/proposals/:id', wrap(async (req, res) => {
    const storage = getStorage();
    const proposal = await storage.getProposal(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposta comercial não encontrada.' });
    }
    res.json(proposal);
  }));

  router.post('/proposals', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const incoming = req.body || {};
    const existing = await storage.listProposals();

    const currentYear = new Date().getFullYear();
    let numero = incoming.numero;
    if (!numero) {
      const yearProposals = existing.filter(p => p.numero?.startsWith(String(currentYear)));
      const nextSeq = yearProposals.length + 1;
      numero = `${currentYear}-${String(nextSeq).padStart(4, '0')}`;
    }

    const defaultCompany = await storage.getCompanyProfile();

    const newProposal: CommercialProposal = {
      id: incoming.id || `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      numero,
      versao: 1,
      status: incoming.status || 'rascunho',
      createdAt: incoming.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      empresa: incoming.empresa || defaultCompany,
      cliente: incoming.cliente || SAMPLE_CLIENT,
      informacoesProjeto: {
        numeroProposta: numero,
        nomeProjeto: incoming.informacoesProjeto?.nomeProjeto || 'Novo Projeto Digital',
        dataEmissao: incoming.informacoesProjeto?.dataEmissao || new Date().toLocaleDateString('pt-BR'),
        validadeDias: incoming.informacoesProjeto?.validadeDias || 10,
        prazoEstimado: incoming.informacoesProjeto?.prazoEstimado || '30 dias úteis',
        dataPrevistaInicio: incoming.informacoesProjeto?.dataPrevistaInicio || 'Após aprovação da proposta e envio de materiais',
        revisoesIncluidas: incoming.informacoesProjeto?.revisoesIncluidas || '3 rodadas',
        objetivoProjeto: incoming.informacoesProjeto?.objetivoProjeto || '',
        descricaoGeral: incoming.informacoesProjeto?.descricaoGeral || '',
        observacoesGerais: incoming.informacoesProjeto?.observacoesGerais || ''
      },
      modulos: Array.isArray(incoming.modulos) ? incoming.modulos : [],
      outrosModulos: Array.isArray(incoming.outrosModulos) ? incoming.outrosModulos : [],
      financeiro: incoming.financeiro || {
        valorTotal: 0,
        tipoDesconto: 'valor',
        desconto: 0,
        valorFinal: 0,
        formaPagamento: 'pix',
        parcelas: 1,
        valorParcela: 0,
        condicoesPagamento: []
      },
      prazosGarantia: incoming.prazosGarantia || {
        prazoEntrega: '30 dias úteis',
        garantia: '90 dias para ajustes de funcionamento após a entrega.'
      },
      anexos: Array.isArray(incoming.anexos) ? incoming.anexos : [],
      assinaturas: incoming.assinaturas || {
        wortStudio: {
          nome: defaultCompany.responsavel || 'Rômulo de Souza',
          cargo: defaultCompany.cargo || 'Diretor',
          email: defaultCompany.email || 'contato@wortstudio.com.br',
          data: new Date().toLocaleDateString('pt-BR'),
          assinaturaTexto: defaultCompany.responsavel || 'Rômulo de Souza'
        },
        cliente: {
          nome: incoming.cliente?.responsavel || incoming.cliente?.nome || '',
          cargo: incoming.cliente?.cargo || 'Representante Legal',
          email: incoming.cliente?.email || '',
          data: new Date().toLocaleDateString('pt-BR')
        },
        termosAceite:
          'Ao assinar esta proposta, ambas as partes declaram estar de acordo com o escopo, valores, prazos e condições descritas neste documento.'
      },
      historico: [
        {
          data: new Date().toISOString(),
          usuario: 'Administrador Wort Studio',
          descricao: `Criação da proposta comercial ${numero} (v1).`,
          versao: 1
        }
      ]
    };

    await storage.saveProposal(newProposal);
    res.status(201).json(newProposal);
  }));

  router.put('/proposals/:id', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const current = await storage.getProposal(req.params.id);
    if (!current) {
      return res.status(404).json({ error: 'Proposta comercial não encontrada.' });
    }

    const incoming: CommercialProposal = req.body || {};
    let newVersion = current.versao || 1;
    let historyEntryDesc = 'Atualização de conteúdo da proposta.';

    // Requisito 14: Preservar versão imutável se já estava aprovada
    if (current.status === 'aprovada' && incoming.status !== 'aprovada') {
      newVersion += 1;
      historyEntryDesc = `Revisão de proposta aprovada anteriormente (nova versão ${newVersion}).`;
    }

    const updatedProposal: CommercialProposal = {
      ...current,
      ...incoming,
      id: req.params.id,
      versao: newVersion,
      updatedAt: new Date().toISOString(),
      historico: [
        ...(current.historico || []),
        {
          data: new Date().toISOString(),
          usuario: 'Administrador Wort Studio',
          descricao: historyEntryDesc,
          versao: newVersion
        }
      ]
    };

    await storage.saveProposal(updatedProposal);
    res.json(updatedProposal);
  }));

  // Duplicar proposta
  router.post('/proposals/:id/duplicate', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const original = await storage.getProposal(req.params.id);
    if (!original) {
      return res.status(404).json({ error: 'Proposta original não encontrada para duplicação.' });
    }

    const currentYear = new Date().getFullYear();
    const existing = await storage.listProposals();
    const yearProposals = existing.filter(p => p.numero?.startsWith(String(currentYear)));
    const nextSeq = yearProposals.length + 1;
    const newNumero = `${currentYear}-${String(nextSeq).padStart(4, '0')}`;

    const cloned: CommercialProposal = JSON.parse(JSON.stringify(original));
    cloned.id = `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    cloned.numero = newNumero;
    cloned.versao = 1;
    cloned.status = 'rascunho';
    cloned.createdAt = new Date().toISOString();
    cloned.updatedAt = new Date().toISOString();
    cloned.informacoesProjeto.numeroProposta = newNumero;
    cloned.informacoesProjeto.dataEmissao = new Date().toLocaleDateString('pt-BR');
    if (cloned.assinaturas?.cliente) {
      cloned.assinaturas.cliente.assinaturaTexto = '';
      cloned.assinaturas.cliente.assinaturaBase64 = undefined;
      cloned.assinaturas.cliente.aprovadoEm = undefined;
      cloned.assinaturas.cliente.ipAprovacao = undefined;
      cloned.assinaturas.cliente.hashAprovacao = undefined;
    }
    cloned.historico = [
      {
        data: new Date().toISOString(),
        usuario: 'Administrador Wort Studio',
        descricao: `Duplicada a partir da proposta original ${original.numero}.`,
        versao: 1
      }
    ];

    await storage.saveProposal(cloned);
    res.status(201).json(cloned);
  }));

  // Alterar situação
  router.patch('/proposals/:id/status', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const proposal = await storage.getProposal(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposta não encontrada.' });
    }

    const { status, motivo } = req.body || {};
    if (!status) {
      return res.status(400).json({ error: 'Informe a nova situação da proposta.' });
    }

    proposal.status = status;
    proposal.updatedAt = new Date().toISOString();
    proposal.historico = proposal.historico || [];
    proposal.historico.push({
      data: new Date().toISOString(),
      usuario: 'Administrador Wort Studio',
      descricao: `Situação alterada para "${status}". ${motivo ? `Motivo: ${motivo}` : ''}`.trim(),
      versao: proposal.versao || 1
    });

    await storage.saveProposal(proposal);
    res.json(proposal);
  }));

  // Aprovação e Assinatura Digital com Validade Jurídica
  router.post('/proposals/:id/approve', wrap(async (req, res) => {
    const storage = getStorage();
    const proposal = await storage.getProposal(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposta comercial não encontrada.' });
    }

    const { nome, cargo, email, cpf, assinaturaTexto, assinaturaBase64, concordancia } = req.body || {};

    if (!concordancia) {
      return res.status(400).json({ error: 'É necessário concordar com os termos e escopo para aprovar a proposta.' });
    }

    if (!nome) {
      return res.status(400).json({ error: 'Nome do responsável pela aprovação é obrigatório.' });
    }

    const ip = getClientIp(req);
    const nowIso = new Date().toISOString();

    const docSummary = `${proposal.id}:${proposal.numero}:v${proposal.versao}:${proposal.financeiro.valorFinal}:${nome}:${cpf || ''}:${nowIso}:${ip}`;
    const hash = crypto.createHash('sha256').update(docSummary).digest('hex');

    proposal.status = 'aprovada';
    proposal.updatedAt = nowIso;
    proposal.assinaturas.cliente = {
      ...proposal.assinaturas.cliente,
      nome: String(nome).trim(),
      cargo: String(cargo || proposal.assinaturas.cliente?.cargo || 'Representante Legal').trim(),
      email: String(email || proposal.assinaturas.cliente?.email || '').trim(),
      data: new Date().toLocaleDateString('pt-BR'),
      assinaturaTexto: String(assinaturaTexto || nome).trim(),
      assinaturaBase64: assinaturaBase64 || proposal.assinaturas.cliente?.assinaturaBase64,
      aprovadoEm: nowIso,
      ipAprovacao: ip,
      hashAprovacao: hash
    };

    proposal.historico = proposal.historico || [];
    proposal.historico.push({
      data: nowIso,
      usuario: `Cliente (${nome})`,
      descricao: `Proposta aceita e assinada digitalmente com validade jurídica (IP: ${ip}, Hash: ${hash.slice(0, 16)}...).`,
      versao: proposal.versao || 1
    });

    await storage.saveProposal(proposal);
    console.log(`[Proposals] Proposta ${proposal.numero} aprovada digitalmente pelo cliente: ${nome} (IP: ${ip})`);

    res.json({
      success: true,
      message: 'Proposta comercial aprovada com sucesso!',
      proposal,
      hash,
      aprovadoEm: nowIso
    });
  }));

  router.delete('/proposals/:id', requireAdmin, wrap(async (req, res) => {
    const storage = getStorage();
    const ok = await storage.deleteProposal(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Proposta não encontrada.' });
    res.json({ success: true, id: req.params.id });
  }));

  return router;
}
