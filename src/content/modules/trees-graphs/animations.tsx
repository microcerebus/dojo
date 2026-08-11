import {
  Bars,
  Cells,
  Legend,
  QueueRow,
  Readout,
  Stage,
  TreeViz,
  type CellSpec,
  type TreeNodeSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/** Shared shape for the little trees these animations draw. */
interface Placed {
  key: string;
  label: string;
  depth: number;
  slot: number;
  parentSlot?: number;
}

const place = (node: Placed, rest: Omit<TreeNodeSpec, 'key' | 'label' | 'depth' | 'slot'>) => ({
  key: node.key,
  label: node.label,
  depth: node.depth,
  slot: node.slot,
  ...(node.parentSlot === undefined ? {} : { parentSlot: node.parentSlot }),
  ...rest,
});

/* ------------------------------------------------------------------------ */
/* 1. Three traversals, one tree, emitted side by side.                      */
/* ------------------------------------------------------------------------ */

const BST_NODES: Placed[] = [
  { key: 't8', label: '8', depth: 0, slot: 3.5 },
  { key: 't4', label: '4', depth: 1, slot: 1.5, parentSlot: 3.5 },
  { key: 't12', label: '12', depth: 1, slot: 5.5, parentSlot: 3.5 },
  { key: 't2', label: '2', depth: 2, slot: 0.5, parentSlot: 1.5 },
  { key: 't6', label: '6', depth: 2, slot: 2.5, parentSlot: 1.5 },
  { key: 't10', label: '10', depth: 2, slot: 4.5, parentSlot: 5.5 },
  { key: 't14', label: '14', depth: 2, slot: 6.5, parentSlot: 5.5 },
];

const PRE_ORDER = ['8', '4', '2', '6', '12', '10', '14'];
const IN_ORDER = ['2', '4', '6', '8', '10', '12', '14'];
const POST_ORDER = ['2', '6', '4', '10', '14', '12', '8'];

const TRAVERSAL_NOTES = [
  'Step 1. Pre-order emits the root immediately. The other two have to walk all the way down the left spine before they can emit anything, so both start at 2.',
  'Step 2. All three are now on 4 - but for different reasons: pre-order arrived at it, in-order finished its left subtree, post-order is still deep in that subtree and emits 6.',
  'Step 3. In-order is walking the values in sorted order, because that is what "left, node, right" means on a BST.',
  'Step 4. Post-order emits 4 only now: a node comes out after everything below it, which is why post-order is what you use to free or fold a tree bottom-up.',
  'Step 5. Pre-order has finished the whole left subtree and jumps to 12. It emits a node before descending, which is why it can serialise a tree.',
  "Step 6. In-order is at 12, exactly the seventh-smallest value. Post-order is still finishing 12's children.",
  'Step 7. Post-order ends on the root - always. Pre-order starts on the root, post-order ends on it, and in-order puts it in the middle.',
];

interface TraversalFrame {
  step: number;
  caption: string;
  detail: string;
}

const traversalFrames: TraversalFrame[] = [
  {
    step: 0,
    caption:
      'One tree, three traversals. They visit exactly the same nodes and do exactly the same amount of work - the only difference is when a node is emitted relative to its children.',
    detail: 'pre = node, left, right · in = left, node, right · post = left, right, node',
  },
  ...TRAVERSAL_NOTES.map((caption, i) => ({
    step: i + 1,
    caption,
    detail: `pre → ${PRE_ORDER[i]} · in → ${IN_ORDER[i]} · post → ${POST_ORDER[i]}`,
  })),
  {
    step: 8,
    caption:
      'Three orders out of one O(n) walk. In-order gives you sorted order on a BST; pre-order gives you a serialisation you can rebuild from; post-order gives you children-before-parent.',
    detail: 'all three: O(n) time, O(h) stack',
  },
];

function TraversalFrameView({ index }: { index: number }) {
  const frame = traversalFrames[Math.min(Math.max(index, 0), traversalFrames.length - 1)];
  const live = frame.step >= 1 && frame.step <= 7 ? frame.step - 1 : -1;
  const nodes: TreeNodeSpec[] = BST_NODES.map((node) => {
    const tags: string[] = [];
    if (live >= 0 && PRE_ORDER[live] === node.label) tags.push('pre');
    if (live >= 0 && IN_ORDER[live] === node.label) tags.push('in');
    if (live >= 0 && POST_ORDER[live] === node.label) tags.push('post');
    const state: TreeNodeSpec['state'] = tags.includes('pre')
      ? 'active'
      : tags.includes('in')
        ? 'compare'
        : tags.includes('post')
          ? 'target'
          : 'idle';
    return place(node, {
      state,
      ...(tags.length ? { badge: tags.join('+') } : {}),
    });
  });

  const row = (values: string[], label: string, state: CellSpec['state']) => {
    const emitted = Math.min(frame.step, values.length);
    return (
      <div className="viz__bitsRow">
        <span className="viz__bitsLabel">{label}</span>
        <Cells
          size="sm"
          label={label}
          cells={values.map((value, i) => ({
            key: `${label}-${i}`,
            label: i < emitted ? value : '·',
            state: i === emitted - 1 && live >= 0 ? state : i < emitted ? 'done' : 'idle',
          }))}
        />
      </div>
    );
  };

  return (
    <Stage tall>
      <TreeViz nodes={nodes} slots={8} depth={3} />
      {row(PRE_ORDER, 'pre', 'active')}
      {row(IN_ORDER, 'in', 'compare')}
      {row(POST_ORDER, 'post', 'target')}
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'pre-order' },
          { key: 'c', state: 'compare', label: 'in-order' },
          { key: 't', state: 'target', label: 'post-order' },
        ]}
      />
    </Stage>
  );
}

