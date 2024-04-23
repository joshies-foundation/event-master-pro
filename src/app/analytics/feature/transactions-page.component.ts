import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { TransactionModel } from '../../shared/util/supabase-types';
import { TableModule } from 'primeng/table';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PostgrestResponse } from '@supabase/supabase-js';
import { AnalyticsService } from '../data-access/analytics.service';
import { SkeletonModule } from 'primeng/skeleton';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';

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
        <p-table [value]="transactions" styleClass="mt-5">
          <ng-template pTemplate="body" let-transaction>
            <tr>
              <td>
                <p class="m-0">
                  {{ transaction.description }}
                </p>
                <p class="text-sm m-0 text-400">
                  {{ transaction.timestamp | date: 'short' }}
                </p>
              </td>
              <td
                class="text-right font-semibold"
                [class.text-red]="transaction.num_points < 0"
                [class.text-green]="transaction.num_points > 0"
                [class.text-500]="!transaction.num_points"
              >
                {{ transaction.num_points > 0 ? '+' : ''
                }}{{ transaction.num_points | number }}
              </td>
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
        No active session
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

  readonly transactions = this.analyticsService.transactions;

  readonly transactionsResponse =
    input.required<PostgrestResponse<TransactionModel> | null>();
}
