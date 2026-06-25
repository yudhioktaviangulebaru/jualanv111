import { rupiah, formatDate } from './format';

/** Satu baris item pada struk. */
export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

/** Data yang dibutuhkan untuk mencetak struk thermal. */
export interface ReceiptData {
  storeName?: string;
  transactionId?: string | number;
  /** ISO date string. */
  date: string;
  cashier?: string;
  items: ReceiptItem[];
  total: number;
  paymentType: string;
  /** Uang diterima (tunai). */
  paid?: number | null;
  /** Kembalian = paid - total. */
  change?: number | null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(data: ReceiptData): string {
  const store = escapeHtml(data.storeName ?? 'JUALAN APP');

  const itemsHtml = data.items
    .map((it) => {
      const subtotal = it.qty * it.price;
      return `
        <div class="item">
          <div class="name">${escapeHtml(it.name)}</div>
          <div class="row">
            <span>${it.qty} x ${escapeHtml(rupiah(it.price))}</span>
            <span>${escapeHtml(rupiah(subtotal))}</span>
          </div>
        </div>`;
    })
    .join('');

  const payRows: string[] = [
    `<div class="row bold"><span>TOTAL</span><span>${escapeHtml(rupiah(data.total))}</span></div>`,
    `<div class="row"><span>Metode</span><span>${escapeHtml(data.paymentType || '-')}</span></div>`,
  ];
  if (data.paid != null) {
    payRows.push(
      `<div class="row"><span>Bayar</span><span>${escapeHtml(rupiah(data.paid))}</span></div>`,
    );
  }
  if (data.change != null) {
    payRows.push(
      `<div class="row"><span>Kembali</span><span>${escapeHtml(rupiah(data.change))}</span></div>`,
    );
  }

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Struk</title>
<style>
  @page { size: 58mm auto; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 58mm; }
  body {
    padding: 2mm 3mm;
    font-family: 'Courier New', ui-monospace, monospace;
    font-size: 11px;
    line-height: 1.35;
    color: #000;
    background: #fff;
  }
  .center { text-align: center; }
  .bold { font-weight: 700; }
  .store { font-size: 14px; font-weight: 700; }
  .muted { font-size: 10px; }
  .divider { border-top: 1px dashed #000; margin: 4px 0; }
  .row { display: flex; justify-content: space-between; gap: 6px; }
  .item { margin-bottom: 2px; }
  .name { word-break: break-word; }
  .foot { margin-top: 6px; }
</style>
</head>
<body>
  <div class="center store">${store}</div>
  <div class="center muted">${escapeHtml(formatDate(data.date))}</div>
  ${data.transactionId != null ? `<div class="center muted">No. ${escapeHtml(String(data.transactionId))}</div>` : ''}
  ${data.cashier ? `<div class="center muted">Kasir: ${escapeHtml(data.cashier)}</div>` : ''}
  <div class="divider"></div>
  ${itemsHtml}
  <div class="divider"></div>
  ${payRows.join('')}
  <div class="divider"></div>
  <div class="center foot">Terima kasih</div>
</body>
</html>`;
}

/**
 * Cetak struk lewat printer thermal. Membuat iframe tersembunyi lalu memanggil
 * print() — lebih andal daripada window.open (tidak diblokir popup blocker)
 * dan tidak mengganggu style halaman utama.
 */
export function printReceipt(data: ReceiptData): void {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    return;
  }

  const run = () => {
    win.focus();
    win.print();
    // Beri jeda agar dialog print sempat membaca dokumen sebelum iframe dibuang.
    setTimeout(() => iframe.remove(), 1000);
  };

  doc.open();
  doc.write(buildHtml(data));
  doc.close();

  if (doc.readyState === 'complete') run();
  else iframe.onload = run;
}
