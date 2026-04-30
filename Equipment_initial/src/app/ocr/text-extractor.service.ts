import { Injectable } from '@angular/core';

export interface ExtractedValues {
    CAT_NO: string;
    SPEC: string;
    HORSEPOWER: string;
    KILOWATTS: string;
    WATTS: string;
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

const MOTOR_DICTIONARY: Record<string, RegExp> = {
    CAT_NO: /(?:^|\s)(?:CATALOG\s*NUMBER|CATALOG|CAT\.?\s*NO\.?|CAT\s*NO)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z0-9\-]+)/,
    SPEC: /(?:^|\s)(?:SPECIFICATION|SPEC)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z0-9\-]+)/,
    HORSEPOWER: /(?:^|\s)(?:HORSEPOWER|H\.P\.|HP|CV|PS)(?=[\s:\-\.])\s*[:\-\.]?\s*([\d\.]+)/,
    KILOWATTS: /(?:^|\s)(?:KILOWATTS|KILOWATT|KW)(?=[\s:\-\.])\s*[:\-\.]?\s*([\d\.]+)/,
    WATTS: /(?:^|\s)(?:WATTS|WATT)(?=[\s:\-\.])\s*[:\-\.]?\s*([\d\.]+)/,
    VOLTAGE: /(?:^|\s)(?:VOLTAGE|VOLTS|VAC|VOL|V)(?=[\s:\-\.])\s*[:\-\.]?\s*([\d\.\-\/]+)/,
    AMPERAGE: /(?:^|\s)(?:AMPERAGE|AMPS|AVPS|AMP|A)(?=[\s:\-\.])\s*[:\-\.]?\s*([\d\.\-\/]+)/,
    RPM: /(?:^|\s)(?:SPEED|R\.P\.M\.|RPMM|RPM)(?=[\s:\-\.])\s*[:\-\.]?\s*([\d]+)/,
    FRAME: /(?:^|\s)(?:FRAME|FRM|FR)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z0-9]+)/,
    HERTZ: /(?:^|\s)(?:FREQUENCY|HERTZ|HZ|UZ)(?=[\s:\-\.])\s*[:\-\.]?\s*([\d\.]+)/,
    PH: /(?:^|\s)(?:PHASE|PH|PU)(?=[\s:\-\.])\s*[:\-\.]?\s*([\d]+)/,
    SER_F: /(?:^|\s)(?:SERVICE\s*FACTOR|SER\s*F|SER_F|S\.F\.|SF)(?=[\s:\-\.])\s*[:\-\.]?\s*([\d\.]+)/,
    CODE: /(?:^|\s)(?:KVA\s*CODE|CODE)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z])/,
    DES: /(?:^|\s)(?:DESIGN|DES)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z])/,
    CLASS: /(?:^|\s)(?:INSULATION|INS\s*CLASS|CLASS)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z]+)/,
    NEMA_NOM_EFF: /(?:^|\s)(?:NEMA\s*NOM\s*EFF|NEMA_NOM_EFF|NOM\s*EFF|EFFICIENCY|EFF)(?=[\s:\-\.])\s*[:\-\.]?\s*([\d\.]+)/,
    P_F: /(?:^|\s)(?:POWER\s*FACTOR|P\.F\.|P_F|PF)(?=[\s:\-\.])\s*[:\-\.]?\s*([\d\.]+)/,
    RATING: /(?:^|\s)(?:TIME\s*RATING|RATING|DUTY)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z0-9\-]+)/,
    CC: /(?:^|\s)(?:CC\s*NO\.?|C\.C\.|CC)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z0-9\-]+)/,
    USABLE_AT: /(?:^|\s)(?:USABLE\s*AT|USABLE\s*ON)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z0-9\.\-\/V]+)/,
    BEARINGS_DE: /(?:^|\s)(?:DRIVE\s*END|DE\s*BRG|BRG\s*DE|D\.E\.|DE)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z0-9\-]+)/,
    BEARINGS_ODE: /(?:^|\s)(?:OPP\s*DRIVE\s*END|OPP\s*D\.E\.|ODE\s*BRG|BRG\s*ODE|O\.D\.E\.|OPEL|ODE)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z0-9\-]+)/,
    ENCL: /(?:^|\s)(?:ENCL\s*TYPE|ENCLTYPE|ENCLOSURE|ENCL)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z0-9\-]+)/,
    SERIAL_NUMBER: /(?:^|\s)(?:SERIAL\s*NUMBER|SERIAL\s*NO\.?|SER\.?\s*NO\.?|S\/N|S\.N\.|SERIAL|SN)(?=[\s:\-\.])\s*[:\-\.]?\s*([A-Z0-9\-]+)/
};

