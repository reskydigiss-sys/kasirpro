export type CategoryType = 'Alat Tulis' | 'Makanan' | 'Minuman' | 'Lainnya';

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
}

export type ActiveTab = 
  | 'dashboard'
  | 'kasir'
  | 'produk'
  | 'kategori'
  | 'stok'
  | 'riwayat'
  | 'laporan'
  | 'pengaturan';

export type AppTheme = 'corporate-light' | 'glacier-dark';
