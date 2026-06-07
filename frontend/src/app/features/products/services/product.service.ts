import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

const SEED: Omit<Product, 'stock' | 'active'>[] = [
    { id: 1, name: 'Grilled Chicken', category: 'mains', price: 850, itemType: 'food' },
    { id: 2, name: 'Beef Burger', category: 'mains', price: 650, itemType: 'food' },
    { id: 3, name: 'Fish & Chips', category: 'mains', price: 750, itemType: 'food' },
    { id: 4, name: 'Caesar Salad', category: 'starters', price: 450, itemType: 'food' },
    { id: 5, name: 'Soup of the Day', category: 'starters', price: 300, itemType: 'food' },
    { id: 6, name: 'Chocolate Cake', category: 'platters', price: 350, itemType: 'food' },
    { id: 7, name: 'Ice Cream', category: 'platters', price: 250, itemType: 'food' },
    { id: 8, name: 'Pizza Margherita', category: 'mains', price: 900, itemType: 'food' },
    { id: 101, name: 'Mojito', category: 'cocktails', price: 600, itemType: 'drinks' },
    { id: 102, name: 'Piña Colada', category: 'cocktails', price: 650, itemType: 'drinks' },
    { id: 103, name: 'Long Island', category: 'cocktails', price: 800, itemType: 'drinks' },
    { id: 104, name: 'Margarita', category: 'cocktails', price: 700, itemType: 'drinks' },
    { id: 201, name: 'Tusker', category: 'beers', price: 350, itemType: 'drinks' },
    { id: 202, name: 'Heineken', category: 'beers', price: 400, itemType: 'drinks' },
    { id: 203, name: 'Guinness', category: 'beers', price: 450, itemType: 'drinks' },
    { id: 301, name: 'Red Wine', category: 'wines', price: 500, itemType: 'drinks' },
    { id: 302, name: 'White Wine', category: 'wines', price: 500, itemType: 'drinks' },
    { id: 401, name: 'Coke', category: 'soft', price: 150, itemType: 'drinks' },
    { id: 402, name: 'Water', category: 'soft', price: 100, itemType: 'drinks' },
    { id: 403, name: 'Fresh Juice', category: 'soft', price: 250, itemType: 'drinks' },
];

@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly KEY = 'cm_products';

    constructor() {
        this.seed();
    }

    private seed(): void {
        if (localStorage.getItem(this.KEY)) return;
        const products: Product[] = SEED.map(p => ({ ...p, stock: 100, active: true }));
        localStorage.setItem(this.KEY, JSON.stringify(products));
    }

    getProducts(): Product[] {
        return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    }

    getActiveProducts(): Product[] {
        return this.getProducts().filter(p => p.active);
    }

    getProductById(id: number): Product | undefined {
        return this.getProducts().find(p => p.id === id);
    }

    saveProduct(product: Product): void {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === product.id);
        if (index >= 0) {
            products[index] = product;
        } else {
            products.push(product);
        }
        localStorage.setItem(this.KEY, JSON.stringify(products));
    }

    deleteProduct(id: number): void {
        const products = this.getProducts().filter(p => p.id !== id);
        localStorage.setItem(this.KEY, JSON.stringify(products));
    }

    nextId(): number {
        const products = this.getProducts();
        if (products.length === 0) return 1;
        return Math.max(...products.map(p => p.id)) + 1;
    }

    decrementStock(items: { id: number; quantity: number }[]): void {
        const products = this.getProducts();
        for (const item of items) {
            const product = products.find(p => p.id === item.id);
            if (product) {
                product.stock = Math.max(0, product.stock - item.quantity);
            }
        }
        localStorage.setItem(this.KEY, JSON.stringify(products));
    }

    adjustStock(id: number, delta: number): void {
        const products = this.getProducts();
        const product = products.find(p => p.id === id);
        if (!product) return;
        product.stock = Math.max(0, product.stock + delta);
        localStorage.setItem(this.KEY, JSON.stringify(products));
    }
}
