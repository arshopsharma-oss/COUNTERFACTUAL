export interface ColonyState {
  oxygen: number;
  food: number;
  energy: number;
  water: number;
  morale: number;
  integrity: number;
}

export const INITIAL_COLONY_STATE: ColonyState = {
  oxygen: 78,
  food: 65,
  energy: 70,
  water: 55,
  morale: 80,
  integrity: 90,
};

export const MARS_SCENARIO = {
  id: "mars-dust-storm",
  name: "The Dust Storm",
  description:
    "A massive dust storm is approaching the Mars colony. Energy infrastructure is at risk. Every decision could change the colony's future.",
  initialState: INITIAL_COLONY_STATE,
};