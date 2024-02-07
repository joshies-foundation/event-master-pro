import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Signal,
} from '@angular/core';
import {
  FormField,
  FormFieldComponent,
} from '../form-field/form-field.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

export interface Form {
  formGroup: FormGroup;
  onSubmit: (event: SubmitEvent) => unknown;
  disabled?: Signal<boolean>;
  fields: Signal<FormField[]>;
  styleClass?: string;
}

@Component({
  selector: 'joshies-form',
  standalone: true,
  imports: [FormFieldComponent, ReactiveFormsModule, NgClass],
  templateUrl: './form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent {
  @Input({ required: true }) form!: Form;
}
