// Shared component assertions against the original explicit-state functions (supplied).
import { defineComponentSuite } from "./shared.mjs";
import { createFunctionComponent } from "../dist/before.js";

defineComponentSuite("functions", (seed) => createFunctionComponent(seed));
