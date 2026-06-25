import { useState, useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { RiArrowLeftLine, RiDeleteBinLine, RiAlertLine } from '@remixicon/react';
import { getProduct, deleteProduct } from '@/api/product';
import { ApiError } from '@/api/client';
import { rupiah } from '@/lib/format';
import { useAsync } from '@/hooks/useAsync';
import { buttonClass, Card, Spinner, ErrorState } from '@/components/ui';
import { useToast } from '@/components/toast/ToastProvider';

export function ProdukDelete({ id }: { id?: string }) {
  const { route } = useLocation();
  const toast = useToast();
  const fetcher = useCallback(() => getProduct(id ?? ''), [id]);
  const { data: product, loading, error, reload } = useAsync(fetcher, [id]);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(id);
      toast.success('Produk dihapus.');
      route('/produk');
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : 'Gagal menghapus produk.',
      );
      setDeleting(false);
    }
  };

  return (
    <div class="mx-auto max-w-lg">
      <a
        href={id ? `/produk/${id}` : '/produk'}
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
        ) : product ? (
          <>
            <div class="mb-4 flex items-center gap-3">
              <div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-400">
                <RiAlertLine size={24} />
              </div>
              <div>
                <h2 class="m-0 text-xl font-semibold">Hapus produk?</h2>
                <p class="m-0 text-sm text-muted">
                  Tindakan ini akan menghapus produk dari daftar.
                </p>
              </div>
            </div>

            <div class="mb-5 rounded-lg border border-line bg-canvas px-4 py-3">
              <div class="font-medium">{product.name}</div>
              <div class="text-sm text-muted tabular-nums">
                Modal {rupiah(product.price)} · Jual {rupiah(product.sell_price)}
              </div>
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
                href={`/produk/${product.id}`}
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
