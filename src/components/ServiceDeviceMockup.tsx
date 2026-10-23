import React from 'react';
import { Logo } from './Logo';

export interface ServiceDeviceMockupProps {
  type: 'institucional' | 'landing' | 'vendas' | 'personalizado';
}

const mockupsData = {
  institucional: {
    badge: 'Empresas & Indústrias',
    title: 'Soluções em engenharia para o seu projeto.',
    subtitle: 'Engenharia de precisão, infraestrutura e gestão técnica de ponta.',
    cta: 'Conheça nossos serviços',
    bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    accent: '#0866FF'
  },
  landing: {
    badge: 'Alta Conversão',
    title: 'Treine hoje o corpo que você deseja.',
    subtitle: 'Programa intensivo com acompanhamento personalizado e foco em resultados.',
    cta: 'Quero começar agora',
    bgImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
    accent: '#00CFFF'
  },
  vendas: {
    badge: 'Lançamento Exclusivo',
    title: 'Som de alta performance para o seu dia.',
    subtitle: 'Cancelamento de ruído inteligente e bateria de até 40 horas contínuas.',
    cta: 'Garantir meu exemplar',
    bgImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    accent: '#0866FF'
  },
  personalizado: {
    badge: 'Plataforma Sob Medida',
    title: 'Gestão integrada e automação de processos.',
    subtitle: 'Sistemas inteligentes com dashboards, integrações por API e fluxos exclusivos.',
    cta: 'Agendar demonstração',
    bgImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    accent: '#00CFFF'
  }
};

export const ServiceDeviceMockup: React.FC<ServiceDeviceMockupProps> = ({ type }) => {
  const data = mockupsData[type];

  return (
    <div className="relative w-full max-w-lg mx-auto select-none py-2">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 rounded-3xl blur-2xl opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 60% 40%, ${data.accent}40 0%, #00CFFF20 50%, transparent 75%)`
        }}
      />

      {/* Main Composition Wrapper */}
      <div className="relative">
        {/* ======================================================== */}
        {/* LAPTOP MOCKUP */}
        {/* ======================================================== */}
        <div className="relative rounded-t-2xl border-t border-x border-[#2A374F] bg-[#0C121D] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2 sm:p-2.5 pb-0 max-w-[92%] sm:max-w-[90%]">
          {/* Bezel Camera */}
          <div className="flex items-center justify-center pb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800 border border-slate-600" />
          </div>

          {/* Screen Content */}
          <div className="relative rounded-t-lg overflow-hidden border border-[#1A2536] aspect-[16/10] bg-[#05070D]">
            {/* Background Photography with Dark Gradient Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${data.bgImage}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/80 to-[#05070D]/40" />
            </div>

            {/* Laptop UI Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-between p-3 sm:p-4">
              {/* Top Navbar */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <Logo variant="full" className="h-3 sm:h-3.5 w-auto" />
                <div className="hidden sm:flex items-center gap-2 text-[9px] text-slate-300">
                  <span className="text-white font-medium">Início</span>
                  <span>Sobre</span>
                  <span>Soluções</span>
                  <span>Contato</span>
                </div>
              </div>

              {/* Hero Banner Content */}
              <div className="space-y-1.5 max-w-[75%] pb-1">
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#00CFFF] px-1.5 py-0.5 rounded bg-[#00CFFF]/10 border border-[#00CFFF]/30 inline-block">
                  {data.badge}
                </span>
                <h4 className="text-[11px] sm:text-xs md:text-sm font-extrabold text-white leading-tight">
                  {data.title}
                </h4>
                <p className="text-[8px] sm:text-[9px] text-[#B8C1D1] line-clamp-2 leading-relaxed">
                  {data.subtitle}
                </p>
                <div className="pt-1">
                  <span
                    className="inline-block px-2.5 py-1 rounded-md text-[8px] sm:text-[9px] font-semibold text-white shadow-sm"
                    style={{ backgroundColor: data.accent }}
                  >
                    {data.cta}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Base Hinge */}
          <div className="h-1.5 sm:h-2 bg-[#1A2536] rounded-b-md mx-auto w-[104%] -ml-[2%] relative flex items-center justify-center">
            <div className="w-12 h-0.5 bg-[#2B3B54] rounded-full" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* SMARTPHONE MOCKUP (OVERLAPPING BOTTOM-RIGHT) */}
        {/* ======================================================== */}
        <div className="absolute -bottom-2 right-0 sm:right-2 w-[36%] sm:w-[34%] aspect-[9/18.5] rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 bg-[#090D15] border-2 border-[#2A374F] shadow-[0_20px_40px_rgba(0,0,0,0.95)] z-20">
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden h-full w-full border border-[#1A2536] bg-[#05070D]">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-black z-30 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-slate-800" />
            </div>

            {/* Smartphone Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${data.bgImage}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/85 to-[#05070D]/50" />
            </div>

            {/* Mobile Screen UI */}
            <div className="relative z-10 h-full flex flex-col justify-between p-2 pt-4">
              <div className="flex items-center justify-between">
                <Logo variant="icon" className="h-3 w-auto" />
                <div className="w-3 h-2 flex flex-col justify-between">
                  <span className="w-full h-0.5 bg-white/70 rounded" />
                  <span className="w-full h-0.5 bg-white/70 rounded" />
                </div>
              </div>

              <div className="space-y-1 pb-1">
                <span className="text-[7px] font-bold uppercase text-[#00CFFF] block">
                  {data.badge}
                </span>
                <p className="text-[8px] sm:text-[9px] font-bold text-white leading-tight line-clamp-2">
                  {data.title}
                </p>
                <div className="pt-0.5">
                  <span
                    className="block text-center py-1 rounded text-[7px] font-semibold text-white shadow-sm"
                    style={{ backgroundColor: data.accent }}
                  >
                    {data.cta}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
