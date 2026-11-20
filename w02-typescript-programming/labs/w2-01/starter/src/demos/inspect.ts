// Supplied inspection demonstration (Worked Example 1).
// The saved HTML says "HTML label"; this program replaces the live text after loading.
const inspectionLabel = document.getElementById("inspection-label");

if (!(inspectionLabel instanceof HTMLParagraphElement)) {
  throw new Error('inspect.ts: expected a <p id="inspection-label"> paragraph in this page.');
}

inspectionLabel.textContent = "Script loaded";
