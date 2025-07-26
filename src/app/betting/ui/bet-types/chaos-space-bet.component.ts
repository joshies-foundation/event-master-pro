import { Component, computed, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import {
  BetSubtype,
  SpaceEventStatus,
} from '../../../shared/util/supabase-helpers';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  outputFromObservable,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { GameboardService } from '../../../shared/data-access/gameboard.service';
import {
  ChaosSpaceEventModel,
  ChaosSpaceEventType,
} from '../../../shared/util/supabase-types';
import { OverUnderComponent } from '../over-under.component';
import {
  PlayerService,
  PlayerWithUserAndRankInfo,
} from '../../../shared/data-access/player.service';

@Component({
  selector: 'joshies-chaos-space-bet',
  imports: [Select, FormsModule, RadioButtonModule, OverUnderComponent],
  template: `
    <div class="flex flex-col gap-4">
      <label class="flex flex-col gap-2">
        Chaos Space Event
        <p-select
          [options]="openChaosEvents()"
          [(ngModel)]="selectedChaosEventId"
          optionLabel="template.name"
          optionValue="id"
          class="w-full"
          emptyMessage="No open chaos space events"
          placeholder="Select a chaos space event"
        />
      </label>
      <div class="flex flex-wrap gap-4 px-2">
        <label class="flex items-center gap-2">
          <p-radio-button
            name="chaosBetSubtype"
            [value]="BetSubtype.NumberOfLosers"
            [(ngModel)]="selectedChaosBetSubtype"
            class="w-full"
          />
          Number of Losers
        </label>
        <label class="flex items-center gap-2">
          <p-radio-button
            name="chaosBetSubtype"
            [value]="BetSubtype.PlayerLoses"
            [(ngModel)]="selectedChaosBetSubtype"
            class="w-full"
          />
          Selected Player's Result
        </label>
      </div>
      @switch (selectedChaosBetSubtype()) {
        @case (BetSubtype.NumberOfLosers) {
          <joshies-over-under
            [(ouValue)]="ouValue"
            [(selectedOuOption)]="selectedOuOption"
          />
        }
        @case (BetSubtype.PlayerLoses) {
          <!-- Bet Player Dropdown -->
          <label class="flex flex-col gap-2">
            Player
            <p-select
              [options]="playerService.players() ?? []"
              [(ngModel)]="selectedChaosPlayer"
              optionLabel="display_name"
              class="flex"
              placeholder="Select a player"
            />
          </label>

          <!-- Wins/Loses Radio Buttons -->
          <div class="flex flex-wrap gap-4 px-2">
            <label class="flex items-center gap-2">
              <p-radio-button
                name="winsLoses"
                value="WINS"
                [(ngModel)]="selectedWinsLoses"
                class="w-full"
              />
              Wins
            </label>
            <label class="flex items-center gap-2">
              <p-radio-button
                name="winsLoses"
                value="LOSES"
                [(ngModel)]="selectedWinsLoses"
                class="w-full"
              />
              Loses
            </label>
          </div>
        }
      }
    </div>
  `,
})
export class ChaosSpaceBetComponent {
  private readonly gameboardService = inject(GameboardService);
  readonly playerService = inject(PlayerService);
  readonly BetSubtype = BetSubtype;

  readonly selectedChaosEventId = model<ChaosSpaceEventModel['id'] | null>(
    null,
  );
  readonly selectedChaosBetSubtype = model<BetSubtype>(
    BetSubtype.NumberOfLosers,
  );
  readonly ouValue = model<number>(0.5);
  readonly selectedOuOption = model<'OVER' | 'UNDER'>('OVER');
  readonly selectedChaosPlayer = model<PlayerWithUserAndRankInfo | null>(null);
  readonly selectedWinsLoses = model<'WINS' | 'LOSES'>('LOSES');

  private readonly chaosEvents = toSignal(
    this.gameboardService.chaosSpaceEventsForThisTurn$,
  );

  readonly openChaosEvents = computed(() => {
    return this.chaosEvents()?.filter(
      (event) =>
        event.status === SpaceEventStatus.WaitingToBegin &&
        event.template?.type ===
          ChaosSpaceEventType.EveryoneLosesPercentageOfTheirPointsBasedOnTaskFailure,
    );
  });

  readonly selectedChaosEventSignal = computed(
    () =>
      this.openChaosEvents()?.find(
        (chaosEvent) => chaosEvent.id === this.selectedChaosEventId(),
      ) ?? null,
  );

  readonly selectedChaosEvent = outputFromObservable(
    toObservable(this.selectedChaosEventSignal),
  );
}
