import { Component, OnInit, inject } from '@angular/core';
import { InventoryService } from './inventory.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { motorData } from '../motor-data.model';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatExpansionModule, MatDividerModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {
  private inventoryService = inject(InventoryService);
  private snackBar = inject(MatSnackBar);
  
  inventoryItems: motorData[] = [];
  inventoryItemsForDisplay: motorData[] = [];
  selectedImage: string | null = null;

  ngOnInit(): void {
    this.inventoryService.inventoryItems$.subscribe(items => {
      this.inventoryItems = items;
      this.inventoryItemsForDisplay = [...items].reverse();
    });
  }

  openImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }

  closeImage(): void {
    this.selectedImage = null;
  }

  togglePanel(panel: MatExpansionPanel, event: MouseEvent): void {
    event.stopPropagation();
    panel.toggle();
  }

  deleteItem(item: motorData): void {
    this.inventoryService.removeItem(item);
    this.snackBar.open('Item removed from inventory', 'Ok', { duration: 5000 });
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all inventory?')) {
      this.inventoryService.clearInventory();
      this.snackBar.open('Inventory cleared', 'Ok', { duration: 5000 });
    }
  }

  exportItem(item: motorData, format: string): void {
    if (format === 'json') {
      const dataStr = JSON.stringify(item, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.name}_equipment.json`;
      link.click();
      URL.revokeObjectURL(url);
      this.snackBar.open('Item exported', 'Ok', { duration: 3000 });
    }
  }
}
