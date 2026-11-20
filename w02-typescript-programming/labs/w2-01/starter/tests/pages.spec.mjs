// Supplied browser checks (read and run them; no test authoring required).
//   @baseline checks (2): the page, styling, element lookup and inspection demo work.
//   literal-text check (1): the status paragraph holds plain text, not markup.
//   ready-message checks (2): fail on the unchanged starter until you complete the challenge.
import { test, expect } from "@playwright/test";

const READY_MESSAGE = "Ready to explore";

// Collect uncaught page errors so a failed lookup or missing program is reported clearly.
function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("baseline: main page structure, styling and element lookup work @baseline", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/index.html");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mission status");

  const label = page.locator("p#mission-label.status");
  await expect(label).toHaveCount(1);
  // The supplied stylesheet loaded and the class still matches: the border is present.
  await expect(label).toHaveCSS("border-left-style", "solid");
  // The page program ran and replaced the initial HTML text.
  await expect(label).not.toHaveText("HTML only");
  await expect(page.locator('script[type="module"]')).toHaveAttribute("src", "dist/main.js");
  expect(errors, "uncaught errors on the main page").toEqual([]);
});

test("baseline: inspection demonstration shows Script loaded @baseline", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/demos/inspection.html");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Inspect a page");
  const label = page.locator("p#inspection-label.status");
  await expect(label).toHaveText("Script loaded");
  await expect(label).toHaveCSS("border-left-style", "solid");
  expect(errors, "uncaught errors on the inspection page").toEqual([]);
});

test("literal-text: the status paragraph contains text, not markup", async ({ page }) => {
  await page.goto("/index.html");
  const label = page.locator("#mission-label");
  await expect(label).not.toHaveText("HTML only");
  // textContent creates a single text node; no child elements should appear.
  expect(await label.evaluate((element) => element.childElementCount)).toBe(0);
});

test("main page: current label communicates the ready message", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator("#mission-label")).toHaveText(READY_MESSAGE);
});

test("handover page: shows the same ready message from the same program", async ({ page }) => {
  await page.goto("/handover.html");
  await expect(page.locator("#mission-label")).toHaveText(READY_MESSAGE);
  await expect(page.locator('script[type="module"]')).toHaveAttribute("src", "dist/main.js");
});
