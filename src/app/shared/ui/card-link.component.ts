import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RippleModule } from 'primeng/ripple';

export interface CardLinkModel {
  iconClass: string;
  text: string;
  subtext?: string;
  pretext?: string;
  routerLink: string | unknown[];
}

@Component({
  selector: 'joshies-card-link',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, RippleModule],
  template: `
    <a
      class="flex w-full no-underline text-color transition-colors transition-duration-100 transition-ease-in-out"
      [routerLink]="model().routerLink"
    >
      <i
        class="h-2rem w-2rem flex-shrink-0 text-lg text-white mx-3 my-2 flex justify-content-center align-items-center align-self-center border-round-md"
        [ngClass]="model().iconClass"
      ></i>
      <div
        class="flex align-items-center w-full justify-content-between pl-0 p-2 border-100"
        [class.border-bottom-1]="!last()"
      >
        @if (model().subtext || model().pretext) {
          <div>
            @if (model().pretext) {
              <p class="m-0 text-400 text-sm">{{ model().pretext }}</p>
            }
            <p class="m-0">{{ model().text }}</p>
            @if (model().subtext) {
              <p class="m-0 text-400 text-sm">{{ model().subtext }}</p>
            }
          </div>
        } @else {
          {{ model().text }}
        }
        <i class="pi pi-angle-right text-300 ml-3"></i>
      </div>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardLinkComponent {
  model = input.required<CardLinkModel>();
  last = input(false, { transform: booleanAttribute });
}
