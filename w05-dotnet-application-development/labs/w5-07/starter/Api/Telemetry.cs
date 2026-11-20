using System.Diagnostics;
using System.Text;
using System.Text.Json;
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace Academy.Api;

/// <summary>
/// Supplied telemetry plumbing. Telemetry.Start creates an OpenTelemetry TracerProvider listening to the
/// Academy.Game ActivitySource with an AlwaysOnSampler, and exports each finished action span as a small
/// JSON record to the local collector bridge (COLLECTOR_URL). The bridge translates records into Loki
/// push data. This exporter is deliberately NOT OTLP.
/// </summary>
public static class Telemetry
{
    public const string SourceName = "Academy.Game";
    public static readonly ActivitySource Actions = new(SourceName);

    public static void Start(IServiceCollection services, IConfiguration config)
    {
        var collector = config["COLLECTOR_URL"];
        var labSession = config["LAB_SESSION"] ?? "local";
        services.AddOpenTelemetry()
            .ConfigureResource(r => r.AddService("academy-w5-api"))
            .WithTracing(tracing =>
            {
                tracing.AddSource(SourceName).SetSampler(new AlwaysOnSampler());
                if (!string.IsNullOrWhiteSpace(collector))
                    tracing.AddProcessor(new SimpleActivityExportProcessor(new CollectorExporter(collector, labSession)));
            });
    }

    /// <summary>True for POST /api/sessions/{id}/actions.</summary>
    public static bool IsAction(HttpContext context) =>
        HttpMethods.IsPost(context.Request.Method)
        && context.Request.Path.StartsWithSegments("/api/sessions")
        && context.Request.Path.Value!.EndsWith("/actions", StringComparison.Ordinal);
}

/// <summary>Posts one bounded JSON record per span: tags only, never bodies or database content.</summary>
public sealed class CollectorExporter(string url, string labSession) : BaseExporter<Activity>
{
    private readonly HttpClient http = new() { Timeout = TimeSpan.FromSeconds(3) };

    public override ExportResult Export(in Batch<Activity> batch)
    {
        var records = new List<Dictionary<string, object?>>();
        foreach (var activity in batch)
        {
            var record = new Dictionary<string, object?>
            {
                ["ts"] = activity.StartTimeUtc.ToString("O"),
                ["job"] = "academy-w5-actions",
                ["session"] = labSession,
                ["name"] = activity.DisplayName,
                ["spanId"] = activity.SpanId.ToString(),
                ["spanStatus"] = activity.Status.ToString(),
                ["spanDurationMs"] = Math.Round(activity.Duration.TotalMilliseconds, 1),
            };
            foreach (var tag in activity.TagObjects) record[tag.Key] = tag.Value;
            records.Add(record);
        }

        try
        {
            var content = new StringContent(JsonSerializer.Serialize(records), Encoding.UTF8, "application/json");
            using var response = http.Send(new HttpRequestMessage(HttpMethod.Post, url) { Content = content });
            return response.IsSuccessStatusCode ? ExportResult.Success : ExportResult.Failure;
        }
        catch (Exception)
        {
            return ExportResult.Failure; // collector down: the API keeps serving; the view will be empty
        }
    }
}
