import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EventModel } from '../util/supabase-types';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'joshies-event-info',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <div
      routerLink="/rules"
      [fragment]="'event-rules-' + event().id"
      class="flex gap-3"
    >
      <img
        [ngSrc]="event().image_url || '/assets/icons/icon-96x96.png'"
        alt=""
        height="48"
        width="48"
        class="border-round"
      />

      <div class="flex-grow-1">
        <h4 class="mt-0 mb-1">{{ event().name }}</h4>
        <p class="m-0 text-500 text-sm">{{ event().description }}</p>
      </div>

      <i class="pi pi-angle-right ml-2 text-300 align-self-center"></i>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInfoComponent {
  event = input.required<EventModel>();
}
