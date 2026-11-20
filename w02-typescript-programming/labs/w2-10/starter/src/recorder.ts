// SUPPLIED: the local event helper (as in W2.09). One POST to the local collector.
// The promise fulfils when the collector stores the event and rejects otherwise.
// A recording failure never undoes the game action that was already applied.

export interface AppEvent {
  runId: string;
  sequence: number;
  game: "treasure" | "range";
  action: string;
  accepted: boolean;
  reason: string | null;
  before: unknown;
  after: unknown;
  plan: string;
}

export async function recordEvent(event: AppEvent, fetchFn: typeof fetch = fetch): Promise<number> {
  const response = await fetchFn("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (response.status !== 201) throw new Error(`collector returned HTTP ${response.status}`);
  const ack = (await response.json()) as { stored?: number };
  return ack.stored ?? 0;
}
