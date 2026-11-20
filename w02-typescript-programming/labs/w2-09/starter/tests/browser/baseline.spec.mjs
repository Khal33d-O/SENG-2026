// SUPPLIED baseline (@baseline): the complete demonstrations, the counter practice and the starter's
// initial page work BEFORE your edits. It does not claim the unfinished application passes.
import { test, expect } from "@playwright/test";
import { cell, eventRow, expectDisplay, runIdOf } from "./helpers.mjs";

test("demo working: East renders (1,0), five moves, and its event is in the local view", { tag: "@baseline" }, async ({ page }) => {
  await page.goto("/demo.html?mode=working");
  await expect(page.locator("#api")).toHaveText("Reference API verified");
  const runId = await runIdOf(page);
  await page.getByRole("button", { name: "East" }).click();
  await expectDisplay(page, "(1,0)", "5");
  await expect(page.locator("#telemetry")).toHaveText("Recorded locally");
  const row = await eventRow(page, runId, 1);
  await expect(cell(row, "action")).toHaveText("east");
  await expect(cell(row, "source")).toHaveText("button");
  await expect(cell(row, "before")).toHaveText("(0,0) moves 6 score 0 playing");
  await expect(cell(row, "after")).toHaveText("(1,0) moves 5 score 0 playing");
});

test("demo mismatch: the event records x one while the page still shows (0,0)", { tag: "@baseline" }, async ({ page }) => {
  await page.goto("/demo.html?mode=mismatch");
  const runId = await runIdOf(page);
  await page.getByRole("button", { name: "East" }).click();
  await expect(page.locator("#telemetry")).toHaveText("Recorded locally");
  await expectDisplay(page, "(0,0)", "6");
  const row = await eventRow(page, runId, 1);
  await expect(cell(row, "after")).toHaveText("(1,0) moves 5 score 0 playing");
});

test("demo mismatch: a real pause before painting shows before 0, after 1, state 1, sequence 1", { tag: "@baseline" }, async ({ page }) => {
  await page.goto("/demo.html?mode=mismatch");
  const cdp = await page.context().newCDPSession(page);
  const scripts = new Map();
  cdp.on("Debugger.scriptParsed", (e) => scripts.set(e.url, e.scriptId));
  await cdp.send("Debugger.enable");
  await page.reload();
  const url = [...scripts.keys()].find((u) => u.endsWith("/dist/demo.js"));
  expect(url).toBeTruthy();
  const { scriptSource } = await cdp.send("Debugger.getScriptSource", { scriptId: scripts.get(url) });
  const line = scriptSource.split("\n").findIndex((l) => l.includes("paint(before);"));
  await cdp.send("Debugger.setBreakpointByUrl", { url, lineNumber: line });
  const paused = new Promise((resolve) => cdp.once("Debugger.paused", resolve));
  const click = page.getByRole("button", { name: "East" }).click({ noWaitAfter: true });
  const { callFrames } = await paused;
  const value = async (expression) =>
    (await cdp.send("Debugger.evaluateOnCallFrame", { callFrameId: callFrames[0].callFrameId, expression, returnByValue: true })).result.value;
  expect(await value("before.position.x")).toBe(0);
  expect(await value("after.position.x")).toBe(1);
  expect(await value("state.position.x")).toBe(1);
  expect(await value("sequence")).toBe(1);
  await cdp.send("Debugger.resume");
  await click;
  await expectDisplay(page, "(0,0)", "6"); // after resuming, the older argument was painted
});

test("demo repaired: East renders (1,0) and five moves", { tag: "@baseline" }, async ({ page }) => {
  await page.goto("/demo.html?mode=repaired");
  await page.getByRole("button", { name: "East" }).click();
  await expectDisplay(page, "(1,0)", "5");
});

test("practice: task counter event has sequence one, action complete, score 0 -> 1", { tag: "@baseline" }, async ({ page }) => {
  await page.goto("/practice.html");
  const runId = await runIdOf(page);
  await page.getByRole("button", { name: "Complete task" }).click();
  await expect(page.locator("#count")).toHaveText("1");
  await expect(page.locator("#telemetry")).toHaveText("Recorded locally");
  const row = await eventRow(page, runId, 1);
  await expect(cell(row, "action")).toHaveText("complete");
  await expect(cell(row, "before")).toHaveText("(0,0) moves 0 score 0 playing");
  await expect(cell(row, "after")).toHaveText("(0,0) moves 0 score 1 playing");
});

test("starter page renders the initial game", { tag: "@baseline" }, async ({ page }) => {
  await page.goto("/");
  await expectDisplay(page, "(0,0)", "6");
  await expect(page.locator("#run-id")).toHaveText(/^run-/);
});
