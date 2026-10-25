import { Component, computed, inject, input, signal } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { PlayerService } from '../../shared/data-access/player.service';
import { TableModule } from '@openng/optimus-ui/table';
import {
  GameboardSpaceEffect,
  trackByPlayerId,
} from '../../shared/util/supabase-helpers';
import { DecimalPipe, NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { ButtonModule } from '@openng/optimus-ui/button';
import { SkeletonModule } from '@openng/optimus-ui/skeleton';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import {
  removeRoundDraft,
  RoundDraft,
  RoundDraftKey,
} from '../data-access/round-draft';
import { GameboardSpaceComponent } from '../ui/gameboard-space.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
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
      <p class="mt-8 mb-4">
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
              <div class="-py-2 flex items-center gap-2">
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
                <p class="mt-1 text-sm text-neutral-500">
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
              @if (
                player.gameboardSpace!.effect ===
                GameboardSpaceEffect.ChancePoints
              ) {
                <p class="mt-1 text-sm text-neutral-500">
                  {{
                    (player.chancePointsAmount | loseOrGain | titlecase) +
                      ' points'
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
        (onClick)="submitPlayerSpaceChanges()"
        [loading]="submittingInProgress()"
      />
    } @else {
      <p-skeleton height="30rem" />
    }`,
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
  private readonly playerService = inject(PlayerService);
  private readonly gameboardService = inject(GameboardService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly draft =
    input.required<RoundDraft<GameboardSpaceEntryFormModel[string]>>();

  protected readonly trackByPlayerId = trackByPlayerId;

  private readonly players = computed(() => {
    const moves = this.draft().entries;
    return this.playerService
      .players()
      ?.filter((player) => player.player_id in moves)
      .map((player) => {
        const move = moves[player.player_id];
        return {
          ...player,
          distanceTraveled: move.distanceTraveled,
          gameboardSpace: this.gameboardService
            .gameboardSpaces()
            ?.find(
              (gameboardSpace) => gameboardSpace.id === move.gameboardSpaceId,
            ),
          decision: move.decision,
          chancePointsAmount: move.chancePointsAmount,
        };
      });
  });

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      roundNumber: this.draft().roundNumber,
      players: this.players(),
      gameboardSpaces: this.gameboardService.gameboardSpaces(),
    }),
  );

  readonly submittingInProgress = signal(false);

  submitPlayerSpaceChanges(): void {
    const { roundNumber, entries } = this.draft();
    confirmBackendAction({
      action: async () => {
        const response = await this.gameboardService.logRoundMoves(
          roundNumber,
          entries,
        );
        if (!response.error) {
          removeRoundDraft(RoundDraftKey.GameboardMoves);
        }
        return response;
      },
      confirmationMessageText: `Are you sure you want to submit moves for round ${roundNumber}?`,
      successMessageText: 'Moves submitted successfully!',
      successNavigation: '/',
      submittingSignal: this.submittingInProgress,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      router: this.router,
      activatedRoute: this.activatedRoute,
    });
  }

  protected readonly GameboardSpaceEffect = GameboardSpaceEffect;
}
