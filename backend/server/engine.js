/**
 * server/engine.js
 * Base server engine untuk Google Apps Script Web App.
 *
 * BaseServer membungkus parsing request, routing per `action`,
 * dan pembuatan response JSON. Route didaftarkan di dalam class.
 */
class BaseServer {
  constructor() {
    /** @type {Object<string, Function>} handler GET per action */
    this.getRoutes = {};
    /** @type {Object<string, Function>} handler POST per action */
    this.postRoutes = {};

    // Daftar semua route di sini.
    this.registerRoutes();
  }

  /**
   * Daftarkan seluruh route aplikasi.
   * Pola: this.resource(action, controller) untuk CRUD standar.
   */
  registerRoutes() {
    this.onGet('ping', function () {
      return { pong: true, time: new Date().toISOString() };
    });

    this.resource('product', new ProdukController());
    this.resource('user', new UserController());
    this.resource('warehouse', new WarehouseController());
    this.resource('stock', new StockController());

    this.resource('stockin', new StockInController());
    this.resource('transaction', new TransactionController());

    var auth = new AuthController();
    this.onPost('login', function (body) { return auth.login(body); });
  }

  /**
   * Daftarkan route CRUD standar untuk sebuah controller.
   * GET  ?action=<name>[&id]  -> index / show
   * POST {action:<name>}      -> store / update (bila ada id)
   * POST {action:<name>.delete} -> destroy
   * @param {string} name
   * @param {BaseController} controller
   * @return {BaseServer} this
   */
  resource(name, controller) {
    this.onGet(name, function (params) { return controller.index(params); });
    this.onPost(name, function (body) { return controller.store(body); });
    this.onPost(name + '.delete', function (body) { return controller.destroy(body); });
    this.onPost(name + '.restore', function (body) { return controller.restore(body); });
    return this;
  }

  /* --------------------------- registrasi -------------------------- */

  /**
   * Daftarkan handler untuk request GET.
   * @param {string} action
   * @param {function(Object):Object} handler menerima params, return data.
   * @return {BaseServer} this (chainable)
   */
  onGet(action, handler) {
    this.getRoutes[action] = handler;
    return this;
  }

  /**
   * Daftarkan handler untuk request POST.
   * @param {string} action
   * @param {function(Object):Object} handler menerima body, return data.
   * @return {BaseServer} this (chainable)
   */
  onPost(action, handler) {
    this.postRoutes[action] = handler;
    return this;
  }

  /* ----------------------------- entry ----------------------------- */

  /**
   * Entry point GET. Sambungkan dari doGet(e).
   * @param {Object} e event object Apps Script.
   * @return {TextOutput}
   */
  handleGet(e) {
    RequestContext.reset();
    return this._dispatch(this.getRoutes, this._parseParams(e), 'GET');
  }

  /**
   * Entry point POST. Sambungkan dari doPost(e).
   * @param {Object} e event object Apps Script.
   * @return {TextOutput}
   */
  handlePost(e) {
    RequestContext.reset();
    return this._dispatch(this.postRoutes, this._parseBody(e), 'POST');
  }

  /* --------------------------- internal --------------------------- */

  /**
   * Jalankan handler sesuai action lalu bungkus jadi response JSON.
   * @private
   */
  _dispatch(routes, payload, method) {
    try {
      var action = payload.action || '';
      var handler = routes[action];

      if (!handler) {
        return BaseServer.fail(404, 'Action tidak dikenal: "' + action + '" (' + method + ')');
      }

      // Semua action butuh autentikasi kecuali yang publik (ping, login).
      // Verifikasi id_token -> set user aktif -> worksheet datanya terbuka via context.
      if (!BaseServer.PUBLIC_ACTIONS[action]) {
        var realUser = AuthController.authenticate(payload);
        RequestContext.setUser(BaseServer.resolveEffectiveUser(realUser, payload));
      }

      var out = handler.call(this, payload);
      var result = out instanceof Result ? out : Result.ok(out);
      return BaseServer.success(result.code, result.data);
    } catch (err) {
      var code = err instanceof ApiError ? err.code : 400;
      return BaseServer.fail(code, err.message);
    }
  }

  /**
   * Ambil query string params dari request GET.
   * @private
   */
  _parseParams(e) {
    return (e && e.parameter) || {};
  }

  /**
   * Parse body JSON dari request POST.
   * @private
   */
  _parseBody(e) {
    if (e && e.postData && e.postData.contents) {
      return JSON.parse(e.postData.contents);
    }
    return {};
  }

  /** Response sukses { message:"SUCCESS", code, data }. */
  static success(code, data) {
    return BaseServer.json({ message: 'SUCCESS', code: code, data: data });
  }

  /** Response gagal { message:"FAIL", code, data:{ error } }. */
  static fail(code, message) {
    return BaseServer.json({ message: 'FAIL', code: code, data: { error: message } });
  }

  /**
   * Bungkus object menjadi TextOutput JSON.
   * @param {Object} obj
   * @return {TextOutput}
   */
  static json(obj) {
    return ContentService
      .createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
  }

  /**
   * Tentukan user efektif sebuah request. Bila request menyertakan `as_user`
   * (impersonasi) DAN pemilik token asli berrole 'admin', konteks diganti ke
   * user target sehingga seluruh operasi data berjalan di toko target. Selain
   * itu, user asli dipakai apa adanya.
   * @param {Object} realUser user hasil verifikasi id_token.
   * @param {Object} payload params (GET) / body (POST) request.
   * @return {Object} user efektif untuk RequestContext.
   * @private
   */
  static resolveEffectiveUser(realUser, payload) {
    var asUser = payload && payload.as_user;
    if (!asUser) return realUser;

    if (String(realUser.role || '').toLowerCase() !== 'admin') {
      throw ApiError.unauthorized('Hanya admin yang dapat impersonate user');
    }

    var target = new User().find(asUser);
    if (!target) {
      throw ApiError.notFound('User impersonate tidak ditemukan: ' + asUser);
    }
    return target;
  }
}

/** Action yang tidak butuh autentikasi (tanpa id_token). */
BaseServer.PUBLIC_ACTIONS = { ping: true, login: true };
