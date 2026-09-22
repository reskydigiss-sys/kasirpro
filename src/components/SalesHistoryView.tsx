import React, { useState, useMemo } from 'react';
import { Transaction, AppTheme, PaymentMethod } from '../types';
import { formatRupiah } from '../utils/formatters';

interface SalesHistoryViewProps {
  transactions: Transaction[];
  theme: AppTheme;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({ transactions, theme }) => {
  const isDark = theme === 'glacier-dark';
  const [selectedTxId, setSelectedTxId] = useState<string>(
    transactions.length > 0 ? transactions[0].id : ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isDetailOpen, setIsDetailOpen] = useState(true);

  // Active selected transaction
  const activeTx = useMemo(() => {
    return transactions.find((t) => t.id === selectedTxId) || transactions[0] || null;
  }, [transactions, selectedTxId]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

      // Method filter
      const matchesMethod =
        selectedMethod === 'all' ||
        tx.paymentMethod.toLowerCase() === selectedMethod.toLowerCase();

      // Date filter
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && tx.timestamp >= startDate;
      }
      if (endDate) {
        matchesDate = matchesDate && tx.timestamp <= endDate + 'T23:59:59Z';
      }

      return matchesSearch && matchesMethod && matchesDate;
    });
  }, [transactions, searchQuery, selectedMethod, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!activeTx) return;
    const receiptText = `
========================================
             KASIRKU POS
         Operational Center
========================================
Transaksi: #${activeTx.id}
Waktu:     ${activeTx.dateFormatted}
Kasir:     ${activeTx.cashierName}
----------------------------------------
ITEM PESANAN:
${activeTx.items
  .map(
    (item) =>
      `${item.productName.padEnd(24)} x${item.quantity}  ${formatRupiah(item.total)}`
  )
  .join('\n')}
----------------------------------------
Subtotal:          ${formatRupiah(activeTx.subtotal)}
Diskon:            ${formatRupiah(activeTx.discount)}
Pajak:             ${formatRupiah(activeTx.tax)}
TOTAL:             ${formatRupiah(activeTx.total)}
----------------------------------------
Metode Bayar:      ${activeTx.paymentMethod}
Jumlah Dibayar:    ${formatRupiah(activeTx.amountPaid)}
Kembalian:         ${formatRupiah(activeTx.change)}
========================================
     Terima Kasih Atas Kunjungan Anda!
========================================
`;
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Struk-${activeTx.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="sales-history-view"
      className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden"
    >
      {/* Left Column: Transactions List */}
      <section
        id="sales-table-section"
        className={`flex-1 flex flex-col overflow-hidden border-r ${
          isDark
            ? 'bg-[#0a0e1a] border-sky-400/10'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Filter Bar matching image 5 */}
        <div
          id="sales-filter-bar"
          className={`p-4 sm:p-5 border-b flex flex-wrap gap-4 items-center shrink-0 ${
            isDark ? 'bg-[#0f1524] border-sky-400/10' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* Quick Search inside filter bar */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              id="input-search-transaction"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs outline-none border ${
                isDark
                  ? 'bg-slate-900 border-sky-400/20 text-slate-100 placeholder:text-slate-400 focus:border-sky-400'
                  : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold text-slate-500 dark:text-slate-400">Tanggal:</label>
            <input
              id="input-filter-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`border rounded px-2.5 py-1.5 text-xs outline-none ${
                isDark
                  ? 'bg-slate-900 border-sky-400/20 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            />
            <span className="text-slate-400">-</span>
            <input
              id="input-filter-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`border rounded px-2.5 py-1.5 text-xs outline-none ${
                isDark
                  ? 'bg-slate-900 border-sky-400/20 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            />
          </div>

          {/* Payment Method Filter Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold text-slate-500 dark:text-slate-400">Metode:</label>
            <select
              id="select-filter-method"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className={`border rounded px-3 py-1.5 text-xs outline-none cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-sky-400/20 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Semua Metode</option>
              <option value="tunai">Tunai</option>
              <option value="qris">QRIS</option>
              <option value="kartu kredit">Kartu Kredit/Debit</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div id="sales-table-container" className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead
              className={`sticky top-0 z-10 shadow-xs border-b text-xs font-semibold ${
                isDark
                  ? 'bg-[#141c2e] border-sky-400/10 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <tr>
                <th className="p-4">ID Transaksi</th>
                <th className="p-4">Waktu</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4">Metode</th>
                <th className="p-4">Kasir</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody
              className={`text-xs sm:text-sm divide-y ${
                isDark ? 'divide-sky-400/10 text-slate-200' : 'divide-slate-100 text-slate-800'
              }`}
            >
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data transaksi.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isSelected = activeTx?.id === tx.id;
                  return (
                    <tr
                      key={tx.id}
                      id={`tx-row-${tx.id}`}
                      onClick={() => {
                        setSelectedTxId(tx.id);
                        setIsDetailOpen(true);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? isDark
                            ? 'bg-sky-950/40 border-l-4 border-sky-400 font-medium'
                            : 'bg-blue-50/80 border-l-4 border-blue-600 font-medium'
                          : isDark
                          ? 'hover:bg-white/5'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-4 font-mono font-bold text-blue-600 dark:text-sky-400">
                        {tx.id}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {tx.dateFormatted}
                      </td>
                      <td className="p-4 text-right font-bold">
                        {formatRupiah(tx.total)}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {tx.paymentMethod}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {tx.cashierName}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right Column: Transaction Detail Side-Panel matching image 5 */}
      {isDetailOpen && activeTx && (
        <section
          id="detail-panel"
          className={`w-full lg:w-[400px] xl:w-[440px] flex flex-col shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] border-t lg:border-t-0 z-20 ${
            isDark ? 'bg-[#0f1524] text-slate-100' : 'bg-white text-slate-800'
          }`}
        >
          {/* Panel Header */}
          <div
            className={`p-5 border-b flex justify-between items-center ${
              isDark ? 'bg-[#141c2e] border-sky-400/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                TRANSAKSI #{activeTx.id}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeTx.dateFormatted} • Kasir: {activeTx.cashierName}
              </p>
            </div>
            <button
              id="btn-close-detail-panel"
              onClick={() => setIsDetailOpen(false)}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Itemized List */}
          <div
            className={`flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4 ${
              isDark ? 'bg-[#0a0e1a]/40' : 'bg-white'
            }`}
          >
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Item Pesanan
            </h4>

            <div className="space-y-3">
              {activeTx.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start border-b border-dashed border-slate-200 dark:border-slate-800 pb-3"
                >
                  <div className="flex-1 pr-2">
                    <p className="text-sm font-semibold">{item.productName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.quantity} x {formatRupiah(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-right">
                    {formatRupiah(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Actions Footer matching image 5 */}
          <div
            className={`p-5 border-t mt-auto space-y-4 ${
              isDark ? 'bg-[#0f1524] border-sky-400/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* Subtotal & Tax */}
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatRupiah(activeTx.subtotal)}
                </span>
              </div>
              {activeTx.discount > 0 && (
                <div className="flex justify-between items-center text-red-500">
                  <span>Diskon</span>
                  <span className="font-semibold">-{formatRupiah(activeTx.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Pajak (0%)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatRupiah(activeTx.tax)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                Total
              </span>
              <span
                className={`text-xl sm:text-2xl font-bold ${
                  isDark ? 'text-sky-300' : 'text-blue-600'
                }`}
              >
                {formatRupiah(activeTx.total)}
              </span>
            </div>

            {/* Payment Details Container */}
            <div
              className={`rounded-xl p-3.5 text-xs space-y-1.5 border ${
                isDark
                  ? 'bg-slate-900/60 border-sky-400/15'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Metode Pembayaran</span>
                <span className="font-bold">{activeTx.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Jumlah Dibayar</span>
                <span className="font-semibold">{formatRupiah(activeTx.amountPaid)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Kembalian</span>
                <span className="font-semibold">{formatRupiah(activeTx.change)}</span>
              </div>
            </div>

            {/* Action Buttons: Download PDF & Cetak Struk */}
            <div className="flex gap-3">
              <button
                id="btn-download-pdf"
                onClick={handleDownloadPDF}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'border-sky-400/30 text-sky-300 hover:bg-sky-950/40'
                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Download PDF</span>
              </button>
              <button
                id="btn-print-receipt"
                onClick={handlePrint}
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Cetak Struk</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
