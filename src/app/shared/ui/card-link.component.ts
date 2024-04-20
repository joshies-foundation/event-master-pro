import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

export interface CardLinkModel {
  iconClass: string;
  text: string;
  routerLink: string | unknown[];
}

@Component({
  selector: 'joshies-card-link',
  standalone: true,
  imports: [RouterLink, NgClass],
  template: `
    <a
      class="flex w-full no-underline text-color"
      [routerLink]="model().routerLink"
    >
      <i
        class="text-white mx-3 my-2 p-1 border-round-sm align-self-center"
        [ngClass]="model().iconClass"
      ></i>
      <div
        class="flex align-items-center w-full justify-content-between pl-0 p-2 border-100"
        [class.border-bottom-1]="!last()"
      >
        {{ model().text }}
        <i class="pi pi-angle-right text-300"></i>
      </div>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardLinkComponent {
  model = input.required<CardLinkModel>();
  last = input(false, { transform: booleanAttribute });
}
