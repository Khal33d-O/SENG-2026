# W4.05 · Substitute a deterministic board provider

**Session:** W4.05 Interfaces and composition · **Module:** 120 minutes (preparation and teaching 47,
one challenge 45, explanation and repair 20, individual knowledge check 8)

The previous class hid invalid state changes behind operations. Today the engine needs a collaborator that
supplies a board. You change how it receives that collaborator, while keeping the supplied move rules intact.

## Outcomes

* Describe interfaces and composition.
* Compare a hard-coded dependency with a supplied implementation.
* Write a data-provider interface and deterministic implementation.
* Create a component that uses that implementation without changing its domain logic.

## Supplied and owned

| Supplied (keep unchanged) | You own |
|---|---|
| `Probe.csproj`, `global.json`, `Models.cs` (Board, GameState, MoveAction, MoveResult), `Boards.cs`, `Rules.cs`, `FixtureJson.cs` | `IBoardProvider.cs` — the interface signature |
| `Program.cs` — the runner, its fixed independent expectations and observation helpers | `FixedBoardProvider.cs` — stored board, `GetBoard`, `Calls` |
| Complete demos: [../../examples/w4-05/](../../examples/w4-05/README.md) | `PreviewEngine.cs` — interface field, constructor assignment, provider call; one labelled check in `Program.cs` |

`using TreasureRules;` makes the namespace's names available. `Rules.InitialState(board)` constructs the
initial state; `Rules.EvaluateMove(board, state, action)` returns accepted flag, resulting state and reason.

## Prerequisites

Prepared .NET SDK 10.0.401 (local `global.json` rolls forward from 10.0.100). No NuGet test framework.

## Setup

Copy the entire starter directory, then from `starter`:

```bash
dotnet run --project Probe.csproj --disable-build-servers
```

**Initial behaviour.** The starter compiles but ignores the supplied provider and always uses the open
board. Expect failed blocked-board and provider-use checks (`Checks: 11/18 passed`) and exit code 1. A missing
SDK or compiler error is a setup problem, not that intended starting result.

## Contract

`Boards.Open()` starts at (0,0) with six moves and allows east to (1,0). `Boards.Blocked()` adds a wall at
(1,0); east must then reject with unchanged position and six moves. The book calls this rejection
`ILLEGAL_ACTION`; the shared rule contract's reason is `WALL` (an API maps WALL/EDGE to 409 ILLEGAL_ACTION),
so the runner checks `WALL`. Neither east example earns score.

The provider contract:

```csharp
public interface IBoardProvider
{
    Board GetBoard();
}
```

`FixedBoardProvider` returns the board given to its constructor on every call (no deep copy) and its readable
`Calls` count increments once per request. `PreviewEngine` accepts an `IBoardProvider`, retains it and obtains
a board from it once per `Preview`:

```csharp
private readonly IBoardProvider provider;
```

```csharp
public PreviewEngine(IBoardProvider provider)
{
    this.provider = provider;
}
```

```csharp
public MoveResult Preview(GameState state, MoveAction action)
{
    return Rules.EvaluateMove(provider.GetBoard(), state, action);
}
```

Compare the construction decisions in the demos:

```csharp
// Inside HardCodedEngine:
private readonly FixedBoardProvider provider =
    new FixedBoardProvider(Boards.Open());
// At the call site for PreviewEngine:
IBoardProvider supplied = new FixedBoardProvider(Boards.Blocked());
PreviewEngine engine = new PreviewEngine(supplied);
```

## Work through one substitution

1. **Predict and run — 5 minutes.** Record east acceptance, position and remaining moves for each board.
   Read the unfinished files and mark the hard-coded board call. Keep the initial output.
2. **Write the provider — 15 minutes.** Add the interface signature, retain the constructor's board and
   implement the public operation with its call counter (demo for syntax):

   ```csharp
   public class FixedBoardProvider : IBoardProvider
   {
       private readonly Board board;
       public int Calls { get; private set; }
       public FixedBoardProvider(Board board) { this.board = board; }
       public Board GetBoard()
       {
            Calls++;
            return board;
       }
   }
   ```
3. **Supply it to the engine — 10 minutes.** Add an interface-typed field, assign the argument in the
   constructor and use `GetBoard` at the existing rule call. Inspect every normal/blocked expectation.
4. **Compare repeated and boundary observations — 10 minutes.** The fixed runner checks repeated results,
   preserved inputs and call count two after two previews. Choose one other cardinal move from the start,
   predict whether it crosses an edge or wall, and add a clearly labelled check at the marked place, using a
   new board/provider/engine and the same valid initial state twice. If uncertain, use north: it crosses the
   top edge and must reject without spending.
5. **Explain individually — 5 minutes.** Identify the constructor assignment and provider call; explain why
   differing board data can change results while rule logic stays the same.

## Expected completion

The unextended reference runner passes **18/18** checks and exits zero; your added check increases the total.
The checks cover accepted flag, position, remaining moves, reason, score/status, repeatability, input
preservation, provided-instance use and the equivalent-data direct baseline.

## Hints

* **Hint 1 — object flow.** Follow the provider object from `new FixedBoardProvider(...)` into the engine's constructor: where is it kept?
* **Hint 2 — where the data comes from.** Which expression in `Preview` chooses the board today? Replace only that.
* **Hint 3 — syntax.** `Board GetBoard();` in the interface; `private readonly IBoardProvider provider;` and `this.provider = provider;` in the engine.

## Individual evidence

Trace the supplied object into `Rules.EvaluateMove`, give the predicted and observed east result on each board,
and explain your chosen boundary observation. Use [evidence.md](evidence.md).

## Repair and teardown

If compilation fails, compare the interface signature with the public implementation and confirm
`: IBoardProvider`. If open checks pass but blocked checks fail, trace the board argument reaching
`EvaluateMove`. If the call count is wrong, check that the engine retained and used the supplied instance once
per preview. Generated `bin/` and `obj/` can be removed afterwards.

## Knowledge check

1. Which declaration expresses the provider operation used by the engine?
2. An engine accepts `IBoardProvider` but still calls `Rules.EvaluateMove(Boards.Open(), state, action)`. What has happened?
3. Which implementation meets this exercise's `GetBoard` contract?
4. Open-board east succeeds and blocked-board east rejects. Why can both be correct with unchanged rules?
