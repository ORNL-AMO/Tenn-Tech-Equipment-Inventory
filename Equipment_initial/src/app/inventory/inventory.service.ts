import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { motorData } from '../motor-data.model';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    private readonly inventoryStorageKey = 'inventoryItems';
    private readonly legacyStorageKey = 'savedItems';
    private inventoryItems = new BehaviorSubject<motorData[]>([]);
    public inventoryItems$ = this.inventoryItems.asObservable();

    constructor() {
        const stored = localStorage.getItem(this.inventoryStorageKey) ?? localStorage.getItem(this.legacyStorageKey);
        if (stored) {
            try {
                this.inventoryItems.next(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading inventory items from localStorage:', e);
            }
        }
    }

    saveItem(item: motorData): void {
        const current = this.inventoryItems.value;
        const updated = [...current, item];
        this.inventoryItems.next(updated);
        this.persistInventory(updated);
    }

    getInventoryItems(): motorData[] {
        return this.inventoryItems.value;
    }

    clearInventory(): void {
        this.inventoryItems.next([]);
        localStorage.removeItem(this.inventoryStorageKey);
        localStorage.removeItem(this.legacyStorageKey);
    }

    removeItem(itemOrIndex: motorData | number): void {
        const current = this.inventoryItems.value;
        let updated: motorData[];

        if (typeof itemOrIndex === 'number') {
            updated = current.filter((_, i) => i !== itemOrIndex);
        } else {
            if (itemOrIndex.id) {
                updated = current.filter(inventoryItem => inventoryItem.id !== itemOrIndex.id);
            } else {
                updated = current.filter(inventoryItem => inventoryItem !== itemOrIndex);
            }
        }

        this.inventoryItems.next(updated);
        this.persistInventory(updated);
    }

    private persistInventory(items: motorData[]): void {
        try {
            localStorage.setItem(this.inventoryStorageKey, JSON.stringify(items));
        } catch (error) {
            console.warn('Unable to persist inventory to localStorage:', error);
        }
    }
}
