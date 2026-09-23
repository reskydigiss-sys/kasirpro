import React from 'react';
import { ActiveTab, AppTheme, User } from '../types';
import { USER_AVATAR_LIGHT, USER_AVATAR_DARK } from '../data/mockData';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  theme: AppTheme;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  lowStockCount: number;
  currentUser?: User | null;
  onOpenAuthModal?: (tab?: 'login' | 'register' | 'monitor') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  theme,
  mobileOpen,
  onCloseMobile,
  lowStockCount,
  currentUser,
  onOpenAuthModal
}) => {
  const isDark = theme === 'glacier-dark';

  const navItems = [
    { id: 'landing' as ActiveTab, label: 'Landing Page', icon: 'storefront' },
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: 'dashboard' },
    { id: 'kasir' as ActiveTab, label: 'Kasir', icon: 'point_of_sale' },
    { id: 'produk' as ActiveTab, label: 'Produk', icon: 'inventory_2' },
    { id: 'kategori' as ActiveTab, label: 'Kategori', icon: 'category' },
    { 
      id: 'stok' as ActiveTab, 
      label: 'Stok', 
      icon: 'layers',
      badge: lowStockCount > 0 ? `${lowStockCount}` : undefined 
    },
    { id: 'riwayat' as ActiveTab, label: 'Riwayat Penjualan', icon: 'receipt_long' },
    { id: 'laporan' as ActiveTab, label: 'Laporan', icon: 'analytics' },
    { id: 'pengaturan' as ActiveTab, label: 'Pengaturan', icon: 'settings' },
    { id: 'admin' as ActiveTab, label: 'Admin Pusat (Multi-Toko)', icon: 'admin_panel_settings', badge: 'Admin' }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          id="mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed left-0 top-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDark
            ? 'bg-[#0b0f19] border-r border-slate-800 text-slate-100'
            : 'bg-white border-r border-slate-200 text-slate-800'
        }`}
      >
        {/* Brand Header */}
        <div
          id="sidebar-brand"
          className={`px-6 py-5 border-b flex items-center gap-3 ${
            isDark ? 'border-slate-800/80 bg-[#0d1322]' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[24px]">point_of_sale</span>
          </div>

          <div className="flex-1 min-w-0">
            <h1
              className={`font-display font-extrabold tracking-tight text-lg leading-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              KASIRKU
            </h1>
            <p className="text-[11px] font-medium text-slate-400 truncate">
              {isDark ? 'Terminal Operasional' : 'Sistem POS & Kasir'}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav id="sidebar-nav" className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer text-left ${
                  isActive
                    ? isDark
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? 'fill' : ''
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isDark
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div
          id="sidebar-footer-profile"
          onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
          className={`p-3 mx-3 mb-3 rounded-xl border cursor-pointer transition-colors ${
            isDark
              ? 'border-slate-800 bg-[#111726] hover:bg-[#161f33] hover:border-slate-700'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
          }`}
          title="Klik untuk Masuk, Buat Akun Baru, atau Pantau Toko"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700 flex items-center justify-center text-white border border-slate-200 dark:border-slate-700">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={isDark ? USER_AVATAR_DARK : USER_AVATAR_LIGHT}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                {currentUser?.storeName || 'KASIRKU STORE'}
              </p>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                @{currentUser?.username || 'admin'} • {currentUser?.role || 'Owner'}
              </p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-slate-400">
              swap_horiz
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
