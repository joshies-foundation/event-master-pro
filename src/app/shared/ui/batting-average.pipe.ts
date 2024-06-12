import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'battingAverage',
  standalone: true,
})
export class BattingAvgPipe extends DecimalPipe implements PipeTransform {
  override transform<
    T extends number | string | null | undefined,
    R = T extends number | string ? string | null : null,
  >(value: T, digitsInfo: string = '1.3-3', locale?: string): R {
    const str = super.transform(value, digitsInfo, locale);
    return (str?.replace(/^0+([^\d])/, '$1') ?? null) as R;
  }
}
