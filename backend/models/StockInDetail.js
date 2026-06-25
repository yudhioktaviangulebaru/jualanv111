class StockInDetail extends BaseModel {
    constructor() {
        super('stockin_details', ['id', 'stockin_id', 'stock_id', 'price', 'qty', 'created_at', 'updated_at', 'deleted_at']);
    }
}
