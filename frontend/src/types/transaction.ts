import type { Product } from './product';

/** Baris detail transaksi penjualan (sheet `transaction_details`). */
export interface TransactionDetail {
  id: number | string;
  transaction_id: number | string;
  stock_id: number | string;
  product_name: string;
  qty: number | string;
  price: number | string;
  total: number | string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/** Detail seperti dikembalikan backend: disertai info product (via stock). */
export interface TransactionDetailWithProduct extends TransactionDetail {
  product: Product | null;
}

/** Metode pembayaran transaksi. */
export type PaymentType = 'Tunai' | 'QRIS' | 'DEBIT' | string;

/** Status pembayaran transaksi; backend menyimpan string 'TRUE'/'FALSE'. */
export type HasPayment = 'TRUE' | 'FALSE';

/** Header transaksi penjualan (sheet `transactions`). */
export interface Transaction {
  id: number | string;
  /** Id user kasir yang membuat transaksi (diisi server dari user login). */
  cashier_id: number | string;
  date: string;
  subtotal: number | string;
  /** Metode pembayaran (default server: 'Tunai'). */
  payment_type: PaymentType;
  /** Sudah dibayar? string 'TRUE'/'FALSE' (default server: 'FALSE'). */
  has_payment: HasPayment;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/** Header beserta seluruh barisnya — bentuk yang dikembalikan index/show. */
export interface TransactionWithDetails extends Transaction {
  details: TransactionDetailWithProduct[];
}

/** Satu baris detail yang dikirim saat create (total dihitung server). */
export interface TransactionDetailInput {
  stock_id: number | string;
  qty: number;
  price: number;
}

/**
 * Body create transaksi penjualan (header + details dalam satu request).
 * `cashier_id` TIDAK dikirim — backend mengambilnya dari user yang login.
 */
export interface TransactionInput {
  date?: string;
  /** Metode pembayaran; bila kosong backend default ke 'Tunai'. */
  payment_type?: PaymentType;
  /** Status bayar 'TRUE'/'FALSE'; bila kosong backend default ke 'FALSE'. */
  has_payment?: HasPayment;
  details: TransactionDetailInput[];
}
