/**
 * Frame assertions: an animation teaches by asserting arithmetic, so the
 * arithmetic has to be checked rather than trusted. Every test here recomputes
 * the claim independently of the code that renders it, so a caption can no
 * longer drift away from the frame it describes.
 */
import { describe, expect, it } from 'vitest';

import {
  DRAW_LINE_SPEC,
  addFrames,
  arithmeticShiftRight,
  asSigned,
  binary,
  clearFrames,
  complementFrames,
  drawFrames,
  logicalShiftRight,
  maskFrames,
  toByte,
} from './animations';

const popcount = (value: number) =>
  binary(value)
    .split('')
    .filter((bit) => bit === '1').length;

describe('8-bit lane helpers', () => {
  it('reads the sign bit the way two\'s complement does', () => {
    expect(asSigned(0b00000101)).toBe(5);
    expect(asSigned(0b11111011)).toBe(-5);
    expect(asSigned(0xff)).toBe(-1);
    expect(asSigned(0b10000000)).toBe(-128);
  });

  it('keeps the two right shifts distinct inside the lane', () => {
    // -1 stays -1 under an arithmetic shift, and becomes 0b01111111 under a
    // logical one. This is exactly the pair the animation contrasts.
    expect(arithmeticShiftRight(0xff, 1)).toBe(0xff);
    expect(logicalShiftRight(0xff, 1)).toBe(0b01111111);
  });

  it('never lets a lane value escape 8 bits', () => {
    const values: (number | null)[] = [
      ...maskFrames.flatMap((frame) => [frame.before, frame.after, frame.mask]),
      ...clearFrames.flatMap((frame) => [frame.before, frame.after, frame.lowest]),
      ...addFrames.flatMap((frame) => [frame.a, frame.b, frame.sum, frame.carry]),
      ...drawFrames.flatMap((frame) => [...frame.bytes, frame.mask]),
      ...complementFrames.flatMap((frame) => frame.rows.map((row) => row.value)),
    ];
    for (const value of values) {
      if (value === null) continue;
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(0xff);
    }
  });
});

describe('bm-mask-ops', () => {
  it('shows a result that the stated expression actually produces', () => {
    const expected: (number | null)[] = maskFrames.map((frame) => {
      const bit = 1 << 3;
      switch (frame.expr) {
        case '(n & (1 << 3)) !== 0':
          return toByte(frame.before & bit);
        case 'n | (1 << i)':
          return toByte(frame.before | bit);
        case 'n & ~(1 << i)':
          return toByte(frame.before & ~bit);
        case '(n & ~(1 << i)) | (v << i)':
          return toByte((frame.before & ~bit) | bit);
        case 'n & ((1 << i) - 1)':
          return toByte(frame.before & ((1 << 3) - 1));
        case 'n & (-1 << (i + 1))':
          return toByte(frame.before & (-1 << 4));
        default:
          return null;
      }
    });
    expect(maskFrames.map((frame) => frame.after)).toEqual(expected);
  });

  it('changes at most bit i on the single-bit operations', () => {
    const singleBit = new Set(['n | (1 << i)', 'n & ~(1 << i)', '(n & ~(1 << i)) | (v << i)']);
    for (const frame of maskFrames) {
      if (!singleBit.has(frame.expr) || frame.after === null) continue;
      const changed = frame.before ^ frame.after;
      expect(changed & ~(1 << 3), frame.expr).toBe(0);
    }
  });

  it('prints every binary literal in a detail line as an 8-bit string', () => {
    for (const frame of maskFrames) {
      for (const literal of frame.detail.match(/\b[01]{2,}\b/g) ?? []) {
        expect(literal.length, `${frame.expr}: ${literal}`).toBe(8);
      }
    }
  });
});

