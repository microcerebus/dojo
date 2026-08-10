import {
  Cells,
  Legend,
  Matrix,
  Readout,
  Stage,
  TreeViz,
  type CellSpec,
  type CellState,
  type TreeNodeSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. Trapping rain water with two pointers.                                 */
/* ------------------------------------------------------------------------ */

const HEIGHTS = [4, 2, 0, 3, 2, 5];

interface WaterFrame {
  water: number[];
  left: number;
  right: number;
  leftMax: number;
  rightMax: number;
  total: number;
  caption: string;
  detail: string;
}

const waterFrames: WaterFrame[] = (() => {
  const water = HEIGHTS.map(() => 0);
  const frames: WaterFrame[] = [];
  let left = 0;
  let right = HEIGHTS.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let total = 0;

  const snapshot = (caption: string, detail: string) => {
    frames.push({ water: [...water], left, right, leftMax, rightMax, total, caption, detail });
  };

  snapshot(
    'How much water sits on this histogram? The water above any single bar is bounded by the tallest bar to its left and the tallest to its right - whichever of those two is shorter, minus the bar itself.',
    'the naive version precomputes both maxima arrays: O(n) time, O(n) space',
  );

  while (left < right) {
    if (HEIGHTS[left] <= HEIGHTS[right]) {
      leftMax = Math.max(leftMax, HEIGHTS[left]);
      const here = leftMax - HEIGHTS[left];
      water[left] = here;
      total += here;
      snapshot(
        `The left bar is the shorter of the two ends, so whatever happens in the middle there is definitely something at least this tall on the right. That makes the left maximum the binding constraint here - ${here === 0 ? 'and this bar is itself the new maximum, so it holds nothing' : `it holds ${here}`}.`,
        `leftMax = ${leftMax} · water here = ${here} · total = ${total}`,
      );
      left++;
    } else {
      rightMax = Math.max(rightMax, HEIGHTS[right]);
      const here = rightMax - HEIGHTS[right];
      water[right] = here;
      total += here;
      snapshot(
        `The right bar is the shorter end this time, so by the same argument the right maximum is what bounds it - ${here === 0 ? 'and it is the new right maximum, so it holds nothing' : `it holds ${here}`}.`,
        `rightMax = ${rightMax} · water here = ${here} · total = ${total}`,
      );
      right--;
    }
  }

  snapshot(
    `${total} units of water, in one pass with two pointers and four numbers of state. The insight that makes it work: the *shorter* end is always safe to resolve, because the taller end guarantees a wall on the other side.`,
    'O(n) time, O(1) space · the two-array version is the one to describe first, then improve',
  );
  return frames;
})();

const CEILING = Math.max(...HEIGHTS);

function WaterFrameView({ index }: { index: number }) {
  const frame = waterFrames[Math.min(Math.max(index, 0), waterFrames.length - 1)];
  /* Drawn as a grid rather than bars, so the wall and the water sitting on top
     of it are two visibly different things instead of one stacked column. */
  const rows: CellSpec[][] = Array.from({ length: CEILING }, (_, r) => {
    const level = CEILING - r;
    return HEIGHTS.map((height, c) => {
      const isWall = height >= level;
      const isWater = !isWall && height + frame.water[c] >= level;
      return {
        key: `${r}-${c}`,
        label: isWall ? '█' : isWater ? '≈' : '',
        state: (isWall ? 'done' : isWater ? 'target' : 'idle') as CellState,
      };
    });
  });
  const cells: CellSpec[] = HEIGHTS.map((height, i) => ({
    key: `h${i}`,
    label: String(height),
    sub: frame.water[i] > 0 ? `+${frame.water[i]}` : ' ',
    state: (i === frame.left ? 'active' : i === frame.right ? 'compare' : 'idle') as CellState,
  }));
  return (
    <Stage>
      <Matrix rows={rows} colLabels={HEIGHTS.map((_, i) => String(i))} />
      <Cells cells={cells} size="sm" label="bar heights, and the water each holds" />
      <Readout
        items={[
          { key: 'l', label: 'leftMax', value: String(frame.leftMax) },
          { key: 'r', label: 'rightMax', value: String(frame.rightMax) },
          { key: 't', label: 'water', value: String(frame.total) },
        ]}
      />
      <Legend
        items={[
          { key: 'd', state: 'done', label: 'histogram bar' },
          { key: 't', state: 'target', label: 'trapped water' },
          { key: 'a', state: 'active', label: 'left pointer' },
          { key: 'c', state: 'compare', label: 'right pointer' },
        ]}
      />
    </Stage>
  );
}

export const trappingWater: AnimationSpec = fromFrames(
  {
    id: 'hard-trapping-water',
    title: 'Trapping rain water, two pointers',
    blurb: 'Resolve the shorter end first - the taller one guarantees the wall behind it.',
  },
  waterFrames,
  WaterFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Union-find, and what path compression actually does.                   */
/* ------------------------------------------------------------------------ */

const NAMES = ['John', 'Jon', 'Johnny', 'Chris', 'Kris', 'Topher'];
const FREQ = [15, 12, 6, 13, 4, 19];
const PAIRS: [number, number][] = [
  [1, 0],
  [0, 2],
  [3, 4],
  [3, 5],
];

interface UnionFrame {
  parent: number[];
  touched: number[];
  caption: string;
  detail: string;
}

const unionFrames: UnionFrame[] = (() => {
  const parent = NAMES.map((_, i) => i);
  const frames: UnionFrame[] = [];

  const snapshot = (caption: string, detail: string, touched: number[] = []) => {
    frames.push({ parent: [...parent], touched, caption, detail });
  };

  const find = (i: number): number => {
    let root = i;
    while (parent[root] !== root) root = parent[root];
    return root;
  };

  snapshot(
    'Six names with frequencies, and a list of pairs that mean "these are the same name". The relation is transitive, so the real question is which names end up in the same connected group - and union-find answers exactly that.',
    'every name starts as its own group of one',
  );

  for (const [a, b] of PAIRS) {
    const rootA = find(a);
    const rootB = find(b);
    parent[rootA] = rootB;
    snapshot(
      `${NAMES[a]} and ${NAMES[b]} are synonyms. Find the root of each group and point one root at the other - that is a whole union in a single assignment, no matter how large the groups are.`,
      `${NAMES[rootA]} now points at ${NAMES[rootB]}`,
      [rootA, rootB],
    );
  }

  // Path compression on the deepest chain.
  const deepest = NAMES.map((_, i) => i).reduce((best, i) => {
    const depthOf = (j: number) => {
      let d = 0;
      let cur = j;
      while (parent[cur] !== cur) {
        cur = parent[cur];
        d++;
      }
      return d;
    };
    return depthOf(i) > depthOf(best) ? i : best;
  }, 0);
  const path: number[] = [];
  let cursor = deepest;
  while (parent[cursor] !== cursor) {
    path.push(cursor);
    cursor = parent[cursor];
  }
  for (const node of path) parent[node] = cursor;
  snapshot(
    `Looking up ${NAMES[deepest]} walks the chain to the root - and on the way back, every node on that path is re-pointed straight at the root. The next lookup for any of them is a single hop.`,
    'path compression: the tree flattens as a side effect of being used',
    [...path, cursor],
  );

  const totals = new Map<number, number>();
  for (let i = 0; i < NAMES.length; i++) {
    const root = find(i);
    totals.set(root, (totals.get(root) ?? 0) + FREQ[i]);
  }
  snapshot(
    `Now one pass sums each name's frequency into its root: ${[...totals.entries()].map(([root, sum]) => `${NAMES[root]} ${sum}`).join(', ')}. With compression and union by size, each operation is effectively constant - the inverse Ackermann function, which is below 5 for any input you will ever see.`,
    'the alternative is building a graph and running a search per component - same answer, more code',
    [...totals.keys()],
  );
  return frames;
})();

function UnionFrameView({ index }: { index: number }) {
  const frame = unionFrames[Math.min(Math.max(index, 0), unionFrames.length - 1)];
  const depthOf = (i: number): number => {
    let depth = 0;
    let cursor = i;
    while (frame.parent[cursor] !== cursor) {
      cursor = frame.parent[cursor];
      depth++;
    }
    return depth;
  };
  const maxDepth = Math.max(...NAMES.map((_, i) => depthOf(i)));
  const nodes: TreeNodeSpec[] = NAMES.map((name, i) => ({
    key: name,
    label: name,
    depth: depthOf(i),
    slot: i,
    state: (frame.touched.includes(i) ? 'active' : 'idle') as CellState,
    ...(frame.parent[i] === i ? {} : { parentSlot: frame.parent[i] }),
  }));
  return (
    <Stage tall>
      <TreeViz nodes={nodes} slots={NAMES.length} depth={maxDepth + 1} />
      <Legend items={[{ key: 'a', state: 'active', label: 'touched by this operation' }]} />
    </Stage>
  );
}

export const unionFind: AnimationSpec = fromFrames(
  {
    id: 'hard-union-find',
    title: 'Union-find with path compression',
    blurb: 'Merging is one assignment, and the tree flattens itself as you use it.',
  },
  unionFrames,
  UnionFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. Bidirectional BFS: two frontiers, half the depth each.                 */
/* ------------------------------------------------------------------------ */

const WORDS = ['DAMP', 'LAMP', 'RAMP', 'LAMB', 'LIMP', 'LIME', 'MIME', 'LIKE', 'MIKE'];
const START = 'DAMP';
const GOAL = 'LIKE';

const oneApart = (a: string, b: string) =>
  a.length === b.length && a.split('').filter((ch, i) => ch !== b[i]).length === 1;

interface LadderFrame {
  fromStart: Set<string>;
  fromGoal: Set<string>;
  frontierStart: Set<string>;
  frontierGoal: Set<string>;
  meeting: string | null;
  expanded: number;
  caption: string;
  detail: string;
}

const ladderFrames: LadderFrame[] = (() => {
  const frames: LadderFrame[] = [];
  const fromStart = new Set([START]);
  const fromGoal = new Set([GOAL]);
  let frontierStart = new Set([START]);
  let frontierGoal = new Set([GOAL]);
  let expanded = 0;
  let meeting: string | null = null;

  const snapshot = (caption: string, detail: string) => {
    frames.push({
      fromStart: new Set(fromStart),
      fromGoal: new Set(fromGoal),
      frontierStart: new Set(frontierStart),
      frontierGoal: new Set(frontierGoal),
      meeting,
      expanded,
      caption,
      detail,
    });
  };

  snapshot(
    `Turn ${START} into ${GOAL}, changing one letter at a time, with every intermediate word in the dictionary. That is a shortest-path problem on a graph whose edges are "one letter apart", so it is BFS - not backtracking.`,
    'searching from both ends at once is the optimisation',
  );

  const step = (
    frontier: Set<string>,
    seen: Set<string>,
    other: Set<string>,
  ): { next: Set<string>; hit: string | null } => {
    const next = new Set<string>();
    let hit: string | null = null;
    for (const word of frontier) {
      for (const candidate of WORDS) {
        if (seen.has(candidate) || !oneApart(word, candidate)) continue;
        next.add(candidate);
        seen.add(candidate);
        if (other.has(candidate)) hit ??= candidate;
      }
    }
    return { next, hit };
  };

  while (meeting === null && (frontierStart.size > 0 || frontierGoal.size > 0)) {
    expanded++;
    const forward = step(frontierStart, fromStart, fromGoal);
    frontierStart = forward.next;
    if (forward.hit) meeting = forward.hit;
    snapshot(
      meeting
        ? `The forward frontier reaches ${meeting}, which the backward search has already seen. The two searches have met, and joining their paths gives the shortest ladder.`
        : `Expand the forward frontier one level: ${[...frontierStart].join(', ')}. A single-ended BFS would now have to expand all of these again next round.`,
      `forward reached ${fromStart.size} words · backward reached ${fromGoal.size}`,
    );
    if (meeting) break;

    expanded++;
    const backward = step(frontierGoal, fromGoal, fromStart);
    frontierGoal = backward.next;
    if (backward.hit) meeting = backward.hit;
    snapshot(
      meeting
        ? `The backward frontier reaches ${meeting}, which the forward search already knows. That word is the join point.`
        : `Now expand one level backwards from ${GOAL}: ${[...frontierGoal].join(', ')}. Each search only has to go half as deep as a single-ended one would.`,
      `forward reached ${fromStart.size} words · backward reached ${fromGoal.size}`,
    );
  }

  snapshot(
    'Why this matters: a single BFS to depth d explores about k^d nodes for branching factor k. Two searches to depth d/2 explore about 2·k^(d/2), which is a square-root improvement - the difference between minutes and milliseconds on a real dictionary.',
    'and it needs both searches interleaved, so neither runs ahead of the other',
  );
  return frames;
})();

function LadderFrameView({ index }: { index: number }) {
  const frame = ladderFrames[Math.min(Math.max(index, 0), ladderFrames.length - 1)];
  const cells: CellSpec[] = WORDS.map((word) => {
    let state: CellState = 'idle';
    if (frame.meeting === word) state = 'target';
    else if (frame.frontierStart.has(word) || frame.frontierGoal.has(word)) state = 'active';
    else if (frame.fromStart.has(word)) state = 'done';
    else if (frame.fromGoal.has(word)) state = 'compare';
    return { key: word, label: word, state };
  });
  return (
    <Stage>
      <Cells cells={cells} size="sm" label="dictionary" />
      <Readout
        items={[
          { key: 'f', label: 'from start', value: String(frame.fromStart.size) },
          { key: 'b', label: 'from goal', value: String(frame.fromGoal.size) },
          { key: 'e', label: 'levels expanded', value: String(frame.expanded) },
        ]}
      />
      <Legend
        items={[
          { key: 'd', state: 'done', label: 'reached from the start' },
          { key: 'c', state: 'compare', label: 'reached from the goal' },
          { key: 'a', state: 'active', label: 'current frontier' },
          { key: 't', state: 'target', label: 'where they meet' },
        ]}
      />
    </Stage>
  );
}

export const bidirectionalSearch: AnimationSpec = fromFrames(
  {
    id: 'hard-bidirectional-bfs',
    title: 'Bidirectional BFS',
    blurb: 'Two frontiers, each half as deep - a square-root cut in the work.',
  },
  ladderFrames,
  LadderFrameView,
);

export const hardAnimations: AnimationSpec[] = [
  trappingWater,
  unionFind,
  bidirectionalSearch,
];
