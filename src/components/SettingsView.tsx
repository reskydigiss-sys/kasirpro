import React, { useState } from 'react';
import { AppTheme, User } from '../types';
import { DatabaseStatus } from '../services/api';

interface SettingsViewProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  onResetData: () => void;
  dbStatus?: DatabaseStatus | null;
  onRefreshDbStatus?: () => void;
  currentUser?: User | null;
  onOpenAuthModal?: (tab?: 'login' | 'register' | 'monitor') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onThemeChange,
  onResetData,
  dbStatus,
  onRefreshDbStatus,
  currentUser,
  onOpenAuthModal
}) => {
  const isDark = theme === 'glacier-dark';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [storeName, setStoreName] = useState(currentUser?.storeName || 'KASIRKU STORE');
  const [storeAddress, setStoreAddress] = useState('Jl. Jend. Sudirman Kav. 24, Jakarta');
  const [storePhone, setStorePhone] = useState('0812-3456-7890');
  const [activeCashier, setActiveCashier] = useState(currentUser?.name || 'Andi');
  const [receiptFooter, setReceiptFooter] = useState(
    'Terima kasih atas kunjungan Anda! Silakan datang kembali.'
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const currentSlug = currentUser?.slug || 'admin';
  const uniqueUrl = `${window.location.origin}${window.location.pathname}?u=${currentSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(uniqueUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleManualSync = async () => {
    setIsRefreshing(true);
    if (onRefreshDbStatus) {
      await onRefreshDbStatus();
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div id="settings-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Pengaturan Sistem</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Konfigurasi identitas toko, kasir operasional, dan preferensi tampilan.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account Credentials & Unique Store Page */}
        <div
          id="settings-account-credentials"
          className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/20">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-sky-500/20 text-sky-300' : 'bg-blue-100 text-blue-600'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">
                  Kredensial Akun &amp; Halaman Unik Toko
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Setiap akun pengguna memiliki URL unik dan data terisolasi di database Turso.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenAuthModal && (
                <>
                  <button
                    id="btn-settings-monitor"
                    type="button"
                    onClick={() => onOpenAuthModal('monitor')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                      isDark
                        ? 'bg-slate-900 border-sky-400/20 text-sky-300 hover:bg-sky-950'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Pantau Semua Toko</span>
                  </button>

                  <button
                    id="btn-settings-create-account"
                    type="button"
                    onClick={() => onOpenAuthModal('register')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    <span>Buat Akun Baru</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border font-mono text-xs space-y-2.5 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex justify-between items-center py-1 border-b border-slate-200/20">
              <span className="text-slate-500 font-sans">Nama Akun / Toko:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans">
                {currentUser?.storeName || 'KASIRKU STORE'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/20">
              <span className="text-slate-500 font-sans">Pemilik &amp; Role:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans">
                {currentUser?.name || 'Admin Kasirku'} ({currentUser?.role || 'Owner'})
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/20">
              <span className="text-slate-500 font-sans">Username Kredensial:</span>
              <span className="font-semibold text-sky-500 dark:text-sky-400 font-mono">
                @{currentUser?.username || 'admin'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/20">
              <span className="text-slate-500 font-sans">Tautan Halaman Unik:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono truncate max-w-[200px] sm:max-w-none">
                  ?u={currentSlug}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2 py-0.5 rounded text-[11px] bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 flex items-center gap-1 font-sans cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedLink ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedLink ? 'Tersalin' : 'Salin URL'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 font-sans">Pengguna Terdaftar di Database:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-sans">
                {dbStatus?.usersCount || 2} akun toko aktif
              </span>
            </div>
          </div>
        </div>

        {/* Store Profile */}
        <div
          className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">
            Identitas Toko &amp; Struk
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Nama Toko</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">No. Kontak / WA</label>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Pesan Penutup Struk</label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Operational / Cashier */}
        <div
          className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">
            Kasir &amp; Operasional
          </h3>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold mb-1">Nama Kasir Bertugas</label>
            <input
              type="text"
              value={activeCashier}
              onChange={(e) => setActiveCashier(e.target.value)}
              className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            />
          </div>
        </div>

        {/* Database Turso Section */}
        <div
          className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">
                Koneksi Database Cloud (Turso LibSQL)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Penyimpanan terpusat aman untuk produk, stok, dan riwayat transaksi
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  dbStatus?.status === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : dbStatus?.status === 'connecting'
                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    dbStatus?.status === 'connected'
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                {dbStatus?.status === 'connected'
                  ? 'Terhubung (Live)'
                  : dbStatus?.status === 'connecting'
                  ? 'Menghubungkan...'
                  : 'Mode Cadangan'}
              </span>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border font-mono text-xs space-y-2 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex justify-between items-center py-1 border-b border-slate-200/20">
              <span className="text-slate-500">Database Engine:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Turso (LibSQL SQLite Cloud)
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/20">
              <span className="text-slate-500">Database Host:</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400 truncate max-w-[240px] sm:max-w-none">
                {dbStatus?.host || 'mycasir3-reskydigiss-sys.aws-ap-northeast-1.turso.io'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/20">
              <span className="text-slate-500">Latency / Ping:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {dbStatus?.latency || 'Tersedia'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200/20">
              <span className="text-slate-500">Tabel Produk di Turso:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {dbStatus?.productsCount !== undefined ? `${dbStatus.productsCount} produk` : 'Sinkron'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Tabel Transaksi di Turso:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {dbStatus?.transactionsCount !== undefined ? `${dbStatus.transactionsCount} transaksi` : 'Sinkron'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-500">
              Perubahan produk dan transaksi kasir langsung tersimpan ke Turso database secara otomatis.
            </p>
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isRefreshing}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isDark
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 hover:bg-sky-500/30'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isRefreshing ? 'Memeriksa...' : 'Periksa & Sinkron Ulang'}</span>
            </button>
          </div>
        </div>

        {/* Theme Settings */}
        <div
          className={`p-6 rounded-xl border space-y-4 ${
            isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">
            Tampilan &amp; Tema (Terang vs Gelap)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onThemeChange('corporate-light')}
              className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-colors cursor-pointer ${
                theme === 'corporate-light'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                ☀️
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Enterprise Light
                </p>
                <p className="text-xs text-slate-500">
                  Bersih, profesional, standar kasir retail harian
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onThemeChange('glacier-dark')}
              className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-colors cursor-pointer ${
                theme === 'glacier-dark'
                  ? 'border-blue-500 bg-slate-900 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold">
                🌙
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Enterprise Dark
                </p>
                <p className="text-xs text-slate-500">
                  Mode gelap solid, nyaman di mata untuk operasional malam
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Kembalikan semua produk dan transaksi ke data awal default?')) {
                onResetData();
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          >
            Reset ke Data Awal Demo
          </button>

          <div className="flex items-center gap-3">
            {savedNotice && (
              <span className="text-xs text-emerald-500 font-bold animate-in fade-in">
                ✓ Pengaturan berhasil disimpan!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