export const treeTraversals: AnimationSpec = fromFrames(
  {
    id: 'tg-traversals',
    title: 'Three traversals, one tree',
    blurb: 'Pre, in and post-order emitting side by side. Same walk, three different moments.',
  },
  traversalFrames,
  TraversalFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Validating a BST with a narrowing min/max window.                      */
/* ------------------------------------------------------------------------ */

const BOUND_NODES: Placed[] = [
  { key: 'b20', label: '20', depth: 0, slot: 3.5 },
  { key: 'b10', label: '10', depth: 1, slot: 1.5, parentSlot: 3.5 },
  { key: 'b30', label: '30', depth: 1, slot: 5.5, parentSlot: 3.5 },
  { key: 'b5', label: '5', depth: 2, slot: 0.5, parentSlot: 1.5 },
  { key: 'b25', label: '25', depth: 2, slot: 2.5, parentSlot: 1.5 },
];

interface BoundFrame {
  at: string | null;
  visited: string[];
  min: string;
  max: string;
  bad: boolean;
  caption: string;
  detail: string;
}

const boundFrames: BoundFrame[] = [
  {
    at: null,
    visited: [],
    min: '−∞',
    max: '+∞',
    bad: false,
    caption:
      "Every node in this tree is bigger than its left child and smaller than its right child. Check only that and you will call it a binary search tree. It is not one: 25 sits in 20's left subtree.",
    detail: 'local comparisons are not enough - the property is about all descendants',
  },
  {
    at: '20',
    visited: [],
    min: '−∞',
    max: '+∞',
    bad: false,
    caption:
      'Start at the root with an open window. Every node must fall inside the window it inherits. Turning left tightens the maximum; turning right tightens the minimum.',
    detail: '20 ∈ (−∞, +∞) ✓',
  },
  {
    at: '10',
    visited: ['20'],
    min: '−∞',
    max: '20',
    bad: false,
    caption:
      'We turned left at 20, so everything down here must stay under 20. That single fact is what a parent-child comparison can never carry.',
    detail: '10 ∈ (−∞, 20) ✓',
  },
  {
    at: '5',
    visited: ['20', '10'],
    min: '−∞',
    max: '10',
    bad: false,
    caption:
      'Left again at 10, so the ceiling drops to 10. 5 fits, and it is a leaf, so this branch is clean.',
    detail: '5 ∈ (−∞, 10) ✓',
  },
  {
    at: '25',
    visited: ['20', '10', '5'],
    min: '10',
    max: '20',
    bad: true,
    caption:
      'Now right at 10, so the floor rises to 10 but the ceiling is still 20 from two levels up. 25 breaks it. Reject immediately - no need to look at anything else.',
    detail: '25 ∈ (10, 20)? 25 > 20 ✗',
  },
  {
    at: null,
    visited: ['20', '10', '5', '25'],
    min: '−∞',
    max: '+∞',
    bad: false,
    caption:
      'O(n) time, O(h) stack. The in-order alternative works too - walk in order and check each value beats the previous one - but decide up front whether duplicates are legal, and on which side.',
    detail: 'pass (min, max) down; narrow max going left, narrow min going right',
  },
];

function BoundFrameView({ index }: { index: number }) {
  const frame = boundFrames[Math.min(Math.max(index, 0), boundFrames.length - 1)];
  const nodes: TreeNodeSpec[] = BOUND_NODES.map((node) =>
    place(node, {
      state:
        frame.at === node.label
          ? frame.bad
            ? 'bad'
            : 'active'
          : frame.visited.includes(node.label)
            ? 'done'
            : 'idle',
      ...(frame.at === node.label ? { badge: frame.bad ? 'out of range' : 'checking' } : {}),
    }),
  );
  return (
    <Stage tall>
      <Readout
        items={[
          { key: 'node', label: 'node', value: frame.at ?? '—' },
          { key: 'min', label: 'min', value: frame.min },
          { key: 'max', label: 'max', value: frame.max },
        ]}
      />
      <TreeViz nodes={nodes} slots={8} depth={3} />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'inside its window' },
          { key: 'b', state: 'bad', label: 'violates the window' },
          { key: 'd', state: 'done', label: 'checked' },
        ]}
      />
    </Stage>
  );
}

