import { Product, Transaction, User, CategoryItem, Customer, Promo, StockLog } from '../types';

export interface DatabaseStatus {
  status: 'connected' | 'error' | 'connecting';
  database?: string;
  host?: string;
  latency?: string;
  productsCount?: number;
  transactionsCount?: number;
  usersCount?: number;
  message?: string;
}

export interface UserStoreStats {
  productsCount: number;
  transactionsCount: number;
  totalRevenue: number;
}

export interface StoreSummaryItem {
  id: string;
  username: string;
  name: string;
  storeName: string;
  slug: string;
  role: string;
  category: string;
  avatar?: string;
  createdAt?: string;
  productsCount: number;
  transactionsCount: number;
  totalRevenue: number;
}

export interface AdminGlobalStats {
  totalStores: number;
  totalProducts: number;
  totalTransactions: number;
  totalRevenue: number;
}

export interface AdminLatestTx {
  id: string;
  timestamp: string;
  dateFormatted: string;
  total: number;
  paymentMethod: string;
  cashierName: string;
  storeSlug: string;
  storeName: string;
  customerName?: string;
}

export interface AdminOverviewData {
  globalStats: AdminGlobalStats;
  stores: StoreSummaryItem[];
  latestTransactions: AdminLatestTx[];
  dbStatus: DatabaseStatus;
}

