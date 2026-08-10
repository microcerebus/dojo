import { Bits, Legend, Readout, Stage, type CellState } from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/**
 * Everything here is drawn in an 8-bit lane, because 32 columns of bits do not
 * fit on a phone. JavaScript's operators are 32-bit, so every 8-bit result is
 * computed through the helpers below rather than written out by hand - and
 * where the 8-bit answer differs from what JavaScript itself would print
 * (`-1 >>> 1`), both numbers are shown. `animations.test.ts` pins these.
 */
const WIDTH = 8;
const BYTE = 0xff;

/** The unsigned 8-bit lane value. */
export const toByte = (value: number): number => value & BYTE;

/** The signed value of an 8-bit lane, i.e. what two's complement means here. */
export const asSigned = (value: number): number => (toByte(value) << 24) >> 24;

/** Arithmetic right shift inside the 8-bit lane: the sign bit is copied in. */
export const arithmeticShiftRight = (value: number, by: number): number =>
  toByte(asSigned(value) >> by);

/** Logical right shift inside the 8-bit lane: zeros are shifted in. */
export const logicalShiftRight = (value: number, by: number): number =>
  toByte(toByte(value) >>> by);

export const binary = (value: number): string =>
  toByte(value).toString(2).padStart(WIDTH, '0');

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
    const bit = ((toByte(value) >> i) & 1) as 0 | 1;
    const state = stateAt?.(i, bit);
    bits.push({ key: `${keyPrefix}-${i}`, value: bit, ...(state ? { state } : {}) });
  }
  return bits;
}

/* ------------------------------------------------------------------------ */
/* 1. The four mask operations, on one byte and one bit position.            */
/* ------------------------------------------------------------------------ */

const I = 3;

export interface MaskFrame {
  before: number;
  mask: number | null;
  maskLabel: string;
  after: number | null;
  expr: string;
  caption: string;
  detail: string;
}

