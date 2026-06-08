import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClubTable } from '../models/table.model';

@Component({
  selector: 'app-table-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <p class="text-sm font-semibold text-gray-700 mb-2">{{ label }}</p>
      <div class="grid grid-cols-5 gap-2">
        <button *ngFor="let table of tables"
                type="button"
                (click)="select(table)"
                [disabled]="disableOccupied && table.status === 'occupied' && selectedTable !== table.number"
                class="py-2.5 rounded-xl text-sm font-bold transition-all border-2"
                [class.bg-teal-600]="selectedTable === table.number"
                [class.text-white]="selectedTable === table.number"
                [class.border-teal-600]="selectedTable === table.number"
                [class.bg-green-50]="selectedTable !== table.number && table.status === 'free'"
                [class.border-green-200]="selectedTable !== table.number && table.status === 'free'"
                [class.text-green-800]="selectedTable !== table.number && table.status === 'free'"
                [class.bg-orange-50]="selectedTable !== table.number && table.status === 'occupied'"
                [class.border-orange-200]="selectedTable !== table.number && table.status === 'occupied'"
                [class.text-orange-400]="selectedTable !== table.number && table.status === 'occupied'"
                [class.opacity-50]="disableOccupied && table.status === 'occupied' && selectedTable !== table.number"
                [class.cursor-not-allowed]="disableOccupied && table.status === 'occupied' && selectedTable !== table.number">
          {{ table.number }}
        </button>
      </div>
      <p *ngIf="error" class="text-red-500 text-xs mt-2">{{ error }}</p>
      <p class="text-xs text-gray-400 mt-2 flex gap-3">
        <span><span class="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span>Free</span>
        <span><span class="inline-block w-2 h-2 rounded-full bg-orange-400 mr-1"></span>Occupied</span>
      </p>
    </div>
  `
})
export class TablePickerComponent {
  @Input() tables: ClubTable[] = [];
  @Input() selectedTable: number | null = null;
  @Input() label = 'Select table';
  @Input() error = '';
  @Input() disableOccupied = true;
  @Output() tableSelected = new EventEmitter<number>();

  select(table: ClubTable): void {
    if (this.disableOccupied && table.status === 'occupied' && this.selectedTable !== table.number) {
      return;
    }
    this.tableSelected.emit(table.number);
  }
}
