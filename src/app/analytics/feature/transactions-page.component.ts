import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AnalyticsService } from '../data-access/analytics.service';
import { SkeletonModule } from 'primeng/skeleton';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { trackById } from '../../shared/util/supabase-helpers';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';

@Component({
  selector: 'joshies-transactions-page',
  standalone: true,
  imports: [
    TableModule,
    DatePipe,
    DecimalPipe,
    SkeletonModule,
    PageHeaderComponent,
    HeaderLinkComponent,
    StronglyTypedTableRowDirective,
    NumberWithSignAndColorPipe,
  ],
  template: `
    <joshies-page-header headerText="Transactions" alwaysSmall>
      <joshies-header-link
        text="Analytics"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    @if (transactions(); as transactions) {
      @if (transactions.length > 0) {
        <p-table
          [value]="transactions"
          [rowTrackBy]="trackById"
          styleClass="mt-5"
        >
          <ng-template
            pTemplate="body"
            [joshiesStronglyTypedTableRow]="transactions"
            let-transaction
          >
            <tr>
              <td>
                <p class="m-0">
                  {{ transaction.description }}
                </p>
                <p class="text-sm m-0 text-400">
                  {{ transaction.created_at | date: 'short' }}
                </p>
              </td>
              <td
                class="text-right"
                [innerHTML]="transaction.num_points | numberWithSignAndColor"
              ></td>
            </tr>
          </ng-template>
        </p-table>
      } @else {
        <p class="mt-6 pt-6 text-center text-500 font-italic">
          No transactions yet
        </p>
      }
    } @else if (transactions() === null) {
      <p class="mt-6 pt-6 text-center text-500 font-italic">
        You are not a player in this session
      </p>
    } @else {
      <!-- Loading Skeleton -->
      @for (i of [1, 2, 3, 4, 5, 6]; track i; let first = $first) {
        <p-skeleton
          height="3.5rem"
          [styleClass]="'mb-2' + (first ? ' mt-5' : '')"
        />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TransactionsPageComponent {
  private readonly analyticsService = inject(AnalyticsService);

  protected readonly trackById = trackById;

  readonly transactions = this.analyticsService.transactions;
}
