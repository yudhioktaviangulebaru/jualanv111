import { useLocation } from 'preact-iso';
import { RiArrowLeftLine } from '@remixicon/react';
import { useCreateTransaction } from '@/hooks/useTransactions';
import type { TransactionInput } from '@/types/transaction';
import { printReceipt, type ReceiptData } from '@/lib/receipt';
import { Card } from '@/components/ui';
import { useToast } from '@/components/toast/ToastProvider';
import { TransactionForm } from './TransactionForm';

export function TransactionCreate() {
  const { route } = useLocation();
  const toast = useToast();
  const { create, submitting, error } = useCreateTransaction();

  const handleSubmit = async (values: TransactionInput, receipt?: ReceiptData) => {
    try {
      const created = await create(values);
      toast.success('Transaksi penjualan berhasil disimpan.');
      if (receipt) printReceipt({ ...receipt, transactionId: created.id });
      route(`/transaksi/${created.id}`);
    } catch {
      // Pesan kegagalan ditampilkan lewat `error`.
    }
  };

  return (
    <div>
      <a
        href="/transaksi"
        class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink hover:no-underline"
      >
        <RiArrowLeftLine size={16} />
        Kembali ke daftar
      </a>

      <h2 class="mb-1 text-2xl font-semibold">Transaksi Penjualan Baru</h2>
      <p class="mb-6 text-muted">
        Catat penjualan beserta itemnya. Stok terjual otomatis berkurang.
      </p>

      <Card class="p-6">
        {error && (
          <p class="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        <TransactionForm
          submitting={submitting}
          submitLabel="Simpan"
          onSubmit={handleSubmit}
          onCancel={() => route('/transaksi')}
        />
      </Card>
    </div>
  );
}
