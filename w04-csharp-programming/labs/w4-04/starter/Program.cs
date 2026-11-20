// W4.04 supplied assertion runner (leave unchanged).
// Usage: dotnet run --project Session.csproj -- fixtures/session-cases.json
// For every case: construct a session plus an independent one, check the initial state, then for each
// operation check result, remaining, reserved, rejectedPreserved, invariant and independent.
using System.Text.Json;

if (args.Length < 1)
{
    Console.Error.WriteLine("Usage: dotnet run --project Session.csproj -- fixtures/session-cases.json");
    return 2;
}
var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
CaseFile file = JsonSerializer.Deserialize<CaseFile>(File.ReadAllText(args[0]), options)!;

int passed = 0, total = 0;
void Check(string label, bool ok, string detail)
{
    total++;
    if (ok) passed++;
    Console.WriteLine($"    {(ok ? "ok  " : "FAIL")} {label}: {detail}");
}

foreach (SessionCase c in file.Cases)
{
    Console.WriteLine($"{c.Id} {c.Description} (new GameSession({c.InitialMoves}))");
    var session = new GameSession(c.InitialMoves);
    var other = new GameSession(c.InitialMoves);   // an independently constructed session
    int otherRemaining = other.MovesRemaining, otherReserved = other.ReservedMoves;

    Check("initial remaining", session.MovesRemaining == c.Expected.Remaining,
          $"actual {session.MovesRemaining}, expected {c.Expected.Remaining}");
    Check("initial reserved", session.ReservedMoves == c.Expected.Reserved,
          $"actual {session.ReservedMoves}, expected {c.Expected.Reserved}");

    foreach (Step step in c.Steps)
    {
        int beforeRemaining = session.MovesRemaining, beforeReserved = session.ReservedMoves;
        bool result = step.Op switch
        {
            "reserve" => session.TryReserveMoves(step.Amount),
            "spend" => session.TrySpendMoves(step.Amount),
            _ => throw new InvalidOperationException("Unknown op: " + step.Op),
        };
        int remaining = session.MovesRemaining, reserved = session.ReservedMoves;
        Console.WriteLine($"  {step.Op}({step.Amount}) -> {result}, remaining {remaining}, reserved {reserved}");
        Check("result", result == step.Expected.Result, $"actual {result}, expected {step.Expected.Result}");
        Check("remaining", remaining == step.Expected.Remaining, $"actual {remaining}, expected {step.Expected.Remaining}");
        Check("reserved", reserved == step.Expected.Reserved, $"actual {reserved}, expected {step.Expected.Reserved}");
        Check("rejectedPreserved", result || (remaining == beforeRemaining && reserved == beforeReserved),
              result ? "accepted" : $"before ({beforeRemaining},{beforeReserved}) after ({remaining},{reserved})");
        Check("invariant", 0 <= reserved && reserved <= remaining, $"0 <= {reserved} <= {remaining}");
        Check("independent", other.MovesRemaining == otherRemaining && other.ReservedMoves == otherReserved,
              $"other session ({other.MovesRemaining},{other.ReservedMoves})");
    }
}

Console.WriteLine($"Session assertions: {passed}/{total}; cases={file.Cases.Length}; failures={total - passed}");
return total > 0 && passed == total ? 0 : 1;

record CaseFile(SessionCase[] Cases);
record SessionCase(string Id, string Description, int InitialMoves, State Expected, Step[] Steps);
record State(int Remaining, int Reserved);
record Step(string Op, int Amount, StepResult Expected);
record StepResult(bool Result, int Remaining, int Reserved);
