import { useState, useMemo } from 'preact/hooks';
import {
  RiAddLine,
  RiSearchLine,
  RiEyeLine,
  RiPencilLine,
  RiDeleteBinLine,
} from '@remixicon/react';
import { listWarehouses } from '@/api/warehouse';
import { useAsync } from '@/hooks/useAsync';
import { usePermissions } from '@/hooks/usePermissions';
import { formatDate } from '@/lib/format';
import {
  buttonClass,
  inputClass,
  Card,
  Spinner,
  ErrorState,
  EmptyState,
} from '@/components/ui';

export function GudangList() {
  const { data, loading, error, reload } = useAsync(listWarehouses, []);
  const { can } = usePermissions();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const list = data ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((w) => String(w.name).toLowerCase().includes(term));
  }, [data, q]);

  return (
    <div>
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="m-0 mb-1 text-2xl font-semibold">Gudang</h2>
          <p class="m-0 text-muted">Kelola daftar gudang.</p>
        </div>
        {can('gudang', 'create') && (
          <a href="/gudang/create" class={buttonClass('primary')}>
            <RiAddLine size={18} />
            Tambah Gudang
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
          placeholder="Cari nama gudang…"
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
            message={q ? 'Tidak ada gudang yang cocok.' : 'Belum ada gudang.'}
          >
            {!q && (
              <a href="/gudang/create" class={buttonClass('primary')}>
                <RiAddLine size={18} />
                Tambah Gudang
              </a>
            )}
          </EmptyState>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-line text-muted">
                <tr>
                  <th class="px-4 py-3 font-medium">Nama</th>
                  <th class="px-4 py-3 font-medium">Diperbarui</th>
                  <th class="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr
                    key={w.id}
                    class="border-b border-line last:border-0 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                  >
                    <td class="px-4 py-3">
                      <a
                        href={`/gudang/${w.id}`}
                        class="font-medium text-ink hover:text-indigo-500 hover:no-underline"
                      >
                        {w.name}
                      </a>
                    </td>
                    <td class="px-4 py-3 text-muted">{formatDate(w.updated_at)}</td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end gap-1">
                        <a
                          href={`/gudang/${w.id}`}
                          title="Lihat"
                          class="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-black/5 hover:text-ink dark:hover:bg-white/5"
                        >
                          <RiEyeLine size={18} />
                        </a>
                        {can('gudang', 'edit') && (
                          <a
                            href={`/gudang/${w.id}/edit`}
                            title="Edit"
                            class="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-black/5 hover:text-ink dark:hover:bg-white/5"
                          >
                            <RiPencilLine size={18} />
                          </a>
                        )}
                        {can('gudang', 'delete') && (
                          <a
                            href={`/gudang/${w.id}/delete`}
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
