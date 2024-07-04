import { inject, Pipe, PipeTransform } from '@angular/core';
import { TitleCasePipe } from '@angular/common';

@Pipe({
  name: 'snakeCaseToTitleCase',
  standalone: true,
})
export class SnakeCaseToTitleCasePipe implements PipeTransform {
  private readonly titleCasePipe = inject(TitleCasePipe);

  transform(value: string): string {
    return this.titleCasePipe.transform(value.replace(/_/g, ' '));
  }
}
