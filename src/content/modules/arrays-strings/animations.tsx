import {
  Buckets,
  Cells,
  Legend,
  Matrix,
  Pointers,
  Readout,
  Stage,
  type BucketSpec,
  type CellSpec,
  type PointerSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. Two pointers converging on a sorted array.                             */
/* ------------------------------------------------------------------------ */

const SORTED = [1, 3, 4, 6, 8, 11];
const PAIR_TARGET = 10;

interface TwoPointerFrame {
  lo: number;
  hi: number;
  done: boolean;
  caption: string;
  detail: string;
}

const twoPointerFrames: TwoPointerFrame[] = (() => {
  const frames: TwoPointerFrame[] = [];
  let lo = 0;
  let hi = SORTED.length - 1;
  frames.push({
    lo,
    hi,
    done: false,
    caption: `The array is sorted, so start at both ends and aim for ${PAIR_TARGET}.`,
    detail: 'invariant: every pair worth checking lies between lo and hi',
  });
  while (lo < hi) {
    const sum = SORTED[lo] + SORTED[hi];
    if (sum === PAIR_TARGET) {
      frames.push({
        lo,
        hi,
        done: true,
        caption: `${SORTED[lo]} + ${SORTED[hi]} = ${PAIR_TARGET}. Done in one pass, no extra memory.`,
        detail: 'O(n) time, O(1) space - the payoff for the array being sorted',
      });
      break;
    }
    if (sum < PAIR_TARGET) {
      frames.push({
        lo,
        hi,
        done: false,
        caption: `${SORTED[lo]} + ${SORTED[hi]} = ${sum}, too small. The only way to grow the sum is to move lo right.`,
        detail: `sum ${sum} < ${PAIR_TARGET} → lo++ (${SORTED[lo]} can never pair with anything smaller than ${SORTED[hi]})`,
      });
      lo++;
    } else {
      frames.push({
        lo,
        hi,
        done: false,
        caption: `${SORTED[lo]} + ${SORTED[hi]} = ${sum}, too big. Shrink it by moving hi left.`,
        detail: `sum ${sum} > ${PAIR_TARGET} → hi-- (${SORTED[hi]} is too large for any remaining partner)`,
      });
      hi--;
    }
  }
  return frames;
})();

function TwoPointerFrameView({ index }: { index: number }) {
  const frame = twoPointerFrames[Math.min(index, twoPointerFrames.length - 1)];
  const cells: CellSpec[] = SORTED.map((value, i) => ({
    key: `c-${i}`,
    label: String(value),
    state:
      frame.done && (i === frame.lo || i === frame.hi)
        ? 'done'
        : i === frame.lo
          ? 'active'
          : i === frame.hi
            ? 'compare'
            : i < frame.lo || i > frame.hi
              ? 'muted'
              : 'idle',
  }));
  const pointers: PointerSpec[] = [
    { key: 'lo', at: frame.lo, label: 'lo', tone: 'a' },
    { key: 'hi', at: frame.hi, label: 'hi', tone: 'b' },
  ];
  return (
    <Stage>
      <Readout
        items={[
          { key: 't', label: 'target', value: String(PAIR_TARGET) },
          {
            key: 's',
            label: 'sum',
            value: String(SORTED[frame.lo] + SORTED[frame.hi]),
          },
        ]}
      />
      <Pointers pointers={pointers} count={SORTED.length} />
      <Cells cells={cells} label="sorted array" />
      <Legend
        items={[
          { key: 'm', state: 'muted', label: 'eliminated' },
          { key: 'd', state: 'done', label: 'answer' },
        ]}
      />
    </Stage>
  );
}

export const twoPointers: AnimationSpec = fromFrames(
  {
    id: 'as-two-pointers',
    title: 'Two pointers converging',
    blurb: 'Each comparison throws away a whole column of the brute-force grid.',
  },
  twoPointerFrames,
  TwoPointerFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Hash map buckets filling, including a collision.                       */
/* ------------------------------------------------------------------------ */

const BUCKET_COUNT = 6;
const WORDS = ['cat', 'dog', 'bee', 'owl', 'fox', 'ant'];

const hashOf = (word: string) =>
  [...word].reduce((total, ch) => total + ch.charCodeAt(0), 0) % BUCKET_COUNT;

interface HashFrame {
  inserted: string[];
  active: string | null;
  bucket: number | null;
  collision: boolean;
  lookup: string | null;
  caption: string;
  detail: string;
}

const hashFrames: HashFrame[] = (() => {
  const frames: HashFrame[] = [];
  const inserted: string[] = [];
  for (const word of WORDS) {
    const bucket = hashOf(word);
    const collision = inserted.some((other) => hashOf(other) === bucket);
    inserted.push(word);
    frames.push({
      inserted: [...inserted],
      active: word,
      bucket,
      collision,
      lookup: null,
      caption: collision
        ? `hash("${word}") = ${bucket}, which is already occupied. A collision is not an error: chain the entry onto the bucket's list.`
        : `hash("${word}") = ${bucket}. Store the key and value in that bucket.`,
      detail: `sum of char codes mod ${BUCKET_COUNT} = ${bucket}${collision ? ' · collision → chain' : ''}`,
    });
  }
  const target = 'fox';
  frames.push({
    inserted: [...inserted],
    active: null,
    bucket: hashOf(target),
    collision: false,
    lookup: target,
    caption: `Lookup of "${target}": hash it once to jump straight to bucket ${hashOf(target)} - no scanning of the other buckets.`,
    detail: 'this jump is what makes lookup O(1) on average',
  });
  frames.push({
    inserted: [...inserted],
    active: null,
    bucket: hashOf(target),
    collision: false,
    lookup: target,
    caption: `Then walk that bucket's short chain comparing keys. Short chains keep it O(1); if every key collided you would be back to O(n).`,
    detail: 'worst case O(n) · average O(1) with a good hash and a sensible load factor',
  });
  return frames;
})();

function HashFrameView({ index }: { index: number }) {
  const frame = hashFrames[Math.min(index, hashFrames.length - 1)];
  const buckets: BucketSpec[] = Array.from({ length: BUCKET_COUNT }, (_, i) => ({
    key: `b-${i}`,
    index: i,
    state: frame.bucket === i ? (frame.collision ? 'compare' : 'active') : 'idle',
    entries: frame.inserted
      .filter((word) => hashOf(word) === i)
      .map((word) => ({
        key: word,
        label: word,
        state: (word === frame.active
          ? 'active'
          : word === frame.lookup
            ? 'target'
            : 'done') as CellSpecState,
      })),
  }));
  return (
    <Stage>
      <Readout
        items={[
          { key: 'n', label: 'entries', value: String(frame.inserted.length) },
          { key: 'b', label: 'buckets', value: String(BUCKET_COUNT) },
          {
            key: 'l',
            label: 'load factor',
            value: (frame.inserted.length / BUCKET_COUNT).toFixed(2),
          },
        ]}
      />
      <Buckets buckets={buckets} />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'being inserted' },
          { key: 'c', state: 'compare', label: 'collision' },
          { key: 't', state: 'target', label: 'looked up' },
        ]}
      />
    </Stage>
  );
}

