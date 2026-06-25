import { useCallback, useState } from 'preact/hooks';
import {
  RiArrowLeftLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiStore2Line,
} from '@remixicon/react';
import { getProduct } from '@/api/product';
import { useAsync } from '@/hooks/useAsync';
import { useProductStocks } from '@/hooks/useStocks';
import { usePermissions } from '@/hooks/usePermissions';
import { rupiah, formatDate } from '@/lib/format';
import {
  buttonClass,
  Card,
  Spinner,
  ErrorState,
  EmptyState,
} from '@/components/ui';
import { AssignWarehouseModal } from '@/components/AssignWarehouseModal';

export function ProdukView({ id }: { id?: string }) {
  const fetcher = useCallback(() => getProduct(id ?? ''), [id]);
  const { data: product, loading, error, reload } = useAsync(fetcher, [id]);

  const {
    data: stocks,
    loading: stocksLoading,
    error: stocksError,
    reload: reloadStocks,
  } = useProductStocks(id);

  const { can } = usePermissions();
  const [assignOpen, setAssignOpen] = useState(false);

  const margin =
    product != null ? Number(product.sell_price) - Number(product.price) : 0;

  return (
    <div class="mx-auto max-w-2xl">
      <a
        href="/produk"
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
        ) : product ? (
          <>
            <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="m-0 text-2xl font-semibold">{product.name}</h2>
                <p class="m-0 text-sm text-muted">ID #{product.id}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                {can('produk', 'edit') && (
                  <button
                    type="button"
                    class={buttonClass('primary')}
                    onClick={() => setAssignOpen(true)}
                  >
                    <RiStore2Line size={16} />
                    Assign Warehouse
                  </button>
                )}
                {can('produk', 'edit') && (
                  <a href={`/produk/${product.id}/edit`} class={buttonClass('outline')}>
                    <RiPencilLine size={16} />
                    Edit
                  </a>
                )}
                {can('produk', 'delete') && (
                  <a href={`/produk/${product.id}/delete`} class={buttonClass('danger')}>
                    <RiDeleteBinLine size={16} />
                    Hapus
                  </a>
                )}
              </div>
            </div>

            <dl class="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              <Detail label="Harga modal" value={rupiah(product.price)} />
              <Detail label="Harga jual" value={rupiah(product.sell_price)} />
              <Detail
                label="Margin"
                value={rupiah(margin)}
                accent={margin >= 0 ? 'text-emerald-500' : 'text-red-400'}
              />
              <Detail label="Dibuat" value={formatDate(product.created_at)} />
              <Detail label="Diperbarui" value={formatDate(product.updated_at)} />
            </dl>
          </>
        ) : null}
      </Card>

      <Card class="mt-4 p-6">
        <h3 class="m-0 mb-1 text-lg font-semibold">Gudang tertaut</h3>
        <p class="m-0 mb-4 text-sm text-muted">
          Daftar gudang yang tertaut ke produk ini.
        </p>
        {stocksLoading ? (
          <Spinner />
        ) : stocksError ? (
          <ErrorState message={stocksError} onRetry={reloadStocks} />
        ) : (stocks ?? []).length === 0 ? (
          <EmptyState message="Belum ada gudang tertaut." />
        ) : (
          <ul class="m-0 flex flex-col gap-px overflow-hidden rounded-lg border border-line bg-line p-0">
            {(stocks ?? []).map((s) => (
              <li
                key={s.id}
                class="flex items-center gap-3 bg-surface px-4 py-3 text-sm"
              >
                <RiStore2Line size={18} className="shrink-0 text-muted" />
                <a
                  href={`/gudang/${s.warehouse_id}`}
                  class="flex-1 font-medium text-ink hover:text-indigo-500 hover:no-underline"
                >
                  {s.warehouse?.name ?? `Gudang #${s.warehouse_id}`}
                </a>
                <span class="shrink-0 tabular-nums text-muted">
                  Stok: <span class="font-medium text-ink">{Number(s.stock)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {assignOpen && product && (
        <AssignWarehouseModal
          product={product}
          assignedWarehouseIds={(stocks ?? []).map((s) => s.warehouse_id)}
          onClose={() => setAssignOpen(false)}
          onAssigned={reloadStocks}
        />
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div class="bg-surface px-4 py-3">
      <dt class="text-xs text-muted">{label}</dt>
      <dd class={`m-0 mt-0.5 font-medium tabular-nums ${accent ?? ''}`}>{value}</dd>
    </div>
  );
}
