/**
 * controllers/WarehouseController.js
 * Controller gudang. Mewarisi aksi CRUD dari BaseController.
 *
 * Pada pembacaan (index/show), tiap gudang disertai daftar produk yang
 * tersimpan di dalamnya (relasi lewat tabel stocks), berikut jumlah stoknya.
 */
class WarehouseController extends BaseController {
  constructor() {
    super(new Warehouses());
    this.stocks = new Stock();
    this.products = new Produk();
  }

  /** GET daftar gudang + list produk. */
  index(params) {
    if (params && params.id) return this.show(params);
    var self = this;
    var stocks = this.stocks.all();
    var productById = BaseController.indexById(this.products.all());
    return Result.ok(this.model.all().map(function (w) {
      return self._withProducts(w, stocks, productById);
    }));
  }

  /** GET satu gudang + list produk. */
  show(params) {
    var warehouse = this.model.find(params.id);
    if (!warehouse) throw ApiError.notFound('Data tidak ditemukan: ' + params.id);
    return Result.ok(this._withProducts(
      warehouse, this.stocks.all(), BaseController.indexById(this.products.all())));
  }

  /** Tempelkan daftar produk (dengan stok) ke sebuah gudang. @private */
  _withProducts(warehouse, stocks, productById) {
    var list = stocks
      .filter(function (s) { return String(s.warehouse_id) === String(warehouse.id); })
      .map(function (s) {
        return Object.assign({}, productById[String(s.product_id)], {
          stock_id: s.id,
          stock: s.stock
        });
      });
    return Object.assign({}, warehouse, { products: list });
  }
}
