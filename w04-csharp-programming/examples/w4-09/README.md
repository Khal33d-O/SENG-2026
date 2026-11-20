# W4.09 parser and resource demonstration

`demo/` uses the finished loader with the same supplied `PreparedFiles.cs`, `Models.cs` and `Program.cs` as the lab.
From `demo/`:

## Demo 1: await board.json

```bash
dotnet run -- board.json
```

Observed (exit 0): step through the order — open, await text, parse, return result, display:

```text
opened board.json
release scope reached
loaded=True board=reference error=none
exclusive reopen succeeded
```

## Demo 2: the invalid file, then the missing file

```bash
dotnet run -- invalid.json
dotnet run -- missing.json
```

`invalid.json`: reading succeeds and the reader is disposed (scope ends) before parsing throws `JsonException` →
`loaded=False board=none error=INVALID_FILE`, the exclusive reopen still succeeds, exit 1.
`missing.json`: opening throws before the wrapper's `try` block, so no release message →
`error=UNAVAILABLE_FILE`, exit 1.

## Optional: cancellation

```bash
dotnet run -- board.json cancel
```

The wrapper opens the file, detects the pre-cancelled token and leaves its resource scope;
`OperationCanceledException` propagates through the loader; the console prints `cancelled by caller`, reopens the
handle and exits 3.
