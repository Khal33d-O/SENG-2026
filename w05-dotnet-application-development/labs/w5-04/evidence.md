# W5.04 evidence · Map, save and reload one session

Learner ID (synthetic, e.g. `learner-01`): ______  Work copy path: ______  Date: ______

## 1. Prediction (minute 10)

Owned code: `Api/GameDb.cs` → `SessionMapping.ToRow`; `Api/SqliteStore.cs` → `LoadAsync`, `SaveAsync` (lines ___–___).
Predicted result of the checker on the unchanged starter: ______

## 2. Failed observation (retain it)

```
paste the starter's failing output here
```

## 3. My changed functions

```
paste your changed code
```

## 4. Annotated request/storage trace

| Item | Observed value | What it means |
|---|---|---|
| Exact absolute GAME_DB path | | |
| --migrate output | | |
| Starter: create response (expected 500 SAVE_FAILED) | | |
| Recorded session ID after East | | |
| Row seen in Sessions (SessionId, BoardId, StateJson) | | |
| GET of the original ID after restart (every field) | | |
| --migrate again while stopped | | |

## 5. Passing run

```
paste the passing checker output
```

## 6. Explanation

Explain the conversion between the envelope and StateJson:

One discrepancy found in comparison and how I repaired it: ______

## 7. Knowledge check

Concept still needing practice: ______  Help received (who/what): ______
