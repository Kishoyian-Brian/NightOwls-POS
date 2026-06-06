import { Injectable } from '@angular/core';
import { Order, OrderItem } from '../models/order.model';

@Injectable({
    providedIn: 'root'
})

export class OrderService{
    private readonly ORDER_KEY = 'cm_orders';

    getOrders(): Order[]{
        return JSON.parse(localStorage.getItem(this.ORDER_KEY) || '[]');
    }

    saveOrder(order: Order):void{
        const orders = this.getOrders();
        orders.push(order);
        localStorage.setItem(this.ORDER_KEY, JSON.stringify(orders));
    }

    getPendingOrders( type?: 'food' | 'drinks'):Order[]{
        return this.getOrders().filter(o=>
            o.status === 'pending' && (!type || o.type === type)
        )
    }

    getOrdersByWaiter(username: string): Order[] {
        return this.getOrders()
            .filter(o => o.createdBy === username && o.type === 'food')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    updateOrderStatus(orderId:string, status:Order['status']):void{
        const orders = this.getOrders().map(o=>
            o.id === orderId ? {...o, status} : o
        );
        localStorage.setItem(this.ORDER_KEY, JSON.stringify(orders));
    }
    calculateTotal(items:OrderItem[]):number{
        return items.reduce((sum,item)=>sum + item.price * item.quantity, 0);
    }
}