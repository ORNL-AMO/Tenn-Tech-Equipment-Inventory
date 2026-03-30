import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MotorData {
    name: string;
    result: string;
    description: string;
    CAT_NO: string;
    SPEC: string;
    HORSEPOWER: string;
    VOLTAGE: string;
    AMPERAGE: string;
    RPM: string;
    FRAME: string;
    HERTZ: string;
    PH: string;
    SER_F: string;
    CODE: string;
    DES: string;
    CLASS: string;
    NEMA_NOM_EFF: string;
    P_F: string;
    RATING: string;
    CC: string;
    USABLE_AT: string;
    BEARINGS_DE: string;
    BEARINGS_ODE: string;
    ENCL: string;
    SERIAL_NUMBER: string;
}

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private savedItems = new BehaviorSubject<MotorData[]>([]);
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

    saveItem(item: MotorData): void {
        const current = this.savedItems.value;
        const updated = [...current, item];
        this.savedItems.next(updated);
        // Persist to localStorage
        localStorage.setItem('savedItems', JSON.stringify(updated));
    }

    getSavedItems(): MotorData[] {
        return this.savedItems.value;
    }

    clearHistory(): void {
        this.savedItems.next([]);
        localStorage.removeItem('savedItems');
    }

    removeItem(index: number): void {
        const current = this.savedItems.value;
        const updated = current.filter((_, i) => i !== index);
        this.savedItems.next(updated);
        localStorage.setItem('savedItems', JSON.stringify(updated));
    }
}