export const bstBounds: AnimationSpec = fromFrames(
  {
    id: 'tg-bst-bounds',
    title: 'Validating a BST with bounds',
    blurb: 'The min/max window narrowing as you descend - and the node that only bounds can catch.',
  },
  boundFrames,
  BoundFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. BFS wave vs DFS dive on the same graph.                                */
/* ------------------------------------------------------------------------ */

const SEARCH_NODES: Placed[] = [
  { key: 'sA', label: 'A', depth: 0, slot: 3.5 },
  { key: 'sB', label: 'B', depth: 1, slot: 1.5, parentSlot: 3.5 },
  { key: 'sC', label: 'C', depth: 1, slot: 5.5, parentSlot: 3.5 },
  { key: 'sD', label: 'D', depth: 2, slot: 0.5, parentSlot: 1.5 },
  { key: 'sE', label: 'E', depth: 2, slot: 2.5, parentSlot: 1.5 },
  { key: 'sF', label: 'F', depth: 2, slot: 6.5, parentSlot: 5.5 },
  { key: 'sG', label: 'G', depth: 3, slot: 0.5, parentSlot: 0.5 },
];

/** Adjacency, alphabetical. The G-C edge is the one that makes this a graph. */
const DFS_ORDER = ['A', 'B', 'D', 'G', 'C', 'F', 'E'];
const BFS_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const SEARCH_NOTES = [
  'Both start at A. From here the two algorithms are the same code with one word changed: DFS pops the most recently seen node, BFS pops the oldest.',
  'Both take B. Nothing has diverged yet - with one frontier node there is nothing to choose between.',
  "DFS commits: it follows B down to D. BFS refuses to leave A's neighbours and takes C instead. This is the fork.",
  'DFS is now three edges out at G, chasing one branch to its end. BFS is still filling in distance 2.',
  'From G, DFS crosses the extra G–C edge and lands on C - a node that is one step from where it started. Without a visited set it would have looped back into D and never stopped.',
  'DFS picks up F. BFS, meanwhile, has finished everything within two steps of A and is only now going deeper.',
  'DFS finally reaches E, which was two steps from A the whole time - it is the last node DFS visits and the fifth BFS visits. That is the entire argument for BFS on "shortest" questions.',
];

interface SearchFrame {
  step: number;
  caption: string;
  detail: string;
}

const searchFrames: SearchFrame[] = [
  {
    step: 0,
    caption:
      'One graph, two searches. Edges: A–B, A–C, B–D, B–E, C–F, D–G, and G–C. The last one is not drawn as a branch, and it is the reason both searches need a visited set.',
    detail: 'DFS: stack (or recursion) · BFS: queue',
  },
  ...SEARCH_NOTES.map((caption, i) => ({
    step: i + 1,
    caption,
    detail: `step ${i + 1} · DFS at ${DFS_ORDER[i]} · BFS at ${BFS_ORDER[i]}`,
  })),
  {
    step: 8,
    caption:
      'Same nodes, same O(V + E), different order. BFS numbers every node with its true distance from A; DFS numbers them with the order it happened to wander. Pick the one whose numbering answers the question.',
    detail: 'BFS → shortest unweighted path, level order · DFS → exhaustive search, cheaper memory',
  },
];

function searchTree(order: string[], step: number, tone: 'active' | 'compare'): TreeNodeSpec[] {
  const reached = order.slice(0, Math.min(step, order.length));
  return SEARCH_NODES.map((node) => {
    const rank = reached.indexOf(node.label);
    const current = rank === reached.length - 1 && step >= 1 && step <= order.length;
    return place(node, {
      state: rank === -1 ? 'idle' : current ? tone : 'done',
      ...(rank === -1 ? {} : { badge: String(rank + 1) }),
    });
  });
}

function SearchFrameView({ index }: { index: number }) {
  const frame = searchFrames[Math.min(Math.max(index, 0), searchFrames.length - 1)];
  return (
    <Stage>
      <Readout
        items={[
          {
            key: 's',
            label: 'step',
            value: frame.step === 0 ? '—' : String(Math.min(frame.step, 7)),
          },
        ]}
      />
      <div className="viz__note">DFS - go deep, backtrack only when stuck</div>
      <TreeViz nodes={searchTree(DFS_ORDER, frame.step, 'active')} slots={8} depth={4} />
      <div className="viz__note">BFS - finish a whole distance before starting the next</div>
      <TreeViz nodes={searchTree(BFS_ORDER, frame.step, 'compare')} slots={8} depth={4} />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'DFS head' },
          { key: 'c', state: 'compare', label: 'BFS head' },
          { key: 'd', state: 'done', label: 'visited (badge = visit order)' },
        ]}
      />
    </Stage>
  );
}

