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
Console.WriteLine("Typed report: pending");
// ===== END marked region =====

return FixtureReport.Check(fixture, result);
