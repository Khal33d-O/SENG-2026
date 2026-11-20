// DEMO (W4.09): the complete parser and resource demonstration uses this finished loader.
using System.Text.Json;

namespace BoardLoading;

public static class BoardLoader
{
    /// <summary>
    /// Task&lt;LoadResult&gt; represents the eventual load result, not the board itself. await obtains the
    /// completed string (or propagates the failure). Only the two documented, expected failures are
    /// caught; unexpected faults and cancellation (OperationCanceledException) propagate to the caller.
    /// </summary>
    public static async Task<LoadResult> LoadAsync(string path, CancellationToken token)
    {
        try
        {
            string text = await PreparedFiles.ReadTextAsync(path, token);
            return new(true, PreparedFiles.Parse(text), null);
        }
        catch (JsonException)
        {
            return new(false, null, "INVALID_FILE");     // the content cannot be parsed into a board
        }
        catch (IOException)
        {
            return new(false, null, "UNAVAILABLE_FILE"); // e.g. FileNotFoundException for missing.json
        }
    }
}
