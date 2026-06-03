class Warehouses extends BaseModel {
    constructor(){
        super('warehouses', ['id', 'name', 'created_at', 'updated_at', 'deleted_at']);
    }
}