// Supplied: page start-up and the ONE event binding for "Load board data".
// Keep this binding; registering another listener would send the request more than once.
import { startGame } from "./controls.js";
import { startSelector } from "./fixture-selector.js";
import { loadBoard } from "./request.js";

startGame();
startSelector();

document.querySelector<HTMLButtonElement>("#load-board")?.addEventListener("click", () => {
  void loadBoard();
});
