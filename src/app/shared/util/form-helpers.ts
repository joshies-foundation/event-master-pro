import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl } from '@angular/forms';

export type ModelFormGroup<T> = FormGroup<{
  [K in keyof T]: FormControl<T[K]>;
}>;

export function formValueSignal<T>(formGroup: ModelFormGroup<T>): Signal<T> {
  return toSignal(formGroup.valueChanges, {
    initialValue: formGroup.value,
  }) as Signal<T>;
}
