import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
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
import { EditorModule } from 'primeng/editor';
import { InputNumberModule } from 'primeng/inputnumber';

export enum FormFieldType {
  Text,
  Number,
  Dropdown,
  MultiSelect,
  Editor,
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
          showButtons?: boolean;
          step?: number;
          buttonLayout?: 'stacked' | 'horizontal' | 'vertical';
          incrementButtonIcon?: string;
          decrementButtonIcon?: string;
          min?: number;
          max?: number;
          mode?: 'decimal' | 'currency';
          currency?: string;
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
          type: FormFieldType.Editor;
          defaultValue?: string;
        }
      | {
          type: FormFieldType.Calendar;
          minDate?: Date;
          maxDate?: Date;
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
    EditorModule,
    InputNumberModule,
  ],
  templateUrl: './form-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent implements AfterViewInit {
  field = input.required<FormField>();
  formGroup = input.required<FormGroup>();
  formDisabled = input.required<boolean>();

  private readonly cd = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly FormFieldType = FormFieldType;

  private readonly enableAndDisableFieldEffect = effect(
    () => {
      const field = this.field();

      if (field.type === FormFieldType.Submit) {
        return;
      }

      if (this.formDisabled() || field.disabled) {
        field.control.disable();
      } else {
        field.control.enable();
      }
    },
    { allowSignalWrites: true },
  );

  ngAfterViewInit() {
    if (this.field().type !== FormFieldType.Submit) {
      return;
    }

    // react to the form becoming valid/invalid
    this.formGroup()
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cd.detectChanges());
  }
}
