import { Injectable } from '@angular/core';
import { ProductService } from '../../products/services/product.service';
import { SettingsService } from '../../settings/services/settings.service';
import { Product } from '../../products/models/product.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
    constructor(
        private productService: ProductService,
        private settingsService: SettingsService,
    ) {}

    getInventory(): Product[] {
        return this.productService.getProducts()
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    getLowStockItems(): Product[] {
        const threshold = this.settingsService.getSettings().lowStockThreshold;
        return this.getInventory().filter(p => p.active && p.stock <= threshold);
    }

    restock(id: number, amount: number): void {
        this.productService.adjustStock(id, amount);
    }
}
