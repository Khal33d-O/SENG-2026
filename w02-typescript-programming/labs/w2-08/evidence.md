# W2.08 evidence card: refactor a component and preserve its callers

Learner id (synthetic, e.g. `learner-01`): ______  Partner id: ______
Working directory (`$w208_work`): ______  Versions (node, npm, tsc): ______

## Baseline and guided practice
- `npm run check:baseline` count; one shared expected state and the two factories using it:
- Counter: why updating a variable outside the instance would change the responsibility; `check:practice` result:
- One expected normal state and one preserved blocked state (written before Task 1):

## Task 1
- Where my `move` retains the rule result; why a `void` result fits a later `snapshot` call:
- `npm run check:core` count; support used (demonstration class?):

## Task 2: predictions before running
| Moment | Predicted state | Predicted calls |
|---|---|---|
| After registration | | |
| After a direct `game.move("east")` | | |
| After `port.send("east")` | | |
- Expression that actually invokes the stored function:
- Observed: exact error, last known state and call count (function adapter vs class):

## Task 3
- The receiver at the actual call vs the object owning `#state`:
- My connection change and why it preserves deferred execution, direction, count and independence:
- Shortcut 1 (ordinary property, original connection): prediction / observation (compiler or runtime?):
- Shortcut 2 (call `move` during registration): prediction / observation:

## Task 4
- `npm test` count and named caller checks; source version:
- PRESERVED path from `node tools.mjs checkpoint`; `check:connection` with the checkpoint (failure):
- After restore: `check:connection` and `npm test` results; did any assertion change?

## Individual explanation
- Public interface justification (`move` vs `snapshot` contracts, why the rule stays outside):
- Owner of state, invoking caller, observation that changed after the repair:

## Transfer: equipment-loan record
- Constructor responsibility; assertions that stay unchanged; does page formatting belong in the component?

## Assistance and status
- independent / prompted / guided / not yet demonstrated; environment blocked (separately):
- Next in-class revisit:
