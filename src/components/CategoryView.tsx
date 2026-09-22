import React from 'react';
import { Product, AppTheme, CategoryType, ActiveTab } from '../types';
import { formatRupiah } from '../utils/formatters';

interface CategoryViewProps {
  products: Product[];
  theme: AppTheme;
  onNavigateToProducts: (category: string) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  products,
  theme,
  onNavigateToProducts
}) => {
  const isDark = theme === 'glacier-dark';

  const categoryMeta: {
    name: CategoryType;
    icon: string;
    description: string;
    color: string;
    bgLight: string;
    bgDark: string;
  }[] = [
    {
      name: 'Minuman',
      icon: 'local_cafe',
      description: 'Kopi, teh, jus buah, dan aneka minuman segar',
      color: 'text-emerald-500',
      bgLight: 'bg-emerald-50 text-emerald-600',
      bgDark: 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
    },
    {
      name: 'Makanan',
      icon: 'restaurant',
      description: 'Croissant, roti panggang, spaghetti, dan snack',
      color: 'text-amber-500',
      bgLight: 'bg-amber-50 text-amber-600',
      bgDark: 'bg-amber-950/50 text-amber-400 border-amber-500/30'
    },
    {
      name: 'Alat Tulis',
      icon: 'edit_note',
      description: 'Buku catatan, pensil, pulpen, penghapus, dan atk kantor',
      color: 'text-blue-500',
      bgLight: 'bg-blue-50 text-blue-600',
      bgDark: 'bg-sky-950/50 text-sky-400 border-sky-500/30'
    },
    {
      name: 'Lainnya',
      icon: 'category',
      description: 'Aksesoris tumbler, tote bag, merchandise dan packaging',
      color: 'text-purple-500',
      bgLight: 'bg-purple-50 text-purple-600',
      bgDark: 'bg-purple-950/50 text-purple-400 border-purple-500/30'
    }
  ];

  return (
    <div id="category-view" className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Kategori Produk</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pengelompokan produk dan ringkasan nilai aset per kategori.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {categoryMeta.map((cat) => {
          const catProducts = products.filter((p) => p.category === cat.name);
          const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
          const totalValuation = catProducts.reduce(
            (sum, p) => sum + p.stock * p.price,
            0
          );

          return (
            <div
              key={cat.name}
              className={`rounded-xl p-5 border flex flex-col justify-between transition-colors ${
                isDark
                  ? 'bg-[#111827] border-slate-800 text-slate-100 hover:border-slate-700'
                  : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                      isDark ? cat.bgDark : cat.bgLight
                    }`}
                  >
                    <span className="material-symbols-outlined text-[26px]">
                      {cat.icon}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {catProducts.length} Produk
                  </span>
                </div>

                <h3 className="text-base font-bold">{cat.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {cat.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Stok Fisik:</span>
                    <span className="font-bold">{totalStock} item</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nilai Inventori:</span>
                    <span className="font-bold">{formatRupiah(totalValuation)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateToProducts(cat.name)}
                className={`mt-5 w-full py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center ${
                  isDark
                    ? 'border-sky-400/30 text-sky-300 hover:bg-sky-950/40'
                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                Lihat Daftar Produk
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
