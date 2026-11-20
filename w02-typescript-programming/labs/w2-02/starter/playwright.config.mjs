// Browser check (npm run check:browser). Playwright starts and stops its own
// server on the same port as npm start, so stop any manual server (Ctrl+C) first.
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 4302);

export default defineConfig({
  testDir: "tests/browser",
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node tools/serve.mjs",
    url: `http://127.0.0.1:${port}`,
    env: { PORT: String(port) },
    reuseExistingServer: false,
    timeout: 30000,
  },
});
