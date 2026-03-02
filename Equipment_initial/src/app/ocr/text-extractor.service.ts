import { Injectable } from '@angular/core';

export interface FieldMapping {
    signals: string[];
    field: string;
}

export interface ExtractedValues {
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
export class TextExtractorService {

    private fieldMappings: FieldMapping[] = [
        { signals: ['CAT NO', 'CAT_NO', 'CATALOG NO', 'CAT.NO'], field: 'CAT_NO' },
        { signals: ['SPEC', 'SPECIFICATION', 'SPEC.'], field: 'SPEC' },
        { signals: ['HORSEPOWER', 'HP'], field: 'HORSEPOWER' },
        { signals: ['VOLTAGE', 'VOLTS'], field: 'VOLTAGE' },
        { signals: ['AMPERAGE', 'AMPS', 'AVPS'], field: 'AMPERAGE' },
        { signals: ['RPM', 'SPEED', 'REM.'], field: 'RPM' },
        { signals: ['FRAME'], field: 'FRAME' },
        { signals: ['HERTZ', 'HZ', 'FREQUENCY'], field: 'HERTZ' },
        { signals: ['PH', 'PHASE'], field: 'PH' },
        { signals: ['SER F', 'SER. F.', 'SER_F', 'SERVICE FACTOR'], field: 'SER_F' },
        { signals: ['CODE'], field: 'CODE' },
        { signals: ['DES', 'DESIGN'], field: 'DES' },
        { signals: ['CLASS'], field: 'CLASS' },
        { signals: ['NEMA NOM EFF', 'NEMA_NOM_EFF', 'NEMA NOMINAL EFFICIENCY'], field: 'NEMA_NOM_EFF' },
        { signals: ['P F', 'P_F', 'POWER FACTOR'], field: 'P_F' },
        { signals: ['RATING'], field: 'RATING' },
        { signals: ['CC'], field: 'CC' },
        { signals: ['USABLE AT'], field: 'USABLE_AT' },
        { signals: ['BEARINGS DE', 'BEARINGS_DE'], field: 'BEARINGS_DE' },
        { signals: ['BEARINGS ODE', 'BEARINGS_ODE'], field: 'BEARINGS_ODE' },
        { signals: ['ENCL', 'ENCLOSURE'], field: 'ENCL' },
        { signals: ['SERIAL NUMBER', 'SERIAL_NUMBER', 'SERIAL NO', 'S/N'], field: 'SERIAL_NUMBER' }
    ];

    constructor() { }

    /**
     * Extracts equipment specification values from OCR description text
     * Algorithm: For each field, find its signal word, then extract text until the next signal word
     * @param description The cleaned OCR text to extract values from
     * @returns Object containing extracted values for each field
     */
    extractValues(description: string): Partial<ExtractedValues> {
        const extractedValues: any = {};
        const textUpper = description.toUpperCase();

        // Flatten all signal words into a single array with their field mappings for quick lookup
        const allSignals = new Map<string, string>(); // signal -> field
        for (const mapping of this.fieldMappings) {
            for (const signal of mapping.signals) {
                if (signal.trim() !== '') {
                    allSignals.set(signal, mapping.field);
                }
            }
        }

        // Process each field
        for (const fieldMapping of this.fieldMappings) {
            let startIndex = -1;
            let matchedSignal = '';

            // Step 1: Find the first signal word for this field
            for (const signal of fieldMapping.signals) {
                if (signal.trim() === '') continue;
                const index = textUpper.indexOf(signal);
                if (index !== -1 && (startIndex === -1 || index < startIndex)) {
                    startIndex = index;
                    matchedSignal = signal;
                }
            }

            // Signal word not found, skip this field
            if (startIndex === -1 || !matchedSignal) {
                continue;
            }

            // Step 2: Delete everything before and including the signal word
            const afterSignalIndex = startIndex + matchedSignal.length;
            let remainingText = description.substring(afterSignalIndex);
            let remainingTextUpper = textUpper.substring(afterSignalIndex);

            // Step 3: Find the next signal word (any signal word that isn't for this field)
            let nextSignalIndex = -1;
            let nextSignalLength = 0;

            // Search for any signal word in the remaining text
            for (const [signal, field] of allSignals.entries()) {
                // Skip signals for the current field
                if (field === fieldMapping.field) continue;

                const index = remainingTextUpper.indexOf(signal);
                if (index !== -1 && (nextSignalIndex === -1 || index < nextSignalIndex)) {
                    nextSignalIndex = index;
                    nextSignalLength = signal.length;
                }
            }

            // Step 4: Extract text between current signal and next signal
            let value: string;
            if (nextSignalIndex !== -1) {
                // Delete everything from the next signal word onwards
                value = remainingText.substring(0, nextSignalIndex);
            } else {
                // No next signal found, take rest of text
                value = remainingText;
            }

            // Step 5: Clean and assign the value
            value = this.cleanExtractedValue(value);
            if (value) {
                extractedValues[fieldMapping.field] = value;
            }
        }

        return extractedValues;
    }

    /**
     * Intelligently cleans extracted values by removing noise and keeping meaningful content
     * @param rawValue The raw extracted text
     * @returns Cleaned value
     */
    private cleanExtractedValue(rawValue: string): string {
        // Trim whitespace
        let value = rawValue.trim();
        
        // Remove leading/trailing punctuation and special characters
        value = value.replace(/^[^a-zA-Z0-9]+/, '');
        value = value.replace(/[^a-zA-Z0-9.]+$/, '');
        
        // Split by common delimiters to get the first meaningful chunk
        // This helps when multiple values are crammed together
        const chunks = value.split(/[\s,;/|\-]+/);
        
        if (chunks.length === 0) {
            return '';
        }

        // Get the first chunk that contains alphanumeric characters
        for (const chunk of chunks) {
            const cleaned = chunk.replace(/[^a-zA-Z0-9.]/g, '').trim();
            if (cleaned.length > 0) {
                return cleaned;
            }
        }

        return '';
    }
}
