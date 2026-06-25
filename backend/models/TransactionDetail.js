class TransactionDetail extends BaseModel {
    constructor() {
        super('transaction_details', [
            'id', 
            'transaction_id', 
            'stock_id',
            'product_name',
            'qty',
            'price','total', 'created_at', 'updated_at', 'deleted_at']);
      }
}