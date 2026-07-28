import { spawnSync } from "node:child_process";
import { cp, mkdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";

if (process.platform === "win32") {
  console.log("Skipping OpenNext packaging on Windows; Sites packages it on the Linux deployment host.");
  process.exit(0);
}

const cli = join(process.cwd(), "node_modules", ".bin", "opennextjs-cloudflare");
const openNextResult = spawnSync(cli, ["build", "--skipNextBuild"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit"
});

if (openNextResult.error) throw openNextResult.error;
if (openNextResult.status !== 0) process.exit(openNextResult.status ?? 1);

await rm("dist", { force: true, recursive: true });
await mkdir("dist/server", { recursive: true });

const wranglerCli = join(process.cwd(), "node_modules", ".bin", "wrangler");
const bundleResult = spawnSync(
  wranglerCli,
  [
    "deploy",
    "--dry-run",
    "--outdir",
    "dist/server",
    "--config",
    "wrangler.jsonc"
  ],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit"
  }
);

if (bundleResult.error) throw bundleResult.error;
if (bundleResult.status !== 0) process.exit(bundleResult.status ?? 1);

await rename("dist/server/worker.js", "dist/server/index.js");
await cp(".open-next/assets", "dist/assets", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
