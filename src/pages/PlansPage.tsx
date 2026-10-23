import React from 'react';
import {
  Check,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Info,
  CreditCard,
  Headphones,
  Star,
  FileText,
  Monitor,
  Sliders,
} from 'lucide-react';
import { PlanItem, CommercialSettings } from '../types';
import { buildWhatsAppUrl } from '../services/api';
import plansHeroImg from '../assets/plans-hero.jpg';
import { AnimatedWatermark } from '../components/AnimatedWatermark';

interface PlansPageProps {
  plans: PlanItem[];
  settings: CommercialSettings;
  onRequestQuoteWithPlan: (plan: PlanItem) => void;
}

export const PlansPage: React.FC<PlansPageProps> = ({
  plans,
  settings,
  onRequestQuoteWithPlan,
}) => {
  // Helper to determine icon per plan
  const getPlanIcon = (slug: string) => {
    if (slug.includes('landing')) {
      return <FileText className="w-5 h-5 text-[#00CFFF]" />;
    }
    if (slug.includes('profissional')) {
      return <Monitor className="w-5 h-5 text-[#00CFFF]" />;
    }
    return <Sliders className="w-5 h-5 text-[#00CFFF]" />;
  };

  // Helper to get top-right badge
  const getPlanBadge = (plan: PlanItem) => {
    if (plan.subtitle && plan.subtitle.length < 32) return plan.subtitle;
    if (plan.slug.includes('landing')) return 'Ideal para campanhas';
    if (plan.slug.includes('profissional')) return 'Ideal para empresas';
    return 'Solução sob medida';
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Animated Background Watermark */}
      <AnimatedWatermark opacity={0.07} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 sm:space-y-16">
      {/* ======================================================== */}
      {/* 1. SEÇÃO PRINCIPAL — HERO COM COMPOSIÇÃO HORIZONTAL */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Title & Description */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00CFFF]/40 bg-[#00CFFF]/10 text-[#00CFFF] text-[11px] font-bold tracking-widest uppercase">
            TRANSPARÊNCIA COMERCIAL
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Planos e{' '}
            <span className="text-[#00CFFF]">Preços</span>
          </h1>

          <p className="text-sm sm:text-base text-[#B8C1D1] leading-relaxed max-w-xl">
            Sem custos ocultos ou surpresas. Conheça as entregas, os limites técnicos e as condições de contratação de cada plano.
          </p>
        </div>

        {/* Right Column: Realistic High-Impact Laptop & Phone Mockup */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative group w-full max-w-md">
            {/* Ambient background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#0866FF]/25 to-[#00CFFF]/25 rounded-3xl blur-2xl opacity-70 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-[#1E293B] shadow-2xl shadow-black/80 bg-[#05070D]">
              <img
                src={plansHeroImg}
                alt="WortSite em dispositivos notebook e smartphone"
                className="w-full h-auto object-cover object-center transform group-hover:scale-102 transition-transform duration-500"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. AVISO SOBRE DOMÍNIO, HOSPEDAGEM E LICENÇAS */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#06152B] border border-[#0866FF]/40 shadow-xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#0866FF]/20 border border-[#00CFFF]/40 flex items-center justify-center shrink-0 text-[#00CFFF] mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Sobre Domínio, Hospedagem e Licenças Externas:
          </h2>
          <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed">
            O registro de domínio (ex.: www.suaempresa.com.br no Registro.br) e o plano de hospedagem em servidor são ativos de propriedade do cliente. A WortSite orienta todo o processo de contratação ou pode incluir a gestão desses itens formalizada na proposta comercial de acordo com a sua preferência.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CARDS DOS PLANOS (3 COLUNAS) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-2">
        {plans.map((plan) => {
          const isFeatured = plan.highlighted;
          const planBadge = getPlanBadge(plan);
          const planIcon = getPlanIcon(plan.slug);

          const planWhatsAppMessage = `Olá, WortSite! Gostaria de tirar dúvidas comerciais sobre o plano *${plan.name}*.`;
          const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber, planWhatsAppMessage);

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                isFeatured
                  ? 'bg-[#0A1324] border-2 border-[#0866FF] shadow-[0_0_35px_rgba(8,102,255,0.32)] lg:-translate-y-2'
                  : 'bg-[#070F1E] border border-[#1A2740] hover:border-[#0866FF]/40 shadow-xl'
              }`}
            >
              {/* Featured Badge floating on top center */}
              {isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0866FF] text-[11px] font-extrabold uppercase tracking-widest text-white shadow-lg shadow-[#0866FF]/60 z-10 whitespace-nowrap">
                  MAIS ESCOLHIDO
                </div>
              )}

              <div className="space-y-6">
                {/* Header: Icon + Tag */}
                <div className="flex items-center justify-between gap-2">
                  <div className="w-11 h-11 rounded-xl bg-[#0866FF]/15 border border-[#0866FF]/35 flex items-center justify-center shrink-0">
                    {planIcon}
                  </div>

                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full border border-[#00CFFF]/40 bg-[#00CFFF]/10 text-[#00CFFF]">
                    {planBadge}
                  </span>
                </div>

                {/* Plan Title & Description */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#B8C1D1] leading-relaxed mt-2 min-h-[48px]">
                    {plan.description}
                  </p>
                </div>

                {/* Commercial Price Box */}
                <div className="p-5 rounded-2xl bg-[#050B17] border border-[#17253D] space-y-1.5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {plan.isPriceCustom ? (
                      plan.priceDisplay
                    ) : (
                      <>
                        <span className="text-xs font-normal text-[#B8C1D1] mr-1">R$</span>
                        {plan.priceNumber?.toLocaleString('pt-BR')}
                      </>
                    )}
                  </div>

                  <div className="text-xs text-[#00CFFF] font-semibold">
                    {plan.billingPeriod}
                  </div>

                  <div className="text-[11px] text-[#B8C1D1] pt-2 mt-2 border-t border-[#17253D] leading-snug">
                    Prazo estimado:{' '}
                    <strong className="text-white font-medium">
                      {plan.estimatedTimeline}
                    </strong>
                  </div>
                </div>

                {/* Entregas Inclusas */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">
                    ENTREGAS INCLUSAS:
                  </h4>
                  <ul className="space-y-2 text-xs text-[#B8C1D1]">
                    {plan.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limites do Escopo */}
                <div className="space-y-2 pt-2 border-t border-[#17253D]/70">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#B8C1D1]">
                    LIMITES DO ESCOPO:
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-[#B8C1D1]/80">
                    {plan.serviceLimits.map((limit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-500 font-mono select-none text-xs leading-none mt-0.5">
                          ✕
                        </span>
                        <span className="leading-snug">{limit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opcionais sob Consulta */}
                {plan.additionalServices && plan.additionalServices.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#17253D]/70">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#B8C1D1]">
                      OPCIONAIS SOB CONSULTA:
                    </h4>
                    <ul className="space-y-1.5 text-[11px] text-[#B8C1D1]">
                      {plan.additionalServices.map((opt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#00CFFF] font-bold select-none text-xs leading-none mt-0.5">
                            +
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Commercial Conditions Note Box */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-[#061021]/80 border border-[#14233C] text-[10px] text-[#B8C1D1]">
                  <Info className="w-3.5 h-3.5 text-[#00CFFF] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-white font-medium">Condições: </strong>
                    {plan.commercialTerms}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6 mt-6 border-t border-[#17253D]">
                <button
                  type="button"
                  onClick={() => onRequestQuoteWithPlan(plan)}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isFeatured
                      ? 'bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-xl shadow-[#0866FF]/35 font-bold'
                      : 'bg-[#0D182E] hover:bg-[#132240] text-white border border-[#0866FF]/50 hover:border-[#0866FF]'
                  }`}
                >
                  <span>Solicitar Proposta para Este Plano</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 text-center text-xs text-[#00CFFF] hover:underline flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Tirar dúvidas sobre este plano no WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 4. SEÇÃO DE BENEFÍCIOS (FAIXA HORIZONTAL) */}
      {/* ======================================================== */}
      <div className="rounded-3xl bg-[#061226] border border-[#17253D] p-6 sm:p-8 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Benefício 1 */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0866FF]/15 border border-[#00CFFF]/40 flex items-center justify-center shrink-0 text-[#00CFFF]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Pagamento único por projeto
              </h3>
              <p className="text-xs text-[#B8C1D1] mt-1 leading-relaxed">
                Sem cobranças recorrentes pelo desenvolvimento contratado.
              </p>
            </div>
          </div>

          {/* Benefício 2 */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0866FF]/15 border border-[#00CFFF]/40 flex items-center justify-center shrink-0 text-[#00CFFF]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Segurança e transparência
              </h3>
              <p className="text-xs text-[#B8C1D1] mt-1 leading-relaxed">
                Você sabe exatamente o que está contratando.
              </p>
            </div>
          </div>

          {/* Benefício 3 */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0866FF]/15 border border-[#00CFFF]/40 flex items-center justify-center shrink-0 text-[#00CFFF]">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Suporte e acompanhamento
              </h3>
              <p className="text-xs text-[#B8C1D1] mt-1 leading-relaxed">
                Acompanhamento durante o processo de desenvolvimento, conforme o escopo contratado.
              </p>
            </div>
          </div>

          {/* Benefício 4 */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0866FF]/15 border border-[#00CFFF]/40 flex items-center justify-center shrink-0 text-[#00CFFF]">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Soluções flexíveis
              </h3>
              <p className="text-xs text-[#B8C1D1] mt-1 leading-relaxed">
                Planos e condições que se adaptam ao seu projeto.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
