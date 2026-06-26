/**
 * controllers/StockInController.js
 * Controller stok masuk (stock in) beserta detailnya.
 *
 * Dua entitas, satu endpoint:
 * - stock_ins        : header (invoice_number, supplier, total).
 * - stockin_details  : baris detail (stockin_id, stock_id, price, qty).
 *
 * Insert header + seluruh detail dilakukan dalam satu request `store`.
 * Body:
 *   { invoice_number, supplier, total, details: [ { stock_id, price, qty }, ... ] }
 *
 * Rule API:
 * - `invoice_number` wajib unik. Bila sudah ada yang sama, balas 400.
 * - Tiap detail:
 *   - stock_id wajib menunjuk stok yang ada, jika tidak: 400 "invalid stock id".
 *   - qty tidak boleh 0/kosong: 400 "insufficent quantity".
 *   - price tidak boleh 0/kosong: 400 "insufficent price".
 *
 * Validasi seluruh detail dijalankan SEBELUM menulis apa pun, agar tidak ada
 * header yang tersimpan tanpa detail yang valid (Sheet tidak punya transaksi).
 */
class StockInController extends BaseController {
  constructor() {
    super(new StockIn());
    this.details = new StockInDetail();
    this.stocks = new Stock();
    this.products = new Produk();
  }

  /** GET daftar stock in, tiap header disertai detail + info product. */
  index(params) {
    if (params && params.id) return this.show(params);
    var self = this;
    var allDetails = this.details.all();
    var stockById = BaseController.indexById(this.stocks.all());
    var productById = BaseController.indexById(this.products.all());
    return Result.ok(this.model.all().map(function (h) {
      return self._withDetails(h, allDetails, stockById, productById);
    }));
  }

  /** GET satu stock in + detail + info product. */
  show(params) {
    var header = this.model.find(params.id);
    if (!header) throw ApiError.notFound('Data tidak ditemukan: ' + params.id);
    return Result.ok(this._withDetails(
      header,
      this.details.all(),
      BaseController.indexById(this.stocks.all()),
      BaseController.indexById(this.products.all())));
  }

  /**
   * Tempelkan daftar detail ke sebuah header. Tiap detail diberi info product
   * via relasi detail.stock_id -> stock.product_id -> product. @private
   */
  _withDetails(header, allDetails, stockById, productById) {
    var list = allDetails
      .filter(function (d) { return String(d.stockin_id) === String(header.id); })
      .map(function (d) {
        var stock = stockById[String(d.stock_id)] || null;
        var product = stock ? (productById[String(stock.product_id)] || null) : null;
        return Object.assign({}, d, { product: product });
      });
    return Object.assign({}, header, { details: list });
  }

  /** POST buat header + detail (201) / update header (bila ada body.id). */
  store(body) {
    body = body || {};

    if (body.id) return this.update(body);

    if (this._duplicateInvoice(body.invoice_number)) {
      throw ApiError.badRequest('invoice_no already exists');
    }

    // Validasi semua detail dulu, baru tulis (tak ada rollback di Sheet).
    var details = body.details || [];
    details.forEach(function (d) { this._validateDetail(d); }, this);

    var header = this.model.create(body);

    var self = this;
    var savedDetails = details.map(function (d) {
      var detail = self.details.create(Object.assign({}, d, { stockin_id: header.id }));
      self._addStock(d.stock_id, d.qty);
      return detail;
    });

    return Result.created(Object.assign({}, header, { details: savedDetails }));
  }

  /** POST update header. Cegah invoice_number bentrok dengan record lain. */
  update(body) {
    if (body.invoice_number !== undefined &&
        this._duplicateInvoice(body.invoice_number, body.id)) {
      throw ApiError.badRequest('invoice_no already exists');
    }
    return super.update(body);
  }

  /** Validasi satu baris detail; lempar 400 bila tidak valid. @private */
  _validateDetail(d) {
    d = d || {};
    if (!this._exists(this.stocks, d.stock_id)) {
      throw ApiError.badRequest('invalid stock id');
    }
    if (!this._positive(d.qty)) {
      throw ApiError.badRequest('insufficent quantity');
    }
    if (!this._positive(d.price)) {
      throw ApiError.badRequest('insufficent price');
    }
  }

  /** Tambah qty ke stok terkait (stock in menaikkan jumlah stok). @private */
  _addStock(stockId, qty) {
    var stock = this.stocks.find(stockId);
    if (!stock) return;
    var current = Number(stock.stock) || 0;
    this.stocks.update(stock.id, { stock: current + Number(qty) });
  }

  /** True bila invoice_number sudah dipakai record lain (selain excludeId). @private */
  _duplicateInvoice(invoiceNumber, excludeId) {
    if (invoiceNumber === undefined || invoiceNumber === null || invoiceNumber === '') {
      return false;
    }
    var existing = this.model.findBy('invoice_number', invoiceNumber);
    return !!existing && String(existing.id) !== String(excludeId);
  }

  /** Cek sebuah id menunjuk record yang ada. @private */
  _exists(model, id) {
    return id !== undefined && id !== null && id !== '' && !!model.find(id);
  }

  /** True bila nilai berupa angka > 0. @private */
  _positive(value) {
    var n = Number(value);
    return !isNaN(n) && n > 0;
  }
}
