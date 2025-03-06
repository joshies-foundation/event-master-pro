import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
} from '@angular/core';
import { EventModel } from '../util/supabase-types';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TournamentBracketComponent } from './tournament-bracket.component';
import { BetType, EventFormat } from '../../shared/util/supabase-helpers';
import { Button } from 'primeng/button';

@Component({
  selector: 'joshies-event-info',
  template: `
    <div class="flex flex-column gap-3">
      <div
        [routerLink]="readOnly() ? null : '/rules'"
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
        @if (!readOnly()) {
          <i class="pi pi-angle-right ml-2 text-300 align-self-center"></i>
        }
      </div>

      @if (
        showBracket() &&
        event().format === EventFormat.SingleEliminationTournament
      ) {
        <joshies-tournament-bracket [eventId]="event().id" />
      }
    </div>
    <p-button
      [label]="'Place Bet for ' + event().name"
      styleClass="w-full mt-3"
      routerLink="/betting/place-bet"
      [queryParams]="{ betType: BetType.MainEvent, eventId: event().id }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, RouterLink, TournamentBracketComponent, Button],
})
export class EventInfoComponent {
  EventFormat = EventFormat;

  event = input.required<EventModel>();
  readOnly = input(false, { transform: booleanAttribute });
  showBracket = input(false, { transform: booleanAttribute });
  protected readonly BetType = BetType;
}