export const bfsVsDfs: AnimationSpec = fromFrames(
  {
    id: 'tg-bfs-dfs',
    title: 'BFS wave vs DFS dive',
    blurb: 'The same graph searched both ways. Watch where each one is at step 4.',
  },
  searchFrames,
  SearchFrameView,
);

/* ------------------------------------------------------------------------ */
/* 4. Topological sort by indegree.                                          */
/* ------------------------------------------------------------------------ */

const PROJECTS = ['a', 'b', 'c', 'd', 'e', 'f'];
/** `x -> y` means x must be built before y. */
const EDGES: [string, string][] = [
  ['a', 'd'],
  ['f', 'b'],
  ['b', 'd'],
  ['f', 'a'],
  ['d', 'c'],
];

interface TopoFrame {
  indegree: Record<string, number>;
  queue: string[];
  order: string[];
  popped: string | null;
  caption: string;
  detail: string;
}

const topoFrames: TopoFrame[] = (() => {
  const indegree: Record<string, number> = Object.fromEntries(PROJECTS.map((p) => [p, 0]));
  for (const [, to] of EDGES) indegree[to] += 1;

  const frames: TopoFrame[] = [
    {
      indegree: { ...indegree },
      queue: ['f', 'e'],
      order: [],
      popped: null,
      caption:
        'Five dependencies: a→d, f→b, b→d, f→a, d→c, where x→y means x must be built first. Count the arrows coming in to each project - that is its indegree, the number of things it is still waiting on.',
      detail: 'ready = indegree 0. Both f and e qualify; ties are arbitrary.',
    },
  ];

  const queue = ['f', 'e'];
  const order: string[] = [];
  const notes: Record<string, string> = {
    f: 'Build f. Nothing depended on it being later, and now a and b have lost their last blocker, so both become ready. Removing a node is the same as deleting its outgoing arrows.',
    e: 'Build e. It has no edges at all - an isolated node is still part of a valid order, and forgetting the ones with no dependencies in either direction is a common miss.',
    b: 'Build b. d loses one of its two blockers but still waits on a, so it does not join the queue yet.',
    a: "Build a. That was d's second blocker, so d is finally ready. Notice d could not have gone earlier under any tie-breaking.",
    d: 'Build d, which releases c.',
    c: 'Build c. The queue is empty and every project is in the order, so this order is valid.',
  };

  while (queue.length > 0) {
    const node = queue.shift() as string;
    order.push(node);
    for (const [from, to] of EDGES) {
      if (from !== node) continue;
      indegree[to] -= 1;
      if (indegree[to] === 0) queue.push(to);
    }
    frames.push({
      indegree: { ...indegree },
      queue: [...queue],
      order: [...order],
      popped: node,
      caption: notes[node],
      detail: `order: ${order.join(' → ')} · ready: ${queue.length ? queue.join(', ') : 'none'}`,
    });
  }

  frames.push({
    indegree: { ...indegree },
    queue: [],
    order: [...order],
    popped: null,
    caption:
      'O(V + E): every project and every dependency is touched once. The cycle test comes free - if the queue empties while projects remain, every one of those projects is waiting on another one of them, and no build order exists.',
    detail: `${order.length} of ${PROJECTS.length} projects ordered · no cycle`,
  });
  return frames;
})();

