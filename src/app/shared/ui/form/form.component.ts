import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
  Signal,
} from '@angular/core';
import {
  FormField,
  FormFieldComponent,
} from '../form-field/form-field.component';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

export interface Form {
  formGroup: FormGroup;
  onSubmit: (event: SubmitEvent) => unknown;
  disabled?: Signal<boolean>;
  fields: Signal<FormField[] | undefined>;
  styleClass?: string;
}

@Component({
  selector: 'joshies-form',
  standalone: true,
  imports: [FormFieldComponent, FormsModule, ReactiveFormsModule, NgClass],
  templateUrl: './form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent {
  @Input({ required: true }) form!: Form;
  protected readonly signal = signal;
}
