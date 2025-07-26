import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'joshies-over-under',
  template: `
    <!-- Over/Under Radio Buttons -->
    <div class="mt-2 flex flex-wrap gap-4 px-2">
      <label class="flex items-center gap-2">
        <p-radio-button
          name="overUnder"
          value="OVER"
          [(ngModel)]="selectedOuOption"
          class="w-full"
        />
        Over
      </label>
      <div class="flex items-center">
        <label class="flex items-center gap-2">
          <p-radio-button
            name="overUnder"
            value="UNDER"
            [(ngModel)]="selectedOuOption"
            class="w-full"
          />
          Under
        </label>
      </div>
    </div>

    <!-- Over/Under Value -->
    <label class="mt-4 flex flex-col gap-2">
      Over/Under Value
      <p-input-number
        #ouInput
        [(ngModel)]="ouValue"
        [showButtons]="true"
        buttonLayout="horizontal"
        [step]="0.5"
        [min]="0.5"
        required
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
        inputStyleClass="w-full font-semibold text-center"
        class="w-full"
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