@Injectable({
    providedIn: 'root'
})
export class TextExtractorService {
/*
    private fieldMappings: FieldMapping[] = [
        { signals: ['CAT NO', 'CAT_NO', 'CATALOG NO', 'CAT.NO', 'CAT. NO.', 'CAT. NO', 'CAR. NO.', 'CAR. NO', 'CAR NO', 'CAR NO.', 'CARNO.', 'CARNO'], field: 'CAT_NO' },
        { signals: ['SPEC.', 'SPECIFICATION', 'SPEC'], field: 'SPEC' },
        { signals: ['HORSEPOWER', 'HP', 'WP'], field: 'HORSEPOWER' },
        { signals: ['VOLTAGE', 'VOLTS', 'VOS'], field: 'VOLTAGE' },
        { signals: ['AMPERAGE', 'AMPS', 'AVPS'], field: 'AMPERAGE' },
        { signals: ['RPM', 'SPEED', 'REM.', 'REY'], field: 'RPM' },
        { signals: ['FRAME'], field: 'FRAME' },
        { signals: ['HERTZ', 'HZ', 'FREQUENCY', 'UZ', 'LNZ', 'LIZ'], field: 'HERTZ' },
        { signals: ['PH', 'PHASE', 'PU'], field: 'PH' },
        { signals: ['SER F', 'SER. F.', 'SER_F', 'SERVICE FACTOR'], field: 'SER_F' },
        { signals: ['CODE', 'JEOOEY'], field: 'CODE' },
        { signals: ['DES', 'DESIGN', 'JOSS'], field: 'DES' },
        { signals: ['CLASS',], field: 'CLASS' },
        { signals: ['NEMA NOM EFF', 'NEMA_NOM_EFF', 'NEMA NOMINAL EFFICIENCY', 'NEMA NOW EFF.', 'NEMA NOW EFF'], field: 'NEMA_NOM_EFF' },
        { signals: ['P F', 'P_F', 'POWER FACTOR'], field: 'P_F' },
        { signals: ['RATING'], field: 'RATING' },
        { signals: ['CC'], field: 'CC' },
        { signals: ['USABLE AT'], field: 'USABLE_AT' },
        // OPEL, PU, UZ, 
        // Remove these extra words, once the scanner starts working properly. these are just a stop gap to get some values extracted until the scanner is fixed.
        { signals: ['BEARINGS DE', 'BEARINGS_DE', 'DE'], field: 'BEARINGS_DE' },
        { signals: ['BEARINGS ODE', 'BEARINGS_ODE', 'ODE', 'OPEL'], field: 'BEARINGS_ODE' },
        { signals: ['ENCL', 'ENCLOSURE'], field: 'ENCL' },
        { signals: ['SERIAL NUMBER', 'SERIAL_NUMBER', 'SERIAL NO', 'S/N'], field: 'SERIAL_NUMBER' }
    ];
*/
    constructor() { }

    extractValues(description: string): Partial<ExtractedValues> {
        const extractedValues: any = {};
        const textUpper = description.toUpperCase();

        for (const [field, regex] of Object.entries(MOTOR_DICTIONARY)) {
            const match = textUpper.match(regex);
            
            if (match && match[1]) {
                extractedValues[field] = match[1].trim();
            } else {
                extractedValues[field] = undefined;
            }
        }

        return extractedValues;
    }

    /**
     * Keeps the full extracted span while removing whitespace from the outside.
     * @param rawValue The raw extracted text
     * @returns Trimmed value
     */
    private cleanExtractedValue(rawValue: string): string {
        return rawValue.trim();
    }
}
