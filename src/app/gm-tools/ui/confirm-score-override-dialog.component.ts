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
  imports: [ConfirmDialogModule, OverrideDefinitionTableComponent],
  template: `
    <p-confirmDialog styleClass="mx-4" [key]="confirmOverrideDialogKey">
      <ng-template #message let-message>
        <div>
          <!-- Prompt -->
          <p class="mb-6">
            Do you want to submit this override for
            <strong>{{ model().player.display_name }}</strong
            >?
          </p>

          <!-- Data Table -->
          <joshies-override-definition-table [model]="tableModel()" />

          <!-- Comment -->
          @if (model().comment) {
            <p class="italic text-neutral-500 mx-4">
              GM Discretion: {{ model().comment }}
            </p>
          }
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
