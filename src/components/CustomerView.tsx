import React, { useState, useMemo } from 'react';
import { Customer, AppTheme } from '../types';
import { formatRupiah } from '../utils/formatters';

interface CustomerViewProps {
  customers: Customer[];
  theme: AppTheme;
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  customers,
  theme,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer
}) => {
  const isDark = theme === 'glacier-dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    memberLevel: 'Reguler' as 'Reguler' | 'Silver' | 'Gold' | 'VIP',
    points: 0
  });

  // KPI Metrics
  const stats = useMemo(() => {
    const total = customers.length;
    const vipGoldCount = customers.filter((c) => c.memberLevel === 'VIP' || c.memberLevel === 'Gold').length;
    const totalPoints = customers.reduce((acc, c) => acc + (c.points || 0), 0);
    const totalSpent = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

    return { total, vipGoldCount, totalPoints, totalSpent };
  }, [customers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q));

      const matchLevel = selectedLevel === 'all' || c.memberLevel.toLowerCase() === selectedLevel.toLowerCase();

      return matchSearch && matchLevel;
    });
  }, [customers, searchQuery, selectedLevel]);

  const openAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      memberLevel: 'Reguler',
      points: 20
    });
    setIsAddModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address || '',
      memberLevel: c.memberLevel,
      points: c.points || 0
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    if (editingCustomer) {
      onUpdateCustomer({
        ...editingCustomer,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        memberLevel: formData.memberLevel,
        points: Number(formData.points) || 0
      });
    } else {
      onAddCustomer({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        memberLevel: formData.memberLevel,
        points: Number(formData.points) || 0,
        totalSpent: 0,
        transactionCount: 0
      });
    }
    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!customerToDelete) return;
    onDeleteCustomer(customerToDelete.id);
    setCustomerToDelete(null);
  };

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Gold':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Silver':
        return 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div id="customer-view" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Data Pelanggan & Member (CRUD)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola profil pelanggan, level keanggotaan, poin loyalitas, serta riwayat belanja toko.
          </p>
        </div>

        <button
          id="btn-add-customer"
          onClick={openAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Tambah Pelanggan Baru</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Pelanggan</p>
              <p className="text-xl font-extrabold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined">workspace_premium</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">VIP & Gold Member</p>
              <p className="text-xl font-extrabold">{stats.vipGoldCount}</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined">loyalty</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Poin Loyalitas</p>
              <p className="text-xl font-extrabold">{stats.totalPoints} Poin</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Belanja Member</p>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatRupiah(stats.totalSpent)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        className={`p-4 rounded-xl border flex flex-wrap gap-3 items-center justify-between ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari pelanggan berdasarkan nama, no. HP, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs outline-none border ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className={`px-3 py-2 rounded-lg text-xs outline-none border cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <option value="all">Semua Level Member</option>
            <option value="reguler">Reguler</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="vip">VIP</option>
          </select>

          {/* View Mode Toggle */}
          <div className={`flex border rounded-lg p-0.5 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'}`}>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                viewMode === 'table' ? (isDark ? 'bg-blue-600 text-white' : 'bg-white text-slate-900 shadow-xs') : 'text-slate-400'
              }`}
              title="Tampilan Tabel"
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                viewMode === 'grid' ? (isDark ? 'bg-blue-600 text-white' : 'bg-white text-slate-900 shadow-xs') : 'text-slate-400'
              }`}
              title="Tampilan Kartu"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className={`text-xs font-semibold border-b ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Kontak / WhatsApp</th>
                  <th className="p-4">Level Member</th>
                  <th className="p-4 text-center">Poin</th>
                  <th className="p-4 text-right">Total Belanja</th>
                  <th className="p-4">Alamat</th>
                  <th className="p-4 text-center">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className={`text-xs divide-y ${isDark ? 'divide-slate-800 text-slate-200' : 'divide-slate-100 text-slate-800'}`}>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Tidak ada data pelanggan yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr key={cust.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase">
                            {cust.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold">{cust.name}</p>
                            {cust.email && <p className="text-[11px] text-slate-400">{cust.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-medium">
                        <a
                          href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          {cust.phone}
                        </a>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBadgeStyle(cust.memberLevel)}`}>
                          {cust.memberLevel}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-amber-600 dark:text-amber-400">
                        {cust.points || 0} pts
                      </td>
                      <td className="p-4 text-right font-bold">
                        {formatRupiah(cust.totalSpent || 0)}
                      </td>
                      <td className="p-4 text-slate-500 max-w-[200px] truncate" title={cust.address}>
                        {cust.address || '-'}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Edit Data Pelanggan"
                            onClick={() => openEdit(cust)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            title="Hapus Data Pelanggan"
                            onClick={() => setCustomerToDelete(cust)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm uppercase">
                    {cust.name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{cust.name}</h4>
                    <span className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold border mt-0.5 ${getBadgeStyle(cust.memberLevel)}`}>
                      {cust.memberLevel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(cust)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded-md"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => setCustomerToDelete(cust)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Telepon / WA:</span>
                  <a
                    href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {cust.phone}
                  </a>
                </div>
                {cust.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-600 dark:text-slate-300 truncate max-w-[160px]">{cust.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Poin Loyalitas:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{cust.points || 0} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Belanja:</span>
                  <span className="font-bold">{formatRupiah(cust.totalSpent || 0)}</span>
                </div>
                {cust.address && (
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800 truncate">
                    📍 {cust.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Tambah / Edit Pelanggan */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-[#141e33]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">
                  {editingCustomer ? 'edit' : 'person_add'}
                </span>
                <h3 className="font-bold text-base">
                  {editingCustomer ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nomor WhatsApp / HP *</label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Level Member</label>
                  <select
                    value={formData.memberLevel}
                    onChange={(e) => setFormData({ ...formData, memberLevel: e.target.value as any })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  >
                    <option value="Reguler">Reguler</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Saldo Poin Loyalitas</label>
                <input
                  type="number"
                  min="0"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Math.max(0, parseInt(e.target.value) || 0) })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Alamat Domisili</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Merdeka No. 45, Kelurahan..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingCustomer ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Hapus Pelanggan */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${
              isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <h3 className="font-bold text-lg mb-1">Hapus Data Pelanggan?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Apakah Anda yakin ingin menghapus data pelanggan <strong className="text-slate-900 dark:text-white">{customerToDelete.name}</strong> ({customerToDelete.phone})?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
