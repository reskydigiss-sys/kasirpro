import React, { useState, useMemo } from 'react';
import { Product, CartItem, CategoryType, AppTheme, PaymentMethod, Transaction } from '../types';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [localSearch, setLocalSearch] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<string>('20000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [checkoutSuccessTx, setCheckoutSuccessTx] = useState<Transaction | null>(null);
  const [paymentError, setPaymentError] = useState<string>('');

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
            ? 'bg-[#0a0e1a] border-sky-400/10'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Category Pills & Search */}
        <div
          id="cashier-filter-bar"
          className={`p-4 border-b flex flex-wrap items-center gap-3 shrink-0 ${
            isDark ? 'bg-[#0f1524]/80 border-sky-400/10' : 'bg-white border-slate-200'
          }`}
        >
          {/* Quick local search on mobile or top */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              id="input-cashier-search"
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Cari produk atau SKU..."
              className={`w-full pl-9 pr-4 py-1.5 rounded-full text-xs outline-none border transition-all ${
                isDark
                  ? 'bg-slate-900/60 border-sky-400/20 text-slate-100 placeholder:text-slate-400 focus:border-sky-400'
                  : 'bg-slate-100 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500'
              }`}
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`filter-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-sky-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(125,211,252,0.3)]'
                        : 'bg-blue-600 text-white shadow-sm'
                      : isDark
                      ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-sky-400/10'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

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
                className={`group rounded-xl border overflow-hidden flex flex-col transition-all duration-200 select-none relative ${
                  isOutOfStock
                    ? 'opacity-60 cursor-not-allowed border-dashed ' +
                      (isDark ? 'bg-slate-900/40 border-red-500/30' : 'bg-slate-100 border-slate-200')
                    : 'cursor-pointer hover:shadow-md active:scale-[0.98] ' +
                      (isDark
                        ? 'bg-[#0f1524]/90 border-sky-400/15 hover:border-sky-400/40'
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
                  <div className="text-[11px] font-semibold text-slate-400 mb-0.5">
                    SKU: {prod.sku}
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
                      className={`text-sm sm:text-base font-bold ${
                        isOutOfStock
                          ? 'text-slate-400'
                          : isDark
                          ? 'text-sky-300'
                          : 'text-blue-600'
                      }`}
                    >
                      {formatRupiah(prod.price)}
                    </div>

                    <div
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isOutOfStock
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : isDark
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-emerald-100 text-emerald-800'
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
        className={`w-full lg:w-[380px] xl:w-[420px] flex flex-col h-auto lg:h-full shrink-0 border-t lg:border-t-0 shadow-lg z-20 ${
          isDark
            ? 'bg-[#0f1524] text-slate-100'
            : 'bg-white text-slate-800'
        }`}
      >
        {/* Cart Header */}
        <div
          id="cart-header"
          className={`px-5 py-4 border-b flex justify-between items-center shrink-0 ${
            isDark ? 'bg-[#141c2e] border-sky-400/10' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined ${
                isDark ? 'text-sky-400' : 'text-blue-600'
              }`}
            >
              shopping_cart
            </span>
            <h2 className="text-base sm:text-lg font-bold">Keranjang</h2>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ml-1 ${
                isDark ? 'bg-sky-400/20 text-sky-300' : 'bg-blue-600 text-white'
              }`}
            >
              {cartItemCount}
            </span>
          </div>

          {cart.length > 0 && (
            <button
              id="btn-clear-cart"
              onClick={onClearCart}
              className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-950/40 px-2 py-1 rounded transition-colors"
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
            isDark ? 'bg-[#0a0e1a]/60' : 'bg-slate-50/70'
          }`}
        >
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-3xl">add_shopping_cart</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Keranjang masih kosong</p>
                <p className="text-xs text-slate-400 mt-1">
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
                  className={`rounded-xl border p-3.5 flex flex-col gap-2.5 transition-all ${
                    isDark
                      ? 'bg-[#141c2e] border-sky-400/15'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatRupiah(item.product.price)} / item
                      </p>
                    </div>
                    <button
                      id={`btn-remove-item-${item.product.id}`}
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
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
                        className="w-10 h-7 text-center text-xs font-bold border-none outline-none p-0 bg-transparent text-slate-800 dark:text-slate-100"
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

                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
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
          className={`p-4 sm:p-5 border-t shrink-0 flex flex-col gap-3 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] ${
            isDark ? 'bg-[#0f1524] border-sky-400/10' : 'bg-white border-slate-200'
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
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isDark ? 'text-sky-300 text-glow' : 'text-blue-600'
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
                className={`flex-1 py-1.5 rounded-lg border transition-all text-center ${
                  paymentMethod === method
                    ? isDark
                      ? 'bg-sky-400/20 text-sky-300 border-sky-400 font-bold'
                      : 'bg-blue-50 text-blue-600 border-blue-500 font-bold'
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
                    <span className="text-xs font-bold text-slate-400 mr-1">Rp</span>
                    <input
                      id="input-cash-given"
                      type="text"
                      value={cashGiven}
                      onChange={(e) => {
                        setCashGiven(e.target.value.replace(/[^0-9]/g, ''));
                        setPaymentError('');
                      }}
                      className="w-full text-right text-sm font-bold bg-transparent outline-none"
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
                        ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:border-red-800'
                        : 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800'
                    }`}
                  >
                    <span className="text-xs font-bold w-full text-right truncate">
                      {isCashInsufficient ? 'Kurang' : formatRupiah(change)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Cash Suggestions */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setQuickCash(total)}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 whitespace-nowrap"
                >
                  Uang Pas
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
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-sky-950/40 text-xs text-blue-700 dark:text-sky-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">info</span>
              <span>Pembayaran via {paymentMethod} akan diproses otomatis sejumlah {formatRupiah(total)}.</span>
            </div>
          )}

          {/* Validation Error */}
          {paymentError && (
            <p className="text-xs text-red-500 font-semibold">{paymentError}</p>
          )}

          {/* Big Green Checkout Button matching Image 7 */}
          <button
            id="btn-process-payment"
            onClick={handleProcessPayment}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-xl text-base font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
              cart.length === 0
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-[#006c49] hover:bg-[#005a3c] text-white shadow-emerald-900/10'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">payments</span>
            <span>PROSES BAYAR</span>
          </button>
        </div>
      </section>

      {/* Success Receipt Modal */}
      {checkoutSuccessTx && (
        <div
          id="modal-receipt-success"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div
            className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 border animate-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-[#0f1524] border-sky-400/20 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Success icon header */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h3 className="text-xl font-bold">Pembayaran Berhasil!</h3>
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
