// SUPPLIED helpers for the browser checks.
import { expect } from "@playwright/test";

export async function selectCondition(page, condition) {
  // Choose through the real selector and wait for the server's confirmation.
  await page.locator("#response-condition").selectOption(condition);
  await expect(page.locator("#condition-status")).toHaveText(`Selected: ${condition}`);
}

export async function openGame(page) {
  await page.goto("/");
  await expect(page.locator("#condition-status")).toHaveText(/^Selected: /);
  await selectCondition(page, "valid");
}

export const gameStatus = (page) => page.locator("#game-status");
export const requestStatus = (page) => page.locator("#request-status");
export const definition = (page) => page.locator("#definition");

export async function load(page) {
  await page.locator("#load-board").click();
}

export async function expectOutcome(page, kind, text) {
  await expect(requestStatus(page)).toHaveAttribute("data-kind", kind, { timeout: 15_000 });
  if (text) await expect(requestStatus(page)).toContainText(text);
  await expect(page.locator("#load-board")).toBeEnabled();
}
