/**
 * controllers/UserController.js
 * Controller user. Mewarisi aksi CRUD dari BaseController.
 *
 * Tabel users bersifat global (di spreadsheet utama). Aturan tambah user:
 * - Hanya Owner (role 'admin') yang boleh menambah user.
 * - Owner hanya boleh menambah user level 'kasir' atau 'gudang'.
 * - User yang ditambahkan otomatis memakai worksheet_url milik Owner yang
 *   menambahkannya, sehingga datanya dikelola di worksheet yang sama.
 */
class UserController extends BaseController {
  constructor() {
    super(new User());
  }

  /** Role yang boleh dibuat Owner (lihat .task.md). */
  static get CREATABLE_ROLES() {
    return ['kasir', 'gudang'];
  }

  /** POST buat user (201) / update (bila ada body.id). */
  store(body) {
    body = body || {};

    if (body.id) return this.update(body);

    var caller = RequestContext.user();
    if (!caller || caller.role !== 'admin') {
      throw ApiError.unauthorized('Hanya Owner yang dapat menambah user');
    }

    if (UserController.CREATABLE_ROLES.indexOf(body.role) === -1) {
      throw ApiError.badRequest(
        'Owner hanya dapat menambah user kasir atau gudang',
      );
    }

    // Kasir & gudang memakai worksheet_url Owner yang menambahkannya.
    body.worksheet_url = caller.worksheet_url;

    return Result.created(this.model.create(body));
  }
}
