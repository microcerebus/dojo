import { Bits, Legend, Readout, Stage, type CellState } from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

const WIDTH = 8;
const BYTE = 0xff;

interface BitSpec {
  key: string;
  value: 0 | 1;
  state?: CellState;
}

/**
 * One row of bits, most significant first. `stateAt` is given the bit's own
 * index (0 = least significant), which is how the book indexes bits, so the
 * callers read the same way the lesson text does.
 */
function bitRow(
  value: number,
  keyPrefix: string,
  stateAt?: (bitIndex: number, bit: 0 | 1) => CellState | undefined,
): BitSpec[] {
  const bits: BitSpec[] = [];
  for (let i = WIDTH - 1; i >= 0; i--) {
    const bit = ((value >> i) & 1) as 0 | 1;
    const state = stateAt?.(i, bit);
    bits.push({ key: `${keyPrefix}-${i}`, value: bit, ...(state ? { state } : {}) });
  }
  return bits;
}

const binary = (value: number) => (value & BYTE).toString(2).padStart(WIDTH, '0');

/* ------------------------------------------------------------------------ */
/* 1. The four mask operations, on one byte and one bit position.            */
/* ------------------------------------------------------------------------ */

const I = 3;

interface MaskFrame {
  before: number;
  mask: number | null;
  maskLabel: string;
  after: number | null;
  expr: string;
  caption: string;
  detail: string;
}

const maskFrames: MaskFrame[] = (() => {
  const start = 0b10110100;
  const bit = 1 << I;
  const set = (start | bit) & BYTE;
  const cleared = (set & ~bit) & BYTE;
  const updated = (cleared | (1 << I)) & BYTE;
  const keepLow = updated & ((1 << I) - 1);
  const keepHigh = updated & ((-1 << (I + 1)) & BYTE);
  return [
    {
      before: start,
      mask: null,
      maskLabel: '',
      after: null,
      expr: 'n = 0b10110100, i = 3',
      caption:
        'One byte, and one bit position to work on: i = 3. All four standard operations are the same two moves - build a mask, then pick the operator that leaves every other bit alone.',
      detail: 'bit 0 is the least significant bit, on the right',
    },
    {
      before: start,
      mask: bit,
      maskLabel: '1 << i',
      after: null,
      expr: '1 << 3',
      caption:
        'Build the mask: shift a single 1 left by i. Every other position in the mask is 0, and that is what makes the operators surgical.',
      detail: 'mask = 00001000 - a 1 exactly where you intend to act',
    },
    {
      before: start,
      mask: bit,
      maskLabel: '1 << i',
      after: start & bit,
      expr: '(n & (1 << i)) !== 0',
      caption:
        'Get: AND with the mask. Every other bit is ANDed with 0 and dies, so the result is non-zero exactly when bit i was set. Here it is zero, so bit 3 is a 0.',
      detail: 'n & mask = 00000000 → bit 3 is 0',
    },
    {
      before: start,
      mask: bit,
      maskLabel: '1 << i',
      after: set,
      expr: 'n | (1 << i)',
      caption:
        'Set: OR with the mask. ORing with 0 leaves a bit untouched, so only bit 3 can change - and it is forced to 1.',
      detail: `result = ${binary(set)} · every other bit is provably unchanged`,
    },
    {
      before: set,
      mask: ~bit & BYTE,
      maskLabel: '~(1 << i)',
      after: cleared,
      expr: 'n & ~(1 << i)',
      caption:
        'Clear: invert the mask first, so it is all 1s with a single 0. AND leaves every 1-position alone and forces position i to 0.',
      detail: `mask = ${binary(~bit)} · result = ${binary(cleared)}`,
    },
    {
      before: cleared,
      mask: ~bit & BYTE,
      maskLabel: '~(1 << i)',
      after: updated,
      expr: '(n & ~(1 << i)) | (v << i)',
      caption:
        'Update to a value v: clear first, then OR in v shifted into place. Clearing first is what makes it work for v = 0 as well as v = 1 - "just OR it in" only ever sets.',
      detail: `v = 1 → result = ${binary(updated)}`,
    },
    {
      before: updated,
      mask: (1 << I) - 1,
      maskLabel: '(1 << i) - 1',
      after: keepLow,
      expr: 'n & ((1 << i) - 1)',
      caption:
        'Clearing a whole range is the same idea with a fatter mask. Subtracting 1 from a lone 1 bit turns it into i ones, which keeps only the bits below i.',
      detail: `mask = ${binary((1 << I) - 1)} · everything from bit i upwards is gone`,
    },
    {
      before: updated,
      mask: (-1 << (I + 1)) & BYTE,
      maskLabel: '-1 << (i + 1)',
      after: keepHigh,
      expr: 'n & (-1 << (i + 1))',
      caption:
        'The mirror image: -1 is all 1s, so shifting it left by i+1 gives 1s on top and zeros below. That clears bits i through 0 and keeps the rest.',
      detail: `mask = ${binary(-1 << (I + 1))} · result = ${binary(keepHigh)}`,
    },
    {
      before: updated,
      mask: null,
      maskLabel: '',
      after: null,
      expr: 'get & · set | · clear & ~ · update clear-then-|',
      caption:
        'Four operations, one recipe. Do not memorise the expressions - derive them from "which operator leaves a bit alone": AND with 1, OR with 0, XOR with 0.',
      detail: 'the identities are the reason the masks work, not a separate fact',
    },
  ];
})();

