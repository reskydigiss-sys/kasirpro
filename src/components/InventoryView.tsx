import React, { useState } from 'react';
import { Product, AppTheme, CategoryType } from '../types';
import { formatRupiah } from '../utils/formatters';

interface InventoryViewProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onAddProduct?: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  theme: AppTheme;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onUpdateStock,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  theme
}) => {
  const isDark = theme === 'glacier-dark';
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for editing / deleting from inventory
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

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

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = filterLowStockOnly ? p.stock <= 5 : true;
    return matchesSearch && matchesStock;
  });

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

  return (
    <div id="inventory-view" className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Manajemen Stok &amp; Inventori
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau ketersediaan barang, lakukan restock cepat, edit detail atau tambahkan produk baru.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-56">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari SKU atau nama..."
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Toggle Low Stock */}
          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
              filterLowStockOnly
                ? 'bg-red-500 text-white border-red-500'
                : isDark
                ? 'border-slate-700 text-slate-300 hover:bg-white/5'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Stok Menipis (≤5)</span>
          </button>

          {/* Add Product Button if supported */}
          {onAddProduct && (
            <button
              onClick={openAddModal}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Tambah Produk</span>
            </button>
          )}
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`p-4 rounded-xl border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Jenis Produk</p>
          <p className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
            {products.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">SKU Aktif di Katalog</p>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Stok Aman</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {products.filter((p) => p.stock > 5).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Stok mencukupi (&gt;5)</p>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Perlu Restock</p>
          <p className="text-2xl font-bold font-mono text-red-500 mt-1">
            {products.filter((p) => p.stock <= 5).length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Habis atau kritis (&le;5)</p>
        </div>
      </div>

      {/* Stock Table */}
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
                <th className="p-4 text-center">Restock Cepat</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada produk yang cocok dengan pencarian atau filter stok.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const isCritical = prod.stock <= 0;
                  const isLow = prod.stock > 0 && prod.stock <= 5;
                  return (
                    <tr
                      key={prod.id}
                      className={`transition-colors ${
                        isCritical
                          ? 'bg-red-50/50 dark:bg-red-950/20'
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
                              ? 'text-red-600'
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
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
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
                            onClick={() => onUpdateStock(prod.id, prod.stock + 50)}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                            title="Restock +50"
                          >
                            +50
                          </button>
                        </div>
                      </td>
                      {/* Action Edit & Delete */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onUpdateProduct && (
                            <button
                              onClick={() => openEditModal(prod)}
                              title="Edit Detail Produk"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                          )}
                          {onDeleteProduct && (
                            <button
                              onClick={() => setProductToDelete(prod)}
                              title="Hapus Produk"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
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

      {/* Modal Add / Edit Product in Inventory */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className={`relative rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border p-6 space-y-4 ${
              isDark ? 'bg-[#0f1524] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base">
                {editingProduct ? `Edit Produk: ${editingProduct.name}` : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-red-500 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Kopi Susu Aren"
                  className={`w-full px-3 py-2 rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border outline-none font-mono ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                    className={`w-full px-3 py-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  >
                    <option value="Alat Tulis">Alat Tulis</option>
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border outline-none font-mono ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{formatRupiah(formData.price)}</span>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Jumlah Stok</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-lg border outline-none font-mono ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">URL Gambar (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-lg font-semibold border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div
            className={`rounded-xl shadow-2xl w-full max-w-md border p-6 space-y-4 ${
              isDark ? 'bg-[#0f1524] border-red-500/30 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="text-base font-bold">Hapus Produk dari Inventori</h3>
                <p className="text-xs text-slate-400">Konfirmasi penghapusan produk</p>
              </div>
            </div>

            <p className="text-xs">
              Yakin ingin menghapus <strong>{productToDelete.name}</strong> (SKU: {productToDelete.sku})?
              Data akan dihapus permanen dari inventori dan database cloud Turso.
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
                  if (onDeleteProduct) {
                    onDeleteProduct(productToDelete.id);
                  }
                  setProductToDelete(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
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
