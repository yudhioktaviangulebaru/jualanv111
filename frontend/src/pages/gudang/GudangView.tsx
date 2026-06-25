import { useCallback } from 'preact/hooks';
import {
  RiArrowLeftLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiBox3Line,
} from '@remixicon/react';
import { getWarehouse } from '@/api/warehouse';
import { useAsync } from '@/hooks/useAsync';
import { useWarehouseStocks } from '@/hooks/useStocks';
import { formatDate } from '@/lib/format';
import {
  buttonClass,
  Card,
  Spinner,
  ErrorState,
  EmptyState,
} from '@/components/ui';

export function GudangView({ id }: { id?: string }) {
  const fetcher = useCallback(() => getWarehouse(id ?? ''), [id]);
  const { data: warehouse, loading, error, reload } = useAsync(fetcher, [id]);

  const {
    data: stocks,
    loading: stocksLoading,
    error: stocksError,
    reload: reloadStocks,
  } = useWarehouseStocks(id);

  return (
    <div class="mx-auto max-w-2xl">
      <a
        href="/gudang"
        class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink hover:no-underline"
      >
        <RiArrowLeftLine size={16} />
        Kembali ke daftar
      </a>

      <Card class="p-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : warehouse ? (
          <>
            <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="m-0 text-2xl font-semibold">{warehouse.name}</h2>
                <p class="m-0 text-sm text-muted">ID #{warehouse.id}</p>
              </div>
              <div class="flex gap-2">
                <a href={`/gudang/${warehouse.id}/edit`} class={buttonClass('outline')}>
                  <RiPencilLine size={16} />
                  Edit
                </a>
                <a href={`/gudang/${warehouse.id}/delete`} class={buttonClass('danger')}>
                  <RiDeleteBinLine size={16} />
                  Hapus
                </a>
              </div>
            </div>

            <dl class="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              <Detail label="Dibuat" value={formatDate(warehouse.created_at)} />
              <Detail label="Diperbarui" value={formatDate(warehouse.updated_at)} />
            </dl>
          </>
        ) : null}
      </Card>

      <Card class="mt-4 p-6">
        <h3 class="m-0 mb-1 text-lg font-semibold">Produk tertaut</h3>
        <p class="m-0 mb-4 text-sm text-muted">
          Daftar produk yang tertaut ke gudang ini.
        </p>
        {stocksLoading ? (
          <Spinner />
        ) : stocksError ? (
          <ErrorState message={stocksError} onRetry={reloadStocks} />
        ) : (stocks ?? []).length === 0 ? (
          <EmptyState message="Belum ada produk tertaut." />
        ) : (
          <ul class="m-0 flex flex-col gap-px overflow-hidden rounded-lg border border-line bg-line p-0">
            {(stocks ?? []).map((s) => (
              <li
                key={s.id}
                class="flex items-center gap-3 bg-surface px-4 py-3 text-sm"
              >
                <RiBox3Line size={18} className="shrink-0 text-muted" />
                <a
                  href={`/produk/${s.product_id}`}
                  class="flex-1 font-medium text-ink hover:text-indigo-500 hover:no-underline"
                >
                  {s.product?.name ?? `Produk #${s.product_id}`}
                </a>
                <span class="shrink-0 tabular-nums text-muted">
                  Stok: <span class="font-medium text-ink">{Number(s.stock)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div class="bg-surface px-4 py-3">
      <dt class="text-xs text-muted">{label}</dt>
      <dd class="m-0 mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
