import { Injectable } from '@angular/core';
import { Order, OrderItem } from '../models/order.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private readonly ORDER_KEY = 'cm_orders';
    private readonly DRINK_CATEGORIES = ['cocktails', 'beers', 'wines', 'soft'];

    getOrders(): Order[] {
        return JSON.parse(localStorage.getItem(this.ORDER_KEY) || '[]');
    }

    saveOrder(order: Order): void {
        const orders = this.getOrders();
        orders.push({ ...order, receiptGenerated: order.receiptGenerated ?? false });
        localStorage.setItem(this.ORDER_KEY, JSON.stringify(orders));
    }

    getOrderById(orderId: string): Order | undefined {
        return this.getOrders().find(o => o.id === orderId);
    }

    canModifyOrder(order: Order): boolean {
        return !order.receiptGenerated;
    }

    mergeOrderItems(existing: OrderItem[], incoming: OrderItem[]): OrderItem[] {
        const merged = existing.map(i => ({ ...i }));
        for (const item of incoming) {
            const found = merged.find(m => m.id === item.id);
            if (found) {
                found.quantity += item.quantity;
            } else {
                merged.push({ ...item });
            }
        }
        return merged;
    }

    appendItemsToOrder(orderId: string, newItems: OrderItem[]): boolean {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index === -1 || orders[index].receiptGenerated) return false;

        const order = orders[index];
        const items = this.mergeOrderItems(order.items, newItems);
        orders[index] = {
            ...order,
            items,
            total: this.calculateTotal(items),
            type: this.resolveOrderType(items),
            status: 'pending',
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(this.ORDER_KEY, JSON.stringify(orders));
        return true;
    }

    generateReceipt(orderId: string): boolean {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index === -1 || orders[index].receiptGenerated) return false;

        orders[index] = {
            ...orders[index],
            receiptGenerated: true,
            receiptGeneratedAt: new Date().toISOString(),
            paymentStatus: 'unpaid',
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(this.ORDER_KEY, JSON.stringify(orders));
        return true;
    }

    getItemType(item: OrderItem): 'food' | 'drinks' {
        if (item.itemType) return item.itemType;
        return this.DRINK_CATEGORIES.includes(item.category) ? 'drinks' : 'food';
    }

    getFoodItems(order: Order): OrderItem[] {
        return order.items.filter(i => this.getItemType(i) === 'food');
    }

    getDrinkItems(order: Order): OrderItem[] {
        return order.items.filter(i => this.getItemType(i) === 'drinks');
    }

    orderHasFood(order: Order): boolean {
        return order.items.some(i => this.getItemType(i) === 'food');
    }

    orderHasDrinks(order: Order): boolean {
        return order.items.some(i => this.getItemType(i) === 'drinks');
    }

    getOrdersByWaiter(username: string): Order[] {
        return this.getOrders()
            .filter(o => o.createdBy === username)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    getKitchenOrders(): Order[] {
        return this.getOrders()
            .filter(o => o.status !== 'served' && this.orderHasFood(o))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    getBarOrders(): Order[] {
        return this.getOrders()
            .filter(o => o.status !== 'served' && this.orderHasDrinks(o))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    updateOrderStatus(orderId: string, status: Order['status']): void {
        const orders = this.getOrders().map(o =>
            o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
        );
        localStorage.setItem(this.ORDER_KEY, JSON.stringify(orders));
    }

    calculateTotal(items: OrderItem[]): number {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    resolveOrderType(items: OrderItem[]): Order['type'] {
        const hasFood = items.some(i => this.getItemType(i) === 'food');
        const hasDrinks = items.some(i => this.getItemType(i) === 'drinks');
        if (hasFood && hasDrinks) return 'mixed';
        if (hasDrinks) return 'drinks';
        return 'food';
    }
}
