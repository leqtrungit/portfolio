import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { profileSchema } from "./schema";
import { checkParity } from "./parity";

function load(path: string): unknown {
  const json: unknown = JSON.parse(readFileSync(path, "utf-8"));
  const result = profileSchema.safeParse(json);
  if (!result.success) {
    console.error(`Invalid profile at ${path}:`);
    console.error(result.error.format());
    process.exit(1);
  }
  return json;
}

const explicit = process.argv[2];

if (explicit) {
  // Tailored CVs: schema only, no parity.
  load(explicit);
  console.log(`profile.json is valid (${explicit})`);
} else {
  const enPath = fileURLToPath(new URL("../../../profile.json", import.meta.url));
  const viPath = fileURLToPath(new URL("../../../profile.vi.json", import.meta.url));
  const en = load(enPath);
  const vi = load(viPath);
  const errors = checkParity(en, vi);
  if (errors.length > 0) {
    console.error("profile.json / profile.vi.json parity errors:");
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  console.log("profile.json + profile.vi.json are valid and in parity");
}
