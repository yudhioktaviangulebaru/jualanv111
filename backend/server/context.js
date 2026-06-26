/**
 * server/context.js
 * RequestContext: state per-eksekusi untuk satu request.
 *
 * Menyimpan user yang sedang login (hasil verifikasi id_token oleh engine) dan
 * spreadsheet data miliknya. Apps Script menjalankan tiap request single-thread,
 * jadi variabel statis aman dipakai sebagai konteks request.
 *
 * - Tabel global `users` tetap di spreadsheet utama (lihat User#_spreadsheet).
 * - Data per-user (products, warehouses, stocks, stock_ins, ... ) dibaca/ditulis
 *   di worksheet milik user, dibuka dari `user.worksheet_url`.
 */
class RequestContext {
  /** Kosongkan konteks; dipanggil di awal tiap request. */
  static reset() {
    RequestContext._user = null;
    RequestContext._dataSpreadsheet = null;
  }

  /** Set user aktif (sudah terverifikasi). */
  static setUser(user) {
    RequestContext._user = user;
    RequestContext._dataSpreadsheet = null;
  }

  /** User aktif, atau null bila request belum/ tidak terautentikasi. */
  static user() {
    return RequestContext._user;
  }

  /**
   * Spreadsheet data milik user aktif (dibuka dari worksheet_url, lalu dicache
   * untuk sisa request). @return {Spreadsheet}
   */
  static dataSpreadsheet() {
    if (RequestContext._dataSpreadsheet) return RequestContext._dataSpreadsheet;
    var user = RequestContext._user;
    if (!user) throw ApiError.unauthorized('Request belum terautentikasi');
    if (!user.worksheet_url) {
      throw ApiError.badRequest('User tidak memiliki worksheet_url: ' + user.email);
    }
    RequestContext._dataSpreadsheet = RequestContext._open(user.worksheet_url);
    return RequestContext._dataSpreadsheet;
  }

  /** Buka spreadsheet dari URL penuh atau dari id mentah. @private */
  static _open(urlOrId) {
    var s = String(urlOrId);
    return s.indexOf('http') === 0
      ? SpreadsheetApp.openByUrl(s)
      : SpreadsheetApp.openById(s);
  }
}

RequestContext._user = null;
RequestContext._dataSpreadsheet = null;
