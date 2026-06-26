import { useMemo, useState } from 'preact/hooks';
import { RiAddLine, RiDeleteBinLine } from '@remixicon/react';
import { listStocks } from '@/api/stock';
import { useAsync } from '@/hooks/useAsync';
import { rupiah } from '@/lib/format';
import { buttonClass, inputClass, Spinner, ErrorState } from '@/components/ui';
import type { StockInInput } from '@/types/stockin';

interface DetailRow {
  stock_id: string;
  qty: string;
  price: string;
}

interface StockInFormProps {
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: StockInInput) => void;
  onCancel: () => void;
}

const emptyRow = (): DetailRow => ({ stock_id: '', qty: '', price: '' });

export function StockInForm({
  submitting = false,
  submitLabel = 'Simpan',
  onSubmit,
  onCancel,
}: StockInFormProps) {
  const { data: stocks, loading, error, reload } = useAsync(listStocks, []);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [rows, setRows] = useState<DetailRow[]>([emptyRow()]);
  const [formError, setFormError] = useState<string | null>(null);

  const stockLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of stocks ?? []) {
      const product = s.product?.name ?? `Produk #${s.product_id}`;
      const warehouse = s.warehouse?.name ?? `Gudang #${s.warehouse_id}`;
      map.set(String(s.id), `${product} — ${warehouse}`);
    }
    return map;
  }, [stocks]);

  const total = useMemo(
    () =>
      rows.reduce((sum, r) => {
        const qty = Number(r.qty);
        const price = Number(r.price);
        if (Number.isNaN(qty) || Number.isNaN(price)) return sum;
        return sum + qty * price;
      }, 0),
    [rows],
  );

  const updateRow = (index: number, patch: Partial<DetailRow>) => {
    setRows((list) => list.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };
  const addRow = () => setRows((list) => [...list, emptyRow()]);
  const removeRow = (index: number) =>
    setRows((list) => (list.length === 1 ? list : list.filter((_, i) => i !== index)));

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    if (!invoiceNumber.trim()) {
      setFormError('Nomor invoice wajib diisi.');
      return;
    }

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
      const price = Number(r.price);
      if (r.price === '' || Number.isNaN(price) || price <= 0) {
        setFormError(`Baris ${line}: harga harus angka > 0.`);
        return;
      }
      details.push({ stock_id: r.stock_id, qty, price });
    }

    setFormError(null);
    onSubmit({
      invoice_number: invoiceNumber.trim(),
      supplier: supplier.trim(),
      total,
      details,
    });
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const hasStocks = (stocks ?? []).length > 0;

  return (
    <form class="flex flex-col gap-5" onSubmit={handleSubmit} novalidate>
      <div class="grid gap-5 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="invoice_number">
            Nomor invoice
          </label>
          <input
            id="invoice_number"
            class={inputClass}
            value={invoiceNumber}
            onInput={(e) =>
              setInvoiceNumber((e.target as HTMLInputElement).value)
            }
            placeholder="mis. INV-001"
            disabled={submitting}
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="supplier">
            Supplier
          </label>
          <input
            id="supplier"
            class={inputClass}
            value={supplier}
            onInput={(e) => setSupplier((e.target as HTMLInputElement).value)}
            placeholder="mis. PT Sumber Rejeki"
            disabled={submitting}
          />
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="block text-sm font-medium">Detail item</label>
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
            Belum ada stok. Tautkan produk ke gudang dulu lewat “Assign Warehouse”.
          </p>
        ) : (
          <div class="flex flex-col gap-3">
            {rows.map((r, i) => (
              <div
                key={i}
                class="grid items-end gap-3 rounded-lg border border-line bg-canvas p-3 sm:grid-cols-[1fr_7rem_9rem_auto]"
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
                  <label class="mb-1 block text-xs text-muted">Harga (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    class={inputClass}
                    value={r.price}
                    onInput={(e) =>
                      updateRow(i, { price: (e.target as HTMLInputElement).value })
                    }
                    placeholder="0"
                    disabled={submitting}
                  />
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
            ))}
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
