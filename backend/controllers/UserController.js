/**
 * controllers/UserController.js
 * Controller user. Mewarisi aksi CRUD dari BaseController.
 */
class UserController extends BaseController {
  constructor() {
    super(new User());
  }
}
