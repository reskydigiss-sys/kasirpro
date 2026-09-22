import React from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';

interface PrintableReceiptProps {
  transaction: Transaction | null;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({ transaction }) => {
  if (!transaction) return null;

  return (
    <div id="printable-receipt" className="hidden print:block p-4 font-mono text-[12px] leading-tight text-black max-w-[80mm] mx-auto bg-white">
      {/* Receipt Header */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <h1 className="text-base font-bold tracking-wider">KASIRKU STORE</h1>
        <p className="text-[10px]">OPERATIONAL CENTER</p>
        <p className="text-[10px] mt-0.5">Jl. Jend. Sudirman Kav. 24, Jakarta</p>
        <p className="text-[10px]">Telp: 0812-3456-7890</p>
      </div>

      {/* Meta Information */}
      <div className="py-2 border-b border-dashed border-black text-[11px] space-y-0.5">
        <div className="flex justify-between">
          <span>No: #{transaction.id}</span>
          <span>{transaction.dateFormatted}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir: {transaction.cashierName}</span>
          <span>Status: {transaction.status}</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-2 border-b border-dashed border-black">
        <table className="w-full text-left text-[11px]">
          <thead>
            <tr className="border-b border-black">
              <th className="pb-1">Item</th>
              <th className="pb-1 text-center">Qty</th>
              <th className="pb-1 text-right">Harga</th>
              <th className="pb-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed divide-black/30">
            {transaction.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-1 pr-1 truncate max-w-[90px]">{item.productName}</td>
                <td className="py-1 text-center">{item.quantity}</td>
                <td className="py-1 text-right">{formatRupiah(item.price)}</td>
                <td className="py-1 text-right font-bold">{formatRupiah(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Breakdown */}
      <div className="py-2 border-b border-dashed border-black text-[11px] space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatRupiah(transaction.subtotal)}</span>
        </div>
        {transaction.discount > 0 && (
          <div className="flex justify-between">
            <span>Diskon:</span>
            <span>-{formatRupiah(transaction.discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Pajak (0%):</span>
          <span>{formatRupiah(transaction.tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-[13px] pt-1 border-t border-black">
          <span>TOTAL:</span>
          <span>{formatRupiah(transaction.total)}</span>
        </div>
      </div>

      {/* Payment details */}
      <div className="py-2 border-b border-dashed border-black text-[11px] space-y-1">
        <div className="flex justify-between">
          <span>Metode Bayar:</span>
          <span>{transaction.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span>Jumlah Bayar:</span>
          <span>{formatRupiah(transaction.amountPaid)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Kembalian:</span>
          <span>{formatRupiah(transaction.change)}</span>
        </div>
      </div>

      {/* Footer message */}
      <div className="text-center pt-3 space-y-1 text-[10px]">
        <p className="font-bold">*** TERIMA KASIH ***</p>
        <p>Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.</p>
        <p className="text-[9px] text-gray-500 mt-2">kasirku.app • Powered by AI Studio</p>
      </div>
    </div>
  );
};
