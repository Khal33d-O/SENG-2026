# W4.05 demos — extract the provider interface and substitute it

From this directory:

```bash
dotnet run --project Probe.csproj --disable-build-servers
```

Observed: Demo 1 (`HardCodedEngine`, which constructs its own `FixedBoardProvider(Boards.Open())`) accepts east;
Demo 2 supplies `new FixedBoardProvider(Boards.Open())` and `new FixedBoardProvider(Boards.Blocked())` to separate
`PreviewEngine`s: open east → (1,0), 5 moves; blocked east → rejected `WALL`, (0,0), 6 moves; repeated results
agree, inputs preserved, `Calls` is 2 after two previews, and both match the direct same-board baseline.
Final line: `Demo checks: 17/17 passed`, exit 0.

| File | Role |
|---|---|
| `IBoardProvider.cs` | The extracted contract: `Board GetBoard();` |
| `FixedBoardProvider.cs` | Deterministic implementation with the `Calls` counter |
| `HardCodedEngine.cs` | Before: the engine chooses its own collaborator and board |
| `Engine.cs` | After: `PreviewEngine` receives an `IBoardProvider` and calls `Rules.EvaluateMove(provider.GetBoard(), state, action)` |
| `Program.cs` | Runs both demos with supplied observation helpers |

Read `HardCodedEngine.cs` and `Engine.cs` side by side: the dependency field type and the construction
boundary change; the call to `Rules.EvaluateMove` stays. Do not mutate a board between repeated calls.