function MaskFrameView({ index }: { index: number }) {
  const frame = maskFrames[Math.min(Math.max(index, 0), maskFrames.length - 1)];
  const focus = (bitIndex: number): CellState | undefined =>
    bitIndex === I ? 'active' : undefined;
  return (
    <Stage>
      <Bits label="n" bits={bitRow(frame.before, `n${index}`, focus)} showIndices />
      {frame.mask === null ? null : (
        <Bits
          label={frame.maskLabel}
          bits={bitRow(frame.mask, `m${index}`, (bitIndex, bit) =>
            bitIndex === I ? 'compare' : bit === 1 ? 'done' : 'muted',
          )}
        />
      )}
      {frame.after === null ? null : (
        <Bits
          label="result"
          bits={bitRow(frame.after, `r${index}`, (bitIndex) =>
            bitIndex === I ? 'target' : undefined,
          )}
        />
      )}
      <Readout items={[{ key: 'e', label: 'expression', value: frame.expr }]} />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'bit i, the only bit allowed to change' },
          { key: 't', state: 'target', label: 'the result' },
        ]}
      />
    </Stage>
  );
}

export const maskOps: AnimationSpec = fromFrames(
  {
    id: 'bm-mask-ops',
    title: 'Get, set, clear, update',
    blurb: 'Build a mask, then choose the operator that leaves the other bits alone.',
  },
  maskFrames,
  MaskFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Two's complement: negation by invert-then-add-one.                     */
/* ------------------------------------------------------------------------ */

interface ComplementFrame {
  rows: { key: string; label: string; value: number; highlightSign?: boolean }[];
  caption: string;
  detail: string;
}

const complementFrames: ComplementFrame[] = (() => {
  const five = 0b00000101;
  const inverted = ~five & BYTE;
  const negFive = (inverted + 1) & BYTE;
  return [
    {
      rows: [{ key: 'a', label: '+5', value: five, highlightSign: true }],
      caption:
        'Eight bits holding +5. The top bit is the sign bit: 0 for non-negative. Nothing else about the representation is special yet.',
      detail: '00000101 = 5 · sign bit 0',
    },
    {
      rows: [
        { key: 'a', label: '+5', value: five },
        { key: 'b', label: '~5', value: inverted, highlightSign: true },
      ],
      caption:
        'Step one of negation: invert every bit. On its own this is "one\'s complement", and it is off by one - notice the sign bit has flipped to 1.',
      detail: '~00000101 = 11111010',
    },
    {
      rows: [
        { key: 'a', label: '+5', value: five },
        { key: 'b', label: '~5', value: inverted },
        { key: 'c', label: '-5', value: negFive, highlightSign: true },
      ],
      caption:
        'Step two: add 1. That is the whole rule - invert, then add one - and it works in both directions, so applying it to -5 gives +5 back.',
      detail: '11111010 + 1 = 11111011 = -5',
    },
    {
      rows: [
        { key: 'a', label: '+5', value: five },
        { key: 'c', label: '-5', value: negFive },
        { key: 'd', label: 'sum', value: (five + negFive) & BYTE, highlightSign: true },
      ],
      caption:
        'The point of the representation: 5 + (-5) carries off the top of the byte and leaves all zeros. Subtraction is just addition, so the hardware needs one adder, not two.',
      detail: '00000101 + 11111011 = 1 00000000, and the carry out is dropped',
    },
    {
      rows: [
        { key: 'e', label: '-1', value: BYTE, highlightSign: true },
        { key: 'f', label: '-1 >> 1', value: BYTE },
        { key: 'g', label: '-1 >>> 1', value: 0b01111111 },
      ],
      caption:
        '-1 is all 1s, which is why the two right shifts diverge. Arithmetic >> copies the sign bit in, so -1 stays -1 forever. Logical >>> feeds in zeros, so it marches to 0.',
      detail: 'shift a negative number right in a loop and the operator decides the answer',
    },
  ];
})();

function ComplementFrameView({ index }: { index: number }) {
  const frame = complementFrames[Math.min(Math.max(index, 0), complementFrames.length - 1)];
  return (
    <Stage>
      {frame.rows.map((row) => (
        <Bits
          key={row.key}
          label={row.label}
          bits={bitRow(row.value, `${row.key}${index}`, (bitIndex) =>
            row.highlightSign && bitIndex === WIDTH - 1 ? 'active' : undefined,
          )}
        />
      ))}
      <Legend items={[{ key: 's', state: 'active', label: 'sign bit' }]} />
    </Stage>
  );
}

export const twosComplement: AnimationSpec = fromFrames(
  {
    id: 'bm-twos-complement',
    title: "Two's complement negation",
    blurb: 'Invert, add one - and subtraction becomes addition.',
  },
  complementFrames,
  ComplementFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. n & (n-1) clears the lowest set bit.                                   */
/* ------------------------------------------------------------------------ */

interface ClearFrame {
  n: number;
  count: number;
  caption: string;
  detail: string;
}

const clearFrames: ClearFrame[] = (() => {
  const frames: ClearFrame[] = [];
  let n = 0b10110100;
  let count = 0;
  frames.push({
    n,
    count,
    caption:
      'The single most useful bit trick: n & (n−1) removes the lowest set bit and nothing else. Watch what subtracting 1 does first.',
    detail: `n = ${binary(n)} · 4 bits are set`,
  });
  while (n !== 0) {
    const lowest = n & -n;
    const next = n & (n - 1);
    count++;
    frames.push({
      n: next,
      count,
      caption: `Subtracting 1 flips the lowest 1 to 0 and turns every 0 below it into a 1, so n and n−1 share every bit above it and none at or below. ANDing them wipes out ${binary(lowest)}.`,
      detail: `${binary(n)} & ${binary(n - 1)} = ${binary(next)} · ${count} set bits removed so far`,
    });
    n = next;
  }
  frames.push({
    n: 0,
    count,
    caption: `Zero after ${count} steps, so n had ${count} set bits - that is popcount in O(set bits), not O(width). And "n & (n−1) === 0" means there was at most one set bit, which is the power-of-two test.`,
    detail: 'one expression, three questions answered: clear, count, and is-it-a-power-of-two',
  });
  return frames;
})();

function ClearFrameView({ index }: { index: number }) {
  const frame = clearFrames[Math.min(Math.max(index, 0), clearFrames.length - 1)];
  const lowest = frame.n & -frame.n;
  return (
    <Stage>
      <Bits
        label="n"
        showIndices
        bits={bitRow(frame.n, `c${index}`, (bitIndex, bit) =>
          (1 << bitIndex) === lowest ? 'active' : bit === 1 ? 'done' : undefined,
        )}
      />
      {frame.n === 0 ? null : (
        <Bits
          label="n − 1"
          bits={bitRow(frame.n - 1, `d${index}`, (bitIndex) =>
            (1 << bitIndex) <= lowest ? 'bad' : undefined,
          )}
        />
      )}
      <Readout
        items={[
          { key: 'v', label: 'value', value: String(frame.n) },
          { key: 'k', label: 'bits cleared', value: String(frame.count) },
        ]}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'lowest set bit, about to go' },
          { key: 'b', state: 'bad', label: 'the borrow region in n − 1' },
        ]}
      />
    </Stage>
  );
}

