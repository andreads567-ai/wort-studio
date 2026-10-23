import React from 'react';
import {
  Building2,
  Zap,
  ShoppingCart,
  Code2,
  Check,
  ArrowRight,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck,
  Headphones,
  UserCheck,
  CreditCard,
  Star,
} from 'lucide-react';
import { ServiceItem, CommercialSettings } from '../types';
import { ServiceDeviceMockup } from '../components/ServiceDeviceMockup';
import plansHeroImg from '../assets/plans-hero.jpg';
import { AnimatedWatermark } from '../components/AnimatedWatermark';

interface ServicesPageProps {
  services: ServiceItem[];
  settings: CommercialSettings;
  onRequestQuoteWithService: (serviceId: string) => void;
  onRequestQuote?: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onRequestQuoteWithService,
  onRequestQuote,
}) => {
  const scrollToServices = () => {
    const el = document.getElementById('servicos-lista');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGeneralQuote = () => {
    if (onRequestQuote) {
      onRequestQuote();
    } else {
      onRequestQuoteWithService('sites-institucionais');
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Animated Background Watermark */}
      <AnimatedWatermark opacity={0.06} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-14 sm:space-y-16">
      {/* ======================================================== */}
      {/* 1. HERO — APRESENTAÇÃO DOS SERVIÇOS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Title, Subtitle, Differentials & CTAs */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00CFFF]/40 bg-[#00CFFF]/10 text-[#00CFFF] text-[11px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NOSSOS SERVIÇOS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Serviços de{' '}
            <span className="text-[#00CFFF]">Criação de Sites</span>
          </h1>

          <p className="text-sm sm:text-base text-[#B8C1D1] leading-relaxed max-w-xl">
            Cada projeto vem sendo criado com estratégia, foco no negócio e atenção aos detalhes. Conheça as principais soluções que oferecemos para transformar sua presença digital.
          </p>

          {/* 3 Differentials with circular cyan icons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#081224]/80 border border-[#17253D]">
              <div className="w-8 h-8 rounded-lg bg-[#0866FF]/20 border border-[#00CFFF]/40 flex items-center justify-center text-[#00CFFF] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">
                Qualidade no resultado
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#081224]/80 border border-[#17253D]">
              <div className="w-8 h-8 rounded-lg bg-[#0866FF]/20 border border-[#00CFFF]/40 flex items-center justify-center text-[#00CFFF] shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">
                Suporte especializado
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#081224]/80 border border-[#17253D]">
              <div className="w-8 h-8 rounded-lg bg-[#0866FF]/20 border border-[#00CFFF]/40 flex items-center justify-center text-[#00CFFF] shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-white">
                Atendimento personalizado
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              type="button"
              onClick={handleGeneralQuote}
              className="px-6 py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xl shadow-[#0866FF]/30 hover:shadow-[#0866FF]/50 transition-all cursor-pointer"
            >
              <span>Solicitar orçamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={scrollToServices}
              className="px-6 py-3.5 rounded-xl bg-[#0D182E] hover:bg-[#132240] text-white text-xs sm:text-sm font-semibold border border-[#0866FF]/50 hover:border-[#0866FF] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Conhecer nossos serviços</span>
            </button>
          </div>
        </div>

        {/* Right Column: High Impact Composition of Devices */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative group w-full max-w-md">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#0866FF]/25 to-[#00CFFF]/25 rounded-3xl blur-2xl opacity-70 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-[#1E293B] shadow-2xl shadow-black/80 bg-[#05070D]">
              <img
                src={plansHeroImg}
                alt="Serviços WortSite em notebook e smartphone"
                className="w-full h-auto object-cover object-center transform group-hover:scale-102 transition-transform duration-500"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SEÇÃO: ENTENDA AS DIFERENÇAS ENTRE OS FORMATOS */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#06152B] border border-[#0866FF]/40 shadow-xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#0866FF]/20 border border-[#00CFFF]/40 flex items-center justify-center shrink-0 text-[#00CFFF] mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Entenda as Diferenças Entre os Formatos
            </h2>
            <p className="text-xs sm:text-sm text-[#B8C1D1] mt-1 leading-relaxed max-w-3xl">
              Cada formato tem um propósito e atende a objetivos diferentes. Escolha o que faz mais sentido para o seu negócio e conte com a nossa experiência para criar a melhor solução.
            </p>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-[#070F1E] border border-[#1A2740] hover:border-[#0866FF]/50 transition-colors space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#0866FF]/15 border border-[#0866FF]/35 flex items-center justify-center text-[#00CFFF]">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Site Institucional
            </h3>
            <p className="text-xs text-[#B8C1D1] leading-relaxed">
              Apresenta sua empresa, serviços e diferenciais de forma completa.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-[#070F1E] border border-[#1A2740] hover:border-[#0866FF]/50 transition-colors space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#0866FF]/15 border border-[#0866FF]/35 flex items-center justify-center text-[#00CFFF]">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Landing Page
            </h3>
            <p className="text-xs text-[#B8C1D1] leading-relaxed">
              Foco em conversão e captação de leads para campanhas.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-[#070F1E] border border-[#1A2740] hover:border-[#0866FF]/50 transition-colors space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#0866FF]/15 border border-[#0866FF]/35 flex items-center justify-center text-[#00CFFF]">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Página de Vendas
            </h3>
            <p className="text-xs text-[#B8C1D1] leading-relaxed">
              Voltada para produtos ou serviços específicos.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl bg-[#070F1E] border border-[#1A2740] hover:border-[#0866FF]/50 transition-colors space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#0866FF]/15 border border-[#0866FF]/35 flex items-center justify-center text-[#00CFFF]">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Projeto Personalizado
            </h3>
            <p className="text-xs text-[#B8C1D1] leading-relaxed">
              Soluções sob medida para necessidades únicas.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. AVISO SOBRE ESCOPO DE LOJAS VIRTUAIS */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#071120] border border-amber-500/35 flex items-start gap-4 shadow-lg">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Nota Importante: Sobre Escopo de Lojas Virtuais (E-commerce)
          </h2>
          <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed">
            Uma loja virtual com carrinho de compras, checkout, estoque, frete e gestão de pedidos possui necessidades diferentes de uma página institucional ou landing page. Projetos com essas funcionalidades devem ser avaliados e orçados separadamente como projetos personalizados.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. OS 4 GRANDES CARDS DE SERVIÇOS DETALHADOS */}
      {/* ======================================================== */}
      <div id="servicos-lista" className="space-y-10 pt-2">
        {/* ======================================================== */}
        {/* SERVIÇO 1: SITES INSTITUCIONAIS */}
        {/* ======================================================== */}
        <div className="rounded-3xl bg-[#0A1224] border border-[#1A2844] hover:border-[#0866FF]/60 p-6 sm:p-8 lg:p-10 shadow-2xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Visual Column: Device Mockup */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <ServiceDeviceMockup type="institucional" />
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0866FF]/15 border border-[#0866FF]/35 flex items-center justify-center text-[#00CFFF] shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Sites Institucionais
                  </h2>
                  <p className="text-xs sm:text-sm text-[#00CFFF] font-semibold">
                    Sua empresa bem apresentada, com credibilidade e profissionalismo.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed">
                Estrutura multi-páginas para apresentar sua empresa, produtos, serviços e diferenciais de forma organizada e profissional.
              </p>

              {/* 2 Sub-columns: Para quem é indicado & Funcionalidades */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#17253D]">
                {/* Target Audience */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">
                    PARA QUEM É INDICADO:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#B8C1D1]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Empresas de todos os segmentos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Profissionais liberais e autônomos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Comércios e prestadores de serviços</span>
                    </li>
                  </ul>
                </div>

                {/* Typical Features */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">
                    FUNCIONALIDADES TÍPICAS POSSÍVEIS:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#B8C1D1]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Páginas institucionais conforme escopo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Navegação entre páginas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Design responsivo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Formulário de contato</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Integrações e ferramentas (opcionais)</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onRequestQuoteWithService('sites-institucionais')}
                  className="px-6 py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0866FF]/30 hover:shadow-[#0866FF]/50 transition-all cursor-pointer"
                >
                  <span>Solicitar orçamento para este serviço</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SERVIÇO 2: LANDING PAGES */}
        {/* ======================================================== */}
        <div className="rounded-3xl bg-[#0A1224] border border-[#1A2844] hover:border-[#0866FF]/60 p-6 sm:p-8 lg:p-10 shadow-2xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Visual Column: Device Mockup */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <ServiceDeviceMockup type="landing" />
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0866FF]/15 border border-[#0866FF]/35 flex items-center justify-center text-[#00CFFF] shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Landing Pages
                  </h2>
                  <p className="text-xs sm:text-sm text-[#00CFFF] font-semibold">
                    Mais foco, mais resultados.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed">
                Páginas objetivas e estratégicas, desenvolvidas para campanhas, lançamentos e captação de contatos.
              </p>

              {/* 2 Sub-columns: Para quem é indicado & Funcionalidades */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#17253D]">
                {/* Target Audience */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">
                    PARA QUEM É INDICADO:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#B8C1D1]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Campanhas de marketing digital</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Lançamentos de produtos ou serviços</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Captação de leads e e-mails</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Prestadores de serviços com oferta específica</span>
                    </li>
                  </ul>
                </div>

                {/* Typical Features */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">
                    FUNCIONALIDADES TÍPICAS POSSÍVEIS:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#B8C1D1]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Páginas com seções definidas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Design responsivo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Botões de contato e WhatsApp</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Formulários de captação</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Integrações com ferramentas de marketing</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onRequestQuoteWithService('landing-pages')}
                  className="px-6 py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0866FF]/30 hover:shadow-[#0866FF]/50 transition-all cursor-pointer"
                >
                  <span>Solicitar orçamento para este serviço</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SERVIÇO 3: PÁGINAS DE VENDAS */}
        {/* ======================================================== */}
        <div className="rounded-3xl bg-[#0A1224] border border-[#1A2844] hover:border-[#0866FF]/60 p-6 sm:p-8 lg:p-10 shadow-2xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Visual Column: Device Mockup */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <ServiceDeviceMockup type="vendas" />
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0866FF]/15 border border-[#0866FF]/35 flex items-center justify-center text-[#00CFFF] shrink-0">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Páginas de Vendas
                  </h2>
                  <p className="text-xs sm:text-sm text-[#00CFFF] font-semibold">
                    Transforme visitantes em clientes.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed">
                Páginas estratégicas para apresentar produtos e serviços, com foco em comunicação clara e direcionamento para compra ou contato.
              </p>

              {/* 2 Sub-columns: Para quem é indicado & Funcionalidades */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#17253D]">
                {/* Target Audience */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">
                    PARA QUEM É INDICADO:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#B8C1D1]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Produtos físicos e digitais</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Criadores de cursos e treinamentos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Profissionais com serviços especializados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Empreendedores com lançamentos e ofertas</span>
                    </li>
                  </ul>
                </div>

                {/* Typical Features */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">
                    FUNCIONALIDADES TÍPICAS POSSÍVEIS:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#B8C1D1]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Layout persuasivo e moderno</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Formulário de compra ou contato</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Integração com meios de pagamento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Depoimentos reais (quando autorizados)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Página de agradecimento (opcional)</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onRequestQuoteWithService('paginas-de-vendas')}
                  className="px-6 py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0866FF]/30 hover:shadow-[#0866FF]/50 transition-all cursor-pointer"
                >
                  <span>Solicitar orçamento para este serviço</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SERVIÇO 4: PROJETOS PERSONALIZADOS */}
        {/* ======================================================== */}
        <div className="rounded-3xl bg-[#0A1224] border border-[#1A2844] hover:border-[#0866FF]/60 p-6 sm:p-8 lg:p-10 shadow-2xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Visual Column: Device Mockup */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <ServiceDeviceMockup type="personalizado" />
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#0866FF]/15 border border-[#0866FF]/35 flex items-center justify-center text-[#00CFFF] shrink-0">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Projetos Personalizados
                  </h2>
                  <p className="text-xs sm:text-sm text-[#00CFFF] font-semibold">
                    Soluções únicas para grandes ideias.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed">
                Desenvolvimento sob medida para necessidades específicas, com funcionalidades avançadas, integrações e fluxos personalizados.
              </p>

              {/* 2 Sub-columns: Para quem é indicado & Funcionalidades */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#17253D]">
                {/* Target Audience */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">
                    PARA QUEM É INDICADO:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#B8C1D1]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Sistemas e integrações externas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Catálogos e plataformas complexas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Funcionalidades específicas do seu negócio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Empresas que exigem fluxos não-convencionais</span>
                    </li>
                  </ul>
                </div>

                {/* Typical Features */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">
                    FUNCIONALIDADES TÍPICAS POSSÍVEIS:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#B8C1D1]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Desenvolvimento sob medida</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Integrações com sistemas externos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Fluxos personalizados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Funcionalidades definidas no escopo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>Escalabilidade e segurança</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onRequestQuoteWithService('projetos-personalizados')}
                  className="px-6 py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0866FF]/30 hover:shadow-[#0866FF]/50 transition-all cursor-pointer"
                >
                  <span>Solicitar orçamento para este serviço</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. FAIXA DE BENEFÍCIOS */}
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
                Durante todo o processo de desenvolvimento, conforme escopo.
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
