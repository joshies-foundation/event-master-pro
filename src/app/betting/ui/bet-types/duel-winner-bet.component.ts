import { Component, computed, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DuelService } from '../../../shared/data-access/duel.service';
import { DuelStatus } from '../../../shared/util/supabase-helpers';
import { DuelModel } from '../../../shared/util/supabase-types';
import { PlayerWithUserAndRankInfo } from '../../../shared/data-access/player.service';
import { outputFromObservable, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'joshies-duel-winner',
  imports: [Select, FormsModule],
  template: `
    <div class="flex flex-col gap-4">
      <label class="flex flex-col gap-2">
        Duel
        <p-select
          [options]="openDuels()"
          [(ngModel)]="selectedDuelId"
          optionLabel="duelName"
          optionValue="id"
          styleClass="w-full"
          emptyMessage="No open duels"
          placeholder="Select a duel"
        />
      </label>

      <!-- Duel Winner Dropdown -->
      <label class="flex flex-col gap-2">
        Winner
        <p-select
          [options]="competitors()"
          [(ngModel)]="selectedWinner"
          optionLabel="display_name"
          styleClass="w-full"
          placeholder="Select a winner"
        />
      </label>
    </div>
  `,
})
export class DuelWinnerBetComponent {
  private readonly duelService = inject(DuelService);

  readonly selectedDuelId = model<DuelModel['id'] | null>();
  readonly selectedWinner = model<PlayerWithUserAndRankInfo | null>();

  readonly selectedDuelSignal = computed(
    () =>
      this.duelService
        .duelsForThisTurn()
        ?.find((duel) => duel.id === this.selectedDuelId()) ?? null,
  );
  readonly selectedDuel = outputFromObservable(
    toObservable(this.selectedDuelSignal),
  );

  readonly openDuels = computed(() => {
    let duels = this.duelService.duelsForThisTurn();
    duels = duels?.filter((duel) => duel.status === DuelStatus.WaitingToBegin);
    if (!duels || duels.length < 1) {
      return [];
    }
    return duels.map((duel) => {
      return {
        duelName:
          duel.game_name +
          ': ' +
          (duel.challenger?.display_name ?? 'challenger') +
          ' vs. ' +
          (duel.opponent?.display_name ?? 'opponent'),
        id: duel.id,
        challenger: duel.challenger,
        opponent: duel.opponent,
        game_name: duel.game_name,
      };
    });
  });

  readonly competitors = computed(() => {
    const selectedDuel = this.selectedDuelSignal();
    if (!selectedDuel || !selectedDuel.challenger || !selectedDuel.opponent) {
      return [];
    }
    return [selectedDuel.challenger, selectedDuel.opponent];
  });
}
