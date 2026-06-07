import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../reports/services/reports.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { TableService } from '../../tables/services/table.service';
import { SettingsService } from '../../settings/services/settings.service';

@Component({
  selector: 'app-manager-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-overview.component.html',
})
export class ManagerOverviewComponent implements OnInit {
  todayRevenue = 0;
  todayPaid = 0;
  todayOrders = 0;
  openOrders = 0;
  unpaidCount = 0;
  occupiedTables = 0;
  lowStockCount = 0;
  clubName = 'ClubMaster';
  currency = 'KES';

  tableCount = 20;

  constructor(
    private reports: ReportsService,
    private inventory: InventoryService,
    private tables: TableService,
    private settings: SettingsService,
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    const s = this.settings.getSettings();
    this.clubName = s.clubName;
    this.currency = s.currency;
    this.todayRevenue = this.reports.getTodayRevenue();
    this.todayPaid = this.reports.getTodayPaidRevenue();
    this.todayOrders = this.reports.getTodayOrders().filter(o => o.receiptGenerated).length;
    this.openOrders = this.reports.getOpenOrdersCount();
    this.unpaidCount = this.reports.getUnpaidCount();
    this.occupiedTables = this.tables.getTables().filter(t => t.status === 'occupied').length;
    this.lowStockCount = this.inventory.getLowStockItems().length;
    this.tableCount = this.tables.tableCount;
  }
}
