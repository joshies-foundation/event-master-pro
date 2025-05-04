import { NgClass } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
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
  imports: [RouterLink, NgClass, RippleModule],
  template: `
    <a
      class="flex w-full transition-colors duration-100 ease-in-out"
      [routerLink]="model().routerLink"
    >
      <i
        class="mx-4 my-2 flex! size-8 shrink-0 items-center justify-center self-center rounded-md text-lg text-white"
        [ngClass]="model().iconClass"
      ></i>
      <div
        class="flex w-full items-center justify-between border-standard-border-color p-2 pl-0"
        [class.border-b]="!last()"
      >
        @if (model().subtext || model().pretext) {
          <div>
            @if (model().pretext) {
              <p class="m-0 text-sm text-neutral-400">
                {{ model().pretext }}
              </p>
            }
            <p>{{ model().text }}</p>
            @if (model().subtext) {
              <p class="m-0 text-sm text-neutral-400">
                {{ model().subtext }}
              </p>
            }
          </div>
        } @else {
          {{ model().text }}
        }
        <i class="pi pi-angle-right ml-4 text-neutral-300"></i>
      </div>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardLinkComponent {
  model = input.required<CardLinkModel>();
  last = input(false, { transform: booleanAttribute });
}
