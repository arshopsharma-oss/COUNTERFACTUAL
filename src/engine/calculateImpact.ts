import type { ColonyState } from "./scenarios/mars-colony";

export type Decision =
  | "protect_energy"
  | "save_water"
  | "grow_food"
  | "boost_oxygen";

export function calculateImpact(
  state: ColonyState,
  decision: Decision
): ColonyState {
  const next = { ...state };

  switch (decision) {
    case "protect_energy":
      next.energy += 12;
      next.integrity += 5;
      next.water -= 4;
      break;

    case "save_water":
      next.water += 12;
      next.morale -= 3;
      next.food -= 2;
      break;

    case "grow_food":
      next.food += 12;
      next.energy -= 7;
      next.water -= 5;
      break;

    case "boost_oxygen":
      next.oxygen += 12;
      next.energy -= 8;
      next.integrity -= 2;
      break;
  }

  // Keep all resources between 0 and 100.
  for (const key of Object.keys(next) as (keyof ColonyState)[]) {
    next[key] = Math.max(0, Math.min(100, next[key]));
  }

  return next;
}