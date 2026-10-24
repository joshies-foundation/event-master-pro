import { Component, computed, inject, Signal } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import NewDuelComponent from '../ui/new-duel.component';
import { DuelStatus } from '../../shared/util/supabase-helpers';
import { DuelModel } from '../../shared/util/supabase-types';
import { toSignal } from '@angular/core/rxjs-interop';
import { DuelService } from '../../shared/data-access/duel.service';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { DuelsTableComponent } from '../ui/duels-table.component';

@Component({
  selector: 'joshies-manage-duels-page',
  template: ` <joshies-page-header headerText="Manage Duels" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>
    <div class="mt-8">
      <p class="font-bold">Create a new duel</p>
      <joshies-new-duel />
      @if (roundNumber(); as roundNumber) {
        @if (duelsForThisTurn(); as duelsForThisTurn) {
          <p class="my-8 font-bold">
            Unresolved duels for turn {{ roundNumber }}
          </p>

          @if (duelsForThisTurn.length) {
            <joshies-duels-table
              [duels]="duelsForThisTurn"
              [cancelable]="true"
            />
          } @else {
            <p class="my-2 py-2 text-left text-neutral-500 italic">None</p>
          }
        }
        @if (duelsForNextTurn(); as duelsForNextTurn) {
          <p class="my-8 font-bold">
            Unresolved duels for turn {{ roundNumber + 1 }}
          </p>

          @if (duelsForNextTurn.length) {
            <joshies-duels-table [duels]="duelsForNextTurn" />
          } @else {
            <p class="my-2 py-2 text-left text-neutral-500 italic">
              None... yet!
            </p>
          }
        }
      }
    </div>`,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    NewDuelComponent,
    DuelsTableComponent,
  ],
})
export default class ManageDuelsPageComponent {
  private readonly duelService = inject(DuelService);
  private readonly gameStateService = inject(GameStateService);

  private readonly duels: Signal<DuelModel[] | undefined> = toSignal(
    this.duelService.duelsForThisTurn$,
  );

  readonly roundNumber = this.gameStateService.roundNumber;

  readonly duelsForThisTurn = computed(() => {
    const roundNumber = this.roundNumber();
    const duels = this.duels();
    if (!duels || !roundNumber) {
      return [];
    }
    return duels.filter(
      (duel) =>
        duel.round_number === roundNumber &&
        duel.status !== DuelStatus.Canceled &&
        duel.status !== DuelStatus.ChallengerWon &&
        duel.status !== DuelStatus.OpponentWon,
    );
  });

  readonly duelsForNextTurn = computed(() => {
    const roundNumber = this.roundNumber();
    const duels = this.duels();
    if (!duels || !roundNumber) {
      return [];
    }
    return duels.filter(
      (duel) =>
        duel.round_number === roundNumber + 1 &&
        duel.status !== DuelStatus.Canceled &&
        duel.status !== DuelStatus.ChallengerWon &&
        duel.status !== DuelStatus.OpponentWon,
    );
  });
}
