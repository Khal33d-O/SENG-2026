// checks/harness.mjs - shared checking code for the supplied runners.
// The runners import the EMITTED JavaScript from dist/src/, so always build first
// (every npm script runs tsc before node). Do not run stale dist/ output directly.
import { transition } from "../dist/src/rule.js";
import { callRule, callFromReplay } from "../dist/src/caller.js";

// The three entry points every record is checked through.
export const entryPoints = [
  { name: "transition", call: transition },
  { name: "callRule", call: callRule },
  { name: "callFromReplay", call: callFromReplay },
];

const show = (value) => JSON.stringify(value);

// Deep structural equality for plain JSON-like objects (same keys, same values).
export function sameValues(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.hasOwn(b, key) && sameValues(a[key], b[key]));
}

// Runs one record through one entry point. Returns null on success, or a failure message
// that names the claim that was wrong: changed old object, returned value, or identity.
export function checkRecord(record, entry) {
  const input = structuredClone(record.before); // the object passed as the argument
  const observer = input;                       // a retained reference (a history viewer)
  const snapshot = structuredClone(input);      // what the observer saw before the call
  const where = `${record.name} via ${entry.name}(${show(record.before)}, "${record.action}")`;

  let result;
  try {
    result = entry.call(input, record.action);
  } catch (error) {
    return `${where}: threw ${error?.name ?? "Error"}: ${error?.message ?? error}`;
  }

  if (!sameValues(observer, snapshot)) {
    return `${where}: changed old object - the retained input now shows ${show(observer)}; expected it to stay ${show(snapshot)}`;
  }
  if (!sameValues(result, record.after)) {
    return `${where}: returned value differs - expected ${show(record.after)}; received ${show(result)}`;
  }
  if (record.same && result !== input) {
    return `${where}: identity - expected the SAME object (ignored pair); received a new object with equal values`;
  }
  if (!record.same && result === input) {
    return `${where}: identity - expected a NEW object (allowed transition); received the original input object`;
  }
  return null;
}
