import {
  Cells,
  Legend,
  Matrix,
  Pointers,
  Readout,
  Stage,
  type CellSpec,
  type CellState,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. Merge sort: the merge is where all the work happens.                   */
/* ------------------------------------------------------------------------ */

export interface MergeFrame {
  array: number[];
  helper: (number | null)[];
  range: [number, number] | null;
  left: number | null;
  right: number | null;
  write: number | null;
  copies: number;
  caption: string;
  detail: string;
}

export const mergeFrames: MergeFrame[] = (() => {
  const array = [5, 2, 8, 1];
  const helper: (number | null)[] = array.map(() => null);
  const frames: MergeFrame[] = [];
  let copies = 0;

  const snapshot = (
    caption: string,
    detail: string,
    range: [number, number] | null,
    left: number | null,
    right: number | null,
    write: number | null,
  ) => {
    frames.push({
      array: [...array],
      helper: [...helper],
      range,
      left,
      right,
      write,
      copies,
      caption,
      detail,
    });
  };

  snapshot(
    'Merge sort splits until the pieces are single elements - which are sorted by definition - and then does all its real work on the way back up, merging sorted runs.',
    'splitting is free; merging is the algorithm',
    null,
    null,
    null,
    null,
  );

  const merge = (low: number, mid: number, high: number) => {
    for (let i = low; i <= high; i++) {
      helper[i] = array[i];
      copies++;
    }
    snapshot(
      `Merging [${array.slice(low, mid + 1).join(', ')}] with [${array.slice(mid + 1, high + 1).join(', ')}]. Copy the whole range into the helper first, so writing back over the original cannot destroy anything still needed.`,
      `helper holds indices ${low}..${high} · ${copies} copies so far`,
      [low, high],
      low,
      mid + 1,
      low,
    );
    let l = low;
    let r = mid + 1;
    let write = low;
    while (l <= mid && r <= high) {
      const takeLeft = (helper[l] as number) <= (helper[r] as number);
      const value = takeLeft ? (helper[l] as number) : (helper[r] as number);
      array[write] = value;
      if (takeLeft) l++;
      else r++;
      write++;
      snapshot(
        `Compare the two fronts and write the smaller one back. Taking the left one on a tie is what makes merge sort stable - equal elements keep their original order.`,
        `wrote ${value} at index ${write - 1}`,
        [low, high],
        l <= mid ? l : null,
        r <= high ? r : null,
        write <= high ? write : null,
      );
    }
    while (l <= mid) {
      array[write] = helper[l] as number;
      l++;
      write++;
      snapshot(
        'The right side is exhausted, so the rest of the left side is copied straight across. The reverse case needs no work at all - those elements are already sitting in the right place.',
        `wrote ${array[write - 1]} at index ${write - 1}`,
        [low, high],
        l <= mid ? l : null,
        null,
        write <= high ? write : null,
      );
    }
    for (let i = low; i <= high; i++) helper[i] = null;
  };

  const sort = (low: number, high: number) => {
    if (low >= high) return;
    const mid = Math.floor((low + high) / 2);
    sort(low, mid);
    sort(mid + 1, high);
    merge(low, mid, high);
  };
  sort(0, array.length - 1);

  snapshot(
    `Sorted, with ${copies} elements copied into the helper along the way. Merge sort is O(n log n) in every case and stable, and the price is that O(n) helper - it is never an in-place sort.`,
    'log n levels · O(n) merging per level · O(n) auxiliary space',
    null,
    null,
    null,
    null,
  );
  return frames;
})();

function MergeFrameView({ index }: { index: number }) {
  const frame = mergeFrames[Math.min(Math.max(index, 0), mergeFrames.length - 1)];
  const inRange = (i: number) =>
    frame.range !== null && i >= frame.range[0] && i <= frame.range[1];
  const cells: CellSpec[] = frame.array.map((value, i) => ({
    key: `a${i}`,
    label: String(value),
    sub: String(i),
    state: (i === frame.write ? 'target' : inRange(i) ? 'done' : 'idle') as CellState,
  }));
  const helperCells: CellSpec[] = frame.helper.map((value, i) => ({
    key: `h${i}`,
    label: value === null ? '·' : String(value),
    state: (value === null
      ? 'muted'
      : i === frame.left || i === frame.right
        ? 'active'
        : 'compare') as CellState,
  }));
  return (
    <Stage>
      <Cells cells={cells} label="array" />
      <Pointers
        count={frame.array.length}
        below
        pointers={frame.write === null ? [] : [{ key: 'w', at: frame.write, label: 'write', tone: 'c' }]}
      />
      <Cells cells={helperCells} label="helper" />
      <Pointers
        count={frame.helper.length}
        below
        pointers={[
          ...(frame.left === null ? [] : [{ key: 'l', at: frame.left, label: 'L', tone: 'a' as const }]),
          ...(frame.right === null ? [] : [{ key: 'r', at: frame.right, label: 'R', tone: 'b' as const }]),
        ]}
      />
      <Readout items={[{ key: 'c', label: 'helper copies', value: String(frame.copies) }]} />
    </Stage>
  );
}

export const mergeSort: AnimationSpec = fromFrames(
  {
    id: 'sort-merge-sort',
    title: 'Merge sort, one merge at a time',
    blurb: 'The split is free. The merge is the algorithm - and it needs a helper array.',
  },
  mergeFrames,
  MergeFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Quicksort: partitioning around a pivot, and the pivot that ruins it.   */
/* ------------------------------------------------------------------------ */

export interface PartitionFrame {
  array: number[];
  left: number;
  right: number;
  pivot: number;
  swapped: [number, number] | null;
  settled: boolean;
  caption: string;
  detail: string;
}

export const partitionFrames: PartitionFrame[] = (() => {
  const array = [7, 2, 5, 9, 1, 8];
  const frames: PartitionFrame[] = [];
  let left = 0;
  let right = array.length - 1;
  const pivot = array[Math.floor((left + right) / 2)];

  const snapshot = (
    caption: string,
    detail: string,
    swapped: [number, number] | null = null,
    settled = false,
  ) => {
    frames.push({ array: [...array], left, right, pivot, swapped, settled, caption, detail });
  };

  snapshot(
    `Quicksort picks a pivot - here the middle element, ${pivot} - and rearranges the array so everything smaller sits on the left and everything larger on the right. No helper array: it works entirely by swapping.`,
    'partition first, then recurse into each side',
  );

  while (left <= right) {
    while (array[left] < pivot) {
      left++;
      snapshot(
        `${array[left - 1]} is already smaller than the pivot, so it is on the correct side. Advance the left scan.`,
        `left = ${left}`,
      );
    }
    while (array[right] > pivot) {
      right--;
      snapshot(
        `${array[right + 1]} is larger than the pivot, so it belongs on the right. Pull the right scan inwards.`,
        `right = ${right}`,
      );
    }
    if (left <= right) {
      const a = array[left];
      const b = array[right];
      [array[left], array[right]] = [array[right], array[left]];
      snapshot(
        left === right
          ? `The two scans have met on ${a}, which is exactly where the boundary belongs. Swapping it with itself is a no-op; step both past it and the loop ends.`
          : `Both scans are stuck on elements that are on the wrong side, so swap them - ${a} and ${b} - and move both inwards.`,
        `swap indices ${left} and ${right}`,
        [left, right],
      );
      left++;
      right--;
    }
  }

  snapshot(
    `Partitioned: everything left of index ${left} is at most ${pivot}, everything from there on is at least ${pivot}. Recursing into both sides sorts the array, in place.`,
    `boundary at index ${left} · no auxiliary array, only O(log n) stack`,
    null,
    true,
  );
  snapshot(
    'The catch: the pivot is not guaranteed to be near the median. Pick the smallest element every time and each partition peels off one item, giving O(n²). Random or median-of-three pivots make that vanishingly unlikely - but it is still a worst case, and merge sort has none.',
    'O(n log n) expected · O(n²) worst · in place · not stable',
    null,
    true,
  );
  return frames;
})();

function PartitionFrameView({ index }: { index: number }) {
  const frame = partitionFrames[Math.min(Math.max(index, 0), partitionFrames.length - 1)];
  const cells: CellSpec[] = frame.array.map((value, i) => {
    let state: CellState = 'idle';
    if (frame.settled) state = value <= frame.pivot ? 'done' : 'compare';
    else if (frame.swapped?.includes(i)) state = 'target';
    else if (i === frame.left || i === frame.right) state = 'active';
    else if (value === frame.pivot) state = 'compare';
    return { key: `p${i}`, label: String(value), sub: String(i), state };
  });
  return (
    <Stage>
      <Cells cells={cells} label="array" />
      <Pointers
        count={frame.array.length}
        below
        pointers={[
          { key: 'l', at: frame.left, label: 'left', tone: 'a' },
          { key: 'r', at: frame.right, label: 'right', tone: 'b' },
        ]}
      />
      <Readout items={[{ key: 'p', label: 'pivot', value: String(frame.pivot) }]} />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'scan position' },
          { key: 't', state: 'target', label: 'just swapped' },
          { key: 'd', state: 'done', label: 'at most the pivot' },
        ]}
      />
    </Stage>
  );
}

