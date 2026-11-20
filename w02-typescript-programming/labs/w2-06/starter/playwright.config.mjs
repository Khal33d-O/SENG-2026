// SUPPLIED test configuration. npm test starts its own server (and the .NET API) on PORT
// (default 4176), so stop npm start first. Tests run one at a time because the
// response condition is shared by the whole server.
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 4176);

export default defineConfig({
  testDir: "tests/browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
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
