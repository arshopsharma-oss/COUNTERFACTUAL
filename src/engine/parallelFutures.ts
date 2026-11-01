import { INITIAL_COLONY_STATE, type ColonyState } from "./scenarios/mars-colony";
import { calculateImpact, type Decision } from "./calculateImpact";

export interface FutureBranch {
  id: string;
  decision: Decision;
  title: string;
  description: string;
  state: ColonyState;
  survivalScore: number;
  changes: Record<keyof ColonyState, number>;
  causalExplanation: string[];
}

const DECISION_DETAILS: Record<
  Decision,
  { title: string; description: string; causes: string[] }
> = {
  protect_energy: {
    title: "Protect Energy Infrastructure",
    description: "Prioritise power systems during the approaching storm.",
    causes: [
      "Energy capacity increases by 12 points.",
      "Structural integrity improves by 5 points.",
      "Water reserves decrease by 4 points.",
    ],
  },
  save_water: {
    title: "Conserve Water",
    description: "Preserve water reserves at the cost of other needs.",
    causes: [
      "Water reserves increase by 12 points.",
      "Morale decreases by 3 points.",
      "Food reserves decrease by 2 points.",
    ],
  },
  grow_food: {
    title: "Expand Food Production",
    description: "Increase food production despite resource pressure.",
    causes: [
      "Food reserves increase by 12 points.",
      "Energy capacity decreases by 7 points.",
      "Water reserves decrease by 5 points.",
    ],
  },
  boost_oxygen: {
    title: "Prioritise Oxygen",
    description: "Increase oxygen capacity to protect the colony.",
    causes: [
      "Oxygen capacity increases by 12 points.",
      "Energy capacity decreases by 8 points.",
      "Structural integrity decreases by 2 points.",
    ],
  },
};

const DECISIONS: Decision[] = [
  "protect_energy",
  "save_water",
  "grow_food",
  "boost_oxygen",
];

function calculateScore(state: ColonyState): number {
  const values = Object.values(state);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function generateParallelFutures(
  initialState: ColonyState = INITIAL_COLONY_STATE
): FutureBranch[] {
  return DECISIONS.map((decision, index) => {
    const state = calculateImpact({ ...initialState }, decision);
    const details = DECISION_DETAILS[decision];

    const changes = {} as Record<keyof ColonyState, number>;

    (Object.keys(initialState) as (keyof ColonyState)[]).forEach((key) => {
      changes[key] = state[key] - initialState[key];
    });

    return {
      id: `future-${index + 1}`,
      decision,
      title: details.title,
      description: details.description,
      state,
      survivalScore: calculateScore(state),
      changes,
      causalExplanation: details.causes,
    };
  });
}
