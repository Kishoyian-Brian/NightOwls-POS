import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../services/inventory.service';
import { SettingsService } from '../../settings/services/settings.service';
import { Product } from '../../products/models/product.model';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-page.component.html',
})
export class InventoryPageComponent implements OnInit {
  items: Product[] = [];
  threshold = 10;
  restockAmount: Record<number, number> = {};

  constructor(
    private inventory: InventoryService,
    private settings: SettingsService,
  ) {}

  ngOnInit(): void {
    this.threshold = this.settings.getSettings().lowStockThreshold;
    this.load();
  }

  load(): void {
    this.items = this.inventory.getInventory();
    for (const item of this.items) {
      if (!this.restockAmount[item.id]) this.restockAmount[item.id] = 10;
    }
  }

  isLow(item: Product): boolean {
    return item.active && item.stock <= this.threshold;
  }

  restock(item: Product): void {
    const amount = this.restockAmount[item.id] || 10;
    this.inventory.restock(item.id, amount);
    this.load();
  }
}
