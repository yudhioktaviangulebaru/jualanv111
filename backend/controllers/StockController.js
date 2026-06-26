/**
 * controllers/StockController.js
 * Controller stok. Mewarisi aksi CRUD dari BaseController.
 *
 * Rule API:
 * - Sebelum menyimpan, product_id dan warehouse_id wajib menunjuk data yang ada.
 * - Bila salah satu tidak ditemukan: log request + "Please check your product",
 *   lalu balas 400.
 * - Field `stock` default 0 saat record baru dibuat.
 *
 * Pada pembacaan (index/show), tiap stok disertai data product dan warehouse
 * yang berelasi.
 */
class StockController extends BaseController {
  constructor() {
    super(new Stock());
    this.products = new Produk();
    this.warehouses = new Warehouses();
  }

  /** GET daftar stok + relasi product & warehouse. */
  index(params) {
    if (params && params.id) return this.show(params);
    var self = this;
    var productById = BaseController.indexById(this.products.all());
    var warehouseById = BaseController.indexById(this.warehouses.all());
    return Result.ok(this.model.all().map(function (s) {
      return self._withRelations(s, productById, warehouseById);
    }));
  }

  /** GET satu stok + relasi product & warehouse. */
  show(params) {
    var stock = this.model.find(params.id);
    if (!stock) throw ApiError.notFound('Data tidak ditemukan: ' + params.id);
    return Result.ok(this._withRelations(
      stock,
      BaseController.indexById(this.products.all()),
      BaseController.indexById(this.warehouses.all())));
  }

  /** Tempelkan data product & warehouse ke sebuah stok. @private */
  _withRelations(stock, productById, warehouseById) {
    return Object.assign({}, stock, {
      product: productById[String(stock.product_id)] || null,
      warehouse: warehouseById[String(stock.warehouse_id)] || null
    });
  }

  /** POST buat (201) / update (bila ada body.id), dengan validasi referensi. */
  store(body) {
    body = body || {};

    if (body.id) {
      // Update: validasi hanya referensi yang ikut dikirim.
      if (body.product_id !== undefined && !this._exists(this.products, body.product_id)) {
        return this._invalidRef(body);
      }
      if (body.warehouse_id !== undefined && !this._exists(this.warehouses, body.warehouse_id)) {
        return this._invalidRef(body);
      }
      return this.update(body);
    }

    // Create: product_id dan warehouse_id wajib ada dan valid.
    if (!this._exists(this.products, body.product_id) ||
        !this._exists(this.warehouses, body.warehouse_id)) {
      return this._invalidRef(body);
    }

    if (body.stock === undefined || body.stock === null || body.stock === '') {
      body.stock = 0;
    }

    return Result.created(this.model.create(body));
  }

  /** Cek sebuah id menunjuk record yang ada. @private */
  _exists(model, id) {
    return id !== undefined && id !== null && id !== '' && !!model.find(id);
  }

  /** Log request + pesan lalu lempar 400. @private */
  _invalidRef(body) {
    console.log(body);
    console.log('Please check your product');
    throw ApiError.badRequest('Please check your product');
  }
}
