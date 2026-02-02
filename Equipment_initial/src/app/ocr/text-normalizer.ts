export function normalizeText(text: string): string {
    console.log("Normalizeing Text");
    return text.replace(/\s+/g, ' ').replace(/R\.?P\.?/gi, 'RPM').replace(/VOLTS\s+/gi, 'VOLTS ').replace(/AMPS\s+/gi, 'AMPS ').replace(/[^\x20-\x7E]/g, '').trim();
}