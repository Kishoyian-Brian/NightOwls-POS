import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/authentication/services/auth.service';
import { OrderService } from '../../orders/services/order.service';
import { Order, OrderItem } from '../../orders/models/order.model';

@Component({
  selector: 'app-kitchen-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kitchen-dashboard.component.html'
})
export class KitchenDashboardComponent implements OnInit {
  username = '';
  orders: Order[] = [];
  activeFilter: 'all' | Order['status'] = 'pending';

  constructor(
    private auth: AuthService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user || !this.auth.isKitchen()) {
      this.router.navigate(['/login']);
      return;
    }
    this.username = user.username;
    this.loadOrders();
  }

  loadOrders(): void {
    this.orders = this.orderService.getKitchenOrders();
  }

  get filteredOrders(): Order[] {
    if (this.activeFilter === 'all') return this.orders;
    return this.orders.filter(o => o.status === this.activeFilter);
  }

  selectFilter(filter: 'all' | Order['status']): void {
    this.activeFilter = filter;
  }

  countByFilter(filter: 'all' | Order['status']): number {
    if (filter === 'all') return this.orders.length;
    return this.orders.filter(o => o.status === filter).length;
  }

  get filterLabel(): string {
    switch (this.activeFilter) {
      case 'all': return 'All Incoming Orders';
      case 'pending': return 'New Orders from Waiters';
      case 'preparing': return 'With Cooks';
      case 'ready': return 'Ready to Serve';
      default: return 'Kitchen Orders';
    }
  }

  updateStatus(order: Order, status: Order['status']): void {
    this.orderService.updateOrderStatus(order.id, status);
    this.loadOrders();
  }

  nextStatus(order: Order): Order['status'] | null {
    switch (order.status) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'served';
      default: return null;
    }
  }

  actionLabel(order: Order): string {
    switch (order.status) {
      case 'pending': return 'Receive Order';
      case 'preparing': return 'Mark Ready';
      case 'ready': return 'Mark Served';
      default: return '';
    }
  }

  getFoodItems(order: Order): OrderItem[] {
    return this.orderService.getFoodItems(order);
  }

  getFoodTotal(order: Order): number {
    return this.orderService.calculateTotal(this.getFoodItems(order));
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
