import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  input,
} from '@angular/core';
import {
  FormField,
  FormFieldComponent,
} from './form-field/form-field.component';
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
  imports: [FormFieldComponent, FormsModule, ReactiveFormsModule, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      [formGroup]="form().formGroup"
      (ngSubmit)="form().onSubmit($event)"
      [ngClass]="form().styleClass"
      class="flex flex-column gap-3"
    >
      @for (field of visibleFields(); track field.name) {
        <joshies-form-field
          [field]="field"
          [formGroup]="form().formGroup"
          [formDisabled]="form().disabled?.() ?? false"
        />
      }
    </form>
  `,
})
export class FormComponent {
  form = input.required<Form>();

  readonly visibleFields = computed(() =>
    this.form()
      .fields()
      ?.filter((field) => field.visible ?? true),
  );
}
