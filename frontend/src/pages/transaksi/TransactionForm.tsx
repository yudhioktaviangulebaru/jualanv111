import { useMemo, useState } from 'preact/hooks';
import { RiAddLine, RiDeleteBinLine } from '@remixicon/react';
import { listStocks } from '@/api/stock';
import { useAsync } from '@/hooks/useAsync';
import { rupiah } from '@/lib/format';
import { buttonClass, inputClass, Spinner, ErrorState } from '@/components/ui';
import type { TransactionInput } from '@/types/transaction';

interface DetailRow {
  stock_id: string;
  qty: string;
}

/** Metode bawaan; selain ini kasir memilih "Lainnya" lalu mengetik manual. */
const PAYMENT_TYPES = ['Tunai', 'QRIS', 'DEBIT'] as const;
const OTHER = 'Lainnya';

interface TransactionFormProps {
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: TransactionInput) => void;
  onCancel: () => void;
}

const emptyRow = (): DetailRow => ({ stock_id: '', qty: '' });

/** Tanggal hari ini dalam format YYYY-MM-DD untuk input[type=date]. */
const today = () => new Date().toISOString().slice(0, 10);

export function TransactionForm({
  submitting = false,
  submitLabel = 'Simpan',
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const { data: stocks, loading, error, reload } = useAsync(listStocks, []);

  const [date, setDate] = useState(today());
  const [paymentType, setPaymentType] = useState<string>('Tunai');
  const [otherPayment, setOtherPayment] = useState('');
  const [hasPayment, setHasPayment] = useState(false);
  const [rows, setRows] = useState<DetailRow[]>([emptyRow()]);
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
      rows.reduce((sum, r) => {
        const qty = Number(r.qty);
        const price = sellPrice.get(r.stock_id) ?? 0;
        if (Number.isNaN(qty)) return sum;
        return sum + qty * price;
      }, 0),
    [rows, sellPrice],
  );

  const updateRow = (index: number, patch: Partial<DetailRow>) => {
    setRows((list) => list.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };
  const addRow = () => setRows((list) => [...list, emptyRow()]);
  const removeRow = (index: number) =>
    setRows((list) => (list.length === 1 ? list : list.filter((_, i) => i !== index)));

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const details = [];
    for (const [i, r] of rows.entries()) {
      const line = i + 1;
      if (!r.stock_id) {
        setFormError(`Baris ${line}: pilih stok.`);
        return;
      }
      const qty = Number(r.qty);
      if (r.qty === '' || Number.isNaN(qty) || qty <= 0) {
        setFormError(`Baris ${line}: qty harus angka > 0.`);
        return;
      }
      const stok = available.get(r.stock_id) ?? 0;
      if (qty > stok) {
        setFormError(`Baris ${line}: qty melebihi stok tersedia (${stok}).`);
        return;
      }
      const price = sellPrice.get(r.stock_id) ?? 0;
      if (price <= 0) {
        setFormError(`Baris ${line}: produk belum punya harga jual.`);
        return;
      }
      // price tetap dikirim untuk kompatibilitas; backend memakai harga jual
      // dari referensi produk sebagai sumber otoritatif.
      details.push({ stock_id: r.stock_id, qty, price });
    }

    const finalPayment =
      paymentType === OTHER ? otherPayment.trim() : paymentType;
    if (paymentType === OTHER && !finalPayment) {
      setFormError('Isi metode pembayaran lainnya.');
      return;
    }

    setFormError(null);
    onSubmit({
      date: date ? new Date(date).toISOString() : undefined,
      payment_type: finalPayment,
      has_payment: hasPayment ? 'TRUE' : 'FALSE',
      details,
    });
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const hasStocks = (stocks ?? []).length > 0;

  return (
    <form class="flex flex-col gap-5" onSubmit={handleSubmit} novalidate>
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
            onChange={(e) =>
              setPaymentType((e.target as HTMLSelectElement).value)
            }
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
              onInput={(e) =>
                setOtherPayment((e.target as HTMLInputElement).value)
              }
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
              onChange={(e) =>
                setHasPayment((e.target as HTMLInputElement).checked)
              }
              disabled={submitting}
            />
            {hasPayment ? 'Sudah dibayar' : 'Belum dibayar'}
          </label>
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="block text-sm font-medium">Item penjualan</label>
          <button
            type="button"
            class={buttonClass('outline', 'px-3 py-1.5')}
            onClick={addRow}
            disabled={submitting || !hasStocks}
          >
            <RiAddLine size={16} />
            Tambah baris
          </button>
        </div>

        {!hasStocks ? (
          <p class="rounded-lg border border-line bg-canvas px-3 py-3 text-sm text-muted">
            Belum ada stok yang bisa dijual. Tambahkan stok lewat Stock In dulu.
          </p>
        ) : (
          <div class="flex flex-col gap-3">
            {rows.map((r, i) => {
              const price = r.stock_id ? sellPrice.get(r.stock_id) ?? 0 : 0;
              const qty = Number(r.qty) || 0;
              return (
                <div
                  key={i}
                  class="grid items-end gap-3 rounded-lg border border-line bg-canvas p-3 sm:grid-cols-[1fr_7rem_9rem_9rem_auto]"
                >
                  <div>
                    <label class="mb-1 block text-xs text-muted">Stok</label>
                    <select
                      class={inputClass}
                      value={r.stock_id}
                      onChange={(e) =>
                        updateRow(i, {
                          stock_id: (e.target as HTMLSelectElement).value,
                        })
                      }
                      disabled={submitting}
                    >
                      <option value="">— Pilih stok —</option>
                      {(stocks ?? []).map((s) => (
                        <option key={s.id} value={s.id}>
                          {stockLabel.get(String(s.id))}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label class="mb-1 block text-xs text-muted">Qty</label>
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      class={inputClass}
                      value={r.qty}
                      onInput={(e) =>
                        updateRow(i, { qty: (e.target as HTMLInputElement).value })
                      }
                      placeholder="0"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label class="mb-1 block text-xs text-muted">
                      Harga jual
                    </label>
                    <div class="flex h-10 items-center rounded-lg border border-line bg-surface px-3 text-sm tabular-nums text-muted">
                      {r.stock_id ? rupiah(price) : '—'}
                    </div>
                  </div>
                  <div>
                    <label class="mb-1 block text-xs text-muted">Subtotal</label>
                    <div class="flex h-10 items-center rounded-lg border border-line bg-surface px-3 text-sm font-medium tabular-nums">
                      {r.stock_id ? rupiah(price * qty) : '—'}
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Hapus baris"
                    class="grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                    onClick={() => removeRow(i)}
                    disabled={submitting || rows.length === 1}
                  >
                    <RiDeleteBinLine size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div class="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3">
        <span class="text-sm text-muted">Total</span>
        <span class="text-lg font-semibold tabular-nums">{rupiah(total)}</span>
      </div>

      {formError && (
        <p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {formError}
        </p>
      )}

      <div class="flex gap-3 pt-1">
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
          onClick={onCancel}
          disabled={submitting}
        >
          Batal
        </button>
      </div>
    </form>
  );
}
