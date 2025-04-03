import { Component, computed, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { OverUnderComponent } from '../over-under.component';
import { SpecialSpaceEventModel } from '../../../shared/util/supabase-types';
import { GameboardService } from '../../../shared/data-access/gameboard.service';
import {
  outputFromObservable,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { SpaceEventStatus } from '../../../shared/util/supabase-helpers';

@Component({
  selector: 'joshies-ss-event-bet',
  imports: [DropdownModule, FormsModule, OverUnderComponent],
  template: `
    <div class="flex flex-col gap-4">
      <label class="flex flex-col gap-2">
        Special Space Event
        <p-dropdown
          [options]="openSsEvents()"
          [(ngModel)]="selectedSsEventId"
          optionLabel="ssEventName"
          optionValue="ssEvent.id"
          styleClass="w-full"
          emptyMessage="No open special space events"
          placeholder="Select a special space event"
        />
      </label>

      <joshies-over-under
        [(ouValue)]="ouValue"
        [(selectedOuOption)]="selectedOuOption"
      />
    </div>
  `,
})
export class SSEventBetComponent {
  private readonly gameboardService = inject(GameboardService);

  readonly selectedSsEventId = model<SpecialSpaceEventModel['id'] | null>(null);
  readonly ouValue = model<number>(0.5);
  readonly selectedOuOption = model<'OVER' | 'UNDER'>('OVER');

  readonly selectedSsEventSignal = computed(() => {
    const ssEvent =
      this.openSsEvents()?.find(
        (ssEvent) => ssEvent.ssEvent.id === this.selectedSsEventId(),
      ) ?? null;
    console.log('computed event: ' + JSON.stringify(ssEvent));
    return ssEvent;
  });

  readonly selectedSsEvent = outputFromObservable(
    toObservable(this.selectedSsEventSignal),
  );

  private readonly ssEvents = toSignal(
    this.gameboardService.specialSpaceEventsForThisTurn$,
  );

  readonly openSsEvents = computed(() => {
    return this.ssEvents()
      ?.filter((event) => event.status === SpaceEventStatus.WaitingToBegin)
      .map((event) => {
        return {
          ssEventName:
            event.player?.display_name +
            "'s " +
            event.template?.name +
            ' Event',
          ssEvent: event,
        };
      });
  });
}
