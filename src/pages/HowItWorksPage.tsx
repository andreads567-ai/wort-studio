import React from 'react';
import { ArrowRight, CheckCircle2, FileCheck, Code, Globe2, HelpCircle } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/initialData';
import { AnimatedWatermark } from '../components/AnimatedWatermark';

interface HowItWorksPageProps {
  onRequestQuote: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onRequestQuote }) => {
  const detailedSteps = [
    {
      number: '01',
      title: 'Escolha do Serviço e Primeiro Contato',
      subtitle: 'Entendendo seu objetivo principal',
      description: 'Você entra em contato pelo formulário ou WhatsApp informando qual solução precisa (site institucional, landing page para anúncios, página de vendas ou projeto customizado). Avaliamos o escopo preliminar e enviamos as primeiras orientações.',
      clientProvides: 'Informações básicas sobre o negócio, segmento de atuação e objetivo principal da página.',
      wortDelivers: 'Direcionamento sobre o melhor formato, estimativa preliminar de prazo e proposta comercial formal.'
    },
    {
      number: '02',
      title: 'Briefing e Alinhamento Estrutural',
      subtitle: 'Definindo a arquitetura e os conteúdos',
      description: 'Após a aprovação da proposta, iniciamos a coleta estruturada de informações. Mapeamos as seções necessárias, a identidade visual da sua marca (logotipo, cores, tipografia) e os pontos de conversão para WhatsApp e formulários.',
      clientProvides: 'Logotipo em alta resolução, paleta de cores (se houver), textos base e fotos do espaço ou equipe.',
      wortDelivers: 'Roteiro de seções aprovado, definição do fluxo de navegação e planejamento do layout responsivo.'
    },
    {
      number: '03',
      title: 'Desenvolvimento e Homologação',
      subtitle: 'Construção da página em ambiente protegido',
      description: 'Nossa equipe desenvolve a página aplicando padrões modernos de código, carregamento rápido e perfeita adaptação para smartphones, tablets e computadores. Você recebe um link de homologação exclusivo para testar e validar cada detalhe.',
      clientProvides: 'Revisão das informações inseridas e apontamento de eventuais ajustes necessários dentro do escopo contratado.',
      wortDelivers: 'Página funcional completa publicada em link temporário de demonstração para sua aprovação final.'
    },
    {
      number: '04',
      title: 'Aprovação e Publicação Oficial',
      subtitle: 'Seu negócio visível para o mundo',
      description: 'Com a homologação formal concluída e as condições acordadas cumpridas, efetuamos a migração para seu domínio definitivo (ex.: www.suaempresa.com.br), configuramos os certificados de segurança SSL e entregamos o projeto pronto para receber visitas.',
      clientProvides: 'Acesso aos apontamentos DNS do domínio contratado (orientado passo a passo por nós).',
      wortDelivers: 'Site 100% no ar, formulários testados, botões de WhatsApp checados e projeto devidamente concluído.'
    }
  ];

  const faqs = [
    {
      question: 'Eu preciso ter o domínio e a hospedagem antes de contratar?',
      answer: 'Não necessariamente. Você pode iniciar o desenvolvimento conosco primeiro. Durante o processo de criação, orientamos exatamente como registrar o domínio no Registro.br e qual serviço de hospedagem melhor atende ao seu projeto.'
    },
    {
      question: 'O site funcionará bem no celular e no WhatsApp?',
      answer: 'Sim, absolutamente. Todo o layout é construído pensando primeiro na usabilidade em telas de celulares (mobile-first), com botões de chamada rápida para seu WhatsApp comercial em pontos estratégicos da navegação.'
    },
    {
      question: 'Consigo aprovar o site antes dele ir ao ar?',
      answer: 'Com certeza. Antes de qualquer publicação no domínio definitivo, disponibilizamos um link de homologação exclusivo para você navegar, conferir textos, testar botões e validar o resultado final com tranquilidade.'
    },
    {
      question: 'A WortSite garante que vou triplicar minhas vendas com o site?',
      answer: 'Nossa postura é de total transparência e profissionalismo: não fazemos promessas mágicas de faturamento ou posições no Google. O que garantimos é uma presença digital sólida, rápida, profissional e focada em valorizar a sua marca para que você apresente seus serviços com credibilidade.'
    }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Animated Background Watermark */}
      <AnimatedWatermark opacity={0.08} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold tracking-wider uppercase text-[#00CFFF]">
          Fluxo de Trabalho Transparente
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2 mb-4">
          Como Funciona o Processo
        </h1>
        <p className="text-sm sm:text-base text-[#B8C1D1] leading-relaxed">
          Da ideia à página publicada: conheça detalhadamente as etapas que garantem qualidade técnica, cumprimento de prazos e alinhamento com seu negócio.
        </p>
      </div>

      {/* Detailed Steps */}
      <div className="space-y-8">
        {detailedSteps.map((step) => (
          <div
            key={step.number}
            className="p-8 sm:p-10 rounded-3xl bg-[#0D1322] border border-[#1E293B] hover:border-[#0866FF]/40 transition-all shadow-xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              <div className="lg:w-7/12 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-[#0866FF] font-mono">
                    {step.number}
                  </span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {step.title}
                    </h2>
                    <p className="text-xs text-[#00CFFF] font-medium">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#B8C1D1] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Responsibilities Box */}
              <div className="lg:w-5/12 p-5 rounded-2xl bg-[#171D2B] border border-[#222B3D] space-y-3.5 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider block mb-1">
                    O que você fornece:
                  </span>
                  <p className="text-[#B8C1D1]">{step.clientProvides}</p>
                </div>
                <div className="pt-2 border-t border-[#222B3D]">
                  <span className="text-[11px] font-bold text-[#00CFFF] uppercase tracking-wider block mb-1">
                    O que a WortSite entrega:
                  </span>
                  <p className="text-[#B8C1D1]">{step.wortDelivers}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#0E131F] border border-[#222B3D]">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <HelpCircle className="w-8 h-8 text-[#0866FF] mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white tracking-tight">
            Perguntas Frequentes Sobre o Processo
          </h3>
          <p className="text-xs sm:text-sm text-[#B8C1D1] mt-1">
            Respostas claras para as dúvidas mais comuns antes de iniciar seu projeto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, fIdx) => (
            <div key={fIdx} className="p-5 rounded-2xl bg-[#171D2B]/70 border border-[#222B3D]">
              <h4 className="text-sm font-bold text-white mb-2">
                {faq.question}
              </h4>
              <p className="text-xs text-[#B8C1D1] leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onRequestQuote}
          className="px-8 py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white font-semibold text-sm inline-flex items-center gap-2 shadow-xl shadow-[#0866FF]/25 cursor-pointer"
        >
          Iniciar Meu Projeto com a WortSite
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      </div>
    </div>
  );
};
