import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  LogOut,
  Users,
  LayoutGrid,
  DollarSign,
  Settings as SettingsIcon,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  Plus,
  Save,
  MessageCircle,
  ExternalLink,
  Search,
  Database,
  AlertCircle,
  Eye,
  EyeOff,
  Code2,
  Terminal,
  Mail,
  Send,
  Check,
  Copy,
  Server,
  Globe,
  RefreshCw,
  Bell,
  Key,
  Info,
  FileText
} from 'lucide-react';
import { DemoModel, PlanItem, CommercialSettings, QuoteRequest, ModelCategory } from '../types';
import { api, buildWhatsAppUrl } from '../services/api';
import { Logo } from '../components/Logo';
import { AnimatedWatermark } from '../components/AnimatedWatermark';
import { ProposalsManager } from '../components/proposals/ProposalsManager';

interface AdminPageProps {
  models: DemoModel[];
  plans: PlanItem[];
  settings: CommercialSettings;
  onRefreshData: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  models: initialModels,
  plans: initialPlans,
  settings: initialSettings,
  onRefreshData
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'quotes' | 'proposals' | 'models' | 'plans' | 'settings' | 'api'>('quotes');

  // Backend Status State
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Quotes Management State
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [quoteSearch, setQuoteSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [notifyCustomerOnStatusChange, setNotifyCustomerOnStatusChange] = useState(true);

  // Zoho Mail & API Management State
  const [testRecipientEmail, setTestRecipientEmail] = useState('');
  const [isTestingZoho, setIsTestingZoho] = useState(false);
  const [testZohoResult, setTestZohoResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [showZohoPassword, setShowZohoPassword] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [grantCodeInput, setGrantCodeInput] = useState('');
  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const [exchangeResult, setExchangeResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [isVerifyingZoho, setIsVerifyingZoho] = useState(false);
  const [zohoVerifyState, setZohoVerifyState] = useState<{
    checked: boolean;
    valid: boolean;
    clientCredentialsValid: boolean;
    tokenValid: boolean;
    mailboxAddress?: string;
    message?: string;
    error?: string;
  }>({ checked: false, valid: false, clientCredentialsValid: false, tokenValid: false });

  // Models Management State
  const [models, setModels] = useState<DemoModel[]>(initialModels);
  const [editingModel, setEditingModel] = useState<DemoModel | null>(null);
  const [isNewModel, setIsNewModel] = useState(false);

  // Plans Management State
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);

  // Settings Management State
  const [settingsForm, setSettingsForm] = useState<CommercialSettings>(initialSettings);
  const [adminSettingsLoaded, setAdminSettingsLoaded] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [storageKind, setStorageKind] = useState<string>('');
  const [updatingQuoteId, setUpdatingQuoteId] = useState<string | null>(null);
  const [isSavingApiSettings, setIsSavingApiSettings] = useState(false);

  const runZohoVerification = async (override?: Partial<CommercialSettings>) => {
    setIsVerifyingZoho(true);
    try {
      const target = { ...settingsForm, ...(override || {}) };
      const res = await api.verifyZohoCredentials({
        clientId: target.zohoClientId,
        clientSecret: target.zohoClientSecret,
        refreshToken: target.zohoRefreshToken,
        user: target.zohoUser,
        senderName: target.zohoSenderName
      });
      setZohoVerifyState({
        checked: true,
        valid: res.valid,
        clientCredentialsValid: res.clientCredentialsValid,
        tokenValid: res.tokenValid,
        mailboxAddress: res.mailboxAddress,
        message: res.message,
        error: res.error
      });
      if (res.valid) {
        setSettingsForm(prev => ({
          ...prev,
          ...(res.refreshToken ? { zohoRefreshToken: res.refreshToken } : {}),
          ...(res.accessToken ? { zohoAccessToken: res.accessToken } : {}),
          ...(res.accountId ? { zohoAccountId: res.accountId } : {}),
          ...(!prev.zohoUser && res.mailboxAddress ? { zohoUser: res.mailboxAddress } : {})
        }));
      }
      return res;
    } catch (err) {
      console.error('[Admin] Erro ao verificar credenciais Zoho:', err);
      return null;
    } finally {
      setIsVerifyingZoho(false);
    }
  };

  const loadSettings = async (verifyAfterLoad = false) => {
    try {
      console.log('[Admin] Carregando credenciais e configurações salvas no banco de dados...');
      const data = await api.getAdminSettings();
      if (data) {
        console.log('[Admin] Configurações recuperadas com sucesso do banco:', {
          hasClientId: Boolean(data.zohoClientId),
          hasClientSecret: Boolean(data.zohoClientSecret),
          hasRefreshToken: Boolean(data.zohoRefreshToken),
          user: data.zohoUser
        });
        setAdminSettingsLoaded(true);
        setSettingsForm(prev => ({
          ...prev,
          ...data,
          zohoRefreshToken: data.zohoRefreshToken ?? prev.zohoRefreshToken ?? '',
          zohoAccessToken: (data as any).accessToken || data.zohoAccessToken || prev.zohoAccessToken || '',
          zohoClientId: data.zohoClientId ?? prev.zohoClientId ?? '',
          zohoClientSecret: data.zohoClientSecret ?? prev.zohoClientSecret ?? '',
          zohoUser: data.zohoUser || prev.zohoUser || 'wort.studio@aliandre.com.br',
          zohoAuthType: data.zohoAuthType === 'smtp' ? 'smtp' : 'oauth2'
        }));
        if (verifyAfterLoad && data.zohoAuthType !== 'smtp') {
          await runZohoVerification(data);
        }
      }
    } catch (err) {
      console.error('[Admin] Falha ao sincronizar configurações com o banco:', err);
    }
  };

  useEffect(() => {
    const existing = api.getStoredAdminToken ? api.getStoredAdminToken() : sessionStorage.getItem('wort_admin_session_token');
    if (existing) {
      setIsAuthenticated(true);
      loadQuotes();
      loadSettings(true);
      onRefreshData();
    }
    api.getHealthInfo().then(info => {
      if (info.storage) setStorageKind(info.storage);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setModels(initialModels);
    setPlans(initialPlans);
    setSettingsForm(prev => {
      if (adminSettingsLoaded) {
        return prev;
      }
      // Os dados públicos (/api/data) não trazem senha nem credenciais do Zoho.
      // Atualiza apenas os campos públicos antes do carregamento completo da sessão admin.
      const publicFields = Object.fromEntries(
        Object.entries(initialSettings).filter(
          ([key]) => key !== 'adminPasswordHash' && !key.startsWith('zoho')
        )
      ) as Partial<CommercialSettings>;
      return { ...initialSettings, ...publicFields, ...prev };
    });
  }, [initialModels, initialPlans, initialSettings, adminSettingsLoaded]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'quotes') {
      loadQuotes();
    } else if (activeTab === 'api') {
      loadSettings(true);
    } else if (activeTab === 'settings') {
      loadSettings(false);
    } else if (activeTab === 'models' || activeTab === 'plans') {
      onRefreshData();
    }
  }, [activeTab, isAuthenticated]);

  const loadQuotes = async () => {
    setIsLoadingQuotes(true);
    const res = await api.getQuotes();
    setQuotes(res.quotes);
    setIsBackendConnected(res.isBackendConnected);
    setIsLoadingQuotes(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = (passwordInput || '').trim();
    if (!cleanPassword) {
      setAuthError('A senha de acesso administrativo é obrigatória e não pode ficar em branco.');
      return;
    }

    setIsLoggingIn(true);
    setAuthError('');

    const res = await api.adminLogin(cleanPassword);
    if (res.success) {
      setIsAuthenticated(true);
      sessionStorage.setItem('wort_admin_token', 'active');
      setPasswordInput('');
      loadQuotes();
      loadSettings();
      api.getHealthInfo().then(info => {
        if (info.storage) setStorageKind(info.storage);
      }).catch(() => {});
    } else {
      setAuthError(res.error || 'Senha incorreta. Verifique suas credenciais.');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    api.adminLogout();
    setIsAuthenticated(false);
    sessionStorage.removeItem('wort_admin_token');
    sessionStorage.removeItem('wort_admin_session_token');
    setPasswordInput('');
    setAuthError('');
  };

  const getStatusLabel = (status: QuoteRequest['status'] | string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'em_analise':
        return 'Em Análise';
      case 'proposta_enviada':
        return 'Proposta Enviada';
      case 'concluido':
        return 'Conclusão';
      default:
        return status;
    }
  };

  const renderStatusBadge = (status: QuoteRequest['status']) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case 'em_analise':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#00CFFF]/15 text-[#00CFFF] border border-[#00CFFF]/30 flex items-center gap-1">
            <Search className="w-3 h-3" />
            Em Análise
          </span>
        );
      case 'proposta_enviada':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0866FF]/20 text-[#00CFFF] border border-[#0866FF]/40 flex items-center gap-1">
            <Send className="w-3 h-3" />
            Proposta Enviada
          </span>
        );
      case 'concluido':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Conclusão
          </span>
        );
    }
  };

  // Status changer for quotes with Zoho Mail notification option
  const handleUpdateQuoteStatus = async (quoteId: string, newStatus: QuoteRequest['status']) => {
    setUpdatingQuoteId(quoteId);
    try {
      console.log(`[Admin] Atualizando status do orçamento ${quoteId} para "${newStatus}" no banco de dados...`);
      const res = await api.updateQuoteStatus(quoteId, newStatus, undefined, notifyCustomerOnStatusChange);
      
      if (!res.success) {
        const errorMsg = res.error || 'Falha ao persistir alteração no banco de dados.';
        console.error(`[Admin Error] Falha ao atualizar status:`, errorMsg);
        alert(`Erro ao salvar status no banco de dados: ${errorMsg}`);
        return;
      }

      // SÓ altera o estado visual (useState) APÓS o banco responder com sucesso!
      setQuotes(prev =>
        prev.map(q => (q.id === quoteId ? { ...q, status: newStatus } : q))
      );

      console.log(`[Admin Success] Status do orçamento ${quoteId} atualizado com sucesso no banco.`);
      if (res.clientNotified) {
        showNotice(`Status alterado para "${getStatusLabel(newStatus)}" e notificação por e-mail enviada via Zoho ao cliente!`);
      } else {
        showNotice(`Status do orçamento atualizado para "${getStatusLabel(newStatus)}"!`);
      }
    } catch (err: any) {
      console.error('[Admin Exception] Erro ao atualizar status:', err);
      alert(`Erro inesperado ao salvar status no banco de dados: ${err?.message || err}`);
    } finally {
      setUpdatingQuoteId(null);
    }
  };

  // Zoho Mail SMTP / OAuth2 test trigger
  const handleTestZohoEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingZoho(true);
    setTestZohoResult(null);

    const recipient = testRecipientEmail.trim() || settingsForm.zohoAlertRecipient || settingsForm.contactEmail || settingsForm.zohoUser;
    if (!recipient) {
      setTestZohoResult({
        success: false,
        error: 'Por favor, informe um endereço de e-mail de destino para o teste.'
      });
      setIsTestingZoho(false);
      return;
    }

    const res = await api.testZohoEmail({
      host: settingsForm.zohoHost,
      port: settingsForm.zohoPort,
      user: settingsForm.zohoUser,
      pass: settingsForm.zohoPass,
      clientId: settingsForm.zohoClientId,
      clientSecret: settingsForm.zohoClientSecret,
      refreshToken: settingsForm.zohoRefreshToken,
      accessToken: settingsForm.zohoAccessToken,
      authType: settingsForm.zohoAuthType || 'oauth2',
      senderName: settingsForm.zohoSenderName,
      testRecipient: recipient
    });

    setTestZohoResult(res);
    setIsTestingZoho(false);
  };

  // Zoho OAuth2 Grant Code Exchange
  const handleExchangeGrantCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGrantCode = grantCodeInput.trim();
    if (!cleanGrantCode) {
      setExchangeResult({
        success: false,
        error: 'Por favor, cole o Código de Concessão (Grant Token) gerado no Zoho API Console.'
      });
      return;
    }

    if (!settingsForm.zohoClientId?.trim() || !settingsForm.zohoClientSecret?.trim()) {
      setExchangeResult({
        success: false,
        error: 'Preencha o Client ID e o Client Secret acima antes de conectar e gerar os tokens.'
      });
      return;
    }

    setIsExchangingCode(true);
    setExchangeResult(null);

    try {
      console.log('[Admin] Iniciando troca do Grant Token Zoho pela API com Client ID atual...');
      const res = await api.exchangeZohoToken(
        cleanGrantCode,
        settingsForm.zohoRedirectUri,
        {
          clientId: settingsForm.zohoClientId.trim(),
          clientSecret: settingsForm.zohoClientSecret.trim(),
          user: settingsForm.zohoUser?.trim(),
          senderName: settingsForm.zohoSenderName?.trim()
        }
      );
      setExchangeResult(res);

      if (res.success && res.refreshToken) {
        console.log('[Admin Success] Novo Refresh Token gerado e substituído no banco:', `${res.refreshToken.slice(0, 12)}...`);
        setAdminSettingsLoaded(true);
        setSettingsForm(prev => ({
          ...prev,
          zohoClientId: res.clientId || prev.zohoClientId,
          zohoRefreshToken: res.refreshToken!,
          zohoAccessToken: res.accessToken || prev.zohoAccessToken,
          zohoAccountId: res.accountId || prev.zohoAccountId,
          zohoUser: res.user || prev.zohoUser,
          zohoAuthType: 'oauth2'
        }));
        setZohoVerifyState({
          checked: true,
          valid: true,
          clientCredentialsValid: true,
          tokenValid: true,
          message: 'Client ID, Client Secret e novo Refresh Token ativos e verificados na Zoho API!'
        });
        setGrantCodeInput('');
        onRefreshData();
        showNotice('Novo Refresh Token gerado, validado e substituído permanentemente no banco de dados!');
      } else {
        console.error('[Admin Error] Falha ao trocar token Zoho:', res.error);
      }
    } catch (err: any) {
      console.error('[Admin Exception] Erro ao trocar token Zoho:', err);
      setExchangeResult({
        success: false,
        error: `Erro ao conectar com a API: ${err?.message || err}`
      });
    } finally {
      setIsExchangingCode(false);
    }
  };

  // Save API & Zoho Settings
  const handleSaveApiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = (settingsForm.adminPasswordHash || '').trim();
    if (!cleanPassword) {
      alert('Atenção: A senha administrativa não pode ficar em branco.');
      return;
    }
    if (cleanPassword.length < 6) {
      alert('Atenção: A senha administrativa deve conter no mínimo 6 caracteres.');
      return;
    }

    setIsSavingApiSettings(true);
    try {
      console.log('[Admin] Gravando credenciais de API no banco de dados...', {
        clientId: settingsForm.zohoClientId ? `${settingsForm.zohoClientId.slice(0, 8)}...` : '(vazio)',
        hasClientSecret: Boolean(settingsForm.zohoClientSecret),
        hasRefreshToken: Boolean(settingsForm.zohoRefreshToken),
        user: settingsForm.zohoUser
      });

      const res = await api.updateSettings({
        ...settingsForm,
        adminPasswordHash: cleanPassword
      });

      if (res.success) {
        console.log('[Admin Success] Credenciais de API salvas com sucesso no banco de dados.');
        if (res.settings) {
          setSettingsForm(prev => ({
            ...prev,
            ...res.settings,
            zohoRefreshToken: res.settings?.zohoRefreshToken ?? prev.zohoRefreshToken
          }));
        }
        if (res.zohoVerification) {
          setZohoVerifyState({
            checked: true,
            valid: Boolean(res.zohoVerification.valid),
            clientCredentialsValid: Boolean(res.zohoVerification.clientCredentialsValid),
            tokenValid: Boolean(res.zohoVerification.tokenValid),
            message: res.zohoVerification.message,
            error: res.zohoVerification.error
          });
        } else {
          await runZohoVerification();
        }
        onRefreshData();
        showNotice('Configurações de API & integração com Zoho Mail salvas e verificadas no banco de dados!');
      } else {
        const errorMsg = res.error || 'Erro ao salvar configurações de API no banco de dados.';
        console.error('[Admin Error] Erro ao salvar configurações:', errorMsg);
        alert(errorMsg);
      }
    } catch (err: any) {
      console.error('[Admin Exception] Erro ao salvar credenciais:', err);
      alert(`Falha ao salvar credenciais no banco: ${err?.message || err}`);
    } finally {
      setIsSavingApiSettings(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(label);
    setTimeout(() => setCopiedEndpoint(null), 2500);
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta solicitação de orçamento?')) {
      try {
        const ok = await api.deleteQuote(quoteId);
        if (ok) {
          setQuotes(prev => prev.filter(q => q.id !== quoteId));
          showNotice('Solicitação de orçamento excluída com sucesso do banco de dados!');
        } else {
          alert('Não foi possível excluir o registro do banco de dados.');
        }
      } catch (err: any) {
        console.error('Erro ao excluir orçamento:', err);
        alert(`Erro ao excluir orçamento: ${err?.message || err}`);
      }
    }
  };

  // Model CRUD
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;

    try {
      const ok = await api.saveModel(editingModel, !isNewModel);
      if (ok) {
        if (isNewModel) {
          setModels(prev => [editingModel, ...prev]);
        } else {
          setModels(prev => prev.map(m => (m.id === editingModel.id ? editingModel : m)));
        }
        setEditingModel(null);
        setIsNewModel(false);
        onRefreshData();
        showNotice('Modelo demonstrativo salvo com sucesso no banco de dados!');
      } else {
        alert('Erro ao salvar modelo no banco de dados.');
      }
    } catch (err: any) {
      console.error('Erro ao salvar modelo:', err);
      alert(`Falha ao salvar modelo: ${err?.message || err}`);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (window.confirm('Deseja realmente remover este modelo do catálogo?')) {
      try {
        const ok = await api.deleteModel(modelId);
        if (ok) {
          setModels(prev => prev.filter(m => m.id !== modelId));
          onRefreshData();
          showNotice('Modelo removido com sucesso!');
        } else {
          alert('Erro ao remover modelo do banco de dados.');
        }
      } catch (err: any) {
        console.error('Erro ao remover modelo:', err);
        alert(`Falha ao remover modelo: ${err?.message || err}`);
      }
    }
  };

  // Plan CRUD
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      const ok = await api.updatePlan(editingPlan);
      if (ok) {
        setPlans(prev => prev.map(p => (p.id === editingPlan.id ? editingPlan : p)));
        setEditingPlan(null);
        onRefreshData();
        showNotice('Informações comerciais do plano atualizadas com sucesso no banco de dados!');
      } else {
        alert('Erro ao atualizar plano no banco de dados.');
      }
    } catch (err: any) {
      console.error('Erro ao atualizar plano:', err);
      alert(`Falha ao atualizar plano: ${err?.message || err}`);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = (settingsForm.adminPasswordHash || '').trim();
    if (!cleanPassword) {
      alert('Atenção: A senha de acesso administrativo não pode ficar em branco. Por favor, defina uma senha válida com pelo menos 6 caracteres.');
      return;
    }
    if (cleanPassword.length < 6) {
      alert('Atenção: A senha de acesso administrativo deve conter no mínimo 6 caracteres.');
      return;
    }

    try {
      const res = await api.updateSettings({
        ...settingsForm,
        adminPasswordHash: cleanPassword
      });

      if (res.success) {
        await loadSettings();
        onRefreshData();
        showNotice('Configurações comerciais e senha de acesso salvas com sucesso no banco de dados!');
      } else {
        alert(res.error || 'Erro ao salvar configurações no servidor.');
      }
    } catch (err: any) {
      console.error('Erro ao salvar configurações comerciais:', err);
      alert(`Falha ao salvar configurações: ${err?.message || err}`);
    }
  };

  const showNotice = (msg: string) => {
    setSaveSuccessNotice(msg);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  // Filtered quotes
  const filteredQuotes = quotes.filter(q => {
    const matchesStatus = statusFilter === 'todos' || q.status === statusFilter;
    const matchesSearch =
      q.name.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.email.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.protocol.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.whatsapp.includes(quoteSearch);
    return matchesStatus && matchesSearch;
  });

  // If not logged in, render the secure login gate
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-16 overflow-hidden">
        {/* Animated Background Watermark */}
        <AnimatedWatermark opacity={0.09} />

        <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-[#0D1322]/95 backdrop-blur-xl border border-[#1E293B] shadow-2xl text-center space-y-6">
          <div className="flex justify-center mb-2">
            <Logo variant="full" className="h-10 w-auto" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Área de Gestão WortSite
            </h1>
            <p className="text-xs text-[#B8C1D1] mt-1">
              Acesso restrito para administração de orçamentos, modelos, planos e canais comerciais.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-white mb-1">
                Senha de Acesso Administrativo
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite a senha administrativa..."
                  autoComplete="current-password"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#05070D] border border-[#222B3D] text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-2 focus:ring-[#0866FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8C1D1] hover:text-white p-1 transition-colors cursor-pointer"
                  aria-label={showLoginPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#0866FF]/25"
            >
              <Shield className="w-4 h-4" />
              {isLoggingIn ? 'Autenticando...' : 'Acessar Painel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Animated Background Watermark */}
      <AnimatedWatermark opacity={0.06} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0D1322] border border-[#1E293B]">
        <div className="flex items-center gap-4">
          <Logo variant="icon" className="h-9 w-auto" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Painel Administrativo WortSite
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono text-[10px] flex items-center gap-1 ${
                storageKind === 'supabase'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#00CFFF]/20 text-[#00CFFF] border border-[#00CFFF]/30'
              }`}>
                <Database className="w-3 h-3" />
                {storageKind === 'supabase'
                  ? 'Supabase Conectado'
                  : storageKind === 'redis'
                  ? 'Redis Ativo'
                  : storageKind === 'file'
                  ? 'Banco Local JSON'
                  : isBackendConnected ? 'Backend Ativo' : 'Armazenamento Local'}
              </span>
            </div>
            <p className="text-xs text-[#B8C1D1]">
              Gerenciamento de solicitações de clientes, catálogo demonstrativo, preços e configurações.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="px-3.5 py-2 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] text-[#B8C1D1] hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Encerrar Sessão
        </button>
      </div>

      {/* Success Notification */}
      {saveSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222B3D] pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'quotes'
              ? 'bg-[#0866FF] text-white shadow-md shadow-[#0866FF]/20'
              : 'bg-[#0E131F] text-[#B8C1D1] hover:text-white hover:bg-[#171D2B]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Orçamentos Recebidos</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
            {quotes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('proposals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'proposals'
              ? 'bg-[#0866FF] text-white shadow-md shadow-[#0866FF]/20'
              : 'bg-[#0E131F] text-[#B8C1D1] hover:text-white hover:bg-[#171D2B]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#00CFFF]" />
          <span>Orçamentos e Propostas</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#0866FF]/40 text-[#00CFFF] text-[10px] font-bold">
            Módulo
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'models'
              ? 'bg-[#0866FF] text-white shadow-md shadow-[#0866FF]/20'
              : 'bg-[#0E131F] text-[#B8C1D1] hover:text-white hover:bg-[#171D2B]'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Modelos Demonstrativos</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
            {models.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-[#0866FF] text-white shadow-md shadow-[#0866FF]/20'
              : 'bg-[#0E131F] text-[#B8C1D1] hover:text-white hover:bg-[#171D2B]'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Planos e Preços</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#0866FF] text-white shadow-md shadow-[#0866FF]/20'
              : 'bg-[#0E131F] text-[#B8C1D1] hover:text-white hover:bg-[#171D2B]'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Configurações & Contato</span>
        </button>

        {/* TAB 5: API & INTEGRAÇÕES */}
        <button
          type="button"
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'api'
              ? 'bg-[#0866FF] text-white shadow-md shadow-[#0866FF]/20'
              : 'bg-[#0E131F] text-[#B8C1D1] hover:text-white hover:bg-[#171D2B]'
          }`}
        >
          <Code2 className="w-4 h-4 text-[#00CFFF]" />
          <span>API & Integrações</span>
        </button>
      </div>

      {/* TAB: ORÇAMENTOS E PROPOSTAS COMERCIAIS */}
      {activeTab === 'proposals' && (
        <ProposalsManager />
      )}

      {/* TAB 1: QUOTES MANAGEMENT */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D1322] border border-[#1E293B]">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8C1D1]" />
              <input
                type="text"
                value={quoteSearch}
                onChange={(e) => setQuoteSearch(e.target.value)}
                placeholder="Buscar por cliente, protocolo..."
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-1 focus:ring-[#0866FF]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {['todos', 'pendente', 'em_analise', 'proposta_enviada', 'concluido'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#0866FF] text-white shadow-md shadow-[#0866FF]/20 font-semibold'
                      : 'bg-[#171D2B] text-[#B8C1D1] hover:text-white hover:bg-[#222B3D]'
                  }`}
                >
                  {st === 'todos' ? 'Todos' : getStatusLabel(st)}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-[#B8C1D1] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyCustomerOnStatusChange}
                onChange={(e) => setNotifyCustomerOnStatusChange(e.target.checked)}
                className="rounded bg-[#05070D] border-[#222B3D] text-[#0866FF] focus:ring-[#0866FF] w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[11px]">Notificar cliente via Zoho Mail ao alterar status</span>
            </label>
          </div>

          {/* Quotes List */}
          {filteredQuotes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0E131F] border border-[#222B3D] text-[#B8C1D1] text-xs">
              Nenhuma solicitação de orçamento encontrada para os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotes.map((quote) => {
                const customerWhatsappUrl = buildWhatsAppUrl(
                  quote.whatsapp,
                  `Olá, ${quote.name}! Sou da equipe WortSite. Recebemos sua solicitação de orçamento (Protocolo: ${quote.protocol}) e gostaríamos de apresentar os detalhes para o seu projeto!`
                );

                return (
                  <div
                    key={quote.id}
                    className="p-6 rounded-2xl bg-[#0E131F] border border-[#222B3D] hover:border-[#1E293B] transition-colors space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222B3D]/70">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs text-[#00CFFF] font-bold">
                            {quote.protocol}
                          </span>
                          <span className="text-white font-bold text-sm sm:text-base">
                            {quote.name}
                          </span>
                          {/* Live Status Badge */}
                          {renderStatusBadge(quote.status)}
                        </div>
                        <span className="text-[11px] text-[#B8C1D1]">
                          Recebido em: {new Date(quote.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      {/* Status Selector & Actions */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#B8C1D1]/70 uppercase font-semibold hidden sm:inline">Status:</span>
                          <select
                            value={quote.status}
                            disabled={updatingQuoteId === quote.id}
                            onChange={(e) => handleUpdateQuoteStatus(quote.id, e.target.value as QuoteRequest['status'])}
                            className="px-2.5 py-1.5 rounded-lg bg-[#171D2B] border border-[#222B3D] text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#0866FF] cursor-pointer disabled:opacity-50"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="em_analise">Em Análise</option>
                            <option value="proposta_enviada">Proposta Enviada</option>
                            <option value="concluido">Conclusão</option>
                          </select>
                          {updatingQuoteId === quote.id && (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00CFFF]" />
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="p-1.5 rounded-lg bg-[#171D2B] hover:bg-red-500/20 text-[#B8C1D1] hover:text-red-400 transition-colors cursor-pointer"
                          title="Excluir solicitação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#B8C1D1]">
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/60">Tipo</span>
                        <span className="text-white font-medium capitalize">{quote.projectType.replace(/_/g, ' ')}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/60">Segmento</span>
                        <span className="text-white font-medium">{quote.businessSegment || 'Não informado'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/60">Investimento Estimado</span>
                        <span className="text-white font-medium">{quote.budgetRange}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-[#B8C1D1]/60">Prazo</span>
                        <span className="text-white font-medium">{quote.timeline}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {quote.description && (
                      <div className="p-3.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-[#B8C1D1]">
                        <span className="block font-semibold text-white mb-1">Descrição fornecida:</span>
                        <p className="whitespace-pre-line leading-relaxed">{quote.description}</p>
                      </div>
                    )}

                    {/* Contact Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <a
                        href={customerWhatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Responder no WhatsApp ({quote.whatsapp})
                      </a>

                      <a
                        href={`mailto:${quote.email}?subject=Orçamento WortSite - Protocolo ${quote.protocol}`}
                        className="px-4 py-2 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] text-[#B8C1D1] hover:text-white text-xs font-medium transition-colors"
                      >
                        Enviar E-mail ({quote.email})
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MODELS MANAGEMENT */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Modelos Demonstrativos Cadastrados</h2>
              <p className="text-xs text-[#B8C1D1]">Edite os modelos existentes ou adicione novas referências ao catálogo.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsNewModel(true);
                setEditingModel({
                  id: `modelo-${Date.now()}`,
                  name: '',
                  slug: '',
                  category: 'Empresas',
                  description: '',
                  shortDescription: '',
                  targetAudience: '',
                  accentColor: '#0866FF',
                  features: ['Estrutura moderna', '100% responsivo'],
                  recommendedFor: ['Empresas'],
                  mockupData: {
                    heroTitle: 'Título da Página Demonstrativa',
                    heroSubtitle: 'Subtítulo da página explicando o serviço oferecido.',
                    ctaText: 'Fale Conosco',
                    sections: [
                      {
                        title: 'Nossos Serviços',
                        description: 'Visão geral das soluções prestadas',
                        items: ['Item 1', 'Item 2']
                      }
                    ]
                  }
                });
              }}
              className="px-4 py-2 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Modelo
            </button>
          </div>

          {/* Model Edit Form Modal / Inline */}
          {editingModel && (
            <form onSubmit={handleSaveModel} className="p-6 rounded-2xl bg-[#171D2B] border border-[#0866FF]/60 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#222B3D]">
                <h3 className="text-sm font-bold text-white">
                  {isNewModel ? 'Cadastrar Novo Modelo Demonstrativo' : `Editando: ${editingModel.name}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingModel(null)}
                  className="text-xs text-[#B8C1D1] hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Nome do Modelo</label>
                  <input
                    type="text"
                    value={editingModel.name}
                    onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Categoria</label>
                  <select
                    value={editingModel.category}
                    onChange={(e) => setEditingModel({ ...editingModel, category: e.target.value as ModelCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                  >
                    <option value="Empresas">Empresas</option>
                    <option value="Serviços profissionais">Serviços profissionais</option>
                    <option value="Saúde e estética">Saúde e estética</option>
                    <option value="Restaurantes e comércios">Restaurantes e comércios</option>
                    <option value="Cursos e educação">Cursos e educação</option>
                    <option value="Produtos digitais">Produtos digitais</option>
                    <option value="Eventos e campanhas">Eventos e campanhas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Cor de Destaque (Hex)</label>
                  <input
                    type="text"
                    value={editingModel.accentColor}
                    onChange={(e) => setEditingModel({ ...editingModel, accentColor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Descrição Breve (Card do Catálogo)</label>
                <input
                  type="text"
                  value={editingModel.shortDescription}
                  onChange={(e) => setEditingModel({ ...editingModel, shortDescription: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Descrição Completa</label>
                <textarea
                  rows={2}
                  value={editingModel.description}
                  onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Hero Title do Mockup</label>
                  <input
                    type="text"
                    value={editingModel.mockupData.heroTitle}
                    onChange={(e) => setEditingModel({
                      ...editingModel,
                      mockupData: { ...editingModel.mockupData, heroTitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Texto do Botão de Ação</label>
                  <input
                    type="text"
                    value={editingModel.mockupData.ctaText}
                    onChange={(e) => setEditingModel({
                      ...editingModel,
                      mockupData: { ...editingModel.mockupData, ctaText: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingModel(null)}
                  className="px-4 py-2 rounded-xl bg-[#05070D] text-xs text-[#B8C1D1]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0866FF] text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Alterações
                </button>
              </div>
            </form>
          )}

          {/* Existing models table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((mod) => (
              <div
                key={mod.id}
                className="p-5 rounded-2xl bg-[#0E131F] border border-[#222B3D] flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-sm">{mod.name}</span>
                    <span className="text-[10px] text-[#00CFFF] px-2 py-0.5 rounded bg-[#171D2B]">
                      {mod.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#B8C1D1] line-clamp-2 leading-relaxed mb-3">
                    {mod.shortDescription}
                  </p>
                  <span className="text-[10px] text-[#B8C1D1]/60 font-mono">
                    Slug: /{mod.slug}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewModel(false);
                      setEditingModel({ ...mod });
                    }}
                    className="p-2 rounded-lg bg-[#171D2B] hover:bg-[#222B3D] text-[#B8C1D1] hover:text-white transition-colors"
                    title="Editar modelo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteModel(mod.id)}
                    className="p-2 rounded-lg bg-[#171D2B] hover:bg-red-500/20 text-[#B8C1D1] hover:text-red-400 transition-colors"
                    title="Remover modelo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PLANS & PRICING */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Gerenciamento de Planos e Preços</h2>
            <p className="text-xs text-[#B8C1D1]">Edite valores, entregas e termos de cada plano oferecido no site.</p>
          </div>

          {editingPlan && (
            <form onSubmit={handleSavePlan} className="p-6 rounded-2xl bg-[#171D2B] border border-[#0866FF] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#222B3D]">
                <h3 className="text-sm font-bold text-white">Editando Plano: {editingPlan.name}</h3>
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="text-xs text-[#B8C1D1] hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Nome do Plano</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Exibição de Preço</label>
                  <input
                    type="text"
                    value={editingPlan.priceDisplay}
                    onChange={(e) => setEditingPlan({ ...editingPlan, priceDisplay: e.target.value })}
                    placeholder="Ex: Sob consulta ou R$ 890"
                    className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">Prazo Estimado</label>
                  <input
                    type="text"
                    value={editingPlan.estimatedTimeline}
                    onChange={(e) => setEditingPlan({ ...editingPlan, estimatedTimeline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Subtítulo Resumido</label>
                <input
                  type="text"
                  value={editingPlan.subtitle}
                  onChange={(e) => setEditingPlan({ ...editingPlan, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Condições Comerciais</label>
                <textarea
                  rows={2}
                  value={editingPlan.commercialTerms}
                  onChange={(e) => setEditingPlan({ ...editingPlan, commercialTerms: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl bg-[#05070D] text-xs text-[#B8C1D1]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0866FF] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Plano
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.id}
                className="p-6 rounded-2xl bg-[#0E131F] border border-[#222B3D] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-base">{p.name}</h3>
                    <span className="text-xs font-semibold text-[#00CFFF]">
                      {p.priceDisplay}
                    </span>
                  </div>
                  <p className="text-xs text-[#B8C1D1] mb-4">{p.subtitle}</p>
                  <div className="text-[11px] text-[#B8C1D1] space-y-1 mb-4">
                    <div>Prazo: <span className="text-white">{p.estimatedTimeline}</span></div>
                    <div>Entregas: <span className="text-white">{p.deliverables.length} itens</span></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#222B3D]">
                  <button
                    type="button"
                    onClick={() => setEditingPlan({ ...p })}
                    className="w-full py-2 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar Informações do Plano
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMMERCIAL SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-8 rounded-3xl bg-[#0E131F] border border-[#222B3D] space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Configurações Comerciais da WortSite</h2>
            <p className="text-xs text-[#B8C1D1]">Altere os canais de atendimento, número de WhatsApp e informações de rodapé.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white mb-1">
                WhatsApp Comercial (Número com DDD, ex: 5511999999999)
              </label>
              <input
                type="text"
                value={settingsForm.whatsappNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1">
                WhatsApp Texto Visível (ex: (11) 99999-9999)
              </label>
              <input
                type="text"
                value={settingsForm.whatsappDisplay}
                onChange={(e) => setSettingsForm({ ...settingsForm, whatsappDisplay: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white mb-1">E-mail de Contato</label>
              <input
                type="email"
                value={settingsForm.contactEmail}
                onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1">Horário de Atendimento</label>
              <input
                type="text"
                value={settingsForm.businessHours}
                onChange={(e) => setSettingsForm({ ...settingsForm, businessHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white mb-1">Endereço / Cidade / Atendimento</label>
            <input
              type="text"
              value={settingsForm.addressCity}
              onChange={(e) => setSettingsForm({ ...settingsForm, addressCity: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white mb-1">Slogan Principal</label>
              <input
                type="text"
                value={settingsForm.sloganPrincipal}
                onChange={(e) => setSettingsForm({ ...settingsForm, sloganPrincipal: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1">Slogan Secundário</label>
              <input
                type="text"
                value={settingsForm.sloganSecundario}
                onChange={(e) => setSettingsForm({ ...settingsForm, sloganSecundario: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white"
              />
            </div>
          </div>

          {/* Credencial Administrativa Obrigatória */}
          <div className="p-5 rounded-2xl bg-[#05070D] border border-[#222B3D] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-semibold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00CFFF]" />
                <span>Senha de Acesso do Administrador</span>
                <span className="text-red-400 font-bold">*</span>
              </label>
              {(!settingsForm.adminPasswordHash || !settingsForm.adminPasswordHash.trim()) ? (
                <span className="text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Campo Obrigatório
                </span>
              ) : settingsForm.adminPasswordHash.trim().length < 6 ? (
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Mínimo 6 caracteres
                </span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Senha Válida
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showSettingsPassword ? 'text' : 'password'}
                value={settingsForm.adminPasswordHash}
                onChange={(e) => setSettingsForm({ ...settingsForm, adminPasswordHash: e.target.value })}
                placeholder="Defina a senha de acesso (mínimo 6 caracteres)..."
                required
                className={`w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-[#0E131F] border text-xs sm:text-sm text-white font-mono transition-colors ${
                  (!settingsForm.adminPasswordHash || !settingsForm.adminPasswordHash.trim())
                    ? 'border-red-500/80 focus:ring-2 focus:ring-red-500/50'
                    : settingsForm.adminPasswordHash.trim().length < 6
                    ? 'border-amber-500/80 focus:ring-2 focus:ring-amber-500/50'
                    : 'border-[#222B3D] focus:ring-2 focus:ring-[#0866FF]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8C1D1] hover:text-white p-1 transition-colors cursor-pointer"
                aria-label={showSettingsPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showSettingsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {(!settingsForm.adminPasswordHash || !settingsForm.adminPasswordHash.trim()) ? (
              <p className="text-[11px] text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                A senha não pode ficar em branco. Ao salvar, uma credencial válida é estritamente exigida.
              </p>
            ) : settingsForm.adminPasswordHash.trim().length < 6 ? (
              <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                A senha deve conter no mínimo 6 caracteres para garantir a segurança da área administrativa.
              </p>
            ) : (
              <p className="text-[11px] text-[#B8C1D1] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00CFFF] shrink-0" />
                Esta senha será exigida obrigatoriamente a cada recarregamento da página ou novo acesso.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-[#222B3D]">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0866FF]/25"
            >
              <Save className="w-4 h-4" />
              Salvar Configurações Comerciais
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: API & ZOHO MAIL INTEGRATION */}
      {activeTab === 'api' && (
        <div className="space-y-8 max-w-5xl">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-[#0D1322] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-tight">API & Integração Zoho Mail</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0866FF]/20 text-[#00CFFF] border border-[#0866FF]/30 flex items-center gap-1">
                  <Server className="w-3 h-3" />
                  API REST v1.0.0
                </span>
                {(settingsForm.zohoAuthType !== 'smtp'
                  ? Boolean(settingsForm.zohoClientId && settingsForm.zohoClientSecret && settingsForm.zohoRefreshToken)
                  : Boolean(settingsForm.zohoUser && settingsForm.zohoPass)) ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Zoho Configurado
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Zoho Pendente de Configuração
                  </span>
                )}
              </div>
              <p className="text-xs text-[#B8C1D1] mt-1.5 leading-relaxed">
                Configure as credenciais SMTP do Zoho Mail para disparos automáticos de e-mails transacionais e acesse os endpoints de integração com formulários e ferramentas externas.
              </p>
            </div>
          </div>

          {/* CARD 1: ZOHO MAIL SETTINGS */}
          <div className="p-8 rounded-3xl bg-[#0E131F] border border-[#222B3D] space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#222B3D]">
              <div className="w-10 h-10 rounded-xl bg-[#0866FF]/15 border border-[#0866FF]/30 flex items-center justify-center text-[#00CFFF]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Servidor SMTP Zoho Mail</h3>
                <p className="text-xs text-[#B8C1D1]">
                  Envio de confirmação imediata ao cliente com protocolo e alerta automático para a equipe comercial.
                </p>
              </div>
            </div>

            {/* Auth Mode Selector */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#05070D] border border-[#222B3D] w-fit">
              <button
                type="button"
                onClick={() => setSettingsForm({ ...settingsForm, zohoAuthType: 'oauth2' })}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  settingsForm.zohoAuthType !== 'smtp'
                    ? 'bg-[#0866FF] text-white shadow-md shadow-[#0866FF]/20'
                    : 'text-[#B8C1D1] hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-[#00CFFF]" />
                API Zoho (OAuth 2.0 - Recomendado)
              </button>
              <button
                type="button"
                onClick={() => setSettingsForm({ ...settingsForm, zohoAuthType: 'smtp' })}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  settingsForm.zohoAuthType === 'smtp'
                    ? 'bg-[#0866FF] text-white shadow-md shadow-[#0866FF]/20'
                    : 'text-[#B8C1D1] hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                SMTP Tradicional (Senha)
              </button>
            </div>

            <form onSubmit={handleSaveApiSettings} className="space-y-5">
              {/* MODE 1: OAUTH 2.0 */}
              {settingsForm.zohoAuthType !== 'smtp' ? (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-[#05070D] border border-[#1E293B] flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        zohoVerifyState.checked && !zohoVerifyState.clientCredentialsValid
                          ? 'bg-red-400'
                          : 'bg-emerald-400 animate-pulse'
                      }`} />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {zohoVerifyState.checked
                            ? zohoVerifyState.clientCredentialsValid
                              ? 'Client ID e Client Secret Validados na Zoho API'
                              : 'Client ID ou Client Secret Inválidos na Zoho API'
                            : 'Credenciais Zoho API Configuradas'}
                        </span>
                        <span className="text-[11px] text-[#B8C1D1]">
                          {zohoVerifyState.checked && zohoVerifyState.error && !zohoVerifyState.tokenValid
                            ? zohoVerifyState.error
                            : 'Client ID e Client Secret ativos para autenticação segura e renovação automática.'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => runZohoVerification()}
                        disabled={isVerifyingZoho}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#172238] hover:bg-[#23314E] text-[#00CFFF] border border-[#0866FF]/40 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingZoho ? 'animate-spin' : ''}`} />
                        {isVerifyingZoho ? 'Verificando...' : 'Verificar & Renovar Token'}
                      </button>
                      {settingsForm.zohoRefreshToken && (!zohoVerifyState.checked || zohoVerifyState.tokenValid) ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          OAuth 2.0 Conectado (Refresh Token Ativo)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {zohoVerifyState.checked && !zohoVerifyState.tokenValid
                            ? 'Refresh Token Expirado / Gerar Novo Código'
                            : 'Aguardando Token de Concessão'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-white">Client ID</label>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settingsForm.zohoClientId || '', 'clientId')}
                          className="text-[10px] text-[#00CFFF] hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedEndpoint === 'clientId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedEndpoint === 'clientId' ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={settingsForm.zohoClientId || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, zohoClientId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-white">Client Secret</label>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(settingsForm.zohoClientSecret || '', 'clientSecret')}
                          className="text-[10px] text-[#00CFFF] hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedEndpoint === 'clientSecret' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedEndpoint === 'clientSecret' ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showClientSecret ? 'text' : 'password'}
                          value={settingsForm.zohoClientSecret || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, zohoClientSecret: e.target.value })}
                          className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowClientSecret(!showClientSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8C1D1] hover:text-white p-1 transition-colors cursor-pointer"
                          aria-label={showClientSecret ? 'Ocultar secret' : 'Ver secret'}
                        >
                          {showClientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white mb-1">
                        E-mail da Conta Zoho / Remetente e Respostas (Reply-To)
                      </label>
                      <input
                        type="email"
                        value={settingsForm.zohoUser ?? ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, zohoUser: e.target.value })}
                        placeholder="wort.studio@aliandre.com.br"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white"
                      />
                      <span className="text-[11px] text-[#B8C1D1]/70 mt-1 block">
                        E-mail para onde os clientes responderão os orçamentos automáticos (ex: wort.studio@aliandre.com.br).
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white mb-1">
                        Nome do Remetente Exibido
                      </label>
                      <input
                        type="text"
                        value={settingsForm.zohoSenderName ?? ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, zohoSenderName: e.target.value })}
                        placeholder="WortSite Studio"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Grant Code & Token Exchange Box */}
                  <div className="p-5 rounded-2xl bg-[#05070D] border border-[#0866FF]/30 space-y-4">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#00CFFF]" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Gerar / Vincular Tokens OAuth 2.0 (Self Client)
                      </h4>
                    </div>

                    <p className="text-xs text-[#B8C1D1] leading-relaxed">
                      Para conectar a API Zoho, acesse o <strong>Zoho API Console</strong> no seu client, clique na aba <strong>Gerar Código (Self Client)</strong>, defina o escopo como <code className="text-[#00CFFF] bg-[#171D2B] px-1 py-0.5 rounded">ZohoMail.messages.CREATE,ZohoMail.messages.ALL,ZohoMail.accounts.READ</code> com duração de 10 minutos e cole o código abaixo:
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <input
                        type="text"
                        value={grantCodeInput}
                        onChange={(e) => setGrantCodeInput(e.target.value)}
                        placeholder="Cole o Grant Token (ex: 1000.xxxxxxxx...) aqui..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0D1322] border border-[#222B3D] text-xs sm:text-sm text-white font-mono placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-1 focus:ring-[#0866FF]"
                      />
                      <button
                        type="button"
                        onClick={handleExchangeGrantCode}
                        disabled={isExchangingCode}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0866FF] to-[#00CFFF] hover:from-[#0654D4] hover:to-[#00B4E0] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-[#0866FF]/20"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isExchangingCode ? 'animate-spin' : ''}`} />
                        {isExchangingCode ? 'Gerando Tokens...' : 'Conectar & Gerar Tokens'}
                      </button>
                    </div>

                    {exchangeResult && (
                      <div
                        className={`p-3.5 rounded-xl text-xs flex items-start gap-2 animate-in fade-in ${
                          exchangeResult.success
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                            : 'bg-red-500/10 border border-red-500/30 text-red-300'
                        }`}
                      >
                        {exchangeResult.success ? (
                          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                        )}
                        <div>
                          <span className="font-bold block">
                            {exchangeResult.success ? 'Conexão OAuth2 Realizada!' : 'Erro na Troca de Token'}
                          </span>
                          <p className="mt-0.5">{exchangeResult.message || exchangeResult.error}</p>
                        </div>
                      </div>
                    )}

                    {settingsForm.zohoRefreshToken ? (
                      <div className="pt-3 border-t border-[#1E293B] space-y-3">
                        {zohoVerifyState.checked && !zohoVerifyState.tokenValid ? (
                          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5">
                              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-white block">
                                  Atenção: O Refresh Token abaixo não corresponde ao Client ID atual ou expirou
                                </span>
                                <span className="text-[11px] text-amber-300/90">
                                  Gere um novo código (Grant Token) no Zoho API Console (Self Client), cole no campo acima e clique em "Conectar & Gerar Tokens" para substituir automaticamente este token.
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                              Requer Novo Grant Token
                            </span>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5">
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div>
                                <span className="text-xs font-bold text-white block">Token Permanente OAuth 2.0 Gravado e Verificado</span>
                                <span className="text-[11px] text-emerald-300/80">A plataforma verifica e renova o Access Token automaticamente para todos os envios.</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                              Token Conectado & Verificado
                            </span>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-white">Refresh Token Permanente (Salvo no Banco — Substituído automaticamente ao Conectar)</label>
                            <span className="text-[10px] text-[#00CFFF]">Armazenamento seguro no Supabase</span>
                          </div>
                          <input
                            type="text"
                            value={settingsForm.zohoRefreshToken}
                            onChange={(e) => setSettingsForm({ ...settingsForm, zohoRefreshToken: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg bg-[#0D1322] border text-[11px] font-mono ${
                              zohoVerifyState.checked && !zohoVerifyState.tokenValid
                                ? 'border-amber-500/50 text-amber-300'
                                : 'border-[#222B3D] text-emerald-400'
                            }`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-[#1E293B]">
                        <span className="text-[11px] text-[#B8C1D1]/70 block">
                          Nenhum Refresh Token ativo no momento. Cole o código gerado no Zoho Console e clique em Conectar.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* MODE 2: SMTP TRADICIONAL */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-white mb-1">
                        Servidor SMTP (Host)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.zohoHost ?? ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, zohoHost: e.target.value })}
                        placeholder="smtp.zoho.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white mb-1">
                        Porta SMTP
                      </label>
                      <input
                        type="number"
                        value={settingsForm.zohoPort || 465}
                        onChange={(e) => setSettingsForm({ ...settingsForm, zohoPort: parseInt(e.target.value, 10) || 465 })}
                        placeholder="465"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white mb-1">
                        Usuário Zoho Mail (E-mail Remetente)
                      </label>
                      <input
                        type="email"
                        value={settingsForm.zohoUser || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, zohoUser: e.target.value })}
                        placeholder="contato@wortsite.com.br"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white mb-1">
                        Senha de Aplicativo Zoho (App Password)
                      </label>
                      <div className="relative">
                        <input
                          type={showZohoPassword ? 'text' : 'password'}
                          value={settingsForm.zohoPass || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, zohoPass: e.target.value })}
                          placeholder="Senha de 16 caracteres gerada no Zoho..."
                          className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowZohoPassword(!showZohoPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8C1D1] hover:text-white p-1 transition-colors cursor-pointer"
                          aria-label={showZohoPassword ? 'Ocultar senha' : 'Ver senha'}
                        >
                          {showZohoPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alert Recipient field for both */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-white mb-1">
                  E-mail para Receber Alertas de Novos Leads (Equipe Admin)
                </label>
                <input
                  type="email"
                  value={settingsForm.zohoAlertRecipient || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, zohoAlertRecipient: e.target.value })}
                  placeholder="contato@wortsite.com.br"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white"
                />
                <span className="text-[10px] text-[#B8C1D1]/60 mt-1 block">Onde a equipe comercial receberá a notificação com os dados do lead</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingApiSettings}
                  className="px-6 py-3 rounded-xl bg-[#0866FF] hover:bg-[#0654D4] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-[#0866FF]/25 transition-all disabled:opacity-50"
                >
                  <Save className={`w-4 h-4 ${isSavingApiSettings ? 'animate-spin' : ''}`} />
                  {isSavingApiSettings ? 'Gravando no Banco de Dados...' : 'Salvar Credenciais da API Zoho'}
                </button>
              </div>
            </form>

            {/* TEST ZONE */}
            <div className="mt-8 pt-6 border-t border-[#222B3D] space-y-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#00CFFF]" />
                <h4 className="text-sm font-bold text-white">Testar Conexão e Disparo Zoho Mail</h4>
              </div>
              <p className="text-xs text-[#B8C1D1]">
                Envie um e-mail de teste imediato para validar a autenticação (OAuth 2.0 ou SMTP) e o despacho pelo servidor Zoho.
              </p>

              <form onSubmit={handleTestZohoEmail} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="email"
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  placeholder={settingsForm.zohoAlertRecipient || settingsForm.contactEmail || settingsForm.zohoUser || 'Digite o e-mail de destino do teste...'}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#05070D] border border-[#222B3D] text-xs sm:text-sm text-white placeholder-[#B8C1D1]/40 focus:outline-none focus:ring-1 focus:ring-[#0866FF]"
                />
                <button
                  type="submit"
                  disabled={isTestingZoho}
                  className="px-5 py-2.5 rounded-xl bg-[#171D2B] hover:bg-[#222B3D] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-[#0866FF]/40 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingZoho ? 'animate-spin text-[#00CFFF]' : ''}`} />
                  {isTestingZoho ? 'Conectando ao Zoho...' : 'Testar Envio Agora'}
                </button>
              </form>

              {testZohoResult && (
                <div
                  className={`p-4 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in ${
                    testZohoResult.success
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border border-red-500/30 text-red-300'
                  }`}
                >
                  {testZohoResult.success ? (
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {testZohoResult.success ? 'Conexão e Envio Validados com Sucesso!' : 'Falha no Teste Zoho'}
                    </span>
                    <p className="mt-0.5 leading-relaxed">
                      {testZohoResult.message || testZohoResult.error}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CARD 2: API ENDPOINTS DOCUMENTATION & CURL TESTER */}
          <div className="p-8 rounded-3xl bg-[#0E131F] border border-[#222B3D] space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#222B3D]">
              <div className="w-10 h-10 rounded-xl bg-[#00CFFF]/15 border border-[#00CFFF]/30 flex items-center justify-center text-[#00CFFF]">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Documentação dos Endpoints da API WortSite</h3>
                <p className="text-xs text-[#B8C1D1]">
                  Integre formulários externos, campanhas do Google/Meta Ads, Webhooks ou CRMs diretamente ao banco de dados e motor de e-mails da WortSite.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* ENDPOINT 1: POST /api/quotes */}
              <div className="p-5 rounded-2xl bg-[#05070D] border border-[#222B3D] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      POST
                    </span>
                    <code className="text-sm font-mono text-white font-bold">/api/quotes</code>
                  </div>
                  <span className="text-xs text-[#00CFFF] font-medium">Processar Solicitação de Orçamento</span>
                </div>

                <p className="text-xs text-[#B8C1D1] leading-relaxed">
                  Endpoint principal chamado na submissão de orçamentos. Valida os dados, gera o número de protocolo comercial (<code className="text-white">WORT-YYYY-XXXX</code>), registra o lead com status <code className="text-amber-400 font-bold">pendente</code> e dispara e-mail de confirmação ao cliente e notificação à equipe via Zoho Mail.
                </p>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-white uppercase tracking-wider">Payload JSON Esperado</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          JSON.stringify(
                            {
                              name: 'Roberto Abreu',
                              email: 'roberto@empresa.com.br',
                              whatsapp: '11987654321',
                              projectType: 'site_institucional',
                              businessSegment: 'Saúde e Clínicas',
                              budgetRange: 'R$ 3.000 a R$ 6.000',
                              timeline: 'Prazo regular (10 a 20 dias)',
                              description: 'Precisamos de um site institucional de alto padrão com agendamento online.'
                            },
                            null,
                            2
                          ),
                          'payload-quotes'
                        )
                      }
                      className="text-[11px] text-[#00CFFF] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedEndpoint === 'payload-quotes' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedEndpoint === 'payload-quotes' ? 'Copiado!' : 'Copiar JSON'}
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-[11px] font-mono text-cyan-200 overflow-x-auto leading-relaxed">
{`{
  "name": "Roberto Abreu",
  "email": "roberto@empresa.com.br",
  "whatsapp": "11987654321",
  "projectType": "site_institucional", // 'site_institucional' | 'landing_page' | 'pagina_de_vendas' | 'site_comercio' | 'projeto_personalizado'
  "businessSegment": "Saúde e Clínicas",
  "budgetRange": "R$ 3.000 a R$ 6.000",
  "timeline": "Prazo regular (10 a 20 dias)",
  "description": "Precisamos de um site institucional de alto padrão com agendamento online."
}`}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-white uppercase tracking-wider">Comando cURL para Teste</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `curl -X POST http://localhost:3000/api/quotes -H "Content-Type: application/json" -d '{"name":"Roberto Abreu","email":"roberto@empresa.com.br","whatsapp":"11987654321","projectType":"site_institucional","businessSegment":"Saúde","budgetRange":"R$ 3.000 a R$ 6.000","timeline":"Regular","description":"Site para clínica"}'`,
                          'curl-quotes'
                        )
                      }
                      className="text-[11px] text-[#00CFFF] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedEndpoint === 'curl-quotes' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedEndpoint === 'curl-quotes' ? 'Copiado!' : 'Copiar cURL'}
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-[10px] sm:text-[11px] font-mono text-[#B8C1D1] overflow-x-auto">
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{`{"name":"Roberto Abreu","email":"roberto@empresa.com.br","whatsapp":"11987654321","projectType":"site_institucional","businessSegment":"Saúde","budgetRange":"R$ 3.000 a R$ 6.000","timeline":"Regular","description":"Site para clínica"}`}'
                  </pre>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-white uppercase tracking-wider block mb-1.5">Resposta de Sucesso (HTTP 201 Created)</span>
                  <pre className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{`{
  "success": true,
  "message": "Solicitação de orçamento recebida com sucesso.",
  "quote": {
    "id": "quote-1792635900000",
    "protocol": "WORT-2026-4821",
    "status": "pendente",
    "createdAt": "2026-10-22T02:40:00.000Z",
    "name": "Roberto Abreu",
    "email": "roberto@empresa.com.br",
    "whatsapp": "11987654321"
  },
  "emailSent": true,
  "adminNotified": true,
  "emailNotice": "E-mails enviados com sucesso via Zoho Mail."
}`}
                  </pre>
                </div>
              </div>

              {/* ENDPOINT 2: GET /api/quotes */}
              <div className="p-5 rounded-2xl bg-[#05070D] border border-[#222B3D] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E293B]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#0866FF]/20 text-[#00CFFF] border border-[#0866FF]/30">
                      GET
                    </span>
                    <code className="text-sm font-mono text-white font-bold">/api/quotes</code>
                  </div>
                  <span className="text-xs text-[#B8C1D1]">Listar Todos os Orçamentos</span>
                </div>
                <p className="text-xs text-[#B8C1D1] leading-relaxed">
                  Retorna array contendo todas as solicitações de orçamento cadastradas, ordenadas das mais recentes para as mais antigas.
                </p>
              </div>

              {/* ENDPOINT 3: PATCH /api/quotes/:id/status */}
              <div className="p-5 rounded-2xl bg-[#05070D] border border-[#222B3D] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E293B]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      PATCH
                    </span>
                    <code className="text-sm font-mono text-white font-bold">/api/quotes/:id/status</code>
                  </div>
                  <span className="text-xs text-[#00CFFF]">Atualizar Status do Orçamento</span>
                </div>
                <p className="text-xs text-[#B8C1D1] leading-relaxed">
                  Permite transição de status entre os 4 estados oficiais: <code className="text-amber-300 font-bold">pendente</code>, <code className="text-[#00CFFF] font-bold">em_analise</code>, <code className="text-[#0866FF] font-bold">proposta_enviada</code> e <code className="text-emerald-400 font-bold">concluido</code> (Conclusão). Se <code className="text-white font-bold">notifyClient: true</code> for enviado, notifica o cliente via Zoho Mail com o status correspondente.
                </p>

                <pre className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E293B] text-[11px] font-mono text-cyan-200 overflow-x-auto leading-relaxed">
{`{
  "status": "proposta_enviada", // "pendente" | "em_analise" | "proposta_enviada" | "concluido"
  "adminNotes": "Proposta enviada pelo WhatsApp e e-mail com modelo de apresentação personalizado.",
  "notifyClient": true // Opcional: dispara e-mail de status via Zoho Mail
}`}
                </pre>
              </div>

              {/* ENDPOINT 4: POST /api/test-email */}
              <div className="p-5 rounded-2xl bg-[#05070D] border border-[#222B3D] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E293B]">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      POST
                    </span>
                    <code className="text-sm font-mono text-white font-bold">/api/test-email</code>
                  </div>
                  <span className="text-xs text-[#B8C1D1]">Diagnóstico e Teste Zoho SMTP</span>
                </div>
                <p className="text-xs text-[#B8C1D1] leading-relaxed">
                  Realiza teste de handshake e envio para o e-mail informado no payload <code className="text-white">&#123; &quot;testRecipient&quot;: &quot;seu-email@teste.com&quot; &#125;</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
