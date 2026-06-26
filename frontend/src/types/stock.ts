import type { Product } from './product';
import type { Warehouse } from './warehouse';

/** Stok = relasi product ⇆ warehouse (sheet `stocks`). */
export interface Stock {
  id: number | string;
  product_id: number | string;
  warehouse_id: number | string;
  stock: number | string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/** Stok seperti dikembalikan index/show: disertai relasi product & warehouse. */
export interface StockWithRelations extends Stock {
  product: Product | null;
  warehouse: Warehouse | null;
}
