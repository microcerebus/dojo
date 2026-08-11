import {
  Bars,
  Cells,
  Legend,
  Readout,
  Stage,
  type BarSpec,
  type CellSpec,
  type CellState,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. Kadane: one pass, and one decision per element.                        */
/* ------------------------------------------------------------------------ */

export const SERIES = [2, -8, 3, -2, 4, -10];

export interface KadaneFrame {
  at: number;
  running: number;
  best: number;
  bestRange: [number, number];
  restarted: boolean;
  caption: string;
  detail: string;
}

export const kadaneFrames: KadaneFrame[] = (() => {
  const frames: KadaneFrame[] = [
    {
      at: -1,
      running: 0,
      best: -Infinity,
      bestRange: [0, -1],
      restarted: false,
      caption:
        'The largest sum of any contiguous run. Checking every start and end is O(n²); one pass is enough once you ask the right question at each element.',
      detail: 'the question: is the run so far helping me, or holding me back?',
    },
  ];
  let running = 0;
  let best = -Infinity;
  let start = 0;
  let bestRange: [number, number] = [0, 0];

  for (let i = 0; i < SERIES.length; i++) {
    const value = SERIES[i];
    const restarted = running + value < value;
    if (restarted) {
      running = value;
      start = i;
    } else {
      running += value;
    }
    if (running > best) {
      best = running;
      bestRange = [start, i];
    }
    frames.push({
      at: i,
      running,
      best,
      bestRange,
      restarted,
      caption:
        i === 0
          ? `Start with the first element as the only run there is. Everything after this is one decision, repeated: keep the run, or drop it.`
          : restarted
            ? `The run so far sums to less than nothing useful, so dragging it along would only make ${value} worse. Throw it away and start a new run at this element.`
            : `Extending the current run is better than starting over here, so add ${value} and keep going.`,
      detail: `best run ending here = ${running} · best anywhere = ${best}`,
    });
  }

  frames.push({
    at: SERIES.length,
    running,
    best,
    bestRange,
    restarted: false,
    caption: `Answer ${best}, from indices ${bestRange[0]} to ${bestRange[1]}. Stated as a DP: the best run ending at i is either the element alone or the element plus the best run ending at i−1 - a two-variable rolling array.`,
    detail:
      'O(n) time, O(1) space · ask what an all-negative array should return before you code it',
  });
  return frames;
})();

function KadaneFrameView({ index }: { index: number }) {
  const frame = kadaneFrames[Math.min(Math.max(index, 0), kadaneFrames.length - 1)];
  const cells: CellSpec[] = SERIES.map((value, i) => {
    const inBest = i >= frame.bestRange[0] && i <= frame.bestRange[1];
    const state: CellState =
      i === frame.at
        ? frame.restarted
          ? 'bad'
          : 'active'
        : inBest
          ? 'target'
          : i < frame.at
            ? 'muted'
            : 'idle';
    return { key: `k${i}`, label: String(value), sub: String(i), state };
  });
  return (
    <Stage>
      <Cells cells={cells} label="values" />
      <Readout
        items={[
          { key: 'r', label: 'run ending here', value: frame.at < 0 ? '—' : String(frame.running) },
          {
            key: 'b',
            label: 'best so far',
            value: Number.isFinite(frame.best) ? String(frame.best) : '—',
          },
        ]}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'extending the run' },
          { key: 'x', state: 'bad', label: 'restarting here' },
          { key: 't', state: 'target', label: 'best run so far' },
        ]}
      />
    </Stage>
  );
}

