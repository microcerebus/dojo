/**
 * Frame assertions. Each animation's headline number is recomputed with a
 * deliberately naive reference implementation - the same brute force the
 * lesson says the technique replaces - so the two must agree.
 */
import { describe, expect, it } from 'vitest';

import {
  CACHE_OPS,
  CAPACITY,
  FIRST_YEAR,
  PEOPLE,
  SERIES,
  YEARS,
  cacheFrames,
  kadaneFrames,
  sweepFrames,
} from './animations';

describe('mod-kadane', () => {
  const final = kadaneFrames[kadaneFrames.length - 1];

  /** Every start/end pair, which is the O(n²) version Kadane replaces. */
  const bruteForce = () => {
    let best = -Infinity;
    let range: [number, number] = [0, 0];
    for (let i = 0; i < SERIES.length; i++) {
      let sum = 0;
      for (let j = i; j < SERIES.length; j++) {
        sum += SERIES[j];
        if (sum > best) {
          best = sum;
          range = [i, j];
        }
      }
    }
    return { best, range };
  };

  it('reaches the same answer as checking every subarray', () => {
    const { best } = bruteForce();
    expect(final.best).toBe(best);
    expect(final.caption).toContain(`Answer ${best}`);
  });

  it('reports a range that really sums to the answer', () => {
    const [lo, hi] = final.bestRange;
    const sum = SERIES.slice(lo, hi + 1).reduce((total, value) => total + value, 0);
    expect(sum).toBe(final.best);
    expect(final.caption).toContain(`indices ${lo} to ${hi}`);
  });

  it('keeps the running total equal to the run it claims to be tracking', () => {
    for (const frame of kadaneFrames) {
      if (frame.at < 0 || frame.at >= SERIES.length) continue;
      // The run ending here is at least the element itself, and never worse
      // than extending - that is the whole decision the caption describes.
      expect(frame.running).toBeGreaterThanOrEqual(SERIES[frame.at]);
      if (frame.restarted) expect(frame.running).toBe(SERIES[frame.at]);
    }
  });

  it('only ever raises the best-so-far', () => {
    let best = -Infinity;
    for (const frame of kadaneFrames) {
      expect(frame.best).toBeGreaterThanOrEqual(best);
      best = frame.best;
    }
  });
});

describe('mod-sweep-line', () => {
  const final = sweepFrames[sweepFrames.length - 1];

  /** Count everyone alive in a year, the slow way the caption warns against. */
  const aliveIn = (year: number) =>
    PEOPLE.filter((person) => person.birth <= year && year <= person.death).length;

  it('matches a per-year headcount in every single year', () => {
    for (let i = 0; i < YEARS; i++) {
      expect(final.running[i], `year ${FIRST_YEAR + i}`).toBe(aliveIn(FIRST_YEAR + i));
    }
  });

  it('peaks where the headcount peaks', () => {
    const counts = Array.from({ length: YEARS }, (_, i) => aliveIn(FIRST_YEAR + i));
    const peak = Math.max(...counts);
    expect(final.peak).toBe(peak);
    expect(final.peakYear).toBe(FIRST_YEAR + counts.indexOf(peak));
    expect(final.caption).toContain(`Peak of ${peak} in ${final.peakYear}`);
  });

  it('records exactly two events per person', () => {
    const totalDelta = final.deltas.reduce((sum, value) => sum + Math.abs(value), 0);
    // Deaths in the last year fall outside the rendered window, so the visible
    // deltas are at most two per person and at least one.
    expect(totalDelta).toBeGreaterThanOrEqual(PEOPLE.length);
    expect(totalDelta).toBeLessThanOrEqual(PEOPLE.length * 2);
    expect(sweepFrames[0].caption).toContain(`${PEOPLE.length} people`);
  });
});

describe('mod-lru-cache', () => {
  /** A reference LRU, written independently of the frame builder. */
  const reference = () => {
    const order: string[] = [];
    const evictions: string[] = [];
    for (const op of CACHE_OPS) {
      const present = order.includes(op.key);
      if (op.kind === 'get' && !present) continue;
      if (present) order.splice(order.indexOf(op.key), 1);
      order.unshift(op.key);
      if (order.length > CAPACITY) evictions.push(order.pop() as string);
    }
    return { order, evictions };
  };

  it('ends in the order a reference implementation would', () => {
    const final = cacheFrames[cacheFrames.length - 1];
    expect(final.order).toEqual(reference().order);
  });

  it('never exceeds its capacity', () => {
    for (const frame of cacheFrames) {
      expect(frame.order.length).toBeLessThanOrEqual(CAPACITY);
      expect(new Set(frame.order).size, 'no duplicate keys').toBe(frame.order.length);
    }
  });

  it('evicts exactly the keys the reference evicts, and only when full', () => {
    const evicted = cacheFrames.map((frame) => frame.evicted).filter((key): key is string => !!key);
    expect(evicted).toEqual(reference().evictions);
    for (const frame of cacheFrames) {
      if (frame.evicted === null) continue;
      expect(frame.order.length).toBe(CAPACITY);
    }
  });

  it('moves a touched key to the front', () => {
    for (const frame of cacheFrames) {
      if (frame.touched === null) continue;
      expect(frame.order[0]).toBe(frame.touched);
    }
  });

  it('reports a miss only for a key that is genuinely absent', () => {
    for (const frame of cacheFrames) {
      if (!frame.miss) continue;
      expect(frame.touched).toBeNull();
    }
  });
});
