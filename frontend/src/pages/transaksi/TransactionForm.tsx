import { useMemo, useRef, useState } from 'preact/hooks';
import { RiAddLine, RiDeleteBinLine, RiPrinterLine } from '@remixicon/react';
import { listStocks } from '@/api/stock';
import { useAuth } from '@/auth/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { rupiah } from '@/lib/format';
import type { ReceiptData } from '@/lib/receipt';
import { buttonClass, inputClass, Spinner, ErrorState } from '@/components/ui';
import type { TransactionInput } from '@/types/transaction';

/** Satu baris item yang sudah masuk keranjang. */
interface CartItem {
  stock_id: string;
  qty: number;
}

/** Metode bawaan; selain ini kasir memilih "Lainnya" lalu mengetik manual. */
const PAYMENT_TYPES = ['Tunai', 'QRIS', 'DEBIT'] as const;
const OTHER = 'Lainnya';

interface TransactionFormProps {
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: TransactionInput, receipt?: ReceiptData) => void;
  onCancel: () => void;
}

/** Tanggal hari ini dalam format YYYY-MM-DD untuk input[type=date]. */
const today = () => new Date().toISOString().slice(0, 10);

export function TransactionForm({
  submitting = false,
  submitLabel = 'Simpan',
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const { data: stocks, loading, error, reload } = useAsync(listStocks, []);
  const { user } = useAuth();
  const cashierName = user?.name || user?.email || undefined;

  const [date, setDate] = useState(today());
  const [paymentType, setPaymentType] = useState<string>('Tunai');
  const [otherPayment, setOtherPayment] = useState('');
  const [hasPayment, setHasPayment] = useState(false);

  // Baris input (row pertama tabel) untuk menambah item.
  const [pickStock, setPickStock] = useState('');
  const [pickQty, setPickQty] = useState('');
  const pickRef = useRef<HTMLSelectElement>(null);

  const [items, setItems] = useState<CartItem[]>([]);
  const [paid, setPaid] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const stockLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of stocks ?? []) {
      const product = s.product?.name ?? `Produk #${s.product_id}`;
      const warehouse = s.warehouse?.name ?? `Gudang #${s.warehouse_id}`;
      map.set(String(s.id), `${product} — ${warehouse} (stok: ${Number(s.stock)})`);
    }
    return map;
  }, [stocks]);

  /** Nama produk per stock_id (untuk tampilan tabel & struk). */
  const productName = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of stocks ?? []) {
      map.set(String(s.id), s.product?.name ?? `Stok #${s.id}`);
    }
    return map;
  }, [stocks]);

  /** Stok tersedia per stock_id untuk validasi qty. */
  const available = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of stocks ?? []) map.set(String(s.id), Number(s.stock) || 0);
    return map;
  }, [stocks]);

  /** Harga jual (referensi produk) per stock_id. */
  const sellPrice = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of stocks ?? []) {
      map.set(String(s.id), Number(s.product?.sell_price) || 0);
    }
    return map;
  }, [stocks]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + it.qty * (sellPrice.get(it.stock_id) ?? 0),
        0,
      ),
    [items, sellPrice],
  );

  const paidNum = Number(paid) || 0;
  const change = paidNum - total;

  const pickPrice = pickStock ? sellPrice.get(pickStock) ?? 0 : 0;
  const pickQtyNum = Number(pickQty) || 0;

  const addItem = () => {
    if (!pickStock) {
      setFormError('Pilih produk dulu.');
      return;
    }
    const qty = Number(pickQty);
    if (pickQty === '' || Number.isNaN(qty) || qty <= 0) {
      setFormError('Qty harus angka lebih dari 0.');
      return;
    }
    const stok = available.get(pickStock) ?? 0;
    const existing = items.find((it) => it.stock_id === pickStock)?.qty ?? 0;
    if (existing + qty > stok) {
      setFormError(`Qty melebihi stok tersedia (${stok}).`);
      return;
    }
    if ((sellPrice.get(pickStock) ?? 0) <= 0) {
      setFormError('Produk belum punya harga jual.');
      return;
    }

    setItems((list) => {
      const idx = list.findIndex((it) => it.stock_id === pickStock);
      if (idx >= 0) {
        return list.map((it, i) =>
          i === idx ? { ...it, qty: it.qty + qty } : it,
        );
      }
      return [...list, { stock_id: pickStock, qty }];
    });
    setPickStock('');
    setPickQty('');
    setFormError(null);
    pickRef.current?.focus();
  };

  const setItemQty = (stockId: string, value: string) => {
    const qty = Number(value);
    setItems((list) =>
      list.map((it) =>
        it.stock_id === stockId
          ? { ...it, qty: Number.isNaN(qty) ? 0 : qty }
          : it,
      ),
    );
  };

  const removeItem = (stockId: string) =>
    setItems((list) => list.filter((it) => it.stock_id !== stockId));

  const buildSubmit = (): {
    values: TransactionInput;
    receipt: ReceiptData;
  } | null => {
    if (items.length === 0) {
      setFormError('Tambahkan minimal satu item.');
      return null;
    }

    const details = [];
    const receiptItems = [];
    for (const it of items) {
      const stok = available.get(it.stock_id) ?? 0;
      if (it.qty <= 0) {
        setFormError(`${productName.get(it.stock_id)}: qty harus lebih dari 0.`);
        return null;
      }
      if (it.qty > stok) {
        setFormError(
          `${productName.get(it.stock_id)}: qty melebihi stok tersedia (${stok}).`,
        );
        return null;
      }
      const price = sellPrice.get(it.stock_id) ?? 0;
      if (price <= 0) {
        setFormError(
          `${productName.get(it.stock_id)}: produk belum punya harga jual.`,
        );
        return null;
      }
      // price tetap dikirim untuk kompatibilitas; backend memakai harga jual
      // dari referensi produk sebagai sumber otoritatif.
      details.push({ stock_id: it.stock_id, qty: it.qty, price });
      receiptItems.push({
        name: productName.get(it.stock_id) ?? `Stok #${it.stock_id}`,
        qty: it.qty,
        price,
      });
    }

    const finalPayment = paymentType === OTHER ? otherPayment.trim() : paymentType;
    if (paymentType === OTHER && !finalPayment) {
      setFormError('Isi metode pembayaran lainnya.');
      return null;
    }

    setFormError(null);
    return {
      values: {
        date: date ? new Date(date).toISOString() : undefined,
        payment_type: finalPayment,
        has_payment: hasPayment ? 'TRUE' : 'FALSE',
        details,
      },
      receipt: {
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        cashier: cashierName,
        items: receiptItems,
        total,
        paymentType: finalPayment,
        paid: paid !== '' ? paidNum : null,
        change: paid !== '' ? change : null,
      },
    };
  };

  const handleSubmit = (e: Event, print: boolean) => {
    e.preventDefault();
    const built = buildSubmit();
    if (!built) return;
    onSubmit(built.values, print ? built.receipt : undefined);
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const hasStocks = (stocks ?? []).length > 0;

  return (
    <form class="flex flex-col gap-5" onSubmit={(e) => handleSubmit(e, false)} novalidate>
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="date">
            Tanggal
          </label>
          <input
            id="date"
            type="date"
            class={inputClass}
            value={date}
            onInput={(e) => setDate((e.target as HTMLInputElement).value)}
            disabled={submitting}
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="payment_type">
            Metode pembayaran
          </label>
          <select
            id="payment_type"
            class={inputClass}
            value={paymentType}
            onChange={(e) => setPaymentType((e.target as HTMLSelectElement).value)}
            disabled={submitting}
          >
            {PAYMENT_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value={OTHER}>{OTHER}</option>
          </select>
          {paymentType === OTHER && (
            <input
              type="text"
              class={`${inputClass} mt-2`}
              value={otherPayment}
              onInput={(e) => setOtherPayment((e.target as HTMLInputElement).value)}
              placeholder="Metode pembayaran lainnya"
              disabled={submitting}
            />
          )}
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium">Status bayar</label>
          <label class="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-line bg-canvas px-3 text-sm">
            <input
              type="checkbox"
              checked={hasPayment}
              onChange={(e) => setHasPayment((e.target as HTMLInputElement).checked)}
              disabled={submitting}
            />
            {hasPayment ? 'Sudah dibayar' : 'Belum dibayar'}
          </label>
        </div>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium">Item penjualan</label>

        {!hasStocks ? (
          <p class="rounded-lg border border-line bg-canvas px-3 py-3 text-sm text-muted">
            Belum ada stok yang bisa dijual. Tambahkan stok lewat Stock In dulu.
          </p>
        ) : (
          <div class="overflow-x-auto rounded-lg border border-line">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-line bg-canvas text-muted">
                <tr>
                  <th class="px-3 py-2.5 font-medium">Produk</th>
                  <th class="w-28 px-3 py-2.5 text-right font-medium">Qty</th>
                  <th class="w-36 px-3 py-2.5 text-right font-medium">Harga</th>
                  <th class="w-36 px-3 py-2.5 text-right font-medium">Subtotal</th>
                  <th class="w-14 px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {/* Row pertama: baris input untuk menambah item. */}
                <tr class="border-b border-line bg-canvas/60">
                  <td class="px-3 py-2">
                    <select
                      ref={pickRef}
                      class={inputClass}
                      value={pickStock}
                      onChange={(e) =>
                        setPickStock((e.target as HTMLSelectElement).value)
                      }
                      disabled={submitting}
                    >
                      <option value="">— Pilih produk —</option>
                      {(stocks ?? []).map((s) => (
                        <option key={s.id} value={s.id}>
                          {stockLabel.get(String(s.id))}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td class="px-3 py-2">
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      class={`${inputClass} text-right`}
                      value={pickQty}
                      onInput={(e) =>
                        setPickQty((e.target as HTMLInputElement).value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem();
                        }
                      }}
                      placeholder="0"
                      disabled={submitting}
                    />
                  </td>
                  <td class="px-3 py-2 text-right tabular-nums text-muted">
                    {pickStock ? rupiah(pickPrice) : '—'}
                  </td>
                  <td class="px-3 py-2 text-right font-medium tabular-nums">
                    {pickStock ? rupiah(pickPrice * pickQtyNum) : '—'}
                  </td>
                  <td class="px-3 py-2 text-center">
                    <button
                      type="button"
                      title="Tambah item"
                      class={buttonClass('primary', 'h-9 w-9 !px-0')}
                      onClick={addItem}
                      disabled={submitting}
                    >
                      <RiAddLine size={18} />
                    </button>
                  </td>
                </tr>

                {/* Baris item yang sudah ditambahkan. */}
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      class="px-3 py-6 text-center text-sm text-muted"
                    >
                      Belum ada item. Pilih produk lalu tekan tombol tambah.
                    </td>
                  </tr>
                ) : (
                  items.map((it) => {
                    const price = sellPrice.get(it.stock_id) ?? 0;
                    return (
                      <tr
                        key={it.stock_id}
                        class="border-b border-line last:border-0"
                      >
                        <td class="px-3 py-2.5 font-medium">
                          {productName.get(it.stock_id)}
                        </td>
                        <td class="px-3 py-2">
                          <input
                            type="number"
                            min="1"
                            inputMode="numeric"
                            class={`${inputClass} text-right`}
                            value={String(it.qty)}
                            onInput={(e) =>
                              setItemQty(
                                it.stock_id,
                                (e.target as HTMLInputElement).value,
                              )
                            }
                            disabled={submitting}
                          />
                        </td>
                        <td class="px-3 py-2.5 text-right tabular-nums text-muted">
                          {rupiah(price)}
                        </td>
                        <td class="px-3 py-2.5 text-right font-medium tabular-nums">
                          {rupiah(price * it.qty)}
                        </td>
                        <td class="px-3 py-2 text-center">
                          <button
                            type="button"
                            title="Hapus item"
                            class="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-400"
                            onClick={() => removeItem(it.stock_id)}
                            disabled={submitting}
                          >
                            <RiDeleteBinLine size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total, bayar, dan kembalian. */}
      <div class="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-3">
        <div class="flex items-center justify-between gap-3 sm:flex-col sm:items-start">
          <span class="text-sm text-muted">Total</span>
          <span class="text-lg font-semibold tabular-nums">{rupiah(total)}</span>
        </div>
        <div>
          <label class="mb-1.5 block text-sm text-muted" for="paid">
            Bayar (uang diterima)
          </label>
          <input
            id="paid"
            type="number"
            min="0"
            inputMode="numeric"
            class={`${inputClass} text-right`}
            value={paid}
            onInput={(e) => setPaid((e.target as HTMLInputElement).value)}
            placeholder="0"
            disabled={submitting}
          />
        </div>
        <div class="flex items-center justify-between gap-3 sm:flex-col sm:items-start">
          <span class="text-sm text-muted">Kembalian</span>
          <span
            class={`text-lg font-semibold tabular-nums ${
              paid === '' ? 'text-muted' : change < 0 ? 'text-red-400' : ''
            }`}
          >
            {paid === ''
              ? '—'
              : change < 0
                ? `Kurang ${rupiah(-change)}`
                : rupiah(change)}
          </span>
        </div>
      </div>

      {formError && (
        <p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {formError}
        </p>
      )}

      <div class="flex flex-wrap gap-3 pt-1">
        <button
          type="submit"
          class={buttonClass('primary')}
          disabled={submitting || !hasStocks}
        >
          {submitting ? 'Menyimpan…' : submitLabel}
        </button>
        <button
          type="button"
          class={buttonClass('outline')}
          onClick={(e) => handleSubmit(e, true)}
          disabled={submitting || !hasStocks}
        >
          <RiPrinterLine size={16} />
          Simpan &amp; Cetak struk
        </button>
        <button
          type="button"
          class={buttonClass('ghost')}
          onClick={onCancel}
          disabled={submitting}
        >
          Batal
        </button>
      </div>
    </form>
  );
}
