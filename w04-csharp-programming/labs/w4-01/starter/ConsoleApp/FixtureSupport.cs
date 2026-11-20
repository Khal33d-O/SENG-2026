// Supplied fixture support (reference support - leave this file unchanged).
// FixtureLoader reads a fixture file, FixtureRunner calls the rule library,
// FixtureReport compares the actual returned fields with the fixture's expectation.
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using TreasureRules;

namespace PreflightSupport;

/// <summary>One fixture: inputs (board, state, action) and an independently written expectation.</summary>
public record Fixture(
    string Id,
    string Description,
    Board Board,
    GameState? State,
    MoveAction? Action,
    JsonNode Expected);

public static class FixtureLoader
{
    /// <summary>
    /// Loads the fixture named by args[0], a path interpreted from the working directory.
    /// A fixture's "board" names a board file in the same folder: "reference" -> board-reference.json.
    /// </summary>
    public static Fixture Load(string[] args)
    {
        // Print numbers the same way on every machine (2.75, never 2,75).
        CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
        CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

        if (args.Length < 1)
        {
            Console.Error.WriteLine("Usage: dotnet run --project ConsoleApp/ConsoleApp.csproj -- fixtures/F02.json");
            Environment.Exit(2);
        }

        string path = args[0];
        if (!File.Exists(path))
        {
            Console.Error.WriteLine("Fixture file not found: " + path);
            Console.Error.WriteLine("Working directory: " + Directory.GetCurrentDirectory());
            Environment.Exit(2);
        }

        JsonNode node = JsonNode.Parse(File.ReadAllText(path))!;
        string boardName = (string)node["board"]!;
        string folder = Path.GetDirectoryName(Path.GetFullPath(path))!;
        string boardPath = Path.Combine(folder, "board-" + boardName + ".json");
        Board board = JsonSerializer.Deserialize<Board>(File.ReadAllText(boardPath), FixtureJson.Options)!;

        return new Fixture(
            (string)node["id"]!,
            (string?)node["description"] ?? "",
            board,
            node["state"]?.Deserialize<GameState>(FixtureJson.Options),
            node["action"]?.Deserialize<MoveAction>(FixtureJson.Options),
            node["expected"]!);
    }
}

public static class FixtureRunner
{
    /// <summary>
    /// Runs the fixture's action through the rule library and returns the library's MoveResult.
    /// A null fixture state means "initial state for this board" (F01).
    /// </summary>
    public static MoveResult Run(Fixture fixture)
    {
        GameState input = fixture.State ?? Rules.InitialState(fixture.Board);

        // F01 has no action: nothing is evaluated, so the result simply carries the input state
        // (the fixture expects "accepted": null; FixtureReport prints it that way).
        MoveResult result = new MoveResult(false, input, null);

        if (fixture.Action is not null)
        {
            MoveAction action = fixture.Action;
            // The library boundary: board, current state and one action in; a MoveResult out.
            // F03's input state already records F02's accepted east move; this call rejects south.
            result = Rules.EvaluateMove(fixture.Board, input, action);
        }

        return result;
    }
}

public static class FixtureReport
{
    /// <summary>
    /// Prints the complete actual and expected objects, then PASS or FAIL with the fixture id.
    /// Returns the process exit code: 0 for PASS, 1 for FAIL.
    /// </summary>
    public static int Check(Fixture fixture, MoveResult result)
    {
        bool evaluated = fixture.Action is not null;
        JsonObject actual = new()
        {
            ["accepted"] = evaluated ? result.Accepted : null,
            ["reason"] = evaluated ? result.Reason : null,
            ["state"] = JsonSerializer.SerializeToNode(result.State, FixtureJson.Options),
        };

        Console.WriteLine("Actual:   " + actual.ToJsonString());
        Console.WriteLine("Expected: " + fixture.Expected.ToJsonString());

        bool pass = JsonNode.DeepEquals(actual, fixture.Expected);
        Console.WriteLine((pass ? "PASS " : "FAIL ") + fixture.Id);
        return pass ? 0 : 1;
    }
}
