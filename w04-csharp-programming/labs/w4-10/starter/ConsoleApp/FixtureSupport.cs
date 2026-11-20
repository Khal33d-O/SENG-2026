// Supplied fixture plumbing: loading, running and reporting one fixture file.
// Learners do not need to change this file.
using System.Text.Json;
using System.Text.Json.Nodes;
using TreasureRules;

namespace ConsoleApp;

/// <summary>
/// One fixture file. "state": null means "initial state". A fixture has either one "action"
/// (the shared F01-F11 format) or an "actions" array applied in order (learner-authored cases).
/// </summary>
public record Fixture(
    string Id,
    string Description,
    Board Board,
    GameState? State,
    MoveAction? Action,
    MoveAction?[]? Actions,
    JsonNode Expected);

/// <summary>The external result compared with "expected": { accepted, state, reason }.
/// Accepted is null only for the initial-state fixture (F01).</summary>
public record FixtureOutcome(bool? Accepted, GameState State, string? Reason);

public static class FixtureLoader
{
    /// <summary>The external contract's options: case-insensitive reading, camelCase writing.</summary>
    public static readonly JsonSerializerOptions Json = BoardJson.Options;

    public static Fixture Load(string[] args)
    {
        if (args.Length < 1)
            throw new ArgumentException("Usage: dotnet run --project ConsoleApp/ConsoleApp.csproj -- fixtures/F01.json");

        string path = args[0];
        JsonNode node = JsonNode.Parse(File.ReadAllText(path))
            ?? throw new JsonException($"{path} is empty.");

        // "board": "reference" -> board-reference.json next to the fixture.
        string boardName = node["board"]?.GetValue<string>() ?? "reference";
        string boardPath = Path.Combine(Path.GetDirectoryName(Path.GetFullPath(path))!, $"board-{boardName}.json");
        Board board = BoardJson.Parse(File.ReadAllText(boardPath));

        return new Fixture(
            node["id"]?.GetValue<string>() ?? Path.GetFileNameWithoutExtension(path),
            node["description"]?.GetValue<string>() ?? "",
            board,
            node["state"]?.Deserialize<GameState>(Json),
            node["action"]?.Deserialize<MoveAction>(Json),
            node["actions"]?.Deserialize<MoveAction?[]>(Json),
            node["expected"] ?? throw new JsonException($"{path} has no expected result."));
    }
}

public static class FixtureRunner
{
    /// <summary>Calls the rule library for the fixture's input and returns the actual outcome.</summary>
    public static FixtureOutcome Run(Fixture fixture)
    {
        if (fixture.Actions is { Length: > 0 } actions)
        {
            // Learner-authored sequence: apply each action to the state returned by the previous one.
            GameState current = fixture.State ?? Rules.InitialState(fixture.Board);
            MoveResult? last = null;
            foreach (MoveAction? action in actions)
            {
                last = Rules.EvaluateMove(fixture.Board, current, action);
                current = last.State;
            }
            return new FixtureOutcome(last!.Accepted, last.State, last.Reason);
        }

        if (fixture.State is null)
        {
            // F01: no action, just the initial state.
            return new FixtureOutcome(null, Rules.InitialState(fixture.Board), null);
        }

        MoveResult result = Rules.EvaluateMove(fixture.Board, fixture.State, fixture.Action);
        return new FixtureOutcome(result.Accepted, result.State, result.Reason);
    }
}

public static class FixtureReport
{
    /// <summary>Prints a readable report and compares the actual outcome with the fixture's expected object.</summary>
    public static int Print(Fixture fixture, FixtureOutcome actual)
    {
        GameState s = actual.State;
        Console.WriteLine($"Fixture: {fixture.Id} - {fixture.Description}");
        Console.WriteLine($"Accepted: {(actual.Accepted?.ToString() ?? "(initial state)")}  Reason: {actual.Reason ?? "(none)"}");
        Console.WriteLine($"Position: {s.Position.X},{s.Position.Y}  Score: {s.Score}  Moves: {s.MovesRemaining}  " +
                          $"Collected: [{string.Join(",", s.Collected)}]  Status: {s.Status}");

        // Parsed-object comparison: property order and formatting do not matter.
        JsonNode? actualNode = JsonSerializer.SerializeToNode(actual, FixtureLoader.Json);
        if (JsonNode.DeepEquals(actualNode, fixture.Expected))
        {
            Console.WriteLine($"PASS {fixture.Id}");
            return 0;
        }
        Console.WriteLine($"FAIL {fixture.Id}");
        Console.WriteLine("  expected: " + fixture.Expected.ToJsonString());
        Console.WriteLine("  actual:   " + actualNode?.ToJsonString());
        return 1;
    }
}
