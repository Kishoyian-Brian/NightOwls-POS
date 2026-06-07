import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/authentication/services/auth.service';
import { OrderService } from '../../orders/services/order.service';
import { OrderItem, Order } from '../../orders/models/order.model';
import { OrderReceiptComponent } from '../../orders/components/order-receipt.component';
import { TableService } from '../../tables/services/table.service';
import { TablePickerComponent } from '../../tables/components/table-picker.component';
import { ClubTable } from '../../tables/models/table.model';
import { ProductService } from '../../products/services/product.service';
import { SettingsService } from '../../settings/services/settings.service';
import { Product } from '../../products/models/product.model';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  itemType: 'food' | 'drinks';
}

@Component({
  selector: 'app-waiter-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderReceiptComponent, TablePickerComponent],
  templateUrl: './waiter-dashboard.component.html'
})
export class WaiterDashboardComponent implements OnInit {
  cart: OrderItem[] = [];
  showCart = false;
  username = '';
  activeView: 'menu' | 'orders' = 'menu';
  activeCategory = 'all';
  menuMode: 'food' | 'drinks' = 'food';
  activeOrderId: string | null = null;
  drinkSearchQuery = '';
  receiptOrder: Order | null = null;
  orders: Order[] = [];
  selectedTable: number | null = null;
  tableError = '';

  searchKeyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  menuItems: MenuItem[] = [];

  foodCategories = ['all', 'starters', 'mains', 'platters'];
  drinkCategories = ['all', 'cocktails', 'beers', 'wines', 'soft'];

