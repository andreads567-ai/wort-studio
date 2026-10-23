import React, { useEffect } from 'react';
import { X, MessageCircle, ShieldCheck, Check } from 'lucide-react';
import { QuoteRequest, CommercialSettings } from '../types';
import { buildWhatsAppUrl } from '../services/api';
import { SuccessCheckmark } from './SuccessCheckmark';

interface SuccessQuoteModalProps {
  quote: QuoteRequest | null;
  isOpen: boolean;
  onClose: () => void;
  settings: CommercialSettings;
}

export const SuccessQuoteModal: React.FC<SuccessQuoteModalProps> = ({
  quote,
  isOpen,
  onClose,
  settings
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !quote) return null;

  const whatsAppMessage = `Olá, Wort Studio! Acabei de enviar uma solicitação de proposta no site:\n\n*Protocolo:* ${quote.protocol}\n*Nome:* ${quote.name}\n*Tipo:* ${quote.projectType}\n*Segmento:* ${quote.businessSegment || 'Geral'}\n\nGostaria de dar sequência ao atendimento!`;
  const whatsAppUrl = buildWhatsAppUrl(settings.whatsappNumber, whatsAppMessage);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05070D]/95 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0D1322] rounded-3xl border border-emerald-500/40 p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-emerald-950/60 animate-in zoom-in-95 duration-300 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button top-right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#171D2B] text-[#B8C1D1] hover:text-white hover:bg-[#222B3D] transition-colors cursor-pointer"
          aria-label="Fechar confirmação"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Green Circle with Checkmark 'V' (Círculo verde ao redor do círculo com sinal de V) */}
        <div className="pt-2">
          <SuccessCheckmark size="lg" className="mx-auto" />
        </div>

        {/* Headings */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-3 shadow-sm shadow-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Protocolo: {quote.protocol}
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
            Solicitação Enviada com Sucesso!
          </h3>

          <p className="text-xs sm:text-sm text-[#B8C1D1] max-w-sm mx-auto leading-relaxed">
            Recebemos a solicitação de proposta para <strong className="text-white">{quote.name}</strong>. Nossa equipe analisará os requisitos e entrará em contato em até 24 horas úteis.
          </p>
        </div>

        {/* Storage status notification */}
        <div className="p-3.5 rounded-xl bg-[#06152B] border border-[#1E293B] text-left text-xs space-y-1">
          <div className="flex items-center gap-2 text-white font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Registro arquivado com sucesso no sistema Wort Studio</span>
          </div>
          <p className="text-[11px] text-[#B8C1D1]">
            Os dados do projeto foram salvos com segurança para análise técnica e emissão de proposta sob medida.
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-4 rounded-xl bg-[#05070D] border border-[#222B3D] text-left text-xs grid grid-cols-2 gap-3 text-[#B8C1D1]">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/70">Tipo de Projeto</span>
            <span className="text-white font-medium capitalize truncate block">{quote.projectType.replace(/_/g, ' ')}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/70">Prazo Desejado</span>
            <span className="text-white font-medium truncate block">{quote.timeline}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/70">E-mail</span>
            <span className="text-white font-medium truncate block">{quote.email}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/70">WhatsApp</span>
            <span className="text-white font-medium truncate block">{quote.whatsapp}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0866FF]/25 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            Continuar no WhatsApp Comercial
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] text-[#B8C1D1] hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            Concluir e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
