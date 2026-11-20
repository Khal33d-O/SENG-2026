// Prepared inspection (npm run inspect). For each implementation it prints a direct-call observation,
// then a separate fresh registration and the result of sending East through that port.
// It catches an error to print its name and message: a successful inspection is NOT a passing caller test.
import { initialState } from "./rules.js";
import type { Component } from "./contract.js";
import { createFunctionComponent } from "./before.js";
import { GameComponent, connect } from "./component.js";

const show = (value: unknown): string => JSON.stringify(value);

function inspect(label: string, create: () => Component): void {
  const direct = create();
  direct.move("east");
  console.log(`[${label}] direct game.move("east") -> ${show(direct.snapshot())}`);

  const game = create();
  const port = connect(game);
  console.log(`[${label}] after registration: calls=${port.calls} state=${show(game.snapshot())}`);
  try {
    port.send("east");
    console.log(`[${label}] after port.send("east"): calls=${port.calls} state=${show(game.snapshot())}`);
  } catch (error) {
    const e = error instanceof Error ? error : new Error(String(error));
    console.log(`[${label}] port.send("east") threw ${e.name}: ${e.message}`);
    console.log(`[${label}] last known: calls=${port.calls} state=${show(game.snapshot())}`);
  }
}

inspect("functions", () => createFunctionComponent(initialState()));
inspect("class", () => new GameComponent(initialState()));
