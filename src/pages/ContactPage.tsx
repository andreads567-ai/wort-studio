import React, { useState, useRef } from 'react';
import { Mail, Clock, MapPin, MessageCircle, Send, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { CommercialSettings, ProjectType, QuoteRequest } from '../types';
import { api, buildWhatsAppUrl } from '../services/api';
import { AnimatedWatermark } from '../components/AnimatedWatermark';
import { SuccessCheckmark } from '../components/SuccessCheckmark';
import { SuccessQuoteModal } from '../components/SuccessQuoteModal';

interface ContactPageProps {
  settings: CommercialSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('site_institucional');
  const [businessSegment, setBusinessSegment] = useState('');
  const [budgetRange, setBudgetRange] = useState('A definir na proposta');
  const [timeline, setTimeline] = useState('Prazo regular (10 a 20 dias)');
  const [description, setDescription] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<QuoteRequest | null>(null);
  const [backendSaved, setBackendSaved] = useState<boolean | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Por favor, informe seu nome completo.';
    } else if (name.trim().length < 3) {
      errs.name = 'O nome deve ter pelo menos 3 caracteres.';
    }

    if (!email.trim()) {
      errs.email = 'Por favor, informe seu e-mail de contato.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Informe um endereço de e-mail válido.';
    }

    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.whatsapp = 'Por favor, informe seu WhatsApp com DDD.';
    } else if (cleanPhone.length < 10) {
      errs.whatsapp = 'O telefone deve conter DDD e no mínimo 10 dígitos.';
    }

    if (!projectType) {
      errs.projectType = 'Selecione o tipo de projeto que deseja criar.';
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      if (errs.name && nameRef.current) {
        nameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameRef.current.focus();
      } else if (errs.email && emailRef.current) {
        emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        emailRef.current.focus();
      } else if (errs.whatsapp && whatsappRef.current) {
        whatsappRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        whatsappRef.current.focus();
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const result = await api.submitQuote({
        name,
        email,
        whatsapp,
        projectType,
        businessSegment,
        budgetRange,
        timeline,
        description: referenceUrl ? `${description}\nReferência: ${referenceUrl}` : description
      });

      if (result.success && result.quote) {
        setSubmittedQuote(result.quote);
        setBackendSaved(result.isBackendConnected);
      } else {
        setErrors({ general: result.error || 'Erro ao processar envio no servidor.' });
      }
    } catch {
      setErrors({ general: 'Falha de comunicação no envio. Utilize o WhatsApp direto para solicitar proposta.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedQuote(null);
    setBackendSaved(null);
    setName('');
    setEmail('');
    setWhatsapp('');
    setDescription('');
    setReferenceUrl('');
    setErrors({});
  };

  const buildPostQuoteWhatsAppUrl = () => {
    if (!submittedQuote) return '#';
    const msg = `Olá, Wort Studio! Enviei uma solicitação pelo formulário de contato:\n\n*Protocolo:* ${submittedQuote.protocol}\n*Nome:* ${submittedQuote.name}\n*Tipo:* ${submittedQuote.projectType}\n\nGostaria de dar sequência ao atendimento!`;
    return buildWhatsAppUrl(settings.whatsappNumber, msg);
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Animated Background Watermark */}
      <AnimatedWatermark opacity={0.07} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold tracking-wider uppercase text-[#00CFFF]">
          Canais de Atendimento
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2 mb-4">
          Fale com a Wort Studio
        </h1>
        <p className="text-sm sm:text-base text-[#B8C1D1] leading-relaxed">
          Preencha o formulário para receber uma proposta técnica detalhada ou acione diretamente nosso canal no WhatsApp para atendimento ágil.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Direct Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-[#0D1322] border border-[#1E293B] shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Informações de Contato
            </h2>
            <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed">
              Atendimento remoto estruturado para clientes de todo o Brasil, com processos documentados e pontualidade na entrega.
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#171D2B] border border-[#222B3D]">
                <MessageCircle className="w-5 h-5 text-[#00CFFF] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-white uppercase tracking-wider">
                    WhatsApp Comercial
                  </span>
                  <span className="text-[#B8C1D1]">
                    {settings.whatsappDisplay || 'Configurável no painel'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#171D2B] border border-[#222B3D]">
                <Mail className="w-5 h-5 text-[#0866FF] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-white uppercase tracking-wider">
                    E-mail Corporativo
                  </span>
                  <span className="text-[#B8C1D1]">{settings.contactEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#171D2B] border border-[#222B3D]">
                <Clock className="w-5 h-5 text-[#0866FF] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-white uppercase tracking-wider">
                    Horário de Atendimento
                  </span>
                  <span className="text-[#B8C1D1]">{settings.businessHours}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#171D2B] border border-[#222B3D]">
                <MapPin className="w-5 h-5 text-[#0866FF] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-white uppercase tracking-wider">
                    Base Operacional
                  </span>
                  <span className="text-[#B8C1D1]">{settings.addressCity}</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Call */}
            <div className="pt-2">
              <a
                href={buildWhatsAppUrl(
                  settings.whatsappNumber,
                  'Olá, WortSite! Gostaria de conversar com um especialista sobre criação de sites.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0866FF]/20 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Iniciar Conversa no WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Full Budget Request Form */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0D1322] border border-[#1E293B] shadow-xl">
            {submittedQuote ? (
              <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                {/* Animated Green Circle with Checkmark 'V' (Círculo Verde com Sinal de V) */}
                <div className="py-2">
                  <SuccessCheckmark size="lg" className="mx-auto" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-3 shadow-sm shadow-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Protocolo: {submittedQuote.protocol}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                    Solicitação Enviada com Sucesso!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B8C1D1] max-w-md mx-auto leading-relaxed">
                    Sua proposta técnica foi registrada sob os cuidados da equipe comercial da <strong className="text-white">Wort Studio</strong>. Entraremos em contato em até 24 horas úteis.
                  </p>
                </div>

                {/* Storage feedback */}
                <div className="p-4 rounded-xl bg-[#171D2B] border border-[#222B3D] text-left text-xs space-y-1">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      {backendSaved
                        ? 'Gravado no banco operacional do servidor Wort Studio'
                        : 'Gravado com segurança no dispositivo local'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#B8C1D1]">
                    {backendSaved
                      ? 'O registro foi persistido e está acessível no painel administrativo de orçamentos para análise técnica.'
                      : 'Caso deseje atendimento prioritário neste momento, envie o protocolo via WhatsApp.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <a
                    href={buildPostQuoteWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0866FF]/25"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar Protocolo no WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-3 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] text-[#B8C1D1] hover:text-white text-xs sm:text-sm font-medium"
                  >
                    Nova Solicitação
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Solicitar Orçamento de Projeto
                  </h3>
                  <p className="text-xs text-[#B8C1D1]">
                    Campos marcados com * são indispensáveis para a elaboração do escopo.
                  </p>
                </div>

                {errors.general && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errors.general}</span>
                  </div>
                )}

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      Nome Completo <span className="text-red-400">*</span>
                    </label>
                    <input
                      ref={nameRef}
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                      }}
                      placeholder="Ex: Amanda Silva"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border text-xs sm:text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all ${
                        errors.name ? 'border-red-500 ring-1 ring-red-500/50' : 'border-[#222B3D]'
                      }`}
                    />
                    {errors.name && <span className="text-[11px] text-red-400 mt-1 block font-medium">{errors.name}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      E-mail <span className="text-red-400">*</span>
                    </label>
                    <input
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      placeholder="contato@suaempresa.com.br"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border text-xs sm:text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all ${
                        errors.email ? 'border-red-500 ring-1 ring-red-500/50' : 'border-[#222B3D]'
                      }`}
                    />
                    {errors.email && <span className="text-[11px] text-red-400 mt-1 block font-medium">{errors.email}</span>}
                  </div>
                </div>

                {/* WhatsApp & Project Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      WhatsApp com DDD <span className="text-red-400">*</span>
                    </label>
                    <input
                      ref={whatsappRef}
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => {
                        setWhatsapp(e.target.value);
                        if (errors.whatsapp) setErrors(prev => ({ ...prev, whatsapp: '' }));
                      }}
                      placeholder="(11) 99999-9999"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border text-xs sm:text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all ${
                        errors.whatsapp ? 'border-red-500 ring-1 ring-red-500/50' : 'border-[#222B3D]'
                      }`}
                    />
                    {errors.whatsapp && <span className="text-[11px] text-red-400 mt-1 block font-medium">{errors.whatsapp}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      Tipo de Projeto <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value as ProjectType)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all"
                    >
                      <option value="site_institucional">Site Institucional</option>
                      <option value="landing_page">Landing Page</option>
                      <option value="pagina_de_vendas">Página de Vendas</option>
                      <option value="site_comercio">Site para Comércio / Restaurante</option>
                      <option value="pagina_curso">Página para Curso / Treinamento</option>
                      <option value="projeto_personalizado">Projeto Personalizado</option>
                    </select>
                  </div>
                </div>

                {/* Business Segment & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      Segmento do Negócio
                    </label>
                    <input
                      type="text"
                      value={businessSegment}
                      onChange={(e) => setBusinessSegment(e.target.value)}
                      placeholder="Ex: Advocacia, Odontologia, Engenharia..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      Faixa de Orçamento Estimada
                    </label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all"
                    >
                      <option value="A definir na proposta">A definir na proposta técnica</option>
                      <option value="Até R$ 1.200">Até R$ 1.200</option>
                      <option value="R$ 1.200 a R$ 2.500">R$ 1.200 a R$ 2.500</option>
                      <option value="R$ 2.500 a R$ 5.000">R$ 2.500 a R$ 5.000</option>
                      <option value="Acima de R$ 5.000">Acima de R$ 5.000</option>
                    </select>
                  </div>
                </div>

                {/* Timeline & Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      Prazo Desejado
                    </label>
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all"
                    >
                      <option value="Prazo regular (10 a 20 dias)">Prazo regular (10 a 20 dias úteis)</option>
                      <option value="Urgente (5 a 10 dias)">Urgente (5 a 10 dias úteis)</option>
                      <option value="Flexível / Sem urgência">Flexível / Sem data limite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      Site de Referência ou Link (opcional)
                    </label>
                    <input
                      type="text"
                      value={referenceUrl}
                      onChange={(e) => setReferenceUrl(e.target.value)}
                      placeholder="https://exemplo.com.br"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Descrição do Projeto e Necessidades
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Conte sobre sua empresa, quais seções precisa no site e qual é o público que deseja atingir..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all"
                  />
                </div>

                {/* Validation Banner near submit button */}
                {Object.keys(errors).length > 0 && !errors.general && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Por favor, preencha os campos obrigatórios em destaque acima para enviar sua solicitação.</span>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#0866FF]/25 cursor-pointer transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Validando e registrando solicitação...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Solicitação de Orçamento
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Dedicated Success Confirmation Modal (Círculo verde e sinal de V na frente da tela) */}
      <SuccessQuoteModal
        quote={submittedQuote}
        isOpen={!!submittedQuote}
        onClose={handleReset}
        settings={settings}
      />
    </div>
  );
};