describe('bm-twos-complement', () => {
  it('negates by invert-then-add-one, and the pair sums to zero in the lane', () => {
    const five = complementFrames[0].rows[0].value;
    const negated = toByte(toByte(~five) + 1);
    expect(asSigned(negated)).toBe(-asSigned(five));
    expect(toByte(five + negated)).toBe(0);
  });

  it('renders the sum frame as all zeros', () => {
    const sumRow = complementFrames[3].rows.find((row) => row.label === 'sum');
    expect(sumRow?.value).toBe(0);
  });

  it('is honest that the lane is 8 bits and JavaScript is 32', () => {
    const shiftFrame = complementFrames[complementFrames.length - 1];
    const lane = shiftFrame.rows.find((row) => row.label === 'lane >>> 1');
    expect(lane?.value).toBe(logicalShiftRight(0xff, 1));
    // The caption may quote the lane result, but the detail must name the real
    // JavaScript answer so the frame cannot be read as a claim about JS.
    expect(shiftFrame.detail).toContain((-1 >>> 1).toLocaleString('en-US'));
    expect(shiftFrame.detail).toContain('8 bits');
  });
});

describe('bm-clear-lowest-bit', () => {
  it('removes exactly one set bit per step', () => {
    for (const frame of clearFrames) {
      if (frame.after === null || frame.lowest === null) continue;
      expect(popcount(frame.after)).toBe(popcount(frame.before) - 1);
      expect(frame.before & frame.lowest).toBe(frame.lowest);
      expect(frame.after & frame.lowest).toBe(0);
    }
  });

  it('states the equation about the value the frame renders, not the next one', () => {
    for (const frame of clearFrames) {
      if (frame.after === null) continue;
      expect(frame.detail).toContain(
        `${binary(frame.before)} & ${binary(frame.before - 1)} = ${binary(frame.after)}`,
      );
      // The highlighted bit and the bit named in the caption are the same bit.
      expect(frame.caption).toContain(binary(frame.lowest as number));
    }
  });

  it('ends after exactly popcount steps', () => {
    const start = clearFrames[0].before;
    const last = clearFrames[clearFrames.length - 1];
    expect(last.count).toBe(popcount(start));
    expect(last.before).toBe(0);
    expect(last.caption).toContain(`${popcount(start)} set bits`);
  });
});

describe('bm-add-without-plus', () => {
  it('preserves a + b across every round', () => {
    const total = addFrames[0].a + addFrames[0].b;
    for (const frame of addFrames) {
      expect(frame.a + frame.b, `round ${frame.round}`).toBe(total);
    }
  });

  it('reaches the true sum with a zero carry', () => {
    const first = addFrames[0];
    const last = addFrames[addFrames.length - 1];
    expect(last.b).toBe(0);
    expect(last.a).toBe(first.a + first.b);
    expect(last.detail).toContain(String(first.a + first.b));
  });

  it('uses XOR for the sum and shifted AND for the carry', () => {
    for (const frame of addFrames) {
      if (frame.sum === null || frame.carry === null) continue;
      expect(frame.sum).toBe(toByte(frame.a ^ frame.b));
      expect(frame.carry).toBe(toByte((frame.a & frame.b) << 1));
    }
  });
});

describe('bm-draw-line', () => {
  const { SCREEN_BYTES, X1, X2, WIDTH } = DRAW_LINE_SPEC;

  it('lights exactly the pixels from x1 to x2 and nothing else', () => {
    const final = drawFrames[drawFrames.length - 1].bytes;
    const lit: number[] = [];
    for (let x = 0; x < SCREEN_BYTES * WIDTH; x++) {
      if ((final[x >> 3] >> (7 - (x & 7))) & 1) lit.push(x);
    }
    expect(lit).toEqual(Array.from({ length: X2 - X1 + 1 }, (_, i) => X1 + i));
  });

  it('counts the byte writes it actually performed', () => {
    const writeFrames = drawFrames.filter((frame) => frame.touched !== null);
    const last = drawFrames[drawFrames.length - 1];
    expect(last.writes).toBe(writeFrames.length);
    // The summary must quote that same number - this is the count that was
    // previously hand-written, and wrong.
    expect(last.caption).toContain(`${last.writes} byte writes`);
    expect(last.caption).not.toContain('Three writes');
  });

  it('reports the pixel-by-pixel cost it is being compared against', () => {
    expect(drawFrames[0].caption).toContain(`${X2 - X1 + 1} read-modify-writes`);
  });

  it('never writes the same byte twice', () => {
    const touched = drawFrames.map((frame) => frame.touched).filter((b) => b !== null);
    expect(new Set(touched).size).toBe(touched.length);
  });
});
