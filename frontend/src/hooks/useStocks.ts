import { useCallback, useState } from 'preact/hooks';
import { listStocks, assignWarehouse } from '@/api/stock';
import { ApiError } from '@/api/client';
import { useAsync } from './useAsync';
import type { StockWithRelations } from '@/types/stock';

/** Stok yang tertaut pada satu product (untuk daftar gudang di product view). */
export function useProductStocks(productId: string | number | undefined) {
  const fetcher = useCallback(async () => {
    const stocks = await listStocks();
    return stocks.filter((s) => String(s.product_id) === String(productId));
  }, [productId]);
  return useAsync<StockWithRelations[]>(fetcher, [productId]);
}

/** Stok yang tertaut pada satu warehouse (untuk daftar produk di warehouse view). */
export function useWarehouseStocks(warehouseId: string | number | undefined) {
  const fetcher = useCallback(async () => {
    const stocks = await listStocks();
    return stocks.filter((s) => String(s.warehouse_id) === String(warehouseId));
  }, [warehouseId]);
  return useAsync<StockWithRelations[]>(fetcher, [warehouseId]);
}

/** Mutasi: tautkan product ke warehouse (stok 0), dengan state submitting/error. */
export function useAssignWarehouse() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assign = useCallback(
    async (productId: string | number, warehouseId: string | number) => {
      setSubmitting(true);
      setError(null);
      try {
        return await assignWarehouse(productId, warehouseId);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Gagal menautkan gudang.');
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { assign, submitting, error };
}
