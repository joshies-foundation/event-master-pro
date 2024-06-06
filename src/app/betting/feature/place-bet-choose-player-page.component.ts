import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { TableModule } from 'primeng/table';
import { NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { trackByPlayerId } from '../../shared/util/supabase-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';

@Component({
  selector: 'joshies-place-bet-choose-player-page',
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
    <joshies-page-header headerText="Place a Bet" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <p class="mt-5">Who are you betting against?</p>
    @if (playersWithoutUser(); as players) {
      <p-table
        [value]="players"
        [defaultSortOrder]="-1"
        sortField="score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackByPlayerId"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Player</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template
          pTemplate="body"
          [joshiesStronglyTypedTableRow]="players"
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
            <!-- Select Button -->
            <td>
              <p-button
                label="Select"
                icon="pi pi-check-square"
                [routerLink]="[player.player_id]"
              />
            </td>
          </tr>
        </ng-template>
      </p-table>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PlaceBetChoosePlayerPageComponent {
  private readonly playerService = inject(PlayerService);

  protected readonly trackByPlayerId = trackByPlayerId;

  readonly userPlayer = this.playerService.userPlayer;
  playersWithoutUser = computed(() => {
    return this.playerService
      .players()
      ?.filter((player) => player.user_id !== this.userPlayer()!.user_id);
  });
}
