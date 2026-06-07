    import { Injectable } from '@angular/core';
import {
    StoreItem,
    StoreLocation,
    StoreMovement,
    STORE_LOCATION_LABELS,
} from '../models/store.model';

const SEED: Omit<StoreItem, 'id'>[] = [
    { name: 'Tomatoes', category: 'produce', unit: 'kg', store: 20, kitchen: 5, bar: 0, club: 0 },
    { name: 'Chicken breast', category: 'meat', unit: 'kg', store: 15, kitchen: 8, bar: 0, club: 0 },
    { name: 'Cooking oil', category: 'dry-goods', unit: 'L', store: 10, kitchen: 3, bar: 0, club: 0 },
    { name: 'Beer crates', category: 'beverages', unit: 'crates', store: 12, kitchen: 0, bar: 6, club: 0 },
    { name: 'Spirits box', category: 'beverages', unit: 'boxes', store: 8, kitchen: 0, bar: 4, club: 0 },
    { name: 'Napkins', category: 'supplies', unit: 'packs', store: 30, kitchen: 5, bar: 10, club: 15 },
    { name: 'Cleaning supplies', category: 'cleaning', unit: 'units', store: 10, kitchen: 2, bar: 2, club: 4 },
];

@Injectable({ providedIn: 'root' })
export class StoreService {
    private readonly ITEMS_KEY = 'cm_store_items';
    private readonly MOVEMENTS_KEY = 'cm_store_movements';

    constructor() {
        this.seed();
    }

    private seed(): void {
        if (localStorage.getItem(this.ITEMS_KEY)) return;
        const items: StoreItem[] = SEED.map((item, i) => ({
            ...item,
            id: `store-${i + 1}`,
        }));
        localStorage.setItem(this.ITEMS_KEY, JSON.stringify(items));
    }

    getItems(): StoreItem[] {
        return JSON.parse(localStorage.getItem(this.ITEMS_KEY) || '[]') as StoreItem[];
    }

    getItemById(id: string): StoreItem | undefined {
        return this.getItems().find(i => i.id === id);
    }

    saveItem(item: StoreItem): void {
        const items = this.getItems();
        const index = items.findIndex(i => i.id === item.id);
        if (index >= 0) {
            items[index] = item;
        } else {
            items.push(item);
        }
        localStorage.setItem(this.ITEMS_KEY, JSON.stringify(items));
    }

    addItem(item: Omit<StoreItem, 'id'>): StoreItem {
        const newItem: StoreItem = {
            ...item,
            id: `store-${Date.now()}`,
        };
        this.saveItem(newItem);
        return newItem;
    }

    getQtyAt(item: StoreItem, location: StoreLocation): number {
        return item[location];
    }

    getMovements(): StoreMovement[] {
        return (JSON.parse(localStorage.getItem(this.MOVEMENTS_KEY) || '[]') as StoreMovement[])
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    receiveFromMarket(itemId: string, quantity: number, recordedBy: string, note?: string): boolean {
        if (quantity <= 0) return false;
        const item = this.getItemById(itemId);
        if (!item) return false;

        item.store += quantity;
        this.saveItem(item);
        this.logMovement({
            itemId,
            itemName: item.name,
            type: 'receive',
            quantity,
            from: 'market',
            to: 'store',
            note,
            recordedBy,
        });
        return true;
    }

    transfer(itemId: string, from: StoreLocation, to: StoreLocation, quantity: number, recordedBy: string, note?: string): boolean {
        if (quantity <= 0 || from === to) return false;
        const item = this.getItemById(itemId);
        if (!item || item[from] < quantity) return false;

        item[from] -= quantity;
        item[to] += quantity;
        this.saveItem(item);
        this.logMovement({
            itemId,
            itemName: item.name,
            type: 'transfer',
            quantity,
            from,
            to,
            note,
            recordedBy,
        });
        return true;
    }

    getTotalAt(location: StoreLocation): number {
        return this.getItems().reduce((sum, item) => sum + item[location], 0);
    }

    locationLabel(location: StoreLocation | 'market'): string {
        if (location === 'market') return 'Market';
        return STORE_LOCATION_LABELS[location];
    }

    private logMovement(partial: Omit<StoreMovement, 'id' | 'createdAt'>): void {
        const movements = this.getMovements();
        movements.unshift({
            ...partial,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        });
        localStorage.setItem(this.MOVEMENTS_KEY, JSON.stringify(movements.slice(0, 200)));
    }
}
