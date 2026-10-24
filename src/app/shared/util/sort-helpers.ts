// A fixed locale keeps the order the same on every phone, whatever its language.
export const compareNames = new Intl.Collator('en-US').compare;

export function compareIds<Id extends string | number>(a: Id, b: Id): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
