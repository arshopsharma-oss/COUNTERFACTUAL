import { INITIAL_COLONY_STATE } from "./scenarios/mars-colony";
import { simulateTurn } from "./simulateTurn";

const result = simulateTurn(
  INITIAL_COLONY_STATE,
  "protect_energy",
  1
);

console.log("COUNTERFACTUAL ENGINE TEST");
console.log("Previous State:", result.previousState);
console.log("New Future:", result.newState);
console.log("Survival Score:", result.survivalScore);