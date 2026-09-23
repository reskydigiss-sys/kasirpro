import React, { useState, useEffect, useId } from 'react';
import { User, AppTheme, ActiveTab } from '../types';
import { api, AdminOverviewData, StoreSummaryItem, AdminLatestTx } from '../services/api';
import { formatRupiah, formatDate } from '../utils/formatters';

interface AdminPortalViewProps {
  currentUser: User;
  theme: AppTheme;
  onNavigate: (tab: ActiveTab) => void;
  onSwitchStore: (slug: string) => void;
  onAdminLoginSuccess: (adminUser: User) => void;
  onAdminLogout: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  currentUser,
  theme,
  onNavigate,
  onSwitchStore,
  onAdminLoginSuccess,
  onAdminLogout
}) => {
  const isDark = theme === 'glacier-dark';
  const usernameInputId = useId();
  const passwordInputId = useId();

  // Admin Authentication State: Selalu wajib login manual (auto login dihilangkan)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Bersihkan sisa sesi login admin saat komponen dimuat agar selalu meminta login
  useEffect(() => {
    localStorage.removeItem('kasirku_admin_session');
  }, []);

  // Login Form State: Kosong secara default agar user memasukkan kredensial manual
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Overview Data State
  const [overviewData, setOverviewData] = useState<AdminOverviewData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [errorData, setErrorData] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  // Filter & Search
  const [searchStoreQuery, setSearchStoreQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Copy Feedback
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Selected Store for Deep Inspection Modal
  const [inspectingStore, setInspectingStore] = useState<StoreSummaryItem | null>(null);

  // New Store Modal State
  const [isCreateStoreModalOpen, setIsCreateStoreModalOpen] = useState(false);
  const [newStoreData, setNewStoreData] = useState({
    name: '',
    storeName: '',
    username: '',
    password: '',
    category: 'Retail & Minimarket'
  });
  const [creatingStore, setCreatingStore] = useState(false);
  const [createStoreError, setCreateStoreError] = useState('');
  const [createStoreSuccess, setCreateStoreSuccess] = useState('');

  // Load Admin Overview Data when authenticated
  const fetchOverview = async () => {
    setLoadingData(true);
    setErrorData('');
    try {
      const data = await api.getAdminOverview();
      setOverviewData(data);
      setLastRefreshed(new Date().toLocaleTimeString('id-ID'));
    } catch (err: any) {
      setErrorData(err.message || 'Gagal memuat ringkasan monitoring toko');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchOverview();
    }
  }, [isAdminAuthenticated]);

  // Handle Dedicated Admin Login
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!username.trim() || !password) {
      setLoginError('Username dan password administrator wajib diisi');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await api.adminLogin({
        username: username.trim(),
        password: password
      });

      // Sesi hanya aktif di memori selama berada di portal admin (tidak disimpan permanen di localStorage)
      setIsAdminAuthenticated(true);
      onAdminLoginSuccess(res.user);
    } catch (err: any) {
      setLoginError(err.message || 'Login administrator gagal. Periksa username dan password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickDemoAdmin = () => {
    setUsername('admin');
    setPassword('password123');
    setLoginError('');
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('kasirku_admin_session');
    setIsAdminAuthenticated(false);
    setUsername('');
    setPassword('');
    onAdminLogout();
  };

  const handleCopyStoreLink = (slug: string) => {
    const origin = window.location.origin;
    const url = `${origin}?u=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleCreateNewStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateStoreError('');
    setCreateStoreSuccess('');
    if (
      !newStoreData.name ||
      !newStoreData.storeName ||
      !newStoreData.username ||
      !newStoreData.password
    ) {
      setCreateStoreError('Semua kolom formulir toko wajib diisi');
      return;
    }

    setCreatingStore(true);
    try {
      const res = await api.register({
        name: newStoreData.name.trim(),
        storeName: newStoreData.storeName.trim(),
        username: newStoreData.username.trim().toLowerCase(),
        password: newStoreData.password,
        category: newStoreData.category
      });

      setCreateStoreSuccess(`Toko "${res.user.storeName}" berhasil didaftarkan dengan slug ?u=${res.user.slug}`);
      setNewStoreData({
        name: '',
        storeName: '',
        username: '',
        password: '',
        category: 'Retail & Minimarket'
      });
      await fetchOverview();
      setTimeout(() => {
        setIsCreateStoreModalOpen(false);
        setCreateStoreSuccess('');
      }, 1800);
    } catch (err: any) {
      setCreateStoreError(err.message || 'Gagal mendaftarkan toko baru');
    } finally {
      setCreatingStore(false);
    }
  };

  // Filtered Stores
  const filteredStores = (overviewData?.stores || []).filter((store) => {
    const matchesSearch =
      store.storeName.toLowerCase().includes(searchStoreQuery.toLowerCase()) ||
      store.slug.toLowerCase().includes(searchStoreQuery.toLowerCase()) ||
      store.name.toLowerCase().includes(searchStoreQuery.toLowerCase()) ||
      store.username.toLowerCase().includes(searchStoreQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' ||
      store.category.toLowerCase().includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  /* =================================================================================
     VIEW A: DEDICATED SUPER ADMIN LOGIN PAGE (When not yet authenticated as Admin)
     ================================================================================= */
  if (!isAdminAuthenticated) {
    return (
      <div
        id="admin-login-view"
        className={`min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-10 transition-colors ${
          isDark ? 'bg-[#090d18] text-slate-100' : 'bg-slate-100/80 text-slate-900'
        }`}
      >
        <div className="w-full max-w-md space-y-6">
          {/* Security & System Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 shadow-xl text-white">
              <span className="material-symbols-outlined text-[34px]">admin_panel_settings</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                <span>RESTRICTED ACCESS • SUPER ADMIN ONLY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Portal Admin Aplikasi
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Pusat Kontrol &amp; Pengawasan Multi-Toko KASIRKU
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div
            className={`rounded-2xl border p-6 sm:p-8 shadow-2xl space-y-5 transition-all ${
              isDark
                ? 'bg-[#0f172a] border-slate-800 shadow-black/40'
                : 'bg-white border-slate-200 shadow-slate-300/40'
            }`}
          >
            {/* Notice */}
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                isDark
                  ? 'bg-blue-950/30 border-blue-900/50 text-blue-300'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-blue-500 shrink-0 mt-0.5">
                verified_user
              </span>
              <p className="leading-relaxed">
                Halaman ini khusus untuk <strong>Administrator Utama</strong> untuk memantau performa,
                omset, dan inventori seluruh toko cabang di database cloud Turso.
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2 animate-shake">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor={usernameInputId}
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Username Administrator
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                    shield_person
                  </span>
                  <input
                    id={usernameInputId}
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: admin"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border outline-none font-medium transition-all ${
                      isDark
                        ? 'bg-[#131d36] border-slate-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor={passwordInputId}
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Password Administrator
                  </label>
                  <span className="text-[11px] text-slate-400">Default: password123</span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                    lock
                  </span>
                  <input
                    id={passwordInputId}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password admin"
                    className={`w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border outline-none font-mono transition-all ${
                      isDark
                        ? 'bg-[#131d36] border-slate-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-admin-login-submit"
                disabled={loginLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    <span>Memverifikasi Akses Admin...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                    <span>Masuk ke Pusat Pengawasan Toko</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Autofill Button */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                id="btn-autofill-admin"
                onClick={handleQuickDemoAdmin}
                className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-amber-950/20 border-amber-900/40 text-amber-300 hover:bg-amber-950/40'
                    : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">key</span>
                <span>Isi Otomatis Kredensial Super Admin Demo (admin / password123)</span>
              </button>
            </div>
          </div>

          {/* Navigation Back Link */}
          <div className="text-center space-y-2 text-xs">
            <button
              onClick={() => onNavigate('kasir')}
              className="text-slate-500 hover:text-blue-600 dark:hover:text-sky-400 font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Bukan Admin? Kembali ke Mesin Kasir Toko</span>
            </button>
            <p className="text-[11px] text-slate-400">
              KASIRKU Cloud Operational System • Turso LibSQL Edge Database
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =================================================================================
     VIEW B: FULL CENTRAL STORE MONITORING DASHBOARD (Authenticated Super Admin)
     ================================================================================= */
  return (
    <div
      id="admin-monitoring-dashboard"
      className={`min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 transition-colors ${
        isDark ? 'bg-[#090d18] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. SUPER ADMIN EXECUTIVE BAR */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md ${
          isDark
            ? 'bg-[#0e1424] border-slate-800'
            : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <span className="material-symbols-outlined text-[28px]">shield</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/40">
                SUPER ADMIN AKTIF
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Database Connected"></span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Turso LibSQL Edge
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold mt-0.5">
              Pusat Monitoring &amp; Pengawasan Seluruh Toko
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Admin: <strong>{currentUser.name}</strong> ({currentUser.username}) • Terakhir diperbarui: {lastRefreshed || 'Baru saja'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={fetchOverview}
            disabled={loadingData}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark
                ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200'
                : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Refresh Data Seluruh Toko"
          >
            <span className={`material-symbols-outlined text-[16px] ${loadingData ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Segarkan Data</span>
          </button>

          <button
            onClick={() => setIsCreateStoreModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_business</span>
            <span>Daftar Toko Baru</span>
          </button>

          <button
            onClick={handleLogoutAdmin}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Keluar Admin</span>
          </button>
        </div>
      </div>

      {/* 2. GLOBAL METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Stores */}
        <div
          className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
            isDark ? 'bg-[#10172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Jaringan Toko
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">storefront</span>
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-blue-600 dark:text-sky-400 mt-2">
            {overviewData?.globalStats.totalStores ?? '...'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-bold">●</span> Terdaftar di Turso Cloud
          </p>
        </div>

        {/* Metric 2: Total Akumulasi Omset */}
        <div
          className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
            isDark ? 'bg-[#10172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Akumulasi Omset Semua Toko
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-2 truncate">
            {overviewData ? formatRupiah(overviewData.globalStats.totalRevenue) : '...'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-bold">●</span> Total penjualan gabungan
          </p>
        </div>

        {/* Metric 3: Total Transaksi Global */}
        <div
          className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
            isDark ? 'bg-[#10172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Transaksi Terproses
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-2">
            {overviewData?.globalStats.totalTransactions ?? '...'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-purple-500 font-bold">●</span> Struk kasir di semua cabang
          </p>
        </div>

        {/* Metric 4: Total Produk SKU */}
        <div
          className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
            isDark ? 'bg-[#10172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Katalog SKU Produk
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-2">
            {overviewData?.globalStats.totalProducts ?? '...'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-amber-500 font-bold">●</span> Terkelola di inventori cloud
          </p>
        </div>
      </div>

      {/* 3. STORE NETWORK TABLE & SEARCH BAR */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-sm ${
          isDark ? 'bg-[#0e1424] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-sky-400">
                store
              </span>
              Daftar Semua Toko Terdaftar ({filteredStores.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau statistik tiap cabang, salin link URL unik, atau beralih langsung mengelola toko tersebut.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchStoreQuery}
                onChange={(e) => setSearchStoreQuery(e.target.value)}
                placeholder="Cari toko, pemilik, atau slug..."
                className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500'
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`px-3 py-1.5 text-xs rounded-xl border outline-none cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Semua Kategori Usaha</option>
              <option value="retail">Retail &amp; Minimarket</option>
              <option value="tulis">Alat Tulis &amp; Fotocopy</option>
              <option value="kuliner">Kuliner &amp; Cafe</option>
              <option value="fashion">Fashion &amp; Butik</option>
            </select>
          </div>
        </div>

        {/* Copy Notification Toast */}
        {copiedSlug && (
          <div className="mx-5 my-2 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Link toko (?u={copiedSlug}) berhasil disalin ke clipboard!</span>
          </div>
        )}

        {/* Stores Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead
              className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-[#0a0e1a] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <tr>
                <th className="p-4">Nama Toko &amp; Identitas</th>
                <th className="p-4">Kategori Bisnis</th>
                <th className="p-4 text-center">Produk Aktif</th>
                <th className="p-4 text-center">Total Transaksi</th>
                <th className="p-4 text-right">Total Omset</th>
                <th className="p-4 text-center">Status Jaringan</th>
                <th className="p-4 text-right">Tindakan Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ada toko yang cocok dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr
                    key={store.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Store Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 font-bold flex items-center justify-center shrink-0">
                          {store.storeName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            {store.storeName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span className="text-blue-600 dark:text-sky-400 font-semibold">
                              ?u={store.slug}
                            </span>
                            <span>·</span>
                            <span>{store.name} ({store.username})</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {store.category}
                      </span>
                    </td>

                    {/* Products Count */}
                    <td className="p-4 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {store.productsCount}
                    </td>

                    {/* Transactions Count */}
                    <td className="p-4 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                      {store.transactionsCount}
                    </td>

                    {/* Total Revenue */}
                    <td className="p-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                      {formatRupiah(store.totalRevenue)}
                    </td>

                    {/* Network Status */}
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Aktif di Cloud
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Switch to this store */}
                        <button
                          onClick={() => {
                            onSwitchStore(store.slug);
                            onNavigate('kasir');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          title="Buka Mesin Kasir Toko Ini"
                        >
                          <span className="material-symbols-outlined text-[14px]">point_of_sale</span>
                          <span>Buka Kasir</span>
                        </button>

                        {/* Copy Link */}
                        <button
                          onClick={() => handleCopyStoreLink(store.slug)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isDark
                              ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                              : 'border-slate-300 hover:bg-slate-100 text-slate-600'
                          }`}
                          title="Salin Link Halaman Toko (?u=slug)"
                        >
                          <span className="material-symbols-outlined text-[16px]">link</span>
                        </button>

                        {/* Inspect details */}
                        <button
                          onClick={() => setInspectingStore(store)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isDark
                              ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                              : 'border-slate-300 hover:bg-slate-100 text-slate-600'
                          }`}
                          title="Lihat Detail Toko"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. LIVE GLOBAL TRANSACTIONS FEED (Lintas Seluruh Toko) */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-sm ${
          isDark ? 'bg-[#0e1424] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-emerald-500">
                history_toggle_off
              </span>
              Feed Transaksi Global Lintas Seluruh Toko (Terbaru)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Aktivitas checkout kasir yang masuk secara langsung dari seluruh cabang toko di jaringan.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Update Realtime Turso LibSQL
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
          {(!overviewData?.latestTransactions || overviewData.latestTransactions.length === 0) ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Belum ada data transaksi global yang tercatat.
            </div>
          ) : (
            overviewData.latestTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                  isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    TX
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {tx.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-300 border border-blue-200 dark:border-blue-900/50">
                        {tx.storeName} (?u={tx.storeSlug})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Kasir: {tx.cashierName} • {formatDate(tx.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {tx.paymentMethod}
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(tx.total)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. MODAL: REGISTER NEW STORE FROM ADMIN */}
      {isCreateStoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className={`relative rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border p-6 space-y-4 animate-in fade-in-50 zoom-in-95 ${
              isDark ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">add_business</span>
                </div>
                <div>
                  <h3 className="font-bold text-base">Pendaftaran Toko Baru</h3>
                  <p className="text-xs text-slate-400">Buat akun cabang &amp; slug URL unik toko</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateStoreModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {createStoreError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500">
                {createStoreError}
              </div>
            )}
            {createStoreSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-500">
                {createStoreSuccess}
              </div>
            )}

            <form onSubmit={handleCreateNewStore} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Toko / Usaha *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi Senja Space"
                  value={newStoreData.storeName}
                  onChange={(e) => {
                    const storeName = e.target.value;
                    const autoUsername = storeName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    setNewStoreData({
                      ...newStoreData,
                      storeName,
                      username: newStoreData.username ? newStoreData.username : autoUsername
                    });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nama Pemilik / Manajer *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Pratama"
                    value={newStoreData.name}
                    onChange={(e) => setNewStoreData({ ...newStoreData, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Kategori Usaha</label>
                  <select
                    value={newStoreData.category}
                    onChange={(e) => setNewStoreData({ ...newStoreData, category: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value="Retail & Minimarket">Retail &amp; Minimarket</option>
                    <option value="Alat Tulis & Fotocopy">Alat Tulis &amp; Fotocopy</option>
                    <option value="Kuliner & Cafe">Kuliner &amp; Cafe</option>
                    <option value="Fashion & Butik">Fashion &amp; Butik</option>
                    <option value="Apotek & Kesehatan">Apotek &amp; Kesehatan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Username / Slug Toko *</label>
                  <input
                    type="text"
                    required
                    placeholder="kopisenja"
                    value={newStoreData.username}
                    onChange={(e) =>
                      setNewStoreData({
                        ...newStoreData,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
                      })
                    }
                    className={`w-full px-3 py-2 rounded-xl border outline-none font-mono ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    URL: ?u={newStoreData.username || 'slug'}
                  </span>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Password Akun Toko *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 karakter"
                    value={newStoreData.password}
                    onChange={(e) => setNewStoreData({ ...newStoreData, password: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border outline-none font-mono ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateStoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingStore}
                  className="px-5 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creatingStore ? 'Menyimpan...' : 'Daftarkan Toko ke Cloud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: INSPECT STORE DETAILS */}
      {inspectingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className={`relative rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border p-6 space-y-4 ${
              isDark ? 'bg-[#0f172a] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base">{inspectingStore.storeName}</h3>
                <p className="text-xs text-slate-400 font-mono">Slug: ?u={inspectingStore.slug}</p>
              </div>
              <button
                onClick={() => setInspectingStore(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-slate-400 text-[11px]">Total Omset</p>
                  <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatRupiah(inspectingStore.totalRevenue)}
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-slate-400 text-[11px]">Total Transaksi</p>
                  <p className="text-base font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                    {inspectingStore.transactionsCount} Struk
                  </p>
                </div>
              </div>

              <div className={`p-3 rounded-xl border space-y-1.5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pemilik / Pengelola:</span>
                  <span className="font-semibold">{inspectingStore.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Username Login:</span>
                  <span className="font-mono font-semibold">{inspectingStore.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kategori Usaha:</span>
                  <span className="font-semibold">{inspectingStore.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Katalog Produk SKU:</span>
                  <span className="font-mono font-semibold">{inspectingStore.productsCount} Item</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    onSwitchStore(inspectingStore.slug);
                    setInspectingStore(null);
                    onNavigate('kasir');
                  }}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
                  <span>Buka Kasir Toko Ini</span>
                </button>
                <button
                  onClick={() => {
                    handleCopyStoreLink(inspectingStore.slug);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>Salin Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
