import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-page.component.html',
})
export class ProductsPageComponent implements OnInit {
  products: Product[] = [];
  filter: 'all' | 'food' | 'drinks' = 'all';
  showForm = false;
  editing: Product | null = null;
  form: Product = this.emptyForm();
  error = '';

  foodCategories = ['starters', 'mains', 'platters'];
  drinkCategories = ['cocktails', 'beers', 'wines', 'soft'];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.load();
  }

  private emptyForm(): Product {
    return { id: 0, name: '', category: 'mains', price: 0, itemType: 'food', stock: 100, active: true };
  }

  load(): void {
    this.products = this.productService.getProducts();
  }

  get filtered(): Product[] {
    if (this.filter === 'all') return this.products;
    return this.products.filter(p => p.itemType === this.filter);
  }

  get categories(): string[] {
    return this.form.itemType === 'food' ? this.foodCategories : this.drinkCategories;
  }

  openAdd(): void {
    this.editing = null;
    this.form = this.emptyForm();
    this.form.id = this.productService.nextId();
    this.showForm = true;
    this.error = '';
  }

  openEdit(product: Product): void {
    this.editing = product;
    this.form = { ...product };
    this.showForm = true;
    this.error = '';
  }

  onTypeChange(): void {
    this.form.category = this.form.itemType === 'food' ? 'mains' : 'cocktails';
  }

  save(): void {
    this.error = '';
    if (!this.form.name.trim()) {
      this.error = 'Name is required.';
      return;
    }
    if (this.form.price <= 0) {
      this.error = 'Price must be greater than zero.';
      return;
    }
    this.productService.saveProduct({ ...this.form, name: this.form.name.trim() });
    this.showForm = false;
    this.load();
  }

  toggleActive(product: Product): void {
    this.productService.saveProduct({ ...product, active: !product.active });
    this.load();
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.name}"?`)) return;
    this.productService.deleteProduct(product.id);
    this.load();
  }

  cancel(): void {
    this.showForm = false;
  }
}
