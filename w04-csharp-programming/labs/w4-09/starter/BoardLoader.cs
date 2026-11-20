// LEARNER FILE (W4.09): implement LoadAsync only.
//  1. Change the method to async Task<LoadResult>; await PreparedFiles.ReadTextAsync with the token.
//  2. Parse the text using PreparedFiles.Parse and return a loaded result: new(true, board, null).
//  3. Catch JsonException and IOException separately and return INVALID_FILE / UNAVAILABLE_FILE.
//     Let unexpected faults and cancellation (OperationCanceledException) propagate.
using System.Text.Json;

namespace BoardLoading;

public static class BoardLoader
{
    public static Task<LoadResult> LoadAsync(string path, CancellationToken token)
    {
        throw new NotImplementedException("W4.09: implement BoardLoader.LoadAsync");
    }
}
