export type CategoryType = string;

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  storeSlug?: string;
  createdAt?: string;
}

export type PaymentMethod = 'Tunai' | 'QRIS' | 'Kartu Kredit' | 'Transfer Bank';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: CategoryType;
  price: number;
  stock: number;
  imageUrl: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Transaction {
  id: string;
  timestamp: string; // ISO string or formatted
  dateFormatted: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  cashierName: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  customerName?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  memberLevel: 'Reguler' | 'Silver' | 'Gold' | 'VIP';
  points: number;
  totalSpent?: number;
  transactionCount?: number;
  storeSlug?: string;
  createdAt?: string;
}

export interface Promo {
  id: string;
  code: string;
  title: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10% or 10000 for Rp 10.000
  minSpend: number;
  isActive: boolean;
  storeSlug?: string;
  createdAt?: string;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  dateFormatted: string;
  timestamp: string;
  storeSlug?: string;
}

export type ActiveTab = 
  | 'landing'
  | 'dashboard'
  | 'kasir'
  | 'produk'
  | 'kategori'
  | 'stok'
  | 'riwayat'
  | 'pelanggan'
  | 'promo'
  | 'laporan'
  | 'pengaturan'
  | 'admin'
  | 'login'
  | 'register';

export type AppTheme = 'corporate-light' | 'glacier-dark';

export interface User {
  id: string;
  username: string;
  name: string;
  storeName: string;
  slug: string;
  role: string;
  category?: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export * from './types/printer';
