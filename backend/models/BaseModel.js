/**
 * models/BaseModel.js
 * Model dasar CRUD di atas Google Sheet.
 *
 * Konvensi:
 * - ID autoincrement (integer), dihitung dari id terbesar di sheet.
 * - Hanya soft delete: kolom `deleted_at` selalu ada; menghapus = isi
 *   `deleted_at` + sembunyikan (hide) baris di sheet. Tidak ada hard delete.
 *
 * Turunkan class ini untuk tiap entitas (lihat models/Produk.js).
 */
class BaseModel {
  /**
   * @param {string} sheetName nama sheet penyimpanan.
   * @param {string[]} headers kolom; harus memuat 'id'. 'deleted_at'
   *   ditambahkan otomatis bila belum ada.
   */
  constructor(sheetName, headers) {
    this.sheetName = sheetName;
    this.headers = headers.indexOf('deleted_at') === -1
      ? headers.concat(['deleted_at'])
      : headers;
  }

  /**
   * Ambil semua baris sebagai array object (tanpa data terhapus).
   * Sumber data: cache in-memory (lihat bagian cache). Sheet hanya dibaca
   * sekali (saat cache kosong); selanjutnya dilayani dari variabel.
   * @param {{withTrashed?: boolean}} [opts] sertakan data ter-soft-delete.
   */
  all(opts) {
    opts = opts || {};
    var rows = this._cached();
    if (!opts.withTrashed) {
      rows = rows.filter(function (r) { return !r.deleted_at; });
    } else {
      rows = rows.slice();
    }
    return rows;
  }

  /** Cari satu record berdasarkan id (abaikan yang terhapus). @return {Object|null} */
  find(id) {
    return this.findBy('id', id);
  }

  /** Cari satu record berdasarkan kolom apa pun. @return {Object|null} */
  findBy(field, value) {
    var all = this.all();
    for (var i = 0; i < all.length; i++) {
      if (String(all[i][field]) === String(value)) return all[i];
    }
    return null;
  }

