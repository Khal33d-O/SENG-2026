# W2.08 captured demonstration observations

Author-captured with TypeScript 5.9.3. Label as captured if you rely on them.

## Worked Example 1 (`npm run demo:compare`)
```text
functions: {"position":{"x":1,"y":0},"movesRemaining":5,"score":0,"collectedTreasureIds":[],"status":"playing"}
class:     {"position":{"x":1,"y":0},"movesRemaining":5,"score":0,"collectedTreasureIds":[],"status":"playing"}
equal observations: true
north.describe() -> North
south.describe() -> South
```

## Worked Example 2 (`npm run demo:refactor`, lab starter)
12 passes: six shared assertions for `functions:` and six for `demo class:` (normal and blocked movement,
nested-copy independence, two initial states, completion then an ignored action, deferred direct receiver call).

## Caller inspection with the completed core class and the ORIGINAL connection (`npm run inspect`)
```text
[class] after registration: calls=0 state={"position":{"x":0,"y":0},"movesRemaining":6,...}
[class] port.send("east") threw TypeError: Cannot read properties of undefined (reading '#state')
[class] last known: calls=1 state={"position":{"x":0,"y":0},"movesRemaining":6,...}
```
The function adapter path reaches (1,0) with five moves and `calls=1`.
