import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'joshies-top-bottom',
  standalone: true,
  template: `
    <!-- Over/Under Radio Buttons -->
    <div class="flex flex-wrap gap-3 mt-2">
      <div class="flex align-items-center">
        <label class="ml-2">
          <p-radioButton
            name="topBottom"
            value="TOP"
            [(ngModel)]="selectedTopBottomOption"
            styleClass="w-full"
          />
          Top
        </label>
      </div>
      <div class="flex align-items-center">
        <label class="ml-2">
          <p-radioButton
            name="topBottom"
            value="BOTTOM"
            [(ngModel)]="selectedTopBottomOption"
            styleClass="w-full"
          />
          Bottom
        </label>
      </div>
    </div>

    <!-- Over/Under Value -->
    <label class="flex flex-column gap-2 mt-3">
      <p-inputNumber
        [(ngModel)]="selectedNumberOfTeams"
        [showButtons]="true"
        buttonLayout="horizontal"
        [step]="1"
        min="1"
        [max]="max()"
        [allowEmpty]="false"
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
        inputStyleClass="w-full font-semibold text-right"
        styleClass="w-full"
      />
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RadioButtonModule, InputNumberModule],
})
export class TopBottomComponent {
  readonly selectedTopBottomOption = model<'TOP' | 'BOTTOM'>();
  readonly selectedNumberOfTeams = model<number>();

  readonly max = input.required<number>();
}
