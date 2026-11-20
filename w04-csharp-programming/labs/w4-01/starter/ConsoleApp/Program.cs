// W4.01 console: load a fixture, run it through the supplied rule library, report, compare.
// Edit only the report line marked below. Keep loading, running and the final Check intact.
using PreflightSupport;

var fixture = FixtureLoader.Load(args);
var result = FixtureRunner.Run(fixture);

Console.WriteLine("Fixture: " + fixture.Id);
// TODO (Task 2): replace this pending line with the two returned-state report lines.
Console.WriteLine("Result report: pending");

return FixtureReport.Check(fixture, result);
