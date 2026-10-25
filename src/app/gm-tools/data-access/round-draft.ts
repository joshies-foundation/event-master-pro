export enum RoundDraftKey {
  GameboardMoves = 'gameboardSpaceEntryFormValue',
  EventResults = 'roundScoreFormValue',
}

export interface DraftRound {
  sessionId: number;
  roundNumber: number;
}

export interface RoundDraft<Entry> extends DraftRound {
  entries: Record<string, Entry>;
}

function readRoundDraft(key: RoundDraftKey): RoundDraft<unknown> | undefined {
  let draft: Partial<RoundDraft<unknown>> | null;
  try {
    draft = JSON.parse(window.localStorage.getItem(key) ?? 'null');
  } catch {
    return undefined;
  }
  if (
    typeof draft?.sessionId !== 'number' ||
    typeof draft.roundNumber !== 'number' ||
    typeof draft.entries !== 'object' ||
    draft.entries === null
  ) {
    return undefined;
  }
  return draft as RoundDraft<unknown>;
}

export function roundDraftEntries(
  key: RoundDraftKey,
  round: DraftRound,
): Partial<Record<string, unknown>> {
  const draft = readRoundDraft(key);
  return draft?.sessionId === round.sessionId &&
    draft.roundNumber === round.roundNumber
    ? draft.entries
    : {};
}

export function completeRoundDraft<Entry>(
  key: RoundDraftKey,
  round: DraftRound,
  ids: string[],
  isEntry: (value: unknown) => value is Entry,
): RoundDraft<Entry> | undefined {
  if (!ids.length) return undefined;
  const saved = roundDraftEntries(key, round);
  const entries: Record<string, Entry> = {};
  for (const id of ids) {
    const entry = saved[id];
    if (!isEntry(entry)) return undefined;
    entries[id] = entry;
  }
  return { ...round, entries };
}

export function saveRoundDraft(
  key: RoundDraftKey,
  draft: RoundDraft<unknown>,
): void {
  window.localStorage.setItem(key, JSON.stringify(draft));
}

export function removeRoundDraft(key: RoundDraftKey): void {
  window.localStorage.removeItem(key);
}
