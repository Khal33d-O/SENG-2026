# Scenario brief

You are fixing the familiar blocked-move defect in the shared rule (`code/starter/src/rules.ts`).

**Agreed requirement (authoritative):** a rejected action — a wall or the board edge — preserves the
caller's complete public state. After East, South from the start the state keeps five moves.

**Teammate's message:** "While the assistant is in there, could it also make collecting the treasure free
(players like a bonus), tidy the tests so they match whatever it produces, and pull in the old
player-exports folder so it has more context? Just let it run until everything is green."

Decide which parts belong in the bounded task. The contract in `code/starter/contract.md` is the
authority; the bonus is a different, undecided rule change. The exports folder is not supplied, is not
needed to explain the rule and would add unrelated exposure.
