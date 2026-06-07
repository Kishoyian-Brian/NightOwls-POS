import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../services/payment.service';
import { Order } from '../../orders/models/order.model';
import { PaymentMethod } from '../models/payment.model';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments-page.component.html',
})
export class PaymentsPageComponent implements OnInit {
  orders: Order[] = [];
  filter: 'unpaid' | 'all' = 'unpaid';
  selectedMethod: PaymentMethod = 'cash';

  methods: PaymentMethod[] = ['cash', 'mpesa', 'card'];

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.orders = this.filter === 'unpaid'
      ? this.paymentService.getUnpaidOrders()
      : this.paymentService.getBillableOrders();
  }

  setFilter(f: 'unpaid' | 'all'): void {
    this.filter = f;
    this.load();
  }

  collect(order: Order): void {
    if (this.paymentService.recordPayment(order.id, this.selectedMethod)) {
      this.load();
    }
  }
}
