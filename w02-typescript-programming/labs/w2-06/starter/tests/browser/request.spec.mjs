// SUPPLIED acceptance checks for src/request.ts. They fail on the unchanged starter.
import { test, expect } from "@playwright/test";
import { definition, expectOutcome, gameStatus, load, openGame, requestStatus, selectCondition } from "./helpers.mjs";

const NONE = "No remote definition accepted.";

test("valid response: definition published through the explicit adapter", async ({ page }) => {
  await openGame(page);
  await load(page);
  await expectOutcome(page, "success");
  await expect(definition(page)).toContainText("initialMoveBudget: 6");
  await expect(definition(page)).toContainText("Treasures: t1 (2,0)");
  await expect(gameStatus(page)).toContainText("Position (0,0) · Moves remaining: 6");
});

const rejected = [
  ["http", "HTTP 503"],
  ["malformed", null],
  ["missing-id", "Invalid board shape"],
  ["zero-budget", "Invalid move budget"],
  ["negative-budget", "Invalid move budget"],
  ["fractional-budget", "Invalid move budget"],
  ["blocked-treasure", "Blocked treasure"],
  ["blocked-later", "Blocked treasure"],
];

for (const [condition, message] of rejected) {
  test(`rejected (${condition}): failure, no publication, retry available`, async ({ page }) => {
    await openGame(page);
    await selectCondition(page, condition);
    await load(page);
    await expectOutcome(page, "failure", message ?? undefined);
    await expect(definition(page)).toHaveText(NONE);
  });
}

test("shared-axis treasures are accepted: one shared coordinate is not a blocked cell", async ({ page }) => {
  await openGame(page);
  await selectCondition(page, "shared-axis");
  await load(page);
  await expectOutcome(page, "success");
  await expect(definition(page)).toContainText("t1 (1,0), t2 (2,1)");
});

test("failure keeps the last accepted definition and local progress; retry succeeds", async ({ page }) => {
  await openGame(page);
  await load(page);
  await expectOutcome(page, "success");
  const accepted = await definition(page).textContent();
  await page.getByRole("button", { name: "East" }).click();
  await selectCondition(page, "blocked-treasure");
  await load(page);
  await expectOutcome(page, "failure", "Blocked treasure");
  await expect(definition(page)).toHaveText(accepted ?? "");
  await expect(gameStatus(page)).toContainText("Position (1,0) · Moves remaining: 5");
  await selectCondition(page, "valid");
  await load(page);
  await expectOutcome(page, "success");
  await expect(gameStatus(page)).toContainText("Position (1,0) · Moves remaining: 5");
});

test("while loading: request disabled, keyboard play works and survives the failure", async ({ page }) => {
  test.setTimeout(45_000);
  await openGame(page);
  await selectCondition(page, "delayed-zero");
  await load(page);
  await expect(requestStatus(page)).toHaveAttribute("data-kind", "loading");
  await expect(page.locator("#load-board")).toBeDisabled();
  await page.getByRole("button", { name: "East" }).focus();
  await page.keyboard.press("Enter");
  await expect(gameStatus(page)).toContainText("Position (1,0) · Moves remaining: 5");
  await page.locator("#notes").fill("route idea");
  await page.locator("#notes").press("ArrowLeft");
  await expectOutcome(page, "failure", "Invalid move budget");
  await expect(gameStatus(page)).toContainText("Position (1,0) · Moves remaining: 5");
  await expect(definition(page)).toHaveText(NONE);
  await expect(page.locator("#notes")).toHaveValue("route idea");
});
