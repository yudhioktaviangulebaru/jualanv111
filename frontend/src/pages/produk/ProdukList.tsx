import { useState, useMemo } from 'preact/hooks';
import {
  RiAddLine,
  RiSearchLine,
  RiEyeLine,
  RiPencilLine,
  RiDeleteBinLine,
} from '@remixicon/react';
import { listProducts } from '@/api/product';
import { useAsync } from '@/hooks/useAsync';
import { usePermissions } from '@/hooks/usePermissions';
import { rupiah } from '@/lib/format';
import {
  buttonClass,
  inputClass,
  Card,
  Spinner,
  ErrorState,
  EmptyState,
} from '@/components/ui';

export function ProdukList() {
  const { data, loading, error, reload } = useAsync(listProducts, []);
  const { can } = usePermissions();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const list = data ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((p) => String(p.name).toLowerCase().includes(term));
  }, [data, q]);

  return (
    <div>
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="m-0 mb-1 text-2xl font-semibold">Produk</h2>
          <p class="m-0 text-muted">Kelola daftar produk.</p>
        </div>
        {can('produk', 'create') && (
          <a href="/produk/create" class={buttonClass('primary')}>
            <RiAddLine size={18} />
            Tambah Produk
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
          placeholder="Cari nama produk…"
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
              q ? 'Tidak ada produk yang cocok.' : 'Belum ada produk.'
            }
          >
            {!q && can('produk', 'create') && (
              <a href="/produk/create" class={buttonClass('primary')}>
                <RiAddLine size={18} />
                Tambah Produk
              </a>
            )}
          </EmptyState>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-line text-muted">
                <tr>
                  <th class="px-4 py-3 font-medium">Nama</th>
                  <th class="px-4 py-3 text-right font-medium">Harga modal</th>
                  <th class="px-4 py-3 text-right font-medium">Harga jual</th>
                  <th class="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    class="border-b border-line last:border-0 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                  >
                    <td class="px-4 py-3">
                      <a
                        href={`/produk/${p.id}`}
                        class="font-medium text-ink hover:text-indigo-500 hover:no-underline"
                      >
                        {p.name}
                      </a>
                    </td>
                    <td class="px-4 py-3 text-right tabular-nums">
                      {rupiah(p.price)}
                    </td>
                    <td class="px-4 py-3 text-right tabular-nums">
                      {rupiah(p.sell_price)}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end gap-1">
                        <a
                          href={`/produk/${p.id}`}
                          title="Lihat"
                          class="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-black/5 hover:text-ink dark:hover:bg-white/5"
                        >
                          <RiEyeLine size={18} />
                        </a>
                        {can('produk', 'edit') && (
                          <a
                            href={`/produk/${p.id}/edit`}
                            title="Edit"
                            class="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-black/5 hover:text-ink dark:hover:bg-white/5"
                          >
                            <RiPencilLine size={18} />
                          </a>
                        )}
                        {can('produk', 'delete') && (
                          <a
                            href={`/produk/${p.id}/delete`}
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
