# W4.09 lab · Implement a bounded asynchronous board loader

**Session:** W4.09 Async file loading and failure handling · One 45-minute practical challenge within the
120-minute module (10 retrieval and prediction, 20 concepts, 20 demonstrations, 45 challenge, 15 comparison and
repair, 10 knowledge checks and recovery).

Work in your own copy of `starter`; save the original so you can recover. The package is self-contained.

## Outcomes

* Explain `Task<T>`, `async` and `await` for a file-loading operation.
* Await a result and handle an invalid or unavailable file with specific exceptions.
* Locate the resource the wrapper acquires and where it is released.
* Keep cancellation separate from invalid content (optional).

## Start and ownership

Use the academy shell prepared in W4.01 and .NET SDK 10.0.401 (`dotnet --version`). The authoring repository's
`source designer/build/tooling/environment.sh` is not published; use [environment.sh](environment.sh) to check the
prepared terminal. No application environment variables or secrets are needed. Commands begin at the repository
root — the **`source/`** folder of this course repository.

**You edit:** `BoardLoader.cs` — implement `LoadAsync` only. Parsing, models, cancellation source, stream handling
and display are supplied (`PreparedFiles.cs`, `Models.cs`, `Program.cs`, `BoardLoading.csproj`).

```bash
cd learner/units/w04-csharp-programming/labs/w4-09/starter
dotnet run -- board.json
```

**Initial behaviour.** The starter builds and throws `NotImplementedException`. The surrounding files already
work in the separate demo ([../../examples/w4-09/](../../examples/w4-09/README.md)).

Files: `board.json` is the reference board; `invalid.json` exists but has a string where a number is expected;
`missing.json` intentionally does **not** exist — do not create it just to get a green result.

## Concepts

`Task<T>` represents an operation that will produce a value of type `T`, fail or be cancelled; `Task<LoadResult>`
will eventually produce the supplied `LoadResult(Loaded, Board, Error)` — not the board itself. `async` permits
`await`; `await` obtains the completed result and propagates a failure. Use `await`; `.Result` and `.Wait()` block
and are outside this exercise.

```csharp
string text = await PreparedFiles.ReadTextAsync(path, token);
return new(true, PreparedFiles.Parse(text), null);
```

`PreparedFiles.ReadTextAsync` returns `Task<string>`; the awaited value is `string`. Catch `JsonException`
(unparseable content or failed shape check) and `IOException` (a missing file on this filesystem) around the
read/parse and return `INVALID_FILE` or `UNAVAILABLE_FILE`. Do not catch every exception.

`FileStream` opens the handle; `StreamReader` owns it; the supplied `using var reader = ...` releases both when the
method's scope ends. The wrapper's `finally` prints `release scope reached`; the caller then reopens the file with
exclusive sharing and prints `exclusive reopen succeeded`.

## Work through the challenge

Spend 5 minutes predicting/reproducing, 25 implementing and checking, 10 comparing a normal and boundary path,
and 5 capturing your explanation.

1. Change the method to `async Task<LoadResult>`; await the supplied text reader with the token.
2. Parse the text using `PreparedFiles.Parse` and return a loaded result.
3. Catch `JsonException` and `IOException` separately and return the two documented failure categories. Let
   unexpected faults and cancellation propagate.
4. Run `board.json`, `invalid.json` and `missing.json`. Record output and exit code. Trace resource ownership.
   Inspect the supplied `dotnet run -- board.json cancel` run if time permits.

| Command | Expected output (last lines) | Exit |
|---|---|---|
| `dotnet run -- board.json` | `loaded=True board=reference error=none`, `exclusive reopen succeeded` | 0 |
| `dotnet run -- invalid.json` | `release scope reached`, `error=INVALID_FILE`, `exclusive reopen succeeded` | 1 |
| `dotnet run -- missing.json` | `error=UNAVAILABLE_FILE` (no release message) | 1 |
| `dotnet run -- board.json cancel` | `release scope reached`, `cancelled by caller`, `exclusive reopen succeeded` | 3 |

## Completion and individual evidence

Normal case loads reference (exit 0); invalid content returns `INVALID_FILE` (1); missing file returns
`UNAVAILABLE_FILE` (1). Existing file handles can be exclusively reopened. Each learner locates disposal and
explains what `await` returns. Optional cancellation stays a separate category (3). Submit changed source, exact
commands and observed outcomes using [evidence.md](evidence.md).

## Hints and recovery

* **Hint 1.** Make one successful `await` work for `board.json` before adding any `catch`.
* **Hint 2.** Put the read *and* the parse inside one `try`; add `catch (JsonException)` then `catch (IOException)`.
* **Hint 3.** Do not add `catch (Exception)` or `catch (OperationCanceledException)` — the caller handles cancellation.

On recovery, preserve your function, reopen the fresh starter and complete one successful await before adding the
two expected catches. If a tool is unavailable, retain the learning need and schedule the actual check.

## Knowledge check

1. What is the difference between Task and the awaited string?
2. What happens for invalid.json, and which code identifies it?
3. Locate the acquired resource and its release. Does the release log alone prove disposal?
4. Why does missing.json produce no release message?
5. Optional: why should cancellation not be reported as invalid JSON?
