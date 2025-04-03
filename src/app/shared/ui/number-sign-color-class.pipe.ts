import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberSignColorClass',
  standalone: true,
})
export class NumberSignColorClassPipe implements PipeTransform {
  transform(n: number): string {
    return n > 0
      ? 'text-green '
      : n < 0
        ? 'text-red '
        : 'text-surface-500 dark:text-surface-300 ';
  }
}
