import { rmSync } from "fs";
import { join } from "path";

export default function globalSetup() {
  rmSync(join(process.cwd(), ".playwright-demo-data.json"), { force: true });
}
