# Handover for Week 5 (template — complete before the end of P4)

## Setup
Tools and versions: ____

## Run and check (exact commands from this folder)
```bash
dotnet test Tests/Rules.Tests.csproj
python3 compare.py
dotnet run --project ConsoleApp/ConsoleApp.csproj -- fixtures/F07.json
dotnet build ApiSkeleton/ApiSkeleton.csproj
```
Actual results: ____

## Library seam
Method accepting `(board, storedState, action)` and returning `(accepted, state, reason)` without mutating inputs: ____
Integration seam in the API skeleton: ____ · How the library is referenced: ____
Live routes today: ____ (do not claim session routes)

## Future HTTP translation (Week 5)
| Rule outcome | HTTP |
|---|---|
| malformed input | ____ |
| illegal action (wall/edge) | ____ |
| completed game | ____ |
| accepted | ____ |

The browser sends: ____ · The API obtains: ____ · External field naming: ____

## Example fixture command and its actual output
____
