import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

if (process.env.__ENV_LOADED__ !== "1") {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const candidates = [
    process.env.ENV_FILE && resolve(process.env.ENV_FILE),
    resolve(process.cwd(), ".env"),
    resolve(root, ".env"),
  ].filter(Boolean);

  for (const path of candidates) {
    if (!existsSync(path)) continue;

    const result = config({ path });
    if (!result.error) {
      process.env.__ENV_LOADED__ = "1";
      console.log(`[env] loaded ${path}`);
      break;
    }
  }

  if (process.env.__ENV_LOADED__ !== "1") {
    console.warn("[env] no .env file found — set HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN in the environment");
  }
}
