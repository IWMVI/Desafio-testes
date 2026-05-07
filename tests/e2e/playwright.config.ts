import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dirWeb = path.join(__dirname, "../../web");

export default defineConfig({
  testDir: path.join(__dirname, "specs"),
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  webServer: {
    command: "npm exec vite -- --host 127.0.0.1 --port 5173",
    cwd: dirWeb,
    url: "http://127.0.0.1:5173",
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      VITE_API_URL: process.env.VITE_API_URL ?? "http://127.0.0.1:5000/api/v1.0",
    },
  },
});
