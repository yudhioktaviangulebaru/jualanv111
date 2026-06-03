/**
 * controllers/ProdukController.js
 * Controller produk. Mewarisi aksi CRUD dari BaseController.
 */
class ProdukController extends BaseController {
  constructor() {
    super(new Produk());
  }
}
