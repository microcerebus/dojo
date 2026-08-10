/**
 * Frame-content assertions for the heap animation.
 *
 * The frames are precomputed by mutating one array, so a caption or detail line
 * that reads the heap *after* a swap silently describes the wrong values. These
 * tests pin the two lines that name concrete numbers against the state the
 * algorithm actually saw.
 */
import { describe, expect, it } from 'vitest';

import { heapFrames } from './animations';

/** `compared 50 and 4` -> ['50', '4'] */
const parseCompared = (detail: string) => {
  const match = /^compared (\S+) and (\S+)$/.exec(detail);
  return match ? [match[1], match[2]] : null;
};

/** `... Swap with the *smaller* child (4) - ...` -> '4' */
const parseWinner = (caption: string) => {
  const match = /smaller\* child \(([^)]+)\)/.exec(caption);
  return match ? match[1] : null;
};

const siftDownSteps = heapFrames.flatMap((frame, index) =>
  parseCompared(frame.detail) ? [{ frame, index }] : [],
);

describe('heap animation frames', () => {
  it('has sift-down steps to check', () => {
    expect(siftDownSteps.length).toBeGreaterThan(0);
  });

  it('names the child values as they were before the swap', () => {
    for (const { frame, index } of siftDownSteps) {
      const before = heapFrames[index - 1];
      expect(before, `frame ${index} has no predecessor`).toBeDefined();

      // focus is [parent, left, right] clamped to the heap, so focus[0] is the
      // index the sinking element occupied when the comparison was made.
      const parent = frame.focus[0];
      const left = 2 * parent + 1;
      const right = 2 * parent + 2;
      const expected = [
        left < before.heap.length ? String(before.heap[left]) : '—',
        right < before.heap.length ? String(before.heap[right]) : '—',
      ];

      expect(parseCompared(frame.detail), `frame ${index} detail`).toEqual(expected);
    }
  });

  it('agrees with its own caption about which child won', () => {
    for (const { frame, index } of siftDownSteps) {
      const compared = parseCompared(frame.detail) as string[];
      const candidates = compared.filter((value) => value !== '—').map(Number);
      const winner = parseWinner(frame.caption);

      expect(winner, `frame ${index} caption names no winner`).not.toBeNull();
      expect(Number(winner), `frame ${index} must swap with the smaller child`).toBe(
        Math.min(...candidates),
      );
    }
  });

  it('moves the winning child up into the parent slot', () => {
    for (const { frame, index } of siftDownSteps) {
      const parent = frame.focus[0];
      expect(String(frame.heap[parent]), `frame ${index} parent slot`).toBe(
        parseWinner(frame.caption),
      );
    }
  });

  it('ends on a valid min-heap', () => {
    const { heap } = heapFrames[heapFrames.length - 1];
    for (let i = 1; i < heap.length; i++) {
      const parent = (i - 1) >> 1;
      expect(heap[parent], `heap[${parent}] must not exceed heap[${i}]`).toBeLessThanOrEqual(
        heap[i],
      );
    }
  });
});
