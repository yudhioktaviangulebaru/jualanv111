/**
 * models/Produk.js
 * Model produk. Mewarisi CRUD dari BaseModel.
 */
class Produk extends BaseModel {
  constructor() {
    super('products', ['id', 'name', 'price','sell_price', 'created_at', 'updated_at', 'deleted_at']);
  }
}
