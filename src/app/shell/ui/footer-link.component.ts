import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { BadgeModule } from '@openng/optimus-ui/badge';
import { OverlayBadge } from '@openng/optimus-ui/overlaybadge';

export interface FooterLinkModel {
  href: string;
  text: string;
  badgeValue?: number;
  iconClass: string;
  iconClassFill: string;
}

@Component({
  selector: 'joshies-footer-link',
  imports: [RouterLink, NgClass, RouterLinkActive, BadgeModule, OverlayBadge],
  template: `
    <a
      class="flex flex-col items-center justify-center gap-1 leading-none text-neutral-600"
      [routerLink]="model().href"
      routerLinkActive="text-primary-500!"
      #rla="routerLinkActive"
    >
      @if (model().badgeValue; as badgeValue) {
        <p-overlay-badge [value]="badgeValue" severity="danger">
          <i
            [ngClass]="rla.isActive ? model().iconClassFill : model().iconClass"
          ></i>
        </p-overlay-badge>
      } @else {
        <i
          [ngClass]="rla.isActive ? model().iconClassFill : model().iconClass"
        ></i>
      }
      <span class="text-xs leading-tight">{{ model().text }}</span>
    </a>
  `,
  styles: `
    :host ::ng-deep p-badge {
      height: 1rem;
      width: 1rem;
      min-width: 0;
      line-height: var(--leading-tight);
    }
  `,
})
export class FooterLinkComponent {
  model = input.required<FooterLinkModel>();
}
