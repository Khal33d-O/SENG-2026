// Console demonstration: run one fixture through the C# rule library.
// Usage (from the project folder): dotnet run --project ConsoleApp/ConsoleApp.csproj -- fixtures/F07.json
using System.Text.Json; // JsonSerializer lives here
using ConsoleApp;

Fixture fixture = FixtureLoader.Load(args);
FixtureOutcome actual = FixtureRunner.Run(fixture);

// Line 1 is the external JSON result that compare.py reads (camelCase field names).
// W4.10 TODO: replace "{}" with the serialization of actual using the supplied camelCase options
// (FixtureLoader.Json). Read Mapping.cs.example first.
string json = "{}";
Console.WriteLine(json);

// The remaining lines are a human-readable report and the console's own fixture check.
return FixtureReport.Print(fixture, actual);
