import React, { useState } from 'react';
import { motion, type Variants } from 'motion/react';
import {
  ArrowRight,
  Monitor,
  Smartphone,
  PenTool,
  Zap,
  Target,
  ShoppingCart,
  Sliders,
  Eye,
  Compass,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { DemoModel, PlanItem, ServiceItem, CommercialSettings } from '../types';
import { DeviceMockup } from '../components/DeviceMockup';
import { AnimatedWatermark } from '../components/AnimatedWatermark';
import { DIFFERENTIALS_LIST, HOW_IT_WORKS_STEPS } from '../data/initialData';

interface HomePageProps {
  models: DemoModel[];
  plans: PlanItem[];
  services: ServiceItem[];
  settings: CommercialSettings;
  onNavigate: (tab: string) => void;
  onOpenModelDemo: (model: DemoModel) => void;
  onRequestQuoteWithModel: (model: DemoModel) => void;
  onRequestQuoteWithPlan: (plan: PlanItem) => void;
  onRequestQuote: () => void;
}

// Smooth entrance motion variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  }
};

export const HomePage: React.FC<HomePageProps> = ({
  models,
  plans,
  services,
  settings,
  onNavigate,
  onOpenModelDemo,
  onRequestQuoteWithModel,
  onRequestQuoteWithPlan,
  onRequestQuote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos os modelos' },
    { id: 'Empresas', label: 'Empresas' },
    { id: 'Serviços profissionais', label: 'Serviços Profissionais' },
    { id: 'Saúde e estética', label: 'Saúde e Estética' },
    { id: 'Restaurantes e comércios', label: 'Restaurantes e Comércio' },
    { id: 'Cursos e educação', label: 'Cursos e Educação' },
    { id: 'Produtos digitais', label: 'Produtos Digitais' }
  ];

  const filteredModels = selectedCategory === 'todos'
    ? models.slice(0, 6)
    : models.filter(m => m.category === selectedCategory);

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'sites-institucionais':
        return <Monitor className="w-5 h-5 text-[#00CFFF]" />;
      case 'landing-pages':
        return <Target className="w-5 h-5 text-[#00CFFF]" />;
      case 'paginas-de-vendas':
        return <ShoppingCart className="w-5 h-5 text-[#00CFFF]" />;
      case 'projetos-personalizados':
        return <Sliders className="w-5 h-5 text-[#00CFFF]" />;
      default:
        return <Layers className="w-5 h-5 text-[#00CFFF]" />;
    }
  };

  const getDifferentialIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Sparkles className="w-5 h-5 text-[#00CFFF]" />;
      case 1:
        return <Smartphone className="w-5 h-5 text-[#00CFFF]" />;
      case 2:
        return <Compass className="w-5 h-5 text-[#00CFFF]" />;
      case 3:
        return <Target className="w-5 h-5 text-[#00CFFF]" />;
      case 4:
        return <ShieldCheck className="w-5 h-5 text-[#00CFFF]" />;
      case 5:
        return <Sliders className="w-5 h-5 text-[#00CFFF]" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-[#00CFFF]" />;
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* ======================================================== */}
      {/* SEÇÃO 1: HERO (DUAS ÁREAS: TEXTO + MOCKUP NOTEBOOK/CELULAR) */}
      {/* ======================================================== */}
      <section className="relative pt-6 sm:pt-14 pb-8 overflow-hidden">
        {/* Animated Background Watermark */}
        <AnimatedWatermark opacity={0.05} />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-96 bg-gradient-to-b from-[#0866FF]/15 via-[#00CFFF]/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & Action */}
            <motion.div
              className="lg:col-span-6 text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Badge Pill */}
              <motion.div variants={fadeInUp} className="mb-5 inline-block">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0866FF]/10 border border-[#0866FF]/30 text-xs font-semibold text-[#00CFFF] tracking-wider uppercase shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] animate-pulse" />
                  <span>CRIAÇÃO DE SITES • LANDING PAGES</span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={fadeInUp}
                className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.12] mb-5"
              >
                Transforme sua ideia em um{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0866FF] to-[#00CFFF]">
                  site profissional.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeInUp}
                className="text-sm sm:text-base text-[#B8C1D1] leading-relaxed max-w-xl mb-8"
              >
                Criamos sites, landing pages e páginas de vendas para empresas, profissionais e empreendedores que querem fortalecer sua presença digital.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10"
              >
                <button
                  type="button"
                  onClick={onRequestQuote}
                  className="px-7 py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0866FF]/30 hover:shadow-[#0866FF]/50 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Solicitar orçamento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('modelos')}
                  className="px-6 py-3.5 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] border border-[#222B3D] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Explorar modelos</span>
                </button>
              </motion.div>

              {/* Three Mini Differentials with Icons */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#171D2B]"
              >
                <div className="flex items-center gap-2.5 text-xs text-[#B8C1D1]">
                  <div className="w-8 h-8 rounded-lg bg-[#171D2B] border border-[#222B3D] flex items-center justify-center text-[#00CFFF] shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-white">Design responsivo</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-[#B8C1D1]">
                  <div className="w-8 h-8 rounded-lg bg-[#171D2B] border border-[#222B3D] flex items-center justify-center text-[#00CFFF] shrink-0">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-white">Design personalizado</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-[#B8C1D1]">
                  <div className="w-8 h-8 rounded-lg bg-[#171D2B] border border-[#222B3D] flex items-center justify-center text-[#00CFFF] shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-white">Foco no seu objetivo</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: High-Impact Device Composition (Laptop + Smartphone) */}
            <motion.div
              className="lg:col-span-6 relative"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <DeviceMockup
                heroTitle="Sua marca mais forte digitalmente."
                heroSubtitle="Desenvolvemos páginas de alto padrão visual, código leve e navegação otimizada para computadores e smartphones."
                badgeText="Criação de Sites • Landing Pages"
                accentColor="#0866FF"
                ctaText="Solicitar orçamento"
                onCtaClick={onRequestQuote}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SEÇÃO 2: SERVIÇOS (NOSSOS SERVIÇOS) */}
      {/* ======================================================== */}
      <section className="bg-[#070A12] border-y border-[#171D2B]/60 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInUp}
          >
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#00CFFF] block mb-2">
                Nossos Serviços
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
                Soluções completas para sua presença online.
              </h2>
              <p className="text-xs sm:text-sm text-[#B8C1D1] max-w-xl">
                Do site institucional à página de vendas, criamos a solução ideal para o seu negócio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('servicos')}
              className="self-start md:self-auto text-xs font-semibold text-[#00CFFF] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>Conheça todos os serviços</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* 4 Services Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
          >
            {services.map((serv) => {
              const isCustomProject = serv.id === 'projetos-personalizados';
              return (
                <motion.div
                  key={serv.id}
                  variants={cardVariant}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="p-6 rounded-2xl bg-[#0D1322] hover:bg-[#121B30] border border-[#1E293B] hover:border-[#0866FF]/60 transition-all duration-300 flex flex-col justify-between shadow-lg group relative"
                >
                  <div>
                    {/* Icon container */}
                    <div className="w-11 h-11 rounded-xl bg-[#172238] border border-[#23314E] flex items-center justify-center mb-5 group-hover:bg-[#0866FF]/20 group-hover:border-[#0866FF]/40 transition-colors">
                      {getServiceIcon(serv.id)}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                      {serv.title}
                    </h3>
                    <p className="text-xs text-[#B8C1D1] leading-relaxed mb-6">
                      {serv.shortDescription}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1E293B]">
                    {isCustomProject ? (
                      <button
                        type="button"
                        onClick={onRequestQuote}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#171D2B] group-hover:bg-[#0866FF] text-white text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Solicitar orçamento</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigate('servicos')}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#171D2B] group-hover:bg-[#0866FF] text-white text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>Conhecer serviço</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SEÇÃO 3: GALERIA DE MODELOS DEMONSTRATIVOS */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-[#00CFFF] block mb-2">
              Modelos Demonstrativos
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
              Encontre o modelo ideal para o seu negócio.
            </h2>
            <p className="text-xs sm:text-sm text-[#B8C1D1] max-w-xl">
              Explore referências de páginas e escolha o estilo que melhor combina com seu projeto.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('modelos')}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] border border-[#222B3D] text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <span>Ver todos os modelos</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#00CFFF]" />
          </button>
        </motion.div>

        {/* Category Filters (Horizontal Scrollable Pills) */}
        <motion.div
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0866FF] text-white shadow-lg shadow-[#0866FF]/25 font-semibold'
                    : 'bg-[#171D2B] text-[#B8C1D1] hover:text-white hover:bg-[#222B3D] border border-[#222B3D]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* 6 Models 3x2 Grid */}
        <motion.div
          key={selectedCategory}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {filteredModels.map((model) => (
            <motion.div
              key={model.id}
              variants={cardVariant}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-[#0D1322] border border-[#1E293B] hover:border-[#0866FF]/60 transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xl"
            >
              {/* Preview Thumbnail Container with Browser Header */}
              <div className="relative overflow-hidden bg-[#05070D]">
                {/* Browser bar */}
                <div className="px-3.5 py-2 bg-[#171D2B]/90 border-b border-[#222B3D] flex items-center justify-between text-[10px] text-[#B8C1D1]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/80" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
                    wortsite.com.br/{model.slug}
                  </span>
                  <span className="w-2" />
                </div>

                {/* High Resolution Preview Image with UI simulation */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={model.previewImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1322] via-[#0D1322]/40 to-transparent" />

                  {/* Category Pill Tag inside Preview */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#0866FF]/80 backdrop-blur-md text-[10px] font-semibold text-white shadow-md">
                      {model.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content & Metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5">
                    {model.name}
                  </h3>
                  <p className="text-xs text-[#B8C1D1] leading-relaxed mb-4">
                    {model.shortDescription}
                  </p>
                </div>

                {/* Action Buttons: "Visualizar modelo" & "Quero esse" */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => onOpenModelDemo(model)}
                    className="py-2.5 px-3 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] text-[#B8C1D1] hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#222B3D]"
                  >
                    <span>Visualizar modelo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestQuoteWithModel(model)}
                    className="py-2.5 px-3 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-md shadow-[#0866FF]/25"
                  >
                    <span>Quero esse</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* SEÇÃO 4: DIFERENCIAIS (POR QUE ESCOLHER A WORTSITE) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="p-8 sm:p-14 rounded-3xl bg-[#0D1322] border border-[#1E293B] shadow-2xl relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0866FF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Column: Title & CTA */}
            <div className="lg:col-span-5 text-left">
              <span className="text-xs font-bold tracking-wider uppercase text-[#00CFFF] block mb-2">
                Por Que Escolher a WortSite
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
                Tudo o que você precisa para ir mais longe.
              </h2>
              <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed mb-8">
                Mais do que criar páginas, oferecemos uma experiência completa, do planejamento à publicação.
              </p>

              <button
                type="button"
                onClick={onRequestQuote}
                className="px-6 py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-[#0866FF]/30 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Solicitar orçamento</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Column: 6 Editorial Differentials in 2x3 Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {DIFFERENTIALS_LIST.map((diff, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-5 rounded-xl bg-[#171D2B]/70 border border-[#222B3D] hover:border-[#0866FF]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#0866FF]/15 border border-[#0866FF]/30 flex items-center justify-center shrink-0">
                      {getDifferentialIcon(index)}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                      {diff.title}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#B8C1D1] leading-relaxed pl-11">
                    {diff.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* SEÇÃO 5: COMO FUNCIONA (SEU PROJETO EM 4 ETAPAS) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {/* Left Side: Work Desk Lifestyle Composition */}
          <motion.div
            className="lg:col-span-5 relative"
            variants={fadeInUp}
          >
            <div className="relative rounded-3xl overflow-hidden border border-[#1E293B] shadow-2xl aspect-[4/3] lg:aspect-[4/4.5]">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80"
                alt="Ambiente de desenvolvimento de projetos WortSite"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-transparent to-black/30" />

              {/* Glassmorphism Floating Badge */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-[#0D1322]/85 backdrop-blur-md border border-white/10 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-white">
                    Desenvolvimento organizado e homologado
                  </span>
                </div>
                <p className="text-[11px] text-[#B8C1D1] mt-1">
                  Você acompanha o progresso e aprova cada etapa antes da publicação definitiva.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Side: The 4 Stages */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            variants={fadeInUp}
          >
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-[#00CFFF] block mb-2">
                Como Funciona
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3">
                Seu projeto em 4 etapas
              </h2>
            </div>

            {/* 4 Connected Step Cards */}
            <div className="space-y-4 relative">
              {HOW_IT_WORKS_STEPS.map((step, idx) => (
                <div
                  key={step.step}
                  className="p-5 rounded-2xl bg-[#0D1322] border border-[#1E293B] hover:border-[#0866FF]/40 transition-colors flex items-start gap-4 relative"
                >
                  {/* Step Numbered Badge */}
                  <div className="w-10 h-10 rounded-full bg-[#121B30] border-2 border-[#0866FF] text-[#00CFFF] font-extrabold text-sm flex items-center justify-center shrink-0 shadow-md shadow-[#0866FF]/20">
                    {step.step}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#B8C1D1] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* SEÇÃO 6: PLANOS DE CONTRATAÇÃO (PLANOS E PREÇOS) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-[#00CFFF] block mb-2">
              Planos e Preços
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
              Planos que se adaptam ao seu projeto.
            </h2>
            <p className="text-xs sm:text-sm text-[#B8C1D1] max-w-xl">
              Escolha o plano ideal ou solicite um orçamento personalizado.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('planos')}
            className="self-start md:self-auto text-xs font-semibold text-[#00CFFF] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>Ver todos os planos</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* 3 Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={cardVariant}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 relative ${
                plan.highlighted
                  ? 'bg-[#101726] border-2 border-[#0866FF] shadow-2xl shadow-[#0866FF]/25 lg:-translate-y-2'
                  : 'bg-[#0D1322] border border-[#1E293B]'
              }`}
            >
              {/* "Mais popular" Pill Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-[#0866FF] text-[11px] font-bold text-white shadow-lg shadow-[#0866FF]/50 tracking-wide">
                  Mais popular
                </div>
              )}

              <div>
                {/* Plan Icon & Title */}
                <div className="mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#172238] border border-[#23314E] flex items-center justify-center text-[#00CFFF] mb-3">
                    {plan.id.includes('landing') ? (
                      <Zap className="w-5 h-5 text-[#00CFFF]" />
                    ) : plan.id.includes('profissional') ? (
                      <Monitor className="w-5 h-5 text-[#0866FF]" />
                    ) : (
                      <Sliders className="w-5 h-5 text-[#00CFFF]" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#B8C1D1] min-h-[36px]">
                    {plan.subtitle}
                  </p>
                </div>

                {/* Scope Checklist Items */}
                <div className="space-y-3 mb-8 pt-4 border-t border-[#1E293B]">
                  {plan.deliverables.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <Check className="w-4 h-4 text-[#00CFFF] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  onClick={() => onRequestQuoteWithPlan(plan)}
                  className={`w-full py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    plan.highlighted
                      ? 'bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-lg shadow-[#0866FF]/35'
                      : 'bg-[#171D2B] hover:bg-[#222B3D] text-white border border-[#222B3D]'
                  }`}
                >
                  <span>Solicitar orçamento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Commercial Clarification Note */}
        <p className="mt-8 text-center text-[11px] sm:text-xs text-[#B8C1D1]/70 max-w-2xl mx-auto">
          Valores sob consulta. Domínio, hospedagem, integrações e manutenção dependem das condições de cada contratação.
        </p>
      </section>

      {/* ======================================================== */}
      {/* SEÇÃO 7: CHAMADA FINAL (PRONTO PARA COMEÇAR?) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative rounded-3xl bg-gradient-to-br from-[#091B3D] via-[#0B1A30] to-[#070D18] border border-[#0866FF]/30 p-8 sm:p-12 overflow-hidden shadow-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          {/* Cyber light beam overlay */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0866FF]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Heading & Button */}
            <div className="lg:col-span-6 text-left">
              <span className="text-xs font-bold tracking-wider uppercase text-[#00CFFF] block mb-2">
                Pronto Para Começar?
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Vamos tirar seu projeto do papel?
              </h2>
              <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed mb-8 max-w-lg">
                Conte sua ideia para a WortSite e descubra a melhor solução para apresentar seu negócio na internet.
              </p>

              <button
                type="button"
                onClick={onRequestQuote}
                className="px-8 py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white font-semibold text-sm inline-flex items-center gap-2 shadow-xl shadow-[#0866FF]/40 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>Solicitar orçamento agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Column: Realistic Laptop Mockup with Checklist */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row items-center gap-6">
              {/* Mini Laptop Mockup */}
              <div className="w-full sm:w-3/5 rounded-xl border border-[#2A374F] bg-[#0A0E17] p-2 shadow-2xl">
                <div className="rounded-lg overflow-hidden border border-[#1E293B] aspect-[16/10] relative">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
                    alt="Plataforma de websites profissionais"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-center text-[9px] font-bold text-white bg-black/60 backdrop-blur-sm py-1 rounded">
                    WortSite • Alta Performance
                  </div>
                </div>
                <div className="h-1.5 bg-[#1A2232] rounded-b-md mt-1" />
              </div>

              {/* Checklist items beside laptop */}
              <div className="w-full sm:w-2/5 space-y-2.5 text-xs text-white">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00CFFF] shrink-0" />
                  <span className="font-medium">Sites profissionais</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00CFFF] shrink-0" />
                  <span className="font-medium">Landing pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00CFFF] shrink-0" />
                  <span className="font-medium">Páginas de vendas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00CFFF] shrink-0" />
                  <span className="font-medium">Projetos personalizados</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
