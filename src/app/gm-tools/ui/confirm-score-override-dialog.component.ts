import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PlayerWithUserInfo } from '../../shared/data-access/player.service';
import {
  OverrideDefinitionTableComponent,
  OverrideDefinitionTableModel,
} from './override-definition-table.component';

export interface ConfirmOverrideDialogModel
  extends Omit<OverrideDefinitionTableModel, 'inputDisabled'> {
  player: PlayerWithUserInfo;
  comment: string;
}

export const confirmOverrideDialogKey = 'confirm-override';

@Component({
  selector: 'joshies-confirm-score-override-dialog',
  standalone: true,
  imports: [ConfirmDialogModule, OverrideDefinitionTableComponent],
  template: `
    <p-confirmDialog styleClass="mx-3" [key]="confirmOverrideDialogKey">
      <ng-template pTemplate="message" let-message>
        <div>
          <!-- Prompt -->
          <p class="mt-0 mb-4">
            Do you want to submit this override for
            <strong>{{ model().player.display_name }}</strong
            >?
          </p>

          <!-- Data Table -->
          <joshies-override-definition-table [model]="tableModel()" />

          <!-- Comment -->
          @if (model().comment) {
            <p class="font-italic text-500 mx-3 mb-0">
              GM Discretion: {{ model().comment }}
            </p>
          }
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
export class ConfirmScoreOverrideDialogComponent {
  readonly model = input.required<ConfirmOverrideDialogModel>();

  protected readonly confirmOverrideDialogKey = confirmOverrideDialogKey;

  readonly tableModel = computed(
    (): OverrideDefinitionTableModel => ({
      ...this.model(),
      readonly: true,
    }),
  );
}
