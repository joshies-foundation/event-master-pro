import { filter, ObservableInput, of, OperatorFunction, switchMap } from 'rxjs';

export function defined<T>(): OperatorFunction<T | null | undefined, T> {
  return filter((value): value is T => value !== undefined && value !== null);
}

export function whenNotNull<T, O extends ObservableInput<unknown>>(
  whenNotNull: (value: T) => O,
): OperatorFunction<T | null, ObservedValueOf<O> | null> {
  return switchMap((x: T | null) => (x === null ? of(null) : whenNotNull(x)));
}

export function whenNotUndefined<T, O extends ObservableInput<unknown>>(
  whenNotUndefined: (value: T) => O,
): OperatorFunction<T | undefined, ObservedValueOf<O> | undefined> {
  return switchMap((x: T | undefined) =>
    x === undefined ? of(undefined) : whenNotUndefined(x),
  );
}

type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;
