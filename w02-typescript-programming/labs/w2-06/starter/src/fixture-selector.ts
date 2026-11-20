// Supplied teaching infrastructure: the development proxy's response-condition selector.
// It is NOT a production API feature. A choice changes the response to later board requests
// until another condition is chosen. Wait for "Selected: <condition>" before loading.

function selectedFrom(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const selected = (body as { selected?: unknown }).selected;
  return typeof selected === "string" ? selected : null;
}

async function sendCondition(condition: string, status: HTMLElement): Promise<void> {
  status.textContent = "Selecting…";
  try {
    const response = await fetch("/dev/response-condition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ condition }),
    });
    const selected = selectedFrom(await response.json());
    status.textContent = selected === null ? "Selector unavailable" : "Selected: " + selected;
  } catch {
    status.textContent = "Selector unavailable";
  }
}

async function showCurrent(select: HTMLSelectElement, status: HTMLElement): Promise<void> {
  try {
    const response = await fetch("/dev/response-condition");
    const selected = selectedFrom(await response.json());
    if (selected === null) throw new Error("no condition");
    select.value = selected;
    status.textContent = "Selected: " + selected;
  } catch {
    status.textContent = "Selector unavailable";
  }
}

export function startSelector(): void {
  const select = document.querySelector<HTMLSelectElement>("#response-condition");
  const status = document.querySelector<HTMLElement>("#condition-status");
  if (select === null || status === null) return;
  // The condition persists while the server runs, so show the server's current choice.
  void showCurrent(select, status);
  select.addEventListener("change", () => void sendCondition(select.value, status));
}
