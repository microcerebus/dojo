import {
  Caption,
  Cells,
  FlowSteps,
  Legend,
  QueueRow,
  Readout,
  Stage,
  TreeViz,
  type CellSpec,
  type FlowStepSpec,
  type TreeNodeSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. Topological sort by draining zero-indegree nodes.                      */
/* ------------------------------------------------------------------------ */

const TOPO_NODES = ['a', 'b', 'c', 'd', 'e', 'f'];
const TOPO_EDGES: [string, string][] = [
  ['a', 'b'],
  ['a', 'c'],
  ['b', 'd'],
  ['c', 'd'],
  ['c', 'e'],
  ['d', 'f'],
  ['e', 'f'],
];

interface TopoFrame {
  indegree: Record<string, number>;
  ready: string[];
  order: string[];
  taken: string | null;
  caption: string;
  detail: string;
}

const topoFrames: TopoFrame[] = (() => {
  const indegree: Record<string, number> = Object.fromEntries(TOPO_NODES.map((n) => [n, 0]));
  for (const [, to] of TOPO_EDGES) indegree[to] += 1;
  const ready = TOPO_NODES.filter((n) => indegree[n] === 0);
  const order: string[] = [];
  const frames: TopoFrame[] = [
    {
      indegree: { ...indegree },
      ready: [...ready],
      order: [],
      taken: null,
      caption:
        'Count how many edges point into each node. Anything with an indegree of zero has no prerequisites left, so it is safe to emit now.',
      detail: 'A cycle-free directed graph always has at least one such node - walk edges backwards and you must stop somewhere.',
    },
  ];
  while (ready.length > 0) {
    const node = ready.shift() as string;
    order.push(node);
    const freed: string[] = [];
    for (const [from, to] of TOPO_EDGES) {
      if (from !== node) continue;
      indegree[to] -= 1;
      if (indegree[to] === 0) {
        ready.push(to);
        freed.push(to);
      }
    }
    frames.push({
      indegree: { ...indegree },
      ready: [...ready],
      order: [...order],
      taken: node,
      caption: `Emit ${node} and delete its outgoing edges. ${
        freed.length === 0
          ? 'Nothing new drops to zero yet.'
          : `That frees ${freed.join(' and ')}, which now have no prerequisites.`
      }`,
      detail: `order so far: ${order.join(' → ')} · queue: ${ready.length === 0 ? 'empty' : ready.join(', ')}`,
    });
  }
  frames.push({
    indegree: { ...indegree },
    ready: [],
    order: [...order],
    taken: null,
    caption: `All ${order.length} nodes emitted, so the graph was acyclic and this order is valid. Had the queue emptied early, the leftovers would be a cycle.`,
    detail: 'O(V + E): every node is emitted once and every edge is decremented once.',
  });
  return frames;
})();

function TopoFrame({ index }: { index: number }) {
  const frame = topoFrames[Math.max(0, Math.min(index, topoFrames.length - 1))];
  const emitted = new Set(frame.order);
  const readySet = new Set(frame.ready);
  const cells: CellSpec[] = TOPO_NODES.map((node) => ({
    key: node,
    label: node,
    sub: emitted.has(node) ? '-' : String(frame.indegree[node]),
    state: node === frame.taken ? 'active' : emitted.has(node) ? 'done' : readySet.has(node) ? 'target' : 'idle',
  }));
  const queue: CellSpec[] = frame.ready.map((node) => ({ key: `q${node}`, label: node, state: 'target' }));
  const order: CellSpec[] = frame.order.map((node, i) => ({
    key: `o${node}`,
    label: node,
    sub: String(i + 1),
    state: 'done',
  }));
  return (
    <Stage tall>
      <Caption>edges: {TOPO_EDGES.map(([from, to]) => `${from}→${to}`).join('  ')}</Caption>
      <Cells cells={cells} label="nodes with remaining indegree" />
      <QueueRow items={queue} label="indegree 0" />
      <Cells cells={order.length > 0 ? order : [{ key: 'none', label: '·', state: 'muted' }]} size="sm" label="topological order" />
    </Stage>
  );
}

export const topologicalSort: AnimationSpec = fromFrames(
  {
    id: 'at-toposort',
    title: 'Topological sort',
    blurb: 'Drain the zero-indegree queue: emit, decrement, repeat - and detect cycles for free.',
  },
  topoFrames,
  TopoFrame,
);

/* ------------------------------------------------------------------------ */
/* 2. Dijkstra's algorithm.                                                  */
/* ------------------------------------------------------------------------ */

const DIJ_NODES = ['a', 'b', 'c', 'd', 'e'];
const DIJ_EDGES: [string, string, number][] = [
  ['a', 'b', 5],
  ['a', 'c', 2],
  ['c', 'b', 1],
  ['c', 'd', 6],
  ['b', 'd', 2],
  ['c', 'e', 9],
  ['d', 'e', 3],
];

interface DijFrame {
  dist: Record<string, number>;
  previous: Record<string, string | null>;
  settled: string[];
  current: string | null;
  caption: string;
  detail: string;
}

const INF = Number.POSITIVE_INFINITY;

const dijFrames: DijFrame[] = (() => {
  const dist: Record<string, number> = Object.fromEntries(DIJ_NODES.map((n) => [n, INF]));
  const previous: Record<string, string | null> = Object.fromEntries(DIJ_NODES.map((n) => [n, null]));
  dist.a = 0;
  const settled: string[] = [];
  const frames: DijFrame[] = [
    {
      dist: { ...dist },
      previous: { ...previous },
      settled: [],
      current: null,
      caption:
        'Every distance starts at infinity except the source, which starts at zero. A priority queue holds every node, keyed by its current best distance.',
      detail: 'The invariant to hold on to: once a node is removed from the queue, its distance is final.',
    },
  ];
  while (settled.length < DIJ_NODES.length) {
    const remaining = DIJ_NODES.filter((n) => !settled.includes(n));
    const node = remaining.reduce((best, n) => (dist[n] < dist[best] ? n : best), remaining[0]);
    if (dist[node] === INF) break;
    settled.push(node);
    const relaxed: string[] = [];
    for (const [from, to, weight] of DIJ_EDGES) {
      if (from !== node || settled.includes(to)) continue;
      const candidate = dist[node] + weight;
      if (candidate < dist[to]) {
        dist[to] = candidate;
        previous[to] = node;
        relaxed.push(`${to}=${candidate}`);
      }
    }
    frames.push({
      dist: { ...dist },
      previous: { ...previous },
      settled: [...settled],
      current: node,
      caption: `Take the cheapest unsettled node: ${node} at ${dist[node]}. Its distance is now final. ${
        relaxed.length === 0
          ? 'None of its edges improve on a known path.'
          : `Relaxing its edges improves ${relaxed.join(', ')}.`
      }`,
      detail: `settled: ${settled.join(', ')} · relaxation asks only "is dist[n] + w(n,x) better than dist[x]?"`,
    });
  }
  frames.push({
    dist: { ...dist },
    previous: { ...previous },
    settled: [...settled],
    current: null,
    caption:
      'Queue empty. Following the previous pointers back from e gives a → c → b → d → e with total weight 8 - not the route with the fewest hops.',
    detail: 'With a binary heap: O((V + E) log V). With a plain array: O(V²), which wins on dense graphs.',
  });
  return frames;
})();

function DijFrame({ index }: { index: number }) {
  const frame = dijFrames[Math.max(0, Math.min(index, dijFrames.length - 1))];
  const settled = new Set(frame.settled);
  const cells: CellSpec[] = DIJ_NODES.map((node) => ({
    key: node,
    label: node,
    sub: frame.dist[node] === INF ? '∞' : String(frame.dist[node]),
    state: node === frame.current ? 'active' : settled.has(node) ? 'done' : frame.dist[node] === INF ? 'idle' : 'compare',
  }));
  const previous = DIJ_NODES.filter((n) => frame.previous[n] !== null)
    .map((n) => `${frame.previous[n]}→${n}`)
    .join('  ');
  return (
    <Stage>
      <Caption>
        edges: {DIJ_EDGES.map(([from, to, weight]) => `${from}→${to}(${weight})`).join('  ')}
      </Caption>
      <Cells cells={cells} label="nodes with best known distance" />
      <Readout
        items={[
          { key: 's', label: 'settled', value: frame.settled.length === 0 ? '-' : frame.settled.join(' ') },
          { key: 'p', label: 'tree so far', value: previous === '' ? '-' : previous },
        ]}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'just settled' },
          { key: 'd', state: 'done', label: 'final' },
          { key: 'c', state: 'compare', label: 'reachable, not final' },
        ]}
      />
    </Stage>
  );
}

