import { Component, computed, inject, input, signal } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { Router } from '@angular/router';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { TableModule } from '@openng/optimus-ui/table';
import { SessionService } from '../../shared/data-access/session.service';
import { undefinedUntilAllPropertiesAreDefined } from '../../shared/util/signal-helpers';
import { SkeletonModule } from '@openng/optimus-ui/skeleton';
import { ButtonModule } from '@openng/optimus-ui/button';
import {
  removeRoundDraft,
  RoundDraft,
  RoundDraftKey,
} from '../data-access/round-draft';
import { MessageService } from '@openng/optimus-ui/api';
import { showSuccessMessage } from '../../shared/util/message-helpers';
import {
  EdgeFunction,
  showMessageOnError,
  trackByPlayerId,
} from '../../shared/util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';
import { EventService } from '../../shared/data-access/event.service';

@Component({
  selector: 'joshies-review-score-changes-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    TableModule,
    NgOptimizedImage,
    SkeletonModule,
    ButtonModule,
    DecimalPipe,
    StronglyTypedTableRowDirective,
    NumberWithSignAndColorPipe,
  ],
  template: `
    <joshies-page-header headerText="Review Score Changes" alwaysSmall>
      <joshies-header-link
        text="Edit"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (viewModel(); as vm) {
      <h4 class="mt-12 mb-4 font-bold">
        Session points for round {{ vm.roundNumber }} of {{ vm.numRounds }}
        <span class="text-neutral-500 italic">(Draft)</span>
      </h4>

      <p-table
        [value]="vm.players"
        [defaultSortOrder]="-1"
        sortField="new_score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
      >
        <ng-template #header>
          <tr>
            <th pFrozenColumn>Player</th>
            <th class="text-right">Before</th>
            <th class="text-right">Change</th>
            <th class="text-right">After</th>
          </tr>
        </ng-template>
        <ng-template
          #body
          [joshiesStronglyTypedTableRow]="vm.players"
          let-player
        >
          <tr>
            <!-- Player -->
            <td pFrozenColumn>
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
            <!-- Before -->
            <td class="text-right text-neutral-400">
              {{ player.score | number }}
            </td>
            <!-- Change -->
            <td
              class="text-right"
              [innerHTML]="player.change | numberWithSignAndColor"
            ></td>
            <!-- After -->
            <td class="text-right font-semibold">
              {{ player.new_score | number }}
            </td>
          </tr>
        </ng-template>
      </p-table>

      <p-button
        label="Submit Session Points"
        (onClick)="submitSessionPointsForEvent()"
        severity="success"
        styleClass="mt-6 w-full"
        [loading]="submittingInProgress()"
      />
    } @else {
      <p-skeleton height="30rem" class="mt-12" />
    }
  `,
})
export default class ReviewScoreChangesPageComponent {
  private readonly router = inject(Router);
  private readonly sessionService = inject(SessionService);
  private readonly messageService = inject(MessageService);
  private readonly eventService = inject(EventService);
  private readonly supabase = inject(SupabaseClient);

  protected readonly trackByPlayerId = trackByPlayerId;

  readonly draft = input.required<RoundDraft<number>>();

  private readonly players = computed(() => {
    const teamScoreChanges = this.draft().entries;
    return this.eventService
      .eventParticipantsWithPlayerInfo()
      ?.filter((participant) => participant.team_id in teamScoreChanges)
      .map((participant) => ({
        ...participant,
        change: teamScoreChanges[participant.team_id],
        new_score: participant.score + teamScoreChanges[participant.team_id],
      }));
  });

  readonly viewModel = computed(() =>
    undefinedUntilAllPropertiesAreDefined({
      players: this.players(),
      roundNumber: this.draft().roundNumber,
      numRounds: this.sessionService.session()?.num_rounds,
    }),
  );

  readonly submittingInProgress = signal(false);

  async submitSessionPointsForEvent(): Promise<void> {
    const { roundNumber, entries: teamScoreChanges } = this.draft();
    this.submittingInProgress.set(true);

    const { error, data } = await showMessageOnError(
      this.sessionService.submitSessionPointsForEvent(
        roundNumber,
        teamScoreChanges,
      ),
      this.messageService,
    );

    if (error) {
      this.submittingInProgress.set(false);
      return;
    }

    const tokenRecipientUserIds = data?.token_recipient_user_ids ?? [];
    if (tokenRecipientUserIds.length) {
      this.supabase.functions.invoke(`${EdgeFunction.Push}/prize-token`, {
        body: { recipientUserIds: tokenRecipientUserIds },
      });
    }

    removeRoundDraft(RoundDraftKey.EventResults);
    showSuccessMessage('Scores saved successfully!', this.messageService);
    this.router.navigate(['/']);
  }
}
