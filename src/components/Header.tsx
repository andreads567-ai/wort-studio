import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Shield } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onRequestQuote: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate, onRequestQuote }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'inicio', label: 'Início' },
    { id: 'modelos', label: 'Modelos' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'planos', label: 'Planos' },
    { id: 'como-funciona', label: 'Como Funciona' },
    { id: 'propostas', label: 'Orçamentos & Propostas' },
    { id: 'sobre', label: 'Sobre' },
    { id: 'contato', label: 'Contato' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#05070D]/95 backdrop-blur-md border-b border-[#1E293B] py-3.5 shadow-2xl shadow-black/60'
          : 'bg-[#05070D]/75 backdrop-blur-md border-b border-[#171D2B]/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => handleNavClick('inicio')}
            className="flex items-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866FF] rounded-lg p-1 transition-transform hover:scale-105"
            aria-label="Wort Studio Início"
          >
            <Logo variant="full" className="h-8 sm:h-9 w-auto" />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866FF] rounded-md ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-[#B8C1D1] hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#0866FF] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                activeTab === 'admin'
                  ? 'border-[#0866FF] text-[#0866FF] bg-[#0866FF]/10'
                  : 'border-[#171D2B] text-[#B8C1D1] hover:text-white hover:bg-[#171D2B]'
              }`}
              title="Área Administrativa"
            >
              <Shield className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onRequestQuote}
              className="px-5 py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#0866FF]/25 hover:shadow-[#0866FF]/40 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0866FF]"
            >
              Solicitar orçamento
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onRequestQuote}
              className="px-3 py-1.5 rounded-lg bg-[#0866FF] text-white text-xs font-semibold"
            >
              Orçamento
            </button>
            <button
              type="button"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2.5 rounded-lg bg-[#171D2B] text-white hover:bg-[#222B3D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0866FF]"
              aria-label={isMobileOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-[#05070D]/98 backdrop-blur-xl border-b border-[#171D2B] shadow-2xl p-6 transition-all duration-300">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left text-base font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#171D2B] text-white border-l-4 border-[#0866FF]'
                      : 'text-[#B8C1D1] hover:text-white hover:bg-[#171D2B]/50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#0866FF]" />}
                </button>
              );
            })}

            <div className="pt-4 mt-2 border-t border-[#171D2B] flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsMobileOpen(false);
                  onRequestQuote();
                }}
                className="w-full py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0866FF]/20"
              >
                Solicitar orçamento
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className="w-full py-2.5 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] text-[#B8C1D1] text-xs font-medium flex items-center justify-center gap-2"
              >
                <Shield className="w-3.5 h-3.5 text-[#00CFFF]" />
                Área de Gestão & Painel
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
