import type { Product } from './product';

/** Baris detail stock in (sheet `stockin_details`). */
export interface StockInDetail {
  id: number | string;
  stockin_id: number | string;
  stock_id: number | string;
  price: number | string;
  qty: number | string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/** Detail seperti dikembalikan backend: disertai info product (via stock). */
export interface StockInDetailWithProduct extends StockInDetail {
  product: Product | null;
}

/** Header stock in (sheet `stock_ins`). */
export interface StockIn {
  id: number | string;
  invoice_number: string;
  supplier: string;
  total: number | string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/** Header beserta seluruh barisnya — bentuk yang dikembalikan index/show. */
export interface StockInWithDetails extends StockIn {
  details: StockInDetailWithProduct[];
}

/** Satu baris detail yang dikirim saat create. */
export interface StockInDetailInput {
  stock_id: number | string;
  price: number;
  qty: number;
}

/** Body create stock in (header + details dalam satu request). */
export interface StockInInput {
  invoice_number: string;
  supplier: string;
  total: number;
  details: StockInDetailInput[];
}
