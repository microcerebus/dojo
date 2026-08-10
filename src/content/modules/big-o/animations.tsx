import {
  Bars,
  Cells,
  Legend,
  Readout,
  Stage,
  TreeViz,
  type BarSpec,
  type CellSpec,
  type TreeNodeSpec,
} from '../../../anim/primitives';
import { fromFrames } from '../../../anim/types';
import type { AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. Growth race: watch the curves separate as n grows.                     */
/* ------------------------------------------------------------------------ */

const SIZES = [8, 16, 32, 64, 128, 256, 512, 1024];

const COST = [
  { key: 'const', label: 'O(1)', f: () => 1 },
  { key: 'log', label: 'O(log n)', f: (n: number) => Math.log2(n) },
  { key: 'lin', label: 'O(n)', f: (n: number) => n },
  { key: 'nlogn', label: 'O(n log n)', f: (n: number) => n * Math.log2(n) },
  { key: 'quad', label: 'O(n²)', f: (n: number) => n * n },
];

const fmt = (value: number) =>
  value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(1)}M`
    : value >= 1000
      ? `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}k`
      : `${Math.round(value)}`;

const growthFrames = SIZES.map((n) => {
  const quad = n * n;
  return {
    n,
    caption: `n = ${n}: the quadratic algorithm does ${fmt(quad)} units of work while the linear one does ${fmt(n)}.`,
    detail: `O(log n) ${Math.log2(n)} · O(n) ${n} · O(n log n) ${fmt(n * Math.log2(n))} · O(n²) ${fmt(quad)}`,
  };
});

function GrowthFrame({ index }: { index: number }) {
  const n = growthFrames[Math.min(index, growthFrames.length - 1)].n;
  const max = Math.log10(1024 * 1024 + 1);
  const bars: BarSpec[] = COST.map((cost) => {
    const value = cost.f(n);
    return {
      key: cost.key,
      label: cost.label,
      // Log-scaled so O(1) stays visible while O(n²) is on screen.
      value: Math.log10(value + 1) / max,
      caption: fmt(value),
      state: cost.key === 'quad' ? 'bad' : cost.key === 'const' ? 'done' : 'idle',
    };
  });
  return (
    <Stage>
      <Readout items={[{ key: 'n', label: 'n', value: String(n) }]} />
      <Bars bars={bars} />
      <p className="viz__note">Bar heights are log-scaled - otherwise O(n²) would be the only thing you could see.</p>
    </Stage>
  );
}

export const growthRace: AnimationSpec = fromFrames(
  {
    id: 'big-o-growth-race',
    title: 'The growth race',
    blurb: 'Same input, five complexity classes. Step through n and watch them separate.',
  },
  growthFrames,
  GrowthFrame,
);

/* ------------------------------------------------------------------------ */
/* 2. Amortised doubling: why push is O(1) even though copying is O(n).      */
/* ------------------------------------------------------------------------ */

interface DoublingFrame {
  filled: number;
  capacity: number;
  copied: number;
  totalWork: number;
  caption: string;
  detail: string;
}

const doublingFrames: DoublingFrame[] = (() => {
  const frames: DoublingFrame[] = [];
  let capacity = 1;
  let totalWork = 0;
  for (let push = 1; push <= 9; push++) {
    let copied = 0;
    if (push > capacity) {
      copied = capacity; // copy every existing element into the new block
      capacity *= 2;
      totalWork += copied;
    }
    totalWork += 1; // the write itself
    frames.push({
      filled: push,
      capacity,
      copied,
      totalWork,
      caption: copied
        ? `Push ${push}: the block is full, so allocate ${capacity} slots and copy ${copied} elements across. This one push costs ${copied + 1}.`
        : `Push ${push}: there is a free slot, so this is a single write. Cost 1.`,
      detail: `total work ${totalWork} over ${push} pushes → ${(totalWork / push).toFixed(2)} per push`,
    });
  }
  return frames;
})();

function DoublingFrameView({ index }: { index: number }) {
  const frame = doublingFrames[Math.min(index, doublingFrames.length - 1)];
  const cells: CellSpec[] = Array.from({ length: frame.capacity }, (_, i) => ({
    key: `slot-${i}`,
    label: i < frame.filled ? String(i + 1) : '',
    state:
      i === frame.filled - 1
        ? 'active'
        : i < frame.filled
          ? frame.copied > 0 && i < frame.copied
            ? 'compare'
            : 'done'
          : 'idle',
  }));
  return (
    <Stage>
      <Readout
        items={[
          { key: 'len', label: 'length', value: String(frame.filled) },
          { key: 'cap', label: 'capacity', value: String(frame.capacity) },
          {
            key: 'amort',
            label: 'work / push',
            value: (frame.totalWork / frame.filled).toFixed(2),
          },
        ]}
      />
      <Cells cells={cells} size="sm" label="dynamic array slots" />
      <Legend
        items={[
          { key: 'w', state: 'active', label: 'this push' },
          { key: 'c', state: 'compare', label: 'copied on resize' },
          { key: 'd', state: 'done', label: 'already there' },
        ]}
      />
    </Stage>
  );
}

export const amortisedDoubling: AnimationSpec = fromFrames(
  {
    id: 'big-o-amortised-doubling',
    title: 'Amortised O(1): array doubling',
    blurb: 'Most pushes cost 1, a few cost n. Watch the average settle near 2.',
  },
  doublingFrames,
  DoublingFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. Recursion tree: branching cost, and what memoisation removes.          */
/* ------------------------------------------------------------------------ */

interface FibNode {
  key: string;
  label: string;
  value: number;
  depth: number;
  slot: number;
  parentSlot?: number;
}

/** The full naive call tree for fib(4), in the order a DFS visits it. */
const FIB_TREE: FibNode[] = [
  { key: 'f4', label: 'f(4)', value: 4, depth: 0, slot: 3.5 },
  { key: 'f3', label: 'f(3)', value: 3, depth: 1, slot: 1.5, parentSlot: 3.5 },
  { key: 'f2a', label: 'f(2)', value: 2, depth: 2, slot: 0.5, parentSlot: 1.5 },
  { key: 'f1a', label: 'f(1)', value: 1, depth: 3, slot: 0, parentSlot: 0.5 },
  { key: 'f0a', label: 'f(0)', value: 0, depth: 3, slot: 1, parentSlot: 0.5 },
  { key: 'f1b', label: 'f(1)', value: 1, depth: 2, slot: 2.5, parentSlot: 1.5 },
  { key: 'f2b', label: 'f(2)', value: 2, depth: 1, slot: 5.5, parentSlot: 3.5 },
  { key: 'f1c', label: 'f(1)', value: 1, depth: 2, slot: 4.5, parentSlot: 5.5 },
  { key: 'f0b', label: 'f(0)', value: 0, depth: 2, slot: 6.5, parentSlot: 5.5 },
];

const fibFrames = (() => {
  const seen = new Set<number>();
  return FIB_TREE.map((node, i) => {
    const isBase = node.value <= 1;
    const repeat = seen.has(node.value) && !isBase;
    seen.add(node.value);
    return {
      visited: i + 1,
      hit: repeat,
      caption: repeat
        ? `Call ${i + 1}: f(${node.value}) again. Naive recursion recomputes this whole subtree; with a memo it is a single map lookup.`
        : isBase
          ? `Call ${i + 1}: f(${node.value}) is a base case - it returns immediately.`
          : `Call ${i + 1}: f(${node.value}) has not been seen yet, so it branches into f(${node.value - 1}) and f(${node.value - 2}).`,
      detail: repeat
        ? 'memoised: cache hit (O(1)) · naive: recompute'
        : `distinct subproblems so far: ${seen.size}`,
    };
  });
})();

function FibFrame({ index }: { index: number }) {
  const step = Math.min(index, fibFrames.length - 1);
  const seen = new Set<number>();
  const nodes: TreeNodeSpec[] = FIB_TREE.map((node, i) => {
    const isBase = node.value <= 1;
    const repeat = seen.has(node.value) && !isBase;
    if (i <= step) seen.add(node.value);
    const visited = i <= step;
    return {
      key: node.key,
      label: node.label,
      depth: node.depth,
      slot: node.slot,
      ...(node.parentSlot === undefined ? {} : { parentSlot: node.parentSlot }),
      state: !visited ? 'idle' : i === step ? 'active' : repeat ? 'target' : 'done',
      ...(visited && repeat ? { badge: 'hit' } : {}),
    };
  });
  const distinct = new Set(FIB_TREE.slice(0, step + 1).map((n) => n.value)).size;
  return (
    <Stage tall>
      <Readout
        items={[
          { key: 'calls', label: 'naive calls', value: String(step + 1) },
          { key: 'distinct', label: 'distinct subproblems', value: String(distinct) },
        ]}
      />
      <TreeViz nodes={nodes} slots={8} depth={4} />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'current call' },
          { key: 't', state: 'target', label: 'memo would hit' },
          { key: 'd', state: 'done', label: 'computed' },
        ]}
      />
    </Stage>
  );
}

export const recursionTree: AnimationSpec = fromFrames(
  {
    id: 'big-o-recursion-tree',
    title: 'Recursion tree: O(2ⁿ) vs O(n)',
    blurb: 'fib(4) expanded call by call. Yellow nodes are work a memo deletes.',
  },
  fibFrames,
  FibFrame,
);

export const bigOAnimations: AnimationSpec[] = [
  growthRace,
  amortisedDoubling,
  recursionTree,
];
