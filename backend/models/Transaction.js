class Transaction extends BaseModel {
    constructor() {
        super('transactions', ['id', 'cashier_id', 'date','subtotal','payment_type','has_payment', 'created_at', 'updated_at', 'deleted_at']);
      }
}