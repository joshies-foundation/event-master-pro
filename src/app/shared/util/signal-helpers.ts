type KeyValueObject = Record<string, unknown>;

function propertiesAreAllDefined<T extends KeyValueObject>(
  obj: Partial<T>,
): obj is T {
  return Object.keys(obj).every((key) => obj[key] !== undefined);
}

export function undefinedUntilAllPropertiesAreDefined<T extends KeyValueObject>(
  obj: Partial<T>,
): T | undefined {
  return propertiesAreAllDefined(obj) ? obj : undefined;
}

export function withAllDefined<
  SignalsType extends KeyValueObject,
  CallbackReturnType,
>(
  signals: Partial<SignalsType>,
  callback: (inputs: SignalsType) => CallbackReturnType,
): CallbackReturnType | undefined {
  const inputs = undefinedUntilAllPropertiesAreDefined(signals);

  if (!inputs) return;

  return callback(inputs);
}
