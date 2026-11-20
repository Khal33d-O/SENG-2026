using PreflightSupport;
var fixture = FixtureLoader.Load(args);
var result = FixtureRunner.Run(fixture);
Console.WriteLine("Fixture: " + fixture.Id);
Console.WriteLine("Moves remaining: " + result.State.MovesRemaining);
return FixtureReport.Check(fixture, result);
