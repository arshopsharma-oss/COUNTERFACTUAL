export interface WhatIfBranch {
  id: string;
  title: string;
  score: number;
  consequence: string;
  assumption: string;
}

export function exploreWhatIf(prompt: string): WhatIfBranch[] {
  const seed = [...prompt.toLowerCase()].reduce(
    (total, char) => total + char.charCodeAt(0), 0
  );

  const lenses = [
    {
      title: "THE OPTIMISTIC TIMELINE",
      consequence: "The initial change creates an opportunity. New systems emerge, cooperation increases, and secondary effects amplify the original shift.",
      assumption: "Resources and coordination remain sufficient."
    },
    {
      title: "THE COLLATERAL TIMELINE",
      consequence: "An unexpected side effect becomes significant. Solving the original problem creates pressure somewhere else in the system.",
      assumption: "The change has indirect consequences."
    },
    {
      title: "THE CASCADE TIMELINE",
      consequence: "One small event triggers a chain of connected changes. The final outcome becomes very different from the starting conditions.",
      assumption: "Multiple dependent systems react to the change."
    },
    {
      title: "THE FRAGILE TIMELINE",
      consequence: "The new reality develops, but a critical dependency becomes unstable. A small disruption could reverse the apparent progress.",
      assumption: "The system has limited tolerance for unexpected events."
    }
  ];

  return lenses.map((lens, index) => ({
    id: `what-if-${index}`,
    title: lens.title,
    score: 45 + ((seed * (index + 3) + index * 17) % 51),
    consequence: lens.consequence,
    assumption: lens.assumption
  }));
}
