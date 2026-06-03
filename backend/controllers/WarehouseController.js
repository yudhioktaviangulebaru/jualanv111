/**
 * controllers/WarehouseController.js
 * Controller gudang. Mewarisi aksi CRUD dari BaseController.
 */
class WarehouseController extends BaseController {
  constructor() {
    super(new Warehouses());
  }
}