type CellSpecState = NonNullable<CellSpec['state']>;

export const hashBuckets: AnimationSpec = fromFrames(
  {
    id: 'as-hash-buckets',
    title: 'Hash map buckets filling',
    blurb: 'Where the O(1) actually comes from - and what a collision really costs.',
  },
  hashFrames,
  HashFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. Sliding window: longest substring without repeating characters.        */
/* ------------------------------------------------------------------------ */

const WINDOW_INPUT = 'abcabcbb';

interface WindowFrame {
  lo: number;
  hi: number;
  best: number;
  shrinking: boolean;
  caption: string;
  detail: string;
}

const windowFrames: WindowFrame[] = (() => {
  const frames: WindowFrame[] = [];
  const seen = new Map<string, number>();
  let lo = 0;
  let best = 0;
  for (let hi = 0; hi < WINDOW_INPUT.length; hi++) {
    const ch = WINDOW_INPUT[hi];
    const previous = seen.get(ch);
    if (previous !== undefined && previous >= lo) {
      frames.push({
        lo,
        hi,
        best,
        shrinking: true,
        caption: `'${ch}' is already inside the window. Rather than restarting, jump lo to just past the old '${ch}'.`,
        detail: `duplicate at index ${previous} → lo = ${previous + 1}`,
      });
      lo = previous + 1;
    }
    seen.set(ch, hi);
    const length = hi - lo + 1;
    best = Math.max(best, length);
    frames.push({
      lo,
      hi,
      best,
      shrinking: false,
      caption: `Window "${WINDOW_INPUT.slice(lo, hi + 1)}" has no repeats, length ${length}. Best so far ${best}.`,
      detail: `lo=${lo} hi=${hi} · each index enters and leaves the window at most once → O(n)`,
    });
  }
  return frames;
})();

function WindowFrameView({ index }: { index: number }) {
  const frame = windowFrames[Math.min(index, windowFrames.length - 1)];
  const cells: CellSpec[] = [...WINDOW_INPUT].map((ch, i) => ({
    key: `w-${i}`,
    label: ch,
    sub: String(i),
    state:
      i === frame.hi
        ? frame.shrinking
          ? 'bad'
          : 'active'
        : i >= frame.lo && i < frame.hi
          ? 'done'
          : 'muted',
  }));
  return (
    <Stage>
      <Readout
        items={[
          { key: 'w', label: 'window', value: WINDOW_INPUT.slice(frame.lo, frame.hi + 1) || '—' },
          { key: 'b', label: 'best', value: String(frame.best) },
        ]}
      />
      <Pointers
        pointers={[
          { key: 'lo', at: frame.lo, label: 'lo', tone: 'a' },
          { key: 'hi', at: frame.hi, label: 'hi', tone: 'b' },
        ]}
        count={WINDOW_INPUT.length}
      />
      <Cells cells={cells} label="input string" />
      <Legend
        items={[
          { key: 'd', state: 'done', label: 'in window' },
          { key: 'b', state: 'bad', label: 'duplicate - shrink' },
        ]}
      />
    </Stage>
  );
}

export const slidingWindow: AnimationSpec = fromFrames(
  {
    id: 'as-sliding-window',
    title: 'Sliding window',
    blurb: 'Longest substring with no repeats, without ever restarting the scan.',
  },
  windowFrames,
  WindowFrameView,
);

/* ------------------------------------------------------------------------ */
/* 4. Rotating a matrix in place, layer by layer.                            */
/* ------------------------------------------------------------------------ */

const N = 4;

interface RotateFrame {
  grid: number[][];
  touched: number[];
  layer: number;
  caption: string;
  detail: string;
}

const rotateFrames: RotateFrame[] = (() => {
  const grid = Array.from({ length: N }, (_, r) =>
    Array.from({ length: N }, (_, c) => r * N + c + 1),
  );
  const frames: RotateFrame[] = [
    {
      grid: grid.map((row) => [...row]),
      touched: [],
      layer: -1,
      caption:
        'Rotating in place means never allocating a second matrix. Work one concentric layer at a time.',
      detail: 'layers: 2 for a 4x4 (the outer ring, then the inner 2x2)',
    },
  ];
  const idx = (r: number, c: number) => r * N + c;
  for (let layer = 0; layer < Math.floor(N / 2); layer++) {
    const first = layer;
    const last = N - 1 - layer;
    for (let i = first; i < last; i++) {
      const offset = i - first;
      const top = grid[first][i];
      // left -> top
      grid[first][i] = grid[last - offset][first];
      // bottom -> left
      grid[last - offset][first] = grid[last][last - offset];
      // right -> bottom
      grid[last][last - offset] = grid[i][last];
      // top -> right
      grid[i][last] = top;
      frames.push({
        grid: grid.map((row) => [...row]),
        touched: [idx(first, i), idx(last - offset, first), idx(last, last - offset), idx(i, last)],
        layer,
        caption: `Layer ${layer}, offset ${offset}: four cells swap in a single cycle - top goes to right, right to bottom, bottom to left, left to top. One temporary variable holds the value being displaced.`,
        detail: `cycle ${frames.length} · each cell is written exactly once → O(n²) time, O(1) space`,
      });
    }
  }
  frames.push({
    grid: grid.map((row) => [...row]),
    touched: [],
    layer: -1,
    caption:
      'Every cell moved exactly once. The work is O(n²) because there are n² cells - you cannot beat that, and the extra space is a single temporary.',
    detail: 'BCR for touching every pixel is O(n²) - this matches it',
  });
  return frames;
})();

function RotateFrameView({ index }: { index: number }) {
  const frame = rotateFrames[Math.min(index, rotateFrames.length - 1)];
  const rows: CellSpec[][] = frame.grid.map((row, r) =>
    row.map((value, c) => ({
      key: `m-${r}-${c}`,
      label: String(value),
      state: frame.touched.includes(r * N + c)
        ? 'active'
        : frame.layer >= 0 &&
            (r === frame.layer ||
              c === frame.layer ||
              r === N - 1 - frame.layer ||
              c === N - 1 - frame.layer)
          ? 'idle'
          : frame.layer >= 0
            ? 'muted'
            : 'idle',
    })),
  );
  return (
    <Stage>
      <Matrix rows={rows} />
      <Legend items={[{ key: 'a', state: 'active', label: 'the four cells swapping now' }]} />
    </Stage>
  );
}

export const rotateMatrix: AnimationSpec = fromFrames(
  {
    id: 'as-rotate-matrix',
    title: 'Rotate a matrix in place',
    blurb: 'Four-way cycles, one layer at a time, with a single temporary.',
  },
  rotateFrames,
  RotateFrameView,
);

/* ------------------------------------------------------------------------ */
/* 5. String building: why += in a loop is quadratic.                        */
/* ------------------------------------------------------------------------ */

const PIECES = ['ab', 'cd', 'ef', 'gh', 'ij', 'kl'];

const buildFrames = (() => {
  let naive = 0;
  let builder = 0;
  let length = 0;
  return PIECES.map((piece, i) => {
    // Immutable concatenation copies everything accumulated so far, then the piece.
    naive += length + piece.length;
    builder += piece.length;
    length += piece.length;
    return {
      step: i,
      naive,
      builder,
      length,
      caption:
        i === 0
          ? `Append "${piece}". With immutable strings, s = s + piece allocates a brand new string and copies both sides into it.`
          : `Append "${piece}". The ${length - piece.length} characters already accumulated get copied again - for the ${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} time.`,
      detail: `copied so far - naive: ${naive} chars · builder: ${builder} chars`,
    };
  });
})();

function BuildFrame({ index }: { index: number }) {
  const frame = buildFrames[Math.min(index, buildFrames.length - 1)];
  const cells: CellSpec[] = PIECES.map((piece, i) => ({
    key: `p-${i}`,
    label: piece,
    state: i === frame.step ? 'active' : i < frame.step ? 'done' : 'muted',
  }));
  return (
    <Stage>
      <Cells cells={cells} label="pieces to append" />
      <Readout
        items={[
          { key: 'n', label: 's += piece', value: `${frame.naive} copies` },
          { key: 'b', label: 'array + join', value: `${frame.builder} copies` },
        ]}
      />
      <div className="viz__bars" style={{ ['--bars-height' as string]: '90px' }}>
        <div className="viz__barCol">
          <span className="viz__barValue">{frame.naive}</span>
          <div className="viz__barTrack">
            <div className="viz__bar is-bad" style={{ height: `${(frame.naive / 60) * 100}%` }} />
          </div>
          <span className="viz__barLabel">s += piece · O(n²)</span>
        </div>
        <div className="viz__barCol">
          <span className="viz__barValue">{frame.builder}</span>
          <div className="viz__barTrack">
            <div
              className="viz__bar is-done"
              style={{ height: `${(frame.builder / 60) * 100}%` }}
            />
          </div>
          <span className="viz__barLabel">push + join · O(n)</span>
        </div>
      </div>
    </Stage>
  );
}

export const stringBuilding: AnimationSpec = fromFrames(
  {
    id: 'as-string-building',
    title: 'Why building strings with += is quadratic',
    blurb: 'Count the characters actually copied, not the lines of code.',
  },
  buildFrames,
  BuildFrame,
);

export const arraysStringsAnimations: AnimationSpec[] = [
  twoPointers,
  hashBuckets,
  slidingWindow,
  rotateMatrix,
  stringBuilding,
];
