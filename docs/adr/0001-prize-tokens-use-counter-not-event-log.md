# Prize tokens use a simple counter, not an event log

Prize tokens are stored as a single `prize_tokens` integer column on the `player` row, with mint/spend/adjust operations directly incrementing or decrementing the count. This deliberately deviates from the points system, which records every change as a row in the `transaction` table for full auditability.

The trade-off was simplicity over audit trail. Tokens are a low-stakes, cosmetic-only currency — disputes over "where did my token come from?" carry far less weight than disputes over points, and the per-feature complexity of an event-log table (issued/spent/revoked states, joins for balance reads, soft-delete semantics) wasn't justified for v1.

## Consequences

- We can't answer "when did Player A get this token?" or "did the GM give it to them or did they earn it?" — this history is intentionally not retained.
- If audit needs emerge later (e.g., player disputes, analytics on token sources), the migration to an event-log table is a real chunk of work, not a drop-in.
- Won prizes themselves retain full provenance (the `prize` row records its owner and the moment of award), so the irreversible "you own this image" half of the system is auditable. Only the spendable-currency half is not.
