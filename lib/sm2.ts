export interface SM2Input {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  previousInterval: number;
  previousRepetition: number;
  previousEF: number;
}

export interface SM2Result {
  interval: number;
  repetition: number;
  easinessFactor: number;
  nextReview: Date;
}

/**
 * SuperMemo-2 algorithm for spaced repetition.
 * quality must be between 0 and 5.
 */
export function calculateSM2({
  quality,
  previousInterval,
  previousRepetition,
  previousEF,
}: SM2Input): SM2Result {
  const safePreviousEF = Math.max(1.3, previousEF);
  let repetition = previousRepetition;
  let interval = previousInterval;

  if (quality < 3) {
    repetition = 0;
    interval = 1;
  } else {
    repetition += 1;

    if (repetition === 1) {
      interval = 1;
    } else if (repetition === 2) {
      interval = 6;
    } else {
      interval = Math.max(1, Math.round(previousInterval * safePreviousEF));
    }
  }

  const easinessFactor = Math.max(
    1.3,
    safePreviousEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    interval,
    repetition,
    easinessFactor: Number(easinessFactor.toFixed(2)),
    nextReview,
  };
}
