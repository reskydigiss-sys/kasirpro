import React, { useState } from 'react';
import { User, AppTheme } from '../types';

interface UniquePageBannerProps {
  currentUser: User | null;
  currentSlug: string;
  theme: AppTheme;
  onOpenAuthModal: (tab?: 'login' | 'register' | 'monitor') => void;
}

export const UniquePageBanner: React.FC<UniquePageBannerProps> = ({
  currentUser,
  currentSlug,
  theme,
  onOpenAuthModal
}) => {
  const isDark = theme === 'glacier-dark';
  const [copied, setCopied] = useState(false);

  const fullUrl = `${window.location.origin}${window.location.pathname}?u=${currentSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const storeDisplayName = currentUser?.storeName || (currentSlug === 'admin' ? 'KASIRKU STORE' : `Toko @${currentSlug}`);
  const ownerName = currentUser?.name || (currentSlug === 'admin' ? 'Admin Kasirku' : 'Pengguna Toko');

  return (
    <div
      id="unique-page-banner"
      className={`mx-4 sm:mx-6 mb-4 px-4 py-3 rounded-xl border transition-colors ${
        isDark
          ? 'bg-[#111827] border-slate-800 text-slate-100 shadow-xs'
          : 'bg-white border-slate-200 text-slate-800 shadow-xs'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Store identity & Unique link badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isDark
                ? 'bg-blue-950/60 text-blue-400 border border-blue-800/60'
                : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-sm font-bold truncate">{storeDisplayName}</h2>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                ?u={currentSlug}
              </span>
              {currentUser && currentUser.slug === currentSlug && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Kredensial Aktif
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              Pemilik: <span className="font-medium text-slate-300">{ownerName}</span> • Data produk, kasir &amp; omzet terisolasi per toko
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Copy Unique Link button */}
          <button
            id="btn-copy-store-url"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : isDark
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title={`Salin tautan unik toko: ${fullUrl}`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {copied ? 'check' : 'link'}
            </span>
            <span className="font-mono">{copied ? 'Tersalin' : `Salin Link`}</span>
          </button>

          {/* Monitor all unique pages button */}
          <button
            id="btn-monitor-stores"
            onClick={() => onOpenAuthModal('monitor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">visibility</span>
            <span className="hidden sm:inline">Pantau Toko</span>
          </button>

          {/* Create new account / store button */}
          <button
            id="btn-banner-create-account"
            onClick={() => onOpenAuthModal('register')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            <span>Buat Akun Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
