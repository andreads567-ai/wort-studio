import React, { useState, useMemo } from 'react';
import { Search, Eye, ArrowRight, CheckCircle, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { DemoModel, ModelCategory } from '../types';

interface ModelsPageProps {
  models: DemoModel[];
  onOpenModelDemo: (model: DemoModel) => void;
  onRequestQuoteWithModel: (model: DemoModel) => void;
}

export const ModelsPage: React.FC<ModelsPageProps> = ({
  models,
  onOpenModelDemo,
  onRequestQuoteWithModel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const categories: { id: string; label: string }[] = [
    { id: 'todas', label: 'Todas as Categorias' },
    { id: 'Empresas', label: 'Empresas' },
    { id: 'Serviços profissionais', label: 'Serviços Profissionais' },
    { id: 'Saúde e estética', label: 'Saúde e Estética' },
    { id: 'Restaurantes e comércios', label: 'Restaurantes e Comércios' },
    { id: 'Cursos e educação', label: 'Cursos e Educação' },
    { id: 'Produtos digitais', label: 'Produtos Digitais' },
    { id: 'Eventos e campanhas', label: 'Eventos e Campanhas' }
  ];

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesCategory =
        selectedCategory === 'todas' || model.category === selectedCategory;

      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [models, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Page Title & Intro */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold tracking-wider uppercase text-[#00CFFF]">
          Biblioteca Demonstrativa Original
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2 mb-4">
          Modelos de Sites e Landing Pages
        </h1>
        <p className="text-sm sm:text-base text-[#B8C1D1] leading-relaxed">
          Explore nossas referências conceituais para visualizar a estrutura, tipografia e organização de seções. Cada modelo pode ser adaptado para atender às características e objetivos da sua empresa.
        </p>
      </div>

      {/* Distinction Notice */}
      <div className="p-4 rounded-xl bg-[#0E131F] border border-[#222B3D] text-xs text-[#B8C1D1] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00CFFF] shrink-0" />
          <span>
            <strong className="text-white">Modelos Demonstrativos:</strong> São conceitos originais criados pela WortSite para orientar sua escolha de layout.
          </span>
        </div>
        <span className="text-[11px] text-[#B8C1D1]/70">
          Projetos publicados para clientes respeitam contratos de exclusividade.
        </span>
      </div>

      {/* Search Bar & Category Filter Controls */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C1D1]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por segmento, nome ou palavra-chave..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0E131F] border border-[#222B3D] text-xs sm:text-sm text-white placeholder-[#B8C1D1]/50 focus:outline-none focus:ring-2 focus:ring-[#0866FF] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#B8C1D1] hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0866FF] text-white shadow-md shadow-[#0866FF]/25 font-semibold'
                    : 'bg-[#171D2B] text-[#B8C1D1] hover:text-white hover:bg-[#222B3D]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0E131F] border border-[#222B3D]">
          <p className="text-sm text-[#B8C1D1] mb-3">
            Nenhum modelo encontrado para os critérios pesquisados.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('todas');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-[#171D2B] hover:bg-[#222B3D] text-xs text-white"
          >
            Redefinir filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="rounded-2xl bg-[#0D1322] border border-[#1E293B] hover:border-[#0866FF]/60 transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xl"
            >
              {/* Preview Image with Browser Bar */}
              <div className="relative overflow-hidden bg-[#05070D]">
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

                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={model.previewImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1322] via-[#0D1322]/40 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#0866FF]/85 backdrop-blur-md text-[10px] font-semibold text-white shadow-md">
                      {model.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                    {model.name}
                  </h3>
                  <p className="text-xs text-[#B8C1D1] leading-relaxed mb-5">
                    {model.description}
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-[#B8C1D1]">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider block mb-1">
                      Destaques da Estrutura:
                    </span>
                    {model.features.slice(0, 3).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#00CFFF] shrink-0 mt-0.5" />
                        <span className="text-[11px]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => onOpenModelDemo(model)}
                    className="py-2.5 px-3 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] text-[#B8C1D1] hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#222B3D]"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#00CFFF]" />
                    Visualizar modelo
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestQuoteWithModel(model)}
                    className="py-2.5 px-3 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#0866FF]/20 cursor-pointer"
                  >
                    Quero esse
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
