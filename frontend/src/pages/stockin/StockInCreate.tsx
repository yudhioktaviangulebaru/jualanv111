import { useLocation } from 'preact-iso';
import { RiArrowLeftLine } from '@remixicon/react';
import { useCreateStockIn } from '@/hooks/useStockIns';
import type { StockInInput } from '@/types/stockin';
import { Card } from '@/components/ui';
import { useToast } from '@/components/toast/ToastProvider';
import { StockInForm } from './StockInForm';

export function StockInCreate() {
  const { route } = useLocation();
  const toast = useToast();
  const { create, submitting, error } = useCreateStockIn();

  const handleSubmit = async (values: StockInInput) => {
    try {
      const created = await create(values);
      toast.success('Stock in berhasil disimpan.');
      route(`/stock-in/${created.id}`);
    } catch {
      // Pesan kegagalan ditampilkan lewat `error`.
    }
  };

  return (
    <div class="mx-auto max-w-3xl">
      <a
        href="/stock-in"
        class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink hover:no-underline"
      >
        <RiArrowLeftLine size={16} />
        Kembali ke daftar
      </a>

      <h2 class="mb-1 text-2xl font-semibold">Tambah Stock In</h2>
      <p class="mb-6 text-muted">Catat stok masuk beserta detail itemnya.</p>

      <Card class="p-6">
        {error && (
          <p class="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <StockInForm
          submitting={submitting}
          submitLabel="Simpan"
          onSubmit={handleSubmit}
          onCancel={() => route('/stock-in')}
        />
      </Card>
    </div>
  );
}
