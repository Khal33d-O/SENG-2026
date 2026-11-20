# W2.07 captured demonstration observations

Author-captured from the unchanged lab starter (TypeScript 5.9.3). Label these as captured if you use
them; they cannot establish that your own source compiled or your own test ran.

## Worked Example 1
- `npm run demo:bare`: `PASS bare assertion: costly(demoTiles(), 2) from dist/conversion.js returned ["q"] (equality excluded)`
- `npm run demo:named`: one passing test, `converted assertion: excludes equality`.

## Worked Example 2: reproduce the seed
`npm run check:regression` (unchanged starter):

```text
✖ regression: equality is excluded at threshold two
  AssertionError [ERR_ASSERTION]: cost equal to the threshold must be excluded
  + actual - expected
    [
  +   'p',
      'q'
    ]
```

`npm run inspect`:

```text
INSPECT current rule: dist/costly.js (compiled from src/costly.ts)
  threshold passed:   2
  input costs before: p:2, q:4
  actual IDs:         ["p","q"]
  input costs after:  p:2, q:4
  input unchanged:    true
  new result array:   true
```

Cause: `src/costly.ts` uses `tile.cost >= threshold`. After changing only `>=` to `>`, the same named
test passes (`ℹ pass 1`).

## Probe discrepancy (after the correction, before repairing the probe)
- `npm run check:probe`: both probe tests pass (the first callback assigns `threshold = 2`).
- `npm run check:focused`: `boundary probe: equality at threshold two is excluded` fails with actual
  `['p', 'q']`; `TRACE=1` shows `TRACE costly received threshold=0 tiles=[p:2, q:4]`.
