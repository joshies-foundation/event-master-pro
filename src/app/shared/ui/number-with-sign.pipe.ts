import { inject, Pipe, PipeTransform } from '@angular/core';
import { NumberSignPipe } from './number-sign.pipe';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'numberWithSign',
  standalone: true,
})
export class NumberWithSignPipe implements PipeTransform {
  private readonly numberSignPipe = inject(NumberSignPipe);
  private readonly decimalPipe = inject(DecimalPipe);

  transform(n: number): string {
    return this.numberSignPipe.transform(n) + this.decimalPipe.transform(n);
  }
}
