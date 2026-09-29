import React, { useState, useMemo } from 'react';
import { Promo, AppTheme } from '../types';
import { formatRupiah } from '../utils/formatters';

interface PromoViewProps {
  promos: Promo[];
  theme: AppTheme;
  onAddPromo: (promo: Omit<Promo, 'id'>) => void;
  onUpdatePromo: (promo: Promo) => void;
  onDeletePromo: (id: string) => void;
}

export const PromoView: React.FC<PromoViewProps> = ({
  promos,
  theme,
  onAddPromo,
  onUpdatePromo,
  onDeletePromo
}) => {
  const isDark = theme === 'glacier-dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [promoToDelete, setPromoToDelete] = useState<Promo | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    minSpend: 50000,
    isActive: true
  });

  // KPI Metrics
  const stats = useMemo(() => {
    const total = promos.length;
    const activeCount = promos.filter((p) => p.isActive).length;
    const percentageCount = promos.filter((p) => p.type === 'percentage').length;
    const fixedCount = promos.filter((p) => p.type === 'fixed').length;

    return { total, activeCount, percentageCount, fixedCount };
  }, [promos]);

  // Filtered promos
  const filteredPromos = useMemo(() => {
    return promos.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.code.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q);

      let matchFilter = true;
      if (filterType === 'active') matchFilter = p.isActive;
      if (filterType === 'inactive') matchFilter = !p.isActive;
      if (filterType === 'percentage') matchFilter = p.type === 'percentage';
      if (filterType === 'fixed') matchFilter = p.type === 'fixed';

      return matchSearch && matchFilter;
    });
  }, [promos, searchQuery, filterType]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openAdd = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      title: '',
      type: 'percentage',
      value: 10,
      minSpend: 50000,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEdit = (p: Promo) => {
    setEditingPromo(p);
    setFormData({
      code: p.code,
      title: p.title,
      type: p.type,
      value: p.value,
      minSpend: p.minSpend,
      isActive: p.isActive
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = (p: Promo) => {
    onUpdatePromo({
      ...p,
      isActive: !p.isActive
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.title.trim()) return;

    if (editingPromo) {
      onUpdatePromo({
        ...editingPromo,
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        type: formData.type,
        value: Number(formData.value) || 0,
        minSpend: Number(formData.minSpend) || 0,
        isActive: formData.isActive
      });
    } else {
      onAddPromo({
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        type: formData.type,
        value: Number(formData.value) || 0,
        minSpend: Number(formData.minSpend) || 0,
        isActive: formData.isActive
      });
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!promoToDelete) return;
    onDeletePromo(promoToDelete.id);
    setPromoToDelete(null);
  };

  return (
    <div id="promo-view" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Kupon & Diskon Promo (CRUD)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Atur kode voucher diskon, potongan tunai, dan promo persentase untuk kasir toko Anda.
          </p>
        </div>

        <button
          id="btn-add-promo"
          onClick={openAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Tambah Kupon Promo Baru</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined">local_offer</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Promo</p>
              <p className="text-xl font-extrabold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Promo Aktif</p>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.activeCount}</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined">percent</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Diskon Persentase</p>
              <p className="text-xl font-extrabold">{stats.percentageCount}</p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined">attach_money</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Potongan Nominal</p>
              <p className="text-xl font-extrabold">{stats.fixedCount}</p>
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
            placeholder="Cari kupon promo berdasarkan kode atau judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs outline-none border ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500'
                : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-600'
            }`}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-3 py-2 rounded-lg text-xs outline-none border cursor-pointer ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
          }`}
        >
          <option value="all">Semua Status & Tipe</option>
          <option value="active">Hanya Aktif</option>
          <option value="inactive">Hanya Non-Aktif</option>
          <option value="percentage">Tipe Persentase (%)</option>
          <option value="fixed">Tipe Potongan Nominal (Rp)</option>
        </select>
      </div>

      {/* Promos Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPromos.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 border rounded-2xl border-dashed border-slate-300 dark:border-slate-800">
            Tidak ada kupon promo yang sesuai kriteria pencarian.
          </div>
        ) : (
          filteredPromos.map((promo) => (
            <div
              key={promo.id}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isDark ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  promo.isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-400'
                }`}
              />

              <div>
                <div className="flex items-start justify-between gap-2 mt-1">
                  <div>
                    <h3 className="font-bold text-sm">{promo.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Min. Belanja: {formatRupiah(promo.minSpend)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(promo)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                      promo.isActive
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {promo.isActive ? 'Aktif' : 'Non-Aktif'}
                  </button>
                </div>

                {/* Big Discount Value Display */}
                <div className={`my-4 p-3 rounded-xl flex items-center justify-between border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-blue-50/60 border-blue-100'
                }`}>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nilai Potongan</span>
                    <p className="text-xl font-extrabold text-blue-600 dark:text-sky-400">
                      {promo.type === 'percentage' ? `${promo.value}%` : formatRupiah(promo.value)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tipe</span>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {promo.type === 'percentage' ? 'Persentase' : 'Potongan Tunai'}
                    </p>
                  </div>
                </div>

                {/* Coupon Code Pill */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 py-1.5 px-3 rounded-lg border border-dashed border-blue-400/50 dark:border-sky-400/50 bg-blue-500/5 font-mono font-bold text-blue-600 dark:text-sky-400 text-center tracking-wider text-xs">
                    {promo.code}
                  </div>
                  <button
                    onClick={() => handleCopyCode(promo.code)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Salin Kode"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {copiedCode === promo.code ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-[11px] text-slate-400">
                  {promo.isActive ? 'Siap digunakan di Kasir' : 'Promo dinonaktifkan'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(promo)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit Promo"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => setPromoToDelete(promo)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Hapus Promo"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Tambah / Edit Promo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
              isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-[#141e33]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">
                  {editingPromo ? 'edit' : 'local_offer'}
                </span>
                <h3 className="font-bold text-base">
                  {editingPromo ? 'Edit Kupon Promo' : 'Tambah Kupon Promo Baru'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Kode Promo / Kupon *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: HEMAT10"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 text-xs font-mono font-bold tracking-wider rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Judul / Deskripsi Singkat *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Diskon Gajian Hemat 10%"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tipe Diskon</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal Tetap (Rp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    {formData.type === 'percentage' ? 'Besar Diskon (%)' : 'Potongan Diskon (Rp)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Math.max(0, parseInt(e.target.value) || 0) })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Minimal Belanja (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minSpend}
                  onChange={(e) => setFormData({ ...formData, minSpend: Math.max(0, parseInt(e.target.value) || 0) })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <span className="text-xs font-semibold">Aktifkan kupon ini sekarang</span>
              </label>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingPromo ? 'Simpan Perubahan' : 'Buat Kupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Hapus Promo */}
      {promoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${
              isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <h3 className="font-bold text-lg mb-1">Hapus Kupon Promo?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Apakah Anda yakin ingin menghapus kupon promo kode <strong className="text-slate-900 dark:text-white">{promoToDelete.code}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPromoToDelete(null)}
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
