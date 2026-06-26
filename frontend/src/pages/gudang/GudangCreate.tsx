import { useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { RiArrowLeftLine } from '@remixicon/react';
import { createWarehouse } from '@/api/warehouse';
import { ApiError } from '@/api/client';
import type { WarehouseInput } from '@/types/warehouse';
import { Card } from '@/components/ui';
import { useToast } from '@/components/toast/ToastProvider';
import { GudangForm } from './GudangForm';

export function GudangCreate() {
  const { route } = useLocation();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: WarehouseInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createWarehouse(values);
      toast.success('Gudang berhasil ditambahkan.');
      route(`/gudang/${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan gudang.');
      setSubmitting(false);
    }
  };

  return (
    <div class="mx-auto max-w-2xl">
      <a
        href="/gudang"
        class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink hover:no-underline"
      >
        <RiArrowLeftLine size={16} />
        Kembali ke daftar
      </a>

      <h2 class="mb-1 text-2xl font-semibold">Tambah Gudang</h2>
      <p class="mb-6 text-muted">Buat gudang baru.</p>

      <Card class="p-6">
        {error && (
          <p class="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <GudangForm
          submitting={submitting}
          submitLabel="Simpan"
          onSubmit={handleSubmit}
          onCancel={() => route('/gudang')}
        />
      </Card>
    </div>
  );
}
