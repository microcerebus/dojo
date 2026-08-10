import {
  Cells,
  Legend,
  Matrix,
  Readout,
  Stage,
  TreeViz,
  type CellSpec,
  type TreeNodeSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. Heap insert (bubble up) and extract-min (sift down), tree + array.     */
/* ------------------------------------------------------------------------ */

/** Slot positions for a 7-node complete binary tree, by array index. */
const HEAP_SLOTS = [3.5, 1.5, 5.5, 0.5, 2.5, 4.5, 6.5];

export interface HeapFrame {
  heap: number[];
  /** array indices being swapped or looked at */
  focus: number[];
  /** the index the algorithm currently "holds" */
  cursor: number | null;
  phase: 'insert' | 'extract' | 'idle';
  caption: string;
  detail: string;
}

/** Exported so the frame contents can be asserted without rendering. */
export const heapFrames: HeapFrame[] = (() => {
  const frames: HeapFrame[] = [];
  const heap = [4, 50, 7, 55, 90, 87];

  frames.push({
    heap: [...heap],
    focus: [],
    cursor: null,
    phase: 'idle',
    caption:
      'A min-heap is a complete binary tree where every node is smaller than both of its children. That is much weaker than sorted - the root is the minimum, and nothing else is in any particular order.',
    detail: 'array index i → children 2i+1 and 2i+2, parent (i−1)/2 rounded down',
  });

  // --- insert 2 ---------------------------------------------------------
  heap.push(2);
  let i = heap.length - 1;
  frames.push({
    heap: [...heap],
    focus: [i],
    cursor: i,
    phase: 'insert',
    caption:
      'Insert 2. It goes in the only place that keeps the tree complete: the next free slot on the bottom row, which is just the end of the array. The heap property is now broken at exactly one node.',
    detail: `placed at index ${i} · parent index ${(i - 1) >> 1} holds ${heap[(i - 1) >> 1]}`,
  });
  while (i > 0) {
    const parent = (i - 1) >> 1;
    if (heap[parent] <= heap[i]) break;
    const child = heap[i];
    const above = heap[parent];
    [heap[parent], heap[i]] = [heap[i], heap[parent]];
    const from = i;
    i = parent;
    frames.push({
      heap: [...heap],
      focus: [i, from],
      cursor: i,
      phase: 'insert',
      caption: `${child} is smaller than its parent ${above}, so swap them. Bubbling up only ever compares against one node per level - the path to the root is the only thing that can be wrong.`,
      detail: `now at index ${i} · height of the path is log n`,
    });
  }
  frames.push({
    heap: [...heap],
    focus: [0],
    cursor: null,
    phase: 'insert',
    caption:
      '2 reaches the root and stops - there is no parent left to be bigger than it. One swap per level, so insert is O(log n), and the array never had to move anything else.',
    detail: 'insert: O(log n) · peek the minimum: O(1)',
  });

  // --- extract min ------------------------------------------------------
  const removed = heap[0];
  const last = heap.pop() as number;
  heap[0] = last;
  frames.push({
    heap: [...heap],
    focus: [0],
    cursor: 0,
    phase: 'extract',
    caption: `Extract the minimum: take ${removed} off the root, then move the last element (${last}) into the hole. That keeps the tree complete, but now the root is almost certainly in the wrong place.`,
    detail: `returned ${removed} · ${last} moved from the end to the root`,
  });
  let j = 0;
  for (;;) {
    const left = 2 * j + 1;
    const right = 2 * j + 2;
    let smallest = j;
    if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
    if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
    if (smallest === j) break;
    const moved = heap[j];
    const winner = heap[smallest];
    // Read the children *before* the swap - afterwards one of those slots holds
    // the value that just sank, and the detail line would name a comparison
    // that never happened.
    const leftValue = left < heap.length ? heap[left] : null;
    const rightValue = right < heap.length ? heap[right] : null;
    [heap[j], heap[smallest]] = [heap[smallest], heap[j]];
    frames.push({
      heap: [...heap],
      focus: [j, left, right].filter((k) => k < heap.length),
      cursor: smallest,
      phase: 'extract',
      caption: `${moved} is bigger than its children, so it sinks. Swap with the smaller child (${winner}) - swapping with the larger one would just break the property in the other direction.`,
      detail: `compared ${leftValue ?? '—'} and ${rightValue ?? '—'}`,
    });
    j = smallest;
  }
  frames.push({
    heap: [...heap],
    focus: [],
    cursor: null,
    phase: 'idle',
    caption:
      'Settled. Extract is O(log n) too, and the new root is the next smallest value. Note what a heap never gives you: the second element of the array is not the second smallest, and reading the array in order is not sorted order.',
    detail: 'insert O(log n) · extract-min O(log n) · peek O(1) · build from an array O(n)',
  });
  return frames;
})();

function HeapFrameView({ index }: { index: number }) {
  const frame = heapFrames[Math.min(Math.max(index, 0), heapFrames.length - 1)];
  const stateFor = (i: number): CellSpec['state'] =>
    i === frame.cursor ? 'active' : frame.focus.includes(i) ? 'compare' : 'done';
  /** Only claim the root is the minimum when it actually is. */
  const rootIsMin = frame.heap.length > 0 && frame.heap[0] === Math.min(...frame.heap);
  const nodes: TreeNodeSpec[] = frame.heap.map((value, i) => ({
    key: `h-${i}`,
    label: String(value),
    depth: i === 0 ? 0 : i < 3 ? 1 : 2,
    slot: HEAP_SLOTS[i],
    ...(i === 0 ? {} : { parentSlot: HEAP_SLOTS[(i - 1) >> 1] }),
    state: stateFor(i),
    ...(i === 0 && rootIsMin ? { badge: 'min' } : {}),
  }));
  return (
    <Stage tall>
      <Readout
        items={[
          { key: 'op', label: 'operation', value: frame.phase === 'idle' ? 'settled' : frame.phase },
          { key: 'size', label: 'size', value: String(frame.heap.length) },
        ]}
      />
      <TreeViz nodes={nodes} slots={8} depth={3} />
      <div className="viz__note">the same heap as a flat array - no pointers anywhere</div>
      <Cells
        label="heap array"
        cells={frame.heap.map((value, i) => ({
          key: `a-${i}`,
          label: String(value),
          sub: String(i),
          state: stateFor(i),
        }))}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'the element being moved' },
          { key: 'c', state: 'compare', label: 'compared against' },
        ]}
      />
    </Stage>
  );
}