export const quickPartition: AnimationSpec = fromFrames(
  {
    id: 'sort-quick-partition',
    title: 'Quicksort partitioning',
    blurb: 'Two scans walk inwards and swap. In place, but the pivot decides the runtime.',
  },
  partitionFrames,
  PartitionFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. Binary search on a rotated array.                                      */
/* ------------------------------------------------------------------------ */

export interface RotatedFrame {
  lo: number;
  hi: number;
  mid: number | null;
  leftSorted: boolean | null;
  found: boolean;
  steps: number;
  caption: string;
  detail: string;
}

export const ROTATED = [15, 16, 19, 20, 25, 1, 3, 4, 5];
export const TARGET = 20;

export const rotatedFrames: RotatedFrame[] = (() => {
  const frames: RotatedFrame[] = [];
  let lo = 0;
  let hi = ROTATED.length - 1;
  let steps = 0;

  frames.push({
    lo,
    hi,
    mid: null,
    leftSorted: null,
    found: false,
    steps,
    caption: `A sorted array rotated an unknown number of times, and we want ${TARGET}. Plain binary search fails because "is the target bigger than the midpoint" no longer tells you which side to keep.`,
    detail: 'but one half is always still in sorted order - find it, and the decision is easy again',
  });

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    steps++;
    if (ROTATED[mid] === TARGET) {
      frames.push({
        lo,
        hi,
        mid,
        leftSorted: null,
        found: true,
        steps,
        caption: `Found ${TARGET} at index ${mid}, after ${steps} probes into a ${ROTATED.length}-element array. The rotation costs one extra comparison per step, not an extra factor of anything.`,
        detail: 'O(log n) with distinct values',
      });
      break;
    }
    const leftSorted = ROTATED[lo] <= ROTATED[mid];
    const inLeft = leftSorted && ROTATED[lo] <= TARGET && TARGET < ROTATED[mid];
    const inRight = !leftSorted && ROTATED[mid] < TARGET && TARGET <= ROTATED[hi];
    frames.push({
      lo,
      hi,
      mid,
      leftSorted,
      found: false,
      steps,
      caption: leftSorted
        ? `The left half runs ${ROTATED[lo]} … ${ROTATED[mid]} with no wrap, so it is the sorted one. A plain range check answers whether the target can be in it.`
        : `The left half wraps, so the right half - ${ROTATED[mid]} … ${ROTATED[hi]} - is the sorted one. Range-check that side instead.`,
      detail: `a[${lo}] = ${ROTATED[lo]} · a[${mid}] = ${ROTATED[mid]} · a[${hi}] = ${ROTATED[hi]}`,
    });
    if (inLeft || inRight) {
      if (inLeft) hi = mid - 1;
      else lo = mid + 1;
    } else if (leftSorted) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
    frames.push({
      lo,
      hi,
      mid: null,
      leftSorted,
      found: false,
      steps,
      caption:
        inLeft || inRight
          ? 'The target falls inside the sorted half, so keep that half and discard the other one entirely.'
          : 'The target is not inside the sorted half, so it can only be in the messy one. Discard the sorted side.',
      detail: `search window is now ${lo}..${hi}`,
    });
  }

  frames.push({
    lo,
    hi,
    mid: null,
    leftSorted: null,
    found: true,
    steps,
    caption:
      'Duplicates break this. If the low, middle and high values are all equal you cannot tell which half is sorted, so the only safe move is to shrink one end by one - which degrades the worst case to O(n).',
    detail: 'always ask whether duplicates are possible before claiming O(log n)',
  });
  return frames;
})();

