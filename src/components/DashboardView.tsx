import React from 'react';
import { Transaction, Product, AppTheme, ActiveTab } from '../types';
import { formatRupiah } from '../utils/formatters';
import { LOW_STOCK_ITEMS } from '../data/mockData';

interface DashboardViewProps {
  transactions: Transaction[];
  products: Product[];
  theme: AppTheme;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  products,
  theme,
  onNavigate
}) => {
  const isDark = theme === 'glacier-dark';

  // Compute live statistics based on transactions & products
  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalTxCount = transactions.length;
  const totalItemsSold = transactions.reduce(
    (sum, t) => sum + t.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );
  const lowStockCount = products.filter((p) => p.stock <= 5).length + LOW_STOCK_ITEMS.length;

  // Chart data days
  const dailyData = [
    { day: 'Sen', value: 30, amount: 'Rp 650.000', height: '35%' },
    { day: 'Sel', value: 45, amount: 'Rp 890.000', height: '50%' },
    { day: 'Rab', value: 40, amount: 'Rp 780.000', height: '45%' },
    { day: 'Kam', value: 65, amount: 'Rp 1.250.000', height: '75%', isPeak: true },
    { day: 'Jum', value: 25, amount: 'Rp 540.000', height: '30%' },
    { day: 'Sab', value: 15, amount: 'Rp 320.000', height: '20%' },
    { day: 'Min', value: 10, amount: 'Rp 210.000', height: '15%' }
  ];

  const recentTransactions = transactions.slice(0, 4);

  return (
    <div id="dashboard-view" className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {isDark ? 'Ringkasan Hari Ini' : 'Dashboard Penjualan'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pantau performa penjualan dan stok terkini secara real-time.
        </p>
      </div>

      {/* Metrics Grid (4 KPI Cards) */}
      <section
        id="dashboard-kpi-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: Total Penjualan */}
        <div
          id="kpi-total-sales"
          className={`rounded-xl p-5 border relative overflow-hidden transition-colors ${
            isDark
              ? 'bg-[#111827] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Total Penjualan Hari Ini
              </p>
              <h3
                className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {formatRupiah(totalSales || 1250000)}
              </h3>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-blue-950/60 text-blue-400 border border-blue-900/60' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+12.5% vs kemarin</span>
          </div>
        </div>

        {/* Card 2: Total Transaksi */}
        <div
          id="kpi-total-transactions"
          className={`rounded-xl p-5 border relative overflow-hidden transition-colors ${
            isDark
              ? 'bg-[#111827] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Total Transaksi Hari Ini
              </p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {totalTxCount || 48}{' '}
                <span className="text-xs font-normal text-slate-400 font-sans">Transaksi</span>
              </h3>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-purple-950/50 text-purple-400 border border-purple-900/60' : 'bg-purple-50 text-purple-600'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+5 transaksi</span>
          </div>
        </div>

        {/* Card 3: Produk Terjual */}
        <div
          id="kpi-items-sold"
          className={`rounded-xl p-5 border relative overflow-hidden transition-colors ${
            isDark
              ? 'bg-[#111827] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Produk Terjual
              </p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {totalItemsSold || 127}{' '}
                <span className="text-xs font-normal text-slate-400 font-sans">Item</span>
              </h3>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-900/60' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span className="material-symbols-outlined text-sm">horizontal_rule</span>
            <span>Stabil</span>
          </div>
        </div>

        {/* Card 4: Stok Menipis */}
        <div
          id="kpi-low-stock"
          className={`rounded-xl p-5 border relative overflow-hidden transition-colors ${
            isDark
              ? 'bg-[#18151f] border-rose-900/50 text-rose-200'
              : 'bg-rose-50/50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
                Stok Menipis
              </p>
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                {lowStockCount || 6}{' '}
                <span className="text-xs font-normal opacity-80 font-sans">Produk</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>Perlu restock segera</span>
          </div>
        </div>
      </section>

      {/* Charts Section: Tren Penjualan Harian + Kategori Terlaris */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line / Bar Chart: Daily Sales Trend */}
        <div
          id="chart-daily-sales"
          className={`lg:col-span-2 rounded-xl p-5 sm:p-6 border flex flex-col justify-between ${
            isDark
              ? 'bg-[#111827] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg">Tren Penjualan Harian</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ringkasan transaksi 7 hari terakhir</p>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-md font-semibold border ${
                isDark
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Minggu Ini
            </span>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="h-60 sm:h-64 w-full flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6 pb-2 pt-6 relative border-b border-slate-200 dark:border-slate-800">
            {/* Background grid lines */}
            <div className="absolute inset-x-0 top-1/4 h-px border-b border-dashed border-slate-200 dark:border-slate-800/60 pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 h-px border-b border-dashed border-slate-200 dark:border-slate-800/60 pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 h-px border-b border-dashed border-slate-200 dark:border-slate-800/60 pointer-events-none" />

            {dailyData.map((item) => (
              <div
                key={item.day}
                className="flex-1 flex flex-col items-center justify-end h-full gap-2 relative group"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-white text-[10px] font-mono whitespace-nowrap shadow-md pointer-events-none z-10">
                  {item.amount}
                </div>

                {/* Bar */}
                <div
                  style={{ height: item.height }}
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-200 cursor-pointer ${
                    item.isPeak
                      ? 'bg-blue-600 shadow-xs'
                      : isDark
                      ? 'bg-slate-700 hover:bg-slate-600'
                      : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                />

                {/* Day label */}
                <span
                  className={`text-xs font-mono ${
                    item.isPeak
                      ? 'text-blue-500 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kategori Terlaris / Category Share */}
        <div
          id="chart-category-share"
          className={`rounded-xl p-5 sm:p-6 border flex flex-col justify-between ${
            isDark
              ? 'bg-[#111827] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="mb-4">
            <h3 className="font-display font-bold text-base sm:text-lg">Kategori Terlaris</h3>
            <p className="text-xs text-slate-400 mt-0.5">Berdasarkan volume penjualan</p>
          </div>

          <div className="space-y-4 my-auto">
            {/* Minuman Dingin */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Minuman Dingin</span>
                <span className="font-mono text-blue-500">45%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: '45%' }}
                />
              </div>
            </div>

            {/* Makanan Ringan */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Makanan Ringan</span>
                <span className="font-mono text-purple-500">30%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-purple-600"
                  style={{ width: '30%' }}
                />
              </div>
            </div>

            {/* Kopi Susu */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Kopi Susu</span>
                <span className="font-mono text-emerald-500">15%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-emerald-600"
                  style={{ width: '15%' }}
                />
              </div>
            </div>

            {/* Lainnya */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Lainnya &amp; ATK</span>
                <span className="font-mono text-slate-400">10%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-slate-400" style={{ width: '10%' }} />
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('kategori')}
            className={`mt-4 text-xs font-semibold w-full py-2 rounded-lg border text-center transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 text-blue-600 hover:bg-slate-50'
            }`}
          >
            Lihat Detail Kategori
          </button>
        </div>
      </section>

      {/* Bottom Lists Section: Transaksi Terakhir + Stok Menipis */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions List */}
        <div
          id="dashboard-recent-transactions"
          className={`rounded-xl border overflow-hidden flex flex-col ${
            isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div
            className={`p-4 sm:p-5 border-b flex justify-between items-center ${
              isDark ? 'bg-[#0e1422] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h3 className="font-display font-bold text-base">Transaksi Terakhir</h3>
            <button
              onClick={() => onNavigate('riwayat')}
              className="text-xs font-semibold text-blue-500 hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead
                className={`border-b text-xs text-slate-500 font-semibold ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <tr>
                  <th className="px-5 py-3">ID Transaksi</th>
                  <th className="px-5 py-3">Waktu</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => onNavigate('riwayat')}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 font-mono font-semibold text-blue-500">
                      #{tx.id}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {tx.dateFormatted.split(',')[1] || tx.dateFormatted}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold">
                      {formatRupiah(tx.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert List */}
        <div
          id="dashboard-low-stock"
          className={`rounded-xl border overflow-hidden flex flex-col ${
            isDark ? 'bg-[#111827] border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div
            className={`p-4 sm:p-5 border-b flex justify-between items-center ${
              isDark ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' : 'bg-rose-50 border-rose-100 text-rose-900'
            }`}
          >
            <h3 className="font-display font-bold text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-rose-500">warning</span>
              <span>Stok Menipis</span>
            </h3>
            <button
              onClick={() => onNavigate('stok')}
              className="text-xs font-semibold hover:underline cursor-pointer"
            >
              Kelola Stok
            </button>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800 p-2 flex-1">
            {LOW_STOCK_ITEMS.slice(0, 4).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold">{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {item.category} • SKU: {item.sku}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold font-mono px-2.5 py-1 rounded-md border ${
                    item.remaining <= 2
                      ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900'
                      : 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900'
                  }`}
                >
                  Sisa {item.remaining}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
