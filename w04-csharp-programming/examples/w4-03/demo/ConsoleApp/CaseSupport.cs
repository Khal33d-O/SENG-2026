// Supplied assertion transport (leave unchanged): loads a case file, calls the rule method,
// and compares the actual result with an independently written expectation.
// Every case produces three assertions: first result, repeated result and input preservation.
using System.Text.Json;
using System.Text.Json.Nodes;
using TreasureRules;

namespace CaseSupport;

public static class CaseRunner
{
    public static int Run(string[] args)
    {
        if (args.Length < 1)
        {
            Console.Error.WriteLine("Usage: dotnet run --project ConsoleApp/ConsoleApp.csproj -- fixtures/candidate-cases.json");
            return 2;
        }
        string path = args[0];
        if (!File.Exists(path))
        {
            Console.Error.WriteLine("Case file not found: " + path + " (working directory: " + Directory.GetCurrentDirectory() + ")");
            return 2;
        }

        JsonNode file = JsonNode.Parse(File.ReadAllText(path))!;
        string kind = (string?)file["kind"] ?? "candidate";
        Board reference = LoadReferenceBoard(path);
        JsonArray cases = file["cases"]!.AsArray();

        int passed = 0, total = 0;
        foreach (JsonNode? c in cases)
        {
            Board board = BoardFor(reference, c!);
            string id = (string)c!["id"]!;
            string description = (string?)c["description"] ?? "";
            bool first, repeated, preserved;
            string actualText, expectedText, repeatedText;

            if (kind == "position")
            {
                Position candidate = c["candidate"]!.Deserialize<Position>(FixtureJson.Options)!;
                bool expected = (bool)c["expected"]!;
                string before = Snapshot(board, candidate);
                bool actual = PositionRules.IsOpenPosition(board, candidate);
                bool again = PositionRules.IsOpenPosition(board, candidate);
                preserved = before == Snapshot(board, candidate);
                first = actual == expected;
                repeated = again == expected;
                actualText = actual.ToString(); repeatedText = again.ToString(); expectedText = expected.ToString();
            }
            else
            {
                Position[] candidates = c["candidates"]!.Deserialize<Position[]>(FixtureJson.Options)!;
                Position? expected = c["expected"]?.Deserialize<Position>(FixtureJson.Options);
                string before = Snapshot(board, candidates);
                Position? actual = CandidateRules.FindFirstOpenPosition(board, candidates);
                Position? again = CandidateRules.FindFirstOpenPosition(board, candidates);
                preserved = before == Snapshot(board, candidates);
                first = actual == expected;   // record equality compares X and Y
                repeated = again == expected;
                actualText = Show(actual); repeatedText = Show(again); expectedText = Show(expected);
            }

            int ok = (first ? 1 : 0) + (repeated ? 1 : 0) + (preserved ? 1 : 0);
            passed += ok;
            total += 3;
            Console.WriteLine($"{id} {description}");
            Console.WriteLine($"    actual={actualText} expected={expectedText} repeated={repeatedText} preserved={preserved} -> {(ok == 3 ? "PASS" : "FAIL")}");
        }

        int failures = total - passed;
        string label = kind == "position" ? "Position" : "Candidate";
        Console.WriteLine($"{label} assertions: {passed}/{total}; cases={cases.Count}; failures={failures}");
        if (total == 0)
        {
            Console.WriteLine("No assertions ran: check the case path and that the file contains cases.");
            return 1;
        }
        return failures == 0 ? 0 : 1;
    }

    // Each case may override the reference board's width, height or walls.
    private static Board BoardFor(Board reference, JsonNode c)
    {
        Board board = reference;
        if (c["width"] is JsonNode w) board = board with { Width = (int)w };
        if (c["height"] is JsonNode h) board = board with { Height = (int)h };
        if (c["walls"] is JsonNode walls) board = board with { Walls = walls.Deserialize<Position[]>(FixtureJson.Options)! };
        return board;
    }

    private static Board LoadReferenceBoard(string casePath)
    {
        string folder = Path.GetDirectoryName(Path.GetFullPath(casePath))!;
        string text = File.ReadAllText(Path.Combine(folder, "board-reference.json"));
        return JsonSerializer.Deserialize<Board>(text, FixtureJson.Options)!;
    }

    // Before/after record of the inputs: board plus candidate data, serialised in order.
    private static string Snapshot(Board board, object candidates) =>
        JsonSerializer.Serialize(board, FixtureJson.Options) + JsonSerializer.Serialize(candidates, FixtureJson.Options);

    private static string Show(Position? p) => p is null ? "null" : $"({p.X},{p.Y})";
}
