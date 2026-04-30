import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MotorData {
    id?: string;
    name: string;
    result: string;
    description: string;
    image?: string;
    savedAt?: string;
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
export class InventoryService {
    private readonly inventoryStorageKey = 'inventoryItems';
    private readonly legacyStorageKey = 'savedItems';
    private inventoryItems = new BehaviorSubject<MotorData[]>([]);
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

    saveItem(item: MotorData): void {
        const current = this.inventoryItems.value;
        const updated = [...current, item];
        this.inventoryItems.next(updated);
        this.persistInventory(updated);
    }

    getInventoryItems(): MotorData[] {
        return this.inventoryItems.value;
    }

    clearInventory(): void {
        this.inventoryItems.next([]);
        localStorage.removeItem(this.inventoryStorageKey);
        localStorage.removeItem(this.legacyStorageKey);
    }

    removeItem(itemOrIndex: MotorData | number): void {
        const current = this.inventoryItems.value;
        let updated: MotorData[];

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

    private persistInventory(items: MotorData[]): void {
        try {
            localStorage.setItem(this.inventoryStorageKey, JSON.stringify(items));
        } catch (error) {
            console.warn('Unable to persist inventory to localStorage:', error);
        }
    }
}
