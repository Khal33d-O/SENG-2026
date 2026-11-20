// Playwright checks for the supplied report (npm run check:browser).
import { test, expect } from "@playwright/test";
import { cases } from "../../cases.mjs";

test("report loads and lists every public case", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#summary")).toContainText("Report loaded");
  await expect(page.locator("#report tbody tr")).toHaveCount(cases.length);
});

test("every case matches with the original kept and a separate preview object", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#summary")).toContainText(`${cases.length} of ${cases.length} cases match`);
  for (const c of cases) {
    const row = page.locator(`#report tbody tr[data-case="${c.name}"]`);
    await expect(row.locator("td").nth(5)).toHaveText("separate object");
    await expect(row.locator("td").nth(6)).toHaveText("match");
  }
});
