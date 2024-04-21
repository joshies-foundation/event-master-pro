import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TransactionModel } from '../../shared/util/supabase-types';
import { TableModule } from 'primeng/table';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PostgrestResponse } from '@supabase/supabase-js';

@Component({
  selector: 'joshies-transactions-page',
  standalone: true,
  imports: [TableModule, DatePipe, DecimalPipe],
  template: `
    @if (transactionsResponse(); as transactionsResponse) {
      @if (transactionsResponse.data?.length) {
        <p-table [value]="transactionsResponse.data!">
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
    } @else {
      <p class="mt-6 pt-6 text-center text-500 font-italic">
        No active session
      </p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TransactionsPageComponent {
  readonly transactionsResponse =
    input.required<PostgrestResponse<TransactionModel> | null>();
}
