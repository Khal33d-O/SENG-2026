// VARIANT (builds, but prints 2 where 2.75 is required). Copy over ConsoleApp/Program.cs in a disposable copy; restore the original afterwards.
// W4.02 complete demonstration: typed values, a preserved measurement and independent absence.
// Usage: dotnet run --project ConsoleApp/ConsoleApp.csproj --no-build -- fixtures/F02.json present
using PreflightSupport;
using TreasureRules;

var fixture = FixtureLoader.Load(args);
var result = FixtureRunner.Run(fixture);
var inputs = DisplaySelector.Select(args, result);

MoveResult actual = result;
int? optionalScore = inputs.OptionalScore;
MoveResult? optionalResult = inputs.OptionalResult;
double measuredScore = inputs.MeasuredScore;

Console.WriteLine("Fixture: " + fixture.Id);

// Typed values from the RETURNED state, using the supplied Position construction form.
Position position = new Position(actual.State.Position.X, actual.State.Position.Y);
int score = actual.State.Score;
string status = actual.State.Status;
Console.WriteLine($"Values: {position.X},{position.Y}|{score}|{status}");

// Keep the full measurement; convert only the separately requested whole part.
int displayedScore = (int)measuredScore;
int wholePart = (int)measuredScore;
Console.WriteLine($"Measurement: {displayedScore}");
Console.WriteLine($"Whole part: {wholePart}");

// A nullable value: HasValue before Value.
Console.Write("Optional score: ");
if (optionalScore.HasValue)
    Console.WriteLine(optionalScore.Value);
else
    Console.WriteLine("absent");

// A nullable reference: its own null check before member access.
if (optionalResult is not null)
    Console.WriteLine($"Optional result: {optionalResult.Accepted}|{optionalResult.State.Status}");
else
    Console.WriteLine("Optional result: absent");

// Copy observation: assigning an int copies the value.
int copiedScore = score;
copiedScore = 99;
Console.WriteLine($"Value copy: {score}|{copiedScore}");

// Reference observation: assigning a record-class variable copies the reference.
Position samePosition = position;
Console.WriteLine("Same reference: " + ReferenceEquals(position, samePosition));
samePosition = new Position(9, 9);
Console.WriteLine("Same reference after new Position: " + ReferenceEquals(position, samePosition));
Console.WriteLine($"Original position: {position.X},{position.Y}");

return FixtureReport.Check(fixture, result);
