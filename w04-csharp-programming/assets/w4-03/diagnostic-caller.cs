// W4.03 diagnostic caller (supplied for Task 3/4; copied over caller-copy/ConsoleApp/Program.cs).
// Requirement: for each case, select the first open position from its PlannedCandidates.
// DisplayCandidates is a separate preview order. The JSON construction and the record below only
// transport those inputs. One comparison passes and one fails; the cause is not named for you.
using System.Text.Json;
using TreasureRules;

string path = args.Length > 0 ? args[0] : "fixtures/diagnostic-cases.json";
string folder = Path.GetDirectoryName(Path.GetFullPath(path))!;
Board board = JsonSerializer.Deserialize<Board>(
    File.ReadAllText(Path.Combine(folder, "board-reference.json")), FixtureJson.Options)!;
DiagnosticCase[] cases = JsonSerializer.Deserialize<DiagnosticCase[]>(File.ReadAllText(path), FixtureJson.Options)!;

int passed = 0;
foreach (DiagnosticCase c in cases)
{
    Position? actual = CandidateRules.FindFirstOpenPosition(board, c.DisplayCandidates);
    bool ok = actual == c.Expected;
    if (ok) passed++;
    Console.WriteLine($"{c.Id}: actual={Show(actual)} expected={Show(c.Expected)} -> {(ok ? "PASS" : "FAIL")}");
}
Console.WriteLine($"Diagnostic comparisons: {passed}/{cases.Length}");
return passed == cases.Length ? 0 : 1;

static string Show(Position? p) => p is null ? "null" : $"({p.X},{p.Y})";

/// <summary>Transport record for one diagnostic case.</summary>
record DiagnosticCase(string Id, Position[] PlannedCandidates, Position[] DisplayCandidates, Position? Expected);
