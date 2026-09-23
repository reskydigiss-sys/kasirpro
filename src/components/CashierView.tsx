import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, CartItem, CategoryType, AppTheme, PaymentMethod, Transaction } from '../types';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
import { playScannerBeep } from '../utils/scannerSound';

interface CashierViewProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: (transactionData: {
    items: { product: Product; quantity: number }[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    change: number;
  }) => Transaction;
  theme: AppTheme;
  searchQuery?: string;
}

export const CashierView: React.FC<CashierViewProps> = ({
  products,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  theme,
  searchQuery = ''
}) => {
  const isDark = theme === 'glacier-dark';
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [localSearch, setLocalSearch] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<string>('20000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [checkoutSuccessTx, setCheckoutSuccessTx] = useState<Transaction | null>(null);
  const [paymentError, setPaymentError] = useState<string>('');

  // Barcode Scanner States
  const [isBeepEnabled, setIsBeepEnabled] = useState<boolean>(() => {
    return localStorage.getItem('kasirku_scanner_beep') !== 'false';
  });
  const [autoScanOnExactMatch, setAutoScanOnExactMatch] = useState<boolean>(() => {
    return localStorage.getItem('kasirku_auto_scan_match') !== 'false';
  });
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [modalCustomSku, setModalCustomSku] = useState('');
  const [lastScannedFeedback, setLastScannedFeedback] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
    timestamp: number;
    product?: Product;
  } | null>(null);

  const [recentScans, setRecentScans] = useState<
    Array<{ sku: string; name: string; time: string; success: boolean }>
  >([]);

  // Automatically dismiss barcode feedback after 4 seconds
  useEffect(() => {
    if (!lastScannedFeedback) return;
    const timer = setTimeout(() => {
      setLastScannedFeedback(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [lastScannedFeedback]);

  const toggleBeep = () => {
    setIsBeepEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('kasirku_scanner_beep', String(next));
      if (next) playScannerBeep('success', false);
      return next;
    });
  };

  const toggleAutoScan = () => {
    setAutoScanOnExactMatch((prev) => {
      const next = !prev;
      localStorage.setItem('kasirku_auto_scan_match', String(next));
      return next;
    });
  };

  const categories: string[] = ['Semua', 'Alat Tulis', 'Makanan', 'Minuman', 'Lainnya'];

  // Combined search query
  const query = (searchQuery || localSearch).toLowerCase().trim();

  // Filter products by category & search
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCat = selectedCategory === 'Semua' || prod.category === selectedCategory;
      const matchSearch =
        !query ||
        prod.name.toLowerCase().includes(query) ||
        prod.sku.toLowerCase().includes(query);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, query]);

  /**
   * Interprets EAN/SKU barcode input and automatically adds matching product to cart
   */
  const handleBarcodeScan = (rawString: string): boolean => {
    const trimmed = rawString.trim();
    if (!trimmed) return false;

    const clean = trimmed.toLowerCase();
    const cleanNoHyphen = clean.replace(/[-\s]/g, '');

    // 1. Exact match on sku (e.g. ATK-001 or 8992753...)
    let matched = products.find((p) => p.sku.toLowerCase() === clean);

    // 2. Match on stripped sku / EAN (e.g. ATK001 vs ATK-001)
    if (!matched) {
      matched = products.find(
        (p) => p.sku.toLowerCase().replace(/[-\s]/g, '') === cleanNoHyphen
      );
    }

    // 3. Match on product ID (e.g. prod-1)
    if (!matched) {
      matched = products.find((p) => p.id.toLowerCase() === clean);
    }

    // 4. Exact match on product name
    if (!matched) {
      matched = products.find((p) => p.name.toLowerCase() === clean);
    }

    // 5. Fallback: if single item in filtered list
    if (!matched && filteredProducts.length === 1) {
      matched = filteredProducts[0];
    }

    if (matched) {
      if (matched.stock <= 0) {
        playScannerBeep('error', !isBeepEnabled);
        setLastScannedFeedback({
          text: `⚠️ [HABIS] Stok "${matched.name}" (${matched.sku}) habis!`,
          type: 'error',
          timestamp: Date.now(),
          product: matched
        });
        setRecentScans((prev) => [
          {
            sku: matched!.sku,
            name: matched!.name,
            time: new Date().toLocaleTimeString('id-ID'),
            success: false
          },
          ...prev.slice(0, 7)
        ]);
        return false;
      }

      // Add to cart
      onAddToCart(matched);
      playScannerBeep('success', !isBeepEnabled);
      setLocalSearch('');
      setLastScannedFeedback({
        text: `✅ [BEEP] Barcode "${matched.sku}" terdeteksi: "${matched.name}" ditambahkan ke keranjang (+1)`,
        type: 'success',
        timestamp: Date.now(),
        product: matched
      });
      setRecentScans((prev) => [
        {
          sku: matched!.sku,
          name: matched!.name,
          time: new Date().toLocaleTimeString('id-ID'),
          success: true
        },
        ...prev.slice(0, 7)
      ]);

      // Refocus search input for rapid consecutive barcode scanning
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 40);
      return true;
    } else {
      playScannerBeep('error', !isBeepEnabled);
      setLastScannedFeedback({
        text: `❌ Barcode / SKU "${trimmed}" tidak cocok dengan produk manapun!`,
        type: 'error',
        timestamp: Date.now()
      });
      return false;
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const numericCashGiven = parseRupiahInput(cashGiven);
  const change = Math.max(0, numericCashGiven - total);
  const isCashInsufficient = paymentMethod === 'Tunai' && total > 0 && numericCashGiven < total;

  // Cart total items count
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Quick cash setters
  const setQuickCash = (amount: number) => {
    setCashGiven(amount.toString());
    setPaymentError('');
  };

  const handleProcessPayment = () => {
    if (cart.length === 0) {
      setPaymentError('Keranjang belanja masih kosong.');
      return;
    }

    if (isCashInsufficient) {
      setPaymentError(`Uang bayar kurang ${formatRupiah(total - numericCashGiven)}.`);
      return;
    }

    setPaymentError('');

    const tx = onCheckout({
      items: cart.map((i) => ({ product: i.product, quantity: i.quantity })),
      subtotal,
      discount: discountAmount,
      tax: 0,
      total,
      paymentMethod,
      amountPaid: paymentMethod === 'Tunai' ? numericCashGiven : total,
      change: paymentMethod === 'Tunai' ? change : 0
    });

    setCheckoutSuccessTx(tx);
  };

  return (
    <div
      id="cashier-view-root"
      className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden"
    >
      {/* LEFT SECTION: Product Catalog (Fluid Grid ~65%) */}
      <section
        id="cashier-catalog-section"
        className={`flex-1 flex flex-col overflow-hidden border-r ${
          isDark
            ? 'bg-[#0b0f19] border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Category Pills, Barcode Search & Scanner Simulator Bar */}
        <div
          id="cashier-filter-bar"
          className={`p-4 border-b flex flex-wrap items-center gap-2.5 shrink-0 ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Barcode / SKU Interpreter Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-blue-500 dark:text-blue-400 text-[18px]">
              barcode_scanner
            </span>
            <input
              ref={searchInputRef}
              id="input-cashier-search"
              type="text"
              value={localSearch}
              onChange={(e) => {
                const val = e.target.value;
                setLocalSearch(val);
                // Instant Auto-scan if exact SKU match detected
                if (autoScanOnExactMatch && val.trim().length >= 3) {
                  const exact = products.find(
                    (p) => p.sku.toLowerCase() === val.trim().toLowerCase()
                  );
                  if (exact) {
                    handleBarcodeScan(val);
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleBarcodeScan(localSearch);
                }
              }}
              placeholder="Scan barcode / ketik SKU lalu Enter..."
              className={`w-full pl-9 pr-16 py-2 rounded-lg text-xs outline-none border transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
                  : 'bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
              }`}
            />

            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-12 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Hapus teks"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleBarcodeScan(localSearch)}
              disabled={!localSearch.trim()}
              className={`absolute right-1.5 top-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                localSearch.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
              title="Kirim Scan Barcode / Tambah ke Keranjang"
            >
              Scan
            </button>
          </div>

          {/* Scanner Simulator Action Button */}
          <button
            id="btn-open-scanner-modal"
            type="button"
            onClick={() => setIsScannerModalOpen(true)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
              isDark
                ? 'bg-blue-950/50 border-blue-800/80 text-blue-400 hover:bg-blue-900/60'
                : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
            title="Buka Panel Simulasi Barcode Scanner Laser"
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            <span className="hidden sm:inline">Simulasi Scanner</span>
          </button>

          {/* Beep Audio Toggle */}
          <button
            id="btn-toggle-scanner-beep"
            type="button"
            onClick={toggleBeep}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isBeepEnabled
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : isDark
                ? 'bg-slate-800 border-slate-700 text-slate-500'
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
            title={isBeepEnabled ? 'Suara Beeper Kasir: AKTIF' : 'Suara Beeper Kasir: SENYAP'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isBeepEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Auto-Scan on Exact Match Toggle */}
          <button
            id="btn-toggle-auto-scan"
            type="button"
            onClick={toggleAutoScan}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer hidden md:flex items-center gap-1 ${
              autoScanOnExactMatch
                ? isDark
                  ? 'bg-amber-950/40 border-amber-800/50 text-amber-400'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
                : isDark
                ? 'bg-slate-800 border-slate-700 text-slate-500'
                : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
            title="Deteksi otomatis saat barcode/SKU cocok persis tanpa harus klik tombol"
          >
            <span className="material-symbols-outlined text-[15px]">bolt</span>
            <span>Auto-Scan: {autoScanOnExactMatch ? 'ON' : 'OFF'}</span>
          </button>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar w-full sm:w-auto">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`filter-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Barcode Scan Feedback Toast */}
        {lastScannedFeedback && (
          <div
            id="barcode-scan-feedback-banner"
            className={`mx-4 mt-3 px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-150 ${
              lastScannedFeedback.type === 'success'
                ? isDark
                  ? 'bg-emerald-950/80 border-emerald-800/90 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : isDark
                ? 'bg-rose-950/80 border-rose-800/90 text-rose-300'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[20px] shrink-0">
                {lastScannedFeedback.type === 'success' ? 'barcode_scanner' : 'warning'}
              </span>
              <span className="truncate">{lastScannedFeedback.text}</span>
            </div>
            <button
              onClick={() => setLastScannedFeedback(null)}
              className="p-0.5 hover:opacity-75 cursor-pointer shrink-0"
              title="Tutup notifikasi"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Product Grid Area */}
        <div
          id="cashier-product-grid"
          className="flex-1 p-4 sm:p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 custom-scrollbar content-start"
        >
          {filteredProducts.map((prod) => {
            const isOutOfStock = prod.stock <= 0;
            const inCartItem = cart.find((c) => c.product.id === prod.id);

            return (
              <div
                key={prod.id}
                id={`product-card-${prod.id}`}
                onClick={() => {
                  if (!isOutOfStock) {
                    onAddToCart(prod);
                  }
                }}
                className={`group rounded-xl border overflow-hidden flex flex-col transition-all duration-150 select-none relative ${
                  isOutOfStock
                    ? 'opacity-60 cursor-not-allowed border-dashed ' +
                      (isDark ? 'bg-slate-900/40 border-rose-900/50' : 'bg-slate-100 border-slate-200')
                    : 'cursor-pointer hover:shadow-xs active:scale-[0.99] ' +
                      (isDark
                        ? 'bg-[#111827] border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-blue-300')
                }`}
              >
                {/* Out of stock overlay badge */}
                {isOutOfStock && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/30 backdrop-blur-[1px]">
                    <span className="bg-red-600 text-white px-3.5 py-1 rounded-full text-xs font-bold tracking-wider shadow-lg uppercase">
                      Habis
                    </span>
                  </div>
                )}

                {/* In Cart Indicator */}
                {inCartItem && (
                  <div className="absolute top-2 right-2 z-10 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md animate-in zoom-in-75">
                    {inCartItem.quantity}
                  </div>
                )}

                {/* Product Image */}
                <div
                  className={`h-32 sm:h-36 relative overflow-hidden flex items-center justify-center ${
                    isDark ? 'bg-slate-900' : 'bg-slate-100'
                  }`}
                >
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        isOutOfStock ? 'grayscale opacity-50' : 'mix-blend-multiply opacity-90'
                      }`}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-4xl">inventory_2</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-3.5 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                    <span className="flex items-center gap-1 font-mono">
                      <span className="material-symbols-outlined text-[14px] text-blue-500">barcode</span>
                      {prod.sku}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBarcodeScan(prod.sku);
                      }}
                      className="opacity-80 group-hover:opacity-100 hover:text-blue-500 px-1.5 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-500/20 transition-all cursor-pointer"
                      title="Klik untuk simulasi scan barcode SKU ini"
                    >
                      Scan
                    </button>
                  </div>
                  <h3
                    className={`text-xs sm:text-sm font-bold line-clamp-2 leading-tight mb-2 ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    {prod.name}
                  </h3>

                  {/* Price and Stock Tag footer */}
                  <div className="mt-auto pt-2 flex items-end justify-between">
                    <div
                      className={`text-sm sm:text-base font-bold font-mono ${
                        isOutOfStock
                          ? 'text-slate-400'
                          : isDark
                          ? 'text-white'
                          : 'text-slate-900'
                      }`}
                    >
                      {formatRupiah(prod.price)}
                    </div>

                    <div
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                        isOutOfStock
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      Stok: {prod.stock}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RIGHT SECTION: Shopping Cart (Fixed Sidebar ~35%) */}
      <section
        id="cashier-cart-section"
        className={`w-full lg:w-[380px] xl:w-[420px] flex flex-col h-auto lg:h-full shrink-0 border-t lg:border-t-0 border-l border-slate-200 dark:border-slate-800 z-20 ${
          isDark
            ? 'bg-[#111827] text-slate-100'
            : 'bg-white text-slate-800'
        }`}
      >
        {/* Cart Header */}
        <div
          id="cart-header"
          className={`px-5 py-4 border-b flex justify-between items-center shrink-0 ${
            isDark ? 'bg-[#0e1422] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">
              shopping_cart
            </span>
            <h2 className="font-display text-base font-bold">Keranjang</h2>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ml-1 ${
                isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-blue-600 text-white'
              }`}
            >
              {cartItemCount}
            </span>
          </div>

          {cart.length > 0 && (
            <button
              id="btn-clear-cart"
              onClick={onClearCart}
              className="text-rose-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-1 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              <span>Kosongkan</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div
          id="cart-items-container"
          className={`flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar ${
            isDark ? 'bg-[#0b0f19]' : 'bg-slate-50/70'
          }`}
        >
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-2xl">add_shopping_cart</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Keranjang masih kosong</p>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih produk dari katalog di sebelah kiri untuk memulai transaksi.
                </p>
              </div>
            </div>
          ) : (
            cart.map((item) => {
              const itemTotal = item.product.price * item.quantity;
              return (
                <div
                  key={item.product.id}
                  id={`cart-item-${item.product.id}`}
                  className={`rounded-xl border p-3.5 flex flex-col gap-2.5 transition-colors ${
                    isDark
                      ? 'bg-[#111827] border-slate-800'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {formatRupiah(item.product.price)} / item
                      </p>
                    </div>
                    <button
                      id={`btn-remove-item-${item.product.id}`}
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                      title="Hapus dari keranjang"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                    {/* Quantity Control Stepper */}
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                      <button
                        id={`btn-decrement-${item.product.id}`}
                        onClick={() =>
                          onUpdateCartQty(item.product.id, Math.max(1, item.quantity - 1))
                        }
                        className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1) {
                            onUpdateCartQty(
                              item.product.id,
                              Math.min(val, item.product.stock || 999)
                            );
                          }
                        }}
                        className="w-10 h-7 text-center text-xs font-mono font-bold border-none outline-none p-0 bg-transparent text-slate-800 dark:text-slate-100"
                      />
                      <button
                        id={`btn-increment-${item.product.id}`}
                        disabled={item.quantity >= item.product.stock}
                        onClick={() =>
                          onUpdateCartQty(
                            item.product.id,
                            Math.min(item.product.stock, item.quantity + 1)
                          )
                        }
                        className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>

                    <div className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100">
                      {formatRupiah(itemTotal)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Payment Summary & Checkout Action */}
        <div
          id="cart-footer-summary"
          className={`p-4 sm:p-5 border-t shrink-0 flex flex-col gap-3 ${
            isDark ? 'bg-[#0e1422] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Subtotal */}
          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatRupiah(subtotal)}
            </span>
          </div>

          {/* Diskon */}
          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span>Diskon</span>
            <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-md w-32 bg-white dark:bg-slate-900 px-2 py-1">
              <span className="text-xs text-slate-400 mr-1">Rp</span>
              <input
                id="input-discount"
                type="number"
                min="0"
                value={discountAmount || ''}
                placeholder="0"
                onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                className="w-full text-right text-xs font-semibold outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-0.5" />

          {/* Grand Total Display */}
          <div className="flex justify-between items-baseline">
            <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
              Total
            </span>
            <span
              id="display-grand-total"
              className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {formatRupiah(total)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="flex gap-2 text-xs font-semibold">
            {(['Tunai', 'QRIS', 'Kartu Kredit'] as PaymentMethod[]).map((method) => (
              <button
                key={method}
                type="button"
                id={`btn-method-${method.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  setPaymentMethod(method);
                  if (method !== 'Tunai') {
                    setCashGiven(total.toString());
                  }
                  setPaymentError('');
                }}
                className={`flex-1 py-1.5 rounded-lg border transition-colors text-center ${
                  paymentMethod === method
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Bayar & Kembalian Grid (Cash Mode) */}
          {paymentMethod === 'Tunai' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Bayar Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Bayar (Cash)
                  </label>
                  <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="text-xs font-mono font-bold text-slate-400 mr-1">Rp</span>
                    <input
                      id="input-cash-given"
                      type="text"
                      value={cashGiven}
                      onChange={(e) => {
                        setCashGiven(e.target.value.replace(/[^0-9]/g, ''));
                        setPaymentError('');
                      }}
                      className="w-full text-right text-sm font-mono font-bold bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Kembalian */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Kembalian
                  </label>
                  <div
                    id="display-cash-change"
                    className={`flex items-center rounded-lg px-2.5 py-1.5 border ${
                      isCashInsufficient
                        ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
                        : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold w-full text-right truncate">
                      {isCashInsufficient ? 'Kurang' : formatRupiah(change)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Cash Suggestions */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 font-mono">
                <button
                  type="button"
                  onClick={() => setQuickCash(total)}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 whitespace-nowrap"
                >
                  Pas
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCash(20000)}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 whitespace-nowrap"
                >
                  20.000
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCash(50000)}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 whitespace-nowrap"
                >
                  50.000
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCash(100000)}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 whitespace-nowrap"
                >
                  100.000
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2 border border-blue-200 dark:border-blue-900/40">
              <span className="material-symbols-outlined text-base">info</span>
              <span>Pembayaran via {paymentMethod} akan diproses otomatis sejumlah {formatRupiah(total)}.</span>
            </div>
          )}

          {/* Validation Error */}
          {paymentError && (
            <p className="text-xs text-rose-500 font-semibold">{paymentError}</p>
          )}

          {/* Checkout Button */}
          <button
            id="btn-process-payment"
            onClick={handleProcessPayment}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-lg text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              cart.length === 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <span>PROSES BAYAR</span>
          </button>
        </div>
      </section>

      {/* Barcode Scanner Simulation & Hardware Test Modal */}
      {isScannerModalOpen && (
        <div
          id="modal-barcode-simulator"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in-50 duration-150"
        >
          <div
            className={`w-full max-w-xl rounded-2xl shadow-2xl border p-5 sm:p-6 overflow-hidden flex flex-col max-h-[90vh] ${
              isDark
                ? 'bg-[#0f172a] border-slate-700 text-slate-100 shadow-blue-950/40'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-300'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">barcode_scanner</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base leading-tight">
                    Simulasi Barcode Scanner (POS)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Menerjemahkan kode EAN/SKU &amp; auto-add ke keranjang kasir
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScannerModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
              {/* Laser Scanner Visual Animation Box */}
              <div
                className={`relative rounded-xl p-4 border overflow-hidden flex flex-col items-center justify-center text-center ${
                  isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-900 text-white border-slate-800'
                }`}
              >
                {/* Red Laser Sweeping Line */}
                <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse pointer-events-none top-1/2 transform -translate-y-1/2" />

                {/* Simulated EAN-13 Barcode Graphic */}
                <div className="flex items-end gap-1 h-14 px-6 py-2 bg-white rounded-md mb-2 shadow-inner">
                  {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 3, 4, 1, 2, 1, 3, 2].map(
                    (w, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${w * 2}px` }}
                        className="h-full bg-slate-950"
                      />
                    )
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-emerald-400">SCANNER HARDWARE READY</span>
                  <span>•</span>
                  <span>Audio Beep: {isBeepEnabled ? 'AKTIF (1850Hz)' : 'SENYAP'}</span>
                </div>
              </div>

              {/* Manual Input Barcode Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Input String Barcode / SKU / EAN-13:
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (modalCustomSku.trim()) {
                      handleBarcodeScan(modalCustomSku);
                      setModalCustomSku('');
                    }
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                      barcode
                    </span>
                    <input
                      type="text"
                      value={modalCustomSku}
                      onChange={(e) => setModalCustomSku(e.target.value)}
                      placeholder="Contoh: ATK-001, MK-005, MN-004..."
                      className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono outline-none border transition-all ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
                          : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                      }`}
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!modalCustomSku.trim()}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      modalCustomSku.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">sensors</span>
                    <span>Simulate Scan</span>
                  </button>
                </form>
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Scanner fisik (USB/Bluetooth) mengirimkan string SKU/barcode lalu menekan tombol <strong>Enter</strong> secara otomatis.
                </p>
              </div>

              {/* Quick Scan Test Buttons for Current Store Products */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Uji Scan Cepat (Katalog Produk Toko):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Klik produk di bawah untuk simulasi scan instan
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  {products.map((p) => {
                    const isOut = p.stock <= 0;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleBarcodeScan(p.sku)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer select-none group ${
                          isOut
                            ? 'opacity-60 bg-slate-100 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-800'
                            : isDark
                            ? 'bg-slate-900/90 border-slate-800 hover:border-blue-500 hover:bg-slate-800/80 active:scale-[0.98]'
                            : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 active:scale-[0.98]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              {p.sku}
                            </span>
                            <span className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {p.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            {formatRupiah(p.price)} • Stok: {p.stock}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <span className="material-symbols-outlined text-[18px] text-blue-500 group-hover:scale-110 transition-transform">
                            barcode_scanner
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Scan History Log */}
              {recentScans.length > 0 && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <p className="font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">history</span>
                    <span>Log Pemindaian Barcode Terakhir:</span>
                  </p>
                  <div className="space-y-1">
                    {recentScans.map((scan, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between font-mono text-[11px] py-0.5 border-b border-dashed border-slate-200 dark:border-slate-800/80 last:border-0"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span className={scan.success ? 'text-emerald-500' : 'text-rose-500'}>
                            {scan.success ? '✓' : '✗'}
                          </span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            [{scan.sku}]
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 truncate">
                            {scan.name}
                          </span>
                        </span>
                        <span className="text-slate-400 shrink-0">{scan.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleBeep}
                  className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 cursor-pointer ${
                    isBeepEnabled
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isBeepEnabled ? 'volume_up' : 'volume_off'}
                  </span>
                  <span>Beep {isBeepEnabled ? 'ON' : 'OFF'}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsScannerModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Receipt Modal */}
      {checkoutSuccessTx && (
        <div
          id="modal-receipt-success"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70"
        >
          <div
            className={`w-full max-w-sm rounded-xl shadow-xl p-6 border ${
              isDark
                ? 'bg-[#111827] border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Success icon header */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <h3 className="font-display text-lg font-bold">Pembayaran Berhasil</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID Transaksi: #{checkoutSuccessTx.id}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 mb-5 font-mono ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-slate-400">Total Belanja:</span>
                <span className="font-bold">{formatRupiah(checkoutSuccessTx.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode:</span>
                <span className="font-bold">{checkoutSuccessTx.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dibayar:</span>
                <span className="font-bold">{formatRupiah(checkoutSuccessTx.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold border-t border-dashed pt-1.5">
                <span>Kembalian:</span>
                <span>{formatRupiah(checkoutSuccessTx.change)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                id="btn-print-receipt-modal"
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Cetak Struk Transaksi</span>
              </button>
              <button
                id="btn-new-transaction"
                onClick={() => {
                  setCheckoutSuccessTx(null);
                  onClearCart();
                }}
                className={`w-full py-2.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-white/5'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
