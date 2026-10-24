import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Edit3,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  ListPlus,
  ShieldAlert,
  Sliders,
  FolderPlus,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { ScopeModule, SubscopeItem } from '../../types';
import { PROJECT_TEMPLATES } from '../../data/proposalTemplates';

interface HierarchicalScopeEditorProps {
  modules: ScopeModule[];
  onChange: (modules: ScopeModule[]) => void;
  outrosModulos?: { id: string; codigo: string; nome: string; descricao: string }[];
  onOutrosModulosChange?: (outros: { id: string; codigo: string; nome: string; descricao: string }[]) => void;
}

export const HierarchicalScopeEditor: React.FC<HierarchicalScopeEditorProps> = ({
  modules,
  onChange,
  outrosModulos = [],
  onOutrosModulosChange
}) => {
  // Modal / Drawer de edição de Módulo
  const [editingModule, setEditingModule] = useState<{
    index: number | null;
    data: Partial<ScopeModule>;
  } | null>(null);

  // Modal / Drawer de edição de Subescopo
  const [editingSubscope, setEditingSubscope] = useState<{
    moduleIndex: number;
    subscopeIndex: number | null;
    data: Partial<SubscopeItem>;
  } | null>(null);

  // Modal de template selector
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);

  // Confirmação de exclusão
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'module' | 'subscope' | 'outro';
    mIndex: number;
    sIndex?: number;
    title: string;
  } | null>(null);

  // Tag inputs temporários para listas (ações, regras, etc.)
  const [tempTagInput, setTempTagInput] = useState<{
    field: 'acoes' | 'regras' | 'campos' | 'validacoes' | 'alertas' | 'criteriosAceite';
    value: string;
  }>({ field: 'acoes', value: '' });

  // ---------------------------------------------------------------------------
  // Manipulação de Módulos
  // ---------------------------------------------------------------------------
  const handleAddModule = () => {
    const nextNum = modules.length + 1;
    const newMod: ScopeModule = {
      id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      codigo: `MÓDULO ${nextNum}`,
      nome: `NOVO MÓDULO ${nextNum}`,
      descricao: '',
      objetivo: '',
      observacoes: '',
      ordem: nextNum,
      subescopos: []
    };
    onChange([...modules, newMod]);
    setEditingModule({ index: modules.length, data: newMod });
  };

  const handleSaveModule = () => {
    if (!editingModule || editingModule.index === null) return;
    const updated = [...modules];
    const current = updated[editingModule.index];
    updated[editingModule.index] = {
      ...current,
      ...editingModule.data,
      nome: (editingModule.data.nome || '').toUpperCase().trim(),
      codigo: (editingModule.data.codigo || `MÓDULO ${editingModule.index + 1}`).toUpperCase().trim()
    } as ScopeModule;
    onChange(updated);
    setEditingModule(null);
  };

  const handleDuplicateModule = (index: number) => {
    const target = modules[index];
    const clonedSubescopos = target.subescopos.map((s, sIdx) => ({
      ...s,
      id: `sub-${Date.now()}-${sIdx}`,
      codigo: `${modules.length + 1}.${sIdx + 1}`
    }));

    const clonedModule: ScopeModule = {
      ...JSON.parse(JSON.stringify(target)),
      id: `mod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      codigo: `MÓDULO ${modules.length + 1}`,
      nome: `${target.nome} (CÓPIA)`,
      ordem: modules.length + 1,
      subescopos: clonedSubescopos
    };

    onChange([...modules, clonedModule]);
  };

  const handleMoveModule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === modules.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...modules];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    // Atualiza ordenação e códigos automáticos
    updated.forEach((m, idx) => {
      m.ordem = idx + 1;
      m.codigo = `MÓDULO ${idx + 1}`;
    });
    onChange(updated);
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'module') {
      const updated = modules.filter((_, idx) => idx !== deleteConfirm.mIndex);
      updated.forEach((m, idx) => {
        m.ordem = idx + 1;
        m.codigo = `MÓDULO ${idx + 1}`;
      });
      onChange(updated);
    } else if (deleteConfirm.type === 'subscope' && deleteConfirm.sIndex !== undefined) {
      const updated = [...modules];
      const targetMod = updated[deleteConfirm.mIndex];
      targetMod.subescopos = targetMod.subescopos.filter((_, sIdx) => sIdx !== deleteConfirm.sIndex);
      targetMod.subescopos.forEach((s, sIdx) => {
        s.ordem = sIdx + 1;
        s.codigo = `${deleteConfirm.mIndex + 1}.${sIdx + 1}`;
      });
      onChange(updated);
    } else if (deleteConfirm.type === 'outro' && onOutrosModulosChange) {
      const updated = outrosModulos.filter((_, idx) => idx !== deleteConfirm.mIndex);
      onOutrosModulosChange(updated);
    }
    setDeleteConfirm(null);
  };

  // ---------------------------------------------------------------------------
  // Manipulação de Subescopos
  // ---------------------------------------------------------------------------
  const handleAddSubscope = (mIndex: number) => {
    const parentMod = modules[mIndex];
    const nextSubNum = (parentMod.subescopos?.length || 0) + 1;
    const newSub: SubscopeItem = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      codigo: `${mIndex + 1}.${nextSubNum}`,
      nome: `Nova Funcionalidade ${nextSubNum}`,
      objetivo: '',
      descricao: '',
      acoes: [],
      regras: [],
      campos: [],
      validacoes: [],
      alertas: [],
      criteriosAceite: [],
      ordem: nextSubNum
    };

    setEditingSubscope({
      moduleIndex: mIndex,
      subscopeIndex: null,
      data: newSub
    });
  };

  const handleSaveSubscope = () => {
    if (!editingSubscope) return;
    const { moduleIndex, subscopeIndex, data } = editingSubscope;
    const updatedModules = [...modules];
    const parentMod = updatedModules[moduleIndex];
    if (!parentMod.subescopos) parentMod.subescopos = [];

    const finalSub: SubscopeItem = {
      id: data.id || `sub-${Date.now()}`,
      codigo: data.codigo || `${moduleIndex + 1}.${(subscopeIndex ?? parentMod.subescopos.length) + 1}`,
      nome: (data.nome || 'Funcionalidade').trim(),
      objetivo: data.objetivo || '',
      descricao: (data.descricao || '').trim(),
      acoes: Array.isArray(data.acoes) ? data.acoes : [],
      regras: Array.isArray(data.regras) ? data.regras : [],
      campos: Array.isArray(data.campos) ? data.campos : [],
      validacoes: Array.isArray(data.validacoes) ? data.validacoes : [],
      alertas: Array.isArray(data.alertas) ? data.alertas : [],
      calculos: Array.isArray(data.calculos) ? data.calculos : [],
      relatorios: Array.isArray(data.relatorios) ? data.relatorios : [],
      integracoes: Array.isArray(data.integracoes) ? data.integracoes : [],
      criteriosAceite: Array.isArray(data.criteriosAceite) ? data.criteriosAceite : [],
      observacoes: data.observacoes || '',
      ordem: subscopeIndex !== null ? (subscopeIndex + 1) : (parentMod.subescopos.length + 1)
    };

    if (subscopeIndex === null) {
      parentMod.subescopos.push(finalSub);
    } else {
      parentMod.subescopos[subscopeIndex] = finalSub;
    }

    onChange(updatedModules);
    setEditingSubscope(null);
  };

  const handleDuplicateSubscope = (mIndex: number, sIndex: number) => {
    const updatedModules = [...modules];
    const parentMod = updatedModules[mIndex];
    const target = parentMod.subescopos[sIndex];
    const cloned: SubscopeItem = JSON.parse(JSON.stringify(target));
    cloned.id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    cloned.nome = `${target.nome} (Cópia)`;
    cloned.codigo = `${mIndex + 1}.${parentMod.subescopos.length + 1}`;
    cloned.ordem = parentMod.subescopos.length + 1;
    parentMod.subescopos.push(cloned);
    onChange(updatedModules);
  };

  const handleMoveSubscope = (mIndex: number, sIndex: number, direction: 'up' | 'down') => {
    const updatedModules = [...modules];
    const parentMod = updatedModules[mIndex];
    if (direction === 'up' && sIndex === 0) return;
    if (direction === 'down' && sIndex === parentMod.subescopos.length - 1) return;
    const targetIdx = direction === 'up' ? sIndex - 1 : sIndex + 1;
    const temp = parentMod.subescopos[sIndex];
    parentMod.subescopos[sIndex] = parentMod.subescopos[targetIdx];
    parentMod.subescopos[targetIdx] = temp;
    parentMod.subescopos.forEach((s, idx) => {
      s.ordem = idx + 1;
      s.codigo = `${mIndex + 1}.${idx + 1}`;
    });
    onChange(updatedModules);
  };

  // Helper para adicionar item a uma lista (ações, regras, etc.) no drawer de subescopo
  const handleAddListItem = (field: 'acoes' | 'regras' | 'campos' | 'validacoes' | 'alertas' | 'criteriosAceite') => {
    if (!editingSubscope || !tempTagInput.value.trim()) return;
    const currentList = Array.isArray(editingSubscope.data[field]) ? [...(editingSubscope.data[field] as string[])] : [];
    currentList.push(tempTagInput.value.trim());
    setEditingSubscope({
      ...editingSubscope,
      data: {
        ...editingSubscope.data,
        [field]: currentList
      }
    });
    setTempTagInput({ field, value: '' });
  };

  const handleRemoveListItem = (field: 'acoes' | 'regras' | 'campos' | 'validacoes' | 'alertas' | 'criteriosAceite', index: number) => {
    if (!editingSubscope) return;
    const currentList = Array.isArray(editingSubscope.data[field]) ? [...(editingSubscope.data[field] as string[])] : [];
    currentList.splice(index, 1);
    setEditingSubscope({
      ...editingSubscope,
      data: {
        ...editingSubscope.data,
        [field]: currentList
      }
    });
  };

  // Carregar Modelo Pronto
  const handleApplyTemplate = (template: typeof PROJECT_TEMPLATES[0], append: boolean) => {
    if (append) {
      const cloned = JSON.parse(JSON.stringify(template.modulos)) as ScopeModule[];
      const offset = modules.length;
      cloned.forEach((m, idx) => {
        m.id = `mod-${Date.now()}-${offset + idx}`;
        m.ordem = offset + idx + 1;
        m.codigo = `MÓDULO ${offset + idx + 1}`;
        m.subescopos.forEach((s, sIdx) => {
          s.id = `sub-${Date.now()}-${offset + idx}-${sIdx}`;
          s.codigo = `${offset + idx + 1}.${sIdx + 1}`;
        });
      });
      onChange([...modules, ...cloned]);
    } else {
      const cloned = JSON.parse(JSON.stringify(template.modulos)) as ScopeModule[];
      cloned.forEach((m, idx) => {
        m.id = `mod-${Date.now()}-${idx}`;
        m.ordem = idx + 1;
        m.codigo = `MÓDULO ${idx + 1}`;
        m.subescopos.forEach((s, sIdx) => {
          s.id = `sub-${Date.now()}-${idx}-${sIdx}`;
          s.codigo = `${idx + 1}.${sIdx + 1}`;
        });
      });
      onChange(cloned);
      if (template.outrosModulos && onOutrosModulosChange) {
        onOutrosModulosChange(JSON.parse(JSON.stringify(template.outrosModulos)));
      }
    }
    setIsTemplateSelectorOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ações Superior do Escopo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#090D18] border border-[#1A2338]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00CFFF]" />
            <h3 className="text-base font-bold text-white tracking-wide">
              4. ESCOPO DO PROJETO (ESTRUTURA HIERÁRQUICA)
            </h3>
          </div>
          <p className="text-xs text-[#8F9CAE] mt-1">
            Cadastre os módulos principais (escopos) e funcionalidades detalhadas (subescopos) com regras e comportamentos.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsTemplateSelectorOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-[#00CFFF] border border-[#00CFFF]/30 hover:bg-[#00CFFF]/10 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Carregar Modelo de Projeto
          </button>

          <button
            type="button"
            onClick={handleAddModule}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-lg shadow-[#0866FF]/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar Módulo (Escopo)
          </button>
        </div>
      </div>

      {/* Lista de Módulos Cadastrados */}
      {modules.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0A0E1A] border border-dashed border-[#1E293B]">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-white mb-1">Nenhum módulo de escopo cadastrado</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            Adicione um módulo do zero ou carregue um dos 14 modelos pré-configurados da Wort Studio para acelerar sua proposta.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsTemplateSelectorOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-[#00CFFF] border border-[#00CFFF]/30 hover:bg-[#00CFFF]/10 cursor-pointer"
            >
              Escolher Modelo Pré-configurado
            </button>
            <button
              type="button"
              onClick={handleAddModule}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0866FF] text-white hover:bg-[#0654D4] cursor-pointer"
            >
              Criar Primeiro Módulo
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map((module, mIdx) => (
            <div
              key={module.id || `mod-${mIdx}`}
              className="rounded-2xl bg-[#0A0F1D] border border-[#172238] overflow-hidden shadow-xl"
            >
              {/* Header do Módulo (Estilo do Mockup Oficial) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-[#0D152A] via-[#0E172F] to-[#0A0F1D] border-b border-[#1E2C4A]">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-[#0866FF] text-white tracking-wider">
                    {module.codigo || `MÓDULO ${mIdx + 1}`}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    {module.nome}
                  </h4>
                  {module.subescopos && (
                    <span className="text-[11px] font-medium text-[#8F9CAE] bg-[#141E34] px-2 py-0.5 rounded-full border border-[#1F2E4D]">
                      {module.subescopos.length} funcionalidade{module.subescopos.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Ações do Módulo */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveModule(mIdx, 'up')}
                    disabled={mIdx === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#19243C] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Mover módulo para cima"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveModule(mIdx, 'down')}
                    disabled={mIdx === modules.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#19243C] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Mover módulo para baixo"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateModule(mIdx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#00CFFF] hover:bg-[#19243C] cursor-pointer"
                    title="Duplicar este módulo e suas funcionalidades"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingModule({ index: mIdx, data: { ...module } })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#0866FF] hover:bg-[#19243C] cursor-pointer"
                    title="Editar informações gerais do módulo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ type: 'module', mIndex: mIdx, title: `${module.codigo}: ${module.nome}` })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer ml-1"
                    title="Excluir este módulo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Descrição do Módulo (se informada) */}
              {module.descricao && (
                <div className="px-5 py-2.5 bg-[#080C17] border-b border-[#141C2E] text-xs text-[#9BB0CD]">
                  <span className="font-semibold text-white">Objetivo do Módulo:</span> {module.descricao}
                </div>
              )}

              {/* Tabela de Subescopos (Funcionalidades) — Layout Exato do Mockup Oficial */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#070B14] border-b border-[#172136] text-[11px] font-bold text-[#8FA4C4] tracking-wider uppercase">
                      <th className="py-2.5 px-4 w-[28%]">SUBESCOPO (FUNCIONALIDADE)</th>
                      <th className="py-2.5 px-4 w-[38%]">DESCRIÇÃO DETALHADA</th>
                      <th className="py-2.5 px-4 w-[26%]">REGRAS E COMPORTAMENTOS</th>
                      <th className="py-2.5 px-3 w-[8%] text-right">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#131B2D]">
                    {(!module.subescopos || module.subescopos.length === 0) ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs text-slate-500">
                          Nenhum subescopo cadastrado neste módulo. Clique em "+ Adicionar Subescopo" abaixo.
                        </td>
                      </tr>
                    ) : (
                      module.subescopos.map((sub, sIdx) => (
                        <tr key={sub.id || `sub-${sIdx}`} className="hover:bg-[#0D1426]/60 transition-colors group">
                          {/* Coluna 1: Subescopo / Funcionalidade */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="flex items-start gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[#0866FF]/15 border border-[#0866FF]/30 flex items-center justify-center text-[#0866FF] shrink-0 mt-0.5">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white tracking-wide">
                                  {sub.codigo} {sub.nome}
                                </div>
                                {sub.objetivo && (
                                  <div className="text-[11px] text-[#7A8C9E] mt-0.5 line-clamp-2">
                                    {sub.objetivo}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Coluna 2: Descrição Detalhada & Ações */}
                          <td className="py-3.5 px-4 align-top text-xs text-[#CBD5E1] space-y-1.5">
                            {sub.descricao ? (
                              <p className="text-[11px] leading-relaxed text-[#D2DAE6]">
                                {sub.descricao}
                              </p>
                            ) : null}

                            {sub.acoes && sub.acoes.length > 0 && (
                              <ul className="space-y-0.5 text-[11px] text-[#A5B4CB] list-disc list-inside">
                                {sub.acoes.map((acao, aIdx) => (
                                  <li key={aIdx} className="leading-snug">
                                    {acao}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>

                          {/* Coluna 3: Regras e Comportamentos */}
                          <td className="py-3.5 px-4 align-top text-xs text-[#9BB0CD]">
                            {sub.regras && sub.regras.length > 0 ? (
                              <ul className="space-y-0.5 text-[11px] text-[#A5B4CB] list-disc list-inside">
                                {sub.regras.map((regra, rIdx) => (
                                  <li key={rIdx} className="leading-snug">
                                    {regra}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">Padrão de desenvolvimento ágil</span>
                            )}

                            {sub.criteriosAceite && sub.criteriosAceite.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-[#162137]">
                                <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">Critérios de Aceite:</span>
                                <ul className="text-[10px] text-emerald-300/80 space-y-0.5 list-disc list-inside">
                                  {sub.criteriosAceite.map((crit, cIdx) => (
                                    <li key={cIdx}>{crit}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </td>

                          {/* Coluna 4: Ações Rápidas */}
                          <td className="py-3.5 px-3 align-top text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveSubscope(mIdx, sIdx, 'up')}
                                disabled={sIdx === 0}
                                className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Mover para cima"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSubscope(mIdx, sIdx, 'down')}
                                disabled={sIdx === (module.subescopos?.length || 0) - 1}
                                className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                                title="Mover para baixo"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateSubscope(mIdx, sIdx)}
                                className="p-1 rounded text-slate-500 hover:text-[#00CFFF] cursor-pointer"
                                title="Duplicar subescopo"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingSubscope({ moduleIndex: mIdx, subscopeIndex: sIdx, data: { ...sub } })}
                                className="p-1 rounded text-slate-500 hover:text-[#0866FF] cursor-pointer"
                                title="Editar funcionalidade"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm({ type: 'subscope', mIndex: mIdx, sIndex: sIdx, title: `${sub.codigo} ${sub.nome}` })}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 cursor-pointer"
                                title="Excluir funcionalidade"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Botão Inferior de Adicionar Subescopo (como no Mockup) */}
              <div className="p-3 bg-[#080D19] border-t border-[#151E33] flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => handleAddSubscope(mIdx)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0866FF]/20 text-[#00CFFF] border border-[#0866FF]/40 hover:bg-[#0866FF]/30 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Subescopo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEÇÃO 5: OUTROS MÓDULOS INCLUÍDOS (Mockup Página 3) */}
      {onOutrosModulosChange && (
        <div className="p-6 rounded-2xl bg-[#090E1C] border border-[#172238] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0866FF]" />
                5. OUTROS MÓDULOS INCLUÍDOS (RESUMIDOS)
              </h4>
              <p className="text-xs text-[#8F9CAE]">
                Módulos complementares integrados que serão apresentados em formato resumido na proposta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextNum = (modules.length + outrosModulos.length + 1);
                onOutrosModulosChange([
                  ...outrosModulos,
                  {
                    id: `outro-${Date.now()}`,
                    codigo: `MÓDULO ${nextNum}`,
                    nome: `MÓDULO ${nextNum}`,
                    descricao: 'Descrição resumida das funcionalidades e regras deste módulo.'
                  }
                ]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111A2E] text-white border border-[#22314E] hover:bg-[#1A2642] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Outro Módulo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {outrosModulos.map((outro, oIdx) => (
              <div
                key={outro.id || `outro-${oIdx}`}
                className="p-3.5 rounded-xl bg-[#060A14] border border-[#1A243A] flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#00CFFF] uppercase tracking-wider">
                      {outro.codigo}
                    </span>
                    <input
                      type="text"
                      value={outro.nome}
                      onChange={(e) => {
                        const updated = [...outrosModulos];
                        updated[oIdx].nome = e.target.value;
                        onOutrosModulosChange(updated);
                      }}
                      className="text-xs font-bold text-white bg-transparent border-b border-transparent focus:border-[#0866FF] focus:outline-none w-full"
                      placeholder="Nome do módulo"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={outro.descricao}
                    onChange={(e) => {
                      const updated = [...outrosModulos];
                      updated[oIdx].descricao = e.target.value;
                      onOutrosModulosChange(updated);
                    }}
                    className="w-full text-[11px] text-slate-300 bg-transparent border border-transparent focus:border-[#1E293B] focus:bg-[#080D1A] rounded p-1 focus:outline-none"
                    placeholder="Descrição das funções incluídas"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm({ type: 'outro', mIndex: oIdx, title: outro.nome })}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 cursor-pointer"
                  title="Remover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL / DRAWER: EDITAR MÓDULO */}
      {/* ===================================================================== */}
      {editingModule && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C1222] border border-[#1E2B47] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-[#080D1A] border-b border-[#16223A]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#0866FF]" />
                Editar Informações do Módulo
              </h3>
              <button
                type="button"
                onClick={() => setEditingModule(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Código</label>
                  <input
                    type="text"
                    value={editingModule.data.codigo || ''}
                    onChange={(e) => setEditingModule({ ...editingModule, data: { ...editingModule.data, codigo: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                    placeholder="MÓDULO 1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome do Módulo *</label>
                  <input
                    type="text"
                    value={editingModule.data.nome || ''}
                    onChange={(e) => setEditingModule({ ...editingModule, data: { ...editingModule.data, nome: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                    placeholder="Ex: FINANCEIRO, COMERCIAL, ESTOQUE..."
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Descrição Geral / Objetivo</label>
                <textarea
                  rows={3}
                  value={editingModule.data.descricao || ''}
                  onChange={(e) => setEditingModule({ ...editingModule, data: { ...editingModule.data, descricao: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                  placeholder="Finalidade principal e escopo abrangido por este módulo..."
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Observações Técnicas</label>
                <input
                  type="text"
                  value={editingModule.data.observacoes || ''}
                  onChange={(e) => setEditingModule({ ...editingModule, data: { ...editingModule.data, observacoes: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                  placeholder="Ex: Requer homologação com API bancária..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-[#080D1A] border-t border-[#16223A] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingModule(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-300 hover:bg-[#16223C] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveModule}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-lg cursor-pointer"
              >
                Salvar Módulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL / DRAWER: EDITAR SUBESCOPO (DETALHAMENTO COMPLETO) */}
      {/* ===================================================================== */}
      {editingSubscope && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C1222] border border-[#1E2B47] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-[#080D1A] border-b border-[#16223A]">
              <div>
                <span className="text-[11px] font-bold text-[#00CFFF] uppercase tracking-wider block">
                  {modules[editingSubscope.moduleIndex]?.codigo} - {modules[editingSubscope.moduleIndex]?.nome}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <FileText className="w-4 h-4 text-[#0866FF]" />
                  {editingSubscope.subscopeIndex === null ? 'Adicionar Novo Subescopo' : 'Editar Funcionalidade (Subescopo)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubscope(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Código & Nome */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Código</label>
                  <input
                    type="text"
                    value={editingSubscope.data.codigo || ''}
                    onChange={(e) => setEditingSubscope({ ...editingSubscope, data: { ...editingSubscope.data, codigo: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none font-bold"
                    placeholder="1.1"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome da Funcionalidade *</label>
                  <input
                    type="text"
                    value={editingSubscope.data.nome || ''}
                    onChange={(e) => setEditingSubscope({ ...editingSubscope, data: { ...editingSubscope.data, nome: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none font-semibold"
                    placeholder="Ex: Contas a pagar, Cadastro de clientes, Carrinho..."
                  />
                </div>
              </div>

              {/* Descrição Funcional Detalhada (Item 7) */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Descrição Funcional Detalhada *
                </label>
                <textarea
                  rows={3}
                  value={editingSubscope.data.descricao || ''}
                  onChange={(e) => setEditingSubscope({ ...editingSubscope, data: { ...editingSubscope.data, descricao: e.target.value } })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none leading-relaxed"
                  placeholder="Descreva exatamente o que a funcionalidade faz e como funciona para o usuário..."
                />
              </div>

              {/* Ações Permitidas (Bullet points da proposta) */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Ações Disponíveis / Permitidas para o Usuário</span>
                  <span className="text-[10px] text-slate-500">Exibidas na coluna Descrição</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempTagInput.field === 'acoes' ? tempTagInput.value : ''}
                    onChange={(e) => setTempTagInput({ field: 'acoes', value: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddListItem('acoes'); } }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                    placeholder="Digite uma ação (ex: Cadastrar despesas) e pressione Enter..."
                  />
                  <button
                    type="button"
                    onClick={() => handleAddListItem('acoes')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-[#00CFFF] border border-[#00CFFF]/30 hover:bg-[#00CFFF]/10 cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
                {editingSubscope.data.acoes && editingSubscope.data.acoes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editingSubscope.data.acoes.map((acao, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-[#101A2F] text-slate-200 border border-[#1F2F4E]"
                      >
                        • {acao}
                        <button
                          type="button"
                          onClick={() => handleRemoveListItem('acoes', idx)}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Regras de Negócio e Comportamentos (Item 7) */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Regras de Negócio e Comportamentos</span>
                  <span className="text-[10px] text-slate-500">Exibidas na coluna Regras</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempTagInput.field === 'regras' ? tempTagInput.value : ''}
                    onChange={(e) => setTempTagInput({ field: 'regras', value: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddListItem('regras'); } }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                    placeholder="Digite uma regra (ex: Alertar sobre vencimentos prévios) e pressione Enter..."
                  />
                  <button
                    type="button"
                    onClick={() => handleAddListItem('regras')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-[#00CFFF] border border-[#00CFFF]/30 hover:bg-[#00CFFF]/10 cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
                {editingSubscope.data.regras && editingSubscope.data.regras.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editingSubscope.data.regras.map((regra, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-[#101A2F] text-slate-200 border border-[#1F2F4E]"
                      >
                        • {regra}
                        <button
                          type="button"
                          onClick={() => handleRemoveListItem('regras', idx)}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Critérios de Aceite (Item 7) */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-emerald-400 block">
                  Critérios de Aceite / Conclusão
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempTagInput.field === 'criteriosAceite' ? tempTagInput.value : ''}
                    onChange={(e) => setTempTagInput({ field: 'criteriosAceite', value: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddListItem('criteriosAceite'); } }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="Critério para considerar concluída (ex: Despesa liquidada gerando recibo)..."
                  />
                  <button
                    type="button"
                    onClick={() => handleAddListItem('criteriosAceite')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50 cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
                {editingSubscope.data.criteriosAceite && editingSubscope.data.criteriosAceite.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editingSubscope.data.criteriosAceite.map((crit, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
                      >
                        ✓ {crit}
                        <button
                          type="button"
                          onClick={() => handleRemoveListItem('criteriosAceite', idx)}
                          className="text-emerald-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-[#080D1A] border-t border-[#16223A] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingSubscope(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-300 hover:bg-[#16223C] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSubscope}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-lg cursor-pointer"
              >
                Salvar Subescopo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CARREGAR MODELOS DE PROJETOS (14 TEMPLATES) */}
      {/* ===================================================================== */}
      {isTemplateSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C1222] border border-[#1E2B47] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-[#080D1A] border-b border-[#16223A]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00CFFF]" />
                  Modelos de Escopo de Projetos (Templates Oficiais)
                </h3>
                <p className="text-xs text-slate-400">
                  Selecione um ponto de partida profissional para copiar módulos e funcionalidades estruturadas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateSelectorOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {PROJECT_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-4 rounded-2xl bg-[#070B16] border border-[#172238] hover:border-[#0866FF]/60 hover:bg-[#0A1020] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-[#00CFFF] px-2 py-0.5 rounded bg-[#00CFFF]/10 border border-[#00CFFF]/20 uppercase">
                          {tmpl.categoria}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {tmpl.modulos.length} módulos
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#00CFFF] transition-colors mb-1">
                        {tmpl.nome}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {tmpl.descricao}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#131D31]">
                      <span className="text-[11px] text-[#7E90A8]">
                        Prazo sugerido: {tmpl.prazosSugeridos.prazoEntrega}
                      </span>
                      <div className="flex items-center gap-2">
                        {modules.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleApplyTemplate(tmpl, true)}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#111A2E] text-slate-300 hover:text-white hover:bg-[#1A2744] cursor-pointer"
                            title="Acrescenta os módulos deste modelo ao escopo atual"
                          >
                            Acrescentar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleApplyTemplate(tmpl, false)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white cursor-pointer shadow-md"
                        >
                          Substituir Escopo
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#080D1A] border-t border-[#16223A] flex justify-end">
              <button
                type="button"
                onClick={() => setIsTemplateSelectorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-300 hover:bg-[#16223C] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO */}
      {/* ===================================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C1222] border border-rose-500/30 rounded-3xl w-full max-w-md shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Confirmar Exclusão</h3>
            <p className="text-xs text-slate-300 mb-4">
              Tem certeza que deseja excluir <strong>{deleteConfirm.title}</strong>? Esta ação removerá os dados do escopo da proposta.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-300 hover:bg-[#16223C] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
