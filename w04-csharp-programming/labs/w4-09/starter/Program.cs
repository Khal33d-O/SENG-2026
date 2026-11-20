// SUPPLIED (W4.09): the console caller. Do not edit; implement BoardLoader.LoadAsync only.
// Usage (from this folder):  dotnet run -- board.json  |  dotnet run -- invalid.json
//                            dotnet run -- missing.json  |  dotnet run -- board.json cancel
// Exit codes: 0 loaded, 1 expected file failure (INVALID_FILE / UNAVAILABLE_FILE), 3 cancelled by caller.
using BoardLoading;

string path = args.Length > 0 ? args[0] : "board.json";
bool cancel = args.Length > 1 && args[1] == "cancel";

using var source = new CancellationTokenSource();
if (cancel)
{
    source.Cancel(); // a pre-cancelled token gives deterministic evidence (no race with a tiny file)
}

LoadResult result;
try
{
    result = await BoardLoader.LoadAsync(path, source.Token); // top-level await
}
catch (OperationCanceledException)
{
    // Cancellation is a separate category: not invalid content and not an unavailable file.
    Console.WriteLine("cancelled by caller");
    ExclusiveReopen(path);
    return 3;
}

Console.WriteLine($"loaded={result.Loaded} board={result.Board?.Id ?? "none"} error={result.Error ?? "none"}");
ExclusiveReopen(path);
return result.Loaded ? 0 : 1;

// Opens the same file with FileShare.None: this only succeeds if no handle is still open.
static void ExclusiveReopen(string path)
{
    if (!File.Exists(path))
    {
        Console.WriteLine("exclusive reopen skipped: the file does not exist");
        return;
    }
    using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.None);
    Console.WriteLine("exclusive reopen succeeded");
}