export const dijkstra: AnimationSpec = fromFrames(
  {
    id: 'at-dijkstra',
    title: "Dijkstra's algorithm",
    blurb: 'Always settle the cheapest frontier node next, then relax its edges. Greedy, and provably right - with non-negative weights.',
  },
  dijFrames,
  DijFrame,
);

/* ------------------------------------------------------------------------ */
/* 3. Rabin-Karp rolling hash.                                               */
/* ------------------------------------------------------------------------ */

const TEXT = 'abcba';
const PATTERN = 'ba';
const code = (character: string) => character.charCodeAt(0) - 96;
const sumHash = (value: string) => [...value].reduce((total, character) => total + code(character), 0);
const TARGET_HASH = sumHash(PATTERN);

interface RkFrame {
  start: number | null;
  hash: number | null;
  verified: 'none' | 'false' | 'true';
  caption: string;
  detail: string;
}

const rkFrames: RkFrame[] = (() => {
  const frames: RkFrame[] = [
    {
      start: null,
      hash: null,
      verified: 'none',
      caption: `Find "${PATTERN}" inside "${TEXT}". Brute force compares the pattern against every position: O(s(b − s)) character comparisons.`,
      detail: 'Rabin-Karp replaces most of those comparisons with one integer comparison.',
    },
    {
      start: null,
      hash: null,
      verified: 'none',
      caption: `Hash the pattern once. Using a=1, b=2, c=3 and simply summing, "${PATTERN}" hashes to ${TARGET_HASH}. Equal strings always have equal hashes.`,
      detail: 'The converse is not true - unequal strings can collide - which is why a hash match still needs verifying.',
    },
  ];
  let hash = sumHash(TEXT.slice(0, PATTERN.length));
  for (let start = 0; start + PATTERN.length <= TEXT.length; start++) {
    if (start > 0) {
      hash = hash - code(TEXT[start - 1]) + code(TEXT[start + PATTERN.length - 1]);
    }
    const window = TEXT.slice(start, start + PATTERN.length);
    const hit = hash === TARGET_HASH;
    const real = window === PATTERN;
    frames.push({
      start,
      hash,
      verified: hit ? (real ? 'true' : 'false') : 'none',
      caption: hit
        ? real
          ? `Window "${window}" hashes to ${hash}. Match - and verifying the characters confirms a real occurrence at index ${start}.`
          : `Window "${window}" also hashes to ${hash}, because a sum ignores order. Verifying the characters rejects it: a false positive.`
        : `Roll the window: subtract ${TEXT[start - 1] ?? '-'}, add ${TEXT[start + PATTERN.length - 1]}. Hash is ${hash}, not ${TARGET_HASH}, so skip without comparing a single character.`,
      detail:
        start === 0
          ? 'first window computed directly · every later window costs O(1)'
          : `rolling update: one subtraction, one addition - not a rescan`,
    });
  }
  frames.push({
    start: null,
    hash: null,
    verified: 'none',
    caption:
      'A sum-based hash collides constantly because it ignores position. A real rolling hash treats the window as a base-128 number, so "ab" and "ba" differ.',
    detail:
      'hash("oe ") = (hash("doe") − code(d)·128²)·128 + code(" ") · expected O(s + b), worst case O(sb) when every hash collides.',
  });
  return frames;
})();

