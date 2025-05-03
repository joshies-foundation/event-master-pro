import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { PlayerService } from '../../shared/data-access/player.service';
import { SessionService } from '../../shared/data-access/session.service';
import { TableModule } from 'primeng/table';
import {
  GameboardSpaceEffect,
  trackByPlayerId,
} from '../../shared/util/supabase-helpers';
import { DecimalPipe, NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import {
  getRecordFromLocalStorage,
  LocalStorageRecord,
  removeRecordFromLocalStorage,
} from '../../shared/util/local-storage-helpers';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { GameboardSpaceEntryFormModel } from './gameboard-space-entry-page.component';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { LoseOrGainPipe } from '../ui/lose-or-gain.pipe';

@Component({
  selector: 'joshies-review-gameboard-space-entry-page',
  template: ` <joshies-page-header headerText="Review Moves" alwaysSmall>
      <joshies-header-link
        text="Space Entry"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>
    @if (viewModel(); as vm) {
      <p class="mb-4 mt-8">
        Gameboard moves for turn {{ vm.roundNumber }}
        <span class="text-neutral-500 italic">(Draft)</span>
      </p>
      <!-- Fixed layout allows indivdual scrolling of cells instead of whole table -->
      <p-table
        [value]="vm.players!"
        [defaultSortOrder]="-1"
        sortField="score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
      >
        <ng-template #header>
          <tr>
            <th>Player</th>
            <th class="text-right">Distance</th>
            <th class="text-center">Space</th>
          </tr>
        </ng-template>
        <ng-template
          #body
          [joshiesStronglyTypedTableRow]="vm.players!"
          let-player
        >
          <tr>
            <!-- Player -->
            <td>
              <div class="flex items-center gap-2 -py-2">
                <img
                  [ngSrc]="player.avatar_url"
                  alt=""
                  width="32"
                  height="32"
                  class="size-8 rounded-full bg-neutral-100"
                />
                {{ player.display_name }}
              </div>
            </td>
            <!-- Distance Travelled -->
            <td class="text-right font-semibold">
              {{ player.distanceTraveled | number }}
            </td>
            <!-- Selected Space -->
            <td class="text-center">
              <joshies-gameboard-space
                [model]="player.gameboardSpace!"
                class="mx-auto"
              />
              @if (
                player.gameboardSpace!.effect ===
                GameboardSpaceEffect.GainPointsOrDoActivity
              ) {
                <p class="text-sm text-neutral-500 mt-1">
                  {{
                    player.decision === 'points'
                      ? ($any(player.gameboardSpace!.effect_data)
                          ?.pointsGained ?? 0
                          | loseOrGain
                          | titlecase) + ' points'
                      : ($any(player.gameboardSpace!.effect_data)
                          ?.alternativeActivity ?? 'Do activity')
                  }}
                </p>
              }
            </td>
          </tr>
        </ng-template>
      </p-table>
      <p-button
        [label]="'Submit Moves for Round ' + vm.roundNumber"
        severity="success"
        styleClass="mt-6 w-full"
        (onClick)="submitPlayerSpaceChanges(roundNumber()!, playerSpaceChanges)"
        [loading]="submittingInProgress()"
      />
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
    DecimalPipe,
    LoseOrGainPipe,
    TitleCasePipe,
  ],
})
export default class ReviewGameboardSpaceEntryPageComponent {
  private readonly router = inject(Router);
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);
  private readonly sessionService = inject(SessionService);
  private readonly gameboardService = inject(GameboardService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly roundNumber: Signal<number | null | undefined> =
    this.gameStateService.roundNumber;

  readonly playerSpaceChanges: GameboardSpaceEntryFormModel =
    getRecordFromLocalStorage(LocalStorageRecord.GameboardSpaceEntryFormValue);

  protected readonly trackByPlayerId = trackByPlayerId;

  private readonly players = computed(() =>
    this.playerService.players()?.map((player) => ({
      ...player,
      distanceTraveled:
        this.playerSpaceChanges[player.player_id].distanceTraveled,
      gameboardSpace: this.gameboardService
        .gameboardSpaces()
        ?.find(
          (gameboardSpace) =>
            gameboardSpace.id ===
            this.playerSpaceChanges[player.player_id].gameboardSpaceId,
        ),
      decision: this.playerSpaceChanges[player.player_id].decision,
    })),
  );

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      roundNumber: this.roundNumber(),
      players: this.players(),
      gameboardSpaces: this.gameboardService.gameboardSpaces(),
      playerSpaceChanges: this.playerSpaceChanges,
    }),
  );

  readonly submittingInProgress = signal(false);

  async submitPlayerSpaceChanges(
    roundNumber: number,
    playerSpaceChanges: GameboardSpaceEntryFormModel,
  ): Promise<void> {
    confirmBackendAction({
      action: async () =>
        this.gameboardService.logRoundMoves(roundNumber, playerSpaceChanges),
      confirmationMessageText: `Are you sure you want to submit moves for round ${roundNumber}?`,
      successMessageText: 'Moves submitted successfully!',
      successNavigation: '/',
      submittingSignal: this.submittingInProgress,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      router: this.router,
      activatedRoute: this.activatedRoute,
    });

    removeRecordFromLocalStorage(
      LocalStorageRecord.GameboardSpaceEntryFormValue,
    );
  }

  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;
}
