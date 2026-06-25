/** Produk seperti yang dikembalikan backend (sheet `products`). */
export interface Product {
  id: number | string;
  name: string;
  /** Harga modal / beli. */
  price: number | string;
  /** Harga jual. */
  sell_price: number | string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

/** Field yang dikirim saat create / update. */
export interface ProductInput {
  name: string;
  price: number;
  sell_price: number;
}
