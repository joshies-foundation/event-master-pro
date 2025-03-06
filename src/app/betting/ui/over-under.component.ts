import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'joshies-over-under',
  template: `
    <!-- Over/Under Radio Buttons -->
    <div class="flex flex-wrap gap-3 mt-2">
      <div class="flex align-items-center">
        <label class="ml-2">
          <p-radioButton
            name="overUnder"
            value="OVER"
            [(ngModel)]="selectedOuOption"
            styleClass="w-full"
          />
          Over
        </label>
      </div>
      <div class="flex align-items-center">
        <label class="ml-2">
          <p-radioButton
            name="overUnder"
            value="UNDER"
            [(ngModel)]="selectedOuOption"
            styleClass="w-full"
          />
          Under
        </label>
      </div>
    </div>

    <!-- Over/Under Value -->
    <label class="flex flex-column gap-2 mt-3">
      Over/Under Value
      <p-inputNumber
        #ouInput
        [(ngModel)]="ouValue"
        [showButtons]="true"
        buttonLayout="horizontal"
        [step]="0.5"
        min="0.5"
        required
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
        inputStyleClass="w-full font-semibold text-center"
        styleClass="w-full"
        (onFocus)="ouInput.input.nativeElement.selectionStart = 100"
      />
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RadioButtonModule, InputNumberModule],
})
export class OverUnderComponent {
  readonly selectedOuOption = model<'OVER' | 'UNDER'>();
  readonly ouValue = model<number>();
}
