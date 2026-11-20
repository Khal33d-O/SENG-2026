// Supplied: presentation helpers for the board-data request. Leave the implementations as they are.
//
//   showRequest(kind, message)  writes "<Kind>: <message>" into the role="status" region
//   setBusy(busy)               disables/enables ONLY the "Load board data" button
//   errorMessage(error)         formats a caught unknown value safely

export type RequestKind = "idle" | "loading" | "success" | "failure";

const LABELS: Record<RequestKind, string> = {
  idle: "Idle",
  loading: "Loading",
  success: "Success",
  failure: "Failure",
};

export function showRequest(kind: RequestKind, message: string): void {
  const region = document.querySelector<HTMLElement>("#request-status");
  if (region === null) throw new Error("Missing page element #request-status");
  region.dataset.kind = kind; // the element itself (and its role="status") is preserved
  region.textContent = `${LABELS[kind]}: ${message}`;
}

export function setBusy(busy: boolean): void {
  const button = document.querySelector<HTMLButtonElement>("#load-board");
  if (button === null) throw new Error("Missing page element #load-board");
  button.disabled = busy; // direction buttons and notes are never disabled
  document.querySelector("#request-panel")?.setAttribute("aria-busy", String(busy));
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected failure";
}