export const clearLowestBit: AnimationSpec = fromFrames(
  {
    id: 'bm-clear-lowest-bit',
    title: 'n & (n−1)',
    blurb: 'Clears the lowest set bit - so it counts bits and tests powers of two.',
  },
  clearFrames,
  ClearFrameView,
);

/* ------------------------------------------------------------------------ */
/* 4. Addition with no + : XOR for the sum, AND-and-shift for the carry.     */
/* ------------------------------------------------------------------------ */

interface AddFrame {
  a: number;
  b: number;
  sum: number | null;
  carry: number | null;
  round: number;
  caption: string;
  detail: string;
}

const addFrames: AddFrame[] = (() => {
  const frames: AddFrame[] = [];
  let a = 0b00001011;
  let b = 0b00000110;
  frames.push({
    a,
    b,
    sum: null,
    carry: null,
    round: 0,
    caption:
      'Add 11 and 6 without the + operator. Do a column of binary addition by hand and you get two separate answers: the digit you write down, and the digit you carry.',
    detail: 'a = 00001011 (11) · b = 00000110 (6)',
  });
  let round = 0;
  while (b !== 0) {
    round++;
    const sum = (a ^ b) & BYTE;
    const carry = ((a & b) << 1) & BYTE;
    frames.push({
      a,
      b,
      sum,
      carry,
      round,
      caption: `Round ${round}: XOR is addition with the carry thrown away, and AND finds every column that produced a carry - shifted left one place, because a carry lands in the next column.`,
      detail: `a ^ b = ${binary(sum)} · (a & b) << 1 = ${binary(carry)}`,
    });
    a = sum;
    b = carry;
    frames.push({
      a,
      b,
      sum: null,
      carry: null,
      round,
      caption:
        b === 0
          ? `The carry is zero, so nothing is left to propagate: a is the answer, ${a}. Each round pushes the carries further left, so it always terminates.`
          : 'Feed the partial sum and the carry back in as the new a and b, and go again. This is exactly what a ripple-carry adder does in hardware.',
      detail: b === 0 ? `result = ${binary(a)} = ${a}` : `a = ${binary(a)} · b = ${binary(b)}`,
    });
  }
  return frames;
})();

