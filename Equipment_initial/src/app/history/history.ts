import { Component, OnInit, inject } from '@angular/core';
import { HistoryService, MotorData } from './history.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-history',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatExpansionModule, MatDividerModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History implements OnInit {
  private historyService = inject(HistoryService);
  private snackBar = inject(MatSnackBar);
  
  savedItems: MotorData[] = [];
  searchTerm: string = '';

  ngOnInit(): void {
    this.historyService.savedItems$.subscribe(items => {
      this.savedItems = items;
    });
  }

  get filteredItems(): MotorData[] {
    if (!this.searchTerm) return this.savedItems;
    const term = this.searchTerm.toLowerCase();
    return this.savedItems.filter(item =>
      item.name.toString().toLowerCase().includes(term) ||
      item.CAT_NO.toString().toLowerCase().includes(term) ||
      item.description.toString().toLowerCase().includes(term)
    );
  }

  deleteItem(index: number): void {
    this.historyService.removeItem(index);
    this.snackBar.open('Item removed from history', 'Ok');
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all history?')) {
      this.historyService.clearHistory();
      this.snackBar.open('History cleared', 'Ok');
    }
  }

  exportItem(item: MotorData): void {
    const dataStr = JSON.stringify(item, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.name}_equipment.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.snackBar.open('Item exported', 'Ok');
  }
}
