import { api } from './client';
import type { Product, ProductInput } from '@/types/product';

/** GET semua produk (action: product). */
export function listProducts(): Promise<Product[]> {
  return api.get<Product[]>('product');
}

/** GET satu produk (action: product&id). */
export function getProduct(id: string | number): Promise<Product> {
  return api.get<Product>('product', { id });
}

/** POST buat produk baru (tanpa id → store/create). */
export function createProduct(input: ProductInput): Promise<Product> {
  return api.post<Product>('product', { ...input });
}

/** POST update produk (dengan id → store/update). */
export function updateProduct(
  id: string | number,
  input: ProductInput,
): Promise<Product> {
  return api.post<Product>('product', { id, ...input });
}

/** POST soft-delete produk (action: product.delete). */
export function deleteProduct(
  id: string | number,
): Promise<{ deleted: boolean; id: number | string }> {
  return api.post<{ deleted: boolean; id: number | string }>('product.delete', {
    id,
  });
}
