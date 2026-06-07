import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreService } from '../services/store.service';
import { AuthService } from '../../../core/authentication/services/auth.service';
import {
    StoreItem,
    StoreLocation,
    StoreMovement,
    STORE_CATEGORIES,
    STORE_LOCATION_LABELS,
} from '../models/store.model';

type StoreTab = 'stock' | 'receive' | 'transfer' | 'history';

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store-dashboard.component.html',
})
export class StoreDashboardComponent implements OnInit {
  items: StoreItem[] = [];
  movements: StoreMovement[] = [];
  activeTab: StoreTab = 'stock';
  username = '';

  locations: StoreLocation[] = ['store', 'kitchen', 'bar', 'club'];
  categories = STORE_CATEGORIES;
  locationLabels = STORE_LOCATION_LABELS;
  tabs: StoreTab[] = ['stock', 'receive', 'transfer', 'history'];

  receiveItemId = '';
  receiveQty = 1;
  receiveNote = '';

  transferItemId = '';
  transferFrom: StoreLocation = 'store';
  transferTo: StoreLocation = 'kitchen';
  transferQty = 1;
  transferNote = '';

  showAddItem = false;
  newItem = { name: '', category: 'produce', unit: 'units', store: 0, kitchen: 0, bar: 0, club: 0 };
  error = '';

  constructor(
    private store: StoreService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user || !this.auth.isStore()) {
      this.router.navigate(['/login']);
      return;
    }
    this.username = user.username;
    this.refresh();
  }

  logout(): void {
    this.auth.logout();
  }

  refresh(): void {
    this.items = this.store.getItems();
    this.movements = this.store.getMovements();
    if (!this.receiveItemId && this.items.length) {
      this.receiveItemId = this.items[0].id;
    }
    if (!this.transferItemId && this.items.length) {
      this.transferItemId = this.items[0].id;
    }
  }

  totalAt(loc: StoreLocation): number {
    return this.store.getTotalAt(loc);
  }

  setTab(tab: StoreTab): void {
    this.activeTab = tab;
    this.error = '';
  }

  tabLabel(tab: StoreTab): string {
    switch (tab) {
      case 'stock': return 'Stock levels';
      case 'receive': return 'Receive';
      case 'transfer': return 'Distribute';
      case 'history': return 'History';
    }
  }

  receive(): void {
    this.error = '';
    if (!this.store.receiveFromMarket(this.receiveItemId, this.receiveQty, this.username, this.receiveNote || undefined)) {
      this.error = 'Could not record delivery — check quantity and item.';
      return;
    }
    this.receiveQty = 1;
    this.receiveNote = '';
    this.refresh();
  }

  transfer(): void {
    this.error = '';
    if (!this.store.transfer(this.transferItemId, this.transferFrom, this.transferTo, this.transferQty, this.username, this.transferNote || undefined)) {
      this.error = 'Transfer failed — not enough stock at source location.';
      return;
    }
    this.transferQty = 1;
    this.transferNote = '';
    this.refresh();
  }

  addItem(): void {
    this.error = '';
    if (!this.newItem.name.trim()) {
      this.error = 'Item name is required.';
      return;
    }
    this.store.addItem({ ...this.newItem, name: this.newItem.name.trim() });
    this.showAddItem = false;
    this.newItem = { name: '', category: 'produce', unit: 'units', store: 0, kitchen: 0, bar: 0, club: 0 };
    this.refresh();
  }

  movementLabel(m: StoreMovement): string {
    if (m.type === 'receive') {
      return `Market → ${this.store.locationLabel(m.to)}`;
    }
    return `${this.store.locationLabel(m.from as StoreLocation)} → ${this.store.locationLabel(m.to)}`;
  }
}
