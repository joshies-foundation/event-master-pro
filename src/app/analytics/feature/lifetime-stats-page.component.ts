import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { Tables } from '../../shared/util/schema';
import { View } from '../../shared/util/supabase-helpers';
import { DecimalPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../auth/data-access/auth.service';
import { PostgrestResponse } from '@supabase/supabase-js';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';

@Component({
  selector: 'joshies-lifetime-stats-page',
  standalone: true,
  imports: [
    DecimalPipe,
    InputNumberModule,
    NgOptimizedImage,
    SharedModule,
    TableModule,
    NgClass,
    PageHeaderComponent,
    HeaderLinkComponent,
  ],
  template: `
    <joshies-page-header headerText="Lifetime Stats" alwaysSmall>
      <joshies-header-link
        text="Analytics"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (lifetimeResultsQueryResult().data; as data) {
      <!-- Lifetime Rankings Table -->
      <p-table
        [value]="data"
        [defaultSortOrder]="-1"
        sortField="lifetime_score"
        [sortOrder]="-1"
        [scrollable]="true"
        styleClass="mt-5"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pFrozenColumn>Player</th>
            <th pSortableColumn="lifetime_score">
              Lifetime Pts <p-sortIcon field="lifetime_score" />
            </th>
            <th pSortableColumn="average_score">
              Average Pts <p-sortIcon field="average_score" />
            </th>
            <th pSortableColumn="num_sessions">
              Sessions <p-sortIcon field="num_sessions" />
            </th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr
            [ngClass]="{
              'font-semibold bg-highlight': row.user_id === userId()
            }"
          >
            <td pFrozenColumn>
              <div class="flex align-items-center gap-2 -py-2">
                <img
                  [ngSrc]="row.avatar_url"
                  alt=""
                  width="32"
                  height="32"
                  class="border-circle surface-100"
                />
                {{ row.display_name }}
              </div>
            </td>
            <td class="text-right">
              {{ row.lifetime_score | number }}
            </td>
            <td class="text-right">
              {{ row.average_score | number }}
            </td>
            <td class="text-right">
              {{ row.num_sessions | number }}
            </td>
          </tr>
        </ng-template>
      </p-table>
    } @else {
      <p class="text-red-700">Error loading data</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LifetimeStatsPageComponent {
  readonly lifetimeResultsQueryResult =
    input.required<PostgrestResponse<Tables<View.LifetimeUserStats>>>(); // route resolver param

  private readonly authService = inject(AuthService);

  readonly userId = computed(() => this.authService.user()?.id);
}
