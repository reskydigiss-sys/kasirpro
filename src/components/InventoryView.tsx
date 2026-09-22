import React, { useState } from 'react';
import { Product, AppTheme } from '../types';
import { formatRupiah } from '../utils/formatters';

interface InventoryViewProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  theme: AppTheme;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onUpdateStock,
  theme
}) => {
  const isDark = theme === 'glacier-dark';
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = filterLowStockOnly ? p.stock <= 5 : true;
    return matchesSearch && matchesStock;
  });

  return (
    <div id="inventory-view" className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Manajemen Stok &amp; Inventori
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau dan lakukan restock inventori secara instan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari SKU atau nama produk..."
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none ${
                isDark
                  ? 'bg-slate-900 border-sky-400/20 text-slate-100 placeholder:text-slate-500 focus:border-sky-400'
                  : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Toggle Low Stock */}
          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
              filterLowStockOnly
                ? 'bg-red-500 text-white border-red-500'
                : isDark
                ? 'border-slate-700 text-slate-300 hover:bg-white/5'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>Hanya Stok Menipis (≤5)</span>
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div
        className={`rounded-xl border overflow-hidden shadow-xs ${
          isDark ? 'glass-panel text-slate-100' : 'bg-white border-slate-200'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead
              className={`border-b text-xs font-semibold ${
                isDark ? 'bg-slate-900/60 border-sky-400/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <tr>
                <th className="p-4">SKU</th>
                <th className="p-4">Nama Produk</th>
                <th className="p-4">Kategori</th>
                <th className="p-4 text-right">Harga Jual</th>
                <th className="p-4 text-center">Stok Saat Ini</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Aksi Cepat Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((prod) => {
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
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onUpdateStock(prod.id, Math.max(0, prod.stock - 1))}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-600 dark:text-slate-300"
                          title="Kurangi 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => onUpdateStock(prod.id, prod.stock + 1)}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-600 dark:text-slate-300"
                          title="Tambah 1"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => onUpdateStock(prod.id, prod.stock + 10)}
                          className="px-2.5 py-1 rounded bg-blue-50 dark:bg-sky-950/60 text-blue-600 dark:text-sky-300 hover:bg-blue-100 text-xs font-bold"
                          title="Restock +10"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => onUpdateStock(prod.id, prod.stock + 50)}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                          title="Restock +50"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
