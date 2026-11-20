# checkpoints/

Source versions used by `tools.mjs`. Do not edit them, and do not copy them by hand: use the commands so
your current work is preserved first.

| File | Used by | Contents |
|---|---|---|
| `costly.seed.ts` | `node tools.mjs seed` | The original seeded rule, `tile.cost >= threshold` (inclusive). |
| `costly.corrected.ts` | `node tools.mjs checkpoint` | The demonstrated bounded correction, `tile.cost > threshold`. |

Backups made by the commands are written to `backups/<reason>-<date>-<time>-<random>/`, one new folder each
time. The folder path is printed after `PRESERVED`.