function TopoFrameView({ index }: { index: number }) {
  const frame = topoFrames[Math.min(Math.max(index, 0), topoFrames.length - 1)];
  const cells: CellSpec[] = PROJECTS.map((project) => ({
    key: `p-${project}`,
    label: project,
    sub: String(frame.indegree[project]),
    state: frame.order.includes(project)
      ? project === frame.popped
        ? 'target'
        : 'done'
      : frame.indegree[project] === 0
        ? 'active'
        : 'idle',
  }));
  return (
    <Stage tall>
      <div className="viz__note">
        projects, with the number of dependencies each is still waiting on
      </div>
      <Cells cells={cells} label="projects" />
      <QueueRow
        label="ready"
        items={frame.queue.map((project) => ({
          key: `q-${project}`,
          label: project,
          state: 'active',
        }))}
      />
      <div className="viz__note">build order</div>
      <Cells
        size="sm"
        label="build order"
        cells={PROJECTS.map((_, i) => ({
          key: `o-${i}`,
          label: frame.order[i] ?? '·',
          state:
            frame.order[i] === undefined
              ? 'idle'
              : frame.order[i] === frame.popped
                ? 'target'
                : 'done',
        }))}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'ready (indegree 0)' },
          { key: 't', state: 'target', label: 'just built' },
          { key: 'd', state: 'done', label: 'built' },
        ]}
      />
    </Stage>
  );
}

export const topologicalSort: AnimationSpec = fromFrames(
  {
    id: 'tg-toposort',
    title: 'Topological sort by indegree',
    blurb:
      'Build whatever is waiting on nothing, delete its arrows, repeat. The queue draining is the algorithm.',
  },
  topoFrames,
  TopoFrameView,
);

/* ------------------------------------------------------------------------ */
/* 5. Bidirectional search: two frontiers meeting in the middle.             */
/* ------------------------------------------------------------------------ */

const PATH_LENGTH = 8; // s at 0, t at 8
const BRANCHING = 10;

interface BidiFrame {
  radius: number;
  caption: string;
  detail: string;
}

