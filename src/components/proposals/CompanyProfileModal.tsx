import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Save,
  Check,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  User,
  Globe
} from 'lucide-react';
import { CompanyProfile } from '../../types';
import { api } from '../../services/api';
import { DEFAULT_COMPANY_PROFILE } from '../../data/proposalTemplates';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (profile: CompanyProfile) => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getCompanyProfile().then(data => {
        if (data) setProfile(data);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const res = await api.saveCompanyProfile(profile);
      if (res.success) {
        setNotice({ type: 'success', msg: 'Dados da Wort Studio salvos com sucesso como padrão!' });
        if (onSaved) onSaved(profile);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setNotice({ type: 'error', msg: res.error || 'Erro ao salvar os dados da empresa.' });
      }
    } catch (err: any) {
      setNotice({ type: 'error', msg: err?.message || 'Falha de comunicação com o servidor.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0C1222] border border-[#1E2B47] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-[#080D1A] border-b border-[#16223A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0866FF]/20 border border-[#0866FF]/40 flex items-center justify-center text-[#0866FF]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">4. Cadastro da Wort Studio</h3>
              <p className="text-[11px] text-slate-400">Dados da empresa emissora reutilizados nas propostas comerciais</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {notice && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                notice.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              {notice.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{notice.msg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Razão Social *</label>
              <input
                type="text"
                required
                value={profile.razaoSocial}
                onChange={(e) => setProfile({ ...profile, razaoSocial: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                placeholder="WORT STUDIO DESENVOLVIMENTO DE SISTEMAS LTDA"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome Fantasia *</label>
              <input
                type="text"
                required
                value={profile.nomeFantasia}
                onChange={(e) => setProfile({ ...profile, nomeFantasia: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                placeholder="Wort Studio"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">CNPJ *</label>
              <input
                type="text"
                required
                value={profile.cnpj}
                onChange={(e) => setProfile({ ...profile, cnpj: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                placeholder="48.123.456/0001-90"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Telefone / WhatsApp Comercial *</label>
              <input
                type="text"
                required
                value={profile.telefone}
                onChange={(e) => setProfile({ ...profile, telefone: e.target.value, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">E-mail Comercial *</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                placeholder="contato@wortstudio.com.br"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Website Oficial</label>
              <input
                type="text"
                value={profile.site || ''}
                onChange={(e) => setProfile({ ...profile, site: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                placeholder="www.wortstudio.com.br"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome do Responsável *</label>
              <input
                type="text"
                required
                value={profile.responsavel}
                onChange={(e) => setProfile({ ...profile, responsavel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                placeholder="Rômulo de Souza"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Cargo do Responsável *</label>
              <input
                type="text"
                required
                value={profile.cargo}
                onChange={(e) => setProfile({ ...profile, cargo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                placeholder="Diretor"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Endereço Completo *</label>
              <input
                type="text"
                required
                value={profile.endereco}
                onChange={(e) => setProfile({ ...profile, endereco: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                placeholder="Rua das Tecnologias, 123 - Sala 10 - Centro - São Paulo / SP - CEP 01000-000"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#16223A] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-300 hover:bg-[#16223C] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-lg shadow-[#0866FF]/25 cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Salvando...' : 'Salvar Dados Padrão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