export const kadane: AnimationSpec = fromFrames(
  {
    id: 'mod-kadane',
    title: 'Kadane, element by element',
    blurb: 'One decision per element: extend the run, or abandon it.',
  },
  kadaneFrames,
  KadaneFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Sweep line: count events, not units of time.                           */
/* ------------------------------------------------------------------------ */

export const FIRST_YEAR = 1900;
export const YEARS = 9;
export const PEOPLE = [
  { birth: 1900, death: 1903 },
  { birth: 1901, death: 1905 },
  { birth: 1902, death: 1904 },
  { birth: 1904, death: 1908 },
  { birth: 1903, death: 1907 },
];

export interface SweepFrame {
  deltas: number[];
  running: (number | null)[];
  at: number;
  peakYear: number | null;
  peak: number;
  caption: string;
  detail: string;
}

export const sweepFrames: SweepFrame[] = (() => {
  const deltas = new Array<number>(YEARS + 1).fill(0);
  for (const person of PEOPLE) {
    deltas[person.birth - FIRST_YEAR] += 1;
    deltas[person.death - FIRST_YEAR + 1] -= 1;
  }
  const frames: SweepFrame[] = [
    {
      deltas: deltas.slice(0, YEARS),
      running: new Array<number | null>(YEARS).fill(null),
      at: -1,
      peakYear: null,
      peak: 0,
      caption: `${PEOPLE.length} people with birth and death years. The obvious solution adds 1 to every year each person was alive - that is O(people × lifespan). Recording only the two moments that change the count is O(people).`,
      detail: 'plus one at a birth, minus one just after a death',
    },
  ];
  const running: (number | null)[] = new Array<number | null>(YEARS).fill(null);
  let total = 0;
  let peak = 0;
  let peakYear: number | null = null;
  for (let i = 0; i < YEARS; i++) {
    total += deltas[i];
    running[i] = total;
    const isPeak = total > peak;
    if (isPeak) {
      peak = total;
      peakYear = FIRST_YEAR + i;
    }
    frames.push({
      deltas: deltas.slice(0, YEARS),
      running: [...running],
      at: i,
      peakYear,
      peak,
      caption: isPeak
        ? `${FIRST_YEAR + i}: the running total reaches ${total}, a new maximum. A running sum over the deltas reconstructs the population in every year without ever touching a year twice.`
        : `${FIRST_YEAR + i}: the total moves to ${total}. Only the years where something happened have a non-zero delta; the rest just carry the previous value forward.`,
      detail: `delta ${deltas[i] >= 0 ? '+' : ''}${deltas[i]} · alive ${total} · peak ${peak} in ${peakYear}`,
    });
  }
  frames.push({
    deltas: deltas.slice(0, YEARS),
    running: [...running],
    at: YEARS,
    peakYear,
    peak,
    caption: `Peak of ${peak} in ${peakYear}. The same delta-then-prefix-sum shape solves meeting-room counts, interval overlaps and any "most X at once" question - and it works on a sorted event list even when the range is unbounded.`,
    detail: 'O(n log n) to sort the events, or O(n + range) when the range is small and known',
  });
  return frames;
})();

function SweepFrameView({ index }: { index: number }) {
  const frame = sweepFrames[Math.min(Math.max(index, 0), sweepFrames.length - 1)];
  const deltaCells: CellSpec[] = frame.deltas.map((value, i) => ({
    key: `d${i}`,
    label: value === 0 ? '·' : `${value > 0 ? '+' : ''}${value}`,
    sub: String(FIRST_YEAR + i).slice(2),
    state: (i === frame.at ? 'active' : value === 0 ? 'muted' : 'compare') as CellState,
  }));
  const bars: BarSpec[] = frame.running.map((value, i) => ({
    key: `b${i}`,
    label: String(FIRST_YEAR + i).slice(2),
    value: (value ?? 0) / Math.max(frame.peak, 1),
    caption: value === null ? '' : String(value),
    state: (value === null
      ? 'idle'
      : FIRST_YEAR + i === frame.peakYear
        ? 'target'
        : i === frame.at
          ? 'active'
          : 'done') as CellState,
  }));
  return (
    <Stage>
      <Cells cells={deltaCells} size="sm" label="deltas" />
      <Bars bars={bars} height={110} />
      <Readout
        items={[
          {
            key: 'p',
            label: 'peak',
            value: frame.peakYear === null ? '—' : `${frame.peak} in ${frame.peakYear}`,
          },
        ]}
      />
    </Stage>
  );
}

export const sweepLine: AnimationSpec = fromFrames(
  {
    id: 'mod-sweep-line',
    title: 'Delta counting and a running total',
    blurb: 'Record the two moments that change the count, not every unit in between.',
  },
  sweepFrames,
  SweepFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. An LRU cache: a map for lookup, a list for recency.                    */
/* ------------------------------------------------------------------------ */

export const CAPACITY = 3;

type CacheOp = { kind: 'put'; key: string } | { kind: 'get'; key: string };

export const CACHE_OPS: CacheOp[] = [
  { kind: 'put', key: 'a' },
  { kind: 'put', key: 'b' },
  { kind: 'put', key: 'c' },
  { kind: 'get', key: 'a' },
  { kind: 'put', key: 'd' },
  { kind: 'get', key: 'b' },
];

export interface CacheFrame {
  order: string[];
  touched: string | null;
  evicted: string | null;
  miss: boolean;
  caption: string;
  detail: string;
}

export const cacheFrames: CacheFrame[] = (() => {
  const order: string[] = []; // most recent first
  const frames: CacheFrame[] = [
    {
      order: [],
      touched: null,
      evicted: null,
      miss: false,
      caption: `A cache of capacity ${CAPACITY} that evicts whatever was used least recently. A map alone gives O(1) lookup but no notion of order; a list alone gives order but O(n) lookup. You need both, pointing at each other.`,
      detail: 'map: key → node · list: most recently used at the front',
    },
  ];
  for (const op of CACHE_OPS) {
    const present = order.includes(op.key);
    let evicted: string | null = null;
    if (op.kind === 'get' && !present) {
      frames.push({
        order: [...order],
        touched: null,
        evicted: null,
        miss: true,
        caption: `get(${op.key}) is a miss - it was evicted earlier. Nothing about the recency order changes on a miss.`,
        detail: `cache holds ${order.join(', ')}`,
      });
      continue;
    }
    if (present) order.splice(order.indexOf(op.key), 1);
    order.unshift(op.key);
    if (order.length > CAPACITY) evicted = order.pop() as string;
    frames.push({
      order: [...order],
      touched: op.key,
      evicted,
      miss: false,
      caption:
        op.kind === 'get'
          ? `get(${op.key}) hits. The map finds the node in O(1), and because the node knows its own neighbours it can be unlinked and moved to the front in O(1) too - no scanning.`
          : evicted
            ? `put(${op.key}) overflows the cache, so the node at the back - ${evicted}, the least recently used - is dropped, and removed from the map as well.`
            : `put(${op.key}) inserts at the front, because a brand new entry is the most recently used thing there is.`,
      detail: evicted
        ? `evicted ${evicted} · both structures must be updated together`
        : `order: ${order.join(' → ')}`,
    });
  }
  frames.push({
    order: [...order],
    touched: null,
    evicted: null,
    miss: false,
    caption:
      'Every operation is O(1), and the reason is that the map stores node references rather than values. A singly linked list would break this: unlinking a node needs its predecessor, so the list must be doubly linked.',
    detail: 'the general move: one structure for lookup, another for order, cross-linked',
  });
  return frames;
})();

function CacheFrameView({ index }: { index: number }) {
  const frame = cacheFrames[Math.min(Math.max(index, 0), cacheFrames.length - 1)];
  const listCells: CellSpec[] = frame.order.map((key, i) => ({
    key: `l${key}`,
    label: key,
    sub: i === 0 ? 'newest' : i === frame.order.length - 1 ? 'oldest' : '',
    state: (key === frame.touched ? 'active' : 'done') as CellState,
  }));
  const mapCells: CellSpec[] = [...frame.order].sort().map((key) => ({
    key: `m${key}`,
    label: key,
    state: (key === frame.touched ? 'active' : 'idle') as CellState,
  }));
  return (
    <Stage>
      <Cells cells={mapCells} size="sm" label="map keys" />
      <Cells cells={listCells} label="recency list, newest first" />
      <Readout
        items={[
          { key: 'c', label: 'size', value: `${frame.order.length} / ${CAPACITY}` },
          { key: 'e', label: 'evicted', value: frame.evicted ?? (frame.miss ? 'miss' : '—') },
        ]}
      />
      <Legend items={[{ key: 'a', state: 'active', label: 'touched by this operation' }]} />
    </Stage>
  );
}

export const lruCache: AnimationSpec = fromFrames(
  {
    id: 'mod-lru-cache',
    title: 'An LRU cache in two structures',
    blurb: 'A hash map for lookup, a doubly linked list for order - cross-linked.',
  },
  cacheFrames,
  CacheFrameView,
);

export const moderateAnimations: AnimationSpec[] = [kadane, sweepLine, lruCache];
