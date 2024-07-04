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

export interface ConfirmBankBalanceOverrideDialogModel
  extends Omit<OverrideDefinitionTableModel, 'inputDisabled'> {}

export const confirmOverrideDialogKey = 'confirm-override';

@Component({
  selector: 'joshies-confirm-bank-balance-override-dialog',
  standalone: true,
  imports: [ConfirmDialogModule, OverrideDefinitionTableComponent],
  template: `
    <p-confirmDialog styleClass="mx-3" [key]="confirmOverrideDialogKey">
      <ng-template pTemplate="message" let-message>
        <div>
          <!-- Prompt -->
          <p class="mt-0 mb-4">
            Do you want to submit this override for the Bank balance?
          </p>

          <!-- Data Table -->
          <joshies-override-definition-table [model]="tableModel()" />
        </div>
      </ng-template>
    </p-confirmDialog>
  `,
  styles: `
    $tableBorder: 1px solid var(--surface-50);

    table {
      width: 100%;
      border-collapse: collapse;

      td {
        border-top: $tableBorder;
        border-bottom: $tableBorder;
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
