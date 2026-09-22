import React from 'react';
import { Transaction, AppTheme } from '../types';
import { formatRupiah } from '../utils/formatters';

interface ReportsViewProps {
  transactions: Transaction[];
  theme: AppTheme;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ transactions, theme }) => {
  const isDark = theme === 'glacier-dark';

  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const avgTicket = transactions.length > 0 ? Math.round(totalRevenue / transactions.length) : 0;

  // Breakdown by payment method
  const methodStats = transactions.reduce(
    (acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.total;
      return acc;
    },
    {} as Record<string, number>
  );

  const exportCSV = () => {
    const headers = ['ID Transaksi', 'Waktu', 'Kasir', 'Metode', 'Subtotal', 'Diskon', 'Total'];
    const rows = transactions.map((t) => [
      t.id,
      t.dateFormatted,
      t.cashierName,
      t.paymentMethod,
      t.subtotal,
      t.discount,
      t.total
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan-Kasirku-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="reports-view" className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Laporan Keuangan &amp; Penjualan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analisis pendapatan, perputaran kas, dan pembukuan POS.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">file_download</span>
          <span>Ekspor Laporan (CSV)</span>
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          className={`p-5 rounded-xl border ${
            isDark ? 'glass-panel text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            Total Omset Keseluruhan
          </p>
          <h3
            className={`text-2xl font-black ${
              isDark ? 'text-sky-300 text-glow' : 'text-blue-600'
            }`}
          >
            {formatRupiah(totalRevenue)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Berdasarkan {transactions.length} transaksi tercatat
          </p>
        </div>

        <div
          className={`p-5 rounded-xl border ${
            isDark ? 'glass-panel text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            Rata-rata Nilai Transaksi (AOV)
          </p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {formatRupiah(avgTicket)}
          </h3>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1">
            Basket size optimal
          </p>
        </div>

        <div
          className={`p-5 rounded-xl border ${
            isDark ? 'glass-panel text-slate-100' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            Metode Pembayaran Terbanyak
          </p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            QRIS &amp; Tunai
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Dominan transaksi digital instan
          </p>
        </div>
      </div>

      {/* Methods breakdown */}
      <div
        className={`p-6 rounded-xl border ${
          isDark ? 'glass-panel text-slate-100' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <h3 className="font-bold text-base mb-4">Porsi Metode Pembayaran</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(methodStats).map(([method, amount]) => {
            const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
            return (
              <div
                key={method}
                className={`p-4 rounded-lg border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-xs">{method}</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-sky-300">
                    {pct}%
                  </span>
                </div>
                <p className="text-lg font-bold">{formatRupiah(amount)}</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-blue-600 dark:bg-sky-400 h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