const bidiFrames: BidiFrame[] = [
  {
    radius: 0,
    caption:
      'The shortest path from s to t is 8 hops, and every node has about 10 neighbours. One search from s has to expand 8 levels before it can possibly touch t.',
    detail: 'single search: 10⁸ nodes · two searches: 2 × 10⁴',
  },
  {
    radius: 1,
    caption:
      'Run two searches instead: one forwards from s, one backwards from t. After one level each, they have jointly covered the same two hops a single search covers in two levels - for a fraction of the nodes.',
    detail: 'depth 1 each · covered 2 of 8 hops',
  },
  {
    radius: 2,
    caption:
      'Level two. The single search is now holding 10⁴ nodes in memory; the two searches are holding 2 × 10². The gap is not a constant factor - it is the square root.',
    detail: 'depth 2 each · covered 4 of 8 hops',
  },
  {
    radius: 3,
    caption:
      'Level three. The frontiers are one hop apart. Each side has expanded 10³ nodes; a single search reaching this far would have expanded 10⁶.',
    detail: 'depth 3 each · covered 6 of 8 hops',
  },
  {
    radius: 4,
    caption:
      'They collide in the middle. Splice the two half-paths together and you have the shortest path - 8 hops, found after expanding roughly 2 × 10⁴ nodes instead of 10⁸.',
    detail: 'collision at the midpoint · 20,000 nodes instead of 100,000,000',
  },
  {
    radius: 4,
    caption:
      'O(kᵈ) becomes O(kᵈᐟ²), so the same budget buys you paths twice as long. The costs: you need to search backwards along incoming edges, and you have to hold both frontiers to detect the collision.',
    detail: 'requires a known target, and reversible edges',
  },
];

function BidiFrameView({ index }: { index: number }) {
  const step = Math.min(Math.max(index, 0), bidiFrames.length - 1);
  const frame = bidiFrames[step];
  const cells: CellSpec[] = Array.from({ length: PATH_LENGTH + 1 }, (_, i) => {
    const fromS = i <= frame.radius;
    const fromT = PATH_LENGTH - i <= frame.radius;
    return {
      key: `h-${i}`,
      label: i === 0 ? 's' : i === PATH_LENGTH ? 't' : '·',
      state: fromS && fromT ? 'target' : fromS ? 'active' : fromT ? 'compare' : 'idle',
    };
  });
  const single = Math.pow(BRANCHING, frame.radius * 2);
  const both = 2 * Math.pow(BRANCHING, frame.radius);
  const scale = (value: number) => Math.log10(value + 1) / Math.log10(1e8 + 1);
  return (
    <Stage tall>
      <Readout
        items={[
          {
            key: 'd',
            label: 'hops covered',
            value: `${Math.min(frame.radius * 2, PATH_LENGTH)}/8`,
          },
          { key: 'one', label: 'one search', value: single.toLocaleString('en-US') },
          { key: 'two', label: 'two searches', value: both.toLocaleString('en-US') },
        ]}
      />
      <Cells cells={cells} size="sm" label="path from s to t" />
      <Bars
        height={100}
        bars={[
          {
            key: 'single',
            label: 'one search',
            value: scale(single),
            caption: single.toLocaleString('en-US'),
            state: 'bad',
          },
          {
            key: 'bidi',
            label: 'two searches',
            value: scale(both),
            caption: both.toLocaleString('en-US'),
            state: 'done',
          },
        ]}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'frontier from s' },
          { key: 'c', state: 'compare', label: 'frontier from t' },
          { key: 't', state: 'target', label: 'collision' },
        ]}
      />
    </Stage>
  );
}

export const bidirectionalSearch: AnimationSpec = fromFrames(
  {
    id: 'tg-bidirectional',
    title: 'Bidirectional search',
    blurb:
      'Two frontiers meeting in the middle, and the square-root-sized bill that comes with it.',
  },
  bidiFrames,
  BidiFrameView,
);

export const treesGraphsAnimations: AnimationSpec[] = [
  treeTraversals,
  bstBounds,
  bfsVsDfs,
  topologicalSort,
  bidirectionalSearch,
];
