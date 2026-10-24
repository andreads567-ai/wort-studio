import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  Edit2,
  Eye,
  Printer,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  AlertTriangle,
  Layers,
  DollarSign,
  Building2,
  Users,
  Calendar,
  Save,
  ArrowLeft,
  ChevronDown,
  Paperclip,
  Share2,
  Sparkles,
  Check,
  History,
  FileCheck2,
  Download,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import {
  CommercialProposal,
  ProposalStatus,
  ClientProfile,
  CompanyProfile,
  PaymentMethod,
  ProposalAttachment
} from '../../types';
import { api } from '../../services/api';
import {
  DEFAULT_COMPANY_PROFILE,
  SAMPLE_CLIENT,
  createDefaultProposal
} from '../../data/proposalTemplates';
import { HierarchicalScopeEditor } from './HierarchicalScopeEditor';
import { ProposalPreviewModal } from './ProposalPreviewModal';
import { ClientDigitalSignatureModal } from './ClientDigitalSignatureModal';
import { CompanyProfileModal } from './CompanyProfileModal';
import { ClientsManagerModal } from './ClientsManagerModal';

export const ProposalsManager: React.FC = () => {
  // Estado principal
  const [proposals, setProposals] = useState<CommercialProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'editor'>('list');
  const [activeEditingProposal, setActiveEditingProposal] = useState<CommercialProposal | null>(null);

  // Filtros e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modais auxiliares
  const [previewProposal, setPreviewProposal] = useState<CommercialProposal | null>(null);
  const [digitalSignatureProposal, setDigitalSignatureProposal] = useState<CommercialProposal | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isClientsModalOpen, setIsClientsModalOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Carrega propostas ao montar
  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setIsLoading(true);
    try {
      const list = await api.getProposals();
      setProposals(list);
    } catch {
      setProposals([createDefaultProposal()]);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // ---------------------------------------------------------------------------
  // Ações de Proposta
  // ---------------------------------------------------------------------------
  const handleStartNewProposal = async () => {
    const currentYear = new Date().getFullYear();
    const countYear = proposals.filter(p => p.numero?.startsWith(String(currentYear))).length;
    const nextSeq = String(countYear + 1).padStart(4, '0');
    const newNum = `${currentYear}-${nextSeq}`;

    let defaultCompany = DEFAULT_COMPANY_PROFILE;
    try {
      defaultCompany = await api.getCompanyProfile();
    } catch {}

    const newProp = createDefaultProposal(newNum);
    newProp.empresa = { ...defaultCompany };
    newProp.informacoesProjeto.nomeProjeto = 'Novo Projeto de Website / Sistema';
    newProp.informacoesProjeto.objetivoProjeto = '';
    newProp.financeiro.valorTotal = 0;
    newProp.financeiro.desconto = 0;
    newProp.financeiro.valorFinal = 0;

    setActiveEditingProposal(newProp);
    setActiveView('editor');
  };

  const handleEditProposal = (prop: CommercialProposal) => {
    setActiveEditingProposal(JSON.parse(JSON.stringify(prop)));
    setActiveView('editor');
  };

  const handleDuplicateProposal = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await api.duplicateProposal(id);
      if (res.success && res.proposal) {
        setProposals(prev => [res.proposal!, ...prev]);
        showNotification(`Proposta duplicada com sucesso com número ${res.proposal.numero}!`);
      } else {
        // Fallback local
        const target = proposals.find(p => p.id === id);
        if (target) {
          const currentYear = new Date().getFullYear();
          const nextSeq = String(proposals.length + 1).padStart(4, '0');
          const cloned: CommercialProposal = JSON.parse(JSON.stringify(target));
          cloned.id = `prop-${Date.now()}`;
          cloned.numero = `${currentYear}-${nextSeq}`;
          cloned.versao = 1;
          cloned.status = 'rascunho';
          cloned.createdAt = new Date().toISOString();
          cloned.updatedAt = new Date().toISOString();
          setProposals(prev => [cloned, ...prev]);
          showNotification(`Proposta clonada: ${cloned.numero}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProposal = async (id: string, numero: string) => {
    if (confirm(`Tem certeza que deseja excluir permanentemente a proposta ${numero}?`)) {
      await api.deleteProposal(id);
      setProposals(prev => prev.filter(p => p.id !== id));
      showNotification(`Proposta ${numero} removida com sucesso.`);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: ProposalStatus) => {
    try {
      await api.updateProposalStatus(id, newStatus);
      setProposals(prev =>
        prev.map(p => (p.id === id ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p))
      );
      showNotification(`Situação da proposta alterada para "${newStatus}".`);
    } catch {
      showNotification('Erro ao atualizar situação.');
    }
  };

  // Salvar Proposta (no formulário)
  const handleSaveCurrentProposal = async (markAsSent = false) => {
    if (!activeEditingProposal) return;

    const toSave: CommercialProposal = {
      ...activeEditingProposal,
      status: markAsSent ? 'enviada' : activeEditingProposal.status,
      updatedAt: new Date().toISOString()
    };

    setIsLoading(true);
    try {
      const exists = proposals.some(p => p.id === toSave.id);
      if (exists) {
        await api.updateProposal(toSave.id, toSave);
        setProposals(prev => prev.map(p => (p.id === toSave.id ? toSave : p)));
        showNotification(`Proposta ${toSave.numero} atualizada com sucesso!`);
      } else {
        await api.saveProposal(toSave);
        setProposals(prev => [toSave, ...prev]);
        showNotification(`Nova proposta ${toSave.numero} salva com sucesso!`);
      }
      setActiveEditingProposal(toSave);
    } catch {
      showNotification('Proposta salva localmente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Recalcular Financeiro automaticamente
  const recalculateFinancial = (total: number, desconto: number, tipoDesc: 'valor' | 'porcentagem', parcelas: number) => {
    if (!activeEditingProposal) return;
    const cleanTotal = Math.max(0, total || 0);
    let valorDesc = Math.max(0, desconto || 0);

    if (tipoDesc === 'porcentagem') {
      valorDesc = (cleanTotal * Math.min(100, valorDesc)) / 100;
    }

    const valorFinal = Math.max(0, cleanTotal - valorDesc);
    const numParcelas = Math.max(1, parcelas || 1);
    const valorParcela = valorFinal / numParcelas;

    setActiveEditingProposal({
      ...activeEditingProposal,
      financeiro: {
        ...activeEditingProposal.financeiro,
        valorTotal: cleanTotal,
        desconto: valorDesc,
        tipoDesconto: tipoDesc,
        valorFinal,
        parcelas: numParcelas,
        valorParcela
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Filtragem de Lista
  // ---------------------------------------------------------------------------
  const filteredProposals = proposals.filter(p => {
    const matchesSearch =
      (p.numero || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.cliente.nome || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.cliente.cnpjCpf || '').includes(searchQuery) ||
      (p.informacoesProjeto.nomeProjeto || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'rascunho':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Rascunho
          </span>
        );
      case 'enviada':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0866FF]/20 text-[#00CFFF] border border-[#0866FF]/40 flex items-center gap-1">
            <Send className="w-3 h-3" />
            Enviada
          </span>
        );
      case 'aprovada':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Aprovada
          </span>
        );
      case 'recusada':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Recusada
          </span>
        );
      case 'expirada':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Expirada
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  // Métricas
  const totalValorAprovado = proposals
    .filter(p => p.status === 'aprovada')
    .reduce((acc, p) => acc + (p.financeiro?.valorFinal || 0), 0);

  const totalValorEmNegociacao = proposals
    .filter(p => p.status === 'enviada' || p.status === 'rascunho')
    .reduce((acc, p) => acc + (p.financeiro?.valorFinal || 0), 0);

  // ---------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Notificação Flutuante */}
      {noticeMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#0C1428] border border-[#00CFFF]/40 text-white text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-[#00CFFF]" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VISTA 1: LISTA DE ORÇAMENTOS E PROPOSTAS COMERCIAIS */}
      {/* ===================================================================== */}
      {activeView === 'list' && (
        <div className="space-y-6">
          {/* Header Superior do Módulo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#090F20] via-[#0C152D] to-[#070B16] border border-[#1A2642] shadow-xl">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-[#0866FF] text-white uppercase tracking-wider">
                  MÓDULO OFICIAL
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Orçamentos e Propostas Comerciais
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#8EA2BC] mt-1">
                Elabore propostas profissionais de alto impacto, gerencie escopo hierárquico, aprove digitalmente e gere documentos em PDF.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsCompanyModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-200 border border-[#1E2E4E] hover:bg-[#182542] hover:text-white transition-all cursor-pointer"
                title="Configurar dados oficiais da Wort Studio para reutilizar em todas as propostas"
              >
                <Building2 className="w-4 h-4 text-[#0866FF]" />
                <span className="hidden sm:inline">Dados da</span> Wort Studio
              </button>

              <button
                type="button"
                onClick={() => setIsClientsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-200 border border-[#1E2E4E] hover:bg-[#182542] hover:text-white transition-all cursor-pointer"
                title="Acessar cadastro completo de clientes"
              >
                <Users className="w-4 h-4 text-[#00CFFF]" />
                Clientes
              </button>

              <button
                type="button"
                onClick={handleStartNewProposal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-lg shadow-[#0866FF]/30 hover:scale-105 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Novo Orçamento
              </button>
            </div>
          </div>

          {/* Cards de Métricas e Desempenho Comercial */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#090D1A] border border-[#162137]">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Total de Propostas</span>
              <div className="text-xl sm:text-2xl font-black text-white">{proposals.length}</div>
              <span className="text-[10px] text-slate-500 mt-1 block">Registradas na plataforma</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090D1A] border border-[#162137]">
              <span className="text-[11px] font-semibold text-emerald-400 block mb-1">Propostas Aprovadas</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {proposals.filter(p => p.status === 'aprovada').length}
              </div>
              <span className="text-[10px] text-emerald-500/80 mt-1 block font-semibold">{formatCurrency(totalValorAprovado)}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090D1A] border border-[#162137]">
              <span className="text-[11px] font-semibold text-[#00CFFF] block mb-1">Em Negociação</span>
              <div className="text-xl sm:text-2xl font-black text-[#00CFFF]">
                {proposals.filter(p => p.status === 'enviada' || p.status === 'rascunho').length}
              </div>
              <span className="text-[10px] text-[#00CFFF]/80 mt-1 block font-semibold">{formatCurrency(totalValorEmNegociacao)}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090D1A] border border-[#162137]">
              <span className="text-[11px] font-semibold text-amber-400 block mb-1">Rascunhos Pendentes</span>
              <div className="text-xl sm:text-2xl font-black text-amber-400">
                {proposals.filter(p => p.status === 'rascunho').length}
              </div>
              <span className="text-[10px] text-amber-500/80 mt-1 block">Aguardando envio ao cliente</span>
            </div>
          </div>

          {/* Barra de Filtros e Busca */}
          <div className="p-4 rounded-2xl bg-[#080D19] border border-[#152035] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-xs text-white placeholder-slate-500 focus:border-[#0866FF] focus:outline-none"
                placeholder="Pesquisar por número da proposta, cliente, CNPJ/CPF ou nome do projeto..."
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Situação:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-xs font-semibold text-white focus:border-[#0866FF] focus:outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="todos">Todos ({proposals.length})</option>
                <option value="rascunho">Rascunhos</option>
                <option value="enviada">Enviadas</option>
                <option value="aprovada">Aprovadas</option>
                <option value="recusada">Recusadas</option>
                <option value="expirada">Expiradas</option>
              </select>
            </div>
          </div>

          {/* Lista de Cartões de Orçamentos */}
          {filteredProposals.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#070B16] border border-[#162137]">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Nenhum orçamento encontrado</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                Não localizamos propostas com os filtros selecionados. Crie uma nova proposta ou ajuste sua pesquisa.
              </p>
              <button
                type="button"
                onClick={handleStartNewProposal}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-lg cursor-pointer"
              >
                Criar Nova Proposta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="p-5 rounded-2xl bg-[#080D19] border border-[#16223A] hover:border-[#0866FF]/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                >
                  {/* Dados Básicos */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#0866FF]/20 text-[#00CFFF] border border-[#0866FF]/30 tracking-wider">
                        Nº {proposal.numero}
                      </span>
                      {getStatusBadge(proposal.status)}
                      <span className="text-[11px] text-slate-400 font-mono">
                        v{proposal.versao} • Emissão: {proposal.informacoesProjeto.dataEmissao}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#00CFFF] transition-colors truncate">
                        {proposal.informacoesProjeto.nomeProjeto}
                      </h3>
                      <div className="text-xs text-[#8EA2BC] flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="font-semibold text-slate-200">
                          {proposal.cliente.nome} {proposal.cliente.razaoSocial && proposal.cliente.razaoSocial !== proposal.cliente.nome ? `(${proposal.cliente.razaoSocial})` : ''}
                        </span>
                        <span>•</span>
                        <span>Doc: {proposal.cliente.cnpjCpf}</span>
                        {proposal.cliente.responsavel && (
                          <>
                            <span>•</span>
                            <span>Resp: {proposal.cliente.responsavel}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#7B8DA5] flex-wrap pt-1">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#0866FF]" />
                        {proposal.modulos?.length || 0} módulos no escopo
                      </span>
                      <span>•</span>
                      <span>Prazo: {proposal.informacoesProjeto.prazoEstimado}</span>
                      <span>•</span>
                      <span>Validade: {proposal.informacoesProjeto.validadeDias} dias</span>
                    </div>
                  </div>

                  {/* Bloco de Valor e Ações */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#141F36]">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Final</span>
                      <span className="text-lg sm:text-xl font-black text-[#00CFFF]">
                        {formatCurrency(proposal.financeiro.valorFinal)}
                      </span>
                      {proposal.financeiro.desconto > 0 && (
                        <span className="text-[11px] text-slate-400 block line-through">
                          {formatCurrency(proposal.financeiro.valorTotal)}
                        </span>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Visualizar Proposta */}
                      <button
                        type="button"
                        onClick={() => setPreviewProposal(proposal)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111A2E] text-[#00CFFF] border border-[#00CFFF]/30 hover:bg-[#00CFFF]/15 transition-all cursor-pointer"
                        title="Visualizar documento em tela cheia e gerar PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualizar</span>
                      </button>

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => handleEditProposal(proposal)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0866FF]/20 text-white border border-[#0866FF]/40 hover:bg-[#0866FF]/40 transition-all cursor-pointer"
                        title="Editar módulos, valores e condições"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      {/* Duplicar */}
                      <button
                        type="button"
                        onClick={() => handleDuplicateProposal(proposal.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#16223A] transition-all cursor-pointer"
                        title="Duplicar proposta com novo número sequencial"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Imprimir Direto */}
                      <button
                        type="button"
                        onClick={() => setPreviewProposal(proposal)}
                        className="p-2 rounded-xl text-slate-400 hover:text-[#00CFFF] hover:bg-[#16223A] transition-all cursor-pointer"
                        title="Gerar PDF oficial"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Mudar Status Rápido */}
                      <div className="relative group/status">
                        <select
                          value={proposal.status}
                          onChange={(e) => handleQuickStatusChange(proposal.id, e.target.value as ProposalStatus)}
                          className="text-[11px] font-semibold bg-[#060914] border border-[#1A2640] text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                        >
                          <option value="rascunho">Rascunho</option>
                          <option value="enviada">Enviada</option>
                          <option value="aprovada">Aprovada</option>
                          <option value="recusada">Recusada</option>
                          <option value="expirada">Expirada</option>
                        </select>
                      </div>

                      {/* Excluir */}
                      <button
                        type="button"
                        onClick={() => handleDeleteProposal(proposal.id, proposal.numero)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer ml-1"
                        title="Excluir proposta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* VISTA 2: FORMULÁRIO COMPLETO DE ELABORAÇÃO / EDIÇÃO DE PROPOSTA */}
      {/* ===================================================================== */}
      {activeView === 'editor' && activeEditingProposal && (
        <div className="space-y-6">
          {/* Barra Superior do Editor */}
          <div className="sticky top-20 z-30 flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#090D1A]/95 backdrop-blur-md border border-[#182642] shadow-2xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-300 hover:text-white hover:bg-[#182642] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar à Lista
              </button>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#00CFFF] block">
                  Elaboração de Proposta Comercial
                </span>
                <h3 className="text-sm font-bold text-white">
                  Nº {activeEditingProposal.numero} • {activeEditingProposal.informacoesProjeto.nomeProjeto}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewProposal(activeEditingProposal)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#111B33] text-[#00CFFF] border border-[#00CFFF]/40 hover:bg-[#00CFFF]/10 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Pré-visualizar Documento
              </button>

              <button
                type="button"
                onClick={() => handleSaveCurrentProposal(false)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-lg shadow-[#0866FF]/25 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Salvando...' : 'Salvar Proposta'}
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SEÇÃO 1 & 4: DADOS DA WORT STUDIO */}
          {/* ================================================================= */}
          <div className="p-6 rounded-2xl bg-[#090E1C] border border-[#172238] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0866FF]" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  1. DADOS DA WORT STUDIO (EMPRESA RESPONSÁVEL)
                </h3>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const prof = await api.getCompanyProfile();
                    setActiveEditingProposal({ ...activeEditingProposal, empresa: prof });
                    showNotification('Dados padrão da Wort Studio carregados.');
                  } catch {}
                }}
                className="text-xs text-[#00CFFF] hover:underline cursor-pointer"
              >
                Restaurar Padrão Oficial
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Razão Social</label>
                <input
                  type="text"
                  value={activeEditingProposal.empresa.razaoSocial}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    empresa: { ...activeEditingProposal.empresa, razaoSocial: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  value={activeEditingProposal.empresa.nomeFantasia}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    empresa: { ...activeEditingProposal.empresa, nomeFantasia: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">CNPJ</label>
                <input
                  type="text"
                  value={activeEditingProposal.empresa.cnpj}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    empresa: { ...activeEditingProposal.empresa, cnpj: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Responsável / Cargo</label>
                <input
                  type="text"
                  value={`${activeEditingProposal.empresa.responsavel} (${activeEditingProposal.empresa.cargo})`}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    empresa: { ...activeEditingProposal.empresa, responsavel: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Endereço Comercial</label>
                <input
                  type="text"
                  value={activeEditingProposal.empresa.endereco}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    empresa: { ...activeEditingProposal.empresa, endereco: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={activeEditingProposal.empresa.telefone}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    empresa: { ...activeEditingProposal.empresa, telefone: e.target.value, whatsapp: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">E-mail Comercial</label>
                <input
                  type="text"
                  value={activeEditingProposal.empresa.email}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    empresa: { ...activeEditingProposal.empresa, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                />
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SEÇÃO 2 & 5: DADOS DO CLIENTE */}
          {/* ================================================================= */}
          <div className="p-6 rounded-2xl bg-[#090E1C] border border-[#172238] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00CFFF]" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  2. DADOS DO CLIENTE
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {/* Seletor PF / PJ */}
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#060A14] border border-[#18253E] text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="tipoClienteEditor"
                      checked={activeEditingProposal.cliente.tipo === 'PJ'}
                      onChange={() => setActiveEditingProposal({
                        ...activeEditingProposal,
                        cliente: { ...activeEditingProposal.cliente, tipo: 'PJ' }
                      })}
                      className="text-[#0866FF]"
                    />
                    <span>Pessoa Jurídica (CNPJ)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="tipoClienteEditor"
                      checked={activeEditingProposal.cliente.tipo === 'PF'}
                      onChange={() => setActiveEditingProposal({
                        ...activeEditingProposal,
                        cliente: { ...activeEditingProposal.cliente, tipo: 'PF' }
                      })}
                      className="text-[#0866FF]"
                    />
                    <span>Pessoa Física (CPF)</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setIsClientsModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111A2E] text-[#00CFFF] border border-[#00CFFF]/40 hover:bg-[#00CFFF]/10 cursor-pointer"
                >
                  Selecionar da Base
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {activeEditingProposal.cliente.tipo === 'PJ' ? (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Razão Social</label>
                    <input
                      type="text"
                      value={activeEditingProposal.cliente.razaoSocial || ''}
                      onChange={(e) => setActiveEditingProposal({
                        ...activeEditingProposal,
                        cliente: { ...activeEditingProposal.cliente, razaoSocial: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                      placeholder="EMPRESA EXEMPLO LTDA"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nome Fantasia *</label>
                    <input
                      type="text"
                      value={activeEditingProposal.cliente.nome || ''}
                      onChange={(e) => setActiveEditingProposal({
                        ...activeEditingProposal,
                        cliente: { ...activeEditingProposal.cliente, nome: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                      placeholder="Empresa Exemplo"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">CNPJ *</label>
                    <input
                      type="text"
                      value={activeEditingProposal.cliente.cnpjCpf || ''}
                      onChange={(e) => setActiveEditingProposal({
                        ...activeEditingProposal,
                        cliente: { ...activeEditingProposal.cliente, cnpjCpf: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Responsável / Cargo</label>
                    <input
                      type="text"
                      value={activeEditingProposal.cliente.responsavel || ''}
                      onChange={(e) => setActiveEditingProposal({
                        ...activeEditingProposal,
                        cliente: { ...activeEditingProposal.cliente, responsavel: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                      placeholder="João da Silva"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={activeEditingProposal.cliente.nome || ''}
                      onChange={(e) => setActiveEditingProposal({
                        ...activeEditingProposal,
                        cliente: { ...activeEditingProposal.cliente, nome: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                      placeholder="Maria de Souza"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">CPF *</label>
                    <input
                      type="text"
                      value={activeEditingProposal.cliente.cnpjCpf || ''}
                      onChange={(e) => setActiveEditingProposal({
                        ...activeEditingProposal,
                        cliente: { ...activeEditingProposal.cliente, cnpjCpf: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={activeEditingProposal.cliente.telefone || ''}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    cliente: { ...activeEditingProposal.cliente, telefone: e.target.value, whatsapp: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                  placeholder="(11) 98888-8888"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">E-mail Comercial</label>
                <input
                  type="text"
                  value={activeEditingProposal.cliente.email || ''}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    cliente: { ...activeEditingProposal.cliente, email: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                  placeholder="joao@empresa.com.br"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={activeEditingProposal.cliente.endereco || ''}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    cliente: { ...activeEditingProposal.cliente, endereco: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                  placeholder="Av. Paulista, 1000 - Bela Vista - São Paulo / SP - CEP 01310-100"
                />
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SEÇÃO 3 & 6: INFORMAÇÕES GERAIS DO PROJETO */}
          {/* ================================================================= */}
          <div className="p-6 rounded-2xl bg-[#090E1C] border border-[#172238] space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0866FF]" />
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                3. INFORMAÇÕES GERAIS DO PROJETO
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Número da Proposta *</label>
                <input
                  type="text"
                  value={activeEditingProposal.numero}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    numero: e.target.value,
                    informacoesProjeto: { ...activeEditingProposal.informacoesProjeto, numeroProposta: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white font-bold focus:outline-none focus:border-[#0866FF]"
                  placeholder="2026-0001"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nome do Projeto *</label>
                <input
                  type="text"
                  value={activeEditingProposal.informacoesProjeto.nomeProjeto}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    informacoesProjeto: { ...activeEditingProposal.informacoesProjeto, nomeProjeto: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white font-semibold focus:outline-none focus:border-[#0866FF]"
                  placeholder="Ex: Sistema de Gestão Empresarial, Website Institucional..."
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Data da Proposta</label>
                <input
                  type="text"
                  value={activeEditingProposal.informacoesProjeto.dataEmissao}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    informacoesProjeto: { ...activeEditingProposal.informacoesProjeto, dataEmissao: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Prazo Estimado de Entrega</label>
                <input
                  type="text"
                  value={activeEditingProposal.informacoesProjeto.prazoEstimado}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    informacoesProjeto: { ...activeEditingProposal.informacoesProjeto, prazoEstimado: e.target.value },
                    prazosGarantia: { ...activeEditingProposal.prazosGarantia, prazoEntrega: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                  placeholder="Ex: 90 dias úteis"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Validade da Proposta (Dias)</label>
                <input
                  type="number"
                  value={activeEditingProposal.informacoesProjeto.validadeDias}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    informacoesProjeto: { ...activeEditingProposal.informacoesProjeto, validadeDias: Number(e.target.value) || 10 }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Revisões Incluídas</label>
                <input
                  type="text"
                  value={activeEditingProposal.informacoesProjeto.revisoesIncluidas}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    informacoesProjeto: { ...activeEditingProposal.informacoesProjeto, revisoesIncluidas: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                  placeholder="3 rodadas"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Objetivo do Projeto</label>
                <textarea
                  rows={2}
                  value={activeEditingProposal.informacoesProjeto.objetivoProjeto}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    informacoesProjeto: { ...activeEditingProposal.informacoesProjeto, objetivoProjeto: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                  placeholder="Finalidade estratégica do desenvolvimento para o cliente..."
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Observações Gerais</label>
                <input
                  type="text"
                  value={activeEditingProposal.informacoesProjeto.observacoesGerais}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    informacoesProjeto: { ...activeEditingProposal.informacoesProjeto, observacoesGerais: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none focus:border-[#0866FF]"
                  placeholder="Ex: O prazo de entrega inicia-se após aprovação da proposta e envio de materiais."
                />
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SEÇÃO 4 & 7: ESCOPO HIERÁRQUICO (EDITOR PRINCIPAL) */}
          {/* ================================================================= */}
          <HierarchicalScopeEditor
            modules={activeEditingProposal.modulos || []}
            onChange={(mods) => setActiveEditingProposal({ ...activeEditingProposal, modulos: mods })}
            outrosModulos={activeEditingProposal.outrosModulos || []}
            onOutrosModulosChange={(outros) => setActiveEditingProposal({ ...activeEditingProposal, outrosModulos: outros })}
          />

          {/* ================================================================= */}
          {/* SEÇÃO 6 & 11: INVESTIMENTO E CONDIÇÕES DE PAGAMENTO */}
          {/* ================================================================= */}
          <div className="p-6 rounded-2xl bg-[#090E1C] border border-[#172238] space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                6. INVESTIMENTO E CONDIÇÕES COMERCIAIS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#070B16] border border-[#182642]">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Valor Total (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={activeEditingProposal.financeiro.valorTotal}
                  onChange={(e) => {
                    const total = parseFloat(e.target.value) || 0;
                    recalculateFinancial(
                      total,
                      activeEditingProposal.financeiro.desconto,
                      activeEditingProposal.financeiro.tipoDesconto,
                      activeEditingProposal.financeiro.parcelas
                    );
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white font-bold text-sm focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Desconto Comercial (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={activeEditingProposal.financeiro.desconto}
                  onChange={(e) => {
                    const desc = parseFloat(e.target.value) || 0;
                    recalculateFinancial(
                      activeEditingProposal.financeiro.valorTotal,
                      desc,
                      activeEditingProposal.financeiro.tipoDesconto,
                      activeEditingProposal.financeiro.parcelas
                    );
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-rose-400 font-bold text-sm focus:outline-none focus:border-[#0866FF]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0C1733] border-2 border-[#0866FF] flex flex-col justify-center text-center">
                <span className="text-[10px] font-bold text-[#00CFFF] uppercase">Valor Final Calculado</span>
                <span className="text-xl font-black text-[#00CFFF]">
                  {formatCurrency(activeEditingProposal.financeiro.valorFinal)}
                </span>
              </div>
            </div>

            {/* Formas de Pagamento (Opções Radio do Prompt) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-white block">Forma de Pagamento Principal:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'pix', label: 'À vista via PIX (com desconto)' },
                  { id: 'cartao', label: 'Cartão de crédito parcelado' },
                  { id: 'transferencia', label: 'Transferência bancária' },
                  { id: 'boleto', label: 'Boleto bancário' },
                  { id: 'etapas', label: 'Entrada + parcelas por etapas' },
                  { id: 'personalizado', label: 'Outra condição negociada' }
                ].map((f) => (
                  <label
                    key={f.id}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      activeEditingProposal.financeiro.formaPagamento === f.id
                        ? 'bg-[#0866FF]/20 border-[#0866FF] text-white font-semibold'
                        : 'bg-[#060A14] border-[#182642] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="formaPagamento"
                      checked={activeEditingProposal.financeiro.formaPagamento === f.id}
                      onChange={() => setActiveEditingProposal({
                        ...activeEditingProposal,
                        financeiro: { ...activeEditingProposal.financeiro, formaPagamento: f.id as PaymentMethod }
                      })}
                      className="text-[#0866FF]"
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>

              {/* Parcelamento no cartão */}
              {activeEditingProposal.financeiro.formaPagamento === 'cartao' && (
                <div className="p-3.5 rounded-xl bg-[#080D1A] border border-[#1A2640] grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Qtd. de Parcelas</label>
                    <select
                      value={activeEditingProposal.financeiro.parcelas}
                      onChange={(e) => {
                        const parc = Number(e.target.value) || 1;
                        recalculateFinancial(
                          activeEditingProposal.financeiro.valorTotal,
                          activeEditingProposal.financeiro.desconto,
                          activeEditingProposal.financeiro.tipoDesconto,
                          parc
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-xs text-white focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18].map(n => (
                        <option key={n} value={n}>{n}x</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">Valor por Parcela</span>
                    <span className="text-sm font-bold text-white">
                      {formatCurrency(activeEditingProposal.financeiro.valorParcela)}
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Valor da Entrada (opcional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={activeEditingProposal.financeiro.valorEntrada || 0}
                      onChange={(e) => setActiveEditingProposal({
                        ...activeEditingProposal,
                        financeiro: { ...activeEditingProposal.financeiro, valorEntrada: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-xs text-white focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* SEÇÃO 7 & 12: PRAZOS, GARANTIA E ENTREGAS */}
          {/* ================================================================= */}
          <div className="p-6 rounded-2xl bg-[#090E1C] border border-[#172238] space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              7. PRAZOS, GARANTIA E CONDIÇÕES DE SUPORTE
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Prazo de Entrega</label>
                <input
                  type="text"
                  value={activeEditingProposal.prazosGarantia.prazoEntrega}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    prazosGarantia: { ...activeEditingProposal.prazosGarantia, prazoEntrega: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none"
                  placeholder="90 dias úteis após aprovação e envio de materiais."
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Garantia Técnica Contratada</label>
                <input
                  type="text"
                  value={activeEditingProposal.prazosGarantia.garantia}
                  onChange={(e) => setActiveEditingProposal({
                    ...activeEditingProposal,
                    prazosGarantia: { ...activeEditingProposal.prazosGarantia, garantia: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-white focus:outline-none"
                  placeholder="90 dias para ajustes de funcionamento após a entrega."
                />
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* SEÇÃO 8 & 10: IMAGENS E DOCUMENTOS ANEXOS */}
          {/* ================================================================= */}
          <div className="p-6 rounded-2xl bg-[#090E1C] border border-[#172238] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-[#00CFFF]" />
                  8. ANEXOS, IMAGENS E DOCUMENTOS DE REFERÊNCIA
                </h3>
                <p className="text-xs text-[#8EA2BC]">
                  Anexe briefings, logotipos, capturas de tela e selecione quais devem constar no PDF.
                </p>
              </div>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-[#00CFFF] border border-[#00CFFF]/40 hover:bg-[#00CFFF]/10 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Adicionar Arquivo</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    Array.from(files).forEach(file => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const newAttachment: ProposalAttachment = {
                          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                          nome: file.name,
                          tipo: file.type.startsWith('image/') ? 'imagem' : 'documento',
                          url: String(reader.result),
                          tamanho: file.size,
                          mimeType: file.type,
                          incluirNoPdf: true
                        };
                        setActiveEditingProposal(prev => prev ? ({
                          ...prev,
                          anexos: [...(prev.anexos || []), newAttachment]
                        }) : null);
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeEditingProposal.anexos?.map((anexo, aIdx) => (
                <div
                  key={anexo.id || aIdx}
                  className="p-3.5 rounded-xl bg-[#060914] border border-[#182642] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Paperclip className="w-4 h-4 text-[#0866FF] shrink-0" />
                    <div className="min-w-0">
                      <span className="font-semibold text-white truncate block">{anexo.nome}</span>
                      <span className="text-[10px] text-slate-500">
                        {anexo.tamanho ? `${Math.round(anexo.tamanho / 1024)} KB` : 'Documento'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer" title="Marcar para aparecer no documento PDF impresso">
                      <input
                        type="checkbox"
                        checked={anexo.incluirNoPdf}
                        onChange={(e) => {
                          const updated = [...activeEditingProposal.anexos];
                          updated[aIdx].incluirNoPdf = e.target.checked;
                          setActiveEditingProposal({ ...activeEditingProposal, anexos: updated });
                        }}
                        className="rounded text-[#0866FF]"
                      />
                      <span>PDF</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = activeEditingProposal.anexos.filter((_, idx) => idx !== aIdx);
                        setActiveEditingProposal({ ...activeEditingProposal, anexos: updated });
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================================================================= */}
          {/* SEÇÃO 9 & 14: ASSINATURAS E APROVAÇÃO */}
          {/* ================================================================= */}
          <div className="p-6 rounded-2xl bg-[#090E1C] border border-[#172238] space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              9. ASSINATURAS E APROVAÇÃO
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#060914] border border-[#182642] space-y-2">
                <span className="text-xs font-bold text-[#0866FF] block uppercase">Representante Wort Studio</span>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Nome / Assinatura</label>
                  <input
                    type="text"
                    value={activeEditingProposal.assinaturas.wortStudio.nome}
                    onChange={(e) => setActiveEditingProposal({
                      ...activeEditingProposal,
                      assinaturas: {
                        ...activeEditingProposal.assinaturas,
                        wortStudio: { ...activeEditingProposal.assinaturas.wortStudio, nome: e.target.value, assinaturaTexto: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F1D] border border-[#1A2844] text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Cargo</label>
                  <input
                    type="text"
                    value={activeEditingProposal.assinaturas.wortStudio.cargo}
                    onChange={(e) => setActiveEditingProposal({
                      ...activeEditingProposal,
                      assinaturas: {
                        ...activeEditingProposal.assinaturas,
                        wortStudio: { ...activeEditingProposal.assinaturas.wortStudio, cargo: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F1D] border border-[#1A2844] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#060914] border border-[#182642] space-y-2">
                <span className="text-xs font-bold text-slate-300 block uppercase">Representante do Cliente</span>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Nome do Responsável</label>
                  <input
                    type="text"
                    value={activeEditingProposal.assinaturas.cliente.nome || ''}
                    onChange={(e) => setActiveEditingProposal({
                      ...activeEditingProposal,
                      assinaturas: {
                        ...activeEditingProposal.assinaturas,
                        cliente: { ...activeEditingProposal.assinaturas.cliente, nome: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F1D] border border-[#1A2844] text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Cargo</label>
                  <input
                    type="text"
                    value={activeEditingProposal.assinaturas.cliente.cargo || ''}
                    onChange={(e) => setActiveEditingProposal({
                      ...activeEditingProposal,
                      assinaturas: {
                        ...activeEditingProposal.assinaturas,
                        cliente: { ...activeEditingProposal.assinaturas.cliente, cargo: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0A0F1D] border border-[#1A2844] text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Termos de Aceite</label>
              <textarea
                rows={2}
                value={activeEditingProposal.assinaturas.termosAceite}
                onChange={(e) => setActiveEditingProposal({
                  ...activeEditingProposal,
                  assinaturas: { ...activeEditingProposal.assinaturas, termosAceite: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl bg-[#060914] border border-[#18253D] text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Botões Finais de Salvamento */}
          <div className="p-4 rounded-2xl bg-[#080D19] border border-[#16223A] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-300 hover:bg-[#182642] cursor-pointer"
            >
              Cancelar e Sair
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setPreviewProposal(activeEditingProposal)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111B33] text-[#00CFFF] border border-[#00CFFF]/40 hover:bg-[#00CFFF]/10 cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                Visualizar Proposta / PDF
              </button>

              <button
                type="button"
                onClick={() => handleSaveCurrentProposal(false)}
                disabled={isLoading}
                className="px-6 py-2 rounded-xl text-xs font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-lg shadow-[#0866FF]/25 cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DE PRÉ-VISUALIZAÇÃO DA PROPOSTA EM TELA CHEIA E GERAÇÃO DE PDF */}
      {/* ===================================================================== */}
      {previewProposal && (
        <ProposalPreviewModal
          proposal={previewProposal}
          onClose={() => setPreviewProposal(null)}
          onOpenDigitalSignature={() => {
            setDigitalSignatureProposal(previewProposal);
            setPreviewProposal(null);
          }}
        />
      )}

      {/* ===================================================================== */}
      {/* MODAL DE ASSINATURA DIGITAL PELO CLIENTE COM AUDITORIA */}
      {/* ===================================================================== */}
      {digitalSignatureProposal && (
        <ClientDigitalSignatureModal
          proposal={digitalSignatureProposal}
          onClose={() => setDigitalSignatureProposal(null)}
          onApproved={(updated) => {
            setProposals(prev => prev.map(p => (p.id === updated.id ? updated : p)));
            if (activeEditingProposal && activeEditingProposal.id === updated.id) {
              setActiveEditingProposal(updated);
            }
            showNotification(`Proposta ${updated.numero} aprovada e assinada digitalmente com sucesso!`);
          }}
        />
      )}

      {/* ===================================================================== */}
      {/* MODAL DE CADASTRO DA WORT STUDIO */}
      {/* ===================================================================== */}
      <CompanyProfileModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSaved={(prof) => {
          if (activeEditingProposal) {
            setActiveEditingProposal({ ...activeEditingProposal, empresa: prof });
          }
          showNotification('Dados da Wort Studio salvos.');
        }}
      />

      {/* ===================================================================== */}
      {/* MODAL DE CADASTRO E SELEÇÃO DE CLIENTES */}
      {/* ===================================================================== */}
      <ClientsManagerModal
        isOpen={isClientsModalOpen}
        onClose={() => setIsClientsModalOpen(false)}
        onSelectClient={(client) => {
          if (activeEditingProposal) {
            setActiveEditingProposal({ ...activeEditingProposal, cliente: client });
            showNotification(`Cliente "${client.nome}" selecionado para a proposta.`);
          }
        }}
      />
    </div>
  );
};
