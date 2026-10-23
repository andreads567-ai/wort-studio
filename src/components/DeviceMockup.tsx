import React from 'react';
import { Smartphone, ShieldCheck, ArrowRight, Laptop, Sparkles, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';

interface DeviceMockupProps {
  heroTitle?: string;
  heroSubtitle?: string;
  badgeText?: string;
  accentColor?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export const DeviceMockup: React.FC<DeviceMockupProps> = ({
  heroTitle = 'Sua marca mais forte digitalmente.',
  heroSubtitle = 'Desenvolvemos páginas de alto padrão visual, código leve e navegação otimizada para computadores e smartphones.',
  badgeText = 'Sites & Landing Pages',
  accentColor = '#0866FF',
  ctaText = 'Solicitar orçamento',
  onCtaClick
}) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none select-none py-4">
      {/* Dynamic Cyber Light Wave Arc behind devices (matches mockup reference) */}
      <div className="absolute -top-16 -right-10 w-[120%] h-80 pointer-events-none overflow-hidden opacity-70">
        <svg
          viewBox="0 0 600 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter blur-[1px]"
        >
          <path
            d="M 50,280 C 200,100 400,20 580,90"
            stroke="url(#blueWaveGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 70,290 C 220,120 420,40 590,110"
            stroke="url(#cyanWaveGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <defs>
            <linearGradient id="blueWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0866FF" stopOpacity="0" />
              <stop offset="40%" stopColor="#0866FF" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#00CFFF" stopOpacity="1" />
              <stop offset="100%" stopColor="#00CFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="cyanWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00CFFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#00CFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0866FF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Atmospheric radial ambient glow */}
      <div
        className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none blur-3xl opacity-35"
        style={{ background: 'radial-gradient(circle, #0866FF 0%, #00CFFF 40%, transparent 75%)' }}
      />

      {/* Laptop & Smartphone Composition Wrapper */}
      <div className="relative">
        {/* ======================================================== */}
        {/* LAPTOP CONTAINER */}
        {/* ======================================================== */}
        <div className="relative mx-auto rounded-t-2xl border-t border-x border-[#2A374F] bg-[#0A0E17] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_-10px_rgba(8,102,255,0.25)] p-2 sm:p-2.5 pb-0 max-w-xl transition-all duration-300">
          {/* Laptop Top Bezel & Camera */}
          <div className="flex items-center justify-center pb-1.5 relative">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700" />
          </div>

          {/* Laptop Screen */}
          <div className="relative rounded-t-lg overflow-hidden border border-[#1E293B] aspect-[16/10] bg-[#05070D]">
            {/* Background City Skyscrapers Image with Dark Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/80 to-[#05070D]/40" />
            </div>

            {/* Laptop Screen UI */}
            <div className="relative z-10 h-full flex flex-col justify-between p-3.5 sm:p-5">
              {/* Simulated Header Bar */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center">
                  <Logo variant="full" className="h-3.5 sm:h-4 w-auto" />
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-300 font-medium">
                  <span className="text-white">Início</span>
                  <span>Modelos</span>
                  <span>Serviços</span>
                  <span>Contato</span>
                </div>
                <div className="px-2 py-0.5 rounded-md bg-[#0866FF] text-[9px] font-semibold text-white shadow-sm">
                  Orçamento
                </div>
              </div>

              {/* Simulated Hero Inside Laptop */}
              <div className="my-auto py-2 max-w-xs sm:max-w-sm">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0866FF]/20 border border-[#0866FF]/40 text-[9px] text-[#00CFFF] font-medium mb-1.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{badgeText}</span>
                </div>
                <h4 className="text-sm sm:text-lg font-extrabold text-white leading-tight mb-1.5 drop-shadow">
                  {heroTitle}
                </h4>
                <p className="text-[9px] sm:text-[11px] text-slate-300 leading-relaxed mb-3 line-clamp-2">
                  {heroSubtitle}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onCtaClick}
                    className="px-3 py-1 rounded-md bg-[#0866FF] hover:bg-[#0654D4] text-white text-[10px] font-semibold flex items-center gap-1 shadow-md shadow-[#0866FF]/40 transition-colors"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                  <div className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/15 text-[10px] text-white">
                    Explorar
                  </div>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/10 text-[9px] text-slate-300">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#00CFFF]" /> Design Responsivo
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#00CFFF]" /> Performance Web
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Laptop Base (Metallic keyboard deck & front lip) */}
        <div className="relative mx-auto max-w-[620px] h-3.5 bg-gradient-to-b from-[#2B3447] via-[#1A2232] to-[#121722] rounded-b-xl border-t border-slate-700/60 shadow-2xl flex items-start justify-center">
          <div className="w-16 h-1 bg-[#10141D] rounded-b-md" />
        </div>
        {/* Laptop Desk Shadow & Ambient Reflection */}
        <div className="mx-auto max-w-[560px] h-3 bg-gradient-to-b from-black/80 to-transparent blur-sm" />

        {/* ======================================================== */}
        {/* SMARTPHONE CONTAINER (Overlapping on bottom right) */}
        {/* ======================================================== */}
        <div className="absolute -bottom-4 right-2 sm:right-4 w-32 sm:w-40 md:w-44 rounded-[22px] sm:rounded-[26px] p-1.5 sm:p-2 bg-gradient-to-b from-[#334155] via-[#1E293B] to-[#0F172A] border border-[#384863] shadow-[0_20px_45px_-10px_rgba(0,0,0,0.9),0_0_30px_rgba(8,102,255,0.3)] z-20 transition-transform duration-300 hover:-translate-y-1">
          {/* Dynamic Island / Speaker Pill */}
          <div className="w-10 sm:w-12 h-2.5 bg-black rounded-full mx-auto mb-1.5 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800" />
          </div>

          {/* Smartphone Screen */}
          <div className="relative rounded-[16px] sm:rounded-[20px] overflow-hidden bg-[#05070D] aspect-[9/18.5] border border-slate-800">
            {/* Phone Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/85 to-[#05070D]/50" />
            </div>

            {/* Phone Content UI */}
            <div className="relative z-10 h-full flex flex-col justify-between p-2.5 sm:p-3 text-left">
              {/* Phone Status / Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                <Logo variant="full" className="h-2.5 sm:h-3 w-auto" />
                <span className="text-[7px] text-[#00CFFF] font-mono">100% Mobile</span>
              </div>

              {/* Phone Hero Text */}
              <div className="my-auto">
                <span className="text-[7px] font-bold uppercase tracking-wider text-[#00CFFF] block mb-0.5">
                  Mobile First
                </span>
                <h5 className="text-[9px] sm:text-[11px] font-extrabold text-white leading-tight mb-1">
                  Sua marca mais forte digitalmente.
                </h5>
                <p className="text-[7px] sm:text-[8px] text-slate-300 leading-snug mb-2">
                  Layout fluido e experiência perfeita na palma da mão.
                </p>
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="w-full py-1 rounded bg-[#0866FF] text-white text-[8px] font-semibold text-center shadow-md shadow-[#0866FF]/30"
                >
                  Orçamento Rápido
                </button>
              </div>

              {/* Phone Footer feature */}
              <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[7px] text-slate-300">
                <span>✓ Ultra veloz</span>
                <span className="text-emerald-400 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
