import React, { useState, useEffect } from 'react';
import { X, Monitor, Tablet, Smartphone, Check, ArrowRight, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { DemoModel, CommercialSettings } from '../types';
import { buildWhatsAppUrl } from '../services/api';

interface DemoViewerModalProps {
  model: DemoModel | null;
  settings: CommercialSettings;
  onClose: () => void;
  onSelectModelForQuote: (model: DemoModel) => void;
}

export const DemoViewerModal: React.FC<DemoViewerModalProps> = ({
  model,
  settings,
  onClose,
  onSelectModelForQuote,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!model) return null;

  const whatsappMessage = `Olá, WortSite! Gostei muito do modelo demonstrativo *${model.name}* (Categoria: ${model.category}). Gostaria de um orçamento para criar um projeto semelhante para meu negócio.`;
  const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber, whatsappMessage);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#05070D]/95 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      {/* Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 bg-[#0D1322] border-b border-[#1E293B] gap-3">
        {/* Model Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0866FF]/20 border border-[#0866FF]/40 flex items-center justify-center text-[#0866FF] font-bold text-xs">
            {model.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">{model.name}</h3>
              <span className="text-xs text-[#00CFFF] font-medium">· {model.category}</span>
            </div>
            <p className="text-[11px] text-[#B8C1D1]">Demonstração Interativa Original WortSite</p>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center bg-[#171D2B] p-1 rounded-xl border border-[#222B3D]">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              deviceMode === 'desktop'
                ? 'bg-[#0866FF] text-white shadow'
                : 'text-[#B8C1D1] hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              deviceMode === 'tablet'
                ? 'bg-[#0866FF] text-white shadow'
                : 'text-[#B8C1D1] hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              deviceMode === 'mobile'
                ? 'bg-[#0866FF] text-white shadow'
                : 'text-[#B8C1D1] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Celular</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171D2B] hover:bg-[#222B3D] border border-[#222B3D] text-xs font-medium text-[#B8C1D1] hover:text-white transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#00CFFF]" />
            WhatsApp
          </a>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectModelForQuote(model);
            }}
            className="px-4 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#0866FF]/30 transition-all cursor-pointer"
          >
            Quero um modelo assim
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#171D2B] text-[#B8C1D1] hover:text-white hover:bg-[#222B3D] transition-colors"
            title="Fechar demonstração"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-[#171D2B]/80 border-b border-[#222B3D] px-4 py-2 text-center text-xs text-[#B8C1D1]">
        <span className="font-semibold text-white mr-1.5">Exemplo Demonstrativo:</span>
        Esta é uma visualização de layout concebida pela WortSite. Ao contratar, cada seção, logotipo, paleta e conteúdo são adaptados ao seu segmento.
      </div>

      {/* Interactive Device Viewport Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#05070D]">
        <div
          className={`transition-all duration-300 bg-[#0E131F] rounded-2xl border border-[#222B3D] shadow-2xl overflow-hidden flex flex-col ${
            deviceMode === 'desktop'
              ? 'w-full max-w-5xl'
              : deviceMode === 'tablet'
              ? 'w-[768px] max-w-full'
              : 'w-[375px] max-w-full'
          }`}
          style={{ minHeight: '80vh' }}
        >
          {/* Simulated Browser Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#171D2B] border-b border-[#222B3D]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-[11px] font-mono text-[#B8C1D1]/70 truncate max-w-[200px] sm:max-w-xs">
                https://demonstracao.wortsite.com.br/{model.slug}
              </span>
            </div>
            <div className="text-[10px] text-[#00CFFF] flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3" /> Seguro
            </div>
          </div>

          {/* Model Live Simulated Site Content */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0E131F] via-[#080B14] to-[#05070D] text-slate-100 p-6 sm:p-10">
            {/* Model Simulated Header */}
            <header className="flex items-center justify-between pb-6 border-b border-[#222B3D]/70 mb-10">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                  style={{ backgroundColor: model.accentColor || '#0866FF' }}
                >
                  {model.name.charAt(0)}
                </div>
                <span className="font-bold tracking-tight text-white text-sm sm:text-base">
                  {model.name.toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs text-[#B8C1D1]">
                <span>Início</span>
                <span>Sobre</span>
                <span>Serviços</span>
                <span>Contato</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectModelForQuote(model);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-95"
                style={{ backgroundColor: model.accentColor || '#0866FF' }}
              >
                Fale Conosco
              </button>
            </header>

            {/* Model Simulated Hero */}
            <div className="max-w-2xl py-4 sm:py-8">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3" style={{ color: model.accentColor }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Soluções para {model.category}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                {model.mockupData.heroTitle}
              </h1>
              <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed mb-6">
                {model.mockupData.heroSubtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectModelForQuote(model);
                  }}
                  className="px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: model.accentColor || '#0866FF' }}
                >
                  {model.mockupData.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Model Simulated Sections */}
            <div className="mt-12 space-y-10 pt-8 border-t border-[#222B3D]/70">
              {model.mockupData.sections.map((section, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-[#171D2B]/50 border border-[#222B3D]">
                  <h3 className="text-lg font-bold text-white mb-1.5">{section.title}</h3>
                  <p className="text-xs text-[#B8C1D1] mb-5">{section.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {section.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0E131F] border border-[#222B3D]/80 text-xs text-[#B8C1D1]"
                      >
                        <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Model Specs Box */}
            <div className="mt-10 p-5 rounded-xl bg-[#171D2B] border border-[#222B3D]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
                Especificações Deste Modelo
              </h4>
              <p className="text-xs text-[#B8C1D1] mb-4">{model.description}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {model.features.map((feat, fIdx) => (
                  <span
                    key={fIdx}
                    className="px-2.5 py-1 rounded bg-[#0E131F] border border-[#222B3D] text-[#B8C1D1]"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Conversion Prompt */}
            <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-b from-[#171D2B] to-[#0E131F] border border-[#222B3D]">
              <h3 className="text-xl font-bold text-white mb-2">
                Deseja um projeto baseado neste modelo?
              </h3>
              <p className="text-xs sm:text-sm text-[#B8C1D1] max-w-lg mx-auto mb-6">
                Podemos customizar toda a paleta de cores, tipografia, seções e integrações da WortSite para atender perfeitamente aos requisitos do seu negócio.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectModelForQuote(model);
                }}
                className="px-6 py-3 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-sm font-semibold inline-flex items-center gap-2 shadow-xl shadow-[#0866FF]/30 transition-all cursor-pointer"
              >
                Solicitar Orçamento para Este Modelo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
