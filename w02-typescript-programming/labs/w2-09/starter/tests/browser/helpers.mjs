// SUPPLIED helpers for the browser checks.
import { expect } from "@playwright/test";

export async function fields(page) {
  return {
    position: await page.locator("#position").textContent(),
    moves: await page.locator("#moves").textContent(),
    score: await page.locator("#score").textContent(),
    status: await page.locator("#status").textContent(),
  };
}

export async function expectDisplay(page, position, moves, score = "0", status = "playing") {
  await expect(page.locator("#position")).toHaveText(position);
  await expect(page.locator("#moves")).toHaveText(moves);
  await expect(page.locator("#score")).toHaveText(score);
  await expect(page.locator("#status")).toHaveText(status);
  await expect(page.locator(".cell-player")).toHaveAttribute("aria-label", `${position} Player`);
}

export const runIdOf = async (page) => (await page.locator("#run-id").textContent()) ?? "";

/** Open the event view for a run and return the row for a sequence. */
export async function eventRow(page, runId, sequence) {
  await page.goto(`/events.html?runId=${encodeURIComponent(runId)}`);
  const row = page.locator(`#rows tr[data-run-id="${runId}"][data-sequence="${sequence}"]`);
  await expect(row).toHaveCount(1);
  return row;
}

export const cell = (row, field) => row.locator(`[data-field="${field}"]`);
