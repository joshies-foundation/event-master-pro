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
        class="size-8 shrink-0 text-lg text-white mx-4 my-2 flex! justify-center items-center self-center rounded-md"
        [ngClass]="model().iconClass"
      ></i>
      <div
        class="flex items-center w-full justify-between pl-0 p-2 border-standard-border-color"
        [class.border-b]="!last()"
      >
        @if (model().subtext || model().pretext) {
          <div>
            @if (model().pretext) {
              <p class="m-0 text-neutral-400 text-sm">
                {{ model().pretext }}
              </p>
            }
            <p>{{ model().text }}</p>
            @if (model().subtext) {
              <p class="m-0 text-neutral-400 text-sm">
                {{ model().subtext }}
              </p>
            }
          </div>
        } @else {
          {{ model().text }}
        }
        <i class="pi pi-angle-right text-neutral-300 ml-4"></i>
      </div>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardLinkComponent {
  model = input.required<CardLinkModel>();
  last = input(false, { transform: booleanAttribute });
}
