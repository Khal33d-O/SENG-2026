# W4.09 evidence template

Learner: `learner-__`

## 1. Prediction
For each file, predicted `loaded`/`error`, release message (yes/no) and exit code:
`board.json` ____ · `invalid.json` ____ · `missing.json` ____ · `board.json cancel` ____

## 2. Starter observation
____

## 3. My LoadAsync
```csharp

```

## 4. Observed outcomes
| Command | Output | Exit code |
|---|---|---|
| `dotnet run -- board.json` | | |
| `dotnet run -- invalid.json` | | |
| `dotnet run -- missing.json` | | |
| `dotnet run -- board.json cancel` (optional) | | |

## 5. Explanation
Type of the awaited value vs the Task: ____
Acquired resource (file/line) and its release (file/line); what the release log does and does not prove: ____
Why missing.json prints no release message: ____
Why cancellation is not invalid JSON (optional): ____

## 6. Help used
____
