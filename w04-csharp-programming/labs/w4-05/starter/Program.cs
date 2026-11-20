// Supplied runner. The fixed checks and their expected values are independent of your code:
// do not edit them to agree with faulty output. Add your one labelled check where marked.
using System.Text.Json;
using TreasureRules;

int passed = 0;
int failed = 0;
MoveAction east = new("move", "east");

// ---- Open board: east from (0,0) reaches (1,0) and spends one move -------------------------
FixedBoardProvider openProvider = new FixedBoardProvider(Boards.Open());
PreviewEngine openEngine = new PreviewEngine(openProvider);
GameState openStart = Rules.InitialState(Boards.Open());
string openStartBefore = Json(openStart);

MoveResult openFirst = openEngine.Preview(openStart, east);
MoveResult openSecond = openEngine.Preview(openStart, east);

Check("open east: accepted", openFirst.Accepted, true);
Check("open east: position", Json(openFirst.State.Position), Json(new Position(1, 0)));
Check("open east: moves remaining", openFirst.State.MovesRemaining, 5);
Check("open east: reason", openFirst.Reason, null);
Check("open east: score/status", $"{openFirst.State.Score}/{openFirst.State.Status}", "0/playing");

// ---- Blocked board: a wall at (1,0) rejects east and preserves the state -------------------
FixedBoardProvider blockedProvider = new FixedBoardProvider(Boards.Blocked());
PreviewEngine blockedEngine = new PreviewEngine(blockedProvider);
GameState blockedStart = Rules.InitialState(Boards.Blocked());
string blockedStartBefore = Json(blockedStart);

MoveResult blockedFirst = blockedEngine.Preview(blockedStart, east);
MoveResult blockedSecond = blockedEngine.Preview(blockedStart, east);

Check("blocked east: accepted", blockedFirst.Accepted, false);
Check("blocked east: position", Json(blockedFirst.State.Position), Json(new Position(0, 0)));
Check("blocked east: moves remaining", blockedFirst.State.MovesRemaining, 6);
// The rule reason is the contract's WALL; an API would report it as ILLEGAL_ACTION.
Check("blocked east: reason", blockedFirst.Reason, Rules.Wall);
Check("blocked east: score/status", $"{blockedFirst.State.Score}/{blockedFirst.State.Status}", "0/playing");

// ---- Repeatability, input preservation, provider use and a direct baseline -----------------
Check("open: repeated previews agree", Json(openSecond), Json(openFirst));
Check("blocked: repeated previews agree", Json(blockedSecond), Json(blockedFirst));
Check("open: input state preserved", Json(openStart), openStartBefore);
Check("blocked: input state preserved", Json(blockedStart), blockedStartBefore);
Check("open: supplied provider used (Calls after two previews)", openProvider.Calls, 2);
Check("blocked: supplied provider used (Calls after two previews)", blockedProvider.Calls, 2);
Check("open: matches direct same-board baseline",
    Json(openFirst), Json(Rules.EvaluateMove(Boards.Open(), Rules.InitialState(Boards.Open()), east)));
Check("blocked: matches direct same-board baseline",
    Json(blockedFirst), Json(Rules.EvaluateMove(Boards.Blocked(), Rules.InitialState(Boards.Blocked()), east)));

// ---- LEARNER CHECK (task 4) -----------------------------------------------------------------
// Add ONE clearly labelled check here, after the fixed checks and before the summary.
// Use a new board, provider and engine, preview one other cardinal move twice from the same
// valid initial state, and compare the accepted flag and remaining moves with your prediction.

// ---- Summary -------------------------------------------------------------------------------
int total = passed + failed;
Console.WriteLine();
Console.WriteLine($"Checks: {passed}/{total} passed");
return failed == 0 ? 0 : 1;

// ---- Supplied observation helpers ----------------------------------------------------------

// Serialises any value as camelCase JSON so whole results can be compared as text.
static string Json(object? value) => JsonSerializer.Serialize(value, FixtureJson.Options);

// Prints one PASS/FAIL line and counts it.
void Check<T>(string label, T actual, T expected)
{
    if (EqualityComparer<T>.Default.Equals(actual, expected))
    {
        passed++;
        Console.WriteLine($"PASS {label}");
    }
    else
    {
        failed++;
        Console.WriteLine($"FAIL {label}: expected {Show(expected)}, actual {Show(actual)}");
    }
}

static string Show(object? value) => value switch
{
    null => "null",
    bool b => b ? "true" : "false",
    string s => $"\"{s}\"",
    _ => value.ToString()!,
};
