import { inject, Pipe, PipeTransform } from '@angular/core';
import { NumberWithSignPipe } from './number-with-sign.pipe';
import { NumberSignColorClassPipe } from './number-sign-color-class.pipe';

@Pipe({
  name: 'numberWithSignAndColor',
  standalone: true,
})
export class NumberWithSignAndColorPipe implements PipeTransform {
  private readonly numberSignColorClassPipe = inject(NumberSignColorClassPipe);
  private readonly numberWithSignPipe = inject(NumberWithSignPipe);

  transform(n: number): string {
    return `
      <span class="${this.numberSignColorClassPipe.transform(n)} font-semibold">
        ${this.numberWithSignPipe.transform(n)}
      </span>
    `;
  }
}
