import {
  distinctUntilChanged,
  filter,
  MonoTypeOperatorFunction,
  Observable,
  ObservableInput,
  of,
  OperatorFunction,
  switchMap,
} from 'rxjs';

export function defined<T>(): OperatorFunction<T | null | undefined, T> {
  return filter((value): value is T => value !== undefined && value !== null);
}

export function whenNotNull<T, O extends ObservableInput<unknown>>(
  whenNotNull: (value: T) => O,
): OperatorFunction<T | null, ObservedValueOf<O> | null> {
  return switchMap((x: T | null) => (x === null ? of(null) : whenNotNull(x)));
}

type NonNullableProperties<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export function whenAllValuesNotNull<
  T extends Record<string, unknown>,
  O extends ObservableInput<unknown>,
>(
  whenNotNull: (value: NonNullableProperties<T>) => O,
): OperatorFunction<T, ObservedValueOf<O> | null> {
  return switchMap((obj: T) =>
    Object.values(obj).some((value) => value === null)
      ? of(null)
      : whenNotNull(obj as NonNullableProperties<T>),
  );
}

export function whenNotUndefined<T, O extends ObservableInput<unknown>>(
  whenNotUndefined: (value: T) => O,
): OperatorFunction<T | undefined, ObservedValueOf<O> | undefined> {
  return switchMap((x: T | undefined) =>
    x === undefined ? of(undefined) : whenNotUndefined(x),
  );
}

type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;

export function distinctUntilIdChanged<
  T extends { id: string | number } | null | undefined,
>(): MonoTypeOperatorFunction<T> {
  return distinctUntilChanged<T>(
    (previous, current) => previous?.id === current?.id,
  );
}

export function notifyOnMutation(
  target: Node,
  options: MutationObserverInit,
): Observable<void> {
  return new Observable((subscriber) => {
    const mutation = new MutationObserver(() => subscriber.next());
    mutation.observe(target, options);
    return () => mutation.disconnect();
  });
}
