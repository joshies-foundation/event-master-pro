import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  OverrideDefinitionTableComponent,
  OverrideDefinitionTableModel,
} from './override-definition-table.component';

type ConfirmBankBalanceOverrideDialogModel = Omit<
  OverrideDefinitionTableModel,
  'inputDisabled'
>;

export const confirmOverrideDialogKey = 'confirm-override';

@Component({
  selector: 'joshies-confirm-bank-balance-override-dialog',
  imports: [ConfirmDialogModule, OverrideDefinitionTableComponent],
  template: `
    <p-confirmDialog styleClass="mx-4" [key]="confirmOverrideDialogKey">
      <ng-template #message let-message>
        <div>
          <!-- Prompt -->
          <p class="mb-6">
            Do you want to submit this override for the Bank balance?
          </p>

          <!-- Data Table -->
          <joshies-override-definition-table [model]="tableModel()" />
        </div>
      </ng-template>
    </p-confirmDialog>
  `,
  styles: `
    table {
      width: 100%;
      border-collapse: collapse;

      td {
        border-top: var(--color-neutral-50);
        border-bottom: var(--color-neutral-50);
        padding: 0.75rem 1rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmBankBalanceOverrideDialogComponent {
  readonly model = input.required<ConfirmBankBalanceOverrideDialogModel>();

  protected readonly confirmOverrideDialogKey = confirmOverrideDialogKey;

  readonly tableModel = computed(
    (): OverrideDefinitionTableModel => ({
      ...this.model(),
      readonly: true,
    }),
  );
}