function RkFrame({ index }: { index: number }) {
  const frame = rkFrames[Math.max(0, Math.min(index, rkFrames.length - 1))];
  const cells: CellSpec[] = [...TEXT].map((character, position) => {
    const inWindow =
      frame.start !== null && position >= frame.start && position < frame.start + PATTERN.length;
    let state: CellSpec['state'] = 'idle';
    if (inWindow) {
      state = frame.verified === 'true' ? 'target' : frame.verified === 'false' ? 'bad' : 'active';
    }
    return { key: `t${position}`, label: character, sub: String(position), state };
  });
  return (
    <Stage>
      <Cells cells={cells} label="text" />
      <Readout
        items={[
          { key: 'p', label: `hash("${PATTERN}")`, value: String(TARGET_HASH) },
          { key: 'w', label: 'window hash', value: frame.hash === null ? '-' : String(frame.hash) },
          {
            key: 'v',
            label: 'verify',
            value:
              frame.verified === 'true' ? 'real match' : frame.verified === 'false' ? 'false positive' : '-',
          },
        ]}
      />
    </Stage>
  );
}

export const rollingHash: AnimationSpec = fromFrames(
  {
    id: 'at-rolling-hash',
    title: 'Rabin-Karp rolling hash',
    blurb: 'One character out, one character in - substring search in expected linear time.',
  },
  rkFrames,
  RkFrame,
);

