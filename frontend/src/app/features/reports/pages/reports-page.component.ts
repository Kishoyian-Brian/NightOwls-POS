import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService, DailySummary, TopItem, WaiterSummary } from '../services/reports.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports-page.component.html',
})
export class ReportsPageComponent implements OnInit {
  daily: DailySummary[] = [];
  topItems: TopItem[] = [];
  waiters: WaiterSummary[] = [];
  maxRevenue = 1;

  constructor(private reports: ReportsService) {}

  ngOnInit(): void {
    this.daily = this.reports.getLast7Days();
    this.topItems = this.reports.getTopItems();
    this.waiters = this.reports.getWaiterSummaries();
    this.maxRevenue = Math.max(...this.daily.map(d => d.revenue), 1);
  }

  barHeight(revenue: number): string {
    return `${Math.round((revenue / this.maxRevenue) * 100)}%`;
  }
}
