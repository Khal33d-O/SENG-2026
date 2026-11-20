# W4.02 worked examples — complete demonstration

Work in a disposable copy of `demo/`.

## Worked Example 1: Represent typed position and score

```bash
dotnet restore Preflight.slnx
dotnet build Preflight.slnx --no-restore --disable-build-servers
dotnet run --project ConsoleApp/ConsoleApp.csproj --no-build -- fixtures/F02.json present
```

Observed:

```text
Fixture: F02
Values: 1,0|0|playing
Measurement: 2.75
Whole part: 2
Optional score: 0
Optional result: True|playing
Value copy: 0|99
Same reference: True
Same reference after new Position: False
Original position: 1,0
...
PASS F02
```

## Worked Example 1 (continued): Observe optional values and references

```bash
dotnet run --project ConsoleApp/ConsoleApp.csproj --no-build -- fixtures/F02.json absent
```

The fixture comparison still passes; `Optional score: absent` and `Optional result: absent`.

## Worked Example 2: Correct a conversion mistake, then unsafe optional access

`variants/` holds complete replacement `Program.cs` files. Copy one over `ConsoleApp/Program.cs`, rebuild
and run the absent selection; restore the original afterwards. Observed on SDK 10.0.102:

| Variant | Build | Absent run |
|---|---|---|
| `conversion-error.Program.cs` (`int displayedScore = measuredScore;`) | `error CS0266: Cannot implicitly convert type 'double' to 'int'. An explicit conversion exists (are you missing a cast?)` | — |
| `conversion-cast.Program.cs` | builds | prints `Measurement: 2` (fraction lost) |
| `unsafe-value.Program.cs` | `warning CS8629: Nullable value type may be null.` | `InvalidOperationException: Nullable object must have a value.` |
| `unsafe-reference.Program.cs` | `warning CS8602: Dereference of a possibly null reference.` | `NullReferenceException` |
| `null-forgiving.Program.cs` (`!`) | no CS8602 | still `NullReferenceException` |

Line numbers differ when code changes; read the diagnostic code you are investigating.
