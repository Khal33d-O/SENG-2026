// SUPPLIED: planning prototypes for the W2.10 scope comparison.
// Every proposal uses the same pure rule (rules.ts) and the same isolated tests.
// They differ only in how one action's result is handed to the next call, and in
// which optional enhancements are included. Inspect this file: reading it is
// legitimate evidence. Estimates are scenario units, not measured time.
import { copyState } from "./rules.js";
/** Scenario estimate units for each piece of work (the lab's proposal table). */
export const workUnits = {
    "panel-record": 1, // retains position, score, moves and status; identity list is empty
    "session-record": 3, // retains the complete returned state for the next call
    "completion-connection": 1, // runs the supplied finish rule through the session (always included)
    "acceptance-event-connection": 2, // runs the supplied checks and local recording path (always included)
    "item-labels": 2, // adds readable collected-item labels
    keyboard: 2, // adds arrow-key input
};
export const requiredWork = ["completion-connection", "acceptance-event-connection"];
export const budget = 8;
export const handoffs = ["panel-record", "session-record"];
export const enhancementOptions = ["item-labels", "keyboard"];
/** The three supplied comparison proposals. Every one totals eight units. */
export const proposals = {
    A: { handoff: "panel-record", enhancements: ["item-labels", "keyboard"] },
    B: { handoff: "session-record", enhancements: ["item-labels"] },
    C: { handoff: "session-record", enhancements: ["keyboard"] },
};
export function estimate(plan) {
    let total = workUnits[plan.handoff];
    for (const item of requiredWork)
        total += workUnits[item];
    for (const e of plan.enhancements)
        total += workUnits[e];
    return total;
}
/** Validate untrusted plan data (plan.json). Unsupported or over-budget plans are refused. */
export function parsePlan(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return { ok: false, error: "plan must be a JSON object with handoff and enhancements" };
    }
    const record = value;
    const extra = Object.keys(record).filter((k) => k !== "handoff" && k !== "enhancements");
    if (extra.length > 0)
        return { ok: false, error: `unsupported field(s): ${extra.join(", ")}` };
    const handoff = record.handoff;
    if (typeof handoff !== "string" || !handoffs.includes(handoff)) {
        return { ok: false, error: `handoff must be one of: ${handoffs.join(", ")}` };
    }
    const list = record.enhancements;
    if (!Array.isArray(list))
        return { ok: false, error: "enhancements must be an array (it may be empty)" };
    const enhancements = [];
    for (const item of list) {
        if (typeof item !== "string" || !enhancementOptions.includes(item)) {
            return { ok: false, error: `unknown enhancement: ${JSON.stringify(item)}` };
        }
        if (enhancements.includes(item))
            return { ok: false, error: `duplicate enhancement: ${item}` };
        enhancements.push(item);
    }
    const plan = { handoff: handoff, enhancements };
    const cost = estimate(plan);
    if (cost > budget)
        return { ok: false, error: `estimate ${cost} exceeds the ${budget}-unit budget` };
    return { ok: true, plan };
}
export function describePlan(plan) {
    const extras = plan.enhancements.length ? plan.enhancements.join(", ") : "none";
    return `handoff ${plan.handoff}; enhancements ${extras}; estimate ${estimate(plan)} of ${budget} units`;
}
/**
 * The handoff prototypes: what one action's returned state passes to the NEXT call.
 * The rule result itself is the same in both; only the retained record differs.
 */
export function retain(handoff, returned) {
    if (handoff === "session-record") {
        return copyState(returned); // the complete returned state
    }
    // panel-record: the fields the panel shows as numbers; the identity list is empty.
    return {
        position: { x: returned.position.x, y: returned.position.y },
        movesRemaining: returned.movesRemaining,
        score: returned.score,
        collected: [],
        status: returned.status,
    };
}
//# sourceMappingURL=plans.js.map