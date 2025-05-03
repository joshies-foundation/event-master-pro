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
import { NumberSignPipe } from '../../shared/ui/number-sign.pipe';
import { NumberSignColorClassPipe } from '../../shared/ui/number-sign-color-class.pipe';
import { NumberWithSignAndColorPipe } from '../../shared/ui/number-with-sign-and-color.pipe';

export interface OverrideDefinitionTableModel {
  inAddOrSubtractMode: boolean;
  oldScore: number;
  changeValue: number;
  newScore: number;
  inputDisabled?: boolean;
  readonly?: boolean;
}

@Component({
  selector: 'joshies-override-definition-table',
  imports: [
    InputNumberModule,
    DecimalPipe,
    FormsModule,
    NgClass,
    NumberSignPipe,
    NumberSignColorClassPipe,
    NumberWithSignAndColorPipe,
  ],
  template: `
    <table>
      <tbody>
        <!-- Before -->
        <tr>
          <td>Before</td>
          <td
            class="text-right text-neutral-400"
            [ngClass]="oldScorePaddingClass()"
          >
            <span class="mr-1">{{ model().oldScore | number }}</span>
          </td>
        </tr>

        <!-- Change -->
        <tr>
          <td>Change</td>
          <td
            class="text-right font-semibold"
            [ngClass]="
              (model().changeValue | numberSignColorClass) +
              changePaddingClass()
            "
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
                  'w-full font-semibold text-right ' +
                  (model().changeValue | numberSignColorClass)
                "
                [prefix]="model().changeValue | numberSign"
                styleClass="w-full"
                [disabled]="model().inputDisabled ?? false"
              />
            } @else {
              <span
                [innerHTML]="model().changeValue | numberWithSignAndColor"
              ></span>
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
    this.model().readonly ? '' : ' pr-12',
  );

  readonly changePaddingClass = computed(() =>
    this.model().readonly ? '' : this.showChangeInput() ? ' pr-0' : ' pr-12',
  );

  readonly newScorePaddingClass = computed(() =>
    this.model().readonly ? '' : this.showReplaceInput() ? ' pr-0' : 'pr-12',
  );
}
