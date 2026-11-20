// YOUR FILE: complete loadBoard so the page retrieves the reference board DEFINITION,
// checks the actual response and reports its outcome.
// Loading a definition is an inspection: never start a new game, replace the position
// or replenish remaining moves. The current game state belongs to controls.ts.
import { isBoardShape } from "./board-shape.js";
import { publishDefinition } from "./adapter.js";
import { errorMessage, setBusy, showRequest } from "./request-ui.js";

// The existing relative, same-origin API path. Keep it.
const BOARD_PATH = "/api/boards/reference";

export async function loadBoard(): Promise<void> {
  // Guided practice (Task 1): replace this idle message with
  //   showRequest("loading", "Retrieving board data.");
  showRequest("idle", "No request sent yet.");

  // Lab challenge (Tasks 2-4), all inside this one async function:
  //   * setBusy(true) and the loading message before waiting;
  //     arrange cleanup so another attempt is possible after EITHER outcome
  //   * try { const response = await fetch(BOARD_PATH); check the HTTP outcome;
  //           const value: unknown = await response.json(); ... }
  //   * isBoardShape(value) before any board field; on false: throw new Error("Invalid board shape")
  //   * keep the supported numeric floor (Task 4): "Invalid move budget"
  //   * your own decision across the complete treasure and wall collections: "Blocked treasure"
  //   * publishDefinition(value) and the success message ONLY on the accepted path
  //   * catch: showRequest("failure", errorMessage(error))
  //
  // The lines below only keep the supplied imports referenced; remove them as you use each one.
  void BOARD_PATH;
  void isBoardShape;
  void publishDefinition;
  void errorMessage;
  void setBusy;
}