export const maskFrames: MaskFrame[] = (() => {
  const start = 0b10110100;
  const bit = toByte(1 << I);
  const set = toByte(start | bit);
  const cleared = toByte(set & ~bit);
  const updated = toByte(cleared | (1 << I));
  const lowMask = toByte((1 << I) - 1);
  const highMask = toByte(-1 << (I + 1));
  const keepLow = toByte(updated & lowMask);
  const keepHigh = toByte(updated & highMask);
  return [
    {
      before: start,
      mask: null,
      maskLabel: '',
      after: null,
      expr: `n = 0b${binary(start)}, i = ${I}`,
      caption: `One byte, and one bit position to work on: i = ${I}. All four standard operations are the same two moves - build a mask, then pick the operator that leaves every other bit alone.`,
      detail: 'an 8-bit lane · bit 0 is the least significant bit, on the right',
    },
    {
      before: start,
      mask: bit,
      maskLabel: '1 << i',
      after: null,
      expr: `1 << ${I}`,
      caption: `Build the mask: shift a single 1 left by i. Every other position in the mask is 0, and that is what makes the operators surgical.`,
      detail: `mask = ${binary(bit)} - a 1 exactly where you intend to act`,
    },
    {
      before: start,
      mask: bit,
      maskLabel: '1 << i',
      after: toByte(start & bit),
      expr: `(n & (1 << ${I})) !== 0`,
      caption: `Get: AND with the mask. Every other bit is ANDed with 0 and dies, so the result is non-zero exactly when bit i was set. Here it is ${toByte(start & bit) === 0 ? 'zero, so bit ' + I + ' is a 0' : 'non-zero, so bit ' + I + ' is a 1'}.`,
      detail: `n & mask = ${binary(start & bit)} → bit ${I} is ${(start >> I) & 1}`,
    },
    {
      before: start,
      mask: bit,
      maskLabel: '1 << i',
      after: set,
      expr: 'n | (1 << i)',
      caption:
        'Set: OR with the mask. ORing with 0 leaves a bit untouched, so only bit i can change - and it is forced to 1.',
      detail: `${binary(start)} | ${binary(bit)} = ${binary(set)} · every other bit is provably unchanged`,
    },
    {
      before: set,
      mask: toByte(~bit),
      maskLabel: '~(1 << i)',
      after: cleared,
      expr: 'n & ~(1 << i)',
      caption:
        'Clear: invert the mask first, so it is all 1s with a single 0. AND leaves every 1-position alone and forces position i to 0.',
      detail: `${binary(set)} & ${binary(~bit)} = ${binary(cleared)}`,
    },
    {
      before: cleared,
      mask: toByte(~bit),
      maskLabel: '~(1 << i)',
      after: updated,
      expr: '(n & ~(1 << i)) | (v << i)',
      caption:
        'Update to a value v: clear first, then OR in v shifted into place. Clearing first is what makes it work for v = 0 as well as v = 1 - "just OR it in" only ever sets.',
      detail: `v = 1 → ${binary(cleared)} | ${binary(1 << I)} = ${binary(updated)}`,
    },
    {
      before: updated,
      mask: lowMask,
      maskLabel: '(1 << i) - 1',
      after: keepLow,
      expr: 'n & ((1 << i) - 1)',
      caption: `Clearing a whole range is the same idea with a fatter mask. Subtracting 1 from a lone 1 bit turns it into ${I} ones, which keeps only the bits below i.`,
      detail: `${binary(updated)} & ${binary(lowMask)} = ${binary(keepLow)} · everything from bit ${I} upwards is gone`,
    },
    {
      before: updated,
      mask: highMask,
      maskLabel: '-1 << (i + 1)',
      after: keepHigh,
      expr: 'n & (-1 << (i + 1))',
      caption:
        'The mirror image: -1 is all 1s, so shifting it left by i+1 gives 1s on top and zeros below. That clears bits i through 0 and keeps the rest.',
      detail: `${binary(updated)} & ${binary(highMask)} = ${binary(keepHigh)}`,
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

export interface ComplementFrame {
  rows: { key: string; label: string; value: number; highlightSign?: boolean }[];
  caption: string;
  detail: string;
}

export const complementFrames: ComplementFrame[] = (() => {
  const five = 0b00000101;
  const inverted = toByte(~five);
  const negFive = toByte(inverted + 1);
  const sum = toByte(five + negFive);
  const minusOne = toByte(-1);
  const arith = arithmeticShiftRight(minusOne, 1);
  const logical = logicalShiftRight(minusOne, 1);
  return [
    {
      rows: [{ key: 'a', label: `+${five}`, value: five, highlightSign: true }],
      caption: `Eight bits holding +${five}. The top bit is the sign bit: 0 for non-negative. Nothing else about the representation is special yet.`,
      detail: `${binary(five)} = ${asSigned(five)} · sign bit ${(five >> (WIDTH - 1)) & 1}`,
    },
    {
      rows: [
        { key: 'a', label: `+${five}`, value: five },
        { key: 'b', label: `~${five}`, value: inverted, highlightSign: true },
      ],
      caption:
        "Step one of negation: invert every bit. On its own this is \"one's complement\", and it is off by one - notice the sign bit has flipped to 1.",
      detail: `~${binary(five)} = ${binary(inverted)}`,
    },
    {
      rows: [
        { key: 'a', label: `+${five}`, value: five },
        { key: 'b', label: `~${five}`, value: inverted },
        { key: 'c', label: String(asSigned(negFive)), value: negFive, highlightSign: true },
      ],
      caption:
        'Step two: add 1. That is the whole rule - invert, then add one - and it works in both directions, so applying it again gives the positive value back.',
      detail: `${binary(inverted)} + 1 = ${binary(negFive)} = ${asSigned(negFive)}`,
    },
    {
      rows: [
        { key: 'a', label: `+${five}`, value: five },
        { key: 'c', label: String(asSigned(negFive)), value: negFive },
        { key: 'd', label: 'sum', value: sum, highlightSign: true },
      ],
      caption: `The point of the representation: ${five} + (${asSigned(negFive)}) carries off the top of the byte and leaves all zeros. Subtraction is just addition, so the hardware needs one adder, not two.`,
      detail: `${binary(five)} + ${binary(negFive)} = 1 ${binary(sum)}, and the carry out is dropped`,
    },
    {
      rows: [
        { key: 'e', label: String(asSigned(minusOne)), value: minusOne, highlightSign: true },
        { key: 'f', label: 'lane >> 1', value: arith },
        { key: 'g', label: 'lane >>> 1', value: logical },
      ],
      caption: `-1 is all 1s, which is why the two right shifts diverge. Arithmetic >> copies the sign bit in, so -1 stays ${asSigned(arith)} forever. Logical >>> feeds in zeros, so in this 8-bit lane it becomes ${logical}, and it marches to 0 if you keep going.`,
      detail: `careful: JavaScript shifts 32-bit values, so the real -1 >>> 1 is ${(-1 >>> 1).toLocaleString('en-US')}, not ${logical} - the lane here is 8 bits wide to fit on screen`,
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

export interface ClearFrame {
  /** The value going in to this step; the one the equation is about. */
  before: number;
  /** The value after the step, or null on the intro/summary frames. */
  after: number | null;
  /** The bit this step removes, or null when nothing is being removed. */
  lowest: number | null;
  count: number;
  caption: string;
  detail: string;
}

export const clearFrames: ClearFrame[] = (() => {
  const frames: ClearFrame[] = [];
  const start = 0b10110100;
  const popcount = binary(start).split('').filter((bit) => bit === '1').length;
  let n = start;
  let count = 0;
  frames.push({
    before: n,
    after: null,
    lowest: null,
    count,
    caption:
      'The single most useful bit trick: n & (n−1) removes the lowest set bit and nothing else. Watch what subtracting 1 does first.',
    detail: `n = ${binary(n)} · ${popcount} bits are set`,
  });
  while (n !== 0) {
    // Capture everything this frame talks about before the value moves on.
    const before = n;
    const lowest = toByte(before & -before);
    const after = toByte(before & (before - 1));
    count++;
    frames.push({
      before,
      after,
      lowest,
      count,
      caption: `Subtracting 1 flips the lowest 1 to a 0 and turns every 0 below it into a 1, so n and n−1 share every bit above it and none at or below. ANDing them wipes out ${binary(lowest)}.`,
      detail: `${binary(before)} & ${binary(before - 1)} = ${binary(after)} · ${count} set bits removed so far`,
    });
    n = after;
  }
  frames.push({
    before: 0,
    after: null,
    lowest: null,
    count,
    caption: `Zero after ${count} steps, so n had ${count} set bits - that is popcount in O(set bits), not O(width). And "n & (n−1) === 0" means there was at most one set bit, which is the power-of-two test.`,
    detail: 'one expression, three questions answered: clear, count, and is-it-a-power-of-two',
  });
  return frames;
})();

function ClearFrameView({ index }: { index: number }) {
  const frame = clearFrames[Math.min(Math.max(index, 0), clearFrames.length - 1)];
  return (
    <Stage>
      <Bits
        label="n"
        showIndices
        bits={bitRow(frame.before, `c${index}`, (bitIndex, bit) =>
          frame.lowest !== null && 1 << bitIndex === frame.lowest
            ? 'active'
            : bit === 1
              ? 'done'
              : undefined,
        )}
      />
      {frame.lowest === null ? null : (
        <Bits
          label="n − 1"
          bits={bitRow(frame.before - 1, `d${index}`, (bitIndex) =>
            1 << bitIndex <= (frame.lowest ?? 0) ? 'bad' : undefined,
          )}
        />
      )}
      {frame.after === null ? null : (
        <Bits
          label="n & (n−1)"
          bits={bitRow(frame.after, `e${index}`, (_, bit) => (bit === 1 ? 'target' : undefined))}
        />
      )}
      <Readout
        items={[
          { key: 'v', label: 'value', value: String(frame.after ?? frame.before) },
          { key: 'k', label: 'bits cleared', value: String(frame.count) },
        ]}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'lowest set bit, about to go' },
          { key: 'b', state: 'bad', label: 'the borrow region in n − 1' },
          { key: 't', state: 'target', label: 'what is left' },
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

export interface AddFrame {
  a: number;
  b: number;
  sum: number | null;
  carry: number | null;
  round: number;
  caption: string;
  detail: string;
}

export const addFrames: AddFrame[] = (() => {
  const frames: AddFrame[] = [];
  const startA = 0b00001011;
  const startB = 0b00000110;
  let a = startA;
  let b = startB;
  frames.push({
    a,
    b,
    sum: null,
    carry: null,
    round: 0,
    caption: `Add ${startA} and ${startB} without the + operator. Do a column of binary addition by hand and you get two separate answers: the digit you write down, and the digit you carry.`,
    detail: `a = ${binary(startA)} (${startA}) · b = ${binary(startB)} (${startB})`,
  });
  let round = 0;
  while (b !== 0) {
    round++;
    const sum = toByte(a ^ b);
    const carry = toByte((a & b) << 1);
    frames.push({
      a,
      b,
      sum,
      carry,
      round,
      caption: `Round ${round}: XOR is addition with the carry thrown away, and AND finds every column that produced a carry - shifted left one place, because a carry lands in the next column.`,
      detail: `${binary(a)} ^ ${binary(b)} = ${binary(sum)} · (${binary(a)} & ${binary(b)}) << 1 = ${binary(carry)}`,
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

export interface DrawFrame {
  bytes: number[];
  touched: number | null;
  mask: number | null;
  maskLabel: string;
  /** Byte writes performed up to and including this frame. */
  writes: number;
  caption: string;
  detail: string;
}

const SCREEN_BYTES = 4;
const X1 = 5;
const X2 = 26;
const PIXELS = X2 - X1 + 1;

export const drawFrames: DrawFrame[] = (() => {
  const bytes = new Array<number>(SCREEN_BYTES).fill(0);
  let writes = 0;
  const frames: DrawFrame[] = [
    {
      bytes: [...bytes],
      touched: null,
      mask: null,
      maskLabel: '',
      writes,
      caption: `A monochrome row of ${SCREEN_BYTES * WIDTH} pixels stored as ${SCREEN_BYTES} bytes - eight pixels per byte. Drawing a line from x = ${X1} to x = ${X2} one pixel at a time works, but it does ${PIXELS} read-modify-writes.`,
      detail: 'pixel x lives in byte x >> 3, at bit 7 − (x & 7)',
    },
  ];
  const startByte = X1 >> 3;
  const endByte = X2 >> 3;
  const startMask = toByte(BYTE >> (X1 & 7));
  const endMask = toByte(~(BYTE >> ((X2 & 7) + 1)));

  bytes[startByte] |= startMask;
  writes++;
  frames.push({
    bytes: [...bytes],
    touched: startByte,
    mask: startMask,
    maskLabel: '0xFF >> (x1 & 7)',
    writes,
    caption:
      'Handle the ragged start with one mask: all 1s shifted right by the offset inside the byte, so it turns on the pixels from x1 to the end of that byte and nothing before it.',
    detail: `byte ${startByte} · mask ${binary(startMask)} · ${writes} byte write${writes === 1 ? '' : 's'} so far`,
  });

  for (let b = startByte + 1; b < endByte; b++) {
    bytes[b] = BYTE;
    writes++;
    frames.push({
      bytes: [...bytes],
      touched: b,
      mask: BYTE,
      maskLabel: '0xFF',
      writes,
      caption:
        'Every byte fully inside the line is just a store of 0xFF - eight pixels for the price of one write. That is the whole optimisation.',
      detail: `byte ${b} = ${binary(BYTE)} · ${writes} byte writes so far`,
    });
  }

  bytes[endByte] |= endMask;
  writes++;
  frames.push({
    bytes: [...bytes],
    touched: endByte,
    mask: endMask,
    maskLabel: '~(0xFF >> ((x2 & 7) + 1))',
    writes,
    caption:
      'The ragged end is the mirror mask: 1s down to x2 and 0s after it. Note the +1, because x2 itself is inside the line - this off-by-one is where the bug usually is.',
    detail: `byte ${endByte} · mask ${binary(endMask)} · ${writes} byte writes so far`,
  });

  const litPixels = bytes.reduce(
    (total, value) => total + binary(value).split('').filter((bit) => bit === '1').length,
    0,
  );
  frames.push({
    bytes: [...bytes],
    touched: null,
    mask: null,
    maskLabel: '',
    writes,
    caption: `${writes} byte writes instead of ${PIXELS} pixel writes, for the same ${litPixels} lit pixels. The case that breaks naive code is x1 and x2 landing in the same byte: then there are no full bytes and you must AND the two masks together.`,
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
            byteIndex === frame.touched
              ? bit === 1
                ? 'target'
                : 'active'
              : bit === 1
                ? 'done'
                : undefined,
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
          { key: 'w', label: 'byte writes', value: String(frame.writes) },
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

/** Exported for the frame-assertion tests. */
export const DRAW_LINE_SPEC = { SCREEN_BYTES, X1, X2, WIDTH };

export const bitManipulationAnimations: AnimationSpec[] = [
  maskOps,
  twosComplement,
  clearLowestBit,
  addWithoutPlus,
  drawLine,
];
