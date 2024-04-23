import { DecimalPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

export interface OverrideDefinitionTableModel {
  inAddOrSubtractMode: boolean;
  oldScore: number;
  changeValue: number;
  changeStyleClass: string;
  changePrefix: string;
  newScore: number;
  inputDisabled?: boolean;
  readonly?: boolean;
}

@Component({
  selector: 'joshies-override-definition-table',
  standalone: true,
  imports: [InputNumberModule, DecimalPipe, FormsModule, NgClass],
  template: `
    <table>
      <tbody>
        <!-- Before -->
        <tr>
          <td>Before</td>
          <td class="text-right text-400" [ngClass]="oldScorePaddingClass()">
            <span class="mr-1">{{ model().oldScore | number }}</span>
          </td>
        </tr>

        <!-- Change -->
        <tr>
          <td>Change</td>
          <td
            class="text-right font-semibold"
            [ngClass]="model().changeStyleClass + changePaddingClass()"
          >
            @if (showChangeInput()) {
              <p-inputNumber
                [(ngModel)]="userDefinedChangeValue"
                [showButtons]="true"
                buttonLayout="horizontal"
                [step]="1"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                [inputStyleClass]="
                  'w-full font-semibold text-right ' + model().changeStyleClass
                "
                [prefix]="model().changePrefix"
                styleClass="w-full"
                [disabled]="model().inputDisabled ?? false"
              />
            } @else {
              {{ model().changePrefix + (model().changeValue | number) }}
            }
          </td>
        </tr>

        <!-- After -->
        <tr>
          <td>After</td>
          <td
            class="text-right font-semibold"
            [ngClass]="newScorePaddingClass()"
          >
            @if (showReplaceInput()) {
              <p-inputNumber
                [(ngModel)]="userDefinedReplacementValue"
                [showButtons]="true"
                buttonLayout="horizontal"
                [step]="1"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                inputStyleClass="w-full font-semibold text-right"
                styleClass="w-full"
                [disabled]="model().inputDisabled ?? false"
              />
            } @else {
              {{ model().newScore | number }}
            }
          </td>
        </tr>
      </tbody>
    </table>
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
export class OverrideDefinitionTableComponent {
  model = input.required<OverrideDefinitionTableModel>();

  userDefinedChangeValue = model<number>();
  userDefinedReplacementValue = model<number>();

  readonly showChangeInput = computed(
    () => !this.model().readonly && this.model().inAddOrSubtractMode,
  );

  readonly showReplaceInput = computed(
    () => !this.model().readonly && !this.model().inAddOrSubtractMode,
  );

  readonly oldScorePaddingClass = computed(() =>
    this.model().readonly ? '' : ' pr-6',
  );

  readonly changePaddingClass = computed(() =>
    this.model().readonly ? '' : this.showChangeInput() ? ' pr-0' : ' pr-6',
  );

  readonly newScorePaddingClass = computed(() =>
    this.model().readonly ? '' : this.showReplaceInput() ? ' pr-0' : 'pr-6',
  );
}
