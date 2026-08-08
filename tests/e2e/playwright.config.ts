import { defineConfig, devices } from "@playwright/test";

const FRONTEND_URL = process.env.PLAYWRIGHT_FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.PLAYWRIGHT_BACKEND_URL || "http://localhost:3001";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.CI
    ? undefined
    : [
        {
          command: `FRONTEND_ORIGIN=http://localhost:5173 npx tsx ../../src/backend/src/server.ts`,
          url: `${BACKEND_URL}/api/health`,
          reuseExistingServer: true,
          timeout: 15_000,
        },
        {
          command: `VITE_API_URL=${BACKEND_URL} npx vite ../../src/frontend`,
          url: FRONTEND_URL,
          reuseExistingServer: true,
          timeout: 20_000,
        },
      ],
});
