import { useCallback, useState } from 'preact/hooks';
import { listStockIns, getStockIn, createStockIn } from '@/api/stockin';
import { ApiError } from '@/api/client';
import { useAsync } from './useAsync';
import type { StockInWithDetails, StockInInput } from '@/types/stockin';

/** Daftar semua stock in (header + detail + product). */
export function useStockIns() {
  return useAsync<StockInWithDetails[]>(listStockIns, []);
}

/** Satu stock in beserta detailnya. */
export function useStockIn(id: string | number | undefined) {
  const fetcher = useCallback(() => getStockIn(id ?? ''), [id]);
  return useAsync<StockInWithDetails>(fetcher, [id]);
}

/** Mutasi: buat stock in baru, dengan state submitting/error. */
export function useCreateStockIn() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (input: StockInInput) => {
    setSubmitting(true);
    setError(null);
    try {
      return await createStockIn(input);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Gagal menyimpan stock in.');
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { create, submitting, error };
}
