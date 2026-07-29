import { defineConfig, devices } from "@playwright/test";

const devCommand = process.platform === "win32"
  ? ".tools\\node\\node.exe node_modules\\next\\dist\\bin\\next dev -H 127.0.0.1 -p 3000"
  : "npm run dev";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    storageState: process.env.PLAYWRIGHT_STORAGE_STATE || undefined,
    trace: "on-first-retry"
  },
  webServer: {
    command: devCommand,
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
