import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MessageService } from '@openng/optimus-ui/api';
import { ButtonModule } from '@openng/optimus-ui/button';
import { SkeletonModule } from '@openng/optimus-ui/skeleton';
import { TableModule } from '@openng/optimus-ui/table';
import { EdgeFunction } from '../../shared/util/supabase-helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { PlayerService } from '../../shared/data-access/player.service';
import { PrizeService } from '../../shared/data-access/prize.service';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import {
  showMessageOnError,
  trackByPlayerId,
} from '../../shared/util/supabase-helpers';

@Component({
  selector: 'joshies-adjust-prize-tokens-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    ButtonModule,
    SkeletonModule,
    TableModule,
    NgOptimizedImage,
    StronglyTypedTableRowDirective,
  ],
  template: `
    <joshies-page-header headerText="Adjust Prize Tokens" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (players(); as players) {
      <p-table
        [value]="players"
        styleClass="mt-6"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
      >
        <ng-template #header>
          <tr>
            <th pFrozenColumn>Player</th>
            <th class="text-center">Tokens</th>
            <th class="text-center">Adjust</th>
          </tr>
        </ng-template>
        <ng-template #body [joshiesStronglyTypedTableRow]="players" let-player>
          <tr>
            <td pFrozenColumn>
              <div class="flex items-center gap-2">
                <img
                  [ngSrc]="player.avatar_url"
                  width="32"
                  height="32"
                  class="size-8 rounded-full bg-neutral-100"
                  alt=""
                />
                <div>
                  <p>{{ player.display_name }}</p>
                  <p class="m-0 text-xs text-neutral-500">
                    {{ player.real_name }}
                  </p>
                </div>
              </div>
            </td>
            <td class="text-center text-lg font-semibold">
              {{ player.prize_tokens }}
            </td>
            <td class="text-center">
              <div class="flex justify-center gap-1">
                <p-button
                  icon="pi pi-minus"
                  size="small"
                  severity="danger"
                  [text]="true"
                  [rounded]="true"
                  [disabled]="player.prize_tokens === 0"
                  (onClick)="adjust(player.player_id, -1)"
                />
                <p-button
                  icon="pi pi-plus"
                  size="small"
                  severity="success"
                  [text]="true"
                  [rounded]="true"
                  (onClick)="
                    adjust(
                      player.player_id,
                      1,
                      player.user_id,
                      player.display_name
                    )
                  "
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    } @else {
      <p-skeleton width="100%" height="30rem" class="mt-6" />
    }
  `,
})
export default class AdjustPrizeTokensPageComponent {
  private readonly playerService = inject(PlayerService);
  private readonly prizeService = inject(PrizeService);
  private readonly messageService = inject(MessageService);
  private readonly supabase = inject(SupabaseClient);

  protected readonly trackByPlayerId = trackByPlayerId;
  protected readonly players = this.playerService.playersIncludingDisabled;

  protected async adjust(
    playerId: number,
    delta: number,
    recipientUserId?: string,
    recipientName?: string,
  ): Promise<void> {
    const response = await showMessageOnError(
      this.prizeService.adjustPlayerTokens(playerId, delta),
      this.messageService,
    );

    if (response.error) return;

    if (delta > 0 && recipientUserId) {
      this.supabase.functions.invoke(`${EdgeFunction.Push}/prize-token`, {
        body: { recipientUserId, displayName: recipientName },
      });
    }
  }
}
