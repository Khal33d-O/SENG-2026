// checks/clean.mjs - npm run clean: removes generated output so the next build starts fresh.
import { rmSync } from "node:fs";

rmSync(new URL("../dist", import.meta.url), { recursive: true, force: true });
console.log("Removed dist/");
