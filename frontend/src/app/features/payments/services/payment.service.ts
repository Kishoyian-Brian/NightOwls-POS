import { Injectable } from '@angular/core';
import { OrderService } from '../../orders/services/order.service';
import { PaymentMethod } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
    constructor(private orderService: OrderService) {}

    getBillableOrders() {
        return this.orderService.getOrders()
            .filter(o => o.receiptGenerated)
            .sort((a, b) => new Date(b.receiptGeneratedAt ?? b.createdAt).getTime()
                - new Date(a.receiptGeneratedAt ?? a.createdAt).getTime());
    }

    getUnpaidOrders() {
        return this.getBillableOrders().filter(o => o.paymentStatus !== 'paid');
    }

    recordPayment(orderId: string, method: PaymentMethod): boolean {
        const orders = this.orderService.getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index === -1 || !orders[index].receiptGenerated || orders[index].paymentStatus === 'paid') {
            return false;
        }
        orders[index] = {
            ...orders[index],
            paymentStatus: 'paid',
            paymentMethod: method,
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('cm_orders', JSON.stringify(orders));
        return true;
    }
}
