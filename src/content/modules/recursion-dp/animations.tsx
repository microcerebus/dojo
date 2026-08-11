import {
  Bits,
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
/* 1. A recursion tree, and the calls a memo deletes.                        */
/* ------------------------------------------------------------------------ */

/**
 * Triple step: ways(n) = ways(n−1) + ways(n−2) + ways(n−3). The tree is built
 * once with explicit slots so `TreeViz` can lay it out, then a memoised walk
 * over that fixed tree produces the frames.
 */
interface CallNode {
  id: string;
  n: number;
  depth: number;
  slot: number;
  parentSlot?: number;
  children: CallNode[];
}

export const ROOT_N = 4;

export const callTree: CallNode = (() => {
  let nextSlot = 0;
  const build = (n: number, depth: number, id: string, parentSlot?: number): CallNode => {
    const children: CallNode[] = [];
    const node: CallNode = { id, n, depth, slot: 0, children };
    if (parentSlot !== undefined) node.parentSlot = parentSlot;
    if (n === 0) {
      node.slot = nextSlot++;
      return node;
    }
    // Placeholder slot: children are built first, then the parent is centred.
    const childIds = [n - 1, n - 2, n - 3].filter((child) => child >= 0);
    const built = childIds.map((child, i) => build(child, depth + 1, `${id}-${i}`));
    node.slot = built.reduce((sum, child) => sum + child.slot, 0) / built.length;
    for (const child of built) child.parentSlot = node.slot;
    children.push(...built);
    return node;
  };
  return build(ROOT_N, 0, 'r');
})();

export const allCalls: CallNode[] = (() => {
  const out: CallNode[] = [];
  const walk = (node: CallNode) => {
    out.push(node);
    node.children.forEach(walk);
  };
  walk(callTree);
  return out;
})();

const TREE_SLOTS = allCalls.filter((node) => node.children.length === 0).length;
const TREE_DEPTH = Math.max(...allCalls.map((node) => node.depth)) + 1;

export interface TreeFrame {
  states: Record<string, CellState>;
  calls: number;
  saved: number;
  caption: string;
  detail: string;
}

export const treeFrames: TreeFrame[] = (() => {
  const frames: TreeFrame[] = [];
  const states: Record<string, CellState> = {};
  let calls = 0;
  let saved = 0;
  const memo = new Map<number, number>();

  const snapshot = (caption: string, detail: string) => {
    frames.push({ states: { ...states }, calls, saved, caption, detail });
  };

  const muteSubtree = (node: CallNode) => {
    for (const child of node.children) {
      states[child.id] = 'muted';
      muteSubtree(child);
    }
  };

  snapshot(
    `Counting the ways to climb ${ROOT_N} stairs in hops of 1, 2 or 3. The recursion writes itself: ways(n) = ways(n−1) + ways(n−2) + ways(n−3). Drawn as a tree, that is ${allCalls.length} calls.`,
    'draw the tree first - it is how you get the runtime and how you spot the repeats',
  );

  const evaluate = (node: CallNode): number => {
    const cached = memo.get(node.n);
    if (cached !== undefined) {
      states[node.id] = 'target';
      muteSubtree(node);
      const subtree = (function size(current: CallNode): number {
        return 1 + current.children.reduce((sum, child) => sum + size(child), 0);
      })(node);
      saved += subtree - 1;
      snapshot(
        `ways(${node.n}) is already in the memo, so it returns ${cached} immediately - and the entire subtree beneath it never runs.`,
        `cache hit · ${subtree - 1} calls skipped here · ${saved} skipped in total`,
      );
      return cached;
    }
    calls++;
    states[node.id] = 'active';
    if (node.n === 0) {
      memo.set(0, 1);
      states[node.id] = 'done';
      snapshot(
        'Base case: there is exactly one way to stand still at the bottom of an empty staircase. Getting this to 1 rather than 0 is what makes the counts come out right.',
        'ways(0) = 1 · store it',
      );
      return 1;
    }
    snapshot(
      `Enter ways(${node.n}). Nothing cached yet, so it has to ask its three children.`,
      `calls made: ${calls}`,
    );
    const value = node.children.reduce((sum, child) => sum + evaluate(child), 0);
    memo.set(node.n, value);
    states[node.id] = 'done';
    return value;
  };

  const answer = evaluate(callTree);
  snapshot(
    `${answer} ways, in ${calls} calls instead of ${allCalls.length}. There are only n distinct arguments, so the memo turns an exponential tree into a linear spine with n one-step detours.`,
    `O(3ⁿ) → O(n) time, O(n) space for the memo plus O(n) for the stack`,
  );
  return frames;
})();

function TreeFrameView({ index }: { index: number }) {
  const frame = treeFrames[Math.min(Math.max(index, 0), treeFrames.length - 1)];
  const nodes: TreeNodeSpec[] = allCalls.map((node) => ({
    key: node.id,
    label: String(node.n),
    depth: node.depth,
    slot: node.slot,
    state: frame.states[node.id] ?? 'idle',
    ...(node.parentSlot === undefined ? {} : { parentSlot: node.parentSlot }),
  }));
  return (
    <Stage tall>
      <TreeViz nodes={nodes} slots={TREE_SLOTS} depth={TREE_DEPTH} />
      <Readout
        items={[
          { key: 'c', label: 'calls made', value: String(frame.calls) },
          { key: 's', label: 'calls skipped', value: String(frame.saved) },
        ]}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'running' },
          { key: 'd', state: 'done', label: 'computed and memoised' },
          { key: 't', state: 'target', label: 'cache hit' },
          { key: 'm', state: 'muted', label: 'never runs' },
        ]}
      />
    </Stage>
  );
}

