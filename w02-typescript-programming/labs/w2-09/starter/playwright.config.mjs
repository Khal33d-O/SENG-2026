// SUPPLIED browser checks. npm test starts its own server (and the .NET API) on PORT (default 4179):
// stop npm start first.
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 4179);

export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  timeout: 30_000,
  use: { baseURL: `http://127.0.0.1:${port}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node tools/serve.mjs",
    url: `http://127.0.0.1:${port}/healthz`,
    env: { PORT: String(port) },
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
