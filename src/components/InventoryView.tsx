import React, { useState, useMemo } from 'react';
import { Product, AppTheme, CategoryType, CategoryItem, StockLog } from '../types';
import { formatRupiah } from '../utils/formatters';

interface InventoryViewProps {
  products: Product[];
  categories?: CategoryItem[];
  stockLogs?: StockLog[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onAddProduct?: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onAddStockLog?: (log: Omit<StockLog, 'id'>) => void;
  onDeleteStockLog?: (id: string) => void;
  theme: AppTheme;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  categories,
  stockLogs = [],
  onUpdateStock,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddStockLog,
  onDeleteStockLog,
  theme
}) => {
  const isDark = theme === 'glacier-dark';
  const [activeTab, setActiveTab] = useState<'inventory' | 'mutations'>('inventory');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mutationTypeFilter, setMutationTypeFilter] = useState<string>('all');

  // Modals for editing / deleting from inventory
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Modal for creating stock mutation log
  const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<StockLog | null>(null);

  // Mutation form state
  const [mutProdId, setMutProdId] = useState('');
  const [mutType, setMutType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [mutQty, setMutQty] = useState(10);
  const [mutReason, setMutReason] = useState('Restock dari supplier');

  // Dynamic category list from database
  const categoryNames = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((c) => c.name);
    }
    const set = new Set<string>(['Alat Tulis', 'Makanan', 'Minuman', 'Lainnya']);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [categories, products]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Alat Tulis' as CategoryType,
    price: 10000,
    stock: 20,
    imageUrl: '',
    description: ''
  });

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = filterLowStockOnly ? p.stock <= 5 : true;
    return matchesSearch && matchesStock;
  });

  const filteredLogs = useMemo(() => {
    return stockLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        log.productName.toLowerCase().includes(q) ||
        (log.reason && log.reason.toLowerCase().includes(q));

      const matchType = mutationTypeFilter === 'all' || log.type === mutationTypeFilter;
      return matchSearch && matchType;
    });
  }, [stockLogs, searchQuery, mutationTypeFilter]);

  const openAddModal = () => {
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Alat Tulis',
      price: 15000,
      stock: 50,
      imageUrl: '',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      price: prod.price,
      stock: prod.stock,
      imageUrl: prod.imageUrl || '',
      description: prod.description || ''
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) return;

    if (editingProduct && onUpdateProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...formData
      });
      setEditingProduct(null);
    } else if (onAddProduct) {
      onAddProduct(formData);
      setIsAddModalOpen(false);
    }
  };

  // Open Mutation Modal
  const openMutationModal = (productId?: string) => {
    const targetProd = productId ? products.find((p) => p.id === productId) : products[0];
    setMutProdId(targetProd?.id || '');
    setMutType('in');
    setMutQty(10);
    setMutReason('Restock dari supplier utama');
    setIsMutationModalOpen(true);
  };

  const selectedMutProduct = products.find((p) => p.id === mutProdId);

  const calculateNewStockAfterMutation = useMemo(() => {
    if (!selectedMutProduct) return 0;
    const current = selectedMutProduct.stock;
    if (mutType === 'in') return current + mutQty;
    if (mutType === 'out') return Math.max(0, current - mutQty);
    return Math.max(0, mutQty); // direct adjustment
  }, [selectedMutProduct, mutType, mutQty]);

  const handleSaveMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMutProduct) return;

    const previousStock = selectedMutProduct.stock;
    const newStock = calculateNewStockAfterMutation;
    const now = new Date();
    const dateFormatted = now.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (onAddStockLog) {
      onAddStockLog({
        productId: selectedMutProduct.id,
        productName: selectedMutProduct.name,
        type: mutType,
        quantity: mutQty,
        previousStock,
        newStock,
        reason: mutReason.trim() || (mutType === 'in' ? 'Restock barang' : mutType === 'out' ? 'Barang rusak/keluar' : 'Koreksi stok'),
        dateFormatted,
        timestamp: now.toISOString()
      });
    }

    onUpdateStock(selectedMutProduct.id, newStock);
    setIsMutationModalOpen(false);
  };

  return (
    <div id="inventory-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Manajemen Inventori &amp; Mutasi Stok (CRUD)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau stok barang, catat mutasi masuk/keluar supplier, serta perbarui ketersediaan produk.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Add Product Button */}
          {onAddProduct && (
            <button
              onClick={openAddModal}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_box</span>
              <span>Tambah Produk</span>
            </button>
          )}

          {/* Record Mutation Button */}
          <button
            onClick={() => openMutationModal()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            <span>Catat Mutasi Stok Baru</span>
          </button>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Jenis Produk</p>
          <p className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
            {products.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">SKU Aktif di Katalog</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Stok Aman</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {products.filter((p) => p.stock > 5).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Stok mencukupi (&gt;5)</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Perlu Restock</p>
          <p className="text-2xl font-bold font-mono text-rose-500 mt-1">
            {products.filter((p) => p.stock <= 5).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Habis atau kritis (&le;5)</p>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Riwayat Mutasi</p>
          <p className="text-2xl font-bold font-mono text-blue-600 dark:text-sky-400 mt-1">
            {stockLogs.length} Log
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Aktivitas Keluar Masuk</p>
        </div>
      </div>

      {/* Tabs Switcher: Produk vs Mutasi Logs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer border-b-2 transition-colors ${
            activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600 dark:text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          <span>Daftar Stok Produk ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mutations')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 cursor-pointer border-b-2 transition-colors ${
            activeTab === 'mutations'
              ? 'border-blue-600 text-blue-600 dark:text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>Riwayat &amp; Catat Mutasi Stok ({stockLogs.length})</span>
        </button>
      </div>

      {/* Search & Sub-Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'inventory' ? 'Cari SKU atau nama produk...' : 'Cari produk atau alasan mutasi...'}
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
            }`}
          />
        </div>

        {activeTab === 'inventory' ? (
          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
              filterLowStockOnly
                ? 'bg-rose-500 text-white border-rose-500'
                : isDark
                ? 'border-slate-700 text-slate-300 hover:bg-white/5'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Hanya Stok Menipis (&le;5)</span>
          </button>
        ) : (
          <select
            value={mutationTypeFilter}
            onChange={(e) => setMutationTypeFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs outline-none border cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <option value="all">Semua Tipe Mutasi</option>
            <option value="in">Barang Masuk (In)</option>
            <option value="out">Barang Keluar (Out)</option>
            <option value="adjustment">Koreksi Opname</option>
          </select>
        )}
      </div>

      {/* TAB 1: Inventory Table */}
      {activeTab === 'inventory' && (
        <div
          className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead
                className={`border-b text-xs font-semibold ${
                  isDark ? 'bg-[#0e1422] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <tr>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Nama Produk</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4 text-right">Harga Satuan</th>
                  <th className="p-4 text-center">Stok Saat Ini</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Restock Cepat (+/-)</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                      Tidak ada produk yang cocok dengan pencarian atau filter stok.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const isCritical = prod.stock <= 0;
                    const isLow = prod.stock > 0 && prod.stock <= 5;
                    return (
                      <tr
                        key={prod.id}
                        className={`transition-colors ${
                          isCritical
                            ? 'bg-rose-50/40 dark:bg-rose-950/20'
                            : isDark
                            ? 'hover:bg-white/5'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-4 font-mono font-bold text-slate-500 dark:text-slate-400">
                          {prod.sku}
                        </td>
                        <td className="p-4 font-semibold">{prod.name}</td>
                        <td className="p-4 text-slate-500">{prod.category}</td>
                        <td className="p-4 text-right font-medium">{formatRupiah(prod.price)}</td>
                        <td className="p-4 text-center">
                          <span
                            className={`text-base font-extrabold ${
                              isCritical
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-500'
                                : isDark
                                ? 'text-sky-300'
                                : 'text-blue-600'
                            }`}
                          >
                            {prod.stock}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {isCritical ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                              Habis
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Menipis
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Aman
                            </span>
                          )}
                        </td>
                        {/* Restock Buttons */}
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => onUpdateStock(prod.id, Math.max(0, prod.stock - 1))}
                              className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                              title="Kurangi 1"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => onUpdateStock(prod.id, prod.stock + 1)}
                              className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                              title="Tambah 1"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => onUpdateStock(prod.id, prod.stock + 10)}
                              className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-300 hover:bg-blue-100 text-xs font-bold cursor-pointer"
                              title="Restock +10"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => openMutationModal(prod.id)}
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1"
                              title="Catat Mutasi Lengkap"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit_note</span>
                              <span>Mutasi</span>
                            </button>
                          </div>
                        </td>
                        {/* Action Edit & Delete */}
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {onUpdateProduct && (
                              <button
                                onClick={() => openEditModal(prod)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit Detail Produk"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                            )}
                            {onDeleteProduct && (
                              <button
                                onClick={() => setProductToDelete(prod)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Hapus Produk"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Mutation Stock Logs */}
      {activeTab === 'mutations' && (
        <div
          className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead
                className={`border-b text-xs font-semibold ${
                  isDark ? 'bg-[#0e1422] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <tr>
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Produk</th>
                  <th className="p-4 text-center">Tipe Mutasi</th>
                  <th className="p-4 text-center">Jumlah</th>
                  <th className="p-4 text-center">Perubahan Stok</th>
                  <th className="p-4">Alasan / Keterangan</th>
                  <th className="p-4 text-center">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      Belum ada riwayat mutasi stok. Klik "Catat Mutasi Stok Baru" di atas untuk menambah mutasi.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 text-slate-500 font-mono text-xs">{log.dateFormatted}</td>
                      <td className="p-4 font-bold">{log.productName}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            log.type === 'in'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : log.type === 'out'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {log.type === 'in' ? 'Masuk (In)' : log.type === 'out' ? 'Keluar (Out)' : 'Koreksi Opname'}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold font-mono">
                        {log.type === 'in' ? `+${log.quantity}` : log.type === 'out' ? `-${log.quantity}` : `=${log.quantity}`}
                      </td>
                      <td className="p-4 text-center font-mono text-xs">
                        <span className="text-slate-400">{log.previousStock}</span>
                        <span className="mx-1 text-slate-300">&rarr;</span>
                        <span className="font-bold text-blue-600 dark:text-sky-400">{log.newStock}</span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{log.reason || '-'}</td>
                      <td className="p-4 text-center">
                        {onDeleteStockLog && (
                          <button
                            title="Hapus Catatan Log"
                            onClick={() => setLogToDelete(log)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Catat Mutasi Stok */}
      {isMutationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-[#141e33]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">swap_horiz</span>
                <h3 className="font-bold text-base">Catat Mutasi Stok Baru</h3>
              </div>
              <button onClick={() => setIsMutationModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMutation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Pilih Produk *</label>
                <select
                  required
                  value={mutProdId}
                  onChange={(e) => setMutProdId(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok Saat Ini: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tipe Mutasi</label>
                  <select
                    value={mutType}
                    onChange={(e) => setMutType(e.target.value as any)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  >
                    <option value="in">Barang Masuk (Restock)</option>
                    <option value="out">Barang Keluar (Rusak/Retur)</option>
                    <option value="adjustment">Koreksi Stok Opname</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {mutType === 'adjustment' ? 'Jumlah Stok Akhir' : 'Jumlah Perubahan'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={mutQty}
                    onChange={(e) => setMutQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Alasan / Catatan Supplier</label>
                <input
                  type="text"
                  placeholder="Contoh: Penerimaan PO-892 supplier"
                  value={mutReason}
                  onChange={(e) => setMutReason(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              {/* Realtime calculation preview */}
              {selectedMutProduct && (
                <div className={`p-4 rounded-xl border flex justify-between items-center ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-blue-50/70 border-blue-100'
                }`}>
                  <div>
                    <p className="text-xs font-semibold">Simulasi Perubahan Stok</p>
                    <p className="text-xs text-slate-500">Stok Saat Ini: {selectedMutProduct.stock}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-slate-500">{selectedMutProduct.stock}</span>
                    <span className="mx-2">&rarr;</span>
                    <span className="text-lg font-extrabold text-blue-600 dark:text-sky-400">
                      {calculateNewStockAfterMutation}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMutationModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan &amp; Terapkan Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Stock Log */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${
              isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <h3 className="font-bold text-lg mb-1">Hapus Catatan Mutasi?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Hapus log mutasi untuk produk <strong>{logToDelete.productName}</strong> ({logToDelete.dateFormatted})? Catatan log akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteStockLog) onDeleteStockLog(logToDelete.id);
                  setLogToDelete(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Hapus Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Tambah / Edit Produk */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className="text-base font-bold">
                {editingProduct ? 'Edit Detail Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">SKU / Kode *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  >
                    {categoryNames.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Hapus Produk */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-5 space-y-4 ${
              isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <h3 className="text-base font-bold">Hapus Produk dari Inventori?</h3>
            <p className="text-xs text-slate-500">
              Yakin ingin menghapus <strong>{productToDelete.name}</strong> (SKU: {productToDelete.sku})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteProduct) onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
