/**
 * controllers/ProdukController.js
 * Controller produk. Mewarisi aksi CRUD dari BaseController.
 *
 * Pada pembacaan (index/show), tiap produk disertai daftar gudang tempat
 * produk itu disimpan (relasi lewat tabel stocks), berikut jumlah stoknya.
 */
class ProdukController extends BaseController {
  constructor() {
    super(new Produk());
    this.stocks = new Stock();
    this.warehouses = new Warehouses();
  }

  /** GET daftar produk + list gudang. */
  index(params) {
    if (params && params.id) return this.show(params);
    var self = this;
    var stocks = this.stocks.all();
    var warehouseById = BaseController.indexById(this.warehouses.all());
    return Result.ok(this.model.all().map(function (p) {
      return self._withWarehouses(p, stocks, warehouseById);
    }));
  }

  /** GET satu produk + list gudang. */
  show(params) {
    var product = this.model.find(params.id);
    if (!product) throw ApiError.notFound('Data tidak ditemukan: ' + params.id);
    return Result.ok(this._withWarehouses(
      product, this.stocks.all(), BaseController.indexById(this.warehouses.all())));
  }

  /** Tempelkan daftar gudang (dengan stok) ke sebuah produk. @private */
  _withWarehouses(product, stocks, warehouseById) {
    var list = stocks
      .filter(function (s) { return String(s.product_id) === String(product.id); })
      .map(function (s) {
        return Object.assign({}, warehouseById[String(s.warehouse_id)], {
          stock_id: s.id,
          stock: s.stock
        });
      });
    return Object.assign({}, product, { warehouses: list });
  }
}