export const memoTree: AnimationSpec = fromFrames(
  {
    id: 'rdp-memo-tree',
    title: 'The calls a memo deletes',
    blurb: 'One cache hit removes a whole subtree, not one call.',
  },
  treeFrames,
  TreeFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. A DP table filling in, one cell at a time.                             */
/* ------------------------------------------------------------------------ */

export const COLS = 'ACE';
export const ROWS = 'ABE';

export interface TableFrame {
  values: (number | null)[][];
  current: [number, number] | null;
  deps: [number, number][];
  caption: string;
  detail: string;
}

export const tableFrames: TableFrame[] = (() => {
  const rows = ROWS.length;
  const cols = COLS.length;
  const values: (number | null)[][] = Array.from({ length: rows + 1 }, () =>
    Array.from({ length: cols + 1 }, () => null),
  );
  const frames: TableFrame[] = [];

  frames.push({
    values: values.map((row) => [...row]),
    current: null,
    deps: [],
    caption: `Longest common subsequence of "${COLS}" and "${ROWS}". The table entry at (i, j) is the answer for the first i characters of one string and the first j of the other - so the answer to the whole problem is the bottom-right cell.`,
    detail: 'the table is the memo, written down in the order it can be filled',
  });

  for (let r = 0; r <= rows; r++) values[r][0] = 0;
  for (let c = 0; c <= cols; c++) values[0][c] = 0;
  frames.push({
    values: values.map((row) => [...row]),
    current: null,
    deps: [],
    caption:
      'The base row and column are free: an empty string shares nothing with anything, so every one of those cells is 0. Getting the base edge right is most of the work in a table DP.',
    detail: 'row 0 and column 0 = 0',
  });

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const match = ROWS[r - 1] === COLS[c - 1];
      const deps: [number, number][] = match
        ? [[r - 1, c - 1]]
        : [
            [r - 1, c],
            [r, c - 1],
          ];
      values[r][c] = match
        ? (values[r - 1][c - 1] as number) + 1
        : Math.max(values[r - 1][c] as number, values[r][c - 1] as number);
      frames.push({
        values: values.map((row) => [...row]),
        current: [r, c],
        deps,
        caption: match
          ? `"${ROWS[r - 1]}" matches "${COLS[c - 1]}", so this pair is worth taking: one more than the diagonal cell, which is the answer for both strings with this character removed.`
          : `"${ROWS[r - 1]}" and "${COLS[c - 1]}" differ, so one of them has to be dropped. Take the better of the two cells that represent dropping each - above and to the left.`,
        detail: match
          ? `dp[${r}][${c}] = dp[${r - 1}][${c - 1}] + 1 = ${values[r][c]}`
          : `dp[${r}][${c}] = max(dp[${r - 1}][${c}], dp[${r}][${c - 1}]) = ${values[r][c]}`,
      });
    }
  }

  // Walk the finished table backwards so the subsequence in the caption is the
  // one this table actually encodes, rather than a value typed in by hand.
  let r = rows;
  let c = cols;
  let subsequence = '';
  while (r > 0 && c > 0) {
    if (ROWS[r - 1] === COLS[c - 1]) {
      subsequence = ROWS[r - 1] + subsequence;
      r--;
      c--;
    } else if ((values[r - 1][c] as number) >= (values[r][c - 1] as number)) {
      r--;
    } else {
      c--;
    }
  }

  frames.push({
    values: values.map((row) => [...row]),
    current: [rows, cols],
    deps: [],
    caption: `The bottom-right cell is the answer: ${values[rows][cols]}, for "${subsequence}". Every cell reads only the row above and the cell to its left, so one row of storage is enough - that is the rolling-array optimisation, O(n) space instead of O(mn).`,
    detail:
      'O(mn) time either way · keep the full table only if you must reconstruct the subsequence',
  });
  return frames;
})();

