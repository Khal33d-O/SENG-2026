// SUPPLIED: a play session composed from a plan. The browser page and the plan
// checker (npm run plan) both use this, so they exercise the same connections.
import { copyState, evaluate, initialState } from "./rules.js";
import { retain } from "./plans.js";
import { referenceBoard } from "./reference.js";
/** Start a fresh session from the public start of `board`. */
export function startSession(plan, board = referenceBoard) {
    let retained = initialState(board);
    let sequence = 0;
    return {
        plan,
        current: () => copyState(retained),
        act(direction) {
            sequence += 1;
            const before = copyState(retained);
            const action = { type: "move", direction };
            const result = evaluate(board, before, action);
            retained = retain(plan.handoff, result.state);
            return {
                sequence,
                action,
                accepted: result.accepted,
                reason: result.reason,
                before,
                after: copyState(result.state),
                retained: copyState(retained),
            };
        },
    };
}
export function formatState(s) {
    const ids = s.collected.length ? s.collected.join(",") : "none";
    return `position (${s.position.x},${s.position.y}) · moves ${s.movesRemaining} · score ${s.score} · collected ${ids} · ${s.status}`;
}
//# sourceMappingURL=session.js.map