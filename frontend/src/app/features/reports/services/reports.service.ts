import { Injectable } from '@angular/core';
import { Order, OrderItem } from '../../orders/models/order.model';
import { OrderService } from '../../orders/services/order.service';

export interface DailySummary {
    date: string;
    orderCount: number;
    revenue: number;
    paidRevenue: number;
}

export interface TopItem {
    name: string;
    quantity: number;
    revenue: number;
}

export interface WaiterSummary {
    waiter: string;
    orders: number;
    revenue: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
    constructor(private orderService: OrderService) {}

    getTodayOrders(): Order[] {
        const today = new Date().toDateString();
        return this.orderService.getOrders().filter(o =>
            new Date(o.createdAt).toDateString() === today
        );
    }

    getTodayRevenue(): number {
        return this.getTodayOrders()
            .filter(o => o.receiptGenerated)
            .reduce((sum, o) => sum + o.total, 0);
    }

    getTodayPaidRevenue(): number {
        return this.getTodayOrders()
            .filter(o => o.paymentStatus === 'paid')
            .reduce((sum, o) => sum + o.total, 0);
    }

    getOpenOrdersCount(): number {
        return this.orderService.getOrders().filter(o => !o.receiptGenerated).length;
    }

    getUnpaidCount(): number {
        return this.orderService.getOrders()
            .filter(o => o.receiptGenerated && o.paymentStatus !== 'paid').length;
    }

    getLast7Days(): DailySummary[] {
        const orders = this.orderService.getOrders().filter(o => o.receiptGenerated);
        const days: DailySummary[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toDateString();
            const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === dateStr);
            days.push({
                date: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
                orderCount: dayOrders.length,
                revenue: dayOrders.reduce((s, o) => s + o.total, 0),
                paidRevenue: dayOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0),
            });
        }
        return days;
    }

    getTopItems(limit = 5): TopItem[] {
        const map = new Map<string, TopItem>();
        for (const order of this.orderService.getOrders().filter(o => o.receiptGenerated)) {
            for (const item of order.items) {
                const existing = map.get(item.name) ?? { name: item.name, quantity: 0, revenue: 0 };
                existing.quantity += item.quantity;
                existing.revenue += item.price * item.quantity;
                map.set(item.name, existing);
            }
        }
        return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
    }

    getWaiterSummaries(): WaiterSummary[] {
        const map = new Map<string, WaiterSummary>();
        for (const order of this.orderService.getOrders().filter(o => o.receiptGenerated)) {
            const existing = map.get(order.createdBy) ?? { waiter: order.createdBy, orders: 0, revenue: 0 };
            existing.orders += 1;
            existing.revenue += order.total;
            map.set(order.createdBy, existing);
        }
        return [...map.values()].sort((a, b) => b.revenue - a.revenue);
    }
}
