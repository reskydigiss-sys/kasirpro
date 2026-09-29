import React, { useState, useMemo } from 'react';
import { Transaction, AppTheme, PaymentMethod, Product, Customer } from '../types';
import { formatRupiah } from '../utils/formatters';

interface SalesHistoryViewProps {
  transactions: Transaction[];
  products?: Product[];
  customers?: Customer[];
  theme: AppTheme;
  onCreateTransaction?: (tx: Omit<Transaction, 'id'>) => Promise<Transaction> | void;
  onUpdateTransaction?: (tx: Partial<Transaction> & { id: string }) => Promise<void> | void;
  onDeleteTransaction?: (id: string, restock: boolean) => Promise<void> | void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  transactions,
  products = [],
  customers = [],
  theme,
  onCreateTransaction,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const isDark = theme === 'glacier-dark';
  const [selectedTxId, setSelectedTxId] = useState<string>(
    transactions.length > 0 ? transactions[0].id : ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isDetailOpen, setIsDetailOpen] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [restockOnDelete, setRestockOnDelete] = useState(true);

  // Edit form state
  const [editStatus, setEditStatus] = useState<'Completed' | 'Pending' | 'Cancelled'>('Completed');
  const [editCustomer, setEditCustomer] = useState('');
  const [editMethod, setEditMethod] = useState<PaymentMethod>('Tunai');
  const [editNotes, setEditNotes] = useState('');

