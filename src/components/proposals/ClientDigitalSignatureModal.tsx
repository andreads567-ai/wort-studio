import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Lock,
  User,
  Mail,
  Briefcase,
  CreditCard,
  PenTool,
  Check
} from 'lucide-react';
import { CommercialProposal } from '../../types';
import { api } from '../../services/api';

interface ClientDigitalSignatureModalProps {
  proposal: CommercialProposal;
  onClose: () => void;
  onApproved: (updatedProposal: CommercialProposal) => void;
}

export const ClientDigitalSignatureModal: React.FC<ClientDigitalSignatureModalProps> = ({
  proposal,
  onClose,
  onApproved
}) => {
  const [nome, setNome] = useState(proposal.cliente.responsavel || proposal.cliente.nome || '');
  const [cargo, setCargo] = useState(proposal.cliente.cargo || 'Representante Legal');
  const [email, setEmail] = useState(proposal.cliente.email || '');
  const [cpf, setCpf] = useState(proposal.cliente.cpfResponsavel || (proposal.cliente.tipo === 'PF' ? proposal.cliente.cnpjCpf : ''));
  const [assinaturaTexto, setAssinaturaTexto] = useState(proposal.cliente.responsavel || proposal.cliente.nome || '');
  const [concordancia, setConcordancia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<{
    hash: string;
    aprovadoEm: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Por favor, informe seu e-mail comercial.');
      return;
    }
    if (!concordancia) {
      setErrorMsg('É obrigatório assinalar a concordância com os termos do contrato e proposta.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.approveProposal(proposal.id, {
        nome: nome.trim(),
        cargo: cargo.trim(),
        email: email.trim(),
        cpf: cpf.trim(),
        assinaturaTexto: (assinaturaTexto || nome).trim(),
        concordancia: true
      });

      if (res.success && res.hash && res.aprovadoEm) {
        setSuccessData({
          hash: res.hash,
          aprovadoEm: res.aprovadoEm
        });
        if (res.proposal) {
          onApproved(res.proposal);
        } else {
          // Atualiza localmente
          const updated: CommercialProposal = {
            ...proposal,
            status: 'aprovada',
            assinaturas: {
              ...proposal.assinaturas,
              cliente: {
                ...proposal.assinaturas.cliente,
                nome: nome.trim(),
                cargo: cargo.trim(),
                email: email.trim(),
                data: new Date().toLocaleDateString('pt-BR'),
                assinaturaTexto: (assinaturaTexto || nome).trim(),
                aprovadoEm: res.aprovadoEm,
                hashAprovacao: res.hash
              }
            }
          };
          onApproved(updated);
        }
      } else {
        setErrorMsg(res.error || 'Erro ao registrar assinatura digital.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha de comunicação ao processar aprovação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0A0F1D] border border-[#1A2844] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#070B16] border-b border-[#141F36]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Aceite & Assinatura Digital</h3>
              <p className="text-[11px] text-slate-400">Proposta {proposal.numero} • Versão {proposal.versao}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        {successData ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">Proposta Aprovada com Sucesso!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              O aceite formal da proposta comercial foi registrado digitalmente com validação jurídica.
            </p>

            <div className="p-3.5 rounded-xl bg-[#060914] border border-[#182642] text-left text-[11px] space-y-1.5 font-mono text-slate-300">
              <div><strong className="text-emerald-400">Status:</strong> APROVADA</div>
              <div><strong className="text-slate-400">Data/Hora:</strong> {new Date(successData.aprovadoEm).toLocaleString('pt-BR')}</div>
              <div><strong className="text-slate-400">Responsável:</strong> {nome} ({cargo})</div>
              <div className="truncate"><strong className="text-slate-400">Hash SHA-256:</strong> {successData.hash}</div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer"
            >
              Concluir & Visualizar Documento Atualizado
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#060A16] border border-[#14213A] flex items-center justify-between text-xs">
              <span className="text-slate-400">Valor Final Contratado:</span>
              <span className="text-base font-black text-[#00CFFF]">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.financeiro.valorFinal)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome Completo *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                    placeholder="João da Silva"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Cargo / Função</label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                    placeholder="Diretor, Sócio Administrador..."
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">E-mail Comercial *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                    placeholder="joao@empresa.com.br"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">CPF do Signatário</label>
                <div className="relative">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Assinatura Digital (Nome / Rubrica Estilizada)
              </label>
              <div className="relative">
                <PenTool className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={assinaturaTexto}
                  onChange={(e) => setAssinaturaTexto(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none font-serif italic text-sm"
                  placeholder="Seu nome como assinatura"
                />
              </div>
            </div>

            {/* Termos de Aceite */}
            <div className="p-3.5 rounded-xl bg-[#070B16] border border-[#182642] space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={concordancia}
                  onChange={(e) => setConcordancia(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-[#0866FF] focus:ring-0 focus:outline-none mt-0.5 shrink-0"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed select-none">
                  Declaro que li e concordo integralmente com o escopo de funcionalidades, prazos de entrega, valores, cronograma e condições comerciais descritas na Proposta Comercial nº <strong>{proposal.numero}</strong>.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-slate-400">
                <Lock className="w-3 h-3 text-emerald-400" />
                Assinatura digital criptografada (SHA-256) com registro de IP
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-300 hover:bg-[#16223C] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !concordancia}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? 'Registrando Aceite...' : 'Aprovar & Assinar Proposta'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
