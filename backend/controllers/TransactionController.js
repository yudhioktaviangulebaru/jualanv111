/**
 * controllers/TransactionController.js
 * Controller transaksi penjualan (kasir) beserta detailnya.
 *
 * Dua entitas, satu endpoint:
 * - transactions          : header (cashier_id, date, subtotal).
 * - transaction_details   : baris detail (transaction_id, stock_id,
 *                           product_name, qty, price, total).
 *
 * Insert header + seluruh detail dilakukan dalam satu request `store`.
 * Body:
 *   { date?, details: [ { stock_id, qty, price }, ... ] }
 *
 * Catatan penting:
 * - `cashier_id` TIDAK diambil dari body, melainkan dari user yang sedang
 *   login (RequestContext.user().id). Nilai cashier_id pada body diabaikan.
 * - Transaksi penjualan MENGURANGI stok terkait sebesar qty.
 *
 * Rule API:
 * - Tiap detail:
 *   - stock_id wajib menunjuk stok yang ada, jika tidak: 400 "invalid stock id".
 *   - qty tidak boleh 0/kosong: 400 "insufficent quantity".
 *   - product terkait wajib punya harga jual > 0: 400 "insufficent price".
 *   - qty tidak boleh melebihi stok tersedia: 400 "insufficent stock".
 *
 * Validasi seluruh detail dijalankan SEBELUM menulis apa pun, agar tidak ada
 * header yang tersimpan tanpa detail yang valid (Sheet tidak punya transaksi).
 *
 * Nilai turunan dihitung di server, bukan dipercaya dari body:
 * - detail.price  = harga jual (sell_price) product terkait — harga dari body
 *                   DIABAIKAN agar harga jual selalu mengikuti referensi produk.
 * - detail.total  = price * qty
 * - detail.product_name = nama product terkait (bila tidak dikirim)
 * - header.subtotal = jumlah seluruh detail.total
 */
class TransactionController extends BaseController {
  constructor() {
    super(new Transaction());
    this.details = new TransactionDetail();
    this.stocks = new Stock();
    this.products = new Produk();
  }

  /** GET daftar transaksi, tiap header disertai detail + info product. */
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

  /** GET satu transaksi + detail + info product. */
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
      .filter(function (d) { return String(d.transaction_id) === String(header.id); })
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

    // Validasi semua detail dulu, baru tulis (tak ada rollback di Sheet).
    var details = body.details || [];
    if (!details.length) throw ApiError.badRequest('transaction has no detail');
    details.forEach(function (d) { this._validateDetail(d); }, this);

    var self = this;
    var productById = BaseController.indexById(this.products.all());

    // Siapkan tiap baris detail + hitung total per baris & subtotal header.
    var subtotal = 0;
    var prepared = details.map(function (d) {
      var qty = Number(d.qty);
      var price = self._sellPrice(d, productById);
      var total = price * qty;
      subtotal += total;
      return {
        stock_id: d.stock_id,
        qty: qty,
        price: price,
        total: total,
        product_name: self._productName(d, productById)
      };
    });

    var header = this.model.create({
      cashier_id: this._cashierId(),
      date: body.date || new Date().toISOString(),
      subtotal: subtotal,
      payment_type: body.payment_type || 'Tunai',
      has_payment: this._hasPayment(body.has_payment)
    });

    var savedDetails = prepared.map(function (d) {
      var detail = self.details.create(Object.assign({}, d, { transaction_id: header.id }));
      self._reduceStock(d.stock_id, d.qty);
      return detail;
    });

    return Result.created(Object.assign({}, header, { details: savedDetails }));
  }

  /** POST update header. cashier_id tetap dari user login, abaikan dari body. */
  update(body) {
    body = Object.assign({}, body, { cashier_id: this._cashierId() });
    if (body.has_payment !== undefined) body.has_payment = this._hasPayment(body.has_payment);
    return super.update(body);
  }

  /**
   * Normalisasi nilai has_payment ke string 'TRUE' / 'FALSE'.
   * Menerima boolean, string 'TRUE'/'true', dll. @private
   */
  _hasPayment(value) {
    return String(value).toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE';
  }

  /** Id user yang sedang login, dipakai sebagai cashier_id. @private */
  _cashierId() {
    var user = RequestContext.user();
    if (!user) throw ApiError.unauthorized('Request belum terautentikasi');
    return user.id;
  }

  /** Harga jual (sell_price) product terkait sebuah detail. @private */
  _sellPrice(d, productById) {
    var stock = this.stocks.find(d.stock_id);
    var product = stock ? (productById[String(stock.product_id)] || null) : null;
    return product ? (Number(product.sell_price) || 0) : 0;
  }

  /** Nama product untuk sebuah detail; pakai dari body bila ada. @private */
  _productName(d, productById) {
    if (d.product_name !== undefined && d.product_name !== null && d.product_name !== '') {
      return d.product_name;
    }
    var stock = this.stocks.find(d.stock_id);
    var product = stock ? (productById[String(stock.product_id)] || null) : null;
    return product ? (product.name || '') : '';
  }

  /** Validasi satu baris detail; lempar 400 bila tidak valid. @private */
  _validateDetail(d) {
    d = d || {};
    var stock = this._exists(this.stocks, d.stock_id) ? this.stocks.find(d.stock_id) : null;
    if (!stock) {
      throw ApiError.badRequest('invalid stock id');
    }
    if (!this._positive(d.qty)) {
      throw ApiError.badRequest('insufficent quantity');
    }
    // Harga diambil dari referensi produk (sell_price), bukan dari body.
    var product = stock.product_id !== undefined && stock.product_id !== null
      ? this.products.find(stock.product_id) : null;
    if (!product || !this._positive(product.sell_price)) {
      throw ApiError.badRequest('insufficent price');
    }
    if (Number(d.qty) > (Number(stock.stock) || 0)) {
      throw ApiError.badRequest('insufficent stock');
    }
  }

  /** Kurangi qty dari stok terkait (penjualan menurunkan jumlah stok). @private */
  _reduceStock(stockId, qty) {
    var stock = this.stocks.find(stockId);
    if (!stock) return;
    var current = Number(stock.stock) || 0;
    this.stocks.update(stock.id, { stock: current - Number(qty) });
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
