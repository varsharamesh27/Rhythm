import { defineConfig, devices } from "@playwright/test";

const devCommand = process.platform === "win32"
  ? ".tools\\node\\node.exe node_modules\\next\\dist\\bin\\next dev -H 127.0.0.1 -p 3100"
  : "npm run dev -- --hostname 127.0.0.1 --port 3100";

export default defineConfig({
  globalSetup: "./tests/global-setup.ts",
  testDir: "./tests",
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3100",
    storageState: process.env.PLAYWRIGHT_STORAGE_STATE || undefined,
    trace: "on-first-retry"
  },
  webServer: {
    command: devCommand,
    env: {
      RHYTHM_DEMO_DATA_PATH: ".playwright-demo-data.json",
      SUPABASE_ANON_KEY: "",
      SUPABASE_URL: ""
    },
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120000
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