function TableFrameView({ index }: { index: number }) {
  const frame = tableFrames[Math.min(Math.max(index, 0), tableFrames.length - 1)];
  const isDep = (r: number, c: number) => frame.deps.some(([dr, dc]) => dr === r && dc === c);
  const rows: CellSpec[][] = frame.values.map((row, r) =>
    row.map((value, c) => {
      const isCurrent = frame.current?.[0] === r && frame.current?.[1] === c;
      const state: CellState = isCurrent
        ? 'active'
        : isDep(r, c)
          ? 'compare'
          : value === null
            ? 'idle'
            : 'done';
      return { key: `${r}-${c}`, label: value === null ? '·' : String(value), state };
    }),
  );
  return (
    <Stage>
      <Matrix
        rows={rows}
        colLabels={['∅', ...COLS.split('')]}
        rowLabels={['∅', ...ROWS.split('')]}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'cell being filled' },
          { key: 'c', state: 'compare', label: 'the cells it reads' },
          { key: 'd', state: 'done', label: 'already known' },
        ]}
      />
    </Stage>
  );
}

export const dpTable: AnimationSpec = fromFrames(
  {
    id: 'rdp-dp-table',
    title: 'Filling a DP table',
    blurb: 'Every cell reads two or three neighbours - which is why a rolling row is enough.',
  },
  tableFrames,
  TableFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. Backtracking on n-queens: choose, detect, unchoose.                    */
/* ------------------------------------------------------------------------ */

export const BOARD = 4;

export interface QueenFrame {
  placed: number[];
  row: number;
  rejected: number[];
  chosen: number | null;
  attempts: number;
  backtracks: number;
  caption: string;
  detail: string;
}

export const queenFrames: QueenFrame[] = (() => {
  const frames: QueenFrame[] = [];
  const placed: number[] = [];
  let attempts = 0;
  let backtracks = 0;
  let done = false;

  frames.push({
    placed: [],
    row: 0,
    rejected: [],
    chosen: null,
    attempts: 0,
    backtracks: 0,
    caption:
      'Four queens on a 4×4 board, no two sharing a row, column or diagonal. Placing exactly one queen per row is free - it makes the row constraint impossible to violate, so only columns and diagonals ever need checking.',
    detail: 'choose a column · recurse to the next row · unchoose and try again',
  });

  const conflicts = (row: number, col: number) =>
    placed.some(
      (other, otherRow) => other === col || Math.abs(other - col) === Math.abs(otherRow - row),
    );

  const solve = (row: number) => {
    if (done) return;
    if (row === BOARD) {
      done = true;
      frames.push({
        placed: [...placed],
        row,
        rejected: [],
        chosen: null,
        attempts,
        backtracks,
        caption: `A full board, found after ${attempts} placements and ${backtracks} backtracks. Testing every arrangement would have meant ${BOARD ** BOARD} boards; rejecting a square before recursing cut that to a fraction.`,
        detail: `columns ${placed.join(', ')} · pruning is what makes backtracking affordable`,
      });
      return;
    }
    let rejected: number[] = [];
    for (let col = 0; col < BOARD && !done; col++) {
      attempts++;
      if (conflicts(row, col)) {
        rejected.push(col);
        continue;
      }
      frames.push({
        placed: [...placed],
        row,
        rejected: [...rejected],
        chosen: col,
        attempts,
        backtracks,
        caption:
          rejected.length > 0
            ? `In row ${row}, column${rejected.length > 1 ? 's' : ''} ${rejected.join(', ')} ${rejected.length > 1 ? 'are' : 'is'} attacked, so those branches die immediately. Column ${col} is safe - choose it and recurse with a smaller problem.`
            : `Row ${row}, column ${col} is safe. Choose it, and recurse into the next row.`,
        detail: `placed so far: ${[...placed, col].join(', ')}`,
      });
      rejected = [];
      placed.push(col);
      solve(row + 1);
      if (done) return;
      placed.pop();
      backtracks++;
      frames.push({
        placed: [...placed],
        row,
        rejected: [],
        chosen: null,
        attempts,
        backtracks,
        caption: `Row ${row + 1} ran out of safe columns, so choosing column ${col} here was a dead end. Unchoose - lift the queen back off the board - and continue from the next column.`,
        detail: `backtracks: ${backtracks} · the state must be exactly what it was before the choice`,
      });
    }
    if (rejected.length > 0 && !done) {
      frames.push({
        placed: [...placed],
        row,
        rejected: [...rejected],
        chosen: null,
        attempts,
        backtracks,
        caption: `Every remaining column in row ${row} is attacked. There is nothing left to try, so this call returns failure and its caller has to undo its own choice.`,
        detail: `dead end at row ${row} · rejected ${rejected.join(', ')}`,
      });
    }
  };

  solve(0);
  return frames;
})();

function QueenFrameView({ index }: { index: number }) {
  const frame = queenFrames[Math.min(Math.max(index, 0), queenFrames.length - 1)];
  const rows: CellSpec[][] = Array.from({ length: BOARD }, (_, r) =>
    Array.from({ length: BOARD }, (_, c) => {
      const hasQueen = frame.placed[r] === c;
      const isChosen = frame.chosen === c && r === frame.row;
      const isRejected = r === frame.row && frame.rejected.includes(c);
      const state: CellState = hasQueen
        ? 'done'
        : isChosen
          ? 'active'
          : isRejected
            ? 'bad'
            : 'idle';
      return {
        key: `${r}-${c}`,
        label: hasQueen || isChosen ? 'Q' : isRejected ? '×' : '·',
        state,
      };
    }),
  );
  return (
    <Stage>
      <Matrix
        rows={rows}
        rowLabels={Array.from({ length: BOARD }, (_, r) => String(r))}
        colLabels={Array.from({ length: BOARD }, (_, c) => String(c))}
      />
      <Readout
        items={[
          { key: 'a', label: 'placements tried', value: String(frame.attempts) },
          { key: 'b', label: 'backtracks', value: String(frame.backtracks) },
        ]}
      />
      <Legend
        items={[
          { key: 'd', state: 'done', label: 'committed queen' },
          { key: 'a', state: 'active', label: 'safe, about to recurse' },
          { key: 'x', state: 'bad', label: 'attacked - branch pruned' },
        ]}
      />
    </Stage>
  );
}

export const nQueens: AnimationSpec = fromFrames(
  {
    id: 'rdp-n-queens',
    title: 'Backtracking on n-queens',
    blurb: 'Choose, recurse, unchoose - and prune the moment a branch cannot work.',
  },
  queenFrames,
  QueenFrameView,
);

/* ------------------------------------------------------------------------ */
/* 4. Every subset, by counting in binary.                                   */
/* ------------------------------------------------------------------------ */

export const SET = ['a', 'b', 'c'];

export interface SubsetFrame {
  mask: number;
  caption: string;
  detail: string;
}

export const subsetFrames: SubsetFrame[] = (() => {
  const frames: SubsetFrame[] = [
    {
      mask: -1,
      caption: `Every subset of a ${SET.length}-element set is a yes/no answer for each element - which is exactly a ${SET.length}-bit number. So there are ${1 << SET.length} subsets, and counting from 0 to ${(1 << SET.length) - 1} enumerates all of them, once each.`,
      detail: 'no recursion, no duplicates, no bookkeeping',
    },
  ];
  for (let mask = 0; mask < 1 << SET.length; mask++) {
    const chosen = SET.filter((_, i) => (mask & (1 << i)) !== 0);
    frames.push({
      mask,
      caption:
        mask === 0
          ? `Mask ${(0).toString(2).padStart(SET.length, '0')}: no bits set, so the empty set. Forgetting that the empty set is a subset is the classic off-by-one here.`
          : `Mask ${mask.toString(2).padStart(SET.length, '0')}: read bit i to decide whether element i is in. That gives {${chosen.join(', ')}}.`,
      detail: `${mask + 1} of ${1 << SET.length} subsets`,
    });
  }
  frames.push({
    mask: (1 << SET.length) - 1,
    caption:
      'The recursive version does the same thing: for each element, take every subset built so far both with and without it. Both are O(2ⁿ · n) - and that is optimal, because the output alone is that big.',
    detail: 'the best conceivable runtime is the size of the answer',
  });
  return frames;
})();

function SubsetFrameView({ index }: { index: number }) {
  const frame = subsetFrames[Math.min(Math.max(index, 0), subsetFrames.length - 1)];
  const mask = Math.max(frame.mask, 0);
  const cells: CellSpec[] = SET.map((label, i) => ({
    key: label,
    label,
    sub: `bit ${i}`,
    state: frame.mask < 0 ? 'idle' : (mask & (1 << i)) !== 0 ? 'target' : 'muted',
  }));
  return (
    <Stage>
      <Bits
        label="mask"
        showIndices
        bits={Array.from({ length: SET.length }, (_, i) => {
          const bitIndex = SET.length - 1 - i;
          const value = frame.mask < 0 ? 0 : (mask >> bitIndex) & 1;
          return {
            key: `b${bitIndex}`,
            value: value as 0 | 1,
            state: (frame.mask < 0 ? 'muted' : value === 1 ? 'active' : 'idle') as CellState,
          };
        })}
      />
      <Cells cells={cells} label="the set" />
      <Readout
        items={[
          {
            key: 's',
            label: 'subset',
            value:
              frame.mask < 0
                ? '—'
                : `{${SET.filter((_, i) => (mask & (1 << i)) !== 0).join(', ')}}`,
          },
        ]}
      />
      <Legend
        items={[
          { key: 't', state: 'target', label: 'in the subset' },
          { key: 'm', state: 'muted', label: 'left out' },
        ]}
      />
    </Stage>
  );
}

export const subsetsByCounting: AnimationSpec = fromFrames(
  {
    id: 'rdp-subsets-bits',
    title: 'Every subset, by counting',
    blurb: 'An n-bit counter is an enumeration of all 2ⁿ subsets.',
  },
  subsetFrames,
  SubsetFrameView,
);

export const recursionDpAnimations: AnimationSpec[] = [
  memoTree,
  dpTable,
  nQueens,
  subsetsByCounting,
];
