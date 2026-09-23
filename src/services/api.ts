import { Product, Transaction, User } from '../types';

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
  }): Promise<{ user: User }> {
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

