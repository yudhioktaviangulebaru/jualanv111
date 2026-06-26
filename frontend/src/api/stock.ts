import { api } from './client';
import type { Stock, StockWithRelations } from '@/types/stock';

/** GET semua stok beserta relasi product & warehouse (action: stock). */
export function listStocks(): Promise<StockWithRelations[]> {
  return api.get<StockWithRelations[]>('stock');
}

/**
 * POST tautkan sebuah product ke sebuah warehouse.
 *
 * Tidak ada input stok di UI — selalu kirim `stock: 0` (backend juga
 * men-default-kan ke 0). Lihat backend/controllers/StockController.js.
 */
export function assignWarehouse(
  productId: string | number,
  warehouseId: string | number,
): Promise<Stock> {
  return api.post<Stock>('stock', {
    product_id: productId,
    warehouse_id: warehouseId,
    stock: 0,
  });
}
