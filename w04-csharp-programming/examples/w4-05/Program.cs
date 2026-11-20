// W4.05 complete demo: hard-coded dependency versus a supplied (composed) provider.
// Run from this directory:  dotnet run --project Probe.csproj --disable-build-servers
using System.Text.Json;
using TreasureRules;

int passed = 0;
int failed = 0;
MoveAction east = new("move", "east");

// ---- Demo 1: the hard-coded engine always uses the open board ------------------------------
Console.WriteLine("Demo 1: HardCodedEngine (constructs its own FixedBoardProvider(Boards.Open()))");
HardCodedEngine hardCoded = new HardCodedEngine();
MoveResult hardEast = hardCoded.Preview(Rules.InitialState(Boards.Open()), east);
Console.WriteLine($"  east -> {Json(hardEast)}");
Check("hard-coded east: accepted on its own open board", hardEast.Accepted, true);
Console.WriteLine("  (There is no way to give HardCodedEngine the blocked board without editing HardCodedEngine.cs.)");
Console.WriteLine();

// ---- Demo 2: the caller supplies a deterministic provider to PreviewEngine -----------------
Console.WriteLine("Demo 2: PreviewEngine with supplied providers");
foreach ((string name, Board board) in new[] { ("open", Boards.Open()), ("blocked", Boards.Blocked()) })
{
    // Composition happens here, at the call site: ordinary new expressions, no container.
    FixedBoardProvider provider = new FixedBoardProvider(board);
    IBoardProvider supplied = provider;
    PreviewEngine engine = new PreviewEngine(supplied);

    GameState start = Rules.InitialState(board);
    string startBefore = Json(start);
    MoveResult first = engine.Preview(start, east);
    MoveResult second = engine.Preview(start, east);
    Console.WriteLine($"  {name} east -> {Json(first)}");

    bool shouldMove = name == "open";
    Check($"{name} east: accepted", first.Accepted, shouldMove);
    Check($"{name} east: position", Json(first.State.Position), Json(shouldMove ? new Position(1, 0) : new Position(0, 0)));
    Check($"{name} east: moves remaining", first.State.MovesRemaining, shouldMove ? 5 : 6);
    Check($"{name} east: reason", first.Reason, shouldMove ? null : Rules.Wall);
    Check($"{name}: repeated previews agree", Json(second), Json(first));
    Check($"{name}: input state preserved", Json(start), startBefore);
    Check($"{name}: supplied provider used twice", provider.Calls, 2);
    Check($"{name}: matches direct same-board baseline", Json(first), Json(Rules.EvaluateMove(board, Rules.InitialState(board), east)));
}

Console.WriteLine();
Console.WriteLine($"Demo checks: {passed}/{passed + failed} passed");
return failed == 0 ? 0 : 1;

// ---- Supplied observation helpers ----------------------------------------------------------
static string Json(object? value) => JsonSerializer.Serialize(value, FixtureJson.Options);

void Check<T>(string label, T actual, T expected)
{
    bool ok = EqualityComparer<T>.Default.Equals(actual, expected);
    if (ok) passed++; else failed++;
    Console.WriteLine(ok ? $"  PASS {label}" : $"  FAIL {label}: expected {expected}, actual {actual}");
}
