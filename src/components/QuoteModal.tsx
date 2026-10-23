import React, { useState, useRef } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, MessageCircle, Clock, ShieldCheck, Send, RefreshCw } from 'lucide-react';
import { ProjectType, CommercialSettings, DemoModel, QuoteRequest } from '../types';
import { api, buildWhatsAppUrl } from '../services/api';
import { SuccessCheckmark } from './SuccessCheckmark';
import { SuccessQuoteModal } from './SuccessQuoteModal';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CommercialSettings;
  selectedModel?: DemoModel | null;
  selectedPlanName?: string | null;
  initialProjectType?: ProjectType;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  settings,
  selectedModel,
  selectedPlanName,
  initialProjectType = 'site_institucional'
}) => {
  // Form Refs for Auto-scroll
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const whatsappInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>(initialProjectType);
  const [businessSegment, setBusinessSegment] = useState('');
  const [budgetRange, setBudgetRange] = useState('A definir na proposta');
  const [timeline, setTimeline] = useState('Prazo regular (10 a 20 dias)');
  const [description, setDescription] = useState(
    selectedModel
      ? `Interesse no modelo demonstrativo "${selectedModel.name}" (${selectedModel.category}).`
      : selectedPlanName
      ? `Interesse na contratação do plano "${selectedPlanName}".`
      : ''
  );
  const [referenceUrl, setReferenceUrl] = useState('');

  // Status & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<QuoteRequest | null>(null);
  const [backendSaved, setBackendSaved] = useState<boolean | null>(null);

  if (!isOpen) return null;

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
      errs.email = 'Informe um endereço de e-mail válido (exemplo: seu@email.com).';
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

    // Auto-scroll to the first invalid field so the user is never confused
    if (Object.keys(errs).length > 0) {
      if (errs.name && nameInputRef.current) {
        nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nameInputRef.current.focus();
      } else if (errs.email && emailInputRef.current) {
        emailInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        emailInputRef.current.focus();
      } else if (errs.whatsapp && whatsappInputRef.current) {
        whatsappInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        whatsappInputRef.current.focus();
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
    setErrors({});

    try {
      const result = await api.submitQuote({
        name,
        email,
        whatsapp,
        projectType,
        businessSegment,
        budgetRange,
        timeline,
        description: referenceUrl ? `${description}\nReferência: ${referenceUrl}` : description,
        referenceModelId: selectedModel?.id
      });

      if (result.success && result.quote) {
        setSubmittedQuote(result.quote);
        setBackendSaved(result.isBackendConnected);
      } else {
        setErrors({ general: result.error || 'Não foi possível registrar o orçamento. Tente pelo WhatsApp direto.' });
      }
    } catch (err) {
      setErrors({ general: 'Erro de comunicação ao enviar dados. Por favor, utilize o contato via WhatsApp.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedQuote(null);
    setBackendSaved(null);
    setErrors({});
    setName('');
    setEmail('');
    setWhatsapp('');
    setDescription('');
    setReferenceUrl('');
    onClose();
  };

  // Pre-formatted WhatsApp link for the completed quote
  const buildPostQuoteWhatsAppUrl = () => {
    if (!submittedQuote) return '#';
    const msg = `Olá, Wort Studio! Acabei de enviar uma solicitação de proposta no site:\n\n*Protocolo:* ${submittedQuote.protocol}\n*Nome:* ${submittedQuote.name}\n*Tipo:* ${submittedQuote.projectType}\n*Segmento:* ${submittedQuote.businessSegment}\n\nGostaria de dar sequência ao atendimento!`;
    return buildWhatsAppUrl(settings.whatsappNumber, msg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070D]/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0D1322] rounded-3xl border border-[#1E293B] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#121B30] border-b border-[#1E293B]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Solicitação de Orçamento</span>
              {selectedModel && (
                <span className="text-xs font-normal text-[#00CFFF]">
                  · Modelo: {selectedModel.name}
                </span>
              )}
            </h3>
            <p className="text-xs text-[#B8C1D1]">
              Preencha os dados abaixo para receber uma proposta técnica sob medida.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#172238] text-[#B8C1D1] hover:text-white hover:bg-[#23314E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Success Screen OR Form */}
        {submittedQuote ? (
          <div className="p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Animated Green Circle with Checkmark 'V' (Círculo Verde com Sinal de V) */}
            <div className="py-2">
              <SuccessCheckmark size="lg" className="mx-auto" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-3 shadow-sm shadow-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Protocolo: {submittedQuote.protocol}
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
                Solicitação Enviada com Sucesso!
              </h4>
              <p className="text-xs sm:text-sm text-[#B8C1D1] max-w-md mx-auto leading-relaxed">
                Recebemos sua solicitação de proposta para <strong className="text-white">{submittedQuote.name}</strong>. Nossa equipe analisará seu escopo e retornará em até 24 horas úteis.
              </p>
            </div>

            {/* Storage status notification */}
            <div className="p-3.5 rounded-xl bg-[#172238] border border-[#23314E] text-left text-xs space-y-1">
              <div className="flex items-center gap-2 text-white font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {backendSaved
                    ? 'Registro gravado com sucesso no servidor Wort Studio'
                    : 'Solicitação registrada com sucesso no dispositivo'}
                </span>
              </div>
              <p className="text-[11px] text-[#B8C1D1]">
                {backendSaved
                  ? 'Os dados do projeto foram arquivados com segurança no banco operacional para análise técnica imediata.'
                  : 'Para agilizar o atendimento imediato, recomendamos encaminhar o protocolo diretamente ao nosso WhatsApp comercial.'}
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-[#05070D] border border-[#222B3D] text-left text-xs grid grid-cols-2 gap-3 text-[#B8C1D1]">
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/70">Tipo de Projeto</span>
                <span className="text-white font-medium capitalize">{submittedQuote.projectType.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/70">Prazo Desejado</span>
                <span className="text-white font-medium">{submittedQuote.timeline}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/70">E-mail</span>
                <span className="text-white font-medium truncate block">{submittedQuote.email}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/70">WhatsApp</span>
                <span className="text-white font-medium">{submittedQuote.whatsapp}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href={buildPostQuoteWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0866FF]/25 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Continuar no WhatsApp Comercial
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-3 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] text-[#B8C1D1] hover:text-white text-xs sm:text-sm font-medium transition-colors"
              >
                Concluir e Fechar
              </button>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {errors.general && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Nome Completo <span className="text-red-400">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="Ex: Carlos Oliveira"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border text-xs sm:text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all ${
                    errors.name ? 'border-red-500 ring-1 ring-red-500/50' : 'border-[#222B3D]'
                  }`}
                />
                {errors.name && <span className="text-[11px] text-red-400 mt-1 block font-medium">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  E-mail de Contato <span className="text-red-400">*</span>
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="seu@empresa.com.br"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border text-xs sm:text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all ${
                    errors.email ? 'border-red-500 ring-1 ring-red-500/50' : 'border-[#222B3D]'
                  }`}
                />
                {errors.email && <span className="text-[11px] text-red-400 mt-1 block font-medium">{errors.email}</span>}
              </div>
            </div>

            {/* Row 2: WhatsApp & Project Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  WhatsApp com DDD <span className="text-red-400">*</span>
                </label>
                <input
                  ref={whatsappInputRef}
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

            {/* Row 3: Business Segment & Budget Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Segmento do Negócio
                </label>
                <input
                  type="text"
                  value={businessSegment}
                  onChange={(e) => setBusinessSegment(e.target.value)}
                  placeholder="Ex: Consultoria, Saúde, Gastronomia..."
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

            {/* Row 4: Timeline & Reference */}
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
                  <option value="Flexível / Sem urgência">Flexível / Sem data fixa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">
                  Referência de Site ou Link (opcional)
                </label>
                <input
                  type="text"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://exemplo.com.br ou nome de modelo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1">
                Descrição do Projeto e Objetivos
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conte brevemente sobre o seu negócio, os serviços que deseja apresentar e quais objetivos espera alcançar com o site..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all"
              />
            </div>

            {/* Privacy notice */}
            <div className="text-[11px] text-[#B8C1D1]/70 leading-relaxed pt-1">
              Seus dados de contato são utilizados exclusivamente pela equipe comercial da WortSite para elaboração da proposta solicitada, em conformidade com as diretrizes da LGPD.
            </div>

            {/* Validation Banner near submit button */}
            {Object.keys(errors).length > 0 && !errors.general && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Por favor, preencha os campos obrigatórios em destaque acima para enviar sua solicitação.</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#222B3D]">
              <a
                href={buildWhatsAppUrl(
                  settings.whatsappNumber,
                  'Olá, Wort Studio! Gostaria de falar diretamente com um consultor para entender as opções de sites e orçamentos.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#00CFFF] hover:underline flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                Prefere falar direto pelo WhatsApp?
              </a>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0866FF]/25 cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Enviando solicitação...
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
