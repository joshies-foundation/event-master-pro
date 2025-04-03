import { Component, computed, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { OverUnderComponent } from '../over-under.component';
import {
  BetSubtype,
  EventFormat,
  RoundPhase,
} from '../../../shared/util/supabase-helpers';
import { TopBottomComponent } from '../top-bottom.component';
import { GameStateService } from '../../../shared/data-access/game-state.service';
import {
  EventService,
  EventTeamWithParticipantInfo,
} from '../../../shared/data-access/event.service';
import { EventModel } from '../../../shared/util/supabase-types';
import { getFormattedParticipantList } from '../../../shared/util/event-helpers';
import { outputFromObservable, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'joshies-event-bet',
  imports: [
    DropdownModule,
    FormsModule,
    RadioButtonModule,
    OverUnderComponent,
    TopBottomComponent,
  ],
  template: `
    <div class="flex flex-col gap-4">
      <!-- Event Dropdown -->
      <label class="flex flex-col gap-2">
        Event
        <p-dropdown
          [options]="openMainEvents()"
          [(ngModel)]="selectedMainEventId"
          optionLabel="name"
          optionValue="id"
          styleClass="w-full"
          emptyMessage="No open events"
          placeholder="Select an event"
        />
      </label>

      <!-- Subtype Radio Buttons -->
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center">
          <label class="ml-2">
            <p-radioButton
              name="eventBetSubtype"
              [value]="BetSubtype.TeamPosition"
              [(ngModel)]="selectedEventBetSubtype"
              styleClass="w-full"
            />
            Team Position
          </label>
        </div>
        @if (
          selectedMainEventSignal()?.format ===
          EventFormat.ScoreBasedSingleRound
        ) {
          <div class="flex items-center">
            <label class="ml-2">
              <p-radioButton
                name="eventBetSubtype"
                [value]="BetSubtype.Score"
                [(ngModel)]="selectedEventBetSubtype"
                styleClass="w-full"
              />
              Score
            </label>
          </div>
        }
      </div>

      @switch (selectedEventBetSubtype()) {
        @case (BetSubtype.TeamPosition) {
          <!-- Bet Team Dropdown -->
          <label class="flex flex-col gap-2">
            Team
            <p-dropdown
              [options]="eventTeams()"
              [(ngModel)]="selectedEventTeam"
              optionLabel="participantList"
              styleClass="flex"
              placeholder="Select a team"
            />
          </label>
          ...will finish in the...
          <joshies-top-bottom
            [max]="eventTeams().length - 1"
            [(selectedTopBottomOption)]="selectedTopBottomOption"
            [(selectedNumberOfTeams)]="selectedNumberOfTeams"
          />
          ...team(s).
        }
        @case (BetSubtype.Score) {
          <!-- Bet Team Dropdown -->
          <label class="flex flex-col gap-2">
            Team
            <p-dropdown
              [options]="eventTeams()"
              [(ngModel)]="selectedEventTeam"
              optionLabel="participantList"
              styleClass="flex"
              placeholder="Select a team"
            />
          </label>

          <joshies-over-under
            [(selectedOuOption)]="selectedOuOption"
            [(ouValue)]="ouValue"
          />
        }
      }
    </div>
  `,
})
export class EventBetComponent {
  private readonly eventService = inject(EventService);
  private readonly gameStateService = inject(GameStateService);

  readonly BetSubtype = BetSubtype;
  readonly EventFormat = EventFormat;

  readonly selectedMainEventId = model<EventModel['id'] | null>(null);
  readonly selectedEventBetSubtype = model<BetSubtype>(BetSubtype.TeamPosition);
  readonly selectedEventTeam = model<EventTeamWithParticipantInfo | null>(null);
  readonly selectedTopBottomOption = model<'TOP' | 'BOTTOM'>('TOP');
  readonly selectedNumberOfTeams = model<number>(1);
  readonly selectedOuOption = model<'OVER' | 'UNDER'>('OVER');
  readonly ouValue = model<number>(0.5);

  readonly openMainEvents = computed(() => {
    const round = this.gameStateService.roundNumber();
    const phase = this.gameStateService.roundPhase();
    return this.eventService.events()?.filter((event) => {
      if (!round || !phase) {
        return false;
      }
      if (
        // phase === RoundPhase.Event || // TODO: Determine whether players are allowed to bet on an event while we are in the `event` phase
        phase === RoundPhase.WaitingForNextRound
      ) {
        return event.round_number > round;
      }
      return event.round_number >= round;
    });
  });

  readonly selectedMainEventSignal = computed(
    () =>
      this.eventService
        .events()
        ?.find((event) => event.id === this.selectedMainEventId()) ?? null,
  );

  readonly eventTeams = computed(() => {
    const teams = this.eventService.eventTeamsWithParticipantInfo() ?? [];
    return teams
      .filter((team) => team.event_id === this.selectedMainEventSignal()?.id)
      .map((team) => {
        return {
          ...team,
          participantList: getFormattedParticipantList(team.participants),
        };
      });
  });

  readonly selectedMainEvent = outputFromObservable(
    toObservable(this.selectedMainEventSignal),
  );
}
