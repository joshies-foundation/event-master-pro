import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { LowerCasePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { EditorModule } from 'primeng/editor';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { concat, delay, map, of, switchMap } from 'rxjs';
import { EventService } from '../../data-access/event.service';
import { ImageModule } from 'primeng/image';
import { SkeletonModule } from 'primeng/skeleton';

export enum FormFieldType {
  Text,
  Number,
  Dropdown,
  MultiSelect,
  Editor,
  Calendar,
  Submit,
  TextArea,
  Checkbox,
  Image,
}

type UploadedImageUrl = string;
type ImageUploadCallback = (imageFile: File) => Promise<UploadedImageUrl>;

export interface DropdownItem<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}

export type FormField = {
  label: string;
  name: string;
  styleClass?: string;
  visible?: boolean;
} & (
  | ({
      type: Exclude<FormFieldType, FormFieldType.Submit>;
      placeholder?: string;
      control: FormControl;
      disabled?: boolean;
      required?: boolean;
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
          suffix?: string;
          inputStyleClass?: string;
          allowDecimals?: boolean;
        }
      | {
          type: FormFieldType.Dropdown;
          options: (DropdownItem | object)[];
          optionLabel?: string;
          optionValue?: string;
          optionDisabled?: string;
        }
      | {
          type: FormFieldType.MultiSelect;
          useChips?: boolean;
          options: (DropdownItem | object)[];
          optionLabel?: string;
          optionValue?: string;
          optionDisabled?: string;
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
          showTime?: boolean;
          timeOnly?: boolean;
        }
      | {
          type: FormFieldType.TextArea;
          defaultValue?: string;
          rows?: number;
        }
      | {
          type: FormFieldType.Checkbox;
          defaultValue?: boolean;
        }
      | {
          type: FormFieldType.Image;
          uploadCallback: ImageUploadCallback;
          previewHeight: number;
          previewWidth: number;
          altText?: string;
        }
    ))
  | {
      type: FormFieldType.Submit;
      loading?: boolean;
      position: 'left' | 'right' | 'center' | 'full';
      icon?: string;
      iconPos?: 'left' | 'right' | 'top' | 'bottom';
    }
);

@Component({
  selector: 'joshies-form-field',
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
    InputTextareaModule,
    CheckboxModule,
    ImageModule,
    SkeletonModule,
    NgOptimizedImage,
  ],
  templateUrl: './form-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent implements AfterViewInit {
  private readonly defaultImage = '/assets/icons/icon-96x96.png';

  field = input.required<FormField>();
  field$ = toObservable(this.field);
  formGroup = input.required<FormGroup>();
  formDisabled = input.required<boolean>();

  fieldValue = toSignal(
    this.field$.pipe(
      map(
        (field) =>
          field as unknown as { control: FormControl<unknown> | undefined },
      ),
      switchMap((field) =>
        concat(
          of(field.control?.value),
          field.control?.valueChanges ?? of(undefined),
        ),
      ),
    ),
  );

  uploading = signal(false);

  private readonly cd = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly eventService = inject(EventService);

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
    if (this.field().type === FormFieldType.Submit) {
      // react to the form becoming valid/invalid
      this.formGroup()
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.cd.detectChanges());

      return;
    }

    // update top parent form group when nested form controls are updated
    (
      this.field() as unknown as { control: FormControl<unknown> }
    ).control.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), delay(0))
      .subscribe(() => this.formGroup().updateValueAndValidity());
  }

  async onImageSelect(
    imageUrlFormControl: FormControl<string>,
    event: Event,
    uploadCallback: ImageUploadCallback,
  ): Promise<void> {
    this.uploading.set(true);

    const imageFile = (event.target as HTMLInputElement).files?.[0];

    if (!imageFile) return;

    try {
      const imageUrl = await uploadCallback(imageFile);
      imageUrlFormControl.setValue(imageUrl);
    } finally {
      this.uploading.set(false);
    }
  }
}
