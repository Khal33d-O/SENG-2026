// has asks about the key; get returns the value (undefined when absent).
const flags = new Map<string, boolean>();
flags.set("archived", false);
const present = flags.has("archived");
const enabled = flags.get("archived") === true;
const absent = flags.get("unknown") === true;
console.log(present, enabled, absent); // true false false
