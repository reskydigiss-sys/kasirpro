import React, { useState, useMemo } from 'react';
import { Product, AppTheme, CategoryItem } from '../types';
import { formatRupiah } from '../utils/formatters';

interface CategoryViewProps {
  products: Product[];
  categories: CategoryItem[];
  theme: AppTheme;
  onNavigateToProducts: (category: string) => void;
  onAddCategory?: (category: Omit<CategoryItem, 'id'>) => Promise<void> | void;
  onUpdateCategory?: (category: CategoryItem, oldName?: string) => Promise<void> | void;
  onDeleteCategory?: (id: string, fallbackCategory?: string) => Promise<void> | void;
}

// Available icon options with friendly names
const AVAILABLE_ICONS = [
  { icon: 'local_cafe', label: 'Kafe / Kopi' },
  { icon: 'restaurant', label: 'Makanan / Kuliner' },
  { icon: 'edit_note', label: 'Alat Tulis / ATK' },
  { icon: 'category', label: 'Kategori Umum' },
  { icon: 'shopping_bag', label: 'Belanja / Retail' },
  { icon: 'inventory_2', label: 'Barang / Paket' },
  { icon: 'fastfood', label: 'Fast Food / Camilan' },
  { icon: 'menu_book', label: 'Buku / Dokumen' },
  { icon: 'devices', label: 'Elektronik & Gadget' },
  { icon: 'checkroom', label: 'Fashion / Pakaian' },
  { icon: 'medication', label: 'Obat & Farmasi' },
  { icon: 'spa', label: 'Kecantikan / Skincare' },
  { icon: 'build', label: 'Perkakas / Hardware' },
  { icon: 'sports_esports', label: 'Hobi & Game' },
  { icon: 'cleaning_services', label: 'Kebersihan' },
  { icon: 'eco', label: 'Organik / Segar' },
  { icon: 'cake', label: 'Kue & Bakery' },
  { icon: 'icecream', label: 'Es Krim & Dessert' }
];

