// Shared component assertions against the complete demonstrated class (supplied).
import { defineComponentSuite } from "./shared.mjs";
import { DemoComponent } from "../dist/demo-class.js";

defineComponentSuite("demo class", (seed) => new DemoComponent(seed));
