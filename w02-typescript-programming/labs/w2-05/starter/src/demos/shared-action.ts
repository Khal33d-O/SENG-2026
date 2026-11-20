// Worked Example 2: spend a lantern charge through two inputs.
// Both the button and the L key call the same action function, useLantern.
// Neither handler contains the charge calculation.

// The supplied rule: subtract one when possible; zero stays zero.
function spendCharge(current: number): number {
  return current > 0 ? current - 1 : 0;
}

const chargeDisplay = document.querySelector("#charge");
const lanternButton = document.querySelector("#use-lantern");

let charges = 2;

// The renderer only describes a value that has already been calculated.
function showCharge(value: number): void {
  if (chargeDisplay !== null) chargeDisplay.textContent = "Lantern charges: " + value;
}

// The shared action: retain the rule's result first, then render it.
function useLantern(): void {
  charges = spendCharge(charges); // assignment, not comparison
  showCharge(charges);
}

// Register the function value useLantern - not useLantern(), which would run now.
lanternButton?.addEventListener("click", useLantern);

document.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.repeat) return;
  if (event.key === "l" || event.key === "L") useLantern();
});

showCharge(charges);
