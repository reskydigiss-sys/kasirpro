import React, { useState, useEffect } from 'react';
import { User, AppTheme } from '../types';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  theme: AppTheme;
  initialTab?: 'login' | 'register' | 'monitor';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  theme,
  initialTab = 'login'
}) => {
  const isDark = theme === 'glacier-dark';
  const [tab, setTab] = useState<'login' | 'register' | 'monitor'>(initialTab);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCategory, setRegCategory] = useState('Retail & Minimarket');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Users monitor state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Synchronize initialTab if changed
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      loadUsers();
    }
  }, [isOpen, initialTab]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await api.getUsers();
      setAllUsers(list);
    } catch (e) {
      console.warn('Failed to fetch users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername || !loginPassword) {
      setLoginError('Harap isi username dan password');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await api.login({
        username: loginUsername.trim(),
        password: loginPassword
      });
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setLoginError(err.message || 'Gagal masuk');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await api.login({ username: u, password: p });
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setLoginError(err.message || 'Gagal masuk');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName || !regStoreName || !regUsername || !regPassword) {
      setRegError('Semua kolom wajib diisi');
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
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setRegError(err.message || 'Pendaftaran gagal');
    } finally {
      setRegLoading(false);
    }
  };

  const handleCopyUniqueLink = (slug: string) => {
    const url = `${window.location.origin}${window.location.pathname}?u=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  // Preview generated URL for registration
  const previewSlug = regUsername.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '') || 'toko-anda';
  const previewUrl = `${window.location.origin}${window.location.pathname}?u=${previewSlug}`;

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-in fade-in-50 duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="auth-modal-content"
        className={`w-full max-w-xl rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh] ${
          isDark
            ? 'bg-[#111827] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-[#0e1422]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-blue-100 text-blue-600'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-base leading-snug">
                {currentUser ? `Akun: ${currentUser.storeName}` : 'Autentikasi & Halaman Unik Toko'}
              </h3>
              <p className="text-xs text-slate-400">
                {currentUser
                  ? `@${currentUser.username} • Halaman Unik Aktif`
                  : 'Akses kredensial toko & pantau halaman unik setiap pengguna'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex border-b text-xs font-semibold px-6 pt-2 gap-2 ${
            isDark ? 'border-slate-800 bg-[#0e1422]' : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <button
            id="tab-btn-login"
            onClick={() => setTab('login')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'login'
                ? isDark
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            Masuk Akun
          </button>

          <button
            id="tab-btn-register"
            onClick={() => setTab('register')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'register'
                ? isDark
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Buat Akun Baru
          </button>

          <button
            id="tab-btn-monitor"
            onClick={() => {
              setTab('monitor');
              loadUsers();
            }}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'monitor'
                ? isDark
                  ? 'border-blue-500 text-white font-bold'
                  : 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">monitoring</span>
            Pantau Halaman Unik ({allUsers.length || 2})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <div className="space-y-4">
              {currentUser && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isDark
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="font-bold text-xs">Sedang login sebagai: {currentUser.name}</p>
                      <p className="text-[11px] opacity-80">
                        {currentUser.storeName} (@{currentUser.username})
                      </p>
                    </div>
                  </div>
                  <button
                    id="btn-auth-logout"
                    onClick={onLogout}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    Keluar Akun
                  </button>
                </div>
              )}

              {loginError && (
                <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Username Toko
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 material-symbols-outlined text-[18px] text-slate-400">
                      account_circle
                    </span>
                    <input
                      id="input-login-username"
                      type="text"
                      placeholder="Contoh: admin atau tokoberkah"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 focus:ring-blue-500 text-slate-100 placeholder:text-slate-500'
                          : 'bg-white border-slate-300 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 material-symbols-outlined text-[18px] text-slate-400">
                      lock
                    </span>
                    <input
                      id="input-login-password"
                      type="password"
                      placeholder="Masukkan kata sandi"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 focus:ring-blue-500 text-slate-100 placeholder:text-slate-500'
                          : 'bg-white border-slate-300 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 px-4 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loginLoading ? (
                    <span>Memproses...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Masuk ke Halaman Toko</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Login Accounts */}
              <div className="pt-3 border-t border-slate-200/20">
                <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Kredensial Cepat (Demo Akun):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    id="btn-quick-login-admin"
                    type="button"
                    onClick={() => handleQuickLogin('admin', 'password123')}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs flex items-center gap-2.5 ${
                      isDark
                        ? 'bg-slate-950/40 border-sky-400/20 hover:border-sky-400/50 text-slate-200'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-sky-400">
                      storefront
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold truncate">Admin Kasirku</p>
                      <p className="text-[10px] text-slate-400">admin / password123</p>
                    </div>
                  </button>

                  <button
                    id="btn-quick-login-berkah"
                    type="button"
                    onClick={() => handleQuickLogin('tokoberkah', 'berkah123')}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs flex items-center gap-2.5 ${
                      isDark
                        ? 'bg-slate-950/40 border-emerald-400/20 hover:border-emerald-400/50 text-slate-200'
                        : 'bg-slate-50 border-slate-200 hover:border-emerald-400 text-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-emerald-400">
                      local_convenience_store
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold truncate">Toko Berkah</p>
                      <p className="text-[10px] text-slate-400">tokoberkah / berkah123</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW ACCOUNT */}
          {tab === 'register' && (
            <div className="space-y-4">
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isDark
                    ? 'bg-sky-950/30 border-sky-400/20 text-sky-200'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  <span>Setiap Pengguna Baru Otomatis Memiliki Halaman Unik Sendiri!</span>
                </div>
                <span>
                  Sistem akan mengisolasi katalog produk, transaksi kasir, dan riwayat penjualan
                  secara terpisah di database Turso.
                </span>
              </div>

              {regError && (
                <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Nama Lengkap Pemilik
                    </label>
                    <input
                      id="input-reg-name"
                      type="text"
                      placeholder="Contoh: Siti Rahma"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-950/50 border-sky-400/20 focus:ring-sky-400 text-slate-100'
                          : 'bg-white border-slate-200 focus:ring-blue-500 text-slate-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Nama Usaha / Toko
                    </label>
                    <input
                      id="input-reg-store-name"
                      type="text"
                      placeholder="Contoh: Kopi Senja Abadi"
                      value={regStoreName}
                      onChange={(e) => {
                        setRegStoreName(e.target.value);
                        if (!regUsername) {
                          setRegUsername(
                            e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')
                          );
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-950/50 border-sky-400/20 focus:ring-sky-400 text-slate-100'
                          : 'bg-white border-slate-200 focus:ring-blue-500 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Username Unik (Penentu URL Halaman Unik)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">
                      @
                    </span>
                    <input
                      id="input-reg-username"
                      type="text"
                      placeholder="kopisenja"
                      value={regUsername}
                      onChange={(e) =>
                        setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                      }
                      className={`w-full pl-7 pr-3 py-2 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-950/50 border-sky-400/20 focus:ring-sky-400 text-slate-100'
                          : 'bg-white border-slate-200 focus:ring-blue-500 text-slate-800'
                      }`}
                    />
                  </div>
                  <div
                    className={`mt-1.5 p-2 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                      isDark ? 'bg-slate-950/60 border-slate-800 text-sky-400' : 'bg-slate-100 border-slate-200 text-blue-700'
                    }`}
                  >
                    <span className="truncate">Tautan Halaman Unik Anda: ?u={previewSlug}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                      Unik
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Kategori Usaha
                    </label>
                    <select
                      id="select-reg-category"
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-950/50 border-sky-400/20 focus:ring-sky-400 text-slate-100'
                          : 'bg-white border-slate-200 focus:ring-blue-500 text-slate-800'
                      }`}
                    >
                      <option value="Retail & Minimarket">Retail &amp; Minimarket</option>
                      <option value="Makanan & Minuman">Makanan &amp; Minuman / Kuliner</option>
                      <option value="Alat Tulis & Kantor">Alat Tulis &amp; Kantor</option>
                      <option value="Kafe & Resto">Kafe &amp; Resto</option>
                      <option value="Apotek & Kesehatan">Apotek &amp; Kesehatan</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Password Akun
                    </label>
                    <input
                      id="input-reg-password"
                      type="password"
                      placeholder="Minimal 4 karakter"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-950/50 border-sky-400/20 focus:ring-sky-400 text-slate-100'
                          : 'bg-white border-slate-200 focus:ring-blue-500 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-2.5 px-4 mt-2 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {regLoading ? (
                    <span>Membuat Akun &amp; Halaman Unik...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">add_business</span>
                      <span>Daftarkan Akun &amp; Buka Halaman Unik</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: MONITOR ALL UNIQUE PAGES */}
          {tab === 'monitor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400">
                  Daftar Kredensial Toko &amp; Halaman Unik di Database Turso:
                </p>
                <button
                  id="btn-refresh-user-list"
                  onClick={loadUsers}
                  disabled={loadingUsers}
                  className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  Segarkan
                </button>
              </div>

              {loadingUsers ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Memuat daftar pengguna unik dari Turso...
                </div>
              ) : allUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada pengguna terdaftar.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {allUsers.map((usr) => {
                    const isCurrent = currentUser?.username === usr.username;
                    const uniqueUrl = `${window.location.origin}${window.location.pathname}?u=${usr.slug}`;

                    return (
                      <div
                        key={usr.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrent
                            ? isDark
                              ? 'bg-sky-950/40 border-sky-400/40 shadow-sm'
                              : 'bg-blue-50/70 border-blue-300'
                            : isDark
                            ? 'bg-slate-950/30 border-slate-800 hover:border-sky-400/30'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-slate-700/50 overflow-hidden flex-shrink-0 flex items-center justify-center text-sky-400 border border-sky-400/20">
                              {usr.avatar ? (
                                <img
                                  src={usr.avatar}
                                  alt={usr.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-[18px]">
                                  store
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs truncate">{usr.storeName}</h4>
                                {isCurrent && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                    Aktif
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">
                                Pemilik: {usr.name} • @{usr.username} ({usr.category || 'Retail'})
                              </p>
                            </div>
                          </div>

                          <button
                            id={`btn-copy-link-${usr.slug}`}
                            onClick={() => handleCopyUniqueLink(usr.slug)}
                            title="Salin tautan unik toko ini"
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                              copiedSlug === usr.slug
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : isDark
                                ? 'bg-slate-900 border-sky-400/20 text-sky-300 hover:bg-sky-950'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {copiedSlug === usr.slug ? 'check' : 'content_copy'}
                            </span>
                            <span>{copiedSlug === usr.slug ? 'Tersalin!' : 'Salin URL'}</span>
                          </button>
                        </div>

                        {/* Store unique page link info */}
                        <div
                          className={`mt-2.5 px-2.5 py-1.5 rounded-lg font-mono text-[11px] flex items-center justify-between ${
                            isDark ? 'bg-slate-950/70 text-slate-300' : 'bg-white text-slate-700 border border-slate-200/60'
                          }`}
                        >
                          <span className="truncate">URL: ?u={usr.slug}</span>
                          <button
                            id={`btn-open-unique-${usr.slug}`}
                            onClick={() => {
                              window.location.search = `?u=${usr.slug}`;
                            }}
                            className="text-sky-400 hover:underline flex items-center gap-0.5 text-[10px] ml-2 flex-shrink-0"
                          >
                            <span>Buka Halaman</span>
                            <span className="material-symbols-outlined text-[12px]">
                              open_in_new
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
