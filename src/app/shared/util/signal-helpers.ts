type KeyValueObject = Record<string, unknown>;

function propertiesAreAllDefined<T extends KeyValueObject>(
  obj: Partial<T>,
): obj is T {
  return Object.values(obj).every((value) => value !== undefined);
}

export function undefinedUntilAllPropertiesAreDefined<T extends KeyValueObject>(
  obj: Partial<T>,
): T | undefined {
  return propertiesAreAllDefined(obj) ? obj : undefined;
}

export function withAllDefined<
  DependenciesType extends KeyValueObject,
  ComputationReturnType,
>(
  dependencies: Partial<DependenciesType>,
  computation: (definedDependencies: DependenciesType) => ComputationReturnType,
): ComputationReturnType | undefined {
  const dependenciesOrUndefined =
    undefinedUntilAllPropertiesAreDefined(dependencies);

  if (!dependenciesOrUndefined) return;

  return computation(dependenciesOrUndefined);
}
