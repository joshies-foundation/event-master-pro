# EventMaster Pro

Realtime Angular/Supabase PWA for running multi-day "Mario Party in real life" competitions.

## Language

### Core gameplay

**Session**:
A single multi-day competition, with one Game Master and a fixed roster of players.
_Avoid_: Game, event, tournament

**Game Master (GM)**:
The player who runs a session. Has admin tools and is usually also a competing player.
_Avoid_: Admin, host

**Round**:
One iteration of the session loop, comprising several phases that always run in a fixed order.
_Avoid_: Turn

**Event**:
The minigame that wraps up each round. The Mario Party "minigame" equivalent, done IRL (e.g., Disc Golf).
_Avoid_: Minigame, contest

**Points**:
The session-long score players accumulate. Determines final placement.
_Avoid_: Score (used in code for per-event scoring), coins

### Prizes (new system)

**Prize**:
A unique (1-of-1 within its session) NFT-style image owned by a player within a session. Cosmetic only — does not affect points or placement. Ownership is session-scoped; prizes won in past sessions remain viewable via analytics. Once awarded, ownership is permanent — not even the GM can revoke it.

**Prize Pool**:
The per-session, GM-defined set of prizes available to be won in that session. Sealed to that session.

**Prize Token**:
A spendable item granted to a player that entitles them to one pull from the Prize Machine.

**Prize Machine**:
The visual gumball-style UI where a player spends a Prize Token to randomly receive one Prize from the un-won pool.

## Relationships

- A **Session** has one **GM** and many players
- A **Session** has many **Rounds**
- A **Round** ends with one **Event**
- A **Session** has one **Prize Pool**; the pool contains many **Prizes**
- A player can hold zero or more **Prize Tokens** and own zero or more **Prizes**
- Spending one **Prize Token** at the **Prize Machine** awards one un-won **Prize** from the pool