/* ------------------------------------------------------------------------ */
/* 4. AVL rotations.                                                         */
/* ------------------------------------------------------------------------ */

interface AvlNode {
  label: string;
  depth: number;
  slot: number;
  parentSlot?: number;
  badge?: string;
  state?: TreeNodeSpec['state'];
}

interface AvlFrame {
  nodes: AvlNode[];
  caption: string;
  detail: string;
}

const avlFrames: AvlFrame[] = [
  {
    nodes: [
      { label: '30', depth: 0, slot: 3.5, badge: '0' },
      { label: '20', depth: 1, slot: 1.5, parentSlot: 3.5, badge: '0' },
      { label: '40', depth: 1, slot: 5.5, parentSlot: 3.5, badge: '0' },
    ],
    caption:
      'An AVL tree stores each node\'s balance: left height minus right height. Every node must stay in −1…1, which is what keeps the height O(log n).',
    detail: 'Balance is checked on the way back up the recursion, so one insert touches at most O(log n) nodes.',
  },
  {
    nodes: [
      { label: '30', depth: 0, slot: 3.5, badge: '+2', state: 'bad' },
      { label: '20', depth: 1, slot: 1.5, parentSlot: 3.5, badge: '+1' },
      { label: '40', depth: 1, slot: 5.5, parentSlot: 3.5, badge: '0' },
      { label: '10', depth: 2, slot: 0.5, parentSlot: 1.5, state: 'active' },
    ],
    caption:
      'Insert 10. Node 30 now has balance +2 - too left-heavy - and the extra depth hangs off 20\'s left. That is the left-left shape.',
    detail: 'Left-left and right-right are the easy cases: one rotation fixes them.',
  },
  {
    nodes: [
      { label: '20', depth: 0, slot: 3.5, badge: '0', state: 'done' },
      { label: '10', depth: 1, slot: 1.5, parentSlot: 3.5, badge: '0' },
      { label: '30', depth: 1, slot: 5.5, parentSlot: 3.5, badge: '−1' },
      { label: '40', depth: 2, slot: 6.5, parentSlot: 5.5 },
    ],
    caption:
      'Rotate right around 30: the left child rises, the old root becomes its right child. In-order sequence 10, 20, 30, 40 is unchanged - which is why a rotation is always safe.',
    detail: 'A rotation is O(1) pointer work. It never reorders the tree, it only re-parents three links.',
  },
  {
    nodes: [
      { label: '30', depth: 0, slot: 3.5, badge: '+2', state: 'bad' },
      { label: '20', depth: 1, slot: 1.5, parentSlot: 3.5, badge: '−1' },
      { label: '40', depth: 1, slot: 5.5, parentSlot: 3.5, badge: '0' },
      { label: '25', depth: 2, slot: 2.5, parentSlot: 1.5, state: 'active' },
    ],
    caption:
      'Start over and insert 25 instead. Node 30 is again +2, but now the depth hangs off 20\'s right: the left-right shape. A single right rotation would not fix it.',
    detail: 'Rotating right here would just produce a right-heavy tree - the imbalance would move, not go away.',
  },
  {
    nodes: [
      { label: '30', depth: 0, slot: 3.5, badge: '+2', state: 'bad' },
      { label: '25', depth: 1, slot: 1.5, parentSlot: 3.5, badge: '+1', state: 'compare' },
      { label: '40', depth: 1, slot: 5.5, parentSlot: 3.5, badge: '0' },
      { label: '20', depth: 2, slot: 0.5, parentSlot: 1.5 },
    ],
    caption: 'First rotate left around 20. The subtree is now the left-left shape, which we already know how to fix.',
    detail: 'Left-right and right-left always reduce to the easy cases with one extra rotation.',
  },
  {
    nodes: [
      { label: '25', depth: 0, slot: 3.5, badge: '0', state: 'done' },
      { label: '20', depth: 1, slot: 1.5, parentSlot: 3.5, badge: '0' },
      { label: '30', depth: 1, slot: 5.5, parentSlot: 3.5, badge: '−1' },
      { label: '40', depth: 2, slot: 6.5, parentSlot: 5.5 },
    ],
    caption:
      'Then rotate right around 30. Balanced again. Four cases in total - LL, LR, RR, RL - and the two crooked ones are just the straight ones plus a preparatory rotation.',
    detail: 'Red-black trees allow sloppier balance for cheaper rebalancing; the guarantee is still O(log n).',
  },
];

