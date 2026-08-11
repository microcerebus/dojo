/**
 * Frame assertions. Each of these animations replaces a brute force with
 * something cleverer, so the reference implementation here is the brute force -
 * if the two ever disagree the animation is teaching the wrong answer.
 */
import { describe, expect, it } from 'vitest';

import {
  FREQ,
  GOAL,
  HEIGHTS,
  NAMES,
  PAIRS,
  START,
  WORDS,
  ladderFrames,
  unionFrames,
  waterFrames,
} from './animations';

describe('hard-trapping-water', () => {
  const final = waterFrames[waterFrames.length - 1];

  /** The O(n) two-array version, which is the baseline the lesson describes. */
  const reference = () => {
    const leftMax = HEIGHTS.map((_, i) => Math.max(...HEIGHTS.slice(0, i + 1)));
    const rightMax = HEIGHTS.map((_, i) => Math.max(...HEIGHTS.slice(i)));
    return HEIGHTS.map((h, i) => Math.min(leftMax[i], rightMax[i]) - h);
  };

  it('traps exactly as much water as the two-array version', () => {
    const expected = reference();
    expect(final.water).toEqual(expected);
    const total = expected.reduce((sum, value) => sum + value, 0);
    expect(final.total).toBe(total);
    expect(final.caption).toContain(`${total} units of water`);
  });

  it('never claims water below the level of both bounding maxima', () => {
    for (const frame of waterFrames) {
      frame.water.forEach((depth, i) => {
        if (depth === 0) return;
        const bound = Math.min(Math.max(...HEIGHTS.slice(0, i + 1)), Math.max(...HEIGHTS.slice(i)));
        expect(HEIGHTS[i] + depth, `column ${i}`).toBeLessThanOrEqual(bound);
      });
    }
  });

  it('closes the two pointers monotonically and resolves every column once', () => {
    let left = -1;
    let right = HEIGHTS.length;
    for (const frame of waterFrames) {
      expect(frame.left).toBeGreaterThanOrEqual(left);
      expect(frame.right).toBeLessThanOrEqual(right);
      left = frame.left;
      right = frame.right;
    }
    expect(waterFrames.filter((frame) => frame.total > 0).length).toBeGreaterThan(0);
  });

  it('only ever grows the running maxima', () => {
    let leftMax = 0;
    let rightMax = 0;
    for (const frame of waterFrames) {
      expect(frame.leftMax).toBeGreaterThanOrEqual(leftMax);
      expect(frame.rightMax).toBeGreaterThanOrEqual(rightMax);
      leftMax = frame.leftMax;
      rightMax = frame.rightMax;
    }
  });
});

describe('hard-union-find', () => {
  const final = unionFrames[unionFrames.length - 1];

  /** Connected components computed by plain graph traversal instead. */
  const componentsByTraversal = () => {
    const adjacency = NAMES.map<number[]>(() => []);
    for (const [a, b] of PAIRS) {
      adjacency[a].push(b);
      adjacency[b].push(a);
    }
    const seen = new Array<number>(NAMES.length).fill(-1);
    let label = 0;
    for (let i = 0; i < NAMES.length; i++) {
      if (seen[i] !== -1) continue;
      const stack = [i];
      while (stack.length > 0) {
        const node = stack.pop() as number;
        if (seen[node] !== -1) continue;
        seen[node] = label;
        stack.push(...adjacency[node]);
      }
      label++;
    }
    return seen;
  };

  const rootOf = (parent: number[], i: number) => {
    let node = i;
    while (parent[node] !== node) node = parent[node];
    return node;
  };

  it('groups the same names a graph traversal would', () => {
    const expected = componentsByTraversal();
    for (let a = 0; a < NAMES.length; a++) {
      for (let b = 0; b < NAMES.length; b++) {
        expect(
          rootOf(final.parent, a) === rootOf(final.parent, b),
          `${NAMES[a]} / ${NAMES[b]}`,
        ).toBe(expected[a] === expected[b]);
      }
    }
  });

  it('quotes a total per group that is the real sum of its frequencies', () => {
    const totals = new Map<number, number>();
    for (let i = 0; i < NAMES.length; i++) {
      const root = rootOf(final.parent, i);
      totals.set(root, (totals.get(root) ?? 0) + FREQ[i]);
    }
    for (const [root, sum] of totals) {
      expect(final.caption).toContain(`${NAMES[root]} ${sum}`);
    }
    expect([...totals.values()].reduce((a, b) => a + b, 0)).toBe(FREQ.reduce((a, b) => a + b, 0));
  });

  it('never creates a cycle in the parent forest', () => {
    for (const frame of unionFrames) {
      for (let i = 0; i < NAMES.length; i++) {
        let node = i;
        let steps = 0;
        while (frame.parent[node] !== node) {
          node = frame.parent[node];
          steps++;
          expect(steps, `cycle from ${NAMES[i]}`).toBeLessThanOrEqual(NAMES.length);
        }
      }
    }
  });

  it('shortens the path it compresses without changing any grouping', () => {
    const at = unionFrames.findIndex((frame) => frame.detail.includes('path compression'));
    expect(at, 'a compression frame exists').toBeGreaterThan(0);
    const before = unionFrames[at - 1].parent;
    const after = unionFrames[at].parent;

    const depthOf = (parent: number[], i: number) => {
      let node = i;
      let d = 0;
      while (parent[node] !== node) {
        node = parent[node];
        d++;
      }
      return d;
    };

    // Compression is a pure optimisation: same roots, same membership.
    for (let i = 0; i < NAMES.length; i++) {
      expect(rootOf(after, i), NAMES[i]).toBe(rootOf(before, i));
      expect(depthOf(after, i), NAMES[i]).toBeLessThanOrEqual(depthOf(before, i));
    }
    // And it has to actually shorten something, or it did nothing at all.
    expect(
      NAMES.some((_, i) => depthOf(after, i) < depthOf(before, i)),
      'no path was shortened',
    ).toBe(true);
    // Every re-pointed node now hangs directly off a root.
    for (let i = 0; i < NAMES.length; i++) {
      if (after[i] === before[i]) continue;
      expect(depthOf(after, i), `${NAMES[i]} after compression`).toBe(1);
    }
  });
});

