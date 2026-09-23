/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, AppTheme, Product, CartItem, Transaction, PaymentMethod, User } from './types';
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
import { AuthModal } from './components/AuthModal';
import { UniquePageBanner } from './components/UniquePageBanner';
import { LandingPageView } from './components/LandingPageView';
import { AdminPortalView } from './components/AdminPortalView';
import { formatDate } from './utils/formatters';
import { api, DatabaseStatus } from './services/api';

const DEFAULT_ADMIN_USER: User = {
  id: 'usr-admin',
  username: 'admin',
  name: 'Admin Kasirku',
  storeName: 'KASIRKU STORE',
  slug: 'admin',
  role: 'Owner',
  category: 'Retail & Minimarket'
};

function getInitialUser(): User {
  const urlParams = new URLSearchParams(window.location.search);
  const urlSlug = urlParams.get('u') || urlParams.get('user') || urlParams.get('store');

  if (urlSlug) {
    const clean = urlSlug.toLowerCase().trim();
    if (clean === 'admin') return DEFAULT_ADMIN_USER;
    if (clean === 'tokoberkah') {
      return {
        id: 'usr-tokoberkah',
        username: 'tokoberkah',
        name: 'H. Ahmad',
        storeName: 'Toko Berkah',
        slug: 'tokoberkah',
        role: 'Owner',
        category: 'Kelontong & Sembako'
      };
    }
    return {
      id: `usr-${clean}`,
      username: clean,
      name: clean.charAt(0).toUpperCase() + clean.slice(1),
      storeName: `Toko ${clean.charAt(0).toUpperCase() + clean.slice(1)}`,
      slug: clean,
      role: 'Owner',
      category: 'Retail'
    };
  }

  const saved = localStorage.getItem('kasirku_user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse cached user:', e);
    }
  }

  return DEFAULT_ADMIN_USER;
}