function AvlFrame({ index }: { index: number }) {
  const frame = avlFrames[Math.max(0, Math.min(index, avlFrames.length - 1))];
  const nodes: TreeNodeSpec[] = frame.nodes.map((node) => ({
    key: `${node.label}-${node.depth}-${node.slot}`,
    label: node.label,
    depth: node.depth,
    slot: node.slot,
    ...(node.parentSlot === undefined ? {} : { parentSlot: node.parentSlot }),
    ...(node.badge === undefined ? {} : { badge: node.badge }),
    state: node.state ?? 'idle',
  }));
  return (
    <Stage tall>
      <TreeViz nodes={nodes} slots={8} depth={3} />
      <Caption>badge = balance factor (left height − right height)</Caption>
    </Stage>
  );
}

export const avlRotation: AnimationSpec = fromFrames(
  {
    id: 'at-avl',
    title: 'AVL rotations',
    blurb: 'The four imbalance shapes, and the rotations that resolve each one.',
  },
  avlFrames,
  AvlFrame,
);

/* ------------------------------------------------------------------------ */
/* 5. MapReduce.                                                             */
/* ------------------------------------------------------------------------ */

const MR_STAGES: { label: string; badge: string; detail: string }[] = [
  {
    label: 'Split',
    badge: 'system',
    detail: 'Machine 1 gets "the cat sat", machine 2 gets "the cat ran". The framework decides the split; you do not.',
  },
  {
    label: 'Map',
    badge: 'yours',
    detail: 'Each machine emits one pair per word: (the,1) (cat,1) (sat,1) on one, (the,1) (cat,1) (ran,1) on the other.',
  },
  {
    label: 'Shuffle',
    badge: 'system',
    detail: 'Every pair with the same key is routed to the same reducer: the→[1,1], cat→[1,1], sat→[1], ran→[1].',
  },
  {
    label: 'Reduce',
    badge: 'yours',
    detail: 'Sum the values for a key and emit it: the→2, cat→2, sat→1, ran→1. Done - and it ran in parallel throughout.',
  },
  {
    label: 'Reduce again',
    badge: 'gotcha',
    detail:
      'Reduce output can be fed back into Reduce. Sums survive that; averages do not. Emit (average, count) and combine with weights, or your answer is silently wrong.',
  },
];

const mapReduceFrames = MR_STAGES.map((stage, i) => ({
  caption: `${i + 1}. ${stage.label} - ${stage.detail}`,
  detail:
    i === MR_STAGES.length - 1
      ? 'Design rule: work out what Reduce needs first, then choose the key that gives it to it.'
      : stage.badge === 'yours'
        ? 'You write this step.'
        : 'The framework does this for you.',
}));

function MapReduceFrame({ index }: { index: number }) {
  const step = Math.max(0, Math.min(index, MR_STAGES.length - 1));
  const steps: FlowStepSpec[] = MR_STAGES.map((stage, i) => ({
    key: stage.label,
    label: stage.label,
    badge: stage.badge,
    ...(i === step ? { detail: stage.detail } : {}),
    state: i === step ? 'active' : i < step ? 'done' : 'muted',
  }));
  return (
    <Stage>
      <FlowSteps steps={steps} />
    </Stage>
  );
}

export const mapReduce: AnimationSpec = fromFrames(
  {
    id: 'at-mapreduce',
    title: 'MapReduce, stage by stage',
    blurb: 'You write Map and Reduce. The key you choose decides everything else.',
  },
  mapReduceFrames,
  MapReduceFrame,
);

export const advancedTopicsAnimations: AnimationSpec[] = [
  topologicalSort,
  dijkstra,
  rollingHash,
  avlRotation,
  mapReduce,
];
