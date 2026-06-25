import { useState, useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { RiArrowLeftLine } from '@remixicon/react';
import { getProduct, updateProduct } from '@/api/product';
import { ApiError } from '@/api/client';
import type { ProductInput } from '@/types/product';
import { useAsync } from '@/hooks/useAsync';
import { Card, Spinner, ErrorState } from '@/components/ui';
import { useToast } from '@/components/toast/ToastProvider';
import { ProdukForm } from './ProdukForm';

export function ProdukEdit({ id }: { id?: string }) {
  const { route } = useLocation();
  const toast = useToast();
  const fetcher = useCallback(() => getProduct(id ?? ''), [id]);
  const { data: product, loading, error, reload } = useAsync(fetcher, [id]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: ProductInput) => {
    if (!id) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateProduct(id, values);
      toast.success('Perubahan tersimpan.');
      route(`/produk/${id}`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'Gagal menyimpan perubahan.',
      );
      setSubmitting(false);
    }
  };

  return (
    <div class="mx-auto max-w-2xl">
      <a
        href={id ? `/produk/${id}` : '/produk'}
        class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink hover:no-underline"
      >
        <RiArrowLeftLine size={16} />
        Kembali
      </a>

      <h2 class="mb-1 text-2xl font-semibold">Edit Produk</h2>
      <p class="mb-6 text-muted">Ubah data produk.</p>

      <Card class="p-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : product ? (
          <>
            {submitError && (
              <p class="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {submitError}
              </p>
            )}
            <ProdukForm
              initial={product}
              submitting={submitting}
              submitLabel="Simpan perubahan"
              onSubmit={handleSubmit}
              onCancel={() => route(`/produk/${id}`)}
            />
          </>
        ) : null}
      </Card>
    </div>
  );
}
