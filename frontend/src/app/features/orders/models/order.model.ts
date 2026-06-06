export interface OrderItem{
    id:number;
    name:string;
    quantity:number;
    category:string;
    price:number;
}
export interface Order{
    id:string;
    tableNumber:number;
    items:OrderItem[];
    total:number;
    status:'pending' | 'preparing' | 'ready' | 'served';
    createdAt:string;
    updatedAt:string;
    createdBy:string;
    type: 'food' | 'drinks';
}