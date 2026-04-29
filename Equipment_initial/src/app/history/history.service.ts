import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { motorData } from '../motor-data';


@Injectable({
    providedIn: 'root'
})

export class HistoryService {
    private savedItems = new BehaviorSubject<motorData[]>([]);
    public savedItems$ = this.savedItems.asObservable();

    constructor() {
        // Load saved items from localStorage if available
        const stored = localStorage.getItem('savedItems');
        if (stored) {
            try {
                this.savedItems.next(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading saved items from localStorage:', e);
            }
        }
    }

    saveItem(item: motorData): void {
        const current = this.savedItems.value;
        const updated = [...current, item];
        this.savedItems.next(updated);
        // Persist to localStorage
        localStorage.setItem('savedItems', JSON.stringify(updated));
    }

    getSavedItems(): motorData[] {
        return this.savedItems.value;
    }

    clearHistory(): void {
        this.savedItems.next([]);
        localStorage.removeItem('savedItems');
    }

    removeItem(itemOrIndex: motorData | number): void {
        const current = this.savedItems.value;
        let updated: motorData[];

        if (typeof itemOrIndex === 'number') {
            updated = current.filter((_, i) => i !== itemOrIndex);
        } else {
            if (itemOrIndex.id) {
                updated = current.filter(saved => saved.id !== itemOrIndex.id);
            } else {
                updated = current.filter(saved => saved !== itemOrIndex);
            }
        }

        this.savedItems.next(updated);
        localStorage.setItem('savedItems', JSON.stringify(updated));
    }
}
