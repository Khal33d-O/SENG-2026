// SUPPLIED baseline checks (@baseline): the game, the actual API and both demonstrations work
// BEFORE the request function is implemented.
import { test, expect } from "@playwright/test";
import { gameStatus, openGame } from "./helpers.mjs";

test("local game: East then diagnostics shows (1,0), five moves, one rule call", { tag: "@baseline" }, async ({ page }) => {
  await openGame(page);
  await page.getByRole("button", { name: "East" }).click();
  await expect(gameStatus(page)).toContainText("Position (1,0) · Moves remaining: 5");
  await page.locator("summary").click();
  await page.locator("#read-diagnostics").click();
  await expect(page.locator("#diagnostics")).toContainText("ruleCalls: 1");
});

test("actual API: GET /api/boards/reference returns the reference board JSON", { tag: "@baseline" }, async ({ request }) => {
  await request.post("/dev/response-condition", { data: { condition: "valid" } });
  const response = await request.get("/api/boards/reference");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/json");
  const board = await response.json();
  expect(board).toMatchObject({ id: "reference", width: 3, height: 3, initialMoves: 6, exit: { x: 2, y: 2 } });
  expect(board.treasures[0]).toMatchObject({ id: "t1", x: 2, y: 0 });
});

test("Worked Example 1: HTTP response inspection shows status 200 and the body as text", { tag: "@baseline" }, async ({ page }) => {
  await openGame(page);
  await page.goto("/demos/inspect.html");
  await page.locator("#inspect").click();
  await expect(page.locator("#http-status")).toHaveText("200 (ok)");
  await expect(page.locator("#content-type")).toContainText("application/json");
  await expect(page.locator("#body-text")).toContainText('"initialMoves": 6');
});

test("Worked Example 2: valid message and wrong message type", { tag: "@baseline" }, async ({ page }) => {
  await page.goto("/demos/message.html");
  await page.locator("#valid").click();
  await expect(page.locator("#message-output")).toHaveText("Board service ready");
  await page.locator("#wrong").click();
  await expect(page.locator("#message-output")).toHaveText("Failure: Invalid message");
});
