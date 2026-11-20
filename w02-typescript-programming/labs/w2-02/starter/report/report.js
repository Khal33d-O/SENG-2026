// Supplied browser report: executes the emitted calculation in the browser.
// No event handlers are needed; the table is built once when the page loads.
import { cases, freshInitial } from "../cases.mjs";
import { calculate } from "../dist/calculate.js";

const fields = (s) => `score ${s.score}, actions ${s.actionsRemaining}, completed ${s.completed}`;
const same = (a, b) =>
  a.score === b.score && a.actionsRemaining === b.actionsRemaining && a.completed === b.completed;

const body = document.querySelector("#report tbody");
let passed = 0;

for (const c of cases) {
  const initial = freshInitial(c);
  const held = initial; // the comparison column's reference, taken before the call
  const preview = calculate(initial, c.requested, c.points);
  const fieldsOk = same(preview, c.expected);
  const originalOk = same(held, c.initial);
  const fresh = preview !== held;
  const ok = fieldsOk && originalOk && fresh;
  if (ok) passed = passed + 1;

  const row = document.createElement("tr");
  row.dataset.case = c.name;
  const cells = [
    [c.name, ""],
    [`${c.requested} / ${c.points}`, ""],
    [fields(held), originalOk ? "pass" : "fail"],
    [fields(preview), fieldsOk ? "pass" : "fail"],
    [fields(c.expected), ""],
    [fresh ? "separate object" : "same object as original", fresh ? "pass" : "fail"],
    [ok ? "match" : "mismatch", ok ? "pass" : "fail"],
  ];
  for (const [text, cls] of cells) {
    const cell = document.createElement("td");
    cell.textContent = text;
    if (cls) cell.className = cls;
    row.append(cell);
  }
  body.append(row);
}

document.querySelector("#summary").textContent =
  `Report loaded: ${passed} of ${cases.length} cases match (fields, original and identity).`;
