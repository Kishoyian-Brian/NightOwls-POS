import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/authentication/services/auth.service';
import { OrderService } from '../../orders/services/order.service';
import { OrderItem, Order } from '../../orders/models/order.model';

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
  imports: [CommonModule, FormsModule],
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
  orders: Order[] = [];

  searchKeyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  menuItems: MenuItem[] = [
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

  foodCategories = ['all', 'starters', 'mains', 'platters'];
  drinkCategories = ['all', 'cocktails', 'beers', 'wines', 'soft'];

  constructor(
    private auth: AuthService,
    private orderService: OrderService,
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
      this.setActiveOrder(null);
    } else {
      const now = new Date().toISOString();
      const order: Order = {
        id: Date.now().toString(),
        tableNumber: 0,
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
      alert('Order sent successfully');
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
      alert('Receipt generated. Order is now closed.');
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