export const api = {
  async getStatus(): Promise<DatabaseStatus> {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error('Status check failed');
      return await res.json();
    } catch (error: any) {
      return {
        status: 'error',
        message: error?.message || 'Gagal terhubung ke Turso'
      };
    }
  },

  // Authentication & Users
  async login(credentials: { username: string; password: string }): Promise<{ user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal masuk ke akun');
    }
    return data;
  },

  async register(data: {
    username: string;
    password: string;
    name: string;
    storeName: string;
    category?: string;
    avatar?: string;
    starterProducts?: any[];
    starterCategories?: any[];
    starterPromos?: any[];
    starterCustomers?: any[];
  }): Promise<{
    user: User;
    itemsCreated?: {
      products: number;
      categories: number;
      promos: number;
      customers: number;
    };
    uniquePageUrl?: string;
  }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Gagal mendaftar akun baru');
    }
    return result;
  },

  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/auth/users');
      if (!res.ok) throw new Error('Gagal memuat daftar pengguna');
      return await res.json();
    } catch (e) {
      console.warn('Could not load users list:', e);
      return [];
    }
  },

  async getUserBySlug(slug: string): Promise<{ user: User; stats: UserStoreStats }> {
    const res = await fetch(`/api/users/${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Toko tidak ditemukan');
    }
    return data;
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`/api/auth/users/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Gagal menghapus akun pengguna');
    }
  },

  // Categories (scoped by store slug)
  async getCategories(slug: string = 'admin'): Promise<CategoryItem[]> {
    const res = await fetch(`/api/categories?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Gagal memuat kategori dari server');
    return await res.json();
  },

  async createCategory(
    category: Omit<CategoryItem, 'id'> & { id?: string },
    slug: string = 'admin'
  ): Promise<CategoryItem> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...category, storeSlug: slug })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menambahkan kategori baru');
    return data;
  },

  async updateCategory(category: CategoryItem, oldName?: string): Promise<CategoryItem> {
    const res = await fetch(`/api/categories/${category.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...category, oldName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memperbarui kategori');
    return data;
  },

  async deleteCategory(id: string, fallbackCategory?: string, storeSlug?: string): Promise<void> {
    const params = new URLSearchParams();
    if (fallbackCategory) params.set('fallbackCategory', fallbackCategory);
    if (storeSlug) params.set('storeSlug', storeSlug);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/categories/${id}${qs}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Gagal menghapus kategori');
    }
  },

  // Products (scoped by store slug)
  async getProducts(slug: string = 'admin'): Promise<Product[]> {
    const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Gagal memuat produk dari Turso');
    return await res.json();
  },

  async createProduct(
    product: Omit<Product, 'id'> & { id?: string },
    slug: string = 'admin'
  ): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, storeSlug: slug })
    });
    if (!res.ok) throw new Error('Gagal menyimpan produk ke Turso');
    return await res.json();
  },

  async updateProduct(product: Product): Promise<Product> {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Gagal memperbarui produk di Turso');
    return await res.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Gagal menghapus produk dari Turso');
  },

  async updateStock(id: string, stock: number): Promise<{ id: string; stock: number }> {
    const res = await fetch(`/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock })
    });
    if (!res.ok) throw new Error('Gagal memperbarui stok di Turso');
    return await res.json();
  },

  // Transactions (scoped by store slug)
  async getTransactions(slug: string = 'admin'): Promise<Transaction[]> {
    const res = await fetch(`/api/transactions?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Gagal memuat riwayat transaksi dari Turso');
    return await res.json();
  },

  async createTransaction(
    tx: Omit<Transaction, 'id'> & { id?: string },
    slug: string = 'admin'
  ): Promise<Transaction> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tx, storeSlug: slug })
    });
    if (!res.ok) throw new Error('Gagal memproses transaksi ke Turso');
    return await res.json();
  },

  async updateTransaction(tx: Partial<Transaction> & { id: string }): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${tx.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
    if (!res.ok) throw new Error('Gagal memperbarui transaksi di Turso');
    return await res.json();
  },

  async deleteTransaction(id: string, restock: boolean = false): Promise<void> {
    const res = await fetch(`/api/transactions/${id}?restock=${restock ? 'true' : 'false'}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Gagal membatalkan transaksi di Turso');
  },

  // Customers CRUD
  async getCustomers(slug: string = 'admin'): Promise<Customer[]> {
    const res = await fetch(`/api/customers?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Gagal memuat pelanggan dari Turso');
    return await res.json();
  },

  async createCustomer(
    customer: Omit<Customer, 'id'> & { id?: string },
    slug: string = 'admin'
  ): Promise<Customer> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...customer, storeSlug: slug })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menambahkan pelanggan');
    return data;
  },

  async updateCustomer(customer: Customer): Promise<Customer> {
    const res = await fetch(`/api/customers/${customer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memperbarui pelanggan');
    return data;
  },

  async deleteCustomer(id: string): Promise<void> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Gagal menghapus pelanggan dari Turso');
  },

  // Promos CRUD
  async getPromos(slug: string = 'admin'): Promise<Promo[]> {
    const res = await fetch(`/api/promos?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Gagal memuat promo dari Turso');
    return await res.json();
  },

  async createPromo(
    promo: Omit<Promo, 'id'> & { id?: string },
    slug: string = 'admin'
  ): Promise<Promo> {
    const res = await fetch('/api/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...promo, storeSlug: slug })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menambahkan kupon promo');
    return data;
  },

  async updatePromo(promo: Promo): Promise<Promo> {
    const res = await fetch(`/api/promos/${promo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promo)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memperbarui kupon promo');
    return data;
  },

  async deletePromo(id: string): Promise<void> {
    const res = await fetch(`/api/promos/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Gagal menghapus kupon promo dari Turso');
  },

  // Stock Logs CRUD
  async getStockLogs(slug: string = 'admin'): Promise<StockLog[]> {
    const res = await fetch(`/api/stock-logs?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Gagal memuat log mutasi stok');
    return await res.json();
  },

  async createStockLog(
    log: Omit<StockLog, 'id'> & { id?: string },
    slug: string = 'admin'
  ): Promise<StockLog> {
    const res = await fetch('/api/stock-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...log, storeSlug: slug })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mencatat mutasi stok');
    return data;
  },

  async deleteStockLog(id: string): Promise<void> {
    const res = await fetch(`/api/stock-logs/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Gagal menghapus log stok');
  },

  async resetDatabase(): Promise<void> {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Gagal mereset database Turso');
  },

  // Super Admin Methods
  async adminLogin(credentials: { username: string; password: string }): Promise<{
    success: boolean;
    user: User;
    adminToken: string;
    serverTime: string;
  }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Gagal masuk sebagai Administrator Aplikasi');
    }
    return await res.json();
  },

  async getAdminOverview(): Promise<AdminOverviewData> {
    const res = await fetch('/api/admin/overview');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal memuat data monitoring toko');
    }
    return await res.json();
  }
};

