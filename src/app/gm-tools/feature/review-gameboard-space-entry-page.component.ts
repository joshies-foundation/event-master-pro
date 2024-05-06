import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  inject,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { PlayerService } from '../../shared/data-access/player.service';
import { SessionService } from '../../shared/data-access/session.service';
import { TableModule } from 'primeng/table';
import { trackByPlayerId } from '../../shared/util/supabase-helpers';
import { NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import {
  LocalStorageRecord,
  getRecordFromLocalStorage,
} from '../../shared/util/local-storage-helpers';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';

@Component({
  selector: 'joshies-review-gameboard-space-entry-page',
  standalone: true,
  template: ` <joshies-page-header headerText="Review Spaces" alwaysSmall>
      <joshies-header-link
        text="Space Entry"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>
    @if (viewModel(); as vm) {
      <h4 class="mt-6">
        Selected spaces for round {{ vm.roundNumber }} of
        {{ vm.numRounds }}
      </h4>
      <!-- Fixed layout allows indivdual scrolling of cells instead of whole table -->
      <p-table
        [value]="vm.players!"
        [defaultSortOrder]="-1"
        sortField="score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Player</th>
            <th class="text-center">Space</th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="vm.players!"
          let-player
        >
          <tr>
            <!-- Player -->
            <td>
              <div class="flex align-items-center gap-2 -py-2">
                <img
                  [ngSrc]="player.avatar_url"
                  alt=""
                  width="32"
                  height="32"
                  class="border-circle surface-100"
                />
                {{ player.display_name }}
              </div>
            </td>
            <!-- Selected Space -->
            <td>
              <div class="flex justify-content-center">
                <joshies-gameboard-space
                  [model]="player.new_space!"
                  class="relative"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    } @else {
      <p-skeleton height="30rem" />
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    TableModule,
    NgOptimizedImage,
    ButtonModule,
    SkeletonModule,
    StronglyTypedTableRowDirective,
    GameboardSpaceComponent,
  ],
})
export default class ReviewGameboardSpaceEntryPageComponent {
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);
  private readonly sessionService = inject(SessionService);

  private readonly roundNumber: Signal<number | null | undefined> =
    this.gameStateService.roundNumber;

  private readonly playerSpaceChanges: Record<string, number> =
    getRecordFromLocalStorage(LocalStorageRecord.GameboardSpaceEntryFormValue);

  protected readonly trackByPlayerId = trackByPlayerId;

  private readonly players = computed(() =>
    this.playerService.players()?.map((player) => ({
      ...player,
      new_space: this.sessionService
        .gameboardSpaces()
        ?.find(
          (gameboardSpace) =>
            gameboardSpace.id === this.playerSpaceChanges[player.player_id],
        ),
    })),
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      roundNumber: this.roundNumber(),
      numRounds: this.sessionService.session()?.num_rounds,
      players: this.players(),
      gameboardSpaces: this.sessionService.gameboardSpaces(),
    }),
  );
}
