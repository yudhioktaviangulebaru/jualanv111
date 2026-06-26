import { useState, useMemo } from 'preact/hooks';
import {
  RiAddLine,
  RiSearchLine,
  RiEyeLine,
  RiDeleteBinLine,
} from '@remixicon/react';
import { useTransactions } from '@/hooks/useTransactions';
import { usePermissions } from '@/hooks/usePermissions';
import { rupiah, formatDate } from '@/lib/format';
import {
  buttonClass,
  inputClass,
  Card,
  Spinner,
  ErrorState,
  EmptyState,
} from '@/components/ui';

export function TransactionList() {
  const { data, loading, error, reload } = useTransactions();
  const { can } = usePermissions();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const list = data ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (t) =>
        `#${t.id}`.toLowerCase().includes(term) ||
        (t.payment_type ?? '').toLowerCase().includes(term) ||
        t.details.some((d) =>
          (d.product?.name ?? d.product_name ?? '')
            .toLowerCase()
            .includes(term),
        ),
    );
  }, [data, q]);

  const canDelete = can('cashier', 'delete');

  return (
    <div>
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="m-0 mb-1 text-2xl font-semibold">Transaksi Penjualan</h2>
          <p class="m-0 text-muted">Riwayat penjualan kasir.</p>
        </div>
        {can('cashier', 'create') && (
          <a href="/transaksi/create" class={buttonClass('primary')}>
            <RiAddLine size={18} />
            Transaksi Baru
          </a>
        )}
      </div>

      <div class="relative mb-4 max-w-xs">
        <RiSearchLine
          size={18}
          className="pointer-events-none absolute top-2.5 left-3 text-muted"
        />
        <input
          class={`${inputClass} pl-9`}
          placeholder="Cari nomor / produk…"
          value={q}
          onInput={(e) => setQ((e.target as HTMLInputElement).value)}
        />
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            message={
              q ? 'Tidak ada transaksi yang cocok.' : 'Belum ada transaksi.'
            }
          >
            {!q && can('cashier', 'create') && (
              <a href="/transaksi/create" class={buttonClass('primary')}>
                <RiAddLine size={18} />
                Transaksi Baru
              </a>
            )}
          </EmptyState>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-line text-muted">
                <tr>
                  <th class="px-4 py-3 font-medium">No.</th>
                  <th class="px-4 py-3 text-right font-medium">Item</th>
                  <th class="px-4 py-3 text-right font-medium">Total</th>
                  <th class="px-4 py-3 font-medium">Metode</th>
                  <th class="px-4 py-3 font-medium">Status</th>
                  <th class="px-4 py-3 font-medium">Tanggal</th>
                  <th class="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    class="border-b border-line last:border-0 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                  >
                    <td class="px-4 py-3">
                      <a
                        href={`/transaksi/${t.id}`}
                        class="font-medium text-ink hover:text-indigo-500 hover:no-underline"
                      >
                        #{t.id}
                      </a>
                    </td>
                    <td class="px-4 py-3 text-right tabular-nums">
                      {t.details.length}
                    </td>
                    <td class="px-4 py-3 text-right tabular-nums">
                      {rupiah(t.subtotal)}
                    </td>
                    <td class="px-4 py-3 text-muted">{t.payment_type || '—'}</td>
                    <td class="px-4 py-3">
                      {t.has_payment === 'TRUE' ? (
                        <span class="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                          Lunas
                        </span>
                      ) : (
                        <span class="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                          Belum bayar
                        </span>
                      )}
                    </td>
                    <td class="px-4 py-3 text-muted">{formatDate(t.date)}</td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end gap-1">
                        <a
                          href={`/transaksi/${t.id}`}
                          title="Lihat"
                          class="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-black/5 hover:text-ink dark:hover:bg-white/5"
                        >
                          <RiEyeLine size={18} />
                        </a>
                        {canDelete && (
                          <a
                            href={`/transaksi/${t.id}/delete`}
                            title="Hapus"
                            class="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-400"
                          >
                            <RiDeleteBinLine size={18} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
