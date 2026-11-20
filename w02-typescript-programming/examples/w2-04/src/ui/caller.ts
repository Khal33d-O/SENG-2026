// Knowledge check Question 4. "./rule.js" would select ui/rule.js (legacy);
// "../rule.js" selects the parent directory's rule.js (approved).
import { origin } from "../rule.js";
console.log(origin); // approved
