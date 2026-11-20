// Colleague proposal A (Task 4). It compiles and passes `F02.json present 2`.
// Copy it over ConsoleApp/Program.cs in a DISPOSABLE copy only.
// W4.02 console: typed values and independent absence.
// Edit only the marked region. Keep loading, the supplied inputs and the final Check intact.
// Usage: dotnet run --project ConsoleApp/ConsoleApp.csproj -- fixtures/F02.json present 2.75
using PreflightSupport;
using TreasureRules;

var fixture = FixtureLoader.Load(args);
var result = FixtureRunner.Run(fixture);
var inputs = DisplaySelector.Select(args, result);

// Supplied display inputs (do not change these declarations).
MoveResult actual = result;                           // the returned rule result
int? optionalScore = inputs.OptionalScore;            // may be absent; a present score may be zero
MoveResult? optionalResult = inputs.OptionalResult;   // may be absent; a present result may be rejected
double measuredScore = inputs.MeasuredScore;          // diagnostic measurement, separate from the game score

Console.WriteLine("Fixture: " + fixture.Id);

// ===== BEGIN marked region: your declarations, conversions and guarded reads =====
Position position = new Position(actual.State.Position.X, actual.State.Position.Y);
int score = actual.State.Score;
string status = actual.State.Status;
Console.WriteLine($"Values: {position.X},{position.Y}|{score}|{status}");

double displayedScore = (int)measuredScore;
int wholePart = (int)measuredScore;         // explicitly requested whole part: truncates toward zero
Console.WriteLine($"Measurement: {displayedScore}");
Console.WriteLine($"Whole part: {wholePart}");

Console.Write("Optional score: ");
if (optionalScore.HasValue)
    Console.WriteLine(optionalScore.Value);
else
    Console.WriteLine("absent");

if (optionalResult is not null)
    Console.WriteLine($"Optional result: {optionalResult.Accepted}|{optionalResult.State.Status}");
else
    Console.WriteLine("Optional result: absent");
// ===== END marked region =====

return FixtureReport.Check(fixture, result);
