import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle,
  Clock,
  Send,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FileText,
  Calendar,
  Layers,
  DollarSign,
  ShieldCheck,
  Paperclip
} from 'lucide-react';
import { CommercialProposal } from '../../types';
import { Logo } from '../Logo';
import { QrCodeSvg } from './QrCodeSvg';

interface ProposalPreviewModalProps {
  proposal: CommercialProposal;
  onClose: () => void;
  onOpenDigitalSignature?: () => void;
}

export const ProposalPreviewModal: React.FC<ProposalPreviewModalProps> = ({
  proposal,
  onClose,
  onOpenDigitalSignature
}) => {
  const [selectedViewPage, setSelectedViewPage] = useState<'all' | number>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const proposalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?proposta=${proposal.id}`
    : `https://wortstudio.com.br?proposta=${proposal.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(proposalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  // Cálculo da quantidade de páginas para rodapé dinâmico
  // Página 1: Identificação e Dados Gerais
  // Páginas de Escopo: Geralmente 1 a 2 páginas dependendo dos módulos
  // Última Página: Condições Comerciais, Anexos e Assinaturas
  const totalPages = proposal.modulos.length > 2 ? 4 : 3;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between overflow-hidden">
      {/* Barra de Ferramentas Superior (Não aparece na impressão) */}
      <header className="print:hidden h-16 px-4 sm:px-8 bg-[#070B16] border-b border-[#1A2640] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Logo variant="icon" className="h-7 w-auto" />
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              Visualização da Proposta Comercial
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0866FF]/20 text-[#00CFFF] border border-[#0866FF]/40">
                {proposal.numero}
              </span>
            </h2>
            <p className="text-[11px] text-[#8C9EB5] hidden sm:block">
              {proposal.cliente.nome} • {proposal.informacoesProjeto.nomeProjeto}
            </p>
          </div>
        </div>

        {/* Controles de Navegação de Página e Ações */}
        <div className="flex items-center gap-2">
          {/* Seletor de páginas */}
          <div className="hidden md:flex items-center bg-[#0D1528] rounded-xl p-1 border border-[#1A2947] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedViewPage('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedViewPage === 'all'
                  ? 'bg-[#0866FF] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas as Páginas
            </button>
            <button
              type="button"
              onClick={() => setSelectedViewPage(1)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedViewPage === 1
                  ? 'bg-[#0866FF] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Página 1
            </button>
            <button
              type="button"
              onClick={() => setSelectedViewPage(2)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedViewPage === 2
                  ? 'bg-[#0866FF] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Página 2
            </button>
            <button
              type="button"
              onClick={() => setSelectedViewPage(3)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedViewPage === 3
                  ? 'bg-[#0866FF] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Página 3
            </button>
          </div>

          {/* Botão Copiar Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111B33] text-[#00CFFF] border border-[#00CFFF]/30 hover:bg-[#00CFFF]/10 transition-colors cursor-pointer"
            title="Copiar link de acesso para o cliente"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>

          {/* Botão Aceite Digital (se não aprovada) */}
          {onOpenDigitalSignature && proposal.status !== 'aprovada' && (
            <button
              type="button"
              onClick={onOpenDigitalSignature}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Assinar Digitalmente</span>
            </button>
          )}

          {/* Botão Imprimir / Gerar PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-lg shadow-[#0866FF]/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>

          {/* Fechar */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A2640] transition-colors cursor-pointer ml-1"
            title="Fechar visualização"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Área do Documento com Scroll e Folhas A4 Estilizadas */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#03050A] flex flex-col items-center gap-8 print:p-0 print:bg-white print:overflow-visible">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: #FFFFFF !important;
              color: #05070D !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            .a4-page {
              width: 100% !important;
              max-width: 100% !important;
              min-height: 297mm !important;
              margin: 0 !important;
              padding: 14mm 16mm !important;
              box-shadow: none !important;
              border: none !important;
              background-color: #FFFFFF !important;
              color: #0F172A !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
            }
            .a4-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}} />

        <div ref={printAreaRef} className="w-full flex flex-col items-center gap-8 print:gap-0">
          {/* ================================================================= */}
          {/* PÁGINA 1 — IDENTIFICAÇÃO E DADOS GERAIS */}
          {/* ================================================================= */}
          {(selectedViewPage === 'all' || selectedViewPage === 1) && (
            <div className="a4-page w-full max-w-[210mm] min-h-[297mm] bg-white text-[#0F172A] p-8 sm:p-12 shadow-2xl rounded-sm flex flex-col justify-between border border-slate-200 print:shadow-none print:border-none print:rounded-none">
              <div className="space-y-6">
                {/* Header Superior da Página 1 (Mockup Exato) */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <Logo variant="full" className="h-10 sm:h-12 w-auto" />
                  </div>
                  <div className="text-right">
                    <h1 className="text-xl sm:text-2xl font-black text-[#0A1633] tracking-tight uppercase">
                      PROPOSTA COMERCIAL
                    </h1>
                    <div className="text-xs sm:text-sm font-bold text-[#0866FF] tracking-wider uppercase">
                      ORÇAMENTO DE PROJETO
                    </div>
                    <div className="inline-block mt-1 px-3 py-0.5 rounded border border-[#0866FF] text-[#0866FF] text-xs font-bold tracking-widest bg-blue-50/50">
                      Nº {proposal.numero}
                    </div>
                  </div>
                </div>

                {/* 1. DADOS DA WORT STUDIO */}
                <div className="rounded-lg overflow-hidden border border-[#0A1633]">
                  <div className="bg-[#0A1633] px-4 py-1.5 text-white text-xs font-extrabold uppercase tracking-wider">
                    1. DADOS DA WORT STUDIO
                  </div>
                  <div className="p-3.5 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Razão Social:</span>
                      <span className="text-slate-900 font-medium">{proposal.empresa.razaoSocial}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Nome Fantasia:</span>
                      <span className="text-slate-900 font-medium">{proposal.empresa.nomeFantasia}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">CNPJ:</span>
                      <span className="text-slate-900 font-medium">{proposal.empresa.cnpj}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Responsável:</span>
                      <span className="text-slate-900 font-medium">{proposal.empresa.responsavel} ({proposal.empresa.cargo})</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Telefone / WhatsApp:</span>
                      <span className="text-slate-900 font-medium">{proposal.empresa.telefone}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">E-mail:</span>
                      <span className="text-slate-900 font-medium">{proposal.empresa.email}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Endereço:</span>
                      <span className="text-slate-900 font-medium">{proposal.empresa.endereco}</span>
                    </div>
                  </div>
                </div>

                {/* 2. DADOS DO CLIENTE */}
                <div className="rounded-lg overflow-hidden border border-[#0A1633]">
                  <div className="bg-[#0A1633] px-4 py-1.5 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
                    <span>2. DADOS DO CLIENTE</span>
                    <span className="text-[10px] font-semibold text-blue-200">
                      {proposal.cliente.tipo === 'PJ' ? 'Pessoa Jurídica (CNPJ)' : 'Pessoa Física (CPF)'}
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">
                        {proposal.cliente.tipo === 'PJ' ? 'Razão Social:' : 'Nome Completo:'}
                      </span>
                      <span className="text-slate-900 font-medium">
                        {proposal.cliente.razaoSocial || proposal.cliente.nome}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Nome Fantasia:</span>
                      <span className="text-slate-900 font-medium">{proposal.cliente.nome}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">
                        {proposal.cliente.tipo === 'PJ' ? 'CNPJ:' : 'CPF:'}
                      </span>
                      <span className="text-slate-900 font-medium">{proposal.cliente.cnpjCpf}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Responsável / Cargo:</span>
                      <span className="text-slate-900 font-medium">
                        {proposal.cliente.responsavel || proposal.cliente.nome} {proposal.cliente.cargo ? `(${proposal.cliente.cargo})` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Telefone / WhatsApp:</span>
                      <span className="text-slate-900 font-medium">{proposal.cliente.telefone}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">E-mail:</span>
                      <span className="text-slate-900 font-medium">{proposal.cliente.email}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Endereço:</span>
                      <span className="text-slate-900 font-medium">{proposal.cliente.endereco}</span>
                    </div>
                  </div>
                </div>

                {/* 3. INFORMAÇÕES DO PROJETO */}
                <div className="rounded-lg overflow-hidden border border-[#0A1633]">
                  <div className="bg-[#0A1633] px-4 py-1.5 text-white text-xs font-extrabold uppercase tracking-wider">
                    3. INFORMAÇÕES DO PROJETO
                  </div>
                  <div className="p-3.5 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Nome do Projeto:</span>
                      <span className="text-slate-900 font-bold text-sm">{proposal.informacoesProjeto.nomeProjeto}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Data da Proposta:</span>
                      <span className="text-slate-900 font-medium">{proposal.informacoesProjeto.dataEmissao}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Prazo Estimado de Entrega:</span>
                      <span className="text-slate-900 font-medium">{proposal.informacoesProjeto.prazoEstimado}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Quantidade de Revisões Incluídas:</span>
                      <span className="text-slate-900 font-medium">{proposal.informacoesProjeto.revisoesIncluidas}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Objetivo do Projeto:</span>
                      <p className="text-slate-900 font-normal leading-relaxed text-xs mt-0.5">
                        {proposal.informacoesProjeto.objetivoProjeto}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Observações Gerais:</span>
                      <p className="text-slate-800 italic text-[11px] mt-0.5">
                        {proposal.informacoesProjeto.observacoesGerais}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rodapé Oficial da Página 1 */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-[#0A1633]">{proposal.empresa.nomeFantasia}</span>
                  <span>•</span>
                  <span>{proposal.empresa.email}</span>
                  <span>•</span>
                  <span>{proposal.empresa.telefone}</span>
                </div>
                <div className="font-semibold text-slate-700">
                  Página 1 de {totalPages}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* PÁGINA 2 — ESCOPO DO PROJETO (MÓDULOS E SUBESCOPOS DETALHADOS) */}
          {/* ================================================================= */}
          {(selectedViewPage === 'all' || selectedViewPage === 2) && (
            <div className="a4-page w-full max-w-[210mm] min-h-[297mm] bg-white text-[#0F172A] p-8 sm:p-12 shadow-2xl rounded-sm flex flex-col justify-between border border-slate-200 print:shadow-none print:border-none print:rounded-none">
              <div className="space-y-5">
                {/* Cabeçalho da Seção 4 */}
                <div className="pb-3 border-b-2 border-[#0A1633] flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-[#0A1633] uppercase tracking-wide">
                      4. ESCOPO DO PROJETO
                    </h2>
                    <p className="text-xs text-slate-500">
                      Detalhamento dos módulos (escopos) e funcionalidades (subescopos) contratadas.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#0866FF]">Nº {proposal.numero}</span>
                  </div>
                </div>

                {/* Módulos do Escopo Principal */}
                {proposal.modulos.map((modulo, mIdx) => (
                  <div key={modulo.id || mIdx} className="rounded-lg overflow-hidden border border-[#0A1633]">
                    {/* Header do Módulo (Azul-Marinho) */}
                    <div className="bg-[#0A1633] px-4 py-1.5 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
                      <span>{modulo.codigo}: {modulo.nome}</span>
                      {modulo.subescopos && (
                        <span className="text-[10px] text-blue-200 font-normal">
                          {modulo.subescopos.length} funcionalidades
                        </span>
                      )}
                    </div>

                    {/* Tabela de Subescopos (Funcionalidades) — Mockup Exato */}
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100/80 border-b border-slate-300 text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                          <th className="py-2 px-3 w-[28%] border-r border-slate-200">SUBESCOPO (FUNCIONALIDADE)</th>
                          <th className="py-2 px-3 w-[42%] border-r border-slate-200">DESCRIÇÃO DETALHADA</th>
                          <th className="py-2 px-3 w-[30%]">REGRAS E COMPORTAMENTOS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {modulo.subescopos.map((sub, sIdx) => (
                          <tr key={sub.id || sIdx} className="align-top">
                            {/* Coluna 1: Subescopo / Funcionalidade */}
                            <td className="py-2.5 px-3 border-r border-slate-200 bg-slate-50/40">
                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded bg-[#0866FF]/15 border border-[#0866FF]/30 flex items-center justify-center text-[#0866FF] shrink-0 mt-0.5">
                                  <FileText className="w-3 h-3" />
                                </div>
                                <div>
                                  <div className="font-extrabold text-[#0A1633] text-[11px] leading-tight">
                                    {sub.codigo} {sub.nome}
                                  </div>
                                  {sub.objetivo && (
                                    <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                                      {sub.objetivo}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Coluna 2: Descrição Detalhada */}
                            <td className="py-2.5 px-3 border-r border-slate-200 text-[11px] leading-relaxed text-slate-700">
                              {sub.descricao && (
                                <p className="mb-1 text-slate-800">{sub.descricao}</p>
                              )}
                              {sub.acoes && sub.acoes.length > 0 && (
                                <ul className="space-y-0.5 list-disc list-inside text-[10.5px] text-slate-600">
                                  {sub.acoes.map((acao, aIdx) => (
                                    <li key={aIdx}>{acao}</li>
                                  ))}
                                </ul>
                              )}
                            </td>

                            {/* Coluna 3: Regras e Comportamentos */}
                            <td className="py-2.5 px-3 text-[11px] text-slate-700">
                              {sub.regras && sub.regras.length > 0 ? (
                                <ul className="space-y-0.5 list-disc list-inside text-[10.5px] text-slate-600">
                                  {sub.regras.map((regra, rIdx) => (
                                    <li key={rIdx}>{regra}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Padrões de boas práticas</span>
                              )}

                              {sub.criteriosAceite && sub.criteriosAceite.length > 0 && (
                                <div className="mt-1.5 pt-1.5 border-t border-slate-200 text-[10px]">
                                  <span className="font-bold text-emerald-700 block">Critério de Aceite:</span>
                                  <ul className="list-disc list-inside text-emerald-800">
                                    {sub.criteriosAceite.map((c, cIdx) => (
                                      <li key={cIdx}>{c}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {/* Rodapé Oficial da Página 2 */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-[#0A1633]">{proposal.empresa.nomeFantasia}</span>
                  <span>•</span>
                  <span>{proposal.empresa.email}</span>
                  <span>•</span>
                  <span>{proposal.empresa.site || 'www.wortstudio.com.br'}</span>
                </div>
                <div className="font-semibold text-slate-700">
                  Página 2 de {totalPages}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* PÁGINA 3 — OUTROS MÓDULOS, CONDIÇÕES, PRAZO, ANEXOS E ASSINATURAS */}
          {/* ================================================================= */}
          {(selectedViewPage === 'all' || selectedViewPage === 3) && (
            <div className="a4-page w-full max-w-[210mm] min-h-[297mm] bg-white text-[#0F172A] p-8 sm:p-12 shadow-2xl rounded-sm flex flex-col justify-between border border-slate-200 print:shadow-none print:border-none print:rounded-none">
              <div className="space-y-4">
                {/* 5. OUTROS MÓDULOS INCLUÍDOS */}
                {proposal.outrosModulos && proposal.outrosModulos.length > 0 && (
                  <div className="rounded-lg overflow-hidden border border-[#0A1633]">
                    <div className="bg-[#0A1633] px-4 py-1.5 text-white text-xs font-extrabold uppercase tracking-wider">
                      5. OUTROS MÓDULOS INCLUÍDOS
                    </div>
                    <div className="p-3 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {proposal.outrosModulos.map((m, idx) => (
                        <div key={m.id || idx} className="p-2 rounded bg-white border border-slate-200 flex items-start gap-2">
                          <Layers className="w-4 h-4 text-[#0866FF] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900 block text-[11px]">{m.codigo}: {m.nome}</span>
                            <span className="text-[10px] text-slate-600 leading-snug">{m.descricao}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. INVESTIMENTO E CONDIÇÕES COMERCIAIS */}
                <div className="rounded-lg overflow-hidden border border-[#0A1633]">
                  <div className="bg-[#0A1633] px-4 py-1.5 text-white text-xs font-extrabold uppercase tracking-wider">
                    6. INVESTIMENTO E CONDIÇÕES
                  </div>
                  <div className="p-4 bg-slate-50/60 space-y-3">
                    {/* Tabela de Valores / Totais */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Valor Total do Projeto</span>
                        <span className="text-sm font-extrabold text-slate-800">
                          {formatCurrency(proposal.financeiro.valorTotal)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Desconto</span>
                        <span className="text-sm font-extrabold text-rose-600">
                          {formatCurrency(proposal.financeiro.desconto)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-blue-50/80 border-2 border-[#0866FF]">
                        <span className="text-[10px] font-bold text-[#0866FF] uppercase block">Valor Final</span>
                        <span className="text-base font-black text-[#0866FF]">
                          {formatCurrency(proposal.financeiro.valorFinal)}
                        </span>
                      </div>
                    </div>

                    {/* Forma de Pagamento e Condições */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <span className="font-bold text-slate-800 text-[11px] uppercase block mb-1">
                          Forma de Pagamento Selecionada:
                        </span>
                        <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-800 space-y-1">
                          <div className="font-bold text-[#0866FF] flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {proposal.financeiro.formaPagamento === 'pix' && 'À vista via PIX (com desconto)'}
                            {proposal.financeiro.formaPagamento === 'cartao' && `Cartão de Crédito (${proposal.financeiro.parcelas}x de ${formatCurrency(proposal.financeiro.valorParcela)})`}
                            {proposal.financeiro.formaPagamento === 'transferencia' && 'Transferência Bancária / TED'}
                            {proposal.financeiro.formaPagamento === 'boleto' && 'Boleto Bancário'}
                            {proposal.financeiro.formaPagamento === 'etapas' && 'Entrada + parcelas por etapas de entrega'}
                            {proposal.financeiro.formaPagamento === 'personalizado' && (proposal.financeiro.formaPagamentoCustom || 'Condições Negociadas')}
                          </div>
                          {proposal.financeiro.valorEntrada && proposal.financeiro.valorEntrada > 0 ? (
                            <div className="text-[11px] text-slate-600">
                              Entrada: <span className="font-semibold">{formatCurrency(proposal.financeiro.valorEntrada)}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-slate-800 text-[11px] uppercase block mb-1">
                          Condições Negociadas:
                        </span>
                        <ul className="p-2 rounded bg-white border border-slate-200 list-disc list-inside text-[10.5px] text-slate-700 space-y-0.5">
                          {proposal.financeiro.condicoesPagamento?.map((cond, cIdx) => (
                            <li key={cIdx}>{cond}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. PRAZO E GARANTIA */}
                <div className="rounded-lg overflow-hidden border border-[#0A1633]">
                  <div className="bg-[#0A1633] px-4 py-1.5 text-white text-xs font-extrabold uppercase tracking-wider">
                    7. PRAZO E GARANTIA
                  </div>
                  <div className="p-3 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#0866FF] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block text-[11px]">Prazo de Entrega:</span>
                        <span className="text-slate-700">{proposal.prazosGarantia.prazoEntrega}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block text-[11px]">Garantia Técnica:</span>
                        <span className="text-slate-700">{proposal.prazosGarantia.garantia}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 8. ANEXOS E REFERÊNCIAS */}
                {proposal.anexos && proposal.anexos.filter(a => a.incluirNoPdf).length > 0 && (
                  <div className="rounded-lg overflow-hidden border border-[#0A1633]">
                    <div className="bg-[#0A1633] px-4 py-1.5 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
                      <span>8. ANEXOS E DOCUMENTOS</span>
                      <span className="text-[10px] text-blue-200">
                        {proposal.anexos.filter(a => a.incluirNoPdf).length} documento(s) vinculado(s)
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50/60 flex flex-wrap gap-2 text-xs">
                      {proposal.anexos.filter(a => a.incluirNoPdf).map((anexo, aIdx) => (
                        <div
                          key={anexo.id || aIdx}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2 text-slate-800"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-[#0866FF]" />
                          <span className="font-medium text-[11px]">{anexo.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. ASSINATURAS E APROVAÇÃO */}
                <div className="rounded-lg overflow-hidden border border-[#0A1633]">
                  <div className="bg-[#0A1633] px-4 py-1.5 text-white text-xs font-extrabold uppercase tracking-wider">
                    9. ASSINATURAS E APROVAÇÃO
                  </div>
                  <div className="p-4 bg-slate-50/60 space-y-3.5">
                    <p className="text-[11px] text-slate-600 italic">
                      {proposal.assinaturas.termosAceite}
                    </p>

                    {/* Blocos de Assinatura */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Bloco Wort Studio */}
                      <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2">
                        <span className="text-[11px] font-bold text-[#0866FF] uppercase block tracking-wider">
                          WORT STUDIO
                        </span>
                        <div className="text-xs space-y-0.5 text-slate-800">
                          <div><strong>Responsável:</strong> {proposal.assinaturas.wortStudio.nome}</div>
                          <div><strong>Cargo:</strong> {proposal.assinaturas.wortStudio.cargo}</div>
                          <div><strong>E-mail:</strong> {proposal.assinaturas.wortStudio.email}</div>
                          <div><strong>Data:</strong> {proposal.assinaturas.wortStudio.data}</div>
                        </div>
                        {/* Assinatura Cursiva Estilizada */}
                        <div className="pt-2 border-t border-slate-200 text-center">
                          <span className="font-serif italic text-lg sm:text-xl text-[#0A1633] font-bold tracking-wider select-none">
                            {proposal.assinaturas.wortStudio.assinaturaTexto || proposal.empresa.responsavel}
                          </span>
                        </div>
                      </div>

                      {/* Bloco Cliente */}
                      <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase block tracking-wider">
                          CLIENTE
                        </span>
                        <div className="text-xs space-y-0.5 text-slate-800">
                          <div><strong>Responsável:</strong> {proposal.assinaturas.cliente.nome || proposal.cliente.responsavel || proposal.cliente.nome}</div>
                          <div><strong>Cargo:</strong> {proposal.assinaturas.cliente.cargo || 'Representante'}</div>
                          <div><strong>E-mail:</strong> {proposal.assinaturas.cliente.email || proposal.cliente.email}</div>
                          <div><strong>Data:</strong> {proposal.assinaturas.cliente.data || proposal.informacoesProjeto.dataEmissao}</div>
                        </div>
                        {/* Assinatura do Cliente */}
                        <div className="pt-2 border-t border-slate-200 text-center min-h-[36px] flex items-center justify-center">
                          {proposal.status === 'aprovada' && proposal.assinaturas.cliente.assinaturaTexto ? (
                            <div className="space-y-0.5">
                              <span className="font-serif italic text-base font-bold text-emerald-700">
                                {proposal.assinaturas.cliente.assinaturaTexto}
                              </span>
                              <div className="text-[9px] text-emerald-600 font-semibold">
                                Aceito digitalmente • Hash: {proposal.assinaturas.cliente.hashAprovacao?.slice(0, 16)}...
                              </div>
                            </div>
                          ) : (
                            <div className="w-full border-b border-dashed border-slate-400 mt-4 text-[10px] text-slate-400">
                              Assinatura do Representante Legal do Cliente
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Validade da Proposta & QR Code de Aceite Digital (Mockup Exato) */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-600 font-medium">
                        <strong>Validade da Proposta:</strong> {proposal.informacoesProjeto.validadeDias} dias a partir da data de emissão.
                      </div>

                      {/* Card Escuro de Aceite Digital com QR Code */}
                      <div className="p-2.5 rounded-xl bg-[#0A1633] text-white flex items-center gap-3 shadow-md max-w-sm">
                        <div className="text-[10px] leading-tight text-slate-200">
                          Aceite esta proposta de forma digital escaneando o QR Code ao lado ou solicitando o link.
                        </div>
                        <QrCodeSvg
                          value={proposalUrl}
                          size={64}
                          fgColor="#0A1633"
                          bgColor="#FFFFFF"
                          className="shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rodapé Oficial da Página 3 */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-[#0A1633]">{proposal.empresa.nomeFantasia}</span>
                  <span>•</span>
                  <span>{proposal.empresa.email}</span>
                  <span>•</span>
                  <span>{proposal.empresa.site || 'www.wortstudio.com.br'}</span>
                </div>
                <div className="font-semibold text-slate-700">
                  Página 3 de {totalPages}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
