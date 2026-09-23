import React, { useState } from 'react';
import { Product, CategoryType, AppTheme } from '../types';
import { formatRupiah } from '../utils/formatters';

interface ProductListProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  theme: AppTheme;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  theme
}) => {
  const isDark = theme === 'glacier-dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Kategori');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Minuman' as CategoryType,
    price: 0,
    stock: 0,
    imageUrl: '',
    description: ''
  });

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Semua Kategori' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Minuman',
      price: 20000,
      stock: 50,
      imageUrl: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      price: prod.price,
      stock: prod.stock,
      imageUrl: prod.imageUrl,
      description: prod.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) return;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...formData
      });
    } else {
      onAddProduct(formData);
    }
    setIsModalOpen(false);
  };

  const getCategoryBadgeClass = (category: CategoryType) => {
    switch (category) {
      case 'Minuman':
        return isDark
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          : 'bg-emerald-100 text-emerald-800';
      case 'Makanan':
        return isDark
          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          : 'bg-amber-100 text-amber-800';
      case 'Alat Tulis':
        return isDark
          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
          : 'bg-blue-100 text-blue-800';
      default:
        return isDark
          ? 'bg-slate-700/50 text-slate-300 border border-slate-600'
          : 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div id="product-list-page" className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Actions Toolbar: Search & Filters + Primary Action */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">
              search
            </span>
            <input
              id="input-search-product"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk, SKU..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all outline-none border ${
                isDark
                  ? 'bg-[#141c2e] border-sky-400/20 text-slate-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-400'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Category Dropdown */}
          <select
            id="select-filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full sm:w-48 px-3.5 py-2 rounded-lg text-sm outline-none border transition-all cursor-pointer ${
              isDark
                ? 'bg-[#141c2e] border-sky-400/20 text-slate-100 focus:border-sky-400'
                : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
            }`}
          >
            <option value="Semua Kategori">Semua Kategori</option>
            <option value="Alat Tulis">Alat Tulis</option>
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        {/* Primary Action Button */}
        <button
          id="btn-add-product"
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Data Table Container */}
      <div
        id="products-table-container"
        className={`rounded-xl border shadow-sm overflow-hidden ${
          isDark
            ? 'bg-[#0f1524]/80 backdrop-blur-md border-sky-400/15'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-xs font-semibold uppercase tracking-wider ${
                  isDark
                    ? 'bg-[#141c2e]/70 border-sky-400/10 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <th className="px-6 py-4 w-20">Gambar</th>
                <th className="px-6 py-4">Nama Produk</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Harga</th>
                <th className="px-6 py-4 text-center">Stok</th>
                <th className="px-6 py-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody
              className={`text-sm divide-y ${
                isDark ? 'divide-sky-400/10 text-slate-200' : 'divide-slate-100 text-slate-800'
              }`}
            >
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada produk yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isOutOfStock = prod.stock <= 0;
                  return (
                    <tr
                      key={prod.id}
                      id={`product-row-${prod.id}`}
                      className={`transition-colors ${
                        isOutOfStock
                          ? isDark
                            ? 'bg-red-950/10 opacity-75'
                            : 'bg-slate-50/60'
                          : isDark
                          ? 'hover:bg-white/5'
                          : 'hover:bg-blue-50/40'
                      }`}
                    >
                      {/* Gambar */}
                      <td className="px-6 py-3.5">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-sky-400/20 bg-white"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-sky-400/20 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-[24px]">image</span>
                          </div>
                        )}
                      </td>

                      {/* Nama Produk */}
                      <td className="px-6 py-3.5 font-semibold">
                        <span className={isOutOfStock ? 'text-slate-400 line-through' : ''}>
                          {prod.name}
                        </span>
                        {isOutOfStock && (
                          <span className="ml-2 inline-block text-[10px] font-bold text-red-500 uppercase">
                            (Habis)
                          </span>
                        )}
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {prod.sku}
                      </td>

                      {/* Kategori */}
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryBadgeClass(
                            prod.category
                          )}`}
                        >
                          {prod.category}
                        </span>
                      </td>

                      {/* Harga */}
                      <td className="px-6 py-3.5 text-right font-semibold">
                        {formatRupiah(prod.price)}
                      </td>

                      {/* Stok */}
                      <td className="px-6 py-3.5 text-center">
                        {isOutOfStock ? (
                          <span className="text-red-500 font-bold">0</span>
                        ) : (
                          <span
                            className={`font-bold ${
                              isDark ? 'text-sky-400' : 'text-blue-600'
                            }`}
                          >
                            {prod.stock}
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`btn-edit-prod-${prod.id}`}
                            onClick={() => openEditModal(prod)}
                            title="Edit Produk"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-sky-400/10 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            id={`btn-delete-prod-${prod.id}`}
                            onClick={() => setProductToDelete(prod)}
                            title="Hapus Produk"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching mockup */}
        <div
          id="products-table-footer"
          className={`px-6 py-3.5 border-t flex items-center justify-between text-xs ${
            isDark
              ? 'bg-[#141c2e]/60 border-sky-400/10 text-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          <span>
            Menampilkan 1-{filteredProducts.length} dari {products.length} produk
          </span>
          <div className="flex gap-2">
            <button
              disabled
              className="p-1 rounded border border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              disabled
              className="p-1 rounded border border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div
          id="modal-add-product"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div
            className={`relative rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 border ${
              isDark
                ? 'bg-[#0f1524] border-sky-400/20 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b flex justify-between items-center ${
                isDark ? 'bg-[#141c2e] border-sky-400/10' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <h3 className="text-lg font-bold">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                id="btn-close-product-modal"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 p-1 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Gambar Produk */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                  Gambar Produk
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center transition-colors ${
                    isDark
                      ? 'border-sky-400/30 bg-[#141c2e]/40 hover:bg-[#141c2e]/70'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  {formData.imageUrl ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg shadow-sm border border-slate-200 mb-2"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-sky-950/60 rounded-full flex items-center justify-center mb-2 text-blue-600 dark:text-sky-300">
                        <span className="material-symbols-outlined text-[28px]">add_photo_alternate</span>
                      </div>
                      <p className="text-xs text-slate-500 text-center">
                        Masukkan URL gambar atau pilih sampel siap pakai di bawah
                      </p>
                    </>
                  )}
                  <input
                    type="url"
                    placeholder="Atau tempel URL gambar (https://...)"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className={`mt-3 w-full text-xs px-3 py-1.5 rounded border outline-none ${
                      isDark
                        ? 'bg-[#0a0e1a] border-slate-700 text-slate-200 focus:border-sky-400'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                  {/* Preset quick image selection */}
                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 w-full justify-center">
                    <span className="text-[11px] text-slate-400 self-center">Contoh Gambar:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          imageUrl:
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuD96knqKpQAet_lXQPRV6sCkSEx6F7eosde4IobltIvrqabj9-0OL_CYSt2xhnpRXvcLrlChrlcF7lzfjX0gbjr7ZjKV4WidIPortotIXqpeQulMv58Bq9nbU4sxEO2_qP5TxiMglJLrpwQn9XwppoJhM_PWQ_glRfg-PAOASaEspSDtDj9WVGCaL_VWB8kTPKtJswvcwF4HqCzu_VryiYhUoZxD8_WsjV_iaml3V_y6OknYf9kBAjYmA'
                        })
                      }
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
                    >
                      ☕ Kopi
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          imageUrl:
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuC8w8O4ZuebrJ0aJzYc7IKNQ_qJY8jmDdU1K_ORGkXJCSFZ2Y7Pp2M2Dbc40oHkl5tCB30jdedK7jLGeCqUwNV3NzJHt9A4x_3zl1bH_v7mRMcaApmtWkXM_n8z-mBnrQs_Fa0s97GhJZ1WzTn6g99HfxvVDEcXeumfvMvFnkIHD5JWCArR6gjtfNVQZRLpeNTXE9SLtZgKeqBgXYJ5MFfBlQI0DtcCyZ-cF2CPn7n6K9e6bANcw2-AQw'
                        })
                      }
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
                    >
                      🥐 Croissant
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          imageUrl:
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuAWW76GKrLBTCDPU-15OqGlAsg0ZdMyrp29rnjrATXZjjHbXh0cEgy-_de07xfSGXijdKHZcBwMfe6YZ6rL-SGyEFwJoXY_RhZegyY4H7QTkxuaWdHQgYE_Qg3dxFG6r9_VAzx1aLq_qDqM84lZf_BNaLRZ7SSl-MYGl-eyWH34Xu9km2bWeozfS2X-aBI1rLZT5zqWaHlwbpakHHh3pjttKBmmR24VicyDvyp2ReLndzUSsy_WTeaC5g'
                        })
                      }
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
                    >
                      📓 Buku
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Produk */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kopi Susu"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none ${
                      isDark
                        ? 'bg-[#141c2e] border-sky-400/20 text-slate-100 focus:border-sky-400'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: KOP-01"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none ${
                      isDark
                        ? 'bg-[#141c2e] border-sky-400/20 text-slate-100 focus:border-sky-400'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as CategoryType })
                    }
                    className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none cursor-pointer ${
                      isDark
                        ? 'bg-[#141c2e] border-sky-400/20 text-slate-100 focus:border-sky-400'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                    }`}
                  >
                    <option value="Minuman">Minuman</option>
                    <option value="Makanan">Makanan</option>
                    <option value="Alat Tulis">Alat Tulis</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Harga Jual */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Harga Jual (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) || 0 })
                    }
                    className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none ${
                      isDark
                        ? 'bg-[#141c2e] border-sky-400/20 text-slate-100 focus:border-sky-400'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Stok */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: Number(e.target.value) || 0 })
                    }
                    className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none ${
                      isDark
                        ? 'bg-[#141c2e] border-sky-400/20 text-slate-100 focus:border-sky-400'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Kosongkan atau isi 0 jika produk habis atau tidak melacak stok.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className={`pt-4 border-t flex justify-end gap-3 ${
                  isDark ? 'border-sky-400/10' : 'border-slate-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold border ${
                    isDark
                      ? 'border-slate-700 text-slate-300 hover:bg-white/5'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-save-product"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {productToDelete && (
        <div
          id="modal-delete-product-confirm"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div
            className={`relative rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 border p-6 space-y-4 ${
              isDark
                ? 'bg-[#0f1524] border-red-500/30 text-slate-100'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="text-base font-bold">Konfirmasi Hapus Produk</h3>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <p className="font-semibold text-sm">{productToDelete.name}</p>
              <div className="flex items-center gap-2 text-slate-500 font-mono">
                <span>SKU: {productToDelete.sku}</span>
                <span>·</span>
                <span>Stok: {productToDelete.stock}</span>
                <span>·</span>
                <span>{formatRupiah(productToDelete.price)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Produk ini akan dihapus permanen dari inventori toko dan cloud database Turso.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-delete-product"
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Ya, Hapus Produk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
