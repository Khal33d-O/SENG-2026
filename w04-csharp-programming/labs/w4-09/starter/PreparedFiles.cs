// SUPPLIED (W4.09): the file-reading wrapper and the synchronous parser. Do not edit.
using System.Text.Json;

namespace BoardLoading;

public static class PreparedFiles
{
    private static readonly JsonSerializerOptions Options = new() { PropertyNameCaseInsensitive = true };

    /// <summary>
    /// Opens the file, then reads all of its text asynchronously.
    /// Acquisition: the FileStream (an operating-system handle). Opening a missing file throws an
    /// IOException HERE, before the try block, so there is no reader to release and no release message.
    /// Ownership: the StreamReader owns the stream; "using var reader" disposes the reader (and so the
    /// stream) when this method's scope ends - on success, failure or cancellation.
    /// </summary>
    public static async Task<string> ReadTextAsync(string path, CancellationToken token)
    {
        var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read,
                                    bufferSize: 4096, useAsync: true);
        using var reader = new StreamReader(stream);
        try
        {
            Console.WriteLine($"opened {path}");
            token.ThrowIfCancellationRequested();          // a pre-cancelled token stops here
            return await reader.ReadToEndAsync(token);     // the awaited value is the file's text
        }
        finally
        {
            // Runs as control leaves the try block. The compiler-generated disposal for "using"
            // follows at the end of the method scope. This print alone does not prove disposal.
            Console.WriteLine("release scope reached");
        }
    }

    /// <summary>
    /// Synchronous parsing with a prepared shape check. Throws JsonException when the content cannot
    /// be parsed (for example a string where a number is expected) or does not have a board's shape.
    /// </summary>
    public static Board Parse(string text)
    {
        Board? board = JsonSerializer.Deserialize<Board>(text, Options);
        if (board is null || string.IsNullOrEmpty(board.Id) || board.Width <= 0 || board.Height <= 0
            || board.Start is null || board.Exit is null || board.Walls is null || board.Treasures is null)
        {
            throw new JsonException("The JSON does not have the prepared board shape.");
        }
        return board;
    }
}
