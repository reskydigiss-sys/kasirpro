import React, { useState } from 'react';
import { ActiveTab, AppTheme, User } from '../types';
import { DatabaseStatus } from '../services/api';

interface HeaderProps {
  activeTab: ActiveTab;
  theme: AppTheme;
  onToggleTheme: () => void;
  onOpenMobileMenu: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  dbStatus?: DatabaseStatus | null;
  currentUser?: User | null;
  onOpenAuthModal?: (tab?: 'login' | 'register' | 'monitor') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  theme,
  onToggleTheme,
  onOpenMobileMenu,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Cari...',
  dbStatus,
  currentUser,
  onOpenAuthModal
}) => {
  const isDark = theme === 'glacier-dark';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return isDark ? 'Ringkasan Hari Ini' : 'Dashboard';
      case 'kasir':
        return 'Kasirku POS';
      case 'produk':
        return 'Daftar Produk';
      case 'kategori':
        return 'Kategori Produk';
      case 'stok':
        return 'Manajemen Stok & Inventori';
      case 'riwayat':
        return 'Kasirku POS';
      case 'laporan':
        return 'Laporan Keuangan & Penjualan';
      case 'pengaturan':
        return 'Pengaturan Sistem';
      default:
        return 'KASIRKU';
    }
  };

  return (
    <header
      id="app-header"
      className={`fixed top-0 right-0 left-0 md:left-64 h-16 z-30 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200 border-b ${
        isDark
          ? 'bg-[#0d121f] border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Left Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          id="btn-mobile-menu"
          onClick={onOpenMobileMenu}
          className={`p-2 rounded-lg md:hidden ${
            isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
          aria-label="Buka menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div>
          <h2
            id="page-title"
            className={`font-display text-lg sm:text-xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {getTitle()}
          </h2>
        </div>
      </div>

      {/* Center Search (if provided or active on certain tabs) */}
      {onSearchChange && (
        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-4">
          <div
            className={`flex items-center w-full px-3.5 py-1.5 rounded-lg border transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-200 focus-within:border-slate-600'
                : 'bg-slate-100 border-slate-200 text-slate-800 focus-within:bg-white focus-within:border-blue-500'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] text-slate-400 mr-2">search</span>
            <input
              id="header-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="bg-transparent border-none text-sm outline-none w-full placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Right Controls: Turso DB status, Theme Toggle, Notifications, Help */}
      <div className="flex items-center gap-2">
        {/* Turso Database Badge */}
        <div
          id="turso-status-indicator"
          title={
            dbStatus?.status === 'connected'
              ? `Terhubung ke Turso LibSQL (${dbStatus.host || 'mycasir3'})`
              : dbStatus?.status === 'connecting'
              ? 'Menghubungkan ke Turso Database...'
              : 'Status Turso: Menggunakan sinkronisasi cadangan lokal'
          }
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
            dbStatus?.status === 'connected'
              ? isDark
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : dbStatus?.status === 'connecting'
              ? isDark
                ? 'bg-blue-950/40 text-blue-300 border-blue-800/60'
                : 'bg-blue-50 text-blue-700 border-blue-200'
              : isDark
              ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              dbStatus?.status === 'connected'
                ? 'bg-emerald-500'
                : dbStatus?.status === 'connecting'
                ? 'bg-blue-500 animate-pulse'
                : 'bg-amber-500'
            }`}
          />
          <span className="font-mono text-[11px]">
            {dbStatus?.status === 'connected'
              ? `Turso: ${(dbStatus.host?.split('.')[0]) || 'mycasir3'}`
              : dbStatus?.status === 'connecting'
              ? 'Turso: Menghubungkan'
              : 'Turso: Cadangan'}
          </span>
        </div>

        {/* Theme Switcher Button */}
        <button
          id="btn-theme-toggle"
          onClick={onToggleTheme}
          title={isDark ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            isDark
              ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
          <span className="hidden sm:inline">
            {isDark ? 'Gelap' : 'Terang'}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowHelp(false);
            }}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Notifikasi"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
          </button>

          {showNotifications && (
            <div
              id="notifications-popover"
              className={`absolute right-0 mt-2 w-72 rounded-xl shadow-lg border p-4 z-50 animate-in fade-in-50 duration-150 ${
                isDark
                  ? 'bg-[#121826] border-slate-800 text-slate-200 shadow-xl'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Notifikasi Sistem</span>
                <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded-full font-bold">2 Baru</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <p className="font-semibold text-rose-600 dark:text-rose-400">Peringatan Stok Menipis</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">Pulpen Standard AE7 &amp; Tumbler Stainless habis (0 tersisa).</p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="font-semibold text-blue-600 dark:text-blue-400">Pembaruan Kasir</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">Shift kasir Andi aktif sejak 08:00 WIB.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Button */}
        <div className="relative">
          <button
            id="btn-help"
            onClick={() => {
              setShowHelp(!showHelp);
              setShowNotifications(false);
            }}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Bantuan & Panduan"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>

          {showHelp && (
            <div
              id="help-popover"
              className={`absolute right-0 mt-2 w-80 rounded-xl shadow-lg border p-4 z-50 animate-in fade-in-50 duration-150 ${
                isDark
                  ? 'bg-[#121826] border-slate-800 text-slate-200 shadow-xl'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <h4 className="font-bold text-sm mb-2 text-slate-800 dark:text-slate-100">Panduan Ringkas Kasirku</h4>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                <li>• <strong>Kasir:</strong> Klik kartu produk untuk menambahkan ke keranjang belanja.</li>
                <li>• <strong>Bayar Cepat:</strong> Masukkan jumlah bayar tunai atau pilih uang pas.</li>
                <li>• <strong>Stok:</strong> Stok berkurang otomatis setiap kali transaksi dibayar.</li>
                <li>• <strong>Cetak:</strong> Riwayat transaksi menyediakan cetak struk 80mm &amp; PDF.</li>
              </ul>
            </div>
          )}
        </div>

        {/* User Account Button & Quick Switcher */}
        {onOpenAuthModal && (
          <button
            id="btn-header-user-profile"
            onClick={() => onOpenAuthModal('login')}
            className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#131926] border-slate-800 hover:border-slate-700 text-slate-200'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
            }`}
            title={currentUser ? `Akun: ${currentUser.name} (${currentUser.storeName})` : 'Masuk atau Buat Akun Toko'}
          >
            <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-700 flex items-center justify-center text-white text-[10px] font-bold">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[16px]">account_circle</span>
              )}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-[11px] font-bold leading-tight truncate max-w-[100px]">
                {currentUser?.storeName || 'KASIRKU'}
              </p>
              <p className="text-[10px] font-mono text-slate-400 leading-none truncate max-w-[100px]">
                @{currentUser?.username || 'admin'}
              </p>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400">
              unfold_more
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
