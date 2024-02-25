import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  Input,
} from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { LowerCasePipe, NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';

export enum FormFieldType {
  Text,
  Number,
  Dropdown,
  MultiSelect,
  Calendar,
  Submit,
}

export type FormField = {
  label: string;
  name: string;
  styleClass?: string;
} & (
  | ({
      type: Exclude<FormFieldType, FormFieldType.Submit>;
      placeholder?: string;
      control: FormControl;
      disabled?: boolean;
    } & (
      | {
          type: FormFieldType.Text;
          defaultValue?: string;
        }
      | {
          type: FormFieldType.Number;
          defaultValue?: number;
        }
      | {
          type: FormFieldType.Dropdown;
          options: object[];
          optionLabel: string;
          optionValue: string;
        }
      | {
          type: FormFieldType.MultiSelect;
          useChips?: boolean;
          options: object[];
          optionLabel: string;
          optionValue: string;
        }
      | {
          type: FormFieldType.Calendar;
          minDate: Date;
          maxDate: Date;
          selectionMode?: 'multiple' | 'range' | 'single';
          touchUi?: boolean;
          inline?: boolean;
        }
    ))
  | {
      type: FormFieldType.Submit;
      loading?: boolean;
      position: 'left' | 'right' | 'center' | 'full';
    }
);

@Component({
  selector: 'joshies-form-field',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    InputTextModule,
    LowerCasePipe,
    ReactiveFormsModule,
    ButtonModule,
    NgClass,
    CalendarModule,
    MultiSelectModule,
  ],
  templateUrl: './form-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // styles: `::ng-deep p-multiselect .p-multiselect-label{
  //     display: flex;
  //     flex-wrap: wrap;
  //     align-items: flex-start;
  //     justify-content: flex-start;
  //     gap: 0;
  // }

  // ::ng-deep p-multiselect .p-multiselect-token{
  //     margin-bottom: .5rem
  // }`,
})
export class FormFieldComponent implements AfterViewInit {
  @Input({ required: true }) field!: FormField;
  @Input({ required: true }) formGroup!: FormGroup;
  readonly formDisabled = input.required<boolean>();

  private readonly cd = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly FormFieldType = FormFieldType;
  protected readonly Date = Date;

  private readonly enableAndDisableFieldEffect = effect(() => {
    if (this.field.type === FormFieldType.Submit) {
      return;
    }

    if (this.formDisabled() || this.field.disabled) {
      this.field.control.disable();
    } else {
      this.field.control.enable();
    }
  });

  ngAfterViewInit() {
    if (this.field.type !== FormFieldType.Submit) {
      return;
    }

    // react to the form becoming valid/invalid
    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.field.type === FormFieldType.Submit) {
          this.cd.detectChanges();
          return;
        }
      });
  }
}
