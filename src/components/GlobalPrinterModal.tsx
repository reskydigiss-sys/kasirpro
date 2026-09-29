import React, { useState } from 'react';
import { usePrinter } from '../context/PrinterContext';
import { AppTheme, PaperWidth, PrinterInterfaceType } from '../types';

interface GlobalPrinterModalProps {
  theme: AppTheme;
}

export const GlobalPrinterModal: React.FC<GlobalPrinterModalProps> = ({ theme }) => {
  const {
    openModal,
    setOpenModal,
    connectedPrinter,
    pairedPrinters,
    status,
    settings,
    hardwareSupport,
    isScanning,
    updateSettings,
    scanAndConnectBluetooth,
    scanAndConnectUsb,
    disconnectPrinter,
    reconnectPrinter,
    removePairedPrinter,
    setDefaultPrinter,
    triggerAutoDetect,
    printTestReceipt,
    feedPaper,
    addCustomPrinter
  } = usePrinter();

  const isDark = theme === 'glacier-dark';
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'printers' | 'settings' | 'guide'>('status');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Custom manual printer form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<PrinterInterfaceType>('bluetooth');
  const [newWidth, setNewWidth] = useState<PaperWidth>('58mm');

  if (!openModal) return null;

  const handleTestPrint = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await printTestReceipt();
      setTestResult(res.message);
    } catch {
      setTestResult('Gagal mencetak uji coba.');
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addCustomPrinter({
      name: newName.trim(),
      type: newType,
      status: 'connected',
      paperWidth: newWidth,
      autoReconnect: true,
      isDefault: true,
      lastConnected: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      batteryLevel: 90,
      signalStrength: -60
    });

    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div
      id="global-printer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden ${
          isDark ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-slate-800 bg-[#131c31]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                status === 'connected'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : status === 'searching'
                  ? 'bg-amber-500/20 text-amber-400'
                  : isDark
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {status === 'connected' ? 'print' : status === 'searching' ? 'bluetooth_searching' : 'print_disabled'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Deteksi &amp; Koneksi Printer Global</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    status === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                      : status === 'searching'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status === 'connected'
                        ? 'bg-emerald-500 animate-pulse'
                        : status === 'searching'
                        ? 'bg-amber-500 animate-ping'
                        : 'bg-rose-500'
                    }`}
                  />
                  {status === 'connected'
                    ? 'Terhubung'
                    : status === 'searching'
                    ? 'Mencari...'
                    : 'Terputus'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deteksi otomatis printer thermal Bluetooth 58mm/80mm &amp; USB Mini POS.
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenModal(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div
          className={`flex items-center gap-1 px-6 border-b text-xs font-semibold overflow-x-auto ${
            isDark ? 'border-slate-800 bg-[#0d1424]' : 'border-slate-200 bg-slate-100/50'
          }`}
        >
          <button
            onClick={() => setActiveSubTab('status')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'status'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            <span>Status &amp; Kontrol</span>
          </button>

          <button
            onClick={() => setActiveSubTab('printers')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'printers'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">devices</span>
            <span>Daftar Printer ({pairedPrinters.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'settings'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">settings</span>
            <span>Pengaturan Otomatis</span>
          </button>

          <button
            onClick={() => setActiveSubTab('guide')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'guide'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">help</span>
            <span>Panduan &amp; Tips</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: STATUS & KONTROL */}
          {activeSubTab === 'status' && (
            <div className="space-y-6">
              {/* Active Printer Card */}
              <div
                className={`p-5 rounded-xl border relative overflow-hidden ${
                  status === 'connected'
                    ? isDark
                      ? 'bg-emerald-950/20 border-emerald-800/50'
                      : 'bg-emerald-50/70 border-emerald-200'
                    : isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        status === 'connected'
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[28px]">
                        {connectedPrinter?.type === 'bluetooth' ? 'bluetooth' : 'usb'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {connectedPrinter?.name || 'Belum Ada Printer Terhubung'}
                        </h4>
                        {connectedPrinter?.isDefault && (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md text-[10px] font-bold">
                            UTAMA
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="capitalize flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">cable</span>
                          Tipe: {connectedPrinter?.type || 'Bluetooth'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">receipt</span>
                          Lebar: {connectedPrinter?.paperWidth || settings.paperWidth}
                        </span>
                        {connectedPrinter?.batteryLevel !== undefined && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <span className="material-symbols-outlined text-[14px]">battery_std</span>
                              Baterai: {connectedPrinter.batteryLevel}%
                            </span>
                          </>
                        )}
                        {connectedPrinter?.signalStrength !== undefined && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                              Sinyal: {connectedPrinter.signalStrength} dBm
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {status === 'connected' ? (
                      <button
                        onClick={disconnectPrinter}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors"
                      >
                        Putuskan
                      </button>
                    ) : (
                      <button
                        onClick={triggerAutoDetect}
                        disabled={isScanning}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1"
                      >
                        <span className={`material-symbols-outlined text-[16px] ${isScanning ? 'animate-spin' : ''}`}>
                          sync
                        </span>
                        <span>{isScanning ? 'Mendeteksi...' : 'Hubungkan'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Test Feedback Notice */}
                {testResult && (
                  <div className="mt-3 p-2.5 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                    ✓ {testResult}
                  </div>
                )}
              </div>

              {/* Action Buttons: Bluetooth, USB, Auto-detect */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={scanAndConnectBluetooth}
                  disabled={isScanning}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isDark
                      ? 'bg-[#131c31] border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80'
                      : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">bluetooth_searching</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-500 uppercase">Bluetooth</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Pindai Printer Bluetooth
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Cari mini printer Bluetooth BLE / SPP (POS-58, RPP02N, dsb).
                    </p>
                  </div>
                </button>

                <button
                  onClick={scanAndConnectUsb}
                  disabled={isScanning}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isDark
                      ? 'bg-[#131c31] border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80'
                      : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">usb</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">USB Kabel</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Deteksi Mini Printer USB
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Koneksi kabel USB / OTG langsung tanpa pairing.
                    </p>
                  </div>
                </button>

                <button
                  onClick={triggerAutoDetect}
                  disabled={isScanning}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isDark
                      ? 'bg-[#131c31] border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80'
                      : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <span className={`material-symbols-outlined text-[20px] ${isScanning ? 'animate-spin' : ''}`}>
                        radar
                      </span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-500 uppercase">Otomatis</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      Auto-Detect Global
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Pindai otomatis seluruh port &amp; perangkat aktif secara global.
                    </p>
                  </div>
                </button>
              </div>

              {/* Hardware Diagnostic Matrix */}
              <div
                className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/20">
                  <span className="font-bold text-slate-600 dark:text-slate-300">
                    Status Dukungan API Hardware Browser:
                  </span>
                  <span className="text-[11px] text-slate-400">Pemeriksaan Hardware Live</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hardwareSupport.bluetooth ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span>Web Bluetooth:</span>
                    <strong className={hardwareSupport.bluetooth ? 'text-emerald-500' : 'text-amber-500'}>
                      {hardwareSupport.bluetooth ? 'Didukung' : 'Simulasi'}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hardwareSupport.usb ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span>WebUSB:</span>
                    <strong className={hardwareSupport.usb ? 'text-emerald-500' : 'text-amber-500'}>
                      {hardwareSupport.usb ? 'Didukung' : 'Simulasi'}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hardwareSupport.serial ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span>Web Serial:</span>
                    <strong className={hardwareSupport.serial ? 'text-emerald-500' : 'text-amber-500'}>
                      {hardwareSupport.serial ? 'Didukung' : 'Simulasi'}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Print Spooler:</span>
                    <strong className="text-emerald-500">Aktif</strong>
                  </div>
                </div>
              </div>

              {/* Thermal Diagnostic & Test Operations */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestPrint}
                    disabled={isTesting || !connectedPrinter}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isTesting ? 'animate-spin' : ''}`}>
                      description
                    </span>
                    <span>{isTesting ? 'Menguji...' : 'Uji Cetak Thermal (ESC/POS)'}</span>
                  </button>

                  <button
                    onClick={() => feedPaper(3)}
                    disabled={!connectedPrinter}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                      isDark
                        ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                        : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    <span>Feed Kertas (3 Baris)</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400">
                  Kompatibel dengan kertas 58mm &amp; 80mm
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: DAFTAR PRINTER TERSIMPAN */}
          {activeSubTab === 'printers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">Daftar Perangkat Thermal Tersimpan</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sistem akan otomatis menghubungkan printer dengan tanda Utama saat kasir dibuka.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showAddForm ? 'close' : 'add'}
                  </span>
                  <span>{showAddForm ? 'Tutup' : 'Tambah Printer'}</span>
                </button>
              </div>

              {/* Add Custom Printer Form */}
              {showAddForm && (
                <form
                  onSubmit={handleSaveCustom}
                  className={`p-4 rounded-xl border space-y-3 animate-in fade-in ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Simpan Profil Printer Manual
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Nama Perangkat</label>
                      <input
                        type="text"
                        placeholder="Contoh: POS-58 Mini Kasir"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        className={`w-full px-3 py-1.5 text-xs rounded-lg border outline-none ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-slate-100'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Tipe Koneksi</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as PrinterInterfaceType)}
                        className={`w-full px-3 py-1.5 text-xs rounded-lg border outline-none ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-slate-100'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="bluetooth">Bluetooth Thermal</option>
                        <option value="usb">USB Mini Cable</option>
                        <option value="serial">Serial / COM Port</option>
                        <option value="network">LAN / WiFi Network</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold mb-1">Lebar Kertas</label>
                      <select
                        value={newWidth}
                        onChange={(e) => setNewWidth(e.target.value as PaperWidth)}
                        className={`w-full px-3 py-1.5 text-xs rounded-lg border outline-none ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-slate-100'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="58mm">58mm (Mini Pocket)</option>
                        <option value="80mm">80mm (Standar POS)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                    >
                      Simpan Profil
                    </button>
                  </div>
                </form>
              )}

              {/* Printers List */}
              <div className="space-y-2.5">
                {pairedPrinters.map((printer) => {
                  const isCurrent = connectedPrinter?.id === printer.id && status === 'connected';

                  return (
                    <div
                      key={printer.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isCurrent
                          ? isDark
                            ? 'bg-blue-950/20 border-blue-800/60'
                            : 'bg-blue-50/60 border-blue-200'
                          : isDark
                          ? 'bg-slate-900/60 border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : isDark
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {printer.type === 'bluetooth' ? 'bluetooth' : 'usb'}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                              {printer.name}
                            </h5>
                            {printer.isDefault && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                UTAMA
                              </span>
                            )}
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                AKTIF
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{printer.type.toUpperCase()}</span>
                            <span>•</span>
                            <span>{printer.paperWidth}</span>
                            {printer.lastConnected && (
                              <>
                                <span>•</span>
                                <span>Terakhir: {printer.lastConnected}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {!printer.isDefault && (
                          <button
                            onClick={() => setDefaultPrinter(printer.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 rounded transition-colors cursor-pointer"
                          >
                            Jadikan Utama
                          </button>
                        )}

                        {isCurrent ? (
                          <button
                            onClick={disconnectPrinter}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                          >
                            Putuskan
                          </button>
                        ) : (
                          <button
                            onClick={() => reconnectPrinter(printer.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            Hubungkan
                          </button>
                        )}

                        <button
                          onClick={() => removePairedPrinter(printer.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                          title="Hapus dari daftar"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PENGATURAN OTOMATIS */}
          {activeSubTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-sm">Konfigurasi Sistem Cetak Otomatis</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Atur perilaku sistem saat mendeteksi printer dan melakukan transaksi kasir.
                </p>
              </div>

              <div
                className={`p-5 rounded-xl border space-y-4 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                {/* Auto Detect on Startup */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/20">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Deteksi Otomatis Saat Aplikasi Dibuka
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sistem secara otomatis memindai port Bluetooth &amp; USB untuk mendeteksi printer mini kasir.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoDetectOnStartup}
                      onChange={(e) => updateSettings({ autoDetectOnStartup: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                {/* Auto Print on Checkout */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/20">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Cetak Otomatis Setelah Transaksi Selesai (Auto-Print)
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Langsung mencetak struk ke printer Bluetooth tanpa perlu kasir menekan tombol Cetak.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoPrintOnCheckout}
                      onChange={(e) => updateSettings({ autoPrintOnCheckout: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                {/* Paper Width Selection */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/20">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Ukuran Format Kertas Thermal
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pilih format lebar kertas sesuai spesifikasi roll printer thermal Anda.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSettings({ paperWidth: '58mm' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        settings.paperWidth === '58mm'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      58mm (Mini Pocket)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ paperWidth: '80mm' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        settings.paperWidth === '80mm'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      80mm (Standar POS)
                    </button>
                  </div>
                </div>

                {/* Auto Cutter */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/20">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Perintah Potong Kertas Otomatis (Auto-Cutter)
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Kirim perintah pemotong kertas (GS V) setelah struk selesai dicetak.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.cutPaper}
                      onChange={(e) => updateSettings({ cutPaper: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>

                {/* Sound Alerts */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Suara Notifikasi Koneksi &amp; Cetak
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Bunyikan sinyal nada saat printer terhubung, mencetak, atau terputus.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundAlerts}
                      onChange={(e) => updateSettings({ soundAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PANDUAN & TIPS */}
          {activeSubTab === 'guide' && (
            <div className="space-y-4 text-xs">
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h5 className="font-bold text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">bluetooth</span>
                  Panduan Menghubungkan Printer Bluetooth Mini
                </h5>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>Nyalakan printer Bluetooth thermal mini Anda sampai lampu indikator daya menyala.</li>
                  <li>Pastikan Bluetooth di smartphone/tablet atau laptop kasir Anda aktif.</li>
                  <li>Jika diminta PIN pairing saat pertama kali, masukkan kode standar: <strong>0000</strong> atau <strong>1234</strong>.</li>
                  <li>Klik tombol <strong>&quot;Pindai Printer Bluetooth&quot;</strong> di aplikasi KASIRKU dan pilih perangkat Anda.</li>
                  <li>Status akan langsung berubah menjadi <strong>Terhubung</strong> secara otomatis.</li>
                </ol>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h5 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Merek &amp; Seri Printer Mini yang Didukung
                </h5>
                <p className="text-slate-600 dark:text-slate-300">
                  KASIRKU menggunakan standar universal <strong>ESC/POS Thermal Protocol</strong> yang kompatibel dengan seluruh printer thermal mini:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-800/10 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700">
                    • POS-58 / POS-80
                  </div>
                  <div className="p-2 rounded bg-slate-800/10 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700">
                    • RPP-02N / RPP-200
                  </div>
                  <div className="p-2 rounded bg-slate-800/10 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700">
                    • Panda PRJ-58D / 80
                  </div>
                  <div className="p-2 rounded bg-slate-800/10 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700">
                    • Eppos EP5802AI
                  </div>
                  <div className="p-2 rounded bg-slate-800/10 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700">
                    • Xprinter XP-58 / XP-80
                  </div>
                  <div className="p-2 rounded bg-slate-800/10 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700">
                    • Sunmi V1/V2 &amp; BellaV
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-6 py-3.5 border-t text-xs ${
            isDark ? 'border-slate-800 bg-[#131c31]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              {status === 'connected'
                ? `Aktif: ${connectedPrinter?.name || 'Printer'} (${connectedPrinter?.paperWidth})`
                : 'Tidak ada printer terhubung'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenModal(false)}
              className="px-4 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Floating Global Toast Notification for Printer Events
 */
export const GlobalPrinterToast: React.FC<{ theme: AppTheme }> = ({ theme }) => {
  const { activeNotification, dismissNotification, setOpenModal } = usePrinter();
  const isDark = theme === 'glacier-dark';

  if (!activeNotification) return null;

  return (
    <div
      id="global-printer-toast"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200"
    >
      <div
        className={`p-4 rounded-xl border shadow-xl flex items-start gap-3 ${
          activeNotification.type === 'success'
            ? isDark
              ? 'bg-emerald-950/90 border-emerald-700 text-slate-100'
              : 'bg-white border-emerald-300 text-slate-900 shadow-emerald-500/10'
            : activeNotification.type === 'warning'
            ? isDark
              ? 'bg-amber-950/90 border-amber-700 text-slate-100'
              : 'bg-white border-amber-300 text-slate-900 shadow-amber-500/10'
            : isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-300 text-slate-900 shadow-md'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            activeNotification.type === 'success'
              ? 'bg-emerald-500 text-white'
              : activeNotification.type === 'warning'
              ? 'bg-amber-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {activeNotification.type === 'success'
              ? 'print'
              : activeNotification.type === 'warning'
              ? 'print_disabled'
              : 'bluetooth_searching'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-xs">{activeNotification.title}</h5>
            <span className="text-[10px] text-slate-400 font-mono">{activeNotification.timestamp}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
            {activeNotification.message}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => {
                setOpenModal(true);
                dismissNotification();
              }}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Kelola Printer &rarr;
            </button>
            <button
              onClick={dismissNotification}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

        <button
          onClick={dismissNotification}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
