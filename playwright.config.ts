import { defineConfig, devices } from "@playwright/test";

const devCommand = process.platform === "win32"
  ? ".tools\\node\\node.exe node_modules\\next\\dist\\bin\\next dev -H localhost -p 3100"
  : "npm run dev -- --hostname localhost --port 3100";

export default defineConfig({
  globalSetup: "./tests/global-setup.ts",
  testDir: "./tests",
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: "http://localhost:3100",
    storageState: process.env.PLAYWRIGHT_STORAGE_STATE || undefined,
    trace: "on-first-retry"
  },
  webServer: {
    command: devCommand,
    env: {
      RHYTHM_DEMO_DATA_PATH: ".playwright-demo-data.json",
      NEXT_DIST_DIR: ".next-e2e",
      SUPABASE_ANON_KEY: "",
      SUPABASE_URL: ""
    },
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 120000
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
