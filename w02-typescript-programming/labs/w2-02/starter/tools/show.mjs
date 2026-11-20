// Supplied runner for `npm run show` and `npm run show -- <case-name>`.
// Runs the emitted calculation in Node.js and prints the inputs, the original
// object after the call, the preview, the expected preview and identity.
// READ ONLY: you do not need to change this file.
import { cases, freshInitial } from "../cases.mjs";
import { calculate } from "../dist/calculate.js";

const wanted = process.argv[2];
const selected = wanted ? cases.filter((c) => c.name === wanted) : cases;

if (selected.length === 0) {
  console.error(`Unknown case "${wanted}". Public cases: ${cases.map((c) => c.name).join(", ")}`);
  process.exit(1);
}

const fields = (s) =>
  `{ score: ${s.score}, actionsRemaining: ${s.actionsRemaining}, completed: ${s.completed} }`;

for (const c of selected) {
  const initial = freshInitial(c);
  const held = initial; // reference held by the comparison panel before the call
  const preview = calculate(initial, c.requested, c.points);
  const match =
    preview.score === c.expected.score &&
    preview.actionsRemaining === c.expected.actionsRemaining &&
    preview.completed === c.expected.completed;
  const originalKept =
    held.score === c.initial.score &&
    held.actionsRemaining === c.initial.actionsRemaining &&
    held.completed === c.initial.completed;

  console.log(`case ${c.name}: requested ${c.requested}, points ${c.points}`);
  console.log(`  original before : ${fields(c.initial)}`);
  console.log(`  original after  : ${fields(held)}${originalKept ? "" : "   <-- changed"}`);
  console.log(`  preview         : ${fields(preview)}`);
  console.log(`  expected        : ${fields(c.expected)}${match ? "" : "   <-- differs"}`);
  console.log(`  preview === original: ${preview === held}${preview === held ? "   <-- must be false" : ""}`);
  console.log("");
}
