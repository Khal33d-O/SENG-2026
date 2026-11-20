// SUPPLIED - the observable contract for your adapter (real browser events).
// Tests tagged @baseline must pass before you edit anything (`npm run check:baseline`).
// The others fail on the unchanged starter because the adapter is incomplete.
import { test, expect } from "@playwright/test";

const start = { position: { x: 0, y: 0 }, movesRemaining: 6, score: 0, collected: [], status: "playing" };

// "Read diagnostics" copies the retained state and the move-rule call count.
async function diagnostics(page) {
  const details = page.locator("details");
  if (!(await details.evaluate((element) => element.open))) await page.locator("summary").click();
  await page.locator("#read-diagnostics").click();
  return JSON.parse(await page.locator("#diagnostics").textContent());
}

const tile = (page, x, y) => page.locator(`#board .tile[data-x="${x}"][data-y="${y}"]`);

// The player marker (class and non-colour text) must sit on exactly one tile.
async function expectPlayerAt(page, x, y) {
  await expect(page.locator("#board .tile.player")).toHaveCount(1);
  await expect(tile(page, x, y)).toHaveClass(/\bplayer\b/);
  await expect(tile(page, x, y)).toHaveText("Player");
}

// Pressing a key with focus on the page body (not in a field).
async function pressOnPage(page, key) {
  await page.locator("h1").click();
  await page.keyboard.press(key);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});

test("initial render: nine tiles, player at (0,0), zero score, six moves, zero rule calls", { tag: "@baseline" }, async ({ page }) => {
  await expect(page.locator("#board .tile")).toHaveCount(9);
  await expectPlayerAt(page, 0, 0);
  await expect(page.locator("#status")).toContainText("playing: 6 moves left");
  await expect(page.locator("#score")).toHaveText("Score: 0");
  expect(await diagnostics(page)).toEqual({ state: start, moveRuleCalls: 0 });
});

test("Read diagnostics observes a copy and never applies a move", { tag: "@baseline" }, async ({ page }) => {
  await diagnostics(page);
  await diagnostics(page);
  expect(await diagnostics(page)).toEqual({ state: start, moveRuleCalls: 0 });
  await expectPlayerAt(page, 0, 0);
});

test("East button: one click makes one rule call and renders the returned state", async ({ page }) => {
  await page.locator("#east").click();
  const read = await diagnostics(page);
  expect(read.moveRuleCalls).toBe(1); // two would mean a duplicated East listener
  expect(read.state).toEqual({ ...start, position: { x: 1, y: 0 }, movesRemaining: 5 });
  await expectPlayerAt(page, 1, 0);
  await expect(page.locator("#status")).toContainText("playing: 5 moves left");
});

test("each direction button and its arrow key produce the same state from a fresh reset", async ({ page }) => {
  // East then South from the start reaches (1,0) and then asks for the wall.
  const pairs = [
    { button: "#east", key: "ArrowRight", setup: [] },
    { button: "#south", key: "ArrowDown", setup: [] },
    { button: "#west", key: "ArrowLeft", setup: ["#east"] },
    { button: "#north", key: "ArrowUp", setup: ["#south"] },
  ];
  for (const pair of pairs) {
    const results = [];
    for (const route of ["button", "key"]) {
      await page.locator("#new-game").click();
      for (const selector of pair.setup) await page.locator(selector).click();
      if (route === "button") await page.locator(pair.button).click();
      else await pressOnPage(page, pair.key);
      const read = await diagnostics(page);
      expect(read.moveRuleCalls, `${pair.button} via ${route}`).toBe(pair.setup.length + 1);
      const position = read.state.position;
      await expectPlayerAt(page, position.x, position.y);
      results.push({ state: read.state, status: await page.locator("#status").textContent() });
    }
    expect(results[1], `${pair.key} must equal ${pair.button}`).toEqual(results[0]);
  }
});

test("wall and boundary moves reach the rule once and preserve every state field", async ({ page }) => {
  // East, then South into the wall at (1,1).
  await page.locator("#east").click();
  const afterEast = await diagnostics(page);
  await page.locator("#south").click();
  const afterWall = await diagnostics(page);
  expect(afterWall.moveRuleCalls).toBe(2);
  expect(afterWall.state).toEqual(afterEast.state);
  await expectPlayerAt(page, 1, 0);
  await expect(page.locator("#status")).toContainText("playing: 5 moves left");

  // North and West from the start request off-board moves: one call each, no change.
  await page.locator("#new-game").click();
  await page.locator("#north").click();
  await pressOnPage(page, "ArrowLeft");
  const afterEdges = await diagnostics(page);
  expect(afterEdges).toEqual({ state: start, moveRuleCalls: 2 });
  await expectPlayerAt(page, 0, 0);
});

