// Supplied browser-check configuration. The suite starts its own server on PORT (default 4311),
// so stop any manually started server before running npm test.
// It does not compile TypeScript: npm test and npm run check:baseline build first.
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 4311);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "tests",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node tools/serve.mjs",
    url: `${baseURL}/index.html`,
    env: { PORT: String(port) },
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