function AddFrameView({ index }: { index: number }) {
  const frame = addFrames[Math.min(Math.max(index, 0), addFrames.length - 1)];
  return (
    <Stage>
      <Bits label="a" bits={bitRow(frame.a, `aa${index}`)} />
      <Bits label="b" bits={bitRow(frame.b, `ab${index}`)} />
      {frame.sum === null ? null : (
        <Bits
          label="a ^ b"
          bits={bitRow(frame.sum, `as${index}`, (_, bit) => (bit === 1 ? 'target' : undefined))}
        />
      )}
      {frame.carry === null ? null : (
        <Bits
          label="(a & b) << 1"
          bits={bitRow(frame.carry, `ac${index}`, (_, bit) => (bit === 1 ? 'compare' : undefined))}
        />
      )}
      <Readout
        items={[
          { key: 'r', label: 'round', value: String(frame.round) },
          { key: 'v', label: 'a + b so far', value: String(frame.a + frame.b) },
        ]}
      />
      <Legend
        items={[
          { key: 's', state: 'target', label: 'sum without carry (XOR)' },
          { key: 'c', state: 'compare', label: 'carry (AND, shifted)' },
        ]}
      />
    </Stage>
  );
}

export const addWithoutPlus: AnimationSpec = fromFrames(
  {
    id: 'bm-add-without-plus',
    title: 'Adding with no + operator',
    blurb: 'XOR is the sum, AND-then-shift is the carry. Repeat until the carry dies.',
  },
  addFrames,
  AddFrameView,
);

/* ------------------------------------------------------------------------ */
/* 5. A byte-packed screen, and a line drawn across byte boundaries.         */
/* ------------------------------------------------------------------------ */

interface DrawFrame {
  bytes: number[];
  touched: number | null;
  mask: number | null;
  maskLabel: string;
  caption: string;
  detail: string;
}

