/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, AppTheme, Product, CartItem, Transaction, PaymentMethod } from './types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_CART } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CashierView } from './components/CashierView';
import { ProductList } from './components/ProductList';
import { CategoryView } from './components/CategoryView';
import { InventoryView } from './components/InventoryView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { PrintableReceipt } from './components/PrintableReceipt';
import { formatDate } from './utils/formatters';
import { api, DatabaseStatus } from './services/api';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('kasirku_theme');
    return saved === 'glacier-dark' ? 'glacier-dark' : 'corporate-light';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global search query
  const [headerSearch, setHeaderSearch] = useState('');

  // Turso Database status state
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>({
    status: 'connecting',
    database: 'Turso (LibSQL)',
    host: 'mycasir3-reskydigiss-sys.aws-ap-northeast-1.turso.io'
  });

  // Products state (persisted in Turso and cached locally)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kasirku_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached products', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Shopping Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('kasirku_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached cart', e);
      }
    }
    return INITIAL_CART;
  });

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kasirku_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached transactions', e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Printable transaction
  const [printableTx, setPrintableTx] = useState<Transaction | null>(null);

  // Sync with Turso cloud database
  const refreshDatabase = useCallback(async () => {
    try {
      const status = await api.getStatus();
      setDbStatus(status);

      if (status.status === 'connected') {
        const remoteProducts = await api.getProducts();
        if (remoteProducts && Array.isArray(remoteProducts) && remoteProducts.length > 0) {
          setProducts(remoteProducts);
          localStorage.setItem('kasirku_products', JSON.stringify(remoteProducts));
        }

        const remoteTransactions = await api.getTransactions();
        if (remoteTransactions && Array.isArray(remoteTransactions) && remoteTransactions.length > 0) {
          setTransactions(remoteTransactions);
          localStorage.setItem('kasirku_transactions', JSON.stringify(remoteTransactions));
        }
      }
    } catch (error) {
      console.warn('Using local cached storage while Turso server starts:', error);
      setDbStatus((prev) => prev ? { ...prev, status: 'connecting' } : null);
    }
  }, []);

  useEffect(() => {
    refreshDatabase();
    // Periodically ping status every 30 seconds
    const interval = setInterval(() => {
      api.getStatus().then((s) => setDbStatus(s)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshDatabase]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kasirku_theme', theme);
    if (theme === 'glacier-dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('kasirku_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kasirku_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('kasirku_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Low stock counter
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'glacier-dark' ? 'corporate-light' : 'glacier-dark'));
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + 1);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Checkout transaction
  const handleCheckout = (txData: {
    items: { product: Product; quantity: number }[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    change: number;
  }): Transaction => {
    const nextIdNum = transactions.length + 1;
    const newId = `TRX-${String(nextIdNum).padStart(3, '0')}`;
    const now = new Date();

    const newTx: Transaction = {
      id: newId,
      timestamp: now.toISOString(),
      dateFormatted: formatDate(now.toISOString()),
      cashierName: 'Andi',
      items: txData.items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        sku: i.product.sku,
        quantity: i.quantity,
        price: i.product.price,
        total: i.quantity * i.product.price
      })),
      subtotal: txData.subtotal,
      discount: txData.discount,
      tax: txData.tax,
      total: txData.total,
      paymentMethod: txData.paymentMethod,
      amountPaid: txData.amountPaid,
      change: txData.change,
      status: 'Completed'
    };

    // Deduct stock in local state immediately for instant responsive UI
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = txData.items.find((i) => i.product.id === prod.id);
        if (cartItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - cartItem.quantity)
          };
        }
        return prod;
      })
    );

    // Save transaction to local state
    setTransactions((prev) => [newTx, ...prev]);
    setPrintableTx(newTx);

    // Persist to Turso database asynchronously
    api.createTransaction(newTx)
      .then(() => {
        // Refresh db status to update transaction count
        api.getStatus().then((s) => setDbStatus(s)).catch(() => {});
      })
      .catch((err) => {
        console.warn('Could not persist transaction to Turso:', err);
      });

    return newTx;
  };

  // Product CRUD with Turso Cloud Sync
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newId = `PRD-${Date.now()}`;
    const newProduct: Product = {
      ...newProductData,
      id: newId
    };
    setProducts((prev) => [newProduct, ...prev]);

    api.createProduct(newProduct)
      .then(() => api.getStatus().then((s) => setDbStatus(s)))
      .catch((err) => console.warn('Turso add product warning:', err));
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updated.id ? { ...item, product: updated } : item
      )
    );

    api.updateProduct(updated)
      .then(() => api.getStatus().then((s) => setDbStatus(s)))
      .catch((err) => console.warn('Turso update product warning:', err));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));

    api.deleteProduct(id)
      .then(() => api.getStatus().then((s) => setDbStatus(s)))
      .catch((err) => console.warn('Turso delete product warning:', err));
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );

    api.updateStock(productId, newStock)
      .catch((err) => console.warn('Turso update stock warning:', err));
  };

  // Reset to initial demo data
  const handleResetData = async () => {
    localStorage.removeItem('kasirku_products');
    localStorage.removeItem('kasirku_cart');
    localStorage.removeItem('kasirku_transactions');
    setProducts(INITIAL_PRODUCTS);
    setCart(INITIAL_CART);
    setTransactions(INITIAL_TRANSACTIONS);

    try {
      await api.resetDatabase();
      await refreshDatabase();
    } catch (e) {
      console.warn('Reset local only:', e);
    }
  };

  return (
    <div
      id="kasirku-app-root"
      className={`min-h-screen flex transition-colors duration-200 ${
        theme === 'glacier-dark'
          ? 'bg-[#0a0e1a] text-slate-100 dark'
          : 'bg-[#f8fafc] text-slate-800'
      }`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setHeaderSearch('');
        }}
        theme={theme}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        lowStockCount={lowStockCount}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Header Top Bar */}
        <Header
          activeTab={activeTab}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenMobileMenu={() => setMobileOpen(true)}
          searchQuery={headerSearch}
          dbStatus={dbStatus}
          onSearchChange={
            ['kasir', 'produk', 'stok', 'riwayat'].includes(activeTab)
              ? setHeaderSearch
              : undefined
          }
          searchPlaceholder={
            activeTab === 'kasir'
              ? 'Cari produk atau SKU di kasir...'
              : activeTab === 'riwayat'
              ? 'Cari riwayat transaksi...'
              : 'Cari produk, SKU...'
          }
        />

        {/* Tab Content Canvas */}
        <main id="main-content-canvas" className="flex-1 pt-16 min-h-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              products={products}
              theme={theme}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'kasir' && (
            <CashierView
              products={products}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateCartQty={handleUpdateCartQty}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
              theme={theme}
              searchQuery={headerSearch}
            />
          )}

          {activeTab === 'produk' && (
            <ProductList
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              theme={theme}
            />
          )}

          {activeTab === 'kategori' && (
            <CategoryView
              products={products}
              theme={theme}
              onNavigateToProducts={(category) => {
                setActiveTab('produk');
              }}
            />
          )}

          {activeTab === 'stok' && (
            <InventoryView
              products={products}
              onUpdateStock={handleUpdateStock}
              theme={theme}
            />
          )}

          {activeTab === 'riwayat' && (
            <SalesHistoryView transactions={transactions} theme={theme} />
          )}

          {activeTab === 'laporan' && (
            <ReportsView transactions={transactions} theme={theme} />
          )}

          {activeTab === 'pengaturan' && (
            <SettingsView
              theme={theme}
              onThemeChange={setTheme}
              onResetData={handleResetData}
              dbStatus={dbStatus}
              onRefreshDbStatus={refreshDatabase}
            />
          )}
        </main>
      </div>

      {/* Hidden print receipt rendered for standard browser print (Cetak Struk) */}
      <PrintableReceipt transaction={printableTx || transactions[0] || null} />
    </div>
  );
}
