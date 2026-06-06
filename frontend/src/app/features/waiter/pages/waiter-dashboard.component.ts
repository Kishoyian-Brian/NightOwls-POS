import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/authentication/services/auth.service';
import { OrderService } from '../../orders/services/order.service';
import { OrderItem, Order } from '../../orders/models/order.model';

interface FoodItem {
    id: number;
    name: string;
    category: 'starters' | 'mains' | 'platters';
    price: number;
  }

@Component({
  selector: 'app-waiter-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './waiter-dashboard.component.html'
})
export class WaiterDashboardComponent implements OnInit {
    cart: OrderItem[] = [];
    showCart = false;
  username = '';
  activeView: 'menu' | 'orders' = 'menu';
  orders: Order[] = [];
  activeCategory: 'all' | FoodItem['category'] = 'all';
  foods: FoodItem[] = [
    { id: 1, name: 'Grilled Chicken', category: 'mains', price: 850 },
    { id: 2, name: 'Beef Burger', category: 'mains', price: 650 },
    { id: 3, name: 'Fish & Chips', category: 'mains', price: 750 },
    { id: 4, name: 'Caesar Salad', category: 'starters', price: 450 },
    { id: 5, name: 'Soup of the Day', category: 'starters', price: 300 },
    { id: 6, name: 'Chocolate Cake', category: 'platters', price: 350 },
    { id: 7, name: 'Ice Cream', category: 'platters', price: 250 },
    { id: 8, name: 'Pizza Margherita', category: 'mains', price: 900 },
  ];

  get filteredFoods(): FoodItem[] {
    if (this.activeCategory === 'all') return this.foods;
    return this.foods.filter(f => f.category === this.activeCategory);
  }
  selectCategory(category: 'all' | FoodItem['category']): void {
    this.activeCategory = category;
  }
  addToOrder(food: FoodItem): void {
    const existingItem = this.cart.find(i => i.id === food.id);
    if (existingItem) {
      this.updateQuantity(food.id, 1);
    } else {
      this.cart = [...this.cart, {
        id: food.id,
        name: food.name,
        quantity: 1,
        category: food.category,
        price: food.price,
      }];
    }
    this.showCart = true;
  }

  removeFromCart(itemId: number): void {
    this.cart = this.cart.filter(i => i.id !== itemId);
    if (this.cart.length === 0) {
      this.showCart = false;
    }
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
  }

  switchView(view: 'menu' | 'orders'): void {
    this.activeView = view;
    if (view === 'orders') {
      this.loadOrders();
    }
  }

  get cartTotal():number{
    return this.orderService.calculateTotal(this.cart);
  }

  sendOrder():void{
    if(this.cart.length === 0)return;

    const now = new Date().toISOString();
    const order = {
      id: Date.now().toString(),
      tableNumber: 0,
      items: [...this.cart],
      total: this.cartTotal,
      status: 'pending' as const,
      type: 'food' as const,
      createdAt: now,
      updatedAt: now,
      createdBy: this.username
    };
    this.orderService.saveOrder(order);
    this.cart = [];
    this.showCart = false;
    this.loadOrders();
    alert('Order sent successfully');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  constructor(private auth: AuthService,
    private orderService: OrderService,
     private router: Router) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user || user.role !== 'waiter') {
      this.router.navigate(['/']);
      return;
    }
    this.username = user.username;
    this.loadOrders();
  }
}
