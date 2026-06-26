/**
 * controllers/BaseController.js
 * Controller dasar: menjembatani route dengan model.
 * Mengembalikan Result (sukses) atau melempar ApiError (gagal).
 * Turunkan untuk tiap resource (lihat controllers/ProdukController.js).
 */
class BaseController {
  /** @param {BaseModel} model instance model. */
  constructor(model) {
    this.model = model;
  }

  /** GET daftar / detail (bila ada params.id). */
  index(params) {
    if (params && params.id) return this.show(params);
    return Result.ok(this.model.all());
  }

  /** GET satu record. */
  show(params) {
    var record = this.model.find(params.id);
    if (!record) throw ApiError.notFound('Data tidak ditemukan: ' + params.id);
    return Result.ok(record);
  }

  /** POST buat (201) / update (bila ada body.id). */
  store(body) {
    if (body && body.id) return this.update(body);
    return Result.created(this.model.create(body));
  }

  /** POST update record. */
  update(body) {
    var record = this.model.update(body.id, body);
    if (!record) throw ApiError.notFound('Data tidak ditemukan: ' + body.id);
    return Result.ok(record);
  }

  /** POST hapus record (soft delete). */
  destroy(body) {
    var ok = this.model.remove(body.id);
    if (!ok) throw ApiError.notFound('Data tidak ditemukan: ' + body.id);
    return Result.ok({ deleted: true, id: body.id });
  }

  /** POST pulihkan record yang ter-soft-delete. */
  restore(body) {
    var record = this.model.restore(body.id);
    if (!record) throw ApiError.notFound('Data tidak ditemukan: ' + body.id);
    return Result.ok(record);
  }

  /**
   * Bangun map { id -> record } untuk lookup relasi yang cepat.
   * @param {Object[]} rows
   * @return {Object<string, Object>}
   */
  static indexById(rows) {
    var map = {};
    rows.forEach(function (r) { map[String(r.id)] = r; });
    return map;
  }
}
