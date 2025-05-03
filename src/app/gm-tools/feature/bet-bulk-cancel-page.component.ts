import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BetStatus, trackByPlayerId } from '../../shared/util/supabase-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { BetService } from '../../shared/data-access/bet.service';
import { PlayerModel, UserModel } from '../../shared/util/supabase-types';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'joshies-bet-bulk-cancel-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    TableModule,
    SkeletonModule,
    NgOptimizedImage,
    ButtonModule,
    StronglyTypedTableRowDirective,
  ],
  template: `
    <joshies-page-header headerText="Bulk Cancel Bets" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <p class="mb-4 mt-8">
      Cancel all bets where the given user is the requester. Can choose to
      cancel just pending bets or all bets that are pending (P) or open (O).
    </p>

    @if (displayPlayers(); as players) {
      <p-table
        [value]="players"
        sortField="display_name"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pFrozenColumn>Player</th>
            <th class="text-right">P</th>
            <th class="text-right">O</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="players"
          let-displayPlayer
        >
          <tr>
            <!-- Player -->
            <td pFrozenColumn>
              <div class="flex items-center gap-2 -py-2">
                <img
                  [ngSrc]="displayPlayer.player.avatar_url"
                  alt=""
                  width="32"
                  height="32"
                  class="size-8 rounded-full bg-neutral-100"
                />
                {{ displayPlayer.player.display_name }}
              </div>
            </td>
            <!-- Score -->
            <td class="text-right">
              {{ displayPlayer.numPending }}
            </td>
            <td class="text-right">
              {{ displayPlayer.numActive }}
            </td>
            <!-- Edit Score Button -->
            <td>
              <div
                class="text-right flex gap-2 flex-col md:flex-row justify-end"
              >
                <p-button
                  label="Cancel Pend."
                  icon="pi pi-times"
                  styleClass="w-full"
                  [loading]="submitting()"
                  (onClick)="
                    confirmCancelPending(
                      displayPlayer.player.player_id,
                      displayPlayer.player.display_name
                    )
                  "
                />
                <p-button
                  label="Cancel All"
                  severity="danger"
                  icon="pi pi-trash"
                  styleClass="w-full"
                  [loading]="submitting()"
                  (onClick)="
                    confirmCancelAll(
                      displayPlayer.player.player_id,
                      displayPlayer.player.display_name
                    )
                  "
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    } @else {
      <p-skeleton height="30rem" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BetBulkCancelPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly betService = inject(BetService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly submitting = signal<boolean>(false);

  protected readonly trackByPlayerId = trackByPlayerId;

  private readonly allBetsForThisSession = toSignal(
    this.betService.allBetsForThisSession$,
  );

  readonly players = this.playerService.players;
  readonly displayPlayers = computed(() => {
    return this.playerService.players()?.map((player) => {
      return {
        player: player,
        numPending:
          this.allBetsForThisSession()?.filter(
            (bet) =>
              bet.requester_player_id === player.player_id &&
              bet.status === BetStatus.PendingAcceptance,
          )?.length ?? 0,
        numActive:
          this.allBetsForThisSession()?.filter(
            (bet) =>
              bet.requester_player_id === player.player_id &&
              bet.status === BetStatus.Active,
          )?.length ?? 0,
      };
    });
  });

  confirmCancelPending(
    playerId: PlayerModel['id'],
    display_name: UserModel['display_name'],
  ) {
    confirmBackendAction({
      action: async () => this.betService.bulkCancelBets(playerId, false),
      confirmationMessageText:
        'Are you sure you want to cancel all pending bets for ' + display_name,
      successMessageText: 'Bets canceled',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }

  confirmCancelAll(
    playerId: PlayerModel['id'],
    display_name: UserModel['display_name'],
  ) {
    confirmBackendAction({
      action: async () => this.betService.bulkCancelBets(playerId, true),
      confirmationMessageText:
        'Are you sure you want to cancel ALL bets for ' + display_name,
      successMessageText: 'Bets canceled',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: null,
    });
  }
}
