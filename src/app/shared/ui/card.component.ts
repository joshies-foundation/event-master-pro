import { NgClass } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CardLinkComponent, CardLinkModel } from './card-link.component';

@Component({
  selector: 'joshies-card',
  imports: [NgClass, CardLinkComponent],
  template: `
    @if (headerText()) {
      @if (readOnly()) {
        <h2 class="mb-2 font-bold">
          @if (headerIconClass()) {
            <i [ngClass]="headerIconClass()"></i>
          }
          {{ headerText() }}
        </h2>
      } @else {
        <h3 class="mt-6 mb-2 text-lg font-bold">
          @if (headerIconClass()) {
            <i [ngClass]="headerIconClass()"></i>
          }
          {{ headerText() }}
        </h3>
      }
    }

    <div
      class="rounded-xl bg-neutral-0"
      [class.padded]="padded()"
      [ngClass]="styleClass()"
    >
      @for (link of links(); track $index; let last = $last) {
        <joshies-card-link [model]="link" [last]="last" />
      } @empty {
        <ng-content />
      }
    </div>
  `,
  styles: `
    .padded {
      padding: 0.85rem 1rem;
    }
  `,
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  headerText = input<string>();
  headerIconClass = input<string>();
  padded = input(false, { transform: booleanAttribute });
  links = input<CardLinkModel[]>();
  styleClass = input<string>();
  readOnly = input(false, { transform: booleanAttribute });
}
