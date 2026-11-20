// SUPPLIED acceptance checks for src/app.ts (the integrated application). They fail on the starter.
import { test, expect } from "@playwright/test";
import { cell, eventRow, expectDisplay, runIdOf } from "./helpers.mjs";

const API = /\/api\/boards\/reference$/;

test("API: the reference definition is verified on load", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#api")).toHaveText("Reference API verified");
});

test("East from a fresh run: one rule call, all visible fields agree, event recorded", async ({ page }) => {
  await page.goto("/");
  const runId = await runIdOf(page);
  await page.getByRole("button", { name: "East" }).click();
  await expectDisplay(page, "(1,0)", "5");
  await expect(page.locator("#telemetry")).toHaveText("Recorded locally");
  const row = await eventRow(page, runId, 1);
  await expect(cell(row, "action")).toHaveText("east");
  await expect(cell(row, "source")).toHaveText("button");
  await expect(cell(row, "before")).toHaveText("(0,0) moves 6 score 0 playing");
  await expect(cell(row, "after")).toHaveText("(1,0) moves 5 score 0 playing");
  await expect(page.locator("#rows tr")).toHaveCount(1); // one dispatch, one row
});

test("South by key, then a wall rejection preserves every field", async ({ page }) => {
  await page.goto("/");
  await page.locator("body").press("ArrowRight");
  await expectDisplay(page, "(1,0)", "5");
  await page.locator("body").press("ArrowDown"); // wall at (1,1)
  await expectDisplay(page, "(1,0)", "5");
  const runId = await runIdOf(page);
  const row = await eventRow(page, runId, 2);
  await expect(cell(row, "source")).toHaveText("key");
  await expect(cell(row, "after")).toHaveText("(1,0) moves 5 score 0 playing");
});

test("completion: treasure then exit shows won with score and remaining moves", async ({ page }) => {
  await page.goto("/");
  for (const name of ["East", "East", "South", "South"]) await page.getByRole("button", { name }).click();
  await expectDisplay(page, "(2,2)", "2", "10", "won");
  await page.getByRole("button", { name: "West" }).click(); // ignored after completion
  await expectDisplay(page, "(2,2)", "2", "10", "won");
});

const apiFailures = [
  ["unavailable", (r) => r.fulfill({ status: 503, body: "down" }), "Reference API unavailable: HTTP 503"],
  ["malformed", (r) => r.fulfill({ status: 200, contentType: "application/json", body: "{\"id\":" }), "Reference API returned malformed JSON"],
  ["different", async (r) => {
    const response = await r.fetch();
    const data = await response.json();
    data.initialMoves = 9;
    await r.fulfill({ response, json: data });
  }, "Reference API returned a different definition"],
];

for (const [name, handler, message] of apiFailures) {
  test(`API ${name}: reported without changing current play; another inspection is possible`, async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#api")).toHaveText("Reference API verified");
    await page.getByRole("button", { name: "East" }).click();
    await page.route(API, handler);
    await page.getByRole("button", { name: "Inspect reference again" }).click();
    await expect(page.locator("#api")).toHaveText(message);
    await expectDisplay(page, "(1,0)", "5");
    await page.unroute(API);
    await page.getByRole("button", { name: "Inspect reference again" }).click();
    await expect(page.locator("#api")).toHaveText("Reference API verified");
    await expectDisplay(page, "(1,0)", "5");
  });
}

test("collector failure: the local action stays applied and recording reports failure", async ({ page }) => {
  await page.goto("/");
  await page.route("**/api/events", (r) => r.request().method() === "POST" ? r.fulfill({ status: 503, body: "" }) : r.continue());
  await page.getByRole("button", { name: "East" }).click();
  await expect(page.locator("#telemetry")).toHaveText("Local recording unavailable");
  await expectDisplay(page, "(1,0)", "5");
});

test("new local run: new identifier, sequence restarts at one, older rows filtered out", async ({ page }) => {
  await page.goto("/");
  const first = await runIdOf(page);
  await page.getByRole("button", { name: "East" }).click();
  await expect(page.locator("#telemetry")).toHaveText("Recorded locally");
  await page.getByRole("button", { name: "New local run" }).click();
  const second = await runIdOf(page);
  expect(second).not.toBe(first);
  await expectDisplay(page, "(0,0)", "6");
  await page.getByRole("button", { name: "South" }).click();
  await expect(page.locator("#telemetry")).toHaveText("Recorded locally");
  await eventRow(page, second, 1);
  for (const row of await page.locator("#rows tr").all()) await expect(row).toHaveAttribute("data-run-id", second);
});

test("guarded editing: arrows and repeats in the notes are not game actions", async ({ page }) => {
  await page.goto("/");
  await page.locator("#notes").fill("plan route");
  await page.locator("#notes").press("ArrowRight");
  await page.locator("#notes").press("ArrowDown");
  await expectDisplay(page, "(0,0)", "6");
  await expect(page.locator("#notes")).toHaveValue("plan route");
});
