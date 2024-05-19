import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, FormArray } from '@angular/forms';

export type ModelFormGroup<T> = FormGroup<ModelFormGroupType<T>>;

export type ModelFormGroupType<T> = {
  [K in keyof T]: T[K] extends Array<unknown>
    ? FormArray<ModelFormGroup<T[K][number]>>
    : T[K] extends object
      ? ModelFormGroup<T[K]>
      : FormControl<T[K]>;
};

// export type ModelFormArray<T extends Array<U>, U> = FormArray<>;

export function formValueSignal<T>(formGroup: ModelFormGroup<T>): Signal<T> {
  return toSignal(formGroup.valueChanges, {
    initialValue: formGroup.value,
  }) as Signal<T>;
}
