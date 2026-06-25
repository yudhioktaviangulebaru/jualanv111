import { useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { RiArrowLeftLine } from '@remixicon/react';
import { createProduct } from '@/api/product';
import { ApiError } from '@/api/client';
import type { ProductInput } from '@/types/product';
import { Card } from '@/components/ui';
import { useToast } from '@/components/toast/ToastProvider';
import { ProdukForm } from './ProdukForm';

export function ProdukCreate() {
  const { route } = useLocation();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: ProductInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createProduct(values);
      toast.success('Produk berhasil ditambahkan.');
      route(`/produk/${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan produk.');
      setSubmitting(false);
    }
  };

  return (
    <div class="mx-auto max-w-2xl">
      <a
        href="/produk"
        class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink hover:no-underline"
      >
        <RiArrowLeftLine size={16} />
        Kembali ke daftar
      </a>

      <h2 class="mb-1 text-2xl font-semibold">Tambah Produk</h2>
      <p class="mb-6 text-muted">Buat produk baru.</p>

      <Card class="p-6">
        {error && (
          <p class="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <ProdukForm
          submitting={submitting}
          submitLabel="Simpan"
          onSubmit={handleSubmit}
          onCancel={() => route('/produk')}
        />
      </Card>
    </div>
  );
}
