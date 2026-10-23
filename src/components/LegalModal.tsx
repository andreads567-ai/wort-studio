import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070D]/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0E131F] rounded-2xl border border-[#222B3D] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 bg-[#171D2B] border-b border-[#222B3D]">
          <div className="flex items-center gap-2.5">
            {isPrivacy ? (
              <ShieldCheck className="w-5 h-5 text-[#00CFFF]" />
            ) : (
              <FileText className="w-5 h-5 text-[#0866FF]" />
            )}
            <h3 className="text-base font-bold text-white tracking-tight">
              {isPrivacy ? 'Política de Privacidade' : 'Termos de Uso e Escopo de Serviços'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0E131F] text-[#B8C1D1] hover:text-white hover:bg-[#222B3D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-xs sm:text-sm text-[#B8C1D1] space-y-4 max-h-[70vh] overflow-y-auto leading-relaxed">
          {isPrivacy ? (
            <>
              <p>
                A <strong className="text-white">WortSite</strong> valoriza a privacidade e a segurança das informações compartilhadas por visitantes e contratantes. Esta política descreve como tratamos os dados coletados neste site, em estrita conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD).
              </p>

              <h4 className="text-sm font-bold text-white pt-2">1. Dados Coletados no Formulário de Orçamento</h4>
              <p>
                Coletamos nome completo, endereço de e-mail, número de telefone (WhatsApp), segmento de atuação, faixa de investimento estimada e descrição das necessidades do projeto. Esses dados são fornecidos voluntariamente pelo usuário para a finalidade específica de receber uma proposta comercial técnica.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">2. Finalidade do Tratamento</h4>
              <p>
                Os dados são utilizados exclusivamente para: elaboração do orçamento solicitado, contato comercial para esclarecimento de dúvidas técnicas, envio de propostas e atendimento via WhatsApp ou e-mail. Não comercializamos, cedemos ou compartilhamos dados pessoais com terceiros para fins de marketing não autorizado.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">3. Segurança e Armazenamento</h4>
              <p>
                Adotamos medidas técnicas de segurança para proteger os dados contra acessos não autorizados e situações acidentais ou ilícitas de destruição, perda ou alteração.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">4. Direitos do Titular</h4>
              <p>
                O titular dos dados pode solicitar a qualquer momento a confirmação da existência de tratamento, a correção de dados incompletos ou a exclusão dos dados através de nossos canais oficiais de contato.
              </p>
            </>
          ) : (
            <>
              <p>
                Estes termos estabelecem as diretrizes operacionais e o escopo de serviços de desenvolvimento web prestados pela <strong className="text-white">WortSite</strong>.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">1. Escopo de Trabalho e Modelos Demonstrativos</h4>
              <p>
                Os modelos demonstrativos exibidos no catálogo deste site são referências conceituais originais. O projeto final de cada cliente é construído com base no briefing acordado, aplicando a identidade visual, textos, imagens e requisitos fornecidos pelo contratante.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">2. Infraestrutura, Domínio e Hospedagem</h4>
              <p>
                Custos recorrentes de registro de domínio (ex.: Registro.br), provedor de hospedagem de páginas, licenças de plugins de terceiros ou serviços externos são de responsabilidade do cliente, cabendo à WortSite orientar e auxiliar nas configurações técnicas necessárias.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">3. Distinção de Escopo de Comércio Eletrônico</h4>
              <p>
                Nossas páginas institucionais, landing pages e páginas de vendas focam na apresentação e geração de contatos comerciais. Funcionalidades complexas de lojas virtuais (carrinho de compras persistente, cálculo dinâmico de frete integrado a transportadoras, emissão fiscal e checkout transacional nativo) são tratadas exclusivamente sob demanda em Projetos Personalizados formalizados em contrato.
              </p>

              <h4 className="text-sm font-bold text-white pt-2">4. Etapas de Aprovação e Publicação</h4>
              <p>
                Todo projeto passa por etapa de homologação e revisão pelo cliente antes da publicação definitiva em ambiente de produção, garantindo conformidade com o escopo pactuado.
              </p>
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-[#171D2B] border-t border-[#222B3D] text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs font-semibold"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
