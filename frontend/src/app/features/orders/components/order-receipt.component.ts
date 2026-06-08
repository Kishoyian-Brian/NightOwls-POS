import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../models/order.model';

@Component({
  selector: 'app-order-receipt',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="receipt-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 print:p-0 print:bg-white print:static">
      <div class="receipt-modal bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col print:shadow-none print:rounded-none print:max-w-none print:max-h-none">

        <!-- Screen-only header -->
        <div class="receipt-screen-only px-6 py-4 border-b flex items-center justify-between shrink-0">
          <h2 class="font-bold text-lg text-gray-800">Receipt</h2>
          <button type="button" (click)="closed.emit()"
                  class="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <!-- Printable receipt body -->
        <div id="receipt-print-area" class="receipt-print-area flex-1 overflow-y-auto px-8 py-6 print:overflow-visible">

          <div class="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
            <p class="text-2xl font-extrabold text-gray-900 tracking-wide">ClubMaster</p>
            <p class="text-xs text-gray-500 mt-1 uppercase tracking-widest">Official Receipt</p>
          </div>

          <div class="space-y-1 text-sm text-gray-600 mb-4">
            <div class="flex justify-between">
              <span>Order #</span>
              <span class="font-semibold text-gray-800">{{ order.id.slice(-6) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Waiter</span>
              <span class="font-semibold text-gray-800 capitalize">{{ order.createdBy }}</span>
            </div>
            <div class="flex justify-between">
              <span>Table</span>
              <span class="font-semibold text-gray-800">{{ order.tableNumber || '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span>Date</span>
              <span class="font-semibold text-gray-800">{{ receiptDate | date:'medium' }}</span>
            </div>
            <div class="flex justify-between">
              <span>Type</span>
              <span class="font-semibold text-gray-800 capitalize">{{ order.type }}</span>
            </div>
          </div>

          <div class="border-t border-b border-dashed border-gray-300 py-3 mb-4 space-y-2">
            <div *ngFor="let item of order.items" class="flex justify-between text-sm gap-4">
              <span class="text-gray-800">
                <span class="font-semibold">{{ item.quantity }}×</span> {{ item.name }}
              </span>
              <span class="font-medium text-gray-700 shrink-0">KES {{ item.price * item.quantity }}</span>
            </div>
          </div>

          <div class="flex justify-between items-center text-lg font-bold text-gray-900 mb-6">
            <span>Total</span>
            <span class="text-teal-600">KES {{ order.total }}</span>
          </div>

          <div class="text-center text-xs text-gray-400 border-t border-dashed border-gray-300 pt-4">
            <p>Thank you for dining with us!</p>
            <p class="mt-1">This order is closed — no further items can be added.</p>
          </div>
        </div>

        <!-- Screen-only actions -->
        <div class="receipt-screen-only px-6 py-4 border-t flex gap-3 shrink-0">
          <button type="button" (click)="print()"
                  class="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Print Receipt
          </button>
          <button type="button" (click)="closed.emit()"
                  class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media print {
      body * {
        visibility: hidden !important;
      }
      #receipt-print-area,
      #receipt-print-area * {
        visibility: visible !important;
      }
      #receipt-print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 80mm;
        padding: 8mm;
      }
      .receipt-screen-only {
        display: none !important;
      }
      .receipt-overlay,
      .receipt-modal {
        position: static !important;
        background: white !important;
        box-shadow: none !important;
      }
    }
  `]
})
export class OrderReceiptComponent {
  @Input({ required: true }) order!: Order;
  @Output() closed = new EventEmitter<void>();

  get receiptDate(): string {
    return this.order.receiptGeneratedAt ?? this.order.updatedAt;
  }

  print(): void {
    window.print();
  }
}
