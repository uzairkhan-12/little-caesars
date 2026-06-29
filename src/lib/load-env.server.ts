import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Load .env at runtime for production (Nitro only auto-loads dotenv in dev). */
function loadEnv() {
  if (process.env.__ENV_LOADED__ === "1") return;

  const candidates = new Set<string>();

  if (process.env.ENV_FILE) {
    candidates.add(resolve(process.env.ENV_FILE));
  }
  candidates.add(resolve(process.cwd(), ".env"));

  let dir = dirname(fileURLToPath(import.meta.url));
  for (let depth = 0; depth < 8; depth++) {
    candidates.add(resolve(dir, ".env"));
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  for (const path of candidates) {
    if (!existsSync(path)) continue;

    const result = config({ path });
    if (!result.error) {
      process.env.__ENV_LOADED__ = "1";
      return;
    }
  }
}

loadEnv();