describe('hard-bidirectional-bfs', () => {
  const oneApart = (a: string, b: string) =>
    a.length === b.length && a.split('').filter((ch, i) => ch !== b[i]).length === 1;

  /** Plain single-ended BFS, for the shortest-path length. */
  const shortestPath = () => {
    const seen = new Set([START]);
    let frontier = [START];
    let depth = 0;
    while (frontier.length > 0) {
      if (frontier.includes(GOAL)) return depth;
      const next: string[] = [];
      for (const word of frontier) {
        for (const candidate of WORDS) {
          if (seen.has(candidate) || !oneApart(word, candidate)) continue;
          seen.add(candidate);
          next.push(candidate);
        }
      }
      frontier = next;
      depth++;
    }
    return Infinity;
  };

  const meeting = ladderFrames.find((frame) => frame.meeting !== null);

  it('meets at a word both searches have genuinely reached', () => {
    expect(meeting).toBeDefined();
    const word = meeting?.meeting as string;
    expect(meeting?.fromStart.has(word) || meeting?.frontierStart.has(word)).toBe(true);
    expect(meeting?.fromGoal.has(word) || meeting?.frontierGoal.has(word)).toBe(true);
  });

  /** Distance between two words by plain BFS over the dictionary. */
  const distance = (from: string, to: string) => {
    const seen = new Set([from]);
    let frontier = [from];
    let depth = 0;
    while (frontier.length > 0) {
      if (frontier.includes(to)) return depth;
      const next: string[] = [];
      for (const current of frontier) {
        for (const candidate of WORDS) {
          if (seen.has(candidate) || !oneApart(current, candidate)) continue;
          seen.add(candidate);
          next.push(candidate);
        }
      }
      frontier = next;
      depth++;
    }
    return Infinity;
  };

  it('meets on a genuinely shortest path', () => {
    const word = meeting?.meeting as string;
    expect(distance(START, word) + distance(GOAL, word)).toBe(shortestPath());
  });

  it('has each side go only half the depth', () => {
    const word = meeting?.meeting as string;
    const half = Math.ceil(shortestPath() / 2);
    expect(distance(START, word)).toBeLessThanOrEqual(half);
    expect(distance(GOAL, word)).toBeLessThanOrEqual(half);
    // The saving is real only if neither side had already reached the other end.
    expect(meeting?.fromStart.has(GOAL)).toBe(false);
    expect(meeting?.fromGoal.has(START)).toBe(false);
  });

  it('grows both frontiers, never one alone', () => {
    expect(ladderFrames.some((frame) => frame.fromStart.size > 1)).toBe(true);
    expect(ladderFrames.some((frame) => frame.fromGoal.size > 1)).toBe(true);
  });
});
