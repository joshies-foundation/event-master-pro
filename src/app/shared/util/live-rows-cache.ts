import { User } from '@supabase/supabase-js';
import { SCHEMA_VERSION } from './schema-version';

const OWNER_KEY = 'emp-live-owner';
const ROWS_PREFIX = 'emp-live:';
const THIS_VERSION_PREFIX = `${ROWS_PREFIX}${SCHEMA_VERSION}:`;

const storage = (): Storage | undefined => globalThis.localStorage;

function deleteKeys(matches: (key: string) => boolean): void {
  const store = storage();
  if (!store) return;
  Object.keys(store)
    .filter(matches)
    .forEach((key) => store.removeItem(key));
}

function deleteRows(): void {
  deleteKeys((key) => key.startsWith(ROWS_PREFIX));
}

function parse<T>(json: string | null | undefined): T | undefined {
  if (!json) return undefined;
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}

export function liveRowsKey(table: string, filter?: string): string {
  return `${THIS_VERSION_PREFIX}${table}:${filter ?? ''}`;
}

export function liveRowsOwner(): User | undefined {
  return parse<User>(storage()?.getItem(OWNER_KEY));
}

export function claimLiveRows(user: User): void {
  if (liveRowsOwner()?.id !== user.id) forgetLiveRows();
  try {
    storage()?.setItem(OWNER_KEY, JSON.stringify(user));
  } catch {
    deleteRows();
  }
}

export function forgetLiveRows(): void {
  deleteKeys((key) => key === OWNER_KEY || key.startsWith(ROWS_PREFIX));
}

export function readLiveRows<Row>(key: string): Row[] | undefined {
  const rows = parse<Row[]>(storage()?.getItem(key));
  return Array.isArray(rows) ? rows : undefined;
}

export function saveLiveRows(key: string, json: string): void {
  const store = storage();
  if (!store?.getItem(OWNER_KEY)) return;
  try {
    store.setItem(key, json);
  } catch {
    deleteRows();
  }
}

export function deleteOtherSchemaVersions(): void {
  deleteKeys(
    (key) =>
      key.startsWith(ROWS_PREFIX) && !key.startsWith(THIS_VERSION_PREFIX),
  );
}