  // Create form state
  const [newCustName, setNewCustName] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [newStatus, setNewStatus] = useState<'Completed' | 'Pending'>('Completed');
  const [newNotes, setNewNotes] = useState('');
  const [newDiscount, setNewDiscount] = useState(0);
  const [newItems, setNewItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Active selected transaction
  const activeTx = useMemo(() => {
    return transactions.find((t) => t.id === selectedTxId) || transactions[0] || null;
  }, [transactions, selectedTxId]);

  // Statistics KPI
  const stats = useMemo(() => {
    const totalRev = transactions
      .filter((t) => t.status === 'Completed')
      .reduce((sum, t) => sum + t.total, 0);
    const completedCount = transactions.filter((t) => t.status === 'Completed').length;
    const pendingCount = transactions.filter((t) => t.status === 'Pending').length;
    const cancelledCount = transactions.filter((t) => t.status === 'Cancelled').length;

    return { totalRev, completedCount, pendingCount, cancelledCount };
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.customerName && tx.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

      // Method filter
      const matchesMethod =
        selectedMethod === 'all' ||
        tx.paymentMethod.toLowerCase() === selectedMethod.toLowerCase();

      // Status filter
      const matchesStatus =
        selectedStatus === 'all' ||
        tx.status.toLowerCase() === selectedStatus.toLowerCase();

      // Date filter
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && tx.timestamp >= startDate;
      }
      if (endDate) {
        matchesDate = matchesDate && tx.timestamp <= endDate + 'T23:59:59Z';
      }

      return matchesSearch && matchesMethod && matchesStatus && matchesDate;
    });
  }, [transactions, searchQuery, selectedMethod, selectedStatus, startDate, endDate]);

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
Status:    ${activeTx.status}
Kasir:     ${activeTx.cashierName}
Pelanggan: ${activeTx.customerName || 'Pelanggan Umum'}
${activeTx.notes ? `Catatan:   ${activeTx.notes}\n` : ''}----------------------------------------
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

  // Open Edit Modal
  const openEdit = (tx: Transaction) => {
    setTxToEdit(tx);
    setEditStatus(tx.status);
    setEditCustomer(tx.customerName || '');
    setEditMethod(tx.paymentMethod);
    setEditNotes(tx.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txToEdit || !onUpdateTransaction) return;
    onUpdateTransaction({
      id: txToEdit.id,
      status: editStatus,
      customerName: editCustomer.trim() || undefined,
      paymentMethod: editMethod,
      notes: editNotes.trim() || undefined
    });
    setIsEditModalOpen(false);
  };

  // Open Delete Modal
  const openDelete = (tx: Transaction) => {
    setTxToDelete(tx);
    setRestockOnDelete(true);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!txToDelete || !onDeleteTransaction) return;
    onDeleteTransaction(txToDelete.id, restockOnDelete);
    setIsDeleteModalOpen(false);
    if (selectedTxId === txToDelete.id) {
      const remaining = transactions.filter((t) => t.id !== txToDelete.id);
      setSelectedTxId(remaining.length > 0 ? remaining[0].id : '');
    }
  };

  // Create Manual Transaction
  const handleAddItemToCreate = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setNewItems((prev) => {
      const existing = prev.find((i) => i.product.id === prod.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const handleRemoveItemFromCreate = (prodId: string) => {
    setNewItems((prev) => prev.filter((i) => i.product.id !== prodId));
  };

  const handleUpdateItemQty = (prodId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItemFromCreate(prodId);
      return;
    }
    setNewItems((prev) =>
      prev.map((i) => (i.product.id === prodId ? { ...i, quantity: qty } : i))
    );
  };

  const calculateCreateTotals = useMemo(() => {
    const subtotal = newItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
    const total = Math.max(0, subtotal - newDiscount);
    return { subtotal, total };
  }, [newItems, newDiscount]);

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItems.length === 0) return;
    if (!onCreateTransaction) return;

    const { subtotal, total } = calculateCreateTotals;
    const now = new Date();
    const dateFormatted = now.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    onCreateTransaction({
      timestamp: now.toISOString(),
      dateFormatted,
      subtotal,
      discount: newDiscount,
      tax: 0,
      total,
      paymentMethod: newPaymentMethod,
      amountPaid: total,
      change: 0,
      cashierName: 'Admin / Kasir',
      status: newStatus,
      customerName: newCustName.trim() || undefined,
      notes: newNotes.trim() || undefined,
      items: newItems.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        sku: i.product.sku,
        price: i.product.price,
        quantity: i.quantity,
        total: i.product.price * i.quantity
      }))
    });

    setIsCreateModalOpen(false);
    // Reset form
    setNewItems([]);
    setNewCustName('');
    setNewDiscount(0);
    setNewNotes('');
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
        {/* KPI Summary Banner */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b ${
            isDark ? 'bg-[#0d1322] border-slate-800' : 'bg-slate-50/80 border-slate-100'
          }`}
        >
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
            <p className="text-[11px] font-semibold text-slate-400">Total Omset Selesai</p>
            <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(stats.totalRev)}
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
            <p className="text-[11px] font-semibold text-slate-400">Selesai (Completed)</p>
            <p className="text-base sm:text-lg font-bold text-blue-600 dark:text-sky-400">
              {stats.completedCount} Transaksi
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
            <p className="text-[11px] font-semibold text-slate-400">Pending / Menunggu</p>
            <p className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">
              {stats.pendingCount} Transaksi
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
            <p className="text-[11px] font-semibold text-slate-400">Dibatalkan (Void)</p>
            <p className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400">
              {stats.cancelledCount} Transaksi
            </p>
          </div>
        </div>

        {/* Filter Bar with CRUD Create button */}
        <div
          id="sales-filter-bar"
          className={`p-4 border-b flex flex-wrap gap-3 items-center justify-between shrink-0 ${
            isDark ? 'bg-[#0f1524] border-sky-400/10' : 'bg-white border-slate-200'
          }`}
        >
          {/* Quick Search inside filter bar */}
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              id="input-search-transaction"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID, pelanggan, kasir..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs outline-none border ${
                isDark
                  ? 'bg-slate-900 border-sky-400/20 text-slate-100 placeholder:text-slate-400 focus:border-sky-400'
                  : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`border rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer ${
                isDark ? 'bg-slate-900 border-sky-400/20 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Semua Status</option>
              <option value="completed">Completed (Selesai)</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled (Batal)</option>
            </select>

            {/* Payment Method Filter Dropdown */}
            <select
              id="select-filter-method"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className={`border rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer ${
                isDark ? 'bg-slate-900 border-sky-400/20 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">Semua Metode</option>
              <option value="tunai">Tunai</option>
              <option value="qris">QRIS</option>
              <option value="kartu kredit">Kartu Kredit</option>
              <option value="transfer bank">Transfer Bank</option>
            </select>

            {/* Create Transaction Button */}
            <button
              id="btn-create-manual-transaction"
              onClick={() => setIsCreateModalOpen(true)}
              className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              <span>Entri Penjualan Baru</span>
            </button>
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
                <th className="p-3.5">ID Transaksi</th>
                <th className="p-3.5">Waktu</th>
                <th className="p-3.5">Pelanggan</th>
                <th className="p-3.5 text-right">Total</th>
                <th className="p-3.5">Metode</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody
              className={`text-xs sm:text-sm divide-y ${
                isDark ? 'divide-sky-400/10 text-slate-200' : 'divide-slate-100 text-slate-800'
              }`}
            >
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data transaksi yang cocok.
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
                      <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-sky-400">
                        {tx.id}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {tx.dateFormatted}
                      </td>
                      <td className="p-3.5 text-slate-800 dark:text-slate-200 font-medium">
                        {tx.customerName || <span className="text-slate-400 italic">Umum</span>}
                      </td>
                      <td className="p-3.5 text-right font-bold">
                        {formatRupiah(tx.total)}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {tx.paymentMethod}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            tx.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : tx.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Edit Transaksi"
                            onClick={() => openEdit(tx)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            title="Batalkan / Hapus Transaksi (Void)"
                            onClick={() => openDelete(tx)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
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
      </section>

      {/* Right Column: Transaction Detail Side-Panel */}
      {isDetailOpen && activeTx && (
        <section
          id="detail-panel"
          className={`w-full lg:w-[400px] xl:w-[440px] flex flex-col shrink-0 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] border-t lg:border-t-0 z-20 ${
            isDark ? 'bg-[#0f1524] text-slate-100' : 'bg-white text-slate-800'
          }`}
        >
          {/* Panel Header */}
          <div
            className={`p-4 sm:p-5 border-b flex justify-between items-center ${
              isDark ? 'bg-[#141c2e] border-sky-400/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  TRANSAKSI #{activeTx.id}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTx.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : activeTx.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {activeTx.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeTx.dateFormatted} • Kasir: {activeTx.cashierName}
              </p>
              {activeTx.customerName && (
                <p className="text-xs font-semibold text-blue-600 dark:text-sky-400 mt-0.5">
                  Pelanggan: {activeTx.customerName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                title="Edit Transaksi"
                onClick={() => openEdit(activeTx)}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button
                title="Hapus / Void Transaksi"
                onClick={() => openDelete(activeTx)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
              <button
                id="btn-close-detail-panel"
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Itemized List */}
          <div
            className={`flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4 ${
              isDark ? 'bg-[#0a0e1a]/40' : 'bg-white'
            }`}
          >
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Item Pesanan ({activeTx.items.length})
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

            {activeTx.notes && (
              <div className={`p-3 rounded-lg text-xs border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <span className="font-bold">Catatan: </span>
                {activeTx.notes}
              </div>
            )}
          </div>

          {/* Totals & Actions Footer */}
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
            <div className="flex gap-2">
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
                <span>Download TXT</span>
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

      {/* MODAL 1: Create Manual Transaction */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div
            className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden my-8 ${
              isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-[#141e33]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">receipt_long</span>
                <h3 className="font-bold text-base">Entri Transaksi / Faktur Penjualan Baru</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Pilih / Nama Pelanggan</label>
                  <input
                    type="text"
                    list="customer-suggestions"
                    placeholder="Contoh: Budi Santoso"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  />
                  <datalist id="customer-suggestions">
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>{c.phone} ({c.memberLevel})</option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Metode Pembayaran</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as PaymentMethod)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  >
                    <option value="Tunai">Tunai</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Kartu Kredit">Kartu Kredit</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                  </select>
                </div>
              </div>

              {/* Product selector */}
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Pilih Produk Untuk Ditambahkan</label>
                <div className="flex gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  >
                    <option value="">-- Pilih Produk --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatRupiah(p.price)} (Stok: {p.stock})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddItemToCreate}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>

                {/* Items preview list */}
                {newItems.length > 0 && (
                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                    {newItems.map((item) => (
                      <div
                        key={item.product.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                          isDark ? 'bg-slate-800' : 'bg-slate-100'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-bold truncate">{item.product.name}</p>
                          <p className="text-[11px] text-slate-400">{formatRupiah(item.product.price)} / pcs</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQty(item.product.id, parseInt(e.target.value) || 1)}
                            className={`w-14 px-2 py-1 text-center rounded border outline-none text-xs ${
                              isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                            }`}
                          />
                          <p className="font-bold w-20 text-right">{formatRupiah(item.product.price * item.quantity)}</p>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromCreate(item.product.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Diskon (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status Transaksi</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  >
                    <option value="Completed">Completed (Selesai)</option>
                    <option value="Pending">Pending (Menunggu)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pesanan untuk acara kantor"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              {/* Total Summary */}
              <div className={`p-4 rounded-xl flex justify-between items-center ${isDark ? 'bg-slate-900' : 'bg-blue-50 text-blue-900'}`}>
                <div>
                  <p className="text-xs font-medium">Total Akhir</p>
                  <p className="text-xs text-slate-500">Subtotal: {formatRupiah(calculateCreateTotals.subtotal)}</p>
                </div>
                <p className="text-xl font-extrabold text-blue-600 dark:text-sky-400">
                  {formatRupiah(calculateCreateTotals.total)}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={newItems.length === 0}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Transaction */}
      {isEditModalOpen && txToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-[#141e33]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">edit</span>
                <h3 className="font-bold text-base">Edit Transaksi #{txToEdit.id}</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Status Transaksi</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none font-semibold ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                >
                  <option value="Completed">Completed (Selesai)</option>
                  <option value="Pending">Pending (Menunggu)</option>
                  <option value="Cancelled">Cancelled (Dibatalkan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={editCustomer}
                  onChange={(e) => setEditCustomer(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Metode Pembayaran</label>
                <select
                  value={editMethod}
                  onChange={(e) => setEditMethod(e.target.value as PaymentMethod)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                >
                  <option value="Tunai">Tunai</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Kartu Kredit">Kartu Kredit</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Catatan pesanan..."
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete / Void Transaction */}
      {isDeleteModalOpen && txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
              isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>

            <h3 className="font-bold text-lg mb-1">Batalkan / Void Transaksi?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Anda akan membatalkan atau menghapus transaksi #{txToDelete.id} senilai{' '}
              <strong className="text-slate-900 dark:text-white">{formatRupiah(txToDelete.total)}</strong>.
            </p>

            <label className={`flex items-center gap-3 p-3 rounded-xl border mb-6 cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <input
                type="checkbox"
                checked={restockOnDelete}
                onChange={(e) => setRestockOnDelete(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <div className="text-xs">
                <p className="font-bold">Kembalikan Stok Produk (Restock)</p>
                <p className="text-slate-400">Jumlah item pesanan akan otomatis ditambahkan kembali ke stok toko.</p>
              </div>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Hapus & Void
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
