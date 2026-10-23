import React from 'react';
import { ShieldCheck, Target, Cpu, CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { CommercialSettings } from '../types';
import { buildWhatsAppUrl } from '../services/api';
import { AnimatedWatermark } from '../components/AnimatedWatermark';

interface AboutPageProps {
  settings: CommercialSettings;
  onRequestQuote: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onRequestQuote }) => {
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Animated Background Watermark */}
      <AnimatedWatermark opacity={0.08} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold tracking-wider uppercase text-[#00CFFF]">
          Quem Somos
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2 mb-4">
          Sobre a WortSite
        </h1>
        <p className="text-sm sm:text-base text-[#B8C1D1] leading-relaxed">
          Especializada na criação e publicação de sites institucionais, landing pages e páginas de vendas com foco em qualidade visual, robustez técnica e usabilidade.
        </p>
      </div>

      {/* Slogans Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#101726] to-[#0D1322] border border-[#1E293B] text-center max-w-4xl mx-auto shadow-2xl">
        <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          "{settings.sloganPrincipal}"
        </h2>
        <p className="text-sm sm:text-base font-semibold text-[#00CFFF] tracking-wide">
          {settings.sloganSecundario}
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-7 rounded-2xl bg-[#0D1322] border border-[#1E293B] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#0866FF]/20 border border-[#0866FF]/40 text-[#0866FF] flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Engenharia e Velocidade
          </h3>
          <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed">
            Desenvolvemos código leve e otimizado com tecnologias contemporâneas. Páginas rápidas garantem que seu visitante não desista do acesso e tenha uma experiência agradável desde o primeiro toque.
          </p>
        </div>

        <div className="p-7 rounded-2xl bg-[#0D1322] border border-[#1E293B] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#00CFFF]/20 border border-[#00CFFF]/40 text-[#00CFFF] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Foco no Objetivo do Projeto
          </h3>
          <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed">
            Não criamos páginas apenas para ocupar espaço na internet. Cada elemento visual, botão de WhatsApp e bloco informativo é posicionado estrategicamente para valorizar sua autoridade e facilitar o contato do cliente.
          </p>
        </div>

        <div className="p-7 rounded-2xl bg-[#0D1322] border border-[#1E293B] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Transparência Sem Fórmulas Mágicas
          </h3>
          <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed">
            Rejeitamos promessas irrealistas de faturamento ou posições instantâneas no Google. Nosso trabalho entrega uma base sólida, profissional e digna de confiança para que você posicione sua marca com orgulho.
          </p>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#0D1322] border border-[#1E293B] space-y-6">
        <h3 className="text-xl font-bold text-white tracking-tight">
          Nossa Filosofia de Trabalho
        </h3>
        <div className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed space-y-4">
          <p>
            Na <strong>WortSite</strong>, acreditamos que todo negócio — seja uma empresa B2B, uma clínica médica, um restaurante ou um profissional autônomo — merece uma apresentação digital de alto padrão.
          </p>
          <p>
            Muitas empresas perdem oportunidades diariamente por terem sites desatualizados, difíceis de ler no celular ou lentos para carregar. Nossa missão é eliminar essa barreira através de um processo transparente de criação, com catálogo de referências reais e atendimento próximo.
          </p>
          <p>
            Do primeiro diagnóstico comercial à homologação final antes da publicação, prezamos por clareza de escopo, cumprimento de prazos e respeito absoluto à identidade visual de cada cliente.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onRequestQuote}
            className="px-6 py-3 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#0866FF]/20"
          >
            Solicitar Proposta para Seu Negócio
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={buildWhatsAppUrl(
              settings.whatsappNumber,
              'Olá, WortSite! Gostaria de conversar sobre um projeto de site para minha empresa.'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] border border-[#222B3D] text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-[#00CFFF]" />
            Conversar no WhatsApp
          </a>
        </div>
      </div>
      </div>
    </div>
  );
};
