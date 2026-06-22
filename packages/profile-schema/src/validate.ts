import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { profileSchema } from "./schema";

const path = process.argv[2] ?? fileURLToPath(new URL("../../../profile.json", import.meta.url));
const raw = readFileSync(path, "utf-8");
const result = profileSchema.safeParse(JSON.parse(raw));

if (!result.success) {
  console.error(`Invalid profile.json at ${path}:`);
  console.error(result.error.format());
  process.exit(1);
}

console.log(`profile.json is valid (${path})`);