  /** Buat record baru dengan id autoincrement. @return {Object} */
  create(data) {
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = this._sheet();
      var now = new Date().toISOString();
      var record = this._fill(data, {
        id: this._nextId(sheet),
        created_at: now,
        updated_at: now,
        deleted_at: ''
      });
      var headers = this._headerRow(sheet);
      sheet.appendRow(headers.map(function (h) {
        return record[h] !== undefined ? record[h] : '';
      }));
      this._cacheUpsert(record);
      return record;
    } finally {
      lock.releaseLock();
    }
  }

  /** Update record by id. @return {Object|null} record baru / null. */
  update(id, data) {
    var found = this._findRow(id);
    if (!found) return null;
    var record = this._fill(data, found.record);
    record.id = found.record.id;
    record.created_at = found.record.created_at;
    record.updated_at = new Date().toISOString();
    this._writeRow(found.sheet, found.rowNumber, record);
    this._cacheUpsert(record);
    return record;
  }

  /**
   * Soft delete: isi deleted_at lalu sembunyikan baris. @return {boolean}
   */
  remove(id) {
    var found = this._findRow(id);
    if (!found) return false;
    var record = this._fill({ deleted_at: new Date().toISOString() }, found.record);
    record.updated_at = new Date().toISOString();
    this._writeRow(found.sheet, found.rowNumber, record);
    found.sheet.hideRows(found.rowNumber);
    this._cacheUpsert(record);
    return true;
  }

  /**
   * Pulihkan record: kosongkan deleted_at lalu tampilkan baris. @return {Object|null}
   */
  restore(id) {
    var found = this._findRow(id);
    if (!found) return null;
    var record = this._fill({ deleted_at: '' }, found.record);
    record.updated_at = new Date().toISOString();
    this._writeRow(found.sheet, found.rowNumber, record);
    found.sheet.showRows(found.rowNumber);
    this._cacheUpsert(record);
    return record;
  }

  /* ----------------------------- cache ----------------------------- */
  /**
   * Cache dua tingkat, isinya SEMUA record (termasuk yang ter-soft-delete);
   * filter `deleted_at` dilakukan saat baca di all().
   *
   * - L1: variabel statis `BaseModel._caches`, dibagikan antar instance
   *   dalam satu eksekusi. Tercepat, tapi reset tiap request baru.
   * - L2: CacheService.getScriptCache(), bertahan antar request (maks 6 jam)
   *   sehingga hit frontend berikutnya tidak perlu baca sheet.
   *
   * Tiap create/update/remove/restore meng-upsert record ke kedua layer,
   * jadi cache selalu sinkron tanpa membaca ulang sheet.
   */

  /** Ambil seluruh record: L1 -> L2 -> sheet. @private @return {Object[]} */
  _cached() {
    var key = this._cacheKey();
    var l1 = BaseModel._caches[key];
    if (l1) return l1;

    var l2 = this._l2Get();
    if (l2) {
      BaseModel._caches[key] = l2; // promosikan ke L1
      return l2;
    }

    return this._reload();
  }

  /** Baca ulang seluruh sheet, isi L1 + L2. @private @return {Object[]} */
  _reload() {
    var sheet = this._sheet();
    var values = sheet.getDataRange().getValues();
    var records = [];
    if (values.length >= 2) {
      var headers = values[0];
      for (var i = 1; i < values.length; i++) {
        records.push(BaseModel.rowToObject(headers, values[i]));
      }
    }
    BaseModel._caches[this._cacheKey()] = records;
    this._l2Put(records);
    return records;
  }

  /**
   * Sisipkan atau ganti satu record di cache berdasarkan id, lalu persist
   * ke L2. Memastikan cache termuat dulu agar L1 & L2 tetap utuh. @private
   */
  _cacheUpsert(record) {
    var cache = this._cached(); // pastikan termuat (L1/L2/sheet)
    var replaced = false;
    for (var i = 0; i < cache.length; i++) {
      if (String(cache[i].id) === String(record.id)) {
        cache[i] = record;
        replaced = true;
        break;
      }
    }
    if (!replaced) cache.push(record);
    this._l2Put(cache);
  }

  /** Kosongkan cache sheet ini di kedua layer. @private */
  _invalidate() {
    delete BaseModel._caches[this._cacheKey()];
    try { CacheService.getScriptCache().remove(this._l2Key()); } catch (e) {}
  }

  /**
   * Kunci cache unik per spreadsheet + sheet. Wajib menyertakan id spreadsheet
   * supaya cache tiap worksheet user tidak saling tabrakan (sheetName seperti
   * 'products' sama di semua worksheet). @private
   */
  _cacheKey() {
    return this._spreadsheet().getId() + ':' + this.sheetName;
  }

  /** Kunci entri L2 untuk sheet ini. @private */
  _l2Key() {
    return 'model:' + this._cacheKey();
  }

  /** Baca L2; null bila kosong / gagal parse. @private @return {Object[]|null} */
  _l2Get() {
    try {
      var raw = CacheService.getScriptCache().get(this._l2Key());
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Tulis L2. Diabaikan bila gagal (mis. data > 100KB, batas CacheService);
   * L1 + sheet tetap jadi sumber yang valid. @private
   */
  _l2Put(records) {
    try {
      CacheService.getScriptCache().put(
        this._l2Key(), JSON.stringify(records), BaseModel.CACHE_TTL);
    } catch (e) {
      // lewati L2; jangan gagalkan operasi tulis hanya karena cache
    }
  }

  /* --------------------------- internal --------------------------- */

  /** Hitung id autoincrement berikutnya (termasuk data terhapus). @private */
  _nextId(sheet) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return 1;
    var idCol = this._headerRow(sheet).indexOf('id') + 1;
    var ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
    var max = 0;
    for (var i = 0; i < ids.length; i++) {
      var n = parseInt(ids[i][0], 10);
      if (!isNaN(n) && n > max) max = n;
    }
    return max + 1;
  }

  /** Temukan baris by id (termasuk terhapus). @private */
  _findRow(id) {
    var sheet = this._sheet();
    var values = sheet.getDataRange().getValues();
    var idCol = values[0].indexOf('id');
    for (var r = 1; r < values.length; r++) {
      if (String(values[r][idCol]) === String(id)) {
        return {
          sheet: sheet,
          rowNumber: r + 1,
          record: BaseModel.rowToObject(values[0], values[r])
        };
      }
    }
    return null;
  }

  /** Tulis ulang satu baris sesuai urutan kolom sheet. @private */
  _writeRow(sheet, rowNumber, record) {
    var headers = this._headerRow(sheet);
    sheet.getRange(rowNumber, 1, 1, headers.length).setValues([
      headers.map(function (h) { return record[h] !== undefined ? record[h] : ''; })
    ]);
  }

  /**
   * Gabung input dengan default, hanya untuk kolom yang dikenal.
   * @private
   */
  _fill(data, base) {
    var record = {};
    this.headers.forEach(function (h) {
      if (base[h] !== undefined) record[h] = base[h];
    });
    this.headers.forEach(function (h) {
      if (data[h] !== undefined) record[h] = data[h];
    });
    return record;
  }

  /** Baca baris header dari sheet. @private */
  _headerRow(sheet) {
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }

  /** Ambil / buat sheet beserta header (sinkron kolom yang kurang). @private */
  _sheet() {
    var ss = this._spreadsheet();
    var sheet = ss.getSheetByName(this.sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(this.sheetName);
      sheet.appendRow(this.headers);
      return sheet;
    }
    if (sheet.getLastColumn() === 0) {
      sheet.appendRow(this.headers);
      return sheet;
    }
    var existing = this._headerRow(sheet);
    var missing = this.headers.filter(function (h) { return existing.indexOf(h) === -1; });
    if (missing.length) {
      sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
    }
    return sheet;
  }

  /**
   * Spreadsheet target untuk model ini. Default: worksheet data milik user
   * aktif (lihat RequestContext). Model tabel global seperti User meng-override
   * ini agar memakai spreadsheet utama. @protected
   */
  _spreadsheet() {
    return RequestContext.dataSpreadsheet();
  }

  /** Spreadsheet utama (bound) tempat tabel global seperti `users` disimpan. */
  static mainSpreadsheet() {
    return SpreadsheetApp.getActiveSpreadsheet();
  }

  /** Petakan satu baris ke object. */
  static rowToObject(headers, row) {
    var obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  }
}

/**
 * L1: cache in-memory bersama (per eksekusi), dipetakan per nama sheet.
 * @type {Object<string, Object[]>}
 */
BaseModel._caches = {};

/** TTL L2 (CacheService) dalam detik. Maks Apps Script = 21600 (6 jam). */
BaseModel.CACHE_TTL = 21600;
