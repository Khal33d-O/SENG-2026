// Run one compiled example, or all of them: npm run example -- loop
import { readdirSync } from "node:fs";
const wanted = process.argv[2];
const all = readdirSync(new URL("../dist/", import.meta.url)).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3)).sort();
for (const name of wanted ? [wanted] : all) {
  if (!all.includes(name)) { console.error(`Unknown example ${name}. Choose: ${all.join(", ")}`); process.exit(1); }
  console.log(`--- ${name}`);
  await import(`../dist/${name}.js`);
}
