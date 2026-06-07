import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../../tables/services/table.service';
import { OrderService } from '../../orders/services/order.service';
import { ClubTable } from '../../tables/models/table.model';
import { Order } from '../../orders/models/order.model';

@Component({
  selector: 'app-tables-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tables-page.component.html',
})
export class TablesPageComponent implements OnInit {
  tables: ClubTable[] = [];
  openOrders: Order[] = [];

  constructor(
    private tableService: TableService,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.tables = this.tableService.getTables();
    this.openOrders = this.orderService.getOrders().filter(o => !o.receiptGenerated && o.tableNumber > 0);
  }

  getOrderForTable(table: ClubTable): Order | undefined {
    if (!table.openOrderId) return undefined;
    return this.orderService.getOrderById(table.openOrderId);
  }
}
