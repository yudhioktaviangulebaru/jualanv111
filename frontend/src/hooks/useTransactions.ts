import { useCallback, useState } from 'preact/hooks';
import {
  listTransactions,
  getTransaction,
  createTransaction,
} from '@/api/transaction';
import { ApiError } from '@/api/client';
import { useAsync } from './useAsync';
import type {
  TransactionWithDetails,
  TransactionInput,
} from '@/types/transaction';

/** Daftar semua transaksi penjualan (header + detail + product). */
export function useTransactions() {
  return useAsync<TransactionWithDetails[]>(listTransactions, []);
}

/** Satu transaksi penjualan beserta detailnya. */
export function useTransaction(id: string | number | undefined) {
  const fetcher = useCallback(() => getTransaction(id ?? ''), [id]);
  return useAsync<TransactionWithDetails>(fetcher, [id]);
}

/** Mutasi: buat transaksi penjualan baru, dengan state submitting/error. */
export function useCreateTransaction() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (input: TransactionInput) => {
    setSubmitting(true);
    setError(null);
    try {
      return await createTransaction(input);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Gagal menyimpan transaksi.',
      );
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { create, submitting, error };
}