const SCREEN_BYTES = 4;
const X1 = 5;
const X2 = 26;

const drawFrames: DrawFrame[] = (() => {
  const bytes = new Array<number>(SCREEN_BYTES).fill(0);
  const frames: DrawFrame[] = [
    {
      bytes: [...bytes],
      touched: null,
      mask: null,
      maskLabel: '',
      caption:
        'A monochrome row of 32 pixels stored as 4 bytes - eight pixels per byte. Drawing a line from x = 5 to x = 26 one pixel at a time works, but it does 22 read-modify-writes.',
      detail: 'pixel x lives in byte x >> 3, at bit 7 − (x & 7)',
    },
  ];
  const startByte = X1 >> 3;
  const endByte = X2 >> 3;
  const startMask = BYTE >> (X1 & 7);
  const endMask = ~(BYTE >> ((X2 & 7) + 1)) & BYTE;

  bytes[startByte] |= startMask;
  frames.push({
    bytes: [...bytes],
    touched: startByte,
    mask: startMask,
    maskLabel: '0xFF >> (x1 & 7)',
    caption:
      'Handle the ragged start with one mask: all 1s shifted right by the offset inside the byte, so it turns on the pixels from x1 to the end of that byte and nothing before it.',
    detail: `byte ${startByte} · mask ${binary(startMask)}`,
  });

  for (let b = startByte + 1; b < endByte; b++) {
    bytes[b] = BYTE;
    frames.push({
      bytes: [...bytes],
      touched: b,
      mask: BYTE,
      maskLabel: '0xFF',
      caption:
        'Every byte fully inside the line is just a store of 0xFF - eight pixels for the price of one write. That is the whole optimisation.',
      detail: `byte ${b} = 11111111`,
    });
  }

  bytes[endByte] |= endMask;
  frames.push({
    bytes: [...bytes],
    touched: endByte,
    mask: endMask,
    maskLabel: '~(0xFF >> ((x2 & 7) + 1))',
    caption:
      'The ragged end is the mirror mask: 1s down to x2 and 0s after it. Note the +1, because x2 itself is inside the line - this off-by-one is where the bug usually is.',
    detail: `byte ${endByte} · mask ${binary(endMask)}`,
  });

  frames.push({
    bytes: [...bytes],
    touched: null,
    mask: null,
    maskLabel: '',
    caption:
      'Three writes instead of twenty-two. The case that breaks naive code is x1 and x2 landing in the same byte: then there are no full bytes and you must AND the two masks together.',
    detail: 'always test: same byte, byte-aligned ends, and a one-pixel line',
  });
  return frames;
})();

function DrawFrameView({ index }: { index: number }) {
  const frame = drawFrames[Math.min(Math.max(index, 0), drawFrames.length - 1)];
  return (
    <Stage>
      {frame.bytes.map((value, byteIndex) => (
        <Bits
          key={byteIndex}
          label={`byte ${byteIndex}`}
          bits={bitRow(value, `s${index}-${byteIndex}`, (_, bit) =>
            byteIndex === frame.touched ? (bit === 1 ? 'target' : 'active') : bit === 1 ? 'done' : undefined,
          )}
        />
      ))}
      {frame.mask === null ? null : (
        <Bits
          label={frame.maskLabel}
          bits={bitRow(frame.mask, `sm${index}`, (_, bit) => (bit === 1 ? 'compare' : 'muted'))}
        />
      )}
      <Readout
        items={[
          { key: 'l', label: 'line', value: `x1 = ${X1} → x2 = ${X2}` },
          { key: 'w', label: 'writes so far', value: String(Math.max(0, index)) },
        ]}
      />
    </Stage>
  );
}

export const drawLine: AnimationSpec = fromFrames(
  {
    id: 'bm-draw-line',
    title: 'A line in a byte-packed screen',
    blurb: 'Two masks for the ragged ends, whole-byte stores for the middle.',
  },
  drawFrames,
  DrawFrameView,
);

export const bitManipulationAnimations: AnimationSpec[] = [
  maskOps,
  twosComplement,
  clearLowestBit,
  addWithoutPlus,
  drawLine,
];
