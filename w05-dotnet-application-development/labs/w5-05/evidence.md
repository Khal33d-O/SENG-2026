# W5.05 evidence · Preserve confirmed state when a save fails

Learner ID (synthetic, e.g. `learner-01`): ______  Work copy path: ______  Date: ______

## 1. Prediction (minute 10)

Owned code: `Api/SqliteStore.cs` → transaction lifetime and commit in `SaveAsync` (lines ___–___).
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
| GET before the failure (F02) | | |
| Failed East: status, code, requestId | | |
| GET after the failure (every field) | | |
| Starter result of check.py --case failure | | |
| Repaired result of check.py --case failure | | |
| Later explicit East (expected (2,0), 10, 4, [t1]) | | |

## 5. Passing run

```
paste the passing checker output
```

## 6. Explanation

Explain the await/save/failure/commit ordering and when disposal rolls back:

One discrepancy found in comparison and how I repaired it: ______

## 7. Knowledge check

Concept still needing practice: ______  Help received (who/what): ______
