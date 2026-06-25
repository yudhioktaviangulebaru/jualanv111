import { api } from './client';
import type { StockInWithDetails, StockInInput } from '@/types/stockin';

/** GET semua stock in beserta detail + info product (action: stockin). */
export function listStockIns(): Promise<StockInWithDetails[]> {
  return api.get<StockInWithDetails[]>('stockin');
}

/** GET satu stock in beserta detail + info product (action: stockin&id). */
export function getStockIn(id: string | number): Promise<StockInWithDetails> {
  return api.get<StockInWithDetails>('stockin', { id });
}

/** POST buat stock in baru (header + details sekaligus). */
export function createStockIn(input: StockInInput): Promise<StockInWithDetails> {
  return api.post<StockInWithDetails>('stockin', { ...input });
}
