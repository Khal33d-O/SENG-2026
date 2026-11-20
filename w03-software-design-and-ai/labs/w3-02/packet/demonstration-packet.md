# Completed demonstration packet

## Demonstration A: review the rejected-action result

Request: a wall rejection must preserve state and report that the action was not accepted.

```diff
--- baseline/src/rules.ts
+++ demo-a/src/rules.ts
@@ -36,10 +36,8 @@
   if (!step) return { accepted: false, state, reason: 'INVALID_ACTION' };
   const position = { x: state.position.x + step.x, y: state.position.y + step.y };
   const blocked = isBlocked(position);
-  // Known Week 3 baseline defect: a rejected (blocked) action still spends one move.
-  if (blocked) return {
-    accepted: false, state: { ...state, movesRemaining: state.movesRemaining - 1 }, reason: 'ILLEGAL_ACTION'
-  };
+  // Patch: keep the move budget when blocked.
+  if (blocked) return { accepted: true, state, reason: 'ILLEGAL_ACTION' };
 
   // Accepted: one move, first collection of t1 adds its value once, win before zero-budget loss.
   const collected = [...state.collected];
```

The instructor ran East, South against the baseline, the demonstration patch and the corrected reference:

```text
baseline   acceptance PASS; state preservation FAIL (movesRemaining 4, expected 5)
demo-a     acceptance FAIL (actual true, expected false); state preservation PASS
reference  acceptance PASS; state preservation PASS
```

Completed annotation — **location:** blocked branch, `accepted: true`. **Concern:** it reports a rejected
action as accepted. **Consequence:** callers would treat a wall move as legal progress. **Verification:** return
the rejected result and rerun an assertion covering both the flag and the complete state after East, South.
The corrected reference passes both assertions.

## Demonstration B: turn a quality finding into feedback

`src/tone.ts`:

```ts
export function describeResult(accepted: boolean): string {
  const unusedTone = 'neutral';
  return accepted ? 'Move accepted.' : 'Move rejected; state unchanged.';
}
```

```text
$ npx eslint dist/tone.js
dist\tone.js
  2:11  error  'unusedTone' is assigned a value but never used  no-unused-vars

✖ 1 problem (1 error, 0 warnings)
(exit status 1)
```

The binding holds a pure string constant and is never read. Comment: remove the unused `unusedTone` choice
the function never applies, then rerun lint and the two output checks. Corrected `src/tone-corrected.ts`:

```ts
export function describeResult(accepted: boolean): string {
  return accepted ? 'Move accepted.' : 'Move rejected; state unchanged.';
}
```

```text
$ npx eslint dist/tone-corrected.js

(exit status 0)
```

Both versions return "Move accepted." for `true` and "Move rejected; state unchanged." for `false`.
