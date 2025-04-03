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
      class="flex w-full no-underline text-color transition-colors duration-100 ease-in-out"
      [routerLink]="model().routerLink"
    >
      <i
        class="h-8 w-8 shrink-0 text-lg text-white mx-4 my-2 flex justify-center items-center self-center rounded-md"
        [ngClass]="model().iconClass"
      ></i>
      <div
        class="flex items-center w-full justify-between pl-0 p-2 border-surface"
        [class.border-bottom-1]="!last()"
      >
        @if (model().subtext || model().pretext) {
          <div>
            @if (model().pretext) {
              <p class="m-0 text-surface-400 dark:text-surface-400 text-sm">
                {{ model().pretext }}
              </p>
            }
            <p class="m-0">{{ model().text }}</p>
            @if (model().subtext) {
              <p class="m-0 text-surface-400 dark:text-surface-400 text-sm">
                {{ model().subtext }}
              </p>
            }
          </div>
        } @else {
          {{ model().text }}
        }
        <i
          class="pi pi-angle-right text-surface-300 dark:text-surface-500 ml-4"
        ></i>
      </div>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardLinkComponent {
  model = input.required<CardLinkModel>();
  last = input(false, { transform: booleanAttribute });
}
