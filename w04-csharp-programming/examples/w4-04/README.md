# W4.04 worked examples — single-spend classes

`demo/Probe.csproj` compiles exactly two files: `GameSession.cs` and `Program.cs`. Select one variant for
each from `demo/variants/` (do not compile every conflicting variant together). Work in a disposable copy.

## Worked Example 1: Observe the public-setter bypass

`variants/public_set.cs`:

```csharp
public class GameSession
{
    public int MovesRemaining { get; set; }
    public GameSession(int moves) { MovesRemaining = moves < 0 ? 0 : moves; }
    public bool TrySpendMove()
    {
         if (MovesRemaining == 0) return false;
         MovesRemaining -= 1;
         return true;
    }
}
```

```bash
cp variants/public_set.cs GameSession.cs
cp variants/external_write.cs Program.cs
dotnet run --project Probe.csproj --disable-build-servers
```

Observed: compiles and prints `-9`. The guard was never the route used for this change.

## Worked Example 2: Protect state and expose the guarded operation

`variants/private_set.cs`:

```csharp
public class GameSession
{
    public int MovesRemaining { get; private set; }
    public GameSession(int moves) { MovesRemaining = moves < 0 ? 0 : moves; }
    public bool TrySpendMove()
    {
         if (MovesRemaining == 0) return false;
         MovesRemaining -= 1;
         return true;
    }
}
```

| GameSession.cs | Program.cs | Observed (SDK 10.0.102) |
|---|---|---|
| `private_set.cs` | `checks.cs` | `Assertions: 13/13` |
| `private_set.cs` | `external_write.cs` | `error CS0272: The property or indexer 'GameSession.MovesRemaining' cannot be used in this context because the set accessor is inaccessible` |
| `private_field.cs` | `checks.cs` | `Assertions: 13/13` |
| `private_field.cs` | `external_write.cs` | `error CS0200: Property or indexer 'GameSession.MovesRemaining' cannot be assigned to -- it is read only` |
| `mutant_no_guard.cs` (checkpoint) | `checks.cs` | `Assertions: 7/13` |
| `mutant_true_on_reject.cs` (checkpoint) | `checks.cs` | `Assertions: 10/13` |

The demo ships with `private_set.cs` + `checks.cs` selected.
