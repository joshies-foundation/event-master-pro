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
import { NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import {
  BetStatus,
  showMessageOnError,
} from '../../shared/util/supabase-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { BetService } from '../../shared/data-access/bet.service';
import { MessageService } from 'primeng/api';
import { BetModel } from '../../shared/util/supabase-types';

@Component({
  selector: 'joshies-resolve-bets-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    TableModule,
    NgOptimizedImage,
    ButtonModule,
    RouterLink,
    StronglyTypedTableRowDirective,
  ],
  template: `
    <joshies-page-header headerText="Resolve Bets" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (displayBets(); as bets) {
      <p-table
        [value]="bets"
        [defaultSortOrder]="-1"
        sortField="score"
        [sortOrder]="-1"
        [scrollable]="true"
      >
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 60%;"></th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="bets"
          let-bet
        >
          <tr>
            <!-- Bet Terms -->
            <td>
              <div class="flex flex-column gap-2 -py-2">
                <div>
                  {{ bet.requesterName }} wagers:
                  {{ bet.requesterWager }}
                </div>
                <div>
                  {{ bet.opponentName }} wagers:
                  {{ bet.opponentWager }}
                </div>
                <div>{{ bet.description }}</div>
              </div>
            </td>
            <!-- Status Buttons -->
            <td>
              <div
                class="text-right flex gap-2 flex-column md:flex-row justify-content-end"
              >
                <p-button
                  [label]="bet.requesterName + ' Wins'"
                  severity="success"
                  icon="pi pi-check"
                  styleClass="w-full"
                  (onClick)="submitRequesterWins(bet.id)"
                  [hidden]="bet.status === betStatus.PendingAcceptance"
                  [loading]="submitting()"
                />
                <p-button
                  [label]="bet.opponentName + ' Wins'"
                  severity="success"
                  icon="pi pi-check"
                  styleClass="w-full"
                  (onClick)="submitOpponentWins(bet.id)"
                  [hidden]="bet.status === betStatus.PendingAcceptance"
                  [loading]="submitting()"
                />
                <p-button
                  label="Push"
                  icon="pi pi-equals"
                  styleClass="w-full"
                  (onClick)="pushBet(bet.id)"
                  [hidden]="bet.status === betStatus.PendingAcceptance"
                  [loading]="submitting()"
                />
                <p-button
                  label="Cancel Bet"
                  severity="danger"
                  icon="pi pi-times"
                  styleClass="w-full"
                  (onClick)="cancelBet(bet.id)"
                  [loading]="submitting()"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResolveBetsPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly betService = inject(BetService);
  private readonly messageService = inject(MessageService);

  readonly betStatus = BetStatus;
  readonly userPlayer = this.playerService.userPlayer;
  readonly bets = this.betService.bets;

  readonly submitting = signal(false);

  readonly displayBets = computed(() =>
    this.betService.openBets()?.map((bet) => {
      const players = this.playerService.players();
      const requester = players?.filter(
        (player) => player.player_id === bet.requester_player_id,
      )[0];
      const opponent = players?.filter(
        (player) => player.player_id === bet.opponent_player_id,
      )[0];

      return {
        requesterName: requester?.display_name ?? 'Requester',
        requesterScore: requester?.score,
        requesterWager: bet.requester_wager,
        opponentName: opponent?.display_name ?? 'Opponent',
        opponentScore: opponent?.score,
        opponentWager: bet.opponent_wager,
        description: bet.description,
        id: bet.id,
        status: bet.status,
      };
    }),
  );

  pushBet(betId: BetModel['id']) {
    //TODO
    betId;
  }

  submitRequesterWins(betId: BetModel['id']) {
    //TODO
    betId;
  }

  submitOpponentWins(betId: BetModel['id']) {
    //TODO
    betId;
  }

  cancelBet(betId: BetModel['id']) {
    //TODO
    betId;
  }

  async acceptBet(id: number) {
    this.submitting.set(true);
    await showMessageOnError(
      this.betService.acceptBet(id),
      this.messageService,
    );
    this.submitting.set(false);
  }

  async rejectBet(id: number) {
    this.submitting.set(true);
    await showMessageOnError(
      this.betService.rejectBet(id),
      this.messageService,
    );
    this.submitting.set(false);
  }
}