function RotatedFrameView({ index }: { index: number }) {
  const frame = rotatedFrames[Math.min(Math.max(index, 0), rotatedFrames.length - 1)];
  const cells: CellSpec[] = ROTATED.map((value, i) => {
    const inWindow = i >= frame.lo && i <= frame.hi;
    let state: CellState = 'idle';
    if (!inWindow) state = 'muted';
    else if (i === frame.mid) state = frame.found && value === TARGET ? 'target' : 'active';
    else if (frame.mid !== null && frame.leftSorted !== null) {
      const sortedHalf = frame.leftSorted
        ? i >= frame.lo && i < frame.mid
        : i > frame.mid && i <= frame.hi;
      state = sortedHalf ? 'done' : 'idle';
    }
    return { key: `r${i}`, label: String(value), sub: String(i), state };
  });
  return (
    <Stage>
      <Cells cells={cells} label="rotated array" />
      <Readout
        items={[
          { key: 't', label: 'target', value: String(TARGET) },
          { key: 'w', label: 'window', value: frame.lo > frame.hi ? '—' : `${frame.lo}..${frame.hi}` },
          { key: 's', label: 'probes', value: String(frame.steps) },
        ]}
      />
      <Legend
        items={[
          { key: 'd', state: 'done', label: 'the half that is genuinely sorted' },
          { key: 'a', state: 'active', label: 'midpoint' },
          { key: 'm', state: 'muted', label: 'eliminated' },
        ]}
      />
    </Stage>
  );
}

