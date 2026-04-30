import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MotorConverterService {

    constructor() { }

    kwToHp(kwValue: string | number): number | null {
        const num = this.extractNumber(kwValue);
        if (num === null) return null;
        // 1 HP = 0.7457 kW, so kW / 0.7457 = HP
        return num / 0.7457;
    }

    wattsToHp(wattsValue: string | number): number | null {
        const num = this.extractNumber(wattsValue);
        if (num === null) return null;
        return num / 745.7;
    }

    private extractNumber(input: string | number): number | null {
        if (typeof input === 'number') return input;
        if (!input || input.trim() === '') return null;

        // Strip out everything that isn't a digit or a decimal point
        const cleanString = input.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(cleanString);

        return isNaN(parsed) ? null : parsed;
    }
}