// Caller that assigns the property directly instead of requesting an operation.
// With public_set.cs it compiles and prints -9; with private_set.cs it fails with CS0272;
// with private_field.cs it fails with CS0200.
var session = new GameSession(2);
session.MovesRemaining = -9;
Console.WriteLine(session.MovesRemaining);
