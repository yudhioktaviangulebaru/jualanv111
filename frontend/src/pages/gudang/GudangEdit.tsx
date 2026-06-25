import { useState, useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { RiArrowLeftLine } from '@remixicon/react';
import { getWarehouse, updateWarehouse } from '@/api/warehouse';
import { ApiError } from '@/api/client';
import type { WarehouseInput } from '@/types/warehouse';
import { useAsync } from '@/hooks/useAsync';
import { Card, Spinner, ErrorState } from '@/components/ui';
import { useToast } from '@/components/toast/ToastProvider';
import { GudangForm } from './GudangForm';

export function GudangEdit({ id }: { id?: string }) {
  const { route } = useLocation();
  const toast = useToast();
  const fetcher = useCallback(() => getWarehouse(id ?? ''), [id]);
  const { data: warehouse, loading, error, reload } = useAsync(fetcher, [id]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: WarehouseInput) => {
    if (!id) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateWarehouse(id, values);
      toast.success('Perubahan tersimpan.');
      route(`/gudang/${id}`);
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
        href={id ? `/gudang/${id}` : '/gudang'}
        class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink hover:no-underline"
      >
        <RiArrowLeftLine size={16} />
        Kembali
      </a>

      <h2 class="mb-1 text-2xl font-semibold">Edit Gudang</h2>
      <p class="mb-6 text-muted">Ubah data gudang.</p>

      <Card class="p-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : warehouse ? (
          <>
            {submitError && (
              <p class="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {submitError}
              </p>
            )}
            <GudangForm
              initial={warehouse}
              submitting={submitting}
              submitLabel="Simpan perubahan"
              onSubmit={handleSubmit}
              onCancel={() => route(`/gudang/${id}`)}
            />
          </>
        ) : null}
      </Card>
    </div>
  );
}
