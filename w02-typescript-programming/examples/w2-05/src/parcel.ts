// Syntax for the Task 4 feedback decision (runs in Node.js or the browser).
const parcel = { size: "large", labelled: true, sealed: false };
const isLarge = parcel.size === "large"; // true
const ready = parcel.labelled && parcel.sealed; // false
let description = "Parcel";
if (isLarge) { description += " needs a large shelf"; }
if (!ready) { description += " - not ready to send"; }
console.log(description); // Parcel needs a large shelf - not ready to send
