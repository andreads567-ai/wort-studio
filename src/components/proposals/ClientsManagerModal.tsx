import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  Search,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Save
} from 'lucide-react';
import { ClientProfile, ClientType } from '../../types';
import { api } from '../../services/api';
import { SAMPLE_CLIENT } from '../../data/proposalTemplates';

interface ClientsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient?: (client: ClientProfile) => void;
}

export const ClientsManagerModal: React.FC<ClientsManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectClient
}) => {
  const [clients, setClients] = useState<ClientProfile[]>([SAMPLE_CLIENT]);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<ClientProfile>>({
    tipo: 'PJ',
    nome: '',
    razaoSocial: '',
    cnpjCpf: '',
    responsavel: '',
    cargo: '',
    telefone: '',
    email: '',
    endereco: ''
  });

  useEffect(() => {
    if (isOpen) {
      api.getClients().then(list => {
        if (list && list.length > 0) setClients(list);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartNew = () => {
    setEditingClient({
      id: `cli-${Date.now()}`,
      tipo: 'PJ',
      nome: '',
      razaoSocial: '',
      cnpjCpf: '',
      responsavel: '',
      cargo: '',
      telefone: '',
      email: '',
      endereco: ''
    });
    setIsEditing(true);
  };

  const handleStartEdit = (client: ClientProfile) => {
    setEditingClient({ ...client });
    setIsEditing(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient.nome && !editingClient.razaoSocial) return;

    const fullClient: ClientProfile = {
      id: editingClient.id || `cli-${Date.now()}`,
      tipo: editingClient.tipo || 'PJ',
      nome: (editingClient.nome || editingClient.razaoSocial || '').trim(),
      razaoSocial: editingClient.razaoSocial?.trim(),
      cnpjCpf: (editingClient.cnpjCpf || '').trim(),
      responsavel: editingClient.responsavel?.trim(),
      cpfResponsavel: editingClient.cpfResponsavel?.trim(),
      cargo: editingClient.cargo?.trim(),
      telefone: (editingClient.telefone || '').trim(),
      whatsapp: (editingClient.whatsapp || editingClient.telefone || '').trim(),
      email: (editingClient.email || '').trim(),
      endereco: (editingClient.endereco || '').trim(),
      updatedAt: new Date().toISOString()
    };

    const res = await api.saveClient(fullClient);
    if (res.success) {
      setClients(prev => {
        const idx = prev.findIndex(c => c.id === fullClient.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = fullClient;
          return updated;
        }
        return [fullClient, ...prev];
      });
      setIsEditing(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este cliente?')) {
      await api.deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const filteredClients = clients.filter(c =>
    (c.nome || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.razaoSocial || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.cnpjCpf || '').includes(search) ||
    (c.responsavel || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0C1222] border border-[#1E2B47] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-[#080D1A] border-b border-[#16223A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0866FF]/20 border border-[#0866FF]/40 flex items-center justify-center text-[#0866FF]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">5. Cadastro de Clientes</h3>
              <p className="text-[11px] text-slate-400">Gerencie a base de clientes (PF e PJ) para vincular às propostas</p>
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

        {isEditing ? (
          <form onSubmit={handleSaveClient} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Seletor PF / PJ */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-[#080D1A] border border-[#182642]">
              <span className="text-xs font-bold text-slate-300">Tipo de Cliente:</span>
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="radio"
                  name="tipoCliente"
                  checked={editingClient.tipo === 'PJ'}
                  onChange={() => setEditingClient({ ...editingClient, tipo: 'PJ' })}
                  className="text-[#0866FF]"
                />
                <span>Pessoa Jurídica (CNPJ)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="radio"
                  name="tipoCliente"
                  checked={editingClient.tipo === 'PF'}
                  onChange={() => setEditingClient({ ...editingClient, tipo: 'PF' })}
                  className="text-[#0866FF]"
                />
                <span>Pessoa Física (CPF)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {editingClient.tipo === 'PJ' ? (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Razão Social *</label>
                    <input
                      type="text"
                      required
                      value={editingClient.razaoSocial || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, razaoSocial: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                      placeholder="EMPRESA EXEMPLO LTDA"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome Fantasia *</label>
                    <input
                      type="text"
                      required
                      value={editingClient.nome || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, nome: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                      placeholder="Empresa Exemplo"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">CNPJ *</label>
                    <input
                      type="text"
                      required
                      value={editingClient.cnpjCpf || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, cnpjCpf: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                      placeholder="00.000.000/0001-00"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome do Representante *</label>
                    <input
                      type="text"
                      value={editingClient.responsavel || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, responsavel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                      placeholder="João da Silva"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Cargo do Representante</label>
                    <input
                      type="text"
                      value={editingClient.cargo || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, cargo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                      placeholder="Sócio Administrador, Diretor..."
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">CPF do Representante</label>
                    <input
                      type="text"
                      value={editingClient.cpfResponsavel || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, cpfResponsavel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={editingClient.nome || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, nome: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                      placeholder="Maria de Souza"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">CPF *</label>
                    <input
                      type="text"
                      required
                      value={editingClient.cnpjCpf || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, cnpjCpf: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={editingClient.telefone || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, telefone: e.target.value, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                  placeholder="(11) 98888-8888"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">E-mail Comercial *</label>
                <input
                  type="email"
                  required
                  value={editingClient.email || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                  placeholder="contato@cliente.com.br"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={editingClient.endereco || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, endereco: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#060913] border border-[#1A253D] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                  placeholder="Av. Paulista, 1000 - Bela Vista - São Paulo / SP - CEP 01310-100"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#16223A] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-300 hover:bg-[#16223C] cursor-pointer"
              >
                Voltar à Lista
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Cliente
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080D1A] border border-[#182642] text-xs text-white focus:border-[#0866FF] focus:outline-none"
                  placeholder="Buscar por nome, razão social, CNPJ/CPF ou representante..."
                />
              </div>
              <button
                type="button"
                onClick={handleStartNew}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0866FF] hover:bg-[#0654D4] text-white shadow-md cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Cliente
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto space-y-2.5">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-3.5 rounded-2xl bg-[#070B16] border border-[#16223A] hover:border-[#0866FF]/50 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#111A2E] border border-[#1E2E4E] flex items-center justify-center text-[#00CFFF] shrink-0 mt-0.5">
                      {client.tipo === 'PJ' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {client.nome}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#101C33] text-[#00CFFF] border border-[#1A2E54]">
                          {client.tipo}
                        </span>
                      </div>
                      {client.razaoSocial && client.razaoSocial !== client.nome && (
                        <div className="text-[11px] text-slate-400 truncate">{client.razaoSocial}</div>
                      )}
                      <div className="text-[11px] text-[#7A8C9E] flex items-center gap-3 mt-1 flex-wrap">
                        <span>Doc: {client.cnpjCpf}</span>
                        {client.telefone && <span>Tel: {client.telefone}</span>}
                        {client.email && <span>E-mail: {client.email}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onSelectClient && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectClient(client);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0866FF]/20 text-[#00CFFF] border border-[#0866FF]/40 hover:bg-[#0866FF]/30 cursor-pointer"
                      >
                        Selecionar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(client)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16223A] cursor-pointer"
                      title="Editar dados"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      title="Remover cliente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#16223A] flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#111A2E] text-slate-300 hover:bg-[#16223C] cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
