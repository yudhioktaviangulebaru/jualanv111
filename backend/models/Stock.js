class Stock extends BaseModel {
    constructor() {
        super('stocks', ['id', 'product_id', 'warehouse_id','stock', 'created_at', 'updated_at', 'deleted_at']);
      }
}