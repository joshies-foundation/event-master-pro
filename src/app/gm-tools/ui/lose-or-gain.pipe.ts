import { inject, Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'loseOrGain',
  standalone: true,
})
export class LoseOrGainPipe implements PipeTransform {
  private readonly decimalPipe = inject(DecimalPipe);

  transform(n: number): string {
    return `${n < 0 ? 'lose' : 'gain'} ${this.decimalPipe.transform(Math.abs(n))}`;
  }
}