test("post-completion actions preserve the won state while still reaching the rule once", async ({ page }) => {
  // The reference winning path: East, East, South, South.
  await page.locator("#east").click();
  await pressOnPage(page, "ArrowRight");
  await page.locator("#south").click();
  await pressOnPage(page, "ArrowDown");
  const won = await diagnostics(page);
  expect(won).toEqual({
    state: { position: { x: 2, y: 2 }, movesRemaining: 2, score: 10, collected: ["t1"], status: "won" },
    moveRuleCalls: 4,
  });
  await page.locator("#west").click();
  await pressOnPage(page, "ArrowUp");
  const after = await diagnostics(page);
  expect(after.moveRuleCalls).toBe(6);
  expect(after.state).toEqual(won.state);
  await expectPlayerAt(page, 2, 2);
  await expect(page.locator("#status")).toContainText("won: 2 moves left");
});

test("changed final approach", async ({ page }) => {
  const status = page.locator("#status");
  await page.locator("#final-approach").click();
  const before = await diagnostics(page);
  expect(before).toEqual({
    state: { position: { x: 2, y: 0 }, movesRemaining: 2, score: 10, collected: ["t1"], status: "playing" },
    moveRuleCalls: 0,
  });
  await expect(status).toContainText("playing: 2 moves left");
  await expect(status).not.toContainText("Last move");

  // First South (button): one playable move remains, so the player needs a warning.
  await page.locator("#south").click();
  await expectPlayerAt(page, 2, 1);
  await expect(status).toContainText("playing: 1 moves left");
  await expect(status).toContainText("Last move");

  // Second South (key): the rule returns a final-move win with zero moves.
  await pressOnPage(page, "ArrowDown");
  const after = await diagnostics(page);
  expect(after.moveRuleCalls).toBe(2);
  expect(after.state.status).toBe("won");
  await expectPlayerAt(page, 2, 2);
  await expect(status).toContainText("won: 0 moves left");
  await expect(status).not.toContainText("Last move");
  await expect(status).not.toContainText("lost");

  // New game: a later render leaves no obsolete warning.
  await page.locator("#new-game").click();
  await expectPlayerAt(page, 0, 0);
  await expect(status).toContainText("playing: 6 moves left");
  await expect(status).not.toContainText("Last move");
});

test("ordinary editing, repeated keys and unrelated keys are not game actions", async ({ page }) => {
  await page.locator("summary").click();

  // Typing and arrows inside editable controls.
  await page.locator("#player-notes").click();
  await page.keyboard.type("Head east then south");
  for (const key of ["ArrowLeft", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]) await page.keyboard.press(key);
  await expect(page.locator("#player-notes")).toHaveValue("Head east then south");
  await page.locator("#longer-note").click();
  for (const key of ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]) await page.keyboard.press(key);
  await page.locator("#selector").focus();
  await page.keyboard.press("ArrowDown");
  await page.locator("#editable-note").click();
  for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]) await page.keyboard.press(key);
  // A keydown that starts on the nested span inherits the note's editability.
  await page.locator("#nested-span").dispatchEvent("keydown", { key: "ArrowRight", bubbles: true });

  // A repeated keydown (holding a key) and an unrelated key are ignored before the rule.
  await page.locator("h1").click();
  await page.locator("body").dispatchEvent("keydown", { key: "ArrowRight", repeat: true, bubbles: true });
  await page.keyboard.press("a");
  expect(await diagnostics(page)).toEqual({ state: start, moveRuleCalls: 0 });
  await expectPlayerAt(page, 0, 0);

  // Positive control: an ordinary arrow key on the page is a game action.
  await pressOnPage(page, "ArrowRight");
  const read = await diagnostics(page);
  expect(read.moveRuleCalls).toBe(1);
  expect(read.state.position).toEqual({ x: 1, y: 0 });
  await expectPlayerAt(page, 1, 0);
});

test("native button activation keeps visible focus and makes one call per activation", async ({ page }) => {
  // Tab until the East button has focus.
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press("Tab");
    if (await page.evaluate(() => document.activeElement?.id === "east")) break;
  }
  const east = page.locator("#east");
  await expect(east).toBeFocused();
  expect(await east.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  expect(await east.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");

  await page.keyboard.press("Enter");
  await expect(east).toBeFocused();
  await expectPlayerAt(page, 1, 0);
  await page.keyboard.press("Space");
  await expect(east).toBeFocused();
  await expectPlayerAt(page, 2, 0);
  const read = await diagnostics(page);
  expect(read.moveRuleCalls).toBe(2);
  expect(read.state).toEqual({ ...start, position: { x: 2, y: 0 }, movesRemaining: 4, score: 10, collected: ["t1"] });
});
