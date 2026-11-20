// Concept snippets: select and update an element, then register a listener.
const result = document.querySelector("#event-result");
if (result !== null) {
  result.textContent = "Ready to inspect an event";
}
const button = document.querySelector("#snippet-button");
if (button !== null && result !== null) {
button.addEventListener("click", (event) => {
  result.textContent = "Received: " + event.type;
});
}
