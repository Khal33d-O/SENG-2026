# W4.07 runnable debugger demonstration

Known-good teaching aid **except** the clearly marked seeded fault in `TreasureLabel` and the expected-input
`throw` in `Apply` (the two things the lab repairs). From this folder:

```bash
dotnet run --project Probe.csproj -- fault
```

## Demo 1: reproduce and locate the failing path

Predict `index` and `Length` before running. Observed (SDK 10.0.102, paths shortened):

```text
mode=fault
before: x=0 y=0 moves=6 score=0 collected=[] status=playing
treasures on board: 1
Unhandled exception. System.IndexOutOfRangeException: Index was outside the bounds of the array.
   at TreasureRules.ActionBoundary.TreasureLabel(Board board) in ...\ActionBoundary.cs:line 19
   at Program.<Main>$(String[] args) in ...\Program.cs:line 30
```

Start with the first frame in our own source (`TreasureLabel`, line 19), then its caller (`Program`, line 30).

**Breakpoint.** Open this folder in VS Code with the C# extension; `.vscode/launch.json` ("W4.07 fault mode")
builds the Debug assembly and runs `fault`. Set a breakpoint on `return board.Treasures[index].Id;`, start
debugging, confirm the breakpoint is bound (solid red), and inspect Locals: `index = 1`, `board.Treasures.Length = 1`.
The Call Stack shows `Program` → `TreasureLabel`. Step Over: the read executes and `IndexOutOfRangeException` is
raised. (Visual Studio or Rider: same steps with their C# debugger.)

Repair for this known one-treasure board: `index = 0`; rebuild, repeat `fault` → `first treasure label: t1`; then
check `east` and `west`.

## Demo 2: handle expected failures without hiding unexpected defects

`dotnet run --project Probe.csproj -- invalid` traces `Apply` with `upwards`: the demo throws
`ArgumentException: Unknown direction`. Replacing that branch with `return new(false, state, "INVALID_REQUEST");`
gives `invalid`/`missing` → `INVALID_REQUEST`, x=0, six moves; `west` → `ILLEGAL_ACTION` (rule `EDGE`), unchanged;
`east` → accepted, x=1, five moves. `unexpected` (deliberate null board) stays an unhandled
`NullReferenceException` whose first frame is `Rules.EvaluateMove`. Do not wrap `Apply` in a broad catch.
