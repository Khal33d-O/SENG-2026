# W4.01 worked examples — the complete demo

`demo/` is the complete demonstration project used in Worked Examples 1 and 2. Work in a disposable copy.

## Worked Example 1: Build the supplied console and library

From `demo/`:

```bash
dotnet sln Preflight.slnx list
dotnet restore Preflight.slnx
dotnet build Preflight.slnx --no-restore --disable-build-servers
dotnet run --project ConsoleApp/ConsoleApp.csproj --no-build -- fixtures/F02.json
```

`demo/ConsoleApp/Program.cs` is the complete entry code:

```csharp
using PreflightSupport;
var fixture = FixtureLoader.Load(args);
var result = FixtureRunner.Run(fixture);
Console.WriteLine("Fixture: " + fixture.Id);
Console.WriteLine("Moves remaining: " + result.State.MovesRemaining);
return FixtureReport.Check(fixture, result);
```

Observed output (F02):

```text
Fixture: F02
Moves remaining: 5
Actual:   {"accepted":true,"reason":null,"state":{"position":{"x":1,"y":0},"movesRemaining":5,"score":0,"collected":[],"status":"playing"}}
Expected: {"accepted":true,"reason":null,"state":{"position":{"x":1,"y":0},"movesRemaining":5,"score":0,"collected":[],"status":"playing"}}
PASS F02
```

## Worked Example 2: Correct a compiler diagnostic

Save `Program.cs` outside the project, remove the semicolon after `result.State.MovesRemaining)` and run
`dotnet build Preflight.slnx --no-restore --disable-build-servers`. Observed:

```text
ConsoleApp\Program.cs(5,69): error CS1002: ; expected
```

(The book's recording shows `Program.cs(9,69)` because its copy had comment lines above; the line follows
your edited file.) Restore the semicolon, rebuild, and run `fixtures/F03.json`: `Moves remaining: 5`,
`PASS F03`. Then open `ConsoleApp/FixtureSupport.cs` and find
`result = Rules.EvaluateMove(fixture.Board, input, action);`.

The shared fixtures in `demo/fixtures/` are byte-identical copies of `source/shared/fixtures/treasure/`.
The board field the book calls `initialMoveBudget` is `initialMoves` in the shared contract.
