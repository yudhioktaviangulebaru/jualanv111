class StockIn extends BaseModel {
    constructor() {
        super('stock_ins', ['id','invoice_number','supplier','total', 'created_at', 'updated_at', 'deleted_at']);
      }
}