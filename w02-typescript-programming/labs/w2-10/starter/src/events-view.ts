// SUPPLIED: the local event view. It reads rows stored in the serve.py process
// memory (GET /api/events). It is not Grafana and proves no BP connection.

interface StoredEvent {
  stored: number;
  receivedAt: string;
  runId: string;
  sequence: number;
  game: string;
  action: string;
  accepted: boolean;
  reason: string | null;
  before: unknown;
  after: unknown;
  plan: string;
}

const input = document.getElementById("run-filter") as HTMLInputElement;
const tbody = document.getElementById("rows") as HTMLTableSectionElement;
const status = document.getElementById("view-status") as HTMLElement;

input.value = new URLSearchParams(location.search).get("run") ?? "";

function cell(row: HTMLTableRowElement, text: string, code = false): void {
  const td = row.insertCell();
  if (code) {
    const c = document.createElement("code");
    c.textContent = text;
    td.append(c);
  } else {
    td.textContent = text;
  }
}

async function refresh(): Promise<void> {
  try {
    const response = await fetch("/api/events", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = (await response.json()) as { events: StoredEvent[] };
    const run = input.value.trim();
    const rows = body.events.filter((e) => run === "" || e.runId === run);
    tbody.replaceChildren();
    for (const e of rows) {
      const tr = tbody.insertRow();
      tr.dataset.sequence = String(e.sequence);
      cell(tr, String(e.stored));
      cell(tr, e.runId);
      cell(tr, String(e.sequence));
      cell(tr, `${e.game}: ${e.action}`);
      cell(tr, e.accepted ? "accepted" : `rejected (${e.reason})`);
      cell(tr, JSON.stringify(e.before), true);
      cell(tr, JSON.stringify(e.after), true);
      cell(tr, e.plan);
    }
    status.textContent = `${rows.length} row(s) for ${run || "all runs"} · ${body.events.length} stored in this server process`;
  } catch (error) {
    status.textContent = `Event view unavailable: ${String(error)}`;
  }
}

document.getElementById("refresh")?.addEventListener("click", () => void refresh());
input.addEventListener("change", () => void refresh());
void refresh();
