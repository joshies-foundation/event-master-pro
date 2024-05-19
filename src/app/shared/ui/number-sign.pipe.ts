import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberSign',
  standalone: true,
})
export class NumberSignPipe implements PipeTransform {
  transform(n: number): string {
    // return blank for negative since there is always a '-' for negative numbers anyway
    return n > 0 ? '+' : '';
  }
}
