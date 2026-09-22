import { Product, Transaction } from '../types';

export interface DatabaseStatus {
  status: 'connected' | 'error' | 'connecting';
  database?: string;
  host?: string;
  latency?: string;
  productsCount?: number;
  transactionsCount?: number;
  message?: string;
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

  async getProducts(): Promise<Product[]> {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Gagal memuat produk dari Turso');
    return await res.json();
  },

  async createProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
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

  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch('/api/transactions');
    if (!res.ok) throw new Error('Gagal memuat riwayat transaksi dari Turso');
    return await res.json();
  },

  async createTransaction(tx: Omit<Transaction, 'id'> & { id?: string }): Promise<Transaction> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx)
    });
    if (!res.ok) throw new Error('Gagal memproses transaksi ke Turso');
    return await res.json();
  },

  async resetDatabase(): Promise<void> {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Gagal mereset database Turso');
  }
};
