import { api } from './client';
import type { TransactionWithDetails, TransactionInput } from '@/types/transaction';

/** GET semua transaksi penjualan beserta detail + info product (action: transaction). */
export function listTransactions(): Promise<TransactionWithDetails[]> {
  return api.get<TransactionWithDetails[]>('transaction');
}

/** GET satu transaksi beserta detail + info product (action: transaction&id). */
export function getTransaction(
  id: string | number,
): Promise<TransactionWithDetails> {
  return api.get<TransactionWithDetails>('transaction', { id });
}

/** POST buat transaksi penjualan baru (header + details sekaligus). */
export function createTransaction(
  input: TransactionInput,
): Promise<TransactionWithDetails> {
  return api.post<TransactionWithDetails>('transaction', { ...input });
}

/** POST soft-delete transaksi penjualan (action: transaction.delete). */
export function deleteTransaction(
  id: string | number,
): Promise<{ deleted: boolean; id: number | string }> {
  return api.post<{ deleted: boolean; id: number | string }>(
    'transaction.delete',
    { id },
  );
}
