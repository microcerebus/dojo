/**
 * Frame assertions: every number a caption quotes is recomputed here from an
 * independent implementation, and every invariant an animation claims to hold
 * is checked on the frames themselves.
 */
import { describe, expect, it } from 'vitest';

import {
  GRID,
  NEEDLE,
  ROTATED,
  TARGET,
  gridFrames,
  mergeFrames,
  partitionFrames,
  rotatedFrames,
} from './animations';

const sorted = (values: number[]) => [...values].sort((a, b) => a - b);

describe('ss-merge-sort', () => {
  const first = mergeFrames[0];
  const last = mergeFrames[mergeFrames.length - 1];

  it('ends sorted, with the same multiset it started from', () => {
    expect(last.array).toEqual(sorted(first.array));
    expect(sorted(last.array)).toEqual(sorted(first.array));
  });

  it('only ever writes inside the range it says it is merging', () => {
    for (const frame of mergeFrames) {
      if (frame.write === null || frame.range === null) continue;
      expect(frame.write).toBeGreaterThanOrEqual(frame.range[0]);
      expect(frame.write).toBeLessThanOrEqual(frame.range[1]);
    }
  });

  it('quotes the number of helper copies it actually made', () => {
    const copies = mergeFrames.reduce((most, frame) => Math.max(most, frame.copies), 0);
    expect(last.copies).toBe(copies);
    expect(last.caption).toContain(`${copies} elements copied`);
  });

  it('leaves the already-merged prefix of each range in order', () => {
    for (const frame of mergeFrames) {
      if (frame.range === null || frame.write === null) continue;
      const written = frame.array.slice(frame.range[0], frame.write);
      expect(written, `range ${frame.range.join('..')}`).toEqual(sorted(written));
    }
  });
});

describe('ss-quick-partition', () => {
  const first = partitionFrames[0];
  const settled = partitionFrames.filter((frame) => frame.settled)[0];

  it('holds the partition invariant it claims at the boundary', () => {
    const boundary = settled.left;
    for (let i = 0; i < boundary; i++) {
      expect(settled.array[i], `index ${i} left of boundary`).toBeLessThanOrEqual(settled.pivot);
    }
    for (let i = boundary; i < settled.array.length; i++) {
      expect(settled.array[i], `index ${i} right of boundary`).toBeGreaterThanOrEqual(settled.pivot);
    }
    expect(settled.caption).toContain(`index ${boundary}`);
  });

  it('only ever swaps, so the multiset never changes', () => {
    for (const frame of partitionFrames) {
      expect(sorted(frame.array), 'array is a permutation of the input').toEqual(
        sorted(first.array),
      );
    }
  });

  it('picks a pivot that is one of the elements', () => {
    expect(first.array).toContain(first.pivot);
    expect(first.caption).toContain(`${first.pivot}`);
  });
});

describe('ss-rotated-search', () => {
  const found = rotatedFrames.filter((frame) => frame.found && frame.mid !== null)[0];

  it('finds the target at an index that really holds it', () => {
    expect(found).toBeDefined();
    expect(ROTATED[found.mid as number]).toBe(TARGET);
    expect(found.caption).toContain(`index ${found.mid}`);
    expect(found.caption).toContain(`${ROTATED.length}-element`);
  });

  it('never widens the search window', () => {
    let width = ROTATED.length;
    for (const frame of rotatedFrames) {
      if (frame.lo > frame.hi) continue;
      const next = frame.hi - frame.lo + 1;
      expect(next).toBeLessThanOrEqual(width);
      width = next;
    }
  });

  it('identifies the genuinely sorted half at every step', () => {
    for (const frame of rotatedFrames) {
      if (frame.mid === null || frame.leftSorted === null) continue;
      const half = frame.leftSorted
        ? ROTATED.slice(frame.lo, frame.mid + 1)
        : ROTATED.slice(frame.mid, frame.hi + 1);
      expect(half, `window ${frame.lo}..${frame.hi}`).toEqual(sorted(half));
    }
  });

  it('probes no more often than a binary search would', () => {
    expect(found.steps).toBeLessThanOrEqual(Math.ceil(Math.log2(ROTATED.length)) + 1);
  });
});

describe('ss-matrix-corner', () => {
  const found = gridFrames[gridFrames.length - 1];

  it('lands on the value it was looking for', () => {
    expect(found.found).toBe(true);
    expect(GRID[found.row][found.col]).toBe(NEEDLE);
    expect(found.caption).toContain(`row ${found.row}, column ${found.col}`);
  });

  it('eliminates exactly one line per comparison', () => {
    expect(found.killedRows.length + found.killedCols.length).toBe(found.steps - 1);
    expect(found.steps).toBeLessThanOrEqual(GRID.length + GRID[0].length);
    expect(found.caption).toContain(`${found.steps} comparisons`);
  });

  it('never discards the line the answer is actually on', () => {
    const answerRow = GRID.findIndex((line) => line.includes(NEEDLE));
    const answerCol = GRID[answerRow].indexOf(NEEDLE);
    for (const frame of gridFrames) {
      expect(frame.killedRows, `row ${answerRow} eliminated`).not.toContain(answerRow);
      expect(frame.killedCols, `column ${answerCol} eliminated`).not.toContain(answerCol);
    }
  });

  it('only ever adds to the eliminated set', () => {
    let rows = 0;
    let cols = 0;
    for (const frame of gridFrames) {
      expect(frame.killedRows.length).toBeGreaterThanOrEqual(rows);
      expect(frame.killedCols.length).toBeGreaterThanOrEqual(cols);
      rows = frame.killedRows.length;
      cols = frame.killedCols.length;
    }
  });
});
