// API skeleton: the integration seam for Week 5. Only the health route is live.
// Session creation, storage and action routes are Week 5 work - do not claim they exist yet.
using TreasureRules;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// The only live route in this skeleton.
app.MapGet("/health", () => Results.Text("Healthy"));

app.Run();

/// <summary>
/// The seam the future session API will call. The browser sends only an action; the API loads the
/// trusted stored state itself and passes (board, storedState, action) to the rule library.
/// Future HTTP mapping (Week 5, see API-CONTRACT.md):
///   INVALID_ACTION (malformed / unknown / missing direction) -> 400 INVALID_REQUEST
///   WALL or EDGE                                             -> 409 ILLEGAL_ACTION
///   GAME_COMPLETE                                            -> 409 GAME_COMPLETE
///   accepted                                                 -> 200 with the new state
/// </summary>
public static class RuleBoundary
{
    public static MoveResult Apply(Board board, GameState storedState, MoveAction? action) =>
        Rules.EvaluateMove(board, storedState, action);
}
