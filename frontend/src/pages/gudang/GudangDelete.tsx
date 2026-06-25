import { useState, useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { RiArrowLeftLine, RiDeleteBinLine, RiAlertLine } from '@remixicon/react';
import { getWarehouse, deleteWarehouse } from '@/api/warehouse';
import { ApiError } from '@/api/client';
import { useAsync } from '@/hooks/useAsync';
import { buttonClass, Card, Spinner, ErrorState } from '@/components/ui';
import { useToast } from '@/components/toast/ToastProvider';

export function GudangDelete({ id }: { id?: string }) {
  const { route } = useLocation();
  const toast = useToast();
  const fetcher = useCallback(() => getWarehouse(id ?? ''), [id]);
  const { data: warehouse, loading, error, reload } = useAsync(fetcher, [id]);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteWarehouse(id);
      toast.success('Gudang dihapus.');
      route('/gudang');
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : 'Gagal menghapus gudang.',
      );
      setDeleting(false);
    }
  };

  return (
    <div class="mx-auto max-w-lg">
      <a
        href={id ? `/gudang/${id}` : '/gudang'}
        class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink hover:no-underline"
      >
        <RiArrowLeftLine size={16} />
        Batal & kembali
      </a>

      <Card class="p-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : warehouse ? (
          <>
            <div class="mb-4 flex items-center gap-3">
              <div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-400">
                <RiAlertLine size={24} />
              </div>
              <div>
                <h2 class="m-0 text-xl font-semibold">Hapus gudang?</h2>
                <p class="m-0 text-sm text-muted">
                  Tindakan ini akan menghapus gudang dari daftar.
                </p>
              </div>
            </div>

            <div class="mb-5 rounded-lg border border-line bg-canvas px-4 py-3">
              <div class="font-medium">{warehouse.name}</div>
              <div class="text-sm text-muted">ID #{warehouse.id}</div>
            </div>

            {deleteError && (
              <p class="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {deleteError}
              </p>
            )}

            <div class="flex gap-3">
              <button
                class={buttonClass('danger')}
                onClick={handleDelete}
                disabled={deleting}
              >
                <RiDeleteBinLine size={16} />
                {deleting ? 'Menghapus…' : 'Ya, hapus'}
              </button>
              <a
                href={`/gudang/${warehouse.id}`}
                class={buttonClass('outline')}
                aria-disabled={deleting}
              >
                Batal
              </a>
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
}
