import { Transaction, PaperWidth } from '../types';
import { formatRupiah } from './formatters';

export interface ReceiptStoreInfo {
  name: string;
  address?: string;
  phone?: string;
  footer?: string;
}

export class EscPosEncoder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  init(): this {
    this.buffer.push(0x1b, 0x40); // ESC @ (Initialize printer)
    return this;
  }

  alignCenter(): this {
    this.buffer.push(0x1b, 0x61, 0x01);
    return this;
  }

  alignLeft(): this {
    this.buffer.push(0x1b, 0x61, 0x00);
    return this;
  }

  alignRight(): this {
    this.buffer.push(0x1b, 0x61, 0x02);
    return this;
  }

  bold(enable = true): this {
    this.buffer.push(0x1b, 0x45, enable ? 0x01 : 0x00);
    return this;
  }

  size(doubleWidth = false, doubleHeight = false): this {
    let n = 0;
    if (doubleWidth) n |= 0x20;
    if (doubleHeight) n |= 0x01;
    this.buffer.push(0x1d, 0x21, n);
    return this;
  }

  text(str: string): this {
    // Basic ASCII encoding
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      this.buffer.push(code > 127 ? 0x3f : code); // replace non-ASCII with ?
    }
    return this;
  }

  line(str = ''): this {
    this.text(str);
    this.buffer.push(0x0a); // LF
    return this;
  }

  feed(lines = 2): this {
    this.buffer.push(0x1b, 0x64, lines);
    return this;
  }

  cut(): this {
    this.buffer.push(0x1d, 0x56, 0x42, 0x00); // GS V 66 0 (Partial cut)
    return this;
  }

  getUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Format string into two columns aligned left and right
 */
export function formatTwoColumns(left: string, right: string, maxCols: number): string {
  const leftMax = maxCols - right.length - 1;
  const cleanLeft = left.length > leftMax ? left.slice(0, Math.max(0, leftMax - 1)) + '…' : left;
  const spaces = Math.max(1, maxCols - cleanLeft.length - right.length);
  return cleanLeft + ' '.repeat(spaces) + right;
}

/**
 * Convert transaction into ESC/POS binary buffer
 */
export function generateReceiptEscPos(
  tx: Transaction,
  store: ReceiptStoreInfo,
  paperWidth: PaperWidth = '58mm',
  cut = true
): Uint8Array {
  const encoder = new EscPosEncoder();
  const maxCols = paperWidth === '58mm' ? 32 : 48;
  const divider = '-'.repeat(maxCols);
  const doubleDivider = '='.repeat(maxCols);

  encoder.init();

  // Header
  encoder.alignCenter();
  encoder.bold(true).size(true, true).line(store.name || 'KASIRKU STORE');
  encoder.bold(false).size(false, false);

  if (store.address) {
    encoder.line(store.address);
  }
  if (store.phone) {
    encoder.line(`Telp: ${store.phone}`);
  }
  encoder.line(doubleDivider);

  // Transaction Meta
  encoder.alignLeft();
  encoder.line(formatTwoColumns(`No: #${tx.id}`, tx.dateFormatted, maxCols));
  encoder.line(formatTwoColumns(`Kasir: ${tx.cashierName}`, `Status: ${tx.status}`, maxCols));
  if (tx.customerName) {
    encoder.line(formatTwoColumns(`Pelanggan:`, tx.customerName, maxCols));
  }
  encoder.line(divider);

  // Items
  for (const item of tx.items) {
    encoder.bold(true).line(item.productName).bold(false);
    const qtyPrice = `${item.quantity} x ${formatRupiah(item.price)}`;
    const total = formatRupiah(item.total);
    encoder.line(formatTwoColumns(`  ${qtyPrice}`, total, maxCols));
  }
  encoder.line(divider);

  // Summary
  encoder.line(formatTwoColumns('Subtotal:', formatRupiah(tx.subtotal), maxCols));
  if (tx.discount > 0) {
    encoder.line(formatTwoColumns('Diskon:', `-${formatRupiah(tx.discount)}`, maxCols));
  }
  encoder.line(formatTwoColumns('Pajak (0%):', formatRupiah(tx.tax), maxCols));

  encoder.bold(true).size(false, true);
  encoder.line(formatTwoColumns('TOTAL:', formatRupiah(tx.total), maxCols));
  encoder.bold(false).size(false, false);
  encoder.line(divider);

  // Payment
  encoder.line(formatTwoColumns('Metode Bayar:', tx.paymentMethod, maxCols));
  encoder.line(formatTwoColumns('Jumlah Bayar:', formatRupiah(tx.amountPaid), maxCols));
  encoder.bold(true).line(formatTwoColumns('Kembalian:', formatRupiah(tx.change), maxCols)).bold(false);
  encoder.line(doubleDivider);

  // Footer
  encoder.alignCenter();
  encoder.bold(true).line('*** TERIMA KASIH ***').bold(false);
  if (store.footer) {
    encoder.line(store.footer);
  } else {
    encoder.line('Barang yang sudah dibeli tidak dapat');
    encoder.line('ditukar atau dikembalikan.');
  }
  encoder.line('kasirku.app - Cloud POS');

  encoder.feed(3);
  if (cut) {
    encoder.cut();
  }

  return encoder.getUint8Array();
}

/**
 * Generate test pattern for self-test on mini thermal printer
 */
export function generateTestReceiptEscPos(
  deviceName: string,
  paperWidth: PaperWidth = '58mm'
): Uint8Array {
  const encoder = new EscPosEncoder();
  const maxCols = paperWidth === '58mm' ? 32 : 48;
  const divider = '='.repeat(maxCols);

  encoder.init();
  encoder.alignCenter();
  encoder.bold(true).size(true, true).line('KASIRKU POS').bold(false).size(false, false);
  encoder.line('UJI CETAK THERMAL PRINTER');
  encoder.line(divider);

  encoder.alignLeft();
  encoder.line(`Printer : ${deviceName}`);
  encoder.line(`Format  : ${paperWidth} Thermal`);
  encoder.line(`Waktu   : ${new Date().toLocaleString('id-ID')}`);
  encoder.line(`Status  : OK / Siap Cetak`);
  encoder.line('-'.repeat(maxCols));

  encoder.alignCenter();
  encoder.bold(true).line('TEST CETAK TEKS & FONT').bold(false);
  encoder.line('Normal Text: 1234567890 ABCDEF');
  encoder.bold(true).line('Bold Text: Tebal & Jelas').bold(false);
  encoder.size(false, true).line('Double Height Test').size(false, false);
  encoder.line('-'.repeat(maxCols));

  encoder.line('[✓] Head Thermal Bersih');
  encoder.line('[✓] Koneksi Bluetooth / USB Stabil');
  encoder.line('[✓] Auto-cutter Ready');
  encoder.line(divider);
  encoder.line('SISTEM DETEKSI GLOBAL SIAP');

  encoder.feed(3);
  encoder.cut();

  return encoder.getUint8Array();
}