export const heapOperations: AnimationSpec = fromFrames(
  {
    id: 'ht-heap-ops',
    title: 'Insert bubbles up, extract sinks down',
    blurb: 'A min-heap as a tree and as an array at the same time. One swap per level, both ways.',
  },
  heapFrames,
  HeapFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Two heaps holding a streaming median.                                  */
/* ------------------------------------------------------------------------ */

const STREAM = [5, 15, 1, 3, 8, 7, 9, 2];

interface MedianFrame {
  low: number[]; // max-heap, root first
  high: number[]; // min-heap, root first
  arrived: number;
  median: string;
  caption: string;
  detail: string;
}

const medianFrames: MedianFrame[] = (() => {
  const low: number[] = []; // max-heap of the smaller half
  const high: number[] = []; // min-heap of the larger half
  const pushLow = (value: number) => {
    low.push(value);
    low.sort((a, b) => b - a);
  };
  const pushHigh = (value: number) => {
    high.push(value);
    high.sort((a, b) => a - b);
  };
  const median = () =>
    low.length === high.length ? ((low[0] + high[0]) / 2).toString() : String(low[0]);

  const frames: MedianFrame[] = [
    {
      low: [],
      high: [],
      arrived: 0,
      median: '—',
      caption:
        'The median of a stream, on demand. Sorting on every query is O(n log n) each time; keeping the array sorted makes insertion O(n). Neither is good enough - and neither is needed, because you only ever look at the middle.',
      detail: 'split the values in half and keep the two halves facing each other',
    },
  ];

  const notes: string[] = [
    'Split the values into a low half and a high half. The low half is a max-heap, so its root is the largest small value; the high half is a min-heap, so its root is the smallest large value. Those two roots straddle the median.',
    'Every arrival: push it onto the low heap, move the low heap\'s root across to the high heap, then move back if the high heap has grown larger. Two O(log n) operations, and the invariant is restored.',
    'With an odd count the low heap deliberately holds the extra element, so its root is exactly the median - no averaging, no ambiguity.',
    'The heaps never sort themselves. They only ever have to answer "what is the biggest thing in the low half" and "what is the smallest thing in the high half", which is exactly what a root is.',
    'The contents below each root are drawn in order here so they are readable - a real heap does not keep them that way, and never needs to. Only the roots are ever read.',
    'A value arriving in the middle of the range still costs O(log n) - it lands in one heap and at most one element crosses over.',
    'Reading the median is O(1) whenever you want it: peek one root, or average two.',
    'Eight values in, and the answer is the average of the two roots. No sorting was ever performed.',
  ];

  STREAM.forEach((value, i) => {
    pushLow(value);
    pushHigh(low.shift() as number);
    if (high.length > low.length) pushLow(high.shift() as number);
    frames.push({
      low: [...low],
      high: [...high],
      arrived: i + 1,
      median: median(),
      caption: `${value} arrives. ${notes[i]}`,
      detail: `low (max-heap) root ${low[0]} · high (min-heap) root ${high.length ? high[0] : '—'} · median ${median()}`,
    });
  });

  frames.push({
    low: [...low],
    high: [...high],
    arrived: STREAM.length,
    median: median(),
    caption:
      'Add O(log n), median O(1), space O(n). The same two-heaps shape answers any "middle of a stream" question - and the same instinct, keep only the boundary you actually query, is what a heap is for.',
    detail: `sorted for reference: ${[...STREAM].sort((a, b) => a - b).join(', ')}`,
  });
  return frames;
})();

function MedianFrameView({ index }: { index: number }) {
  const frame = medianFrames[Math.min(Math.max(index, 0), medianFrames.length - 1)];
  const heapRow = (values: number[], prefix: string) =>
    values.length === 0
      ? [{ key: `${prefix}-empty`, label: '∅', state: 'idle' as const }]
      : values.map((value, i) => ({
          key: `${prefix}-${i}`,
          label: String(value),
          state: (i === 0 ? 'target' : 'done') as CellSpec['state'],
        }));
  return (
    <Stage tall>
      <Readout
        items={[
          { key: 'n', label: 'values seen', value: String(frame.arrived) },
          { key: 'm', label: 'median', value: frame.median },
        ]}
      />
      <div className="viz__note">low half - max-heap, root = largest of the small values</div>
      <Cells size="sm" label="low half" cells={heapRow(frame.low, 'lo')} />
      <div className="viz__note">high half - min-heap, root = smallest of the large values</div>
      <Cells size="sm" label="high half" cells={heapRow(frame.high, 'hi')} />
      <Cells
        size="sm"
        label="stream"
        cells={STREAM.map((value, i) => ({
          key: `s-${i}`,
          label: String(value),
          state: i < frame.arrived ? 'done' : 'idle',
        }))}
      />
      <Legend
        items={[
          { key: 't', state: 'target', label: 'heap root (the only thing you read)' },
          { key: 'd', state: 'done', label: 'in the heap, never inspected' },
        ]}
      />
    </Stage>
  );
}

export const streamingMedian: AnimationSpec = fromFrames(
  {
    id: 'ht-two-heaps',
    title: 'Two heaps, one median',
    blurb: 'A max-heap and a min-heap facing each other. The median is always between the two roots.',
  },
  medianFrames,
  MedianFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. A trie growing word by word, then answering a prefix query.            */
/* ------------------------------------------------------------------------ */

interface TrieNodeShape {
  key: string;
  label: string;
  depth: number;
  slot: number;
  parentSlot: number;
  /** the prefix spelled out by the path from the root to here */
  prefix: string;
  terminal: boolean;
}

const TRIE_NODES: TrieNodeShape[] = [
  { key: 'c', label: 'c', depth: 1, slot: 1.5, parentSlot: 3.5, prefix: 'c', terminal: false },
  { key: 'ca', label: 'a', depth: 2, slot: 1.5, parentSlot: 1.5, prefix: 'ca', terminal: false },
  { key: 'cat', label: 't', depth: 3, slot: 0.5, parentSlot: 1.5, prefix: 'cat', terminal: true },
  { key: 'car', label: 'r', depth: 3, slot: 2.5, parentSlot: 1.5, prefix: 'car', terminal: true },
  { key: 'cart', label: 't', depth: 4, slot: 2.5, parentSlot: 2.5, prefix: 'cart', terminal: true },
  { key: 'd', label: 'd', depth: 1, slot: 5.5, parentSlot: 3.5, prefix: 'd', terminal: false },
  { key: 'do', label: 'o', depth: 2, slot: 5.5, parentSlot: 5.5, prefix: 'do', terminal: false },
  { key: 'dog', label: 'g', depth: 3, slot: 5.5, parentSlot: 5.5, prefix: 'dog', terminal: true },
];

interface TrieFrame {
  present: string[];
  walking: string | null;
  caption: string;
  detail: string;
}

const trieFrames: TrieFrame[] = [
  {
    present: [],
    walking: null,
    caption:
      'A trie stores characters on the edges, not whole words in the nodes. The root is empty, and every path down from it spells a prefix.',
    detail: 'nothing stored yet',
  },
  {
    present: ['c', 'ca', 'cat'],
    walking: null,
    caption:
      'Insert "cat": walk down creating a node per character. The final node is flagged as the end of a word - without that flag the trie could not tell a stored word from a mere prefix.',
    detail: 'words: cat',
  },
  {
    present: ['c', 'ca', 'cat', 'car'],
    walking: null,
    caption:
      'Insert "car". The c and the a already exist and are reused - shared prefixes are stored once, which is where a trie gets its space back from.',
    detail: 'words: cat, car',
  },
  {
    present: ['c', 'ca', 'cat', 'car', 'cart'],
    walking: null,
    caption:
      'Insert "cart". It hangs off the existing "car" node, which stays flagged as a word. A node can be both a complete word and the middle of a longer one.',
    detail: 'words: cat, car, cart',
  },
  {
    present: ['c', 'ca', 'cat', 'car', 'cart', 'd', 'do', 'dog'],
    walking: null,
    caption:
      'Insert "dog". It shares nothing, so it gets its own branch off the root. Insertion cost is the length of the word - it does not depend on how many words are already stored.',
    detail: 'words: cat, car, cart, dog',
  },
  {
    present: ['c', 'ca', 'cat', 'car', 'cart', 'd', 'do', 'dog'],
    walking: 'c',
    caption:
      'Now query. Follow "c" from the root. The node exists, so at least one stored word starts with c - and answering that is the thing a hash table of words cannot do.',
    detail: 'prefix "c": exists, not a word',
  },
  {
    present: ['c', 'ca', 'cat', 'car', 'cart', 'd', 'do', 'dog'],
    walking: 'ca',
    caption:
      '"ca" also exists but is not flagged, so it is a live prefix and not a word. Two different questions, two different answers, one walk.',
    detail: 'prefix "ca": exists, not a word',
  },
  {
    present: ['c', 'ca', 'cat', 'car', 'cart', 'd', 'do', 'dog'],
    walking: 'car',
    caption:
      '"car" is flagged, so it is a word - and it still has a child, so it is also a prefix of something longer. Three characters, three pointer hops, no matter how big the dictionary is.',
    detail: 'prefix "car": word ✓, and a prefix of "cart"',
  },
  {
    present: ['c', 'ca', 'cat', 'car', 'cart', 'd', 'do', 'dog'],
    walking: 'cz',
    caption:
      '"cz" dies at the second character: c has no z child. The search stops after two hops - it never has to look at the rest of the dictionary. That early stop is what makes tries so good at pruning.',
    detail: 'prefix "cz": dead · lookup is O(length of the key)',
  },
];

function TrieFrameView({ index }: { index: number }) {
  const frame = trieFrames[Math.min(Math.max(index, 0), trieFrames.length - 1)];
  const walking = frame.walking;
  const nodes: TreeNodeSpec[] = [
    {
      key: 'root',
      label: '·',
      depth: 0,
      slot: 3.5,
      state: walking ? 'done' : 'idle',
    },
    ...TRIE_NODES.filter((node) => frame.present.includes(node.key)).map((node) => {
      const onPath = walking !== null && walking.startsWith(node.prefix);
      const head = walking === node.prefix;
      return {
        key: node.key,
        label: node.label,
        depth: node.depth,
        slot: node.slot,
        parentSlot: node.parentSlot,
        state: (head ? 'active' : onPath ? 'done' : 'idle') as TreeNodeSpec['state'],
        ...(node.terminal ? { badge: 'end' } : {}),
      };
    }),
  ];
  return (
    <Stage tall>
      <Readout
        items={[
          { key: 'q', label: 'query', value: walking ?? '—' },
          {
            key: 'v',
            label: 'verdict',
            value:
              walking === null
                ? 'building'
                : walking === 'cz'
                  ? 'dead end'
                  : TRIE_NODES.some((n) => n.prefix === walking && n.terminal)
                    ? 'word'
                    : 'prefix only',
          },
        ]}
      />
      <TreeViz nodes={nodes} slots={8} depth={5} />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'where the query ended' },
          { key: 'd', state: 'done', label: 'path walked' },
        ]}
      />
    </Stage>
  );
}

