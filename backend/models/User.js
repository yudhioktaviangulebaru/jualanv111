/**
 * models/User.js
 * Model user. Mewarisi CRUD dari BaseModel.
 */
class User extends BaseModel {
  constructor() {
    super('users', ['id', 'email', 'name', 'picture', 'role', 'created_at', 'updated_at','deleted_at']);
  }
}

User.BASE_ROLE = ['user', 'admin'];
