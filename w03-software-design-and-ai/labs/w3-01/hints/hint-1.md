# Hint 1

Start with the two fixed consumers. Write down the exact module each one imports. Then open that module in `runtime/challenge/src` and list every `export ... from` line: each is a runtime relationship if it survives in the emitted JavaScript (check `runtime/challenge/dist/index.js` after a build).
