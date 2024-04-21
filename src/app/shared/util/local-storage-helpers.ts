export enum LocalStorageRecord {
  RoundScoreFormValue = 'roundScoreFormValue',
}

export function getRecordFromLocalStorage<T>(
  localStorageRecord: LocalStorageRecord,
): Record<string, T> {
  let obj = {};

  try {
    obj = JSON.parse(window.localStorage.getItem(localStorageRecord) ?? '{}');
  } catch {
    /* empty */
  }

  return obj;
}

export function saveRecordToLocalStorage<T>(
  localStorageRecord: LocalStorageRecord,
  value: Record<string, T>,
): void {
  window.localStorage.setItem(localStorageRecord, JSON.stringify(value));
}

export function removeRecordFromLocalStorage(
  localStorageRecord: LocalStorageRecord,
): void {
  window.localStorage.removeItem(localStorageRecord);
}
