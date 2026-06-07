import { Injectable } from '@angular/core';
import { OrderService } from '../../orders/services/order.service';
import { ClubTable } from '../models/table.model';

@Injectable({
    providedIn: 'root'
})
export class TableService {
    readonly tableCount = 20;

    constructor(private orderService: OrderService) {}

    getTables(): ClubTable[] {
        const openOrders = this.orderService.getOrders()
            .filter(o => !o.receiptGenerated && o.tableNumber > 0);

        return Array.from({ length: this.tableCount }, (_, i) => {
            const number = i + 1;
            const openOrder = openOrders.find(o => o.tableNumber === number);
            return {
                number,
                status: openOrder ? 'occupied' : 'free',
                openOrderId: openOrder?.id,
            };
        });
    }

    isTableOccupied(tableNumber: number): boolean {
        return this.orderService.getOrders().some(
            o => o.tableNumber === tableNumber && !o.receiptGenerated
        );
    }

    getOpenOrderIdForTable(tableNumber: number): string | undefined {
        return this.orderService.getOrders().find(
            o => o.tableNumber === tableNumber && !o.receiptGenerated
        )?.id;
    }
}
