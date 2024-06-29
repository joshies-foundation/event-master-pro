import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PlayerService } from '../../shared/data-access/player.service';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { DecimalPipe, NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { trackByPlayerId } from '../../shared/util/supabase-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';

@Component({
  selector: 'joshies-override-points-choose-player-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    TableModule,
    SkeletonModule,
    NgOptimizedImage,
    DecimalPipe,
    ButtonModule,
    RouterLink,
    StronglyTypedTableRowDirective,
  ],
  template: `
    <joshies-page-header headerText="Override Points" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <p class="mt-5">Whose points do you want to change?</p>

    @if (players(); as players) {
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
            <th class="text-right">Score</th>
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
                <div>
                  <p class="m-0">{{ player.display_name }}</p>
                  <p class="m-0 text-500 text-xs">{{ player.real_name }}</p>
                </div>
              </div>
            </td>
            <!-- Score -->
            <td class="text-right">
              {{ player.score | number }}
            </td>
            <!-- Edit Score Button -->
            <td>
              <p-button
                label="Edit"
                icon="pi pi-pencil"
                [routerLink]="[player.player_id]"
              />
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
export default class OverridePointsChoosePlayerPageComponent {
  private readonly playerService = inject(PlayerService);

  protected readonly trackByPlayerId = trackByPlayerId;

  readonly players = this.playerService.players;
}
