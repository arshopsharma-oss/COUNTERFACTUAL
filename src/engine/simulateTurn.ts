import type { ColonyState } from "./scenarios/mars-colony";
import { calculateImpact, type Decision } from "./calculateImpact";

export interface SimulationResult {
  turn: number;
  decision: Decision;
  previousState: ColonyState;
  newState: ColonyState;
  survivalScore: number;
}

export function simulateTurn(
  state: ColonyState,
  decision: Decision,
  turn: number
): SimulationResult {
  const newState = calculateImpact(state, decision);

  const survivalScore = Math.round(
    (newState.oxygen +
      newState.food +
      newState.energy +
      newState.water +
      newState.morale +
      newState.integrity) / 6
  );

  return {
    turn,
    decision,
    previousState: { ...state },
    newState,
    survivalScore,
  };
}