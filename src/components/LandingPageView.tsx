import React, { useState, useId } from 'react';
import { Product, Transaction, AppTheme, User, ActiveTab } from '../types';
import { formatRupiah } from '../utils/formatters';
import { DatabaseStatus } from '../services/api';

interface LandingPageViewProps {
  products: Product[];
  transactions: Transaction[];
  currentUser: User;
  theme: AppTheme;
  dbStatus: DatabaseStatus | null;
  onNavigate: (tab: ActiveTab) => void;
  onOpenAuthModal: (tab?: 'login' | 'register' | 'monitor') => void;
  onToggleTheme: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  products,
  transactions,
  currentUser,
  theme,
  dbStatus,
  onNavigate,
  onOpenAuthModal,
  onToggleTheme
}) => {
  const isDark = theme === 'glacier-dark';
  const dailyTxInputId = useId();

  // Interactive Live POS Simulator State
  const [demoCart, setDemoCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([
    { id: 'demo-1', name: 'Kopi Susu Gula Aren', price: 25000, quantity: 2 },
    { id: 'demo-2', name: 'Croissant Coklat', price: 30000, quantity: 1 }
  ]);
  const [demoPaymentMethod, setDemoPaymentMethod] = useState<'QRIS' | 'Tunai' | 'Kartu'>('QRIS');
  const [demoCheckoutSuccess, setDemoCheckoutSuccess] = useState(false);

  // Interactive ROI Calculator State
  const [dailyTxCount, setDailyTxCount] = useState<number>(85);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Calculate live stats
  const totalRevenue = transactions.reduce((acc, t) => acc + (t.total || 0), 0);
  const demoSubtotal = demoCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const demoTax = Math.round(demoSubtotal * 0.1);
  const demoTotal = demoSubtotal + demoTax;

  // ROI calculations
  const hoursSavedPerMonth = Math.round((dailyTxCount * 2.5 * 30) / 60);
  const estimatedRevenueLeakPrevention = dailyTxCount * 12000 * 30;

  const handleAddDemoItem = (item: { id: string; name: string; price: number }) => {
    setDemoCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setDemoCheckoutSuccess(false);
  };

  const handleUpdateDemoQty = (id: string, delta: number) => {
    setDemoCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as Array<{ id: string; name: string; price: number; quantity: number }>
    );
    setDemoCheckoutSuccess(false);
  };

  const handleSimulatePayment = () => {
    if (demoCart.length === 0) return;
    setDemoCheckoutSuccess(true);
  };

  const demoCatalog = [
    {
      id: 'demo-1',
      name: 'Kopi Susu Gula Aren',
      category: 'Minuman',
      price: 25000,
      icon: 'local_cafe'
    },
    {
      id: 'demo-2',
      name: 'Croissant Coklat',
      category: 'Makanan',
      price: 30000,
      icon: 'bakery_dining'
    },
    {
      id: 'demo-3',
      name: 'Buku Tulis Sidu 38L',
      category: 'Alat Tulis',
      price: 4500,
      icon: 'menu_book'
    },
    {
      id: 'demo-4',
      name: 'Pensil 2B Faber Castell',
      category: 'Alat Tulis',
      price: 3000,
      icon: 'edit'
    }
  ];

  const faqs = [
    {
      q: 'Apakah KASIRKU mendukung pencetakan struk ke printer thermal Bluetooth & USB?',
      a: 'Ya, 100% mendukung. KASIRKU memiliki modul cetak struk bawaan dengan format standar kasir 58mm dan 80mm yang kompatibel dengan printer thermal Bluetooth, USB, maupun WiFi kasir.'
    },
    {
      q: 'Bagaimana cara kerja halaman toko unik (?u=slug) untuk banyak cabang?',
      a: 'Setiap akun toko atau cabang yang didaftarkan memiliki identifier slug tersendiri (misal ?u=tokoberkah atau ?u=kopisenja). Katalog produk, stok inventori, dan catatan transaksi dipisahkan secara otomatis dan aman di Turso LibSQL Cloud.'
    },
    {
      q: 'Apakah data saya aman jika perangkat kasir rusak atau hilang?',
      a: 'Sangat aman. Seluruh data disinkronkan secara langsung ke database cloud Turso (LibSQL Serverless). Jika HP atau tablet kasir bermasalah, Anda cukup login di perangkat baru melalui browser dan seluruh produk serta transaksi langsung muncul kembali.'
    },
    {
      q: 'Apakah aplikasi ini bisa digunakan di HP Android, iPhone, dan Komputer sekaligus?',
      a: 'Bisa! KASIRKU dirancang responsif sebagai Progressive Web App (PWA). Berjalan mulus di layar smartphone, tablet iPad kasir, laptop kasir toko, hingga layar POS desktop tanpa perlu instalasi aplikasi rumit.'
    },
    {
      q: 'Apakah bisa mengelola stok dan mengetahui kapan barang habis?',
      a: 'Tentu saja. KASIRKU memiliki tab Inventori & Stok terintegrasi dengan alert stok kritis otomatis (<= 5 unit), pemotongan stok otomatis setiap kasir checkout, serta fitur edit dan restock instan.'
    }
  ];

  return (
    <div
      id="landing-page-container"
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#0a0e1a] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. TOP ANNOUNCEMENT BAR & SUB-NAV */}
      <div
        className={`border-b px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDark
            ? 'bg-[#0e1424] border-slate-800 text-slate-300'
            : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Turso LibSQL Cloud Active</span>
          <span className="text-slate-400 hidden sm:inline">·</span>
          <span className="hidden sm:inline text-slate-500">
            Sistem Kasir Ritel, F&amp;B, &amp; Sembako Terintegrasi
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuthModal('monitor')}
            className="hover:text-blue-600 dark:hover:text-sky-400 underline font-medium cursor-pointer"
          >
            Monitor Semua Toko ({currentUser.username})
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            onClick={onToggleTheme}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Ganti Tema Tampilan"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8 lg:px-12 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          {/* Breadcrumb / Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            <span>KASIRKU CLOUD POS OPERATIONAL CENTER</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] max-w-4xl mx-auto font-sans">
            Sistem Kasir Modern yang{' '}
            <span className="text-blue-600 dark:text-sky-400">Cepat, Akurat</span> &amp; Siap Pakai untuk Segala Toko
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Kelola transaksi kasir dalam hitungan detik, pantau inventori otomatis, proses pembayaran
            QRIS &amp; Tunai, serta isolasi data per toko dengan arsitektur Turso LibSQL Cloud.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-lg mx-auto">
            <button
              id="hero-btn-open-cashier"
              onClick={() => onNavigate('kasir')}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
              <span>Buka Mesin Kasir (POS)</span>
            </button>

            <button
              id="hero-btn-register-store"
              onClick={() => onOpenAuthModal('register')}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-xs'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">store</span>
              <span>Daftar Toko Baru</span>
            </button>

            <button
              id="hero-btn-open-products"
              onClick={() => onNavigate('produk')}
              className={`w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              <span>Kelola Produk</span>
            </button>

            <button
              id="hero-btn-admin-portal"
              onClick={() => onNavigate('admin')}
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl font-bold text-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">shield_person</span>
              <span>Portal Super Admin</span>
            </button>
          </div>

          {/* Real-time Metric Ribbon */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <p className="text-xs text-slate-500 font-medium">Transaksi Terproses</p>
              <p className="text-2xl font-bold font-mono text-blue-600 dark:text-sky-400 mt-1">
                {transactions.length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Tercatat di Turso Cloud</p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <p className="text-xs text-slate-500 font-medium">Total Produk Aktif</p>
              <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {products.length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Stok terkelola realtime</p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <p className="text-xs text-slate-500 font-medium">Omset Terakumulasi</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 truncate">
                {formatRupiah(totalRevenue)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Dari transaksi kasir</p>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <p className="text-xs text-slate-500 font-medium">Kecepatan Checkout</p>
              <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                &lt; 2.5 dtk
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Efisiensi antrean 3x</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LIVE POS SANDBOX (SIMULASI KASIR LANGSUNG DI HALAMAN) */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
            Coba Langsung Tanpa Registrasi
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold">Simulasi Mesin Kasir Interaktif</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Klik item di katalog cepat untuk menambahkan ke keranjang kasir, pilih pembayaran, dan
            lihat kalkulasi otomatis struk kasir.
          </p>
        </div>

        <div
          className={`rounded-2xl border overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12 ${
            isDark ? 'bg-[#0e1424] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Left Column: Quick Catalog Simulation */}
          <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Katalog Produk Cepat</h3>
                <p className="text-xs text-slate-400">Pilih produk untuk mencoba checkout</p>
              </div>
              <span className="text-xs font-mono text-slate-500">Live Simulator</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoCatalog.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    isDark
                      ? 'bg-[#131b2e] border-slate-800 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-sky-300 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-xs leading-tight">{item.name}</p>
                      <p className="text-xs font-bold font-mono text-blue-600 dark:text-sky-400 mt-0.5">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddDemoItem(item)}
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                    title="Tambah ke Keranjang Kasir"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Helper */}
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
                isDark ? 'bg-blue-950/30 border-blue-900/50 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">tips_and_updates</span>
              <span>
                Di modul kasir sesungguhnya, kasir juga dapat menggunakan barcode scanner, diskon manual,
                dan mencari puluhan ribu SKU sekaligus.
              </span>
            </div>
          </div>

          {/* Right Column: Mini Checkout Simulator */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-600">receipt_long</span>
                  Keranjang Kasir ({demoCart.reduce((s, i) => s + i.quantity, 0)} Item)
                </span>
                <button
                  onClick={() => {
                    setDemoCart([]);
                    setDemoCheckoutSuccess(false);
                  }}
                  className="text-xs text-red-500 hover:underline cursor-pointer"
                >
                  Kosongkan
                </button>
              </div>

              {/* Items List */}
              <div className="py-3 space-y-2.5 max-h-48 overflow-y-auto">
                {demoCart.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Keranjang kosong. Klik produk di sebelah kiri untuk mencoba.
                  </p>
                ) : (
                  demoCart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="font-semibold truncate">{item.name}</p>
                        <p className="text-slate-400 font-mono text-[11px]">
                          {formatRupiah(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleUpdateDemoQty(item.id, -1)}
                          className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-bold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateDemoQty(item.id, 1)}
                          className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Checkout */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatRupiah(demoSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>PPN (10%)</span>
                  <span className="font-mono">{formatRupiah(demoTax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-dashed border-slate-300 dark:border-slate-700">
                  <span>Total Bayar</span>
                  <span className="font-mono text-blue-600 dark:text-sky-400">{formatRupiah(demoTotal)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['QRIS', 'Tunai', 'Kartu'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setDemoPaymentMethod(method);
                      setDemoCheckoutSuccess(false);
                    }}
                    className={`py-1.5 rounded-lg font-semibold border transition-colors cursor-pointer ${
                      demoPaymentMethod === method
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isDark
                        ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Action Button */}
              {demoCheckoutSuccess ? (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-center space-y-1">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Transaksi Simulasi Berhasil!
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Struk tercetak otomatis &amp; stok berkurang di database.
                  </p>
                  <button
                    onClick={() => onNavigate('kasir')}
                    className="mt-2 text-xs text-blue-600 dark:text-sky-400 underline font-semibold block mx-auto cursor-pointer"
                  >
                    Lanjutkan ke Mesin Kasir Lengkap →
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSimulatePayment}
                  disabled={demoCart.length === 0}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span>Bayar Sekarang ({demoPaymentMethod})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. ENTERPRISE FEATURES GRID */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b101d]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
              Fitur Lengkap Terintegrasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold">Semua Kebutuhan Toko Ada di Sini</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Dibangun dengan standar enterprise untuk ketahanan, kecepatan kasir, dan kemudahan bagi staf.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div
              className={`p-6 rounded-xl border flex flex-col justify-between space-y-4 ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-sky-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">point_of_sale</span>
                </div>
                <h3 className="font-bold text-base">Kasir Kilat &amp; Barcode Ready</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pencarian instan berdasarkan nama produk atau SKU. Support scanner barcode, kalkulasi
                  kembalian otomatis, dan cetak struk thermal 58mm/80mm.
                </p>
              </div>
              <button
                onClick={() => onNavigate('kasir')}
                className="text-xs text-blue-600 dark:text-sky-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer pt-2"
              >
                Buka Modul Kasir <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* Feature 2 */}
            <div
              className={`p-6 rounded-xl border flex flex-col justify-between space-y-4 ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">inventory_2</span>
                </div>
                <h3 className="font-bold text-base">Katalog &amp; Edit Produk Lengkap</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tambah produk baru, edit harga atau nama, upload URL foto, kelola kategori makanan/minuman/ATK,
                  dan hapus produk usang dengan aman.
                </p>
              </div>
              <button
                onClick={() => onNavigate('produk')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer pt-2"
              >
                Kelola Produk <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* Feature 3 */}
            <div
              className={`p-6 rounded-xl border flex flex-col justify-between space-y-4 ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">warning</span>
                </div>
                <h3 className="font-bold text-base">Inventori &amp; Alert Stok Kritis</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Peringatan otomatis saat stok produk menipis (&lt;= 5 unit). Penyesuaian stok manual instan
                  untuk mencegah barang habis di tengah jam ramai.
                </p>
              </div>
              <button
                onClick={() => onNavigate('stok')}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer pt-2"
              >
                Cek Stok Toko <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* Feature 4 */}
            <div
              className={`p-6 rounded-xl border flex flex-col justify-between space-y-4 ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">storefront</span>
                </div>
                <h3 className="font-bold text-base">Halaman Unik Per Toko (?u=slug)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Setiap akun toko mendapatkan alamat URL unik dengan katalog terisolasi. Buat toko cabang
                  sebanyak yang Anda perlukan tanpa bentrok data.
                </p>
              </div>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer pt-2"
              >
                Buat Halaman Toko <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* Feature 5 */}
            <div
              className={`p-6 rounded-xl border flex flex-col justify-between space-y-4 ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
                </div>
                <h3 className="font-bold text-base">Database Cloud Turso LibSQL</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Didukung oleh serverless SQLite di tepi jaringan (edge). Performa query super cepat,
                  backup data cloud aman, dan tetap responsif saat koneksi lambat.
                </p>
              </div>
              <button
                onClick={() => onNavigate('pengaturan')}
                className="text-xs text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer pt-2"
              >
                Status Database <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            {/* Feature 6 */}
            <div
              className={`p-6 rounded-xl border flex flex-col justify-between space-y-4 ${
                isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">analytics</span>
                </div>
                <h3 className="font-bold text-base">Analitik &amp; Laporan Penjualan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Laporan laba kotor, grafik omset harian, rincian QRIS vs Tunai, rekap transaksi per kasir,
                  dan rata-rata nilai transaksi (basket size).
                </p>
              </div>
              <button
                onClick={() => onNavigate('laporan')}
                className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer pt-2"
              >
                Lihat Laporan <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE ROI & TIME SAVED CALCULATOR */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto">
        <div
          className={`p-8 sm:p-10 rounded-2xl border space-y-8 ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-md'
          }`}
        >
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Kalkulator Efisiensi Bisnis
            </span>
            <h2 className="text-2xl font-bold">Berapa Banyak Waktu &amp; Biaya yang Anda Hemat?</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Geser slider transaksi harian untuk melihat estimasi penghematan waktu kasir dan pencegahan
              selisih keuangan toko Anda.
            </p>
          </div>

          <div className="space-y-4 max-w-xl mx-auto">
            <div className="flex justify-between items-center text-sm font-semibold">
              <label htmlFor={dailyTxInputId}>Rata-rata Transaksi Harian:</label>
              <span className="font-mono text-base text-blue-600 dark:text-sky-400">
                {dailyTxCount} Transaksi / Hari
              </span>
            </div>
            <input
              id={dailyTxInputId}
              type="range"
              min={10}
              max={500}
              step={5}
              value={dailyTxCount}
              onChange={(e) => setDailyTxCount(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>10 Trx (Toko Kecil)</span>
              <span>250 Trx (Menengah)</span>
              <span>500+ Trx (Retail Ramai)</span>
            </div>
          </div>

          {/* Calculator Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Waktu Kasir Dihemat</p>
              <p className="text-2xl font-extrabold font-mono text-blue-600 dark:text-sky-400 mt-1">
                ~{hoursSavedPerMonth} Jam
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">per bulan dari antrean manual</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pencegahan Selisih Kas</p>
              <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                99.8%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">kalkulasi kembalian presisi</p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Perlindungan Nilai Stok</p>
              <p className="text-xl font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-1 truncate">
                {formatRupiah(estimatedRevenueLeakPrevention)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">estimasi per bulan terselamatkan</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMPARISON MATRIX */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
            Perbandingan Nyata
          </span>
          <h2 className="text-2xl font-bold">Mengapa Pedagang Beralih ke KASIRKU?</h2>
        </div>

        <div
          className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <th className="p-4 font-semibold text-slate-500">Aspek Operasional</th>
                <th className="p-4 font-semibold text-slate-400">Kasir Manual / Nota Kertas</th>
                <th className="p-4 font-bold text-blue-600 dark:text-sky-400">KASIRKU Cloud POS</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
              <tr>
                <td className="p-4 font-semibold">Kecepatan Checkout</td>
                <td className="p-4 text-slate-400">2 - 5 menit per pelanggan</td>
                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">&lt; 3 detik (Otomatis)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Pencatatan Stok Barang</td>
                <td className="p-4 text-slate-400">Hitung fisik malam hari</td>
                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">Terpotong real-time di Turso</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Risiko Selisih Uang Kasir</td>
                <td className="p-4 text-slate-400">Tinggi (sering salah hitung)</td>
                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">Nol (kalkulasi kembalian presisi)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Kebutuhan Perangkat</td>
                <td className="p-4 text-slate-400">Mesin kasir khusus jutaan rupiah</td>
                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">HP, Tablet, atau Laptop yang ada</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Akses Laporan Pemilik</td>
                <td className="p-4 text-slate-400">Harus datang langsung ke toko</td>
                <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">Akses kapan saja via URL unik toko</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. BUSINESS TYPES SUPPORTED */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b101d]">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
              Fleksibel &amp; Andal
            </span>
            <h2 className="text-2xl font-bold">Cocok untuk Semua Jenis Usaha</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Minimarket & Kelontong', icon: 'local_convenience_store' },
              { label: 'Kedai Kopi & Cafe', icon: 'coffee' },
              { label: 'Restoran & Kuliner', icon: 'restaurant' },
              { label: 'Alat Tulis & Fotokopi', icon: 'menu_book' },
              { label: 'Butik & Fashion', icon: 'apparel' },
              { label: 'Apotek & Kosmetik', icon: 'medication' }
            ].map((cat) => (
              <div
                key={cat.label}
                className={`p-4 rounded-xl border text-center space-y-2 transition-all hover:scale-[1.02] ${
                  isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="w-10 h-10 mx-auto rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">{cat.icon}</span>
                </div>
                <p className="text-xs font-semibold leading-tight">{cat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
            Kisah Sukses
          </span>
          <h2 className="text-2xl font-bold">Dipercaya oleh Pengusaha Toko Indonesia</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`p-6 rounded-xl border space-y-4 ${
              isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="material-symbols-outlined text-[18px]">star</span>
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              &quot;Stok sembako dan ATK sekarang tercatat otomatis. Tidak ada lagi barang hilang atau
              kasir salah mengembalikan uang belanjaan pelanggan.&quot;
            </p>
            <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                TB
              </div>
              <div>
                <p className="text-xs font-bold">H. Ahmad</p>
                <p className="text-[11px] text-slate-400">Pemilik Toko Berkah</p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-xl border space-y-4 ${
              isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="material-symbols-outlined text-[18px]">star</span>
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              &quot;Pelanggan bayar QRIS langsung cepat verifikasinya. Struk langsung dicetak di printer thermal
              Bluetooth tanpa kabel ribet di meja kasir.&quot;
            </p>
            <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                KS
              </div>
              <div>
                <p className="text-xs font-bold">Rian Pratama</p>
                <p className="text-[11px] text-slate-400">Owner Kopi Senja Space</p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-xl border space-y-4 ${
              isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="material-symbols-outlined text-[18px]">star</span>
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              &quot;Fitur halaman toko unik sangat praktis. Saya bisa pantau omset cabang dari rumah
              lewat browser HP tanpa harus telepon kasir tiap malam.&quot;
            </p>
            <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                BA
              </div>
              <div>
                <p className="text-xs font-bold">Siti Amanda</p>
                <p className="text-[11px] text-slate-400">Pengelola Butik Amanda</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
            Pertanyaan Umum
          </span>
          <h2 className="text-2xl font-bold">Tanya Jawab Seputar KASIRKU</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div
                key={faq.q}
                className={`rounded-xl border overflow-hidden transition-colors ${
                  isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full p-4.5 text-left font-semibold text-sm flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-[20px] text-slate-400 shrink-0">
                    {isOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {isOpen && (
                  <div
                    className={`px-4.5 pb-4 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t ${
                      isDark ? 'border-slate-800/80' : 'border-slate-100'
                    }`}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. HIGH-CONVERTING BOTTOM CTA */}
      <section className="py-16 px-4 sm:px-8 lg:px-12 border-t border-slate-200 dark:border-slate-800 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Siap Tingkatkan Operasional Toko Anda Hari Ini?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Gunakan KASIRKU langsung di browser Anda sekarang juga tanpa instalasi rumit.
            Data aman tersimpan di Turso Cloud Database.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('kasir')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-100 text-blue-700 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              <span>Masuk ke Mesin Kasir</span>
            </button>
            <button
              onClick={() => onOpenAuthModal('register')}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-700 hover:bg-blue-800 border border-blue-400 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_business</span>
              <span>Daftarkan Toko Baru</span>
            </button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer
        className={`py-8 px-4 sm:px-8 border-t text-xs ${
          isDark
            ? 'bg-[#080c16] border-slate-800/80 text-slate-500'
            : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              K
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">KASIRKU CLOUD POS</span>
            <span>— Sistem Operasional &amp; Kasir Ritel</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Database: {dbStatus?.status === 'connected' ? 'Turso Connected' : 'Connecting'}</span>
            <span>·</span>
            <span>Toko Aktif: {currentUser.storeName} ({currentUser.slug})</span>
            <span>·</span>
            <button
              onClick={() => onNavigate('admin')}
              className="text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">shield_person</span>
              <span>Portal Super Admin</span>
            </button>
            <span>·</span>
            <span>© 2026 KASIRKU</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
