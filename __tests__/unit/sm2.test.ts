import { describe, it, expect } from 'vitest';
import { calculateSM2 } from '@/lib/sm2';

describe('calculateSM2', () => {
  it('resets repetition when quality is below 3', () => {
    const result = calculateSM2({
      quality: 2,
      previousInterval: 6,
      previousRepetition: 3,
      previousEF: 2.5,
    });

    expect(result.repetition).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.easinessFactor).toBe(2.18);
    expect(result.nextReview instanceof Date).toBe(true);
  });

  it('calculates intervals for successive correct answers', () => {
    const first = calculateSM2({
      quality: 4,
      previousInterval: 1,
      previousRepetition: 0,
      previousEF: 2.5,
    });

    expect(first.repetition).toBe(1);
    expect(first.interval).toBe(1);

    const second = calculateSM2({
      quality: 5,
      previousInterval: first.interval,
      previousRepetition: first.repetition,
      previousEF: first.easinessFactor,
    });

    expect(second.repetition).toBe(2);
    expect(second.interval).toBe(6);

    const third = calculateSM2({
      quality: 5,
      previousInterval: second.interval,
      previousRepetition: second.repetition,
      previousEF: second.easinessFactor,
    });

    expect(third.repetition).toBe(3);
    expect(third.interval).toBeGreaterThanOrEqual(14);
  });
});
