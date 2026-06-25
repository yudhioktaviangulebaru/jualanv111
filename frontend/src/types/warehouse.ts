/** Gudang seperti yang dikembalikan backend (sheet `warehouses`). */
export interface Warehouse {
  id: number | string;
  name: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/** Field yang dikirim saat create / update. */
export interface WarehouseInput {
  name: string;
}
