/**
 * controllers/UserController.js
 * Controller user. Mewarisi aksi CRUD dari BaseController.
 *
 * Tabel users bersifat global (di spreadsheet utama). Aturan tambah user:
 * - Hanya user dengan role 'admin' yang boleh menambah user.
 * - User guest (non-admin) otomatis memakai worksheet_url milik admin yang
 *   menambahkannya, sehingga datanya dikelola di worksheet yang sama.
 */
class UserController extends BaseController {
  constructor() {
    super(new User());
  }

  /** POST buat user (201) / update (bila ada body.id). */
  store(body) {
    body = body || {};

    if (body.id) return this.update(body);

    var caller = RequestContext.user();
    if (!caller || caller.role !== 'admin') {
      throw ApiError.unauthorized('Hanya admin yang dapat menambah user');
    }

    // Guest memakai worksheet_url admin yang menambahkannya.
    if (body.role !== 'admin') {
      body.worksheet_url = caller.worksheet_url;
    }

    return Result.created(this.model.create(body));
  }
}
