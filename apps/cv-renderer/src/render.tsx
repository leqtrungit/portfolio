import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { renderToFile } from "@react-pdf/renderer";
import { profileSchema } from "@new-portfolio/profile-schema";
import { MasterCV } from "./templates/master.js";

const [, , inputArg, outputArg] = process.argv;

const inputPath = resolve(process.cwd(), inputArg ?? "../../profile.json");
const outputPath = resolve(process.cwd(), outputArg ?? "out/cv.pdf");

const profile = profileSchema.parse(JSON.parse(readFileSync(inputPath, "utf-8")));

mkdirSync(dirname(outputPath), { recursive: true });

await renderToFile(<MasterCV profile={profile} />, outputPath);

console.log(`Rendered ${outputPath} from ${inputPath}`);
