import { api } from './client';
import type { Warehouse, WarehouseInput } from '@/types/warehouse';

/** GET semua gudang (action: warehouse). */
export function listWarehouses(): Promise<Warehouse[]> {
  return api.get<Warehouse[]>('warehouse');
}

/** GET satu gudang (action: warehouse&id). */
export function getWarehouse(id: string | number): Promise<Warehouse> {
  return api.get<Warehouse>('warehouse', { id });
}

/** POST buat gudang baru (tanpa id → store/create). */
export function createWarehouse(input: WarehouseInput): Promise<Warehouse> {
  return api.post<Warehouse>('warehouse', { ...input });
}

/** POST update gudang (dengan id → store/update). */
export function updateWarehouse(
  id: string | number,
  input: WarehouseInput,
): Promise<Warehouse> {
  return api.post<Warehouse>('warehouse', { id, ...input });
}

/** POST soft-delete gudang (action: warehouse.delete). */
export function deleteWarehouse(
  id: string | number,
): Promise<{ deleted: boolean; id: number | string }> {
  return api.post<{ deleted: boolean; id: number | string }>(
    'warehouse.delete',
    { id },
  );
}
