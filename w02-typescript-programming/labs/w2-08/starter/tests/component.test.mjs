// Shared component assertions against YOUR class (supplied: do not edit).
import { defineComponentSuite } from "./shared.mjs";
import { GameComponent } from "../dist/component.js";

defineComponentSuite("your class", (seed) => new GameComponent(seed));
