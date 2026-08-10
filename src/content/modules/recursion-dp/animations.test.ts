/**
 * Frame assertions. Every claim these animations make in a caption is
 * recomputed here from an independent implementation, so the narration cannot
 * drift away from what the frames actually contain.
 */
import { describe, expect, it } from 'vitest';

import {
  BOARD,
  COLS,
  ROOT_N,
  ROWS,
  SET,
  allCalls,
  queenFrames,
  subsetFrames,
  tableFrames,
  treeFrames,
} from './animations';

describe('rdp-memo-tree', () => {
  /** Independent reference for ways(n) with hops of 1, 2 or 3. */
  const tripleStep = (n: number): number =>
    n === 0 ? 1 : [n - 1, n - 2, n - 3].filter((k) => k >= 0).reduce((sum, k) => sum + tripleStep(k), 0);

  it('reports the true answer', () => {
    const last = treeFrames[treeFrames.length - 1];
    expect(last.caption).toContain(`${tripleStep(ROOT_N)} ways`);
  });

  it('makes one call per distinct argument, and no more', () => {
    const last = treeFrames[treeFrames.length - 1];
    // Arguments 0..ROOT_N are the only subproblems that exist.
    expect(last.calls).toBe(ROOT_N + 1);
    expect(last.calls).toBeLessThan(allCalls.length);
    expect(last.caption).toContain(`${last.calls} calls instead of ${allCalls.length}`);
  });

  it('accounts for every node as either run, hit or skipped', () => {
    const last = treeFrames[treeFrames.length - 1];
    const states = Object.values(last.states);
    const hits = states.filter((state) => state === 'target').length;
    const muted = states.filter((state) => state === 'muted').length;
    const done = states.filter((state) => state === 'done').length;
    expect(done + hits + muted).toBe(allCalls.length);
    expect(last.saved).toBe(muted);
  });

  it('never mutes a node without a cache hit above it', () => {
    for (const frame of treeFrames) {
      const muted = Object.entries(frame.states).filter(([, state]) => state === 'muted');
      for (const [id] of muted) {
        const ancestors = Object.keys(frame.states).filter(
          (other) => id.startsWith(`${other}-`) && other !== id,
        );
        expect(
          ancestors.some((ancestor) => frame.states[ancestor] === 'target'),
          `${id} muted with no cache hit above it`,
        ).toBe(true);
      }
    }
  });
});

describe('rdp-dp-table', () => {
  /** Independent LCS length, computed without the frame machinery. */
  const lcs = (a: string, b: string): number => {
    if (a.length === 0 || b.length === 0) return 0;
    return a[a.length - 1] === b[b.length - 1]
      ? lcs(a.slice(0, -1), b.slice(0, -1)) + 1
      : Math.max(lcs(a.slice(0, -1), b), lcs(a, b.slice(0, -1)));
  };

  const final = tableFrames[tableFrames.length - 1];

  it('fills every cell with the value the recurrence gives', () => {
    for (let r = 1; r <= ROWS.length; r++) {
      for (let c = 1; c <= COLS.length; c++) {
        expect(final.values[r][c], `dp[${r}][${c}]`).toBe(lcs(ROWS.slice(0, r), COLS.slice(0, c)));
      }
    }
  });

  it('has a zero base row and column', () => {
    expect(final.values[0].every((value) => value === 0)).toBe(true);
    expect(final.values.every((row) => row[0] === 0)).toBe(true);
  });

  it('reads only cells that are already filled', () => {
    for (const frame of tableFrames) {
      if (frame.current === null) continue;
      for (const [r, c] of frame.deps) {
        expect(frame.values[r][c], `dep ${r},${c}`).not.toBeNull();
      }
    }
  });

  it('names a subsequence that is genuinely common and the right length', () => {
    const quoted = final.caption.match(/for "([A-Z]*)"/)?.[1];
    expect(quoted).toBeDefined();
    const isSubsequenceOf = (needle: string, haystack: string) => {
      let i = 0;
      for (const ch of haystack) if (ch === needle[i]) i++;
      return i === needle.length;
    };
    expect(isSubsequenceOf(quoted as string, ROWS)).toBe(true);
    expect(isSubsequenceOf(quoted as string, COLS)).toBe(true);
    expect((quoted as string).length).toBe(lcs(ROWS, COLS));
    expect(final.caption).toContain(`the answer: ${lcs(ROWS, COLS)}`);
  });
});

describe('rdp-n-queens', () => {
  const final = queenFrames[queenFrames.length - 1];

  it('ends on a genuine solution', () => {
    expect(final.placed).toHaveLength(BOARD);
    for (let a = 0; a < BOARD; a++) {
      for (let b = a + 1; b < BOARD; b++) {
        expect(final.placed[a], `columns ${a},${b}`).not.toBe(final.placed[b]);
        expect(Math.abs(final.placed[a] - final.placed[b]), `diagonal ${a},${b}`).not.toBe(b - a);
      }
    }
  });

  it('never renders a rejected column that is actually safe', () => {
    for (const frame of queenFrames) {
      for (const col of frame.rejected) {
        const attacked = frame.placed.some(
          (other, otherRow) =>
            other === col || Math.abs(other - col) === Math.abs(otherRow - frame.row),
        );
        expect(attacked, `row ${frame.row} col ${col} marked attacked`).toBe(true);
      }
      const chosen = frame.chosen;
      if (chosen === null) continue;
      const attacked = frame.placed.some(
        (other, otherRow) =>
          other === chosen || Math.abs(other - chosen) === Math.abs(otherRow - frame.row),
      );
      expect(attacked, `row ${frame.row} col ${chosen} chosen`).toBe(false);
    }
  });

  it('counts fewer placements than the exhaustive space it claims to beat', () => {
    expect(final.caption).toContain(`${BOARD ** BOARD} boards`);
    expect(final.attempts).toBeLessThan(BOARD ** BOARD);
    expect(final.caption).toContain(`${final.attempts} placements`);
    expect(final.caption).toContain(`${final.backtracks} backtracks`);
  });
});

describe('rdp-subsets-bits', () => {
  it('enumerates every subset exactly once', () => {
    const masks = subsetFrames.map((frame) => frame.mask).filter((mask) => mask >= 0);
    // The final frame repeats the last mask as a summary, so dedupe first.
    expect(new Set(masks).size).toBe(1 << SET.length);
    expect(Math.max(...masks)).toBe((1 << SET.length) - 1);
    expect(Math.min(...masks)).toBe(0);
  });

  it('states the subset count the set actually has', () => {
    expect(subsetFrames[0].caption).toContain(`${1 << SET.length} subsets`);
    expect(subsetFrames[0].caption).toContain(`${SET.length}-element set`);
  });
});
