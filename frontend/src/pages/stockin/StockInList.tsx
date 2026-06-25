import { useState, useMemo } from 'preact/hooks';
import { RiAddLine, RiSearchLine, RiEyeLine } from '@remixicon/react';
import { useStockIns } from '@/hooks/useStockIns';
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

export function StockInList() {
  const { data, loading, error, reload } = useStockIns();
  const { can } = usePermissions();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const list = data ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (s) =>
        String(s.invoice_number).toLowerCase().includes(term) ||
        String(s.supplier).toLowerCase().includes(term),
    );
  }, [data, q]);

  return (
    <div>
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="m-0 mb-1 text-2xl font-semibold">Stock In</h2>
          <p class="m-0 text-muted">Riwayat stok masuk.</p>
        </div>
        {can('stock-in', 'create') && (
          <a href="/stock-in/create" class={buttonClass('primary')}>
            <RiAddLine size={18} />
            Tambah Stock In
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
          placeholder="Cari invoice / supplier…"
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
            message={q ? 'Tidak ada stock in yang cocok.' : 'Belum ada stock in.'}
          >
            {!q && can('stock-in', 'create') && (
              <a href="/stock-in/create" class={buttonClass('primary')}>
                <RiAddLine size={18} />
                Tambah Stock In
              </a>
            )}
          </EmptyState>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-line text-muted">
                <tr>
                  <th class="px-4 py-3 font-medium">Invoice</th>
                  <th class="px-4 py-3 font-medium">Supplier</th>
                  <th class="px-4 py-3 text-right font-medium">Item</th>
                  <th class="px-4 py-3 text-right font-medium">Total</th>
                  <th class="px-4 py-3 font-medium">Tanggal</th>
                  <th class="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    class="border-b border-line last:border-0 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                  >
                    <td class="px-4 py-3">
                      <a
                        href={`/stock-in/${s.id}`}
                        class="font-medium text-ink hover:text-indigo-500 hover:no-underline"
                      >
                        {s.invoice_number || `#${s.id}`}
                      </a>
                    </td>
                    <td class="px-4 py-3 text-muted">{s.supplier || '-'}</td>
                    <td class="px-4 py-3 text-right tabular-nums">
                      {s.details.length}
                    </td>
                    <td class="px-4 py-3 text-right tabular-nums">
                      {rupiah(s.total)}
                    </td>
                    <td class="px-4 py-3 text-muted">{formatDate(s.created_at)}</td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end gap-1">
                        <a
                          href={`/stock-in/${s.id}`}
                          title="Lihat"
                          class="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-black/5 hover:text-ink dark:hover:bg-white/5"
                        >
                          <RiEyeLine size={18} />
                        </a>
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
