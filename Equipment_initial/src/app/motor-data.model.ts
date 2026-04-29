export interface motorData {
    id?: string;
    name: string;
    result: string;
    description: string;
    image?: string;
    savedAt?: string;
    CAT_NO: string | undefined;
    SPEC: string | undefined;
    HORSEPOWER: string | undefined;
    VOLTAGE: string | undefined;
    AMPERAGE: string | undefined;
    RPM: string | undefined;
    FRAME: string | undefined;
    HERTZ: string | undefined;
    PH: string | undefined;
    SER_F: string | undefined;
    CODE: string | undefined;
    DES: string | undefined;
    CLASS: string | undefined;
    NEMA_NOM_EFF: string | undefined;
    P_F: string | undefined;
    RATING: string | undefined;
    CC: string | undefined;
    USABLE_AT: string | undefined;
    BEARINGS_DE: string | undefined;
    BEARINGS_ODE: string | undefined;
    ENCL: string | undefined;
    SERIAL_NUMBER: string | undefined;
}

export interface uploadedFiles {
    name: string;
    type: string;
    size: number;
    content?: string | ArrayBuffer | null;
    fullFile: File;
}