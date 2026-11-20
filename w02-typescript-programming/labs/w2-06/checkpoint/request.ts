// CHECKPOINT (recovery only) - a PARTIAL request: shape guard and numeric floor, but NOT the
// occupancy relation between treasures and walls. Its acceptance is deliberately incomplete:
// "Treasure on a wall" responses are still published. Using it does not count as completed work.
import { isBoardShape } from "./board-shape.js";
import { publishDefinition } from "./adapter.js";
import { errorMessage, setBusy, showRequest } from "./request-ui.js";

const BOARD_PATH = "/api/boards/reference";

export async function loadBoard(): Promise<void> {
  setBusy(true);
  showRequest("loading", "Retrieving board data.");
  try {
    const response = await fetch(BOARD_PATH);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const value: unknown = await response.json();
    if (!isBoardShape(value)) throw new Error("Invalid board shape");
    if (!Number.isInteger(value.initialMoves) || value.initialMoves <= 0) throw new Error("Invalid move budget");
    // TODO (yours): the occupancy decision across the complete treasure and wall collections.
    publishDefinition(value);
    showRequest("success", "Board definition accepted (checkpoint: occupancy NOT checked).");
  } catch (error) {
    showRequest("failure", errorMessage(error));
  } finally {
    setBusy(false);
  }
}
