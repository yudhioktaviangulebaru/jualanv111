import { useLocation } from 'preact-iso';
import { RiArrowLeftLine } from '@remixicon/react';
import { useCreateUser } from '@/hooks/useUsers';
import type { UserInput } from '@/types/auth';
import { Card } from '@/components/ui';
import { useToast } from '@/components/toast/ToastProvider';
import { PenggunaForm } from './PenggunaForm';

export function PenggunaCreate() {
  const { route } = useLocation();
  const toast = useToast();
  const { create, submitting, error } = useCreateUser();

  const handleSubmit = async (values: UserInput) => {
    try {
      const created = await create(values);
      toast.success('Pengguna berhasil ditambahkan.');
      route(`/pengguna/${created.id}`);
    } catch {
      // Pesan kegagalan ditampilkan lewat `error`.
    }
  };

  return (
    <div class="mx-auto max-w-2xl">
      <a
        href="/pengguna"
        class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink hover:no-underline"
      >
        <RiArrowLeftLine size={16} />
        Kembali ke daftar
      </a>

      <h2 class="mb-1 text-2xl font-semibold">Tambah Pengguna</h2>
      <p class="mb-6 text-muted">
        Pengguna baru otomatis terhubung ke worksheet Anda.
      </p>

      <Card class="p-6">
        {error && (
          <p class="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <PenggunaForm
          submitting={submitting}
          submitLabel="Simpan"
          onSubmit={handleSubmit}
          onCancel={() => route('/pengguna')}
        />
      </Card>
    </div>
  );
}
