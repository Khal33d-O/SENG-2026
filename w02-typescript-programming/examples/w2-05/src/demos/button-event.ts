// Worked Example 1: inspect a button event without moving the game.
// Selecting the button only obtains a reference; it neither clicks the button nor
// calls any game rule. The listener records event facts on the page.

const button = document.querySelector("#inspect-button");
const result = document.querySelector("#event-result");

// Check both results before using them: querySelector can return null.
if (button !== null && result !== null) {
  let received = 0;
  button.addEventListener("click", (event) => {
    received += 1;
    // currentTarget = the element whose listener is running (the button).
    // target = where the event started (the nested label span, or the button itself
    // when Enter or Space activates the focused button).
    const current = event.currentTarget instanceof Element ? event.currentTarget.id : "unknown";
    const target = event.target instanceof Element ? event.target.id : "unknown";
    result.textContent =
      "Events received: " + received + " · type: " + event.type + " · current target: " + current + " · target: " + target;
    // Optional: console.log(event) shows every property in developer tools.
  });
}