export const trieBuild: AnimationSpec = fromFrames(
  {
    id: 'ht-trie-build',
    title: 'A trie, built then queried',
    blurb: 'Four words sharing their prefixes, and the two different questions a trie can answer.',
  },
  trieFrames,
  TrieFrameView,
);

/* ------------------------------------------------------------------------ */
/* 4. Trie-pruned backtracking on a letter grid.                             */
/* ------------------------------------------------------------------------ */

const GRID = [
  ['C', 'A', 'T'],
  ['Z', 'R', 'D'],
  ['Q', 'S', 'E'],
];
const DICTIONARY = ['CAT', 'CAR', 'CARD'];

interface GridFrame {
  path: [number, number][];
  word: string;
  status: 'prefix' | 'word' | 'dead';
  found: string[];
  caption: string;
  detail: string;
}

const gridFrames: GridFrame[] = [
  {
    path: [],
    word: '',
    status: 'prefix',
    found: [],
    caption:
      'Find every dictionary word spelled by a path of adjacent cells. Plain backtracking explores every path and only checks the dictionary at the end - which means it walks a very long way down routes that were doomed at character two.',
    detail: `dictionary: ${DICTIONARY.join(', ')}`,
  },
  {
    path: [[0, 0]],
    word: 'C',
    status: 'prefix',
    found: [],
    caption:
      'Start at C. Before recursing, ask the trie: is "C" a live prefix? It is, so keep going - and hold on to the trie node you reached, so the next character is one pointer hop rather than a fresh lookup.',
    detail: '"C" is a prefix → continue',
  },
  {
    path: [
      [0, 0],
      [0, 1],
    ],
    word: 'CA',
    status: 'prefix',
    found: [],
    caption: 'Move to A. "CA" is still a live prefix, so the branch is worth exploring.',
    detail: '"CA" is a prefix → continue',
  },
  {
    path: [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    word: 'CAT',
    status: 'word',
    found: ['CAT'],
    caption:
      'Move to T. "CAT" is flagged as a word - record it. Do not stop: a found word can still be the prefix of a longer one, so keep descending unless the trie says the branch is dead.',
    detail: 'found CAT · the node has no children, so this branch ends here',
  },
  {
    path: [
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    word: 'CAR',
    status: 'word',
    found: ['CAT', 'CAR'],
    caption: 'Backtrack to A and try R instead. "CAR" is a word too - and it has a child, so there is more below.',
    detail: 'found CAR · still a live prefix',
  },
  {
    path: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
    word: 'CARD',
    status: 'word',
    found: ['CAT', 'CAR', 'CARD'],
    caption: 'D extends it to CARD. All three dictionary words come out of one shared walk down the trie.',
    detail: 'found CARD',
  },
  {
    path: [
      [0, 0],
      [1, 0],
    ],
    word: 'CZ',
    status: 'dead',
    found: ['CAT', 'CAR', 'CARD'],
    caption:
      'Back at C, try Z. "CZ" is not a prefix of anything, so the entire subtree of paths starting C-Z is cut here - every extension of a dead prefix is also dead. Without the trie you would explore all of them and reject each one at the end.',
    detail: '"CZ" is not a prefix → prune',
  },
  {
    path: [],
    word: '',
    status: 'prefix',
    found: ['CAT', 'CAR', 'CARD'],
    caption:
      'That is the whole technique: backtracking supplies the paths, the trie supplies the "stop". The dictionary is consulted once per character rather than once per completed path.',
    detail: 'trie lookups are O(1) per step when you carry the current node down the recursion',
  },
];

function GridFrameView({ index }: { index: number }) {
  const frame = gridFrames[Math.min(Math.max(index, 0), gridFrames.length - 1)];
  const rows: CellSpec[][] = GRID.map((row, r) =>
    row.map((letter, c) => {
      const step = frame.path.findIndex(([pr, pc]) => pr === r && pc === c);
      const head = step === frame.path.length - 1 && step !== -1;
      return {
        key: `g-${r}-${c}`,
        label: letter,
        state:
          step === -1
            ? 'idle'
            : head
              ? frame.status === 'dead'
                ? 'bad'
                : frame.status === 'word'
                  ? 'target'
                  : 'active'
              : 'done',
      };
    }),
  );
  return (
    <Stage tall>
      <Readout
        items={[
          { key: 'p', label: 'path spells', value: frame.word === '' ? '—' : frame.word },
          {
            key: 't',
            label: 'trie says',
            value:
              frame.word === ''
                ? '—'
                : frame.status === 'dead'
                  ? 'dead end'
                  : frame.status === 'word'
                    ? 'word'
                    : 'prefix',
          },
        ]}
      />
      <Matrix rows={rows} />
      <div className="viz__note">found so far</div>
      <Cells
        size="sm"
        label="found"
        cells={
          frame.found.length
            ? frame.found.map((word) => ({ key: `f-${word}`, label: word, state: 'target' as const }))
            : [{ key: 'f-none', label: '∅', state: 'idle' as const }]
        }
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'live prefix' },
          { key: 't', state: 'target', label: 'complete word' },
          { key: 'b', state: 'bad', label: 'pruned - not a prefix of anything' },
        ]}
      />
    </Stage>
  );
}

export const triePruning: AnimationSpec = fromFrames(
  {
    id: 'ht-trie-prune',
    title: 'Backtracking, pruned by a trie',
    blurb: 'The trie is not the answer here - it is the thing that tells you to stop searching.',
  },
  gridFrames,
  GridFrameView,
);

export const heapsTriesAnimations: AnimationSpec[] = [
  heapOperations,
  streamingMedian,
  trieBuild,
  triePruning,
];
