import React from 'react';
import { Mail, Clock, MapPin, Shield, MessageCircle, ArrowRight, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { CommercialSettings } from '../types';
import { buildWhatsAppUrl } from '../services/api';
import { Logo } from './Logo';

interface FooterProps {
  settings: CommercialSettings;
  onNavigate: (tab: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onRequestQuote: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigate,
  onOpenPrivacy,
  onOpenTerms,
  onRequestQuote
}) => {
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Olá, WortSite! Gostaria de mais informações sobre criação de sites e landing pages.'
  );

  return (
    <footer className="bg-[#05070D] border-t border-[#171D2B] pt-16 pb-12 text-[#B8C1D1] text-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 5-Column Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 pb-12 border-b border-[#171D2B]">
          {/* Column 1: Brand & Presentation */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center">
              <Logo variant="full" className="h-8 w-auto" />
            </div>

            <p className="text-xs text-[#B8C1D1] leading-relaxed">
              Criamos sites, landing pages e páginas de vendas para empresas, profissionais e empreendedores que querem fortalecer sua presença digital.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#171D2B] hover:bg-[#0866FF] text-[#B8C1D1] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#171D2B] hover:bg-[#0866FF] text-[#B8C1D1] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#171D2B] hover:bg-[#0866FF] text-[#B8C1D1] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#171D2B] hover:bg-[#0866FF] text-[#B8C1D1] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Serviços */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Serviços
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('servicos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Sites Institucionais
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('servicos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Landing Pages
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('servicos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Páginas de Vendas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('servicos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Projetos Personalizados
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Modelos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Modelos
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('modelos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Empresas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('modelos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Serviços Profissionais
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('modelos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Saúde e Estética
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('modelos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Restaurantes e Comércio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('modelos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Cursos e Educação
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('modelos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Produtos Digitais
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('modelos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Eventos e Campanhas
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Institucional */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Institucional
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('planos')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Planos e Preços
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('como-funciona')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Como Funciona
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('sobre')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Sobre a WortSite
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contato')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Contato
                </button>
              </li>
              <li className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="text-[11px] text-[#B8C1D1]/60 hover:text-[#00CFFF] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Shield className="w-3 h-3" />
                  Painel de Gestão
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Contato */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Contato
            </h4>
            <div className="space-y-3">
              <button
                type="button"
                onClick={onRequestQuote}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0866FF]/25 hover:shadow-[#0866FF]/40 transition-all cursor-pointer"
              >
                <span>Solicitar orçamento</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-3 space-y-2 text-xs">
                <div>
                  <button
                    type="button"
                    onClick={onOpenPrivacy}
                    className="hover:text-white transition-colors text-left cursor-pointer block"
                  >
                    Política de Privacidade
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={onOpenTerms}
                    className="hover:text-white transition-colors text-left cursor-pointer block"
                  >
                    Termos de Uso
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B8C1D1]/70">
          <div>
            © 2026 WortSite. Todos os direitos reservados.
          </div>
          <div>
            Desenvolvido com tecnologia e foco em resultados.
          </div>
        </div>
      </div>
    </footer>
  );
};
