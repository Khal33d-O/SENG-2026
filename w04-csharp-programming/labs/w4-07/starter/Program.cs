// SUPPLIED: the W4.07 probe. Do not edit; you change ActionBoundary.cs only.
//
// Usage (from the repository's source/ folder):
//   dotnet run --project learner/units/w04-csharp-programming/labs/w4-07/starter/Probe.csproj -- <mode>
// Modes: fault | invalid | missing | west | east | unexpected
//
// There is deliberately NO try/catch here. An unexpected exception should stop the
// console and print its stack trace, so a programming fault stays visible.
using TreasureRules;

string[] modes = ["fault", "invalid", "missing", "west", "east", "unexpected"];
if (args.Length != 1 || !modes.Contains(args[0]))
{
    Console.WriteLine("usage: dotnet run --project <path>/Probe.csproj -- fault|invalid|missing|west|east|unexpected");
    return 2;
}

string mode = args[0];
Board board = Boards.Reference();
GameState state = Rules.InitialState(board);
string original = Describe(state); // snapshot of the input state
Console.WriteLine($"mode={mode}");
Console.WriteLine($"before: {original}");

switch (mode)
{
    case "fault":
        // Demo 1: the seeded lookup. Predict index and Length before running.
        Console.WriteLine($"treasures on board: {board.Treasures.Length}");
        string label = ActionBoundary.TreasureLabel(board);
        Console.WriteLine($"first treasure label: {label}");
        break;

    case "invalid":
        // Demo 2: an unknown direction is an expected player error.
        Show(ActionBoundary.Apply(board, state, "upwards"), "upwards");
        break;

    case "missing":
        // A missing direction (null) is also an expected player error.
        Show(ActionBoundary.Apply(board, state, null), null);
        break;

    case "west":
        // A well-formed request that the rules reject: west of (0,0) is off the board.
        Show(ActionBoundary.Apply(board, state, "west"), "west");
        break;

    case "east":
        // A normal accepted move.
        Show(ActionBoundary.Apply(board, state, "east"), "east");
        break;

    case "unexpected":
        // DELIBERATE PROGRAMMING FAULT: the trusted board dependency is missing.
        // This is not a player mistake, so it must NOT become a game result.
        Board missingBoard = null!;
        Show(ActionBoundary.Apply(missingBoard, state, "east"), "east");
        break;
}

return 0;

// Prints the boundary result, then what the rule engine itself says, so both
// vocabularies are visible: boundary categories (INVALID_REQUEST, ILLEGAL_ACTION)
// and contract rule reasons (INVALID_ACTION, EDGE, WALL).
void Show(MoveResult result, string? direction)
{
    Console.WriteLine($"boundary: accepted={result.Accepted} reason={result.Reason ?? "none"}");
    Console.WriteLine($"after:  {Describe(result.State)}");
    MoveResult rule = Rules.EvaluateMove(board, state, new MoveAction("move", direction));
    Console.WriteLine($"rule engine reason: {rule.Reason ?? "none"}");
    Console.WriteLine($"input state unchanged: {Describe(state) == original}");
}

static string Describe(GameState s) =>
    $"x={s.Position.X} y={s.Position.Y} moves={s.MovesRemaining} score={s.Score} " +
    $"collected=[{string.Join(",", s.Collected)}] status={s.Status}";