  constructor(
    private auth: AuthService,
    private orderService: OrderService,
    private tableService: TableService,
    private productService: ProductService,
    private settingsService: SettingsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user || user.role !== 'waiter') {
      this.router.navigate(['/']);
      return;
    }
    this.username = user.username;
    this.loadMenu();
    this.setMenuMode(this.route.snapshot.queryParamMap.get('menu'));
    this.restoreActiveOrder();
    this.loadOrders();
  }

  private activeOrderStorageKey(): string {
    return `cm_active_order_${this.username}`;
  }

  private restoreActiveOrder(): void {
    const savedId = sessionStorage.getItem(this.activeOrderStorageKey());
    if (!savedId) return;

    const order = this.orderService.getOrderById(savedId);
    if (order && this.orderService.canModifyOrder(order) && order.createdBy === this.username) {
      this.activeOrderId = savedId;
    } else {
      sessionStorage.removeItem(this.activeOrderStorageKey());
    }
  }

  private setActiveOrder(orderId: string | null): void {
    this.activeOrderId = orderId;
    if (orderId) {
      sessionStorage.setItem(this.activeOrderStorageKey(), orderId);
    } else {
      sessionStorage.removeItem(this.activeOrderStorageKey());
    }
  }

  private setMenuMode(menu: string | null): void {
    if (menu === 'food' || menu === 'drinks') {
      this.menuMode = menu;
      sessionStorage.setItem('cm_waiter_menu', menu);
    } else {
      const saved = sessionStorage.getItem('cm_waiter_menu');
      this.menuMode = saved === 'drinks' ? 'drinks' : 'food';
    }
    this.activeCategory = 'all';
    if (this.menuMode !== 'drinks') {
      this.drinkSearchQuery = '';
    }
  }

  get activeOrder(): Order | undefined {
    return this.activeOrderId ? this.orderService.getOrderById(this.activeOrderId) : undefined;
  }

  get categories(): string[] {
    return this.menuMode === 'food' ? this.foodCategories : this.drinkCategories;
  }

  get menuTitle(): string {
    return this.menuMode === 'food' ? 'Food Menu' : 'Drinks Menu';
  }

  private loadMenu(): void {
    this.menuItems = this.productService.getActiveProducts().map((p: Product) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      itemType: p.itemType,
    }));
  }

  private deductStock(items: OrderItem[]): void {
    if (!this.settingsService.getSettings().trackInventory) return;
    this.productService.decrementStock(items.map(i => ({ id: i.id, quantity: i.quantity })));
  }

  get tables(): ClubTable[] {
    return this.tableService.getTables();
  }

  onTableSelected(tableNumber: number): void {
    this.selectedTable = tableNumber;
    this.tableError = '';
  }

  get sendButtonLabel(): string {
    if (this.activeOrderId) {
      return `Add to Order #${this.activeOrderId.slice(-4)}`;
    }
    return 'Send Order';
  }

  get filteredMenuItems(): MenuItem[] {
    let items = this.menuItems
      .filter(i => i.itemType === this.menuMode)
      .filter(i => this.activeCategory === 'all' || i.category === this.activeCategory);

    if (this.menuMode === 'drinks' && this.drinkSearchQuery.trim()) {
      const q = this.drinkSearchQuery.trim().toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      );
    }

    return items;
  }

  appendSearchChar(char: string): void {
    if (this.drinkSearchQuery.length >= 32) return;
    this.drinkSearchQuery += char.toLowerCase();
  }

  backspaceSearchChar(): void {
    this.drinkSearchQuery = this.drinkSearchQuery.slice(0, -1);
  }

  clearDrinkSearch(): void {
    this.drinkSearchQuery = '';
  }

  canModifyOrder(order: Order): boolean {
    return this.orderService.canModifyOrder(order);
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
  }

  selectOrderToAdd(order: Order): void {
    if (!this.canModifyOrder(order)) return;
    this.setActiveOrder(order.id);
    this.activeView = 'menu';
  }

  startNewOrder(): void {
    this.setActiveOrder(null);
    this.selectedTable = null;
    this.tableError = '';
    this.cart = [];
    this.showCart = false;
  }

  addToOrder(item: MenuItem): void {
    const existing = this.cart.find(i => i.id === item.id);
    if (existing) {
      this.updateQuantity(item.id, 1);
    } else {
      this.cart = [...this.cart, {
        id: item.id,
        name: item.name,
        quantity: 1,
        category: item.category,
        price: item.price,
        itemType: item.itemType,
      }];
    }
    this.showCart = true;
  }

  updateQuantity(itemId: number, change: number): void {
    this.cart = this.cart
      .map(item => {
        if (item.id !== itemId) return item;
        const quantity = item.quantity + change;
        if (quantity <= 0) return null;
        return { ...item, quantity };
      })
      .filter((item): item is OrderItem => item !== null);

    if (this.cart.length === 0) {
      this.showCart = false;
    }
  }

  loadOrders(): void {
    this.orders = this.orderService.getOrdersByWaiter(this.username);
    if (this.activeOrderId) {
      const order = this.orderService.getOrderById(this.activeOrderId);
      if (!order || !this.canModifyOrder(order)) {
        this.setActiveOrder(null);
      }
    }
  }

  switchView(view: 'menu' | 'orders'): void {
    this.activeView = view;
    if (view === 'orders') {
      this.loadOrders();
    }
  }

  get cartTotal(): number {
    return this.orderService.calculateTotal(this.cart);
  }

  sendOrder(): void {
    if (this.cart.length === 0) return;

    if (this.activeOrderId) {
      const success = this.orderService.appendItemsToOrder(this.activeOrderId, this.cart);
      if (!success) {
        alert('This order is closed — receipt already generated.');
        this.setActiveOrder(null);
        return;
      }
      alert(`Items added to Order #${this.activeOrderId.slice(-4)}`);
      this.deductStock(this.cart);
      this.setActiveOrder(null);
    } else {
      if (!this.selectedTable) {
        this.tableError = 'Please select a table before sending.';
        return;
      }
      if (this.tableService.isTableOccupied(this.selectedTable)) {
        this.tableError = 'This table already has an open order.';
        return;
      }

      const now = new Date().toISOString();
      const order: Order = {
        id: Date.now().toString(),
        tableNumber: this.selectedTable,
        items: [...this.cart],
        total: this.cartTotal,
        status: 'pending',
        receiptGenerated: false,
        type: this.orderService.resolveOrderType(this.cart),
        createdAt: now,
        updatedAt: now,
        createdBy: this.username
      };
      this.orderService.saveOrder(order);
      this.deductStock(this.cart);
      alert(`Order sent to Table ${this.selectedTable}`);
      this.selectedTable = null;
      this.tableError = '';
    }

    this.cart = [];
    this.showCart = false;
    this.loadOrders();
  }

  generateReceipt(order: Order): void {
    if (!this.canModifyOrder(order)) return;
    if (!confirm(`Generate receipt for Order #${order.id.slice(-4)}? No more items can be added.`)) {
      return;
    }
    if (this.orderService.generateReceipt(order.id)) {
      if (this.activeOrderId === order.id) {
        this.setActiveOrder(null);
      }
      this.loadOrders();
      const updated = this.orderService.getOrderById(order.id);
      if (updated) {
        this.receiptOrder = updated;
      }
    }
  }

  viewReceipt(order: Order): void {
    if (!order.receiptGenerated) return;
    this.receiptOrder = this.orderService.getOrderById(order.id) ?? order;
  }

  closeReceipt(): void {
    this.receiptOrder = null;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
