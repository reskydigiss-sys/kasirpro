import React, { useState, useId, useEffect } from 'react';
import { User, AppTheme, ActiveTab, Product, CategoryItem, Promo } from '../types';
import { api } from '../services/api';
import { JSON_BUSINESS_TEMPLATES, JsonStoreTemplate } from '../data/jsonTemplates';
import { formatRupiah } from '../utils/formatters';

interface AccountPortalViewProps {
  initialMode: 'login' | 'register';
  theme: AppTheme;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onNavigate: (tab: ActiveTab) => void;
  onSwitchStore: (slug: string) => void;
}

export const AccountPortalView: React.FC<AccountPortalViewProps> = ({
  initialMode = 'login',
  theme,
  currentUser,
  onLoginSuccess,
  onNavigate,
  onSwitchStore
}) => {
  const isDark = theme === 'glacier-dark';
  const loginUserFieldId = useId();
  const loginPassFieldId = useId();

  // Mode: login, register-form, register-json
  const [activePortalTab, setActivePortalTab] = useState<'login' | 'register-form' | 'register-json'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'json' || params.get('register') === 'json') {
      return 'register-json';
    }
    return initialMode === 'register' ? 'register-json' : 'login';
  });

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Standard Register form state
  const [regName, setRegName] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCategory, setRegCategory] = useState('Retail & Minimarket');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // JSON Register state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('minimarket');
  const [jsonText, setJsonText] = useState<string>(() => {
    const defaultTemplate = JSON_BUSINESS_TEMPLATES[0];
    return JSON.stringify(defaultTemplate.data, null, 2);
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Success result state after registration (form or JSON)
  const [registeredStoreResult, setRegisteredStoreResult] = useState<{
    user: User;
    itemsCreated?: {
      products: number;
      categories: number;
      promos: number;
      customers?: number;
    };
    uniqueUrl: string;
  } | null>(null);

  // Live parsed JSON info
  const [parsedJsonData, setParsedJsonData] = useState<any>(() => {
    try {
      return JSON.parse(jsonText);
    } catch {
      return null;
    }
  });

  // Real-time JSON validation
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setParsedJsonData(parsed);
      setJsonError(null);
    } catch (err: any) {
      setParsedJsonData(null);
      setJsonError(err.message || 'Sintaks JSON tidak valid');
    }
  }, [jsonText]);

  // Generate preview slug for standard form
  const formPreviewSlug = regUsername
    ? regUsername.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    : regStoreName
    ? regStoreName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    : 'toko-baru';

  // Generate preview slug for JSON
  const jsonPreviewSlug = parsedJsonData?.store?.slug
    ? parsedJsonData.store.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    : parsedJsonData?.store?.username
    ? parsedJsonData.store.username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    : parsedJsonData?.store?.storeName
    ? parsedJsonData.store.storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    : 'toko-json';

  const currentPreviewSlug =
    activePortalTab === 'register-json' ? jsonPreviewSlug : formPreviewSlug;
  const fullStoreUrl = `${window.location.origin}${window.location.pathname}?u=${currentPreviewSlug}`;

  // Select Preset Template
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = JSON_BUSINESS_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setJsonText(JSON.stringify(tmpl.data, null, 2));
    }
  };

  // Format / Prettify JSON
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(`Gagal merapikan: ${err.message}`);
    }
  };

  // Handle File Upload (.json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
      }
    };
    reader.readAsText(file);
  };

  // Handle Copy JSON
  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Handle Download JSON
  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-${currentPreviewSlug || 'store'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('Harap masukkan username dan password akun toko Anda.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await api.login({
        username: loginUsername.trim(),
        password: loginPassword
      });

      // Update URL to the store's unique slug
      const url = new URL(window.location.href);
      url.searchParams.set('u', res.user.slug);
      url.searchParams.delete('portal');
      url.searchParams.delete('admin');
      url.searchParams.set('tab', 'kasir');
      window.history.pushState({}, '', url.toString());

      onLoginSuccess(res.user);
      onNavigate('kasir');
    } catch (err: any) {
      setLoginError(err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Quick Demo Login
  const handleQuickLogin = async (u: string, p: string) => {
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await api.login({ username: u, password: p });

      const url = new URL(window.location.href);
      url.searchParams.set('u', res.user.slug);
      url.searchParams.delete('portal');
      url.searchParams.delete('admin');
      url.searchParams.set('tab', 'kasir');
      window.history.pushState({}, '', url.toString());

      onLoginSuccess(res.user);
      onNavigate('kasir');
    } catch (err: any) {
      setLoginError(err.message || 'Quick login gagal.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Standard Form Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regStoreName.trim() || !regUsername.trim() || !regPassword) {
      setRegError('Semua kolom formulir pendaftaran toko wajib diisi.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await api.register({
        name: regName.trim(),
        storeName: regStoreName.trim(),
        username: regUsername.trim().toLowerCase(),
        password: regPassword,
        category: regCategory
      });

      const uniqueUrl = `${window.location.origin}${window.location.pathname}?u=${res.user.slug}`;
      setRegisteredStoreResult({
        user: res.user,
        itemsCreated: res.itemsCreated,
        uniqueUrl
      });
    } catch (err: any) {
      setRegError(err.message || 'Pendaftaran toko baru gagal. Username mungkin sudah digunakan.');
    } finally {
      setRegLoading(false);
    }
  };

  // JSON Register Submit: Executes JSON configuration and deploys unique page
  const handleJsonRegisterSubmit = async () => {
    setJsonError(null);
    if (!parsedJsonData) {
      setJsonError('Format JSON tidak valid. Harap periksa kembali sintaks JSON Anda.');
      return;
    }

    const store = parsedJsonData.store || {};
    if (!store.storeName || !store.username || !store.password) {
      setJsonError(
        'Objek "store" wajib memiliki atribut: "storeName", "username", dan "password".'
      );
      return;
    }

    setJsonLoading(true);
    try {
      const cleanSlug = (store.slug || store.username)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '');

      // Execute API register with JSON payload
      const res = await api.register({
        name: store.name || store.storeName,
        storeName: store.storeName,
        username: store.username.toLowerCase().trim(),
        password: store.password,
        category: store.category || 'Retail & Minimarket',
        starterProducts: parsedJsonData.starterProducts || [],
        starterCategories: parsedJsonData.starterCategories || [],
        starterPromos: parsedJsonData.starterPromos || [],
        starterCustomers: parsedJsonData.starterCustomers || []
      });

      // Sync local storage for instantaneous client caching
      if (Array.isArray(parsedJsonData.starterProducts) && parsedJsonData.starterProducts.length > 0) {
        const formattedProducts: Product[] = parsedJsonData.starterProducts.map((p: any, idx: number) => ({
          id: p.id || `prd-${cleanSlug}-${idx + 1}`,
          name: p.name,
          sku: p.sku || `${cleanSlug.slice(0, 3).toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
          category: p.category || 'Umum',
          price: Number(p.price) || 0,
          stock: Number(p.stock) ?? 10,
          imageUrl: p.imageUrl || '',
          description: p.description || ''
        }));
        localStorage.setItem(`kasirku_products_${cleanSlug}`, JSON.stringify(formattedProducts));
      }

      if (Array.isArray(parsedJsonData.starterCategories) && parsedJsonData.starterCategories.length > 0) {
        const formattedCategories: CategoryItem[] = parsedJsonData.starterCategories.map((c: any, idx: number) => ({
          id: c.id || `cat-${cleanSlug}-${idx + 1}`,
          name: c.name,
          icon: c.icon || 'category',
          color: c.color || 'blue',
          description: c.description || ''
        }));
        localStorage.setItem(`kasirku_categories_${cleanSlug}`, JSON.stringify(formattedCategories));
      }

      if (Array.isArray(parsedJsonData.starterPromos) && parsedJsonData.starterPromos.length > 0) {
        const formattedPromos: Promo[] = parsedJsonData.starterPromos.map((pr: any, idx: number) => ({
          id: pr.id || `prm-${cleanSlug}-${idx + 1}`,
          code: String(pr.code || `PROMO${idx + 1}`).toUpperCase().trim(),
          title: pr.title || 'Promo Spesial',
          type: pr.type || 'percentage',
          value: Number(pr.value) || 10,
          minSpend: Number(pr.min_spend || pr.minSpend) || 0,
          isActive: pr.is_active !== undefined ? Boolean(pr.is_active) : true
        }));
        localStorage.setItem(`kasirku_promos_${cleanSlug}`, JSON.stringify(formattedPromos));
      }

      const uniqueUrl = `${window.location.origin}${window.location.pathname}?u=${res.user.slug}`;
      setRegisteredStoreResult({
        user: res.user,
        itemsCreated: res.itemsCreated,
        uniqueUrl
      });
    } catch (err: any) {
      setJsonError(err.message || 'Eksekusi JSON pendaftaran gagal.');
    } finally {
      setJsonLoading(false);
    }
  };

  // Enter Store from Success Modal
  const handleEnterRegisteredStore = () => {
    if (!registeredStoreResult) return;
    const slug = registeredStoreResult.user.slug;
    const url = new URL(window.location.href);
    url.searchParams.set('u', slug);
    url.searchParams.delete('portal');
    url.searchParams.delete('admin');
    url.searchParams.set('tab', 'kasir');
    window.history.pushState({}, '', url.toString());

    onLoginSuccess(registeredStoreResult.user);
    onNavigate('kasir');
  };

  return (
    <div
      id="account-portal-page"
      className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200"
    >
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              PORTAL AKUN TOKO
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Halaman Unik Mandiri: ?u={currentPreviewSlug}</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
            {activePortalTab === 'login'
              ? 'Portal Masuk Akun Toko'
              : activePortalTab === 'register-json'
              ? 'Pendaftaran Toko via Konfigurasi JSON'
              : 'Portal Pendaftaran Akun Toko Baru'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Setiap toko memiliki katalog, transaksi, dan alamat URL halaman unik terisolasi di database cloud Turso.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('kasir')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Kembali ke Kasir</span>
          </button>

          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('tab', 'admin');
              url.searchParams.set('portal', 'admin');
              window.history.pushState({}, '', url.toString());
              onNavigate('admin');
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">shield_person</span>
            <span>Portal Kredensial Admin</span>
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => {
            setActivePortalTab('login');
            const url = new URL(window.location.href);
            url.searchParams.set('tab', 'login');
            url.searchParams.set('portal', 'login');
            url.searchParams.delete('mode');
            window.history.pushState({}, '', url.toString());
          }}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activePortalTab === 'login'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          <span>1. Masuk ke Akun Toko</span>
        </button>

        <button
          onClick={() => {
            setActivePortalTab('register-json');
            const url = new URL(window.location.href);
            url.searchParams.set('tab', 'register');
            url.searchParams.set('portal', 'register');
            url.searchParams.set('mode', 'json');
            window.history.pushState({}, '', url.toString());
          }}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activePortalTab === 'register-json'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-500">data_object</span>
          <span>2. Pendaftaran via JSON Pintar (Halaman Unik)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-500 text-white uppercase tracking-wider">
            JSON
          </span>
        </button>

        <button
          onClick={() => {
            setActivePortalTab('register-form');
            const url = new URL(window.location.href);
            url.searchParams.set('tab', 'register');
            url.searchParams.set('portal', 'register');
            url.searchParams.delete('mode');
            window.history.pushState({}, '', url.toString());
          }}
          className={`py-3 px-5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activePortalTab === 'register-form'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">add_business</span>
          <span>3. Daftar Toko (Formulir Manual)</span>
        </button>
      </div>

      {/* SUCCESS MODAL / BANNER (When a new store is registered) */}
      {registeredStoreResult && (
        <div className="p-6 rounded-2xl border bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/40 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <span className="material-symbols-outlined text-[28px]">verified</span>
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                  HALAMAN UNIK RESMI TERBIT
                </span>
                <h3 className="text-xl font-extrabold text-emerald-950 dark:text-emerald-100 mt-1">
                  Selamat! Toko &ldquo;{registeredStoreResult.user.storeName}&rdquo; Berhasil Didaftarkan
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Data katalog produk, kategori, dan promo dari konfigurasi telah aktif di database cloud Turso.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleEnterRegisteredStore}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <span>Buka Mesin Kasir Toko Ini</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Generated Unique URL Box */}
          <div
            className={`p-4 rounded-xl border font-mono text-xs space-y-2.5 ${
              isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans font-bold text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-emerald-500">link</span>
                <span>Tautan Halaman Unik Toko Anda (Bagikan / Bookmark):</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                Slug: ?u={registeredStoreResult.user.slug}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold break-all text-xs sm:text-sm select-all">
                {registeredStoreResult.uniqueUrl}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(registeredStoreResult.uniqueUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {copiedLink ? 'check' : 'content_copy'}
                </span>
                <span>{copiedLink ? 'Disalin!' : 'Salin URL'}</span>
              </button>
            </div>

            {/* Created Summary Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-sans text-xs">
              <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
                📦 {registeredStoreResult.itemsCreated?.products ?? 0} Produk Siap Jual
              </span>
              <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
                🏷️ {registeredStoreResult.itemsCreated?.categories ?? 0} Kategori Menu
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                🎟️ {registeredStoreResult.itemsCreated?.promos ?? 0} Voucher Kupon
              </span>
              <span className="text-slate-400 text-xs ml-auto">
                Username Login: <strong>@{registeredStoreResult.user.username}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 1: LOGIN PORTAL */}
      {activePortalTab === 'login' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Panel */}
          <div className="lg:col-span-7">
            <div
              className={`p-6 sm:p-8 rounded-2xl border shadow-sm space-y-6 ${
                isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <h3 className="text-lg font-bold">Masuk ke Toko Anda</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Masukkan username toko dan password untuk membuka sesi kasir dan data toko Anda.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-lg text-xs bg-rose-500/10 border border-rose-500/30 text-rose-500 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor={loginUserFieldId} className="block text-xs font-bold mb-1.5">
                    Username Toko / Pemilik
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[18px]">
                      account_circle
                    </span>
                    <input
                      id={loginUserFieldId}
                      type="text"
                      placeholder="Contoh: admin, tokoberkah, kopisenja"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border outline-none transition-colors ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500 focus:bg-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={loginPassFieldId} className="block text-xs font-bold mb-1.5">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[18px]">
                      lock
                    </span>
                    <input
                      id={loginPassFieldId}
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Masukkan kata sandi..."
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-colors ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500 focus:bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showLoginPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loginLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Masuk ke Halaman Toko (?u=slug)</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Login Accounts */}
              <div className="pt-4 border-t border-slate-200/30 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Masuk Cepat Akun Demo (1-Klik)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin', 'password123')}
                    disabled={loginLoading}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 hover:border-blue-500'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-500'
                    }`}
                  >
                    <p className="font-bold text-xs truncate">KASIRKU STORE</p>
                    <p className="text-[10px] text-slate-400 font-mono">@admin</p>
                    <span className="text-[10px] text-blue-500 font-semibold block mt-1">?u=admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('tokoberkah', 'berkah123')}
                    disabled={loginLoading}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 hover:border-blue-500'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-500'
                    }`}
                  >
                    <p className="font-bold text-xs truncate">Toko Berkah</p>
                    <p className="text-[10px] text-slate-400 font-mono">@tokoberkah</p>
                    <span className="text-[10px] text-blue-500 font-semibold block mt-1">?u=tokoberkah</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePortalTab('register-json')}
                    className={`p-2.5 rounded-xl border border-dashed text-left transition-colors cursor-pointer flex flex-col justify-center ${
                      isDark
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    }`}
                  >
                    <p className="font-bold text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">add_circle</span>
                      <span>Daftar via JSON</span>
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Template Instan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Unique URL Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">link</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Sistem Halaman Unik Toko
                  </h4>
                  <p className="text-[11px] text-slate-500">Isolasi data &amp; tautan mandiri</p>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border font-mono text-xs space-y-2 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-sans">Contoh Tautan Unik:</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                    ISOLATED
                  </span>
                </div>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold break-all">
                  {window.location.origin}/?u=nama-toko-anda
                </p>
                <div className="pt-1 text-[11px] text-slate-500 font-sans flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-sky-500">cloud</span>
                  <span>Tersimpan di Cloud Database Turso LibSQL</span>
                </div>
              </div>

              <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400 pt-1">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>Setiap akun memiliki katalog produk, kategori, dan transaksi sendiri.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>URL dapat disimpan dan langsung dibuka tanpa campur data toko lain.</span>
                </li>
              </ul>
            </div>

            {/* Portal Admin Quick Button */}
            <div
              className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-amber-950/20 border-amber-800/40 text-slate-200' : 'bg-amber-50 border-amber-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 text-amber-500">
                <span className="material-symbols-outlined text-[20px]">shield_person</span>
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Portal Kredensial Super Admin
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Akses kontrol penuh untuk memantau performa, transaksi, dan data seluruh toko cabang secara terpusat.
              </p>
              <button
                type="button"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('tab', 'admin');
                  url.searchParams.set('portal', 'admin');
                  window.history.pushState({}, '', url.toString());
                  onNavigate('admin');
                }}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>Buka Portal Kredensial Admin</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: SMART JSON REGISTRATION ENGINE */}
      {activePortalTab === 'register-json' && (
        <div className="space-y-6">
          {/* Business Preset Template Selector Bar */}
          <div
            className={`p-5 rounded-2xl border space-y-3.5 ${
              isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-black tracking-wider uppercase text-emerald-500 block">
                  PILIH TEMPLATE BISNIS JSON (1-KLIK)
                </span>
                <h3 className="text-base sm:text-lg font-bold">
                  Pilih Bidang Usaha untuk Memuat Skema Katalog JSON Otomatis
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all">
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Unggah File .json</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Template Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {JSON_BUSINESS_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="material-symbols-outlined text-[24px]">
                        {tmpl.icon}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs leading-tight line-clamp-1">
                        {tmpl.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {tmpl.data.starterProducts.length} Produk
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive JSON Editor & Live Preview Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: Raw JSON Editor with Controls */}
            <div className="lg:col-span-7 space-y-3">
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#0e1424] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                {/* Editor Header Toolbar */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/40 dark:border-slate-800 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-500">
                      code
                    </span>
                    <span className="text-xs font-bold font-mono">
                      Konfigurasi Toko (JSON Schema)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFormatJson}
                      title="Rapikan indentasi JSON"
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 hover:bg-slate-500/10 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                      <span>Rapikan JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyJson}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 hover:bg-slate-500/10 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedJson ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedJson ? 'Disalin' : 'Salin'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadJson}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 hover:bg-slate-500/10 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      <span>Unduh</span>
                    </button>
                  </div>
                </div>

                {/* Validation Status Pill */}
                {jsonError ? (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                    <span className="break-all">{jsonError}</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                      <span>Format JSON Valid &amp; Siap Dijalankan</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      ?u={jsonPreviewSlug}
                    </span>
                  </div>
                )}

                {/* Code Textarea Editor */}
                <div className="relative">
                  <textarea
                    id="json-config-textarea"
                    rows={17}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    spellCheck={false}
                    className={`w-full p-3 font-mono text-xs sm:text-sm rounded-xl border outline-none resize-y leading-relaxed transition-all ${
                      jsonError
                        ? 'border-rose-500/50 bg-rose-500/5'
                        : isDark
                        ? 'bg-[#090d18] border-slate-700 text-slate-100 focus:border-emerald-500'
                        : 'bg-slate-900 border-slate-800 text-slate-100 focus:border-emerald-500'
                    }`}
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  type="button"
                  id="btn-execute-json-registration"
                  onClick={handleJsonRegisterSubmit}
                  disabled={jsonLoading || Boolean(jsonError)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {jsonLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      <span>Memproses JSON &amp; Menerbitkan Halaman Unik...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                      <span>Jalankan Registrasi JSON &amp; Terbitkan Halaman Unik (?u={jsonPreviewSlug})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Live Parsed Info & Unique URL Preview */}
            <div className="lg:col-span-5 space-y-4">
              {/* Unique URL Card */}
              <div
                className={`p-5 rounded-2xl border space-y-3.5 ${
                  isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-emerald-500">
                    link
                  </span>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Halaman Unik yang Akan Diterbitkan
                  </h4>
                </div>

                <div
                  className={`p-3.5 rounded-xl border font-mono text-xs space-y-2 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-sans">
                    <span className="text-slate-400">Target URL Toko:</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                      SLUG: {jsonPreviewSlug}
                    </span>
                  </div>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold break-all text-xs sm:text-sm">
                    {fullStoreUrl}
                  </p>
                </div>

                {/* Parsed Store Info Cards */}
                {parsedJsonData?.store && (
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-200/40 dark:border-slate-800">
                      <span className="text-slate-500">Nama Toko:</span>
                      <span className="font-bold">{parsedJsonData.store.storeName || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-200/40 dark:border-slate-800">
                      <span className="text-slate-500">Pemilik:</span>
                      <span className="font-semibold">{parsedJsonData.store.name || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-200/40 dark:border-slate-800">
                      <span className="text-slate-500">Username Login:</span>
                      <span className="font-mono font-bold text-blue-500">@{parsedJsonData.store.username || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-200/40 dark:border-slate-800">
                      <span className="text-slate-500">Kategori Bisnis:</span>
                      <span className="font-semibold">{parsedJsonData.store.category || '-'}</span>
                    </div>
                  </div>
                )}

                {/* Parsed Item Count Statistics */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div
                    className={`p-2.5 rounded-xl border text-center ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-lg font-black text-blue-500 block">
                      {parsedJsonData?.starterProducts?.length || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Produk</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border text-center ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-lg font-black text-purple-500 block">
                      {parsedJsonData?.starterCategories?.length || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Kategori</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border text-center ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-lg font-black text-amber-500 block">
                      {parsedJsonData?.starterPromos?.length || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Promo</span>
                  </div>
                </div>
              </div>

              {/* Sample Product Catalog Preview from JSON */}
              {Array.isArray(parsedJsonData?.starterProducts) && parsedJsonData.starterProducts.length > 0 && (
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Pratinjau Produk dari JSON ({parsedJsonData.starterProducts.length} Item):
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {parsedJsonData.starterProducts.map((p: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold truncate">{p.name || `Produk ${idx + 1}`}</p>
                          <p className="text-[10px] text-slate-400">{p.sku || '-'} • {p.category || 'Umum'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(Number(p.price) || 0)}
                          </p>
                          <p className="text-[10px] text-slate-400">Stok: {p.stock ?? 0}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: STANDARD MANUAL FORM */}
      {activePortalTab === 'register-form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <div
              className={`p-6 sm:p-8 rounded-2xl border shadow-sm space-y-6 ${
                isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <h3 className="text-lg font-bold">Daftar Akun Toko Baru (Formulir Manual)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Masukkan rincian toko Anda. Anda akan langsung mendapatkan URL unik khusus toko Anda.
                </p>
              </div>

              {regError && (
                <div className="p-3 rounded-lg text-xs bg-rose-500/10 border border-rose-500/30 text-rose-500 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Nama Pemilik / Kasir</label>
                    <input
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5">Nama Toko / Usaha</label>
                    <input
                      type="text"
                      placeholder="Contoh: Kopi Senja POS"
                      value={regStoreName}
                      onChange={(e) => setRegStoreName(e.target.value)}
                      required
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5">Username Login (Unik)</label>
                    <input
                      type="text"
                      placeholder="Contoh: kopisenja"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      required
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5">Kategori Bisnis</label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                      }`}
                    >
                      <option value="Retail & Minimarket">Retail &amp; Minimarket</option>
                      <option value="Kafe & Restoran">Kafe &amp; Restoran</option>
                      <option value="Fashion & Pakaian">Fashion &amp; Pakaian</option>
                      <option value="Apotek & Kesehatan">Apotek &amp; Kesehatan</option>
                      <option value="Elektronik & Gadget">Elektronik &amp; Gadget</option>
                      <option value="Jasa & Servis">Jasa &amp; Servis</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5">Kata Sandi (Password)</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Minimal 4 karakter"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      className={`w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border outline-none ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showRegPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {regLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      <span>Mendaftarkan Toko &amp; Membuat Halaman...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>Daftarkan Toko &amp; Dapatkan Halaman Unik (?u={formPreviewSlug})</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Unique URL Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">link</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Pratinjau Tautan Unik Toko
                  </h4>
                  <p className="text-[11px] text-slate-500">Alamat permanen toko Anda</p>
                </div>
              </div>

              <div
                className={`p-3.5 rounded-xl border font-mono text-xs space-y-2 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-sans">URL Toko Anda:</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                    LIVE
                  </span>
                </div>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold break-all">
                  {fullStoreUrl}
                </p>
                <div className="pt-1 text-[11px] text-slate-500 font-sans flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-sky-500">cloud</span>
                  <span>Tersimpan di Cloud Database Turso LibSQL</span>
                </div>
              </div>

              <ul className="text-xs space-y-2 text-slate-500 dark:text-slate-400 pt-1">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>Data produk, kategori, dan stok terisolasi per toko.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>Riwayat transaksi dan omzet tercatat rapi mandiri.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
