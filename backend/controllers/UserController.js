/**
 * controllers/UserController.js
 * Controller user. Mewarisi aksi CRUD dari BaseController.
 *
 * Tabel users bersifat global (di spreadsheet utama). Aturan tambah user:
 * - Admin (platform) boleh menambah owner/kasir/gudang dan WAJIB menyertakan
 *   worksheet_url (link spreadsheet toko) tujuan.
 * - Owner hanya boleh menambah kasir/gudang; worksheet_url otomatis memakai
 *   milik Owner sehingga datanya dikelola di worksheet yang sama.
 */
class UserController extends BaseController {
  constructor() {
    super(new User());
  }

  /** Role yang boleh dibuat tiap pembuat. */
  static get CREATABLE_BY() {
    return {
      admin: ['owner', 'kasir', 'gudang'],
      owner: ['kasir', 'gudang'],
    };
  }

  /** POST buat user (201) / update (bila ada body.id). */
  store(body) {
    body = body || {};

    if (body.id) return this.update(body);

    var caller = RequestContext.user();
    var callerRole = caller && String(caller.role || '').toLowerCase();
    var allowed = UserController.CREATABLE_BY[callerRole];
    if (!allowed) {
      throw ApiError.unauthorized('Tidak punya akses menambah user');
    }

    if (allowed.indexOf(body.role) === -1) {
      throw ApiError.badRequest(
        'Role tidak boleh ditambahkan: ' + (body.role || '(kosong)'),
      );
    }

    if (callerRole === 'admin') {
      // Admin menentukan toko tujuan secara eksplisit.
      if (!body.worksheet_url) {
        throw ApiError.badRequest('worksheet_url (link spreadsheet toko) wajib diisi');
      }
    } else {
      // Owner: kasir/gudang memakai worksheet_url milik Owner.
      body.worksheet_url = caller.worksheet_url;
    }

    return Result.created(this.model.create(body));
  }
}
