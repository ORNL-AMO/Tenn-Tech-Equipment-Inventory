import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'normalizeText'
})
export class NormalizeTextPipe implements PipeTransform {
  transform(value: string): string {
    let normalized = '';

    normalized = value.replace(/\s+/g, ' ').replace(/R\.?P\.?/gi, 'RPM').replace(/VOLTS\s+/gi, 'VOLTS ').replace(/AMPS\s+/gi, 'AMPS ').replace(/[^\x20-\x7E]/g, '').trim();

    return normalized;
  }
}