// Available color presets
const AVAILABLE_COLORS = [
  { name: 'emerald', label: 'Hijau Emerald', bgLight: 'bg-emerald-50 text-emerald-600 border-emerald-200', bgDark: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30', ring: 'ring-emerald-500', hex: '#10b981' },
  { name: 'amber', label: 'Kuning Amber', bgLight: 'bg-amber-50 text-amber-600 border-amber-200', bgDark: 'bg-amber-950/50 text-amber-400 border-amber-500/30', ring: 'ring-amber-500', hex: '#f59e0b' },
  { name: 'blue', label: 'Biru Samudera', bgLight: 'bg-blue-50 text-blue-600 border-blue-200', bgDark: 'bg-sky-950/50 text-sky-400 border-sky-500/30', ring: 'ring-blue-500', hex: '#3b82f6' },
  { name: 'purple', label: 'Ungu Lavender', bgLight: 'bg-purple-50 text-purple-600 border-purple-200', bgDark: 'bg-purple-950/50 text-purple-400 border-purple-500/30', ring: 'ring-purple-500', hex: '#a855f7' },
  { name: 'rose', label: 'Merah Rose', bgLight: 'bg-rose-50 text-rose-600 border-rose-200', bgDark: 'bg-rose-950/50 text-rose-400 border-rose-500/30', ring: 'ring-rose-500', hex: '#f43f5e' },
  { name: 'indigo', label: 'Nila Indigo', bgLight: 'bg-indigo-50 text-indigo-600 border-indigo-200', bgDark: 'bg-indigo-950/50 text-indigo-400 border-indigo-500/30', ring: 'ring-indigo-500', hex: '#6366f1' },
  { name: 'teal', label: 'Teal Laut', bgLight: 'bg-teal-50 text-teal-600 border-teal-200', bgDark: 'bg-teal-950/50 text-teal-400 border-teal-500/30', ring: 'ring-teal-500', hex: '#14b8a6' },
  { name: 'orange', label: 'Oranye Hangat', bgLight: 'bg-orange-50 text-orange-600 border-orange-200', bgDark: 'bg-orange-950/50 text-orange-400 border-orange-500/30', ring: 'ring-orange-500', hex: '#f97316' },
  { name: 'cyan', label: 'Sian Cerah', bgLight: 'bg-cyan-50 text-cyan-600 border-cyan-200', bgDark: 'bg-cyan-950/50 text-cyan-400 border-cyan-500/30', ring: 'ring-cyan-500', hex: '#06b6d4' }
];

export const CategoryView: React.FC<CategoryViewProps> = ({
  products,
  categories,
  theme,
  onNavigateToProducts,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const isDark = theme === 'glacier-dark';

  // View mode: 'grid' (cards) vs 'table' (daftar tabel list)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'products' | 'valuation'>('products');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('category');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('blue');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fallback category for deletion
  const [fallbackCategoryName, setFallbackCategoryName] = useState('Lainnya');

  // Helper to get color classes
  const getColorMeta = (colorName: string) => {
    return AVAILABLE_COLORS.find((c) => c.name === colorName) || AVAILABLE_COLORS[2]; // default blue
  };

  // Compute category statistics
  const categoriesWithStats = useMemo(() => {
    return categories.map((cat) => {
      const catProducts = products.filter(
        (p) => (p.category || '').toLowerCase() === cat.name.toLowerCase()
      );
      const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
      const totalValuation = catProducts.reduce(
        (sum, p) => sum + p.stock * p.price,
        0
      );

      return {
        ...cat,
        productsCount: catProducts.length,
        totalStock,
        totalValuation
      };
    });
  }, [categories, products]);

  // Filter & sort categories
  const filteredCategories = useMemo(() => {
    let list = categoriesWithStats.filter((cat) => {
      const q = searchQuery.toLowerCase();
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'products') {
      list.sort((a, b) => b.productsCount - a.productsCount);
    } else if (sortBy === 'valuation') {
      list.sort((a, b) => b.totalValuation - a.totalValuation);
    }

    return list;
  }, [categoriesWithStats, searchQuery, sortBy]);

  // Overall KPI
  const totalCategories = categories.length;
  const totalProducts = products.length;
  const totalInventoryValuation = products.reduce((sum, p) => sum + p.stock * p.price, 0);
  const topCategory = useMemo(() => {
    if (categoriesWithStats.length === 0) return null;
    return [...categoriesWithStats].sort((a, b) => b.productsCount - a.productsCount)[0];
  }, [categoriesWithStats]);

  // Modal handlers
  const handleOpenAdd = () => {
    setFormName('');
    setFormIcon('category');
    setFormDescription('');
    setFormColor('blue');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon || 'category');
    setFormDescription(cat.description || '');
    setFormColor(cat.color || 'blue');
    setFormError('');
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Nama kategori wajib diisi');
      return;
    }

    // Check duplicate
    const exists = categories.some(
      (c) => c.name.toLowerCase().trim() === formName.toLowerCase().trim()
    );
    if (exists) {
      setFormError(`Kategori "${formName}" sudah ada`);
      return;
    }

    setFormSubmitting(true);
    setFormError('');
    try {
      if (onAddCategory) {
        await onAddCategory({
          name: formName.trim(),
          icon: formIcon,
          description: formDescription.trim(),
          color: formColor
        });
      }
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan kategori');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!formName.trim()) {
      setFormError('Nama kategori wajib diisi');
      return;
    }

    const oldName = editingCategory.name;
    const isNameChanged = oldName.toLowerCase() !== formName.toLowerCase().trim();

    if (isNameChanged) {
      const exists = categories.some(
        (c) =>
          c.id !== editingCategory.id &&
          c.name.toLowerCase().trim() === formName.toLowerCase().trim()
      );
      if (exists) {
        setFormError(`Kategori "${formName}" sudah digunakan`);
        return;
      }
    }

    setFormSubmitting(true);
    setFormError('');
    try {
      if (onUpdateCategory) {
        await onUpdateCategory(
          {
            ...editingCategory,
            name: formName.trim(),
            icon: formIcon,
            description: formDescription.trim(),
            color: formColor
          },
          oldName
        );
      }
      setEditingCategory(null);
    } catch (err: any) {
      setFormError(err.message || 'Gagal memperbarui kategori');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setFormSubmitting(true);
    try {
      if (onDeleteCategory) {
        await onDeleteCategory(categoryToDelete.id, fallbackCategoryName);
      }
      setCategoryToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus kategori');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div id="category-crud-view" className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">category</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
                Sistem CRUD Kategori &amp; Daftarnya
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Kelola pengelompokan produk, tambah kategori baru, edit data, serta pantau ringkasan nilai aset.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Grid vs Table Daftarnya */}
          <div
            className={`flex items-center p-1 rounded-lg border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              id="btn-view-mode-grid"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? isDark
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tampilan Kartu Grid"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Kartu</span>
            </button>
            <button
              id="btn-view-mode-table"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? isDark
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tampilan Tabel Daftarnya Lengkap"
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              <span>Daftarnya</span>
            </button>
          </div>

          {/* Primary Create Button */}
          <button
            id="btn-add-new-category"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* Top KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Categories */}
        <div
          className={`rounded-xl p-4 border transition-colors ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Kategori</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">folder_copy</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">{totalCategories}</span>
            <span className="text-xs text-slate-400">kategori aktif</span>
          </div>
        </div>

        {/* Total Products */}
        <div
          className={`rounded-xl p-4 border transition-colors ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Produk Terkelompok</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">{totalProducts}</span>
            <span className="text-xs text-slate-400">produk total</span>
          </div>
        </div>

        {/* Total Valuation */}
        <div
          className={`rounded-xl p-4 border transition-colors ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Nilai Aset Total</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatRupiah(totalInventoryValuation)}
            </span>
          </div>
        </div>

        {/* Top Category */}
        <div
          className={`rounded-xl p-4 border transition-colors ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Kategori Terpopuler</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">star</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-base font-bold truncate block">
              {topCategory ? topCategory.name : '-'}
            </span>
            <span className="text-xs text-slate-400">
              {topCategory ? `${topCategory.productsCount} produk terdaftar` : 'Belum ada produk'}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Sort Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">
            search
          </span>
          <input
            id="input-search-category"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori berdasarkan nama atau deskripsi..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all outline-none border ${
              isDark
                ? 'bg-[#141c2e] border-slate-800 text-slate-100 placeholder:text-slate-400 focus:border-blue-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 text-xs"
            >
              Bersihkan
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 whitespace-nowrap">Urutkan:</span>
          <select
            id="select-sort-categories"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold outline-none border cursor-pointer ${
              isDark
                ? 'bg-[#141c2e] border-slate-800 text-slate-200'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="products">Produk Terbanyak</option>
            <option value="valuation">Nilai Aset Terbesar</option>
            <option value="name">Nama Kategori (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Content: Card Grid View */}
      {viewMode === 'grid' && (
        <div id="categories-grid-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCategories.map((cat) => {
            const colorMeta = getColorMeta(cat.color);

            return (
              <div
                key={cat.id}
                className={`rounded-xl p-5 border flex flex-col justify-between transition-all duration-150 hover:shadow-md ${
                  isDark
                    ? 'bg-[#111827] border-slate-800 text-slate-100 hover:border-slate-700'
                    : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Bar with Icon and Action Buttons */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform hover:scale-105 ${
                        isDark ? colorMeta.bgDark : colorMeta.bgLight
                      }`}
                    >
                      <span className="material-symbols-outlined text-[26px]">
                        {cat.icon || 'category'}
                      </span>
                    </div>

                    {/* Quick action buttons: Edit & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        title={`Edit Kategori ${cat.name}`}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors`}
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        title={`Hapus Kategori ${cat.name}`}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors`}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold tracking-tight truncate" title={cat.name}>
                      {cat.name}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                        cat.productsCount > 0
                          ? isDark
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                          : isDark
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {cat.productsCount} Produk
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                    {cat.description || 'Tidak ada deskripsi kategori.'}
                  </p>

                  {/* Inventory Numbers */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Stok Fisik:</span>
                      <span className="font-bold font-mono">{cat.totalStock} item</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Nilai Inventori:</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(cat.totalValuation)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Link to Products */}
                <button
                  onClick={() => onNavigateToProducts(cat.name)}
                  className={`mt-4 w-full py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    isDark
                      ? 'border-sky-400/30 text-sky-300 hover:bg-sky-950/40'
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span>Lihat Produk ({cat.productsCount})</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Content: Table Daftarnya View */}
      {viewMode === 'table' && (
        <div
          id="categories-table-container"
          className={`rounded-xl border shadow-xs overflow-hidden ${
            isDark ? 'bg-[#0f1524] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-xs font-semibold uppercase tracking-wider ${
                    isDark
                      ? 'border-slate-800 text-slate-400 bg-slate-900/60'
                      : 'border-slate-200 text-slate-600 bg-slate-50'
                  }`}
                >
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Kategori &amp; Ikon</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4 text-center">Jumlah Produk</th>
                  <th className="py-3 px-4 text-center">Total Stok</th>
                  <th className="py-3 px-4 text-right">Nilai Aset</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <span className="material-symbols-outlined text-[48px] mb-2 opacity-50 block">
                        search_off
                      </span>
                      Tidak ada kategori yang cocok dengan pencarian "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat, idx) => {
                    const colorMeta = getColorMeta(cat.color);

                    return (
                      <tr
                        key={cat.id}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4 text-center text-xs font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                                isDark ? colorMeta.bgDark : colorMeta.bgLight
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {cat.icon || 'category'}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100">
                                {cat.name}
                              </p>
                              <span className="text-[11px] font-mono text-slate-400">
                                ID: {cat.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {cat.description || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              cat.productsCount > 0
                                ? isDark
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {cat.productsCount}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-xs font-semibold">
                          {cat.totalStock} item
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(cat.totalValuation)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onNavigateToProducts(cat.name)}
                              title="Buka Produk Kategori Ini"
                              className="px-2 py-1 rounded text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 transition-colors cursor-pointer"
                            >
                              Produk
                            </button>
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              title="Edit Kategori"
                              className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => setCategoryToDelete(cat)}
                              title="Hapus Kategori"
                              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
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
        </div>
      )}

      {/* Modal: Tambah Kategori Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-in fade-in-50 duration-150">
          <div
            className={`w-full max-w-lg rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh] ${
              isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-[#0e1422]' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </div>
                <h3 className="font-bold text-base">Tambah Kategori Produk Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAdd} className="p-6 overflow-y-auto flex-1 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                  {formError}
                </div>
              )}

              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold mb-1.5">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Makanan Ringan, Minuman Dingin, Elektronik..."
                  className={`w-full px-3.5 py-2.5 rounded-lg text-sm border outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  }`}
                  autoFocus
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-bold mb-1.5">Pilih Ikon</label>
                <div className="grid grid-cols-6 gap-2 p-2 rounded-lg border max-h-36 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                  {AVAILABLE_ICONS.map((item) => (
                    <button
                      key={item.icon}
                      type="button"
                      onClick={() => setFormIcon(item.icon)}
                      title={item.label}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        formIcon === item.icon
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105'
                          : isDark
                          ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Preset Palette */}
              <div>
                <label className="block text-xs font-bold mb-1.5">Warna Aksen</label>
                <div className="flex flex-wrap gap-2.5">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setFormColor(c.name)}
                      title={c.label}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        formColor === c.name
                          ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {formColor === c.name && (
                        <span className="material-symbols-outlined text-white text-[16px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Chip */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-slate-400">Pratinjau Kategori</label>
                {(() => {
                  const cm = getColorMeta(formColor);
                  return (
                    <div
                      className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                          isDark ? cm.bgDark : cm.bgLight
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">{formIcon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm">{formName || 'Nama Kategori Baru'}</p>
                        <p className="text-xs text-slate-400">
                          {formDescription || 'Deskripsi singkat kategori akan tampil di sini'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold mb-1.5">Deskripsi Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan singkat tentang kelompok produk ini..."
                  className={`w-full px-3.5 py-2 rounded-lg text-sm border outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'Menyimpan...' : 'Simpan Kategori Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Kategori */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-in fade-in-50 duration-150">
          <div
            className={`w-full max-w-lg rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh] ${
              isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-[#0e1422]' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit Kategori: {editingCategory.name}</h3>
                  <span className="text-[11px] text-slate-400">ID: {editingCategory.id}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                  {formError}
                </div>
              )}

              {/* Informative Note */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>
                  Jika Anda mengganti nama kategori, semua produk yang menggunakan kategori lama akan otomatis diperbarui.
                </span>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold mb-1.5">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg text-sm border outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-bold mb-1.5">Pilih Ikon</label>
                <div className="grid grid-cols-6 gap-2 p-2 rounded-lg border max-h-36 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                  {AVAILABLE_ICONS.map((item) => (
                    <button
                      key={item.icon}
                      type="button"
                      onClick={() => setFormIcon(item.icon)}
                      title={item.label}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        formIcon === item.icon
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105'
                          : isDark
                          ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Preset Palette */}
              <div>
                <label className="block text-xs font-bold mb-1.5">Warna Aksen</label>
                <div className="flex flex-wrap gap-2.5">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setFormColor(c.name)}
                      title={c.label}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        formColor === c.name
                          ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {formColor === c.name && (
                        <span className="material-symbols-outlined text-white text-[16px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold mb-1.5">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan singkat tentang kelompok produk ini..."
                  className={`w-full px-3.5 py-2 rounded-lg text-sm border outline-none transition-all ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'Memperbarui...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Kategori */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-in fade-in-50 duration-150">
          <div
            className={`w-full max-w-md rounded-xl shadow-xl border overflow-hidden p-6 space-y-4 ${
              isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <div>
                <h3 className="font-bold text-base">Hapus Kategori?</h3>
                <p className="text-xs text-slate-400">
                  Kategori: <strong>{categoryToDelete.name}</strong>
                </p>
              </div>
            </div>

            {/* Warning if category has products */}
            {(() => {
              const count = products.filter(
                (p) => (p.category || '').toLowerCase() === categoryToDelete.name.toLowerCase()
              ).length;

              return (
                <div
                  className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                    count > 0
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count > 0 ? (
                    <>
                      <strong>Perhatian:</strong> Kategori ini memiliki <strong>{count} produk</strong> aktif.
                      Produk-produk tersebut akan dialihkan ke kategori alternatif agar tidak hilang.
                      <div className="mt-2.5">
                        <label className="block font-semibold mb-1 text-[11px]">
                          Pindahkan produk terkait ke kategori:
                        </label>
                        <select
                          value={fallbackCategoryName}
                          onChange={(e) => setFallbackCategoryName(e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded border text-xs outline-none ${
                            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        >
                          {categories
                            .filter((c) => c.id !== categoryToDelete.id)
                            .map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          <option value="Lainnya">Lainnya (Default)</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <span>Kategori ini kosong (0 produk) dan aman untuk langsung dihapus.</span>
                  )}
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={formSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {formSubmitting ? 'Menghapus...' : 'Ya, Hapus Kategori'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
