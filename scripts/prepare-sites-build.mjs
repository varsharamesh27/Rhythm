import { spawnSync } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

if (process.platform === "win32") {
  console.log("Skipping OpenNext packaging on Windows; Sites packages it on the Linux deployment host.");
  process.exit(0);
}

const cli = join(process.cwd(), "node_modules", ".bin", "opennextjs-cloudflare");
const result = spawnSync(cli, ["build", "--skipNextBuild"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit"
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

await rm("dist", { force: true, recursive: true });
await cp(".open-next", "dist", { recursive: true });
await mkdir("dist/server", { recursive: true });
await writeFile(
  "dist/server/index.js",
  'export { default } from "../worker.js";\nexport * from "../worker.js";\n',
  "utf8"
);
await mkdir("dist/.openai", { recursive: true });
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