export default function App() {
  // Current logged in user & unique store page
  const [currentUser, setCurrentUser] = useState<User>(getInitialUser);
  const currentSlug = currentUser?.slug || 'admin';

  // Auth & Monitor Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'monitor'>('login');

  // Theme state
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('kasirku_theme');
    return saved === 'glacier-dark' ? 'glacier-dark' : 'corporate-light';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('view') === 'admin') {
      return 'admin';
    }
    const tabParam = params.get('tab') as ActiveTab;
    if (
      tabParam &&
      [
        'landing',
        'dashboard',
        'kasir',
        'produk',
        'kategori',
        'stok',
        'riwayat',
        'laporan',
        'pengaturan',
        'admin'
      ].includes(tabParam)
    ) {
      return tabParam;
    }
    return 'landing';
  });

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

  // Products state (scoped per store slug)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`kasirku_products_${currentSlug}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached products', e);
      }
    }
    return currentSlug === 'admin' ? INITIAL_PRODUCTS : [];
  });

  // Shopping Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(`kasirku_cart_${currentSlug}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached cart', e);
      }
    }
    return currentSlug === 'admin' ? INITIAL_CART : [];
  });

  // Transactions state (scoped per store slug)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`kasirku_transactions_${currentSlug}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached transactions', e);
      }
    }
    return currentSlug === 'admin' ? INITIAL_TRANSACTIONS : [];
  });

  // Printable transaction
  const [printableTx, setPrintableTx] = useState<Transaction | null>(null);

  // Sync with Turso cloud database for the current store slug
  const refreshDatabase = useCallback(async (slugToFetch: string = currentSlug) => {
    try {
      const status = await api.getStatus();
      setDbStatus(status);

      if (status.status === 'connected') {
        const remoteProducts = await api.getProducts(slugToFetch);
        if (remoteProducts && Array.isArray(remoteProducts)) {
          setProducts(remoteProducts);
          localStorage.setItem(`kasirku_products_${slugToFetch}`, JSON.stringify(remoteProducts));
        }

        const remoteTransactions = await api.getTransactions(slugToFetch);
        if (remoteTransactions && Array.isArray(remoteTransactions)) {
          setTransactions(remoteTransactions);
          localStorage.setItem(`kasirku_transactions_${slugToFetch}`, JSON.stringify(remoteTransactions));
        }

        // Also fetch official user details if available
        api.getUserBySlug(slugToFetch).then((data) => {
          if (data && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('kasirku_user', JSON.stringify(data.user));
          }
        }).catch(() => {});
      }
    } catch (error) {
      console.warn('Using local cached storage while Turso server starts:', error);
      setDbStatus((prev) => prev ? { ...prev, status: 'connecting' } : null);
    }
  }, [currentSlug]);

  // When current user changes or on first mount
  useEffect(() => {
    refreshDatabase(currentSlug);
    // Sync browser URL to ?u=slug
    const url = new URL(window.location.href);
    if (url.searchParams.get('u') !== currentSlug) {
      url.searchParams.set('u', currentSlug);
      window.history.replaceState({}, '', url.toString());
    }
    localStorage.setItem('kasirku_user', JSON.stringify(currentUser));
  }, [currentSlug, currentUser, refreshDatabase]);

  // Periodic status ping
  useEffect(() => {
    const interval = setInterval(() => {
      api.getStatus().then((s) => setDbStatus(s)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Theme synchronization
  useEffect(() => {
    localStorage.setItem('kasirku_theme', theme);
    if (theme === 'glacier-dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Cache products, cart, transactions per slug
  useEffect(() => {
    localStorage.setItem(`kasirku_products_${currentSlug}`, JSON.stringify(products));
  }, [products, currentSlug]);

  useEffect(() => {
    localStorage.setItem(`kasirku_cart_${currentSlug}`, JSON.stringify(cart));
  }, [cart, currentSlug]);

  useEffect(() => {
    localStorage.setItem(`kasirku_transactions_${currentSlug}`, JSON.stringify(transactions));
  }, [transactions, currentSlug]);

  // Low stock counter
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'glacier-dark' ? 'corporate-light' : 'glacier-dark'));
  };

  // Switch / Login user
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCart([]);
    refreshDatabase(user.slug);
  };

  const handleLogout = () => {
    localStorage.removeItem('kasirku_user');
    setCurrentUser(DEFAULT_ADMIN_USER);
    setCart([]);
    refreshDatabase('admin');
  };

  const openAuthModalWithTab = (tab: 'login' | 'register' | 'monitor' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
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

    // Persist to Turso database asynchronously (scoped by current store slug)
    api.createTransaction(newTx, currentSlug)
      .then(() => {
        // Refresh db status to update transaction count
        api.getStatus().then((s) => setDbStatus(s)).catch(() => {});
      })
      .catch((err) => {
        console.warn('Could not persist transaction to Turso:', err);
      });

    return newTx;
  };

  // Product CRUD with Turso Cloud Sync (scoped by current store slug)
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newId = `PRD-${Date.now()}`;
    const newProduct: Product = {
      ...newProductData,
      id: newId
    };
    setProducts((prev) => [newProduct, ...prev]);

    api.createProduct(newProduct, currentSlug)
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
    localStorage.removeItem(`kasirku_products_${currentSlug}`);
    localStorage.removeItem(`kasirku_cart_${currentSlug}`);
    localStorage.removeItem(`kasirku_transactions_${currentSlug}`);
    setProducts(INITIAL_PRODUCTS);
    setCart(INITIAL_CART);
    setTransactions(INITIAL_TRANSACTIONS);

    try {
      await api.resetDatabase();
      await refreshDatabase(currentSlug);
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
        currentUser={currentUser}
        onOpenAuthModal={openAuthModalWithTab}
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
          currentUser={currentUser}
          onOpenAuthModal={openAuthModalWithTab}
          onNavigate={(tab) => {
            setActiveTab(tab);
            setHeaderSearch('');
          }}
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
        <main id="main-content-canvas" className="flex-1 pt-18 min-h-0 overflow-y-auto">
          {/* Top Banner indicating unique store page (hide on landing and admin portal for clean look) */}
          {activeTab !== 'landing' && activeTab !== 'admin' && (
            <UniquePageBanner
              currentUser={currentUser}
              currentSlug={currentSlug}
              theme={theme}
              onOpenAuthModal={openAuthModalWithTab}
            />
          )}

          {activeTab === 'landing' && (
            <LandingPageView
              products={products}
              transactions={transactions}
              currentUser={currentUser}
              theme={theme}
              dbStatus={dbStatus}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setHeaderSearch('');
              }}
              onOpenAuthModal={openAuthModalWithTab}
              onToggleTheme={toggleTheme}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPortalView
              currentUser={currentUser}
              theme={theme}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setHeaderSearch('');
              }}
              onSwitchStore={(slug) => {
                const url = new URL(window.location.href);
                url.searchParams.set('u', slug);
                url.searchParams.delete('admin');
                url.searchParams.set('tab', 'kasir');
                window.history.pushState({}, '', url.toString());
                setCurrentUser((prev) => ({
                  ...prev,
                  slug,
                  storeName: slug === 'admin' ? 'KASIRKU STORE' : `Toko ${slug}`
                }));
                setActiveTab('kasir');
              }}
              onAdminLoginSuccess={(adminUser) => {
                setCurrentUser(adminUser);
              }}
              onAdminLogout={() => {
                setActiveTab('kasir');
              }}
            />
          )}

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
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
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
              onRefreshDbStatus={() => refreshDatabase(currentSlug)}
              currentUser={currentUser}
              onOpenAuthModal={openAuthModalWithTab}
            />
          )}
        </main>
      </div>

      {/* Auth, Credentials & Unique Store Pages Monitor Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        theme={theme}
        initialTab={authModalTab}
      />

      {/* Hidden print receipt rendered for standard browser print (Cetak Struk) */}
      <PrintableReceipt transaction={printableTx || transactions[0] || null} />
    </div>
  );
}
