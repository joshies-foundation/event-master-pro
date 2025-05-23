import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { trackById } from '../../shared/util/supabase-helpers';
import { DatePipe } from '@angular/common';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { TableModule } from 'primeng/table';
import { TransactionModel } from '../../shared/util/supabase-types';

@Component({
  selector: 'joshies-transaction-table',
  imports: [
    DatePipe,
    NumberWithSignAndColorPipe,
    StronglyTypedTableRowDirective,
    TableModule,
  ],
  template: `
    <p-table [value]="transactions()" [rowTrackBy]="trackById">
      <ng-template
        #body
        [joshiesStronglyTypedTableRow]="transactions()"
        let-transaction
      >
        <tr>
          <td>
            <p>
              {{ transaction.description }}
            </p>
            <p class="text-sm text-neutral-400">
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionTableComponent {
  readonly transactions = input.required<TransactionModel[]>();

  protected readonly trackById = trackById;
}
