import React from 'react';
import { ActiveTab, AppTheme } from '../types';
import { USER_AVATAR_LIGHT, USER_AVATAR_DARK } from '../data/mockData';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  theme: AppTheme;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  theme,
  mobileOpen,
  onCloseMobile,
  lowStockCount
}) => {
  const isDark = theme === 'glacier-dark';

  const navItems = [
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
    { id: 'pengaturan' as ActiveTab, label: 'Pengaturan', icon: 'settings' }
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
            ? 'bg-[#0f1524]/90 backdrop-blur-xl border-r border-sky-400/15 text-slate-100 shadow-[0_0_30px_rgba(125,211,252,0.05)]'
            : 'bg-white border-r border-slate-200 text-slate-800'
        }`}
      >
        {/* Brand Header */}
        <div
          id="sidebar-brand"
          className={`px-6 py-5 border-b flex items-center gap-3 ${
            isDark ? 'border-sky-400/10' : 'border-slate-100'
          }`}
        >
          {isDark ? (
            <div className="w-10 h-10 rounded-full p-0.5 border border-sky-400/30 bg-sky-950/50 flex items-center justify-center shadow-[0_0_15px_rgba(125,211,252,0.2)]">
              <img
                src={USER_AVATAR_DARK}
                alt="Kasirku Logo"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[26px]">storefront</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1
              className={`font-bold tracking-tight text-xl leading-none ${
                isDark ? 'text-sky-300 text-glow' : 'text-blue-600'
              }`}
            >
              KASIRKU
            </h1>
            <p
              className={`text-xs mt-1 font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-400'
              }`}
            >
              {isDark ? 'Admin Terminal' : 'Operational Center'}
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer text-left active:scale-[0.98] ${
                  isActive
                    ? isDark
                      ? 'bg-sky-400/15 text-sky-300 border-l-4 border-sky-400 shadow-[0_0_15px_rgba(125,211,252,0.15)]'
                      : 'bg-blue-600 text-white shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    isActive && !isDark ? 'fill' : ''
                  }`}
                  style={
                    isActive && isDark
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isDark
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-red-100 text-red-600'
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
          className={`p-4 border-t ${
            isDark ? 'border-sky-400/10 bg-[#0a0e1a]/40' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <img
              src={isDark ? USER_AVATAR_DARK : USER_AVATAR_LIGHT}
              alt="Admin User Avatar"
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-sky-400/30"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Admin User
              </p>
              <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Manager
              </p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Online" />
          </div>
        </div>
      </aside>
    </>
  );
};
