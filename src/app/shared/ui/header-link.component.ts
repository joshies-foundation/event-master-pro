import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'joshies-header-link',
  imports: [RouterLink, NgClass],
  template: `
    <a
      [routerLink]="routerLink()"
      class="-ml-2 py-2 text-primary"
      [ngClass]="{
        '-ml-2 pr-2': chevronDirection() === 'left',
        '-mr-2 pl-2': chevronDirection() === 'right',
      }"
    >
      @if (chevronDirection() === 'left') {
        <i class="pi pi-chevron-left"></i>
      }

      {{ text() }}

      @if (chevronDirection() === 'right') {
        <i class="pi pi-chevron-right"></i>
      }
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderLinkComponent {
  text = input.required<string>();
  chevronDirection = input<'left' | 'right'>();
  routerLink = input.required<string | unknown[]>();
}
