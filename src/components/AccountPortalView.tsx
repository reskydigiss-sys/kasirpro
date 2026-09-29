import React, { useState } from 'react';
import { User, AppTheme, ActiveTab } from '../types';
import { api } from '../services/api';

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
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCategory, setRegCategory] = useState('Retail & Minimarket');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Generate preview slug
  const previewSlug = regUsername
    ? regUsername.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    : regStoreName
    ? regStoreName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    : 'nama-toko';

  const fullStoreUrl = `${window.location.origin}${window.location.pathname}?u=${previewSlug}`;

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

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

      setRegSuccess(
        `Selamat! Toko "${res.user.storeName}" berhasil didaftarkan. Mengalihkan ke halaman unik Anda...`
      );

      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('u', res.user.slug);
        url.searchParams.delete('portal');
        url.searchParams.delete('admin');
        url.searchParams.set('tab', 'kasir');
        window.history.pushState({}, '', url.toString());

        onLoginSuccess(res.user);
        onNavigate('kasir');
      }, 1200);
    } catch (err: any) {
      setRegError(err.message || 'Pendaftaran toko baru gagal. Username mungkin sudah digunakan.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div
      id="account-portal-page"
      className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200"
    >
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/40 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              PORTAL AKUN TOKO
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Halaman Unik: ?u=slug
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">
            {mode === 'login' ? 'Portal Masuk Akun Toko' : 'Portal Pendaftaran Toko Baru'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Setiap toko memiliki data terisolasi &amp; alamat tautan unik mandiri di database cloud Turso.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            <span>Portal Admin</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setMode('login');
            const url = new URL(window.location.href);
            url.searchParams.set('tab', 'login');
            url.searchParams.set('portal', 'login');
            window.history.pushState({}, '', url.toString());
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            mode === 'login'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">login</span>
          <span>Masuk ke Akun Toko</span>
        </button>

        <button
          onClick={() => {
            setMode('register');
            const url = new URL(window.location.href);
            url.searchParams.set('tab', 'register');
            url.searchParams.set('portal', 'register');
            window.history.pushState({}, '', url.toString());
          }}
          className={`py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            mode === 'register'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">add_business</span>
          <span>Daftar Toko Baru (Halaman Unik)</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Panel */}
        <div className="lg:col-span-7">
          {mode === 'login' ? (
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
                  <label className="block text-xs font-bold mb-1.5">Username Toko / Pemilik</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[18px]">
                      account_circle
                    </span>
                    <input
                      type="text"
                      placeholder="Contoh: admin, jaya_mart, toko_berkah"
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
                  <label className="block text-xs font-bold mb-1.5">Kata Sandi (Password)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 material-symbols-outlined text-[18px]">
                      lock
                    </span>
                    <input
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
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                      <span>Masuk ke Halaman Toko</span>
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
                    onClick={() => handleQuickLogin('jaya_mart', 'password123')}
                    disabled={loginLoading}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 hover:border-blue-500'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-500'
                    }`}
                  >
                    <p className="font-bold text-xs truncate">Jaya Mart Retail</p>
                    <p className="text-[10px] text-slate-400 font-mono">@jaya_mart</p>
                    <span className="text-[10px] text-blue-500 font-semibold block mt-1">?u=jaya-mart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('toko_berkah', 'password123')}
                    disabled={loginLoading}
                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 hover:border-blue-500'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-500'
                    }`}
                  >
                    <p className="font-bold text-xs truncate">Berkah Kelontong</p>
                    <p className="text-[10px] text-slate-400 font-mono">@toko_berkah</p>
                    <span className="text-[10px] text-blue-500 font-semibold block mt-1">?u=toko-berkah</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`p-6 sm:p-8 rounded-2xl border shadow-sm space-y-6 ${
                isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <h3 className="text-lg font-bold">Daftar Akun Toko Baru</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Buat toko baru dalam hitungan detik. Anda akan langsung mendapatkan URL unik khusus toko Anda.
                </p>
              </div>

              {regError && (
                <div className="p-3 rounded-lg text-xs bg-rose-500/10 border border-rose-500/30 text-rose-500 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{regSuccess}</span>
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
                      placeholder="Minimal 6 karakter"
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
                      <span>Daftarkan Toko &amp; Dapatkan Halaman Unik</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Unique URL Preview Card & Multi-Store Info */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Preview Unique URL Card */}
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
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-500 shrink-0 mt-0.5">
                  check_circle
                </span>
                <span>Dapat diakses langsung kasir dari perangkat apa pun.</span>
              </li>
            </ul>
          </div>

          {/* Super Admin Credential Portal Link */}
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
    </div>
  );
};
