import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberSignColorClass',
  standalone: true,
})
export class NumberSignColorClassPipe implements PipeTransform {
  transform(n: number): string {
    return n > 0
      ? 'text-success-foreground '
      : n < 0
        ? 'text-danger-foreground '
        : 'text-neutral-500 ';
  }
}
