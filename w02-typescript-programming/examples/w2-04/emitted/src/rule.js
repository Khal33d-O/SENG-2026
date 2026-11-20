// rule.ts
export function twice(value) {
    return value * 2;
}
// Knowledge check Question 4: the required implementation lives in the PARENT directory of ui/.
export const origin = "approved";
// Receives a before-state and an action; returns the after-state.
// An allowed transition returns a NEW object. An ignored pair returns the original object.
export function transition(state, action) {
    if (state.phase === "ready" && action === "start") {
        return { phase: "playing", target: state.target, label: state.label, progress: 0 };
    }
    if (state.phase === "playing" && action === "collect") {
        const nextProgress = state.progress + 1;
        if (nextProgress >= state.target) {
            return { phase: "complete", target: state.target, label: state.label, finalScore: state.target };
        }
        return { phase: "playing", target: state.target, label: state.label, progress: nextProgress };
    }
    // Every other pair is ignored: return the exact original object.
    return state;
}
