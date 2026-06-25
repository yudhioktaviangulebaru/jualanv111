/**
 * models/User.js
 * Model user. Mewarisi CRUD dari BaseModel.
 */
class User extends BaseModel {
  constructor() {
    super('users', ['id', 'email', 'name', 'picture', 'role','worksheet_url', 'created_at', 'updated_at','deleted_at']);
  }

  /** Tabel users bersifat global: selalu di spreadsheet utama, bukan worksheet per-user. */
  _spreadsheet() {
    return BaseModel.mainSpreadsheet();
  }
}

User.BASE_ROLE = ['user', 'admin'];
