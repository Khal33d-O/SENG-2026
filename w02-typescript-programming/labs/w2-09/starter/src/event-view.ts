// SUPPLIED local event view (events.html). Rows live in the local server's memory until it stops.
// The Run ID field filters the DISPLAY only; it never deletes stored rows. Refresh after an action.
interface Row {
  receivedAt: string;
  runId: string;
  sequence: number;
  action: string;
  source: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

const filter = document.getElementById("run-filter") as HTMLInputElement;
const rows = document.getElementById("rows") as HTMLTableSectionElement;
const summaryText = document.getElementById("summary") as HTMLElement;
filter.value = new URLSearchParams(location.search).get("runId") ?? "";

const show = (v: Record<string, unknown>) => `(${v.x},${v.y}) moves ${v.moves} score ${v.score} ${v.status}`;

async function refresh(): Promise<void> {
  summaryText.textContent = "Loading stored events...";
  try {
    const response = await fetch("/api/events");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { events } = (await response.json()) as { events: Row[] };
    const wanted = filter.value.trim();
    const shown = wanted ? events.filter((e) => e.runId === wanted) : events;
    rows.replaceChildren();
    for (const e of shown) {
      const tr = rows.insertRow();
      tr.dataset.runId = e.runId;
      tr.dataset.sequence = String(e.sequence);
      for (const [field, value] of [["runId", e.runId], ["sequence", String(e.sequence)], ["action", e.action],
        ["source", e.source], ["before", show(e.before)], ["after", show(e.after)]] as const) {
        const td = tr.insertCell();
        td.dataset.field = field;
        td.textContent = value;
      }
    }
    summaryText.textContent = `Showing ${shown.length} of ${events.length} stored events${wanted ? ` for ${wanted}` : ""}`;
  } catch (error) {
    summaryText.textContent = `Event view unavailable: ${(error as Error).message}`;
  }
}

document.getElementById("refresh")!.addEventListener("click", () => void refresh());
document.getElementById("filter-form")!.addEventListener("submit", (event) => {
  event.preventDefault();
  void refresh();
});
void refresh();
