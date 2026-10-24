import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Shield } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ModelsPage } from './pages/ModelsPage';
import { PlansPage } from './pages/PlansPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { DemoViewerModal } from './components/DemoViewerModal';
import { QuoteModal } from './components/QuoteModal';
import { LegalModal } from './components/LegalModal';
import { ProposalsManager } from './components/proposals/ProposalsManager';
import { ProposalPreviewModal } from './components/proposals/ProposalPreviewModal';
import { DemoModel, PlanItem, ServiceItem, CommercialSettings, ProjectType, CommercialProposal } from './types';
import { INITIAL_MODELS, INITIAL_PLANS, INITIAL_SERVICES, INITIAL_SETTINGS } from './data/initialData';
import { api, buildWhatsAppUrl } from './services/api';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('inicio');

  // Business Data State
  const [models, setModels] = useState<DemoModel[]>(INITIAL_MODELS);
  const [plans, setPlans] = useState<PlanItem[]>(INITIAL_PLANS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [settings, setSettings] = useState<CommercialSettings>(INITIAL_SETTINGS);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

  // Modal States
  const [activeDemoModel, setActiveDemoModel] = useState<DemoModel | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteSelectedModel, setQuoteSelectedModel] = useState<DemoModel | null>(null);
  const [quoteSelectedPlanName, setQuoteSelectedPlanName] = useState<string | null>(null);
  const [quoteInitialProjectType, setQuoteInitialProjectType] = useState<ProjectType>('site_institucional');
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [clientProposalPreview, setClientProposalPreview] = useState<CommercialProposal | null>(null);

  // Fetch initial data from server on load
  const loadData = async () => {
    const data = await api.getInitialData();
    setModels(data.models);
    setPlans(data.plans);
    setServices(data.services);
    setSettings(data.settings);
    setIsBackendConnected(data.isBackendConnected);
  };

  useEffect(() => {
    loadData();

    // Detecção de visualização direta de proposta comercial via URL / QR Code
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const propostaParam = urlParams.get('proposta') || urlParams.get('proposal');
      const tabParam = urlParams.get('tab');
      if (tabParam === 'propostas') {
        setActiveTab('propostas');
      }
      if (propostaParam) {
        api.getProposal(propostaParam).then(prop => {
          if (prop) setClientProposalPreview(prop);
        }).catch(() => {});
      }
    }
  }, []);

  // Handlers
  const handleOpenModelDemo = (model: DemoModel) => {
    setActiveDemoModel(model);
  };

  const handleRequestQuoteWithModel = (model: DemoModel) => {
    setQuoteSelectedModel(model);
    setQuoteSelectedPlanName(null);
    let pType: ProjectType = 'site_institucional';
    if (model.category === 'Produtos digitais') pType = 'pagina_de_vendas';
    else if (model.category === 'Cursos e educação') pType = 'pagina_curso';
    else if (model.category === 'Restaurantes e comércios') pType = 'site_comercio';
    else if (model.category === 'Serviços profissionais') pType = 'landing_page';
    setQuoteInitialProjectType(pType);
    setIsQuoteModalOpen(true);
  };

  const handleRequestQuoteWithPlan = (plan: PlanItem) => {
    setQuoteSelectedModel(null);
    setQuoteSelectedPlanName(plan.name);
    let pType: ProjectType = 'site_institucional';
    if (plan.slug.includes('landing')) pType = 'landing_page';
    else if (plan.slug.includes('personalizado')) pType = 'projeto_personalizado';
    setQuoteInitialProjectType(pType);
    setIsQuoteModalOpen(true);
  };

  const handleRequestQuoteWithService = (serviceId: string) => {
    setQuoteSelectedModel(null);
    setQuoteSelectedPlanName(null);
    let pType: ProjectType = 'site_institucional';
    if (serviceId === 'landing-pages') pType = 'landing_page';
    else if (serviceId === 'paginas-de-vendas') pType = 'pagina_de_vendas';
    else if (serviceId === 'projetos-personalizados') pType = 'projeto_personalizado';
    setQuoteInitialProjectType(pType);
    setIsQuoteModalOpen(true);
  };

  const handleOpenGeneralQuote = () => {
    setQuoteSelectedModel(null);
    setQuoteSelectedPlanName(null);
    setQuoteInitialProjectType('site_institucional');
    setIsQuoteModalOpen(true);
  };

  const floatingWhatsAppUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Olá, WortSite! Gostaria de conversar com a equipe sobre desenvolvimento de um site.'
  );

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col font-sans selection:bg-[#0866FF] selection:text-white">
      {/* Fixed Navigation Header */}
      <Header
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRequestQuote={handleOpenGeneralQuote}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-20">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {activeTab === 'inicio' && (
            <HomePage
              models={models}
              plans={plans}
              services={services}
              settings={settings}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenModelDemo={handleOpenModelDemo}
              onRequestQuoteWithModel={handleRequestQuoteWithModel}
              onRequestQuoteWithPlan={handleRequestQuoteWithPlan}
              onRequestQuote={handleOpenGeneralQuote}
            />
          )}

          {activeTab === 'servicos' && (
            <ServicesPage
              services={services}
              settings={settings}
              onRequestQuoteWithService={handleRequestQuoteWithService}
              onRequestQuote={handleOpenGeneralQuote}
            />
          )}

          {activeTab === 'modelos' && (
            <ModelsPage
              models={models}
              onOpenModelDemo={handleOpenModelDemo}
              onRequestQuoteWithModel={handleRequestQuoteWithModel}
            />
          )}

          {activeTab === 'planos' && (
            <PlansPage
              plans={plans}
              settings={settings}
              onRequestQuoteWithPlan={handleRequestQuoteWithPlan}
            />
          )}

          {activeTab === 'como-funciona' && (
            <HowItWorksPage onRequestQuote={handleOpenGeneralQuote} />
          )}

          {activeTab === 'sobre' && (
            <AboutPage settings={settings} onRequestQuote={handleOpenGeneralQuote} />
          )}

          {activeTab === 'contato' && (
            <ContactPage settings={settings} />
          )}

          {activeTab === 'propostas' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ProposalsManager />
            </div>
          )}

          {activeTab === 'admin' && (
            <AdminPage
              models={models}
              plans={plans}
              settings={settings}
              onRefreshData={loadData}
            />
          )}
        </motion.div>
      </main>

      {/* Complete Footer */}
      <Footer
        settings={settings}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPrivacy={() => setLegalModalType('privacy')}
        onOpenTerms={() => setLegalModalType('terms')}
        onRequestQuote={handleOpenGeneralQuote}
      />

      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-6 right-6 z-40 group">
        <a
          href={floatingWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#0866FF] hover:bg-[#0654D4] text-white flex items-center justify-center shadow-2xl shadow-[#0866FF]/50 hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0866FF]"
          aria-label="Atendimento no WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#05070D] animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#05070D]" />
        </a>
      </div>

      {/* Interactive Model Demo Viewer Modal */}
      <DemoViewerModal
        model={activeDemoModel}
        settings={settings}
        onClose={() => setActiveDemoModel(null)}
        onSelectModelForQuote={(m) => handleRequestQuoteWithModel(m)}
      />

      {/* Quote Request Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        settings={settings}
        selectedModel={quoteSelectedModel}
        selectedPlanName={quoteSelectedPlanName}
        initialProjectType={quoteInitialProjectType}
      />

      {/* Privacy Policy & Terms Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Visualizador de Proposta Aberto via Link / QR Code */}
      {clientProposalPreview && (
        <ProposalPreviewModal
          proposal={clientProposalPreview}
          onClose={() => setClientProposalPreview(null)}
        />
      )}
    </div>
  );
}
