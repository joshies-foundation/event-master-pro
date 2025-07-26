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
  template: `
    <!-- Over/Under Radio Buttons -->
    <div class="mt-2 flex flex-wrap gap-4 px-2">
      <label class="flex items-center gap-2">
        <p-radio-button
          name="topBottom"
          value="TOP"
          [(ngModel)]="selectedTopBottomOption"
          class="w-full"
        />
        Top
      </label>
      <div class="flex items-center">
        <label class="flex items-center gap-2">
          <p-radio-button
            name="topBottom"
            value="BOTTOM"
            [(ngModel)]="selectedTopBottomOption"
            class="w-full"
          />
          Bottom
        </label>
      </div>
    </div>

    <!-- Over/Under Value -->
    <label class="mt-4 flex flex-col gap-2">
      <p-input-number
        #numTeamsInput
        [(ngModel)]="selectedNumberOfTeams"
        [showButtons]="true"
        buttonLayout="horizontal"
        [step]="1"
        [min]="1"
        [max]="max()"
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
        inputStyleClass="w-full font-semibold text-center"
        class="w-full"
        (onFocus)="numTeamsInput.input.nativeElement.selectionStart = 100"
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