export const rotatedSearch: AnimationSpec = fromFrames(
  {
    id: 'sort-rotated-search',
    title: 'Searching a rotated array',
    blurb: 'One half is always sorted. Work out which, and binary search still applies.',
  },
  rotatedFrames,
  RotatedFrameView,
);

/* ------------------------------------------------------------------------ */
/* 4. Row- and column-sorted matrix: eliminate a line per step.              */
/* ------------------------------------------------------------------------ */

export const GRID = [
  [15, 20, 40, 85],
  [20, 35, 80, 95],
  [30, 55, 95, 105],
  [40, 80, 100, 120],
];
export const NEEDLE = 55;

export interface GridFrame {
  row: number;
  col: number;
  killedRows: number[];
  killedCols: number[];
  found: boolean;
  steps: number;
  caption: string;
  detail: string;
}

export const gridFrames: GridFrame[] = (() => {
  const frames: GridFrame[] = [];
  let row = 0;
  let col = GRID[0].length - 1;
  const killedRows: number[] = [];
  const killedCols: number[] = [];
  let steps = 0;

  frames.push({
    row,
    col,
    killedRows: [],
    killedCols: [],
    found: false,
    steps,
    caption: `Every row and every column of this grid is sorted ascending, and we want ${NEEDLE}. Starting in a corner is what makes it work - the top-right cell is the largest in its row and the smallest in its column.`,
    detail: 'binary searching each row would be O(m log n); this is O(m + n)',
  });

  while (row < GRID.length && col >= 0) {
    steps++;
    const value = GRID[row][col];
    if (value === NEEDLE) {
      frames.push({
        row,
        col,
        killedRows: [...killedRows],
        killedCols: [...killedCols],
        found: true,
        steps,
        caption: `Found ${NEEDLE} at row ${row}, column ${col} after ${steps} comparisons. Each step threw away a whole row or a whole column, so the walk can never be longer than rows plus columns.`,
        detail: 'O(m + n) time, O(1) space',
      });
      break;
    }
    if (value > NEEDLE) {
      killedCols.push(col);
      col--;
      frames.push({
        row,
        col,
        killedRows: [...killedRows],
        killedCols: [...killedCols],
        found: false,
        steps,
        caption: `${value} is too big, and it is the smallest value in its column - so nothing in that column can be the answer. Delete the whole column and step left.`,
        detail: `${killedCols.length} columns and ${killedRows.length} rows eliminated`,
      });
    } else {
      killedRows.push(row);
      row++;
      frames.push({
        row,
        col,
        killedRows: [...killedRows],
        killedCols: [...killedCols],
        found: false,
        steps,
        caption: `${value} is too small, and it is the largest value in what remains of its row - so nothing left in that row can be the answer. Delete the row and step down.`,
        detail: `${killedCols.length} columns and ${killedRows.length} rows eliminated`,
      });
    }
  }
  return frames;
})();

function GridFrameView({ index }: { index: number }) {
  const frame = gridFrames[Math.min(Math.max(index, 0), gridFrames.length - 1)];
  const rows: CellSpec[][] = GRID.map((line, r) =>
    line.map((value, c) => {
      const dead = frame.killedRows.includes(r) || frame.killedCols.includes(c);
      const here = r === frame.row && c === frame.col;
      const state: CellState = here
        ? frame.found
          ? 'target'
          : 'active'
        : dead
          ? 'muted'
          : 'idle';
      return { key: `${r}-${c}`, label: String(value), state };
    }),
  );
  return (
    <Stage>
      <Matrix rows={rows} />
      <Readout
        items={[
          { key: 'n', label: 'looking for', value: String(NEEDLE) },
          { key: 's', label: 'comparisons', value: String(frame.steps) },
        ]}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'current cell' },
          { key: 'm', state: 'muted', label: 'eliminated by one comparison' },
        ]}
      />
    </Stage>
  );
}

export const matrixCornerSearch: AnimationSpec = fromFrames(
  {
    id: 'sort-matrix-corner',
    title: 'Searching a row/column-sorted matrix',
    blurb: 'Start in a corner, and each comparison deletes an entire row or column.',
  },
  gridFrames,
  GridFrameView,
);

export const sortingSearchingAnimations: AnimationSpec[] = [
  mergeSort,
  quickPartition,
  rotatedSearch,
  matrixCornerSearch,
];
