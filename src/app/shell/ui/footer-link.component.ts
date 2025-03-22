import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { BadgeModule } from 'primeng/badge';

export interface FooterLinkModel {
  href: string;
  text: string;
  badgeValue?: number;
  iconClass: string;
  iconClassFill: string;
}

@Component({
  selector: 'joshies-footer-link',
  imports: [RouterLink, NgClass, RouterLinkActive, BadgeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      class="flex flex-column justify-content-center align-items-center gap-1 no-underline text-600"
      [routerLink]="model().href"
      routerLinkActive="text-primary-500"
      #rla="routerLinkActive"
    >
      @if (model().badgeValue; as badgeValue) {
        <i
          pBadge
          [value]="badgeValue"
          severity="danger"
          badgeStyleClass="h-1rem w-1rem min-w-0 line-height-2"
          [ngClass]="rla.isActive ? model().iconClassFill : model().iconClass"
        ></i>
      } @else {
        <i
          [ngClass]="rla.isActive ? model().iconClassFill : model().iconClass"
        ></i>
      }
      <span class="text-xs">{{ model().text }}</span>
    </a>
  `,
})
export class FooterLinkComponent {
  model = input.required<FooterLinkModel>();
}
