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
      class="flex flex-col items-center justify-center gap-1 leading-none text-neutral-600"
      [routerLink]="model().href"
      routerLinkActive="text-primary-500!"
      #rla="routerLinkActive"
    >
      @if (model().badgeValue; as badgeValue) {
        <i
          pBadge
          [value]="badgeValue"
          severity="danger"
          badgeStyleClass="h-4 w-4 min-w-0 leading-tight font-sans"
          [ngClass]="rla.isActive ? model().iconClassFill : model().iconClass"
        ></i>
      } @else {
        <i
          [ngClass]="rla.isActive ? model().iconClassFill : model().iconClass"
        ></i>
      }
      <span class="text-xs leading-tight">{{ model().text }}</span>
    </a>
  `,
})
export class FooterLinkComponent {
  model = input.required<FooterLinkModel>();
}
