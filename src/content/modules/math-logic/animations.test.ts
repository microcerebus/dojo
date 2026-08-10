/**
 * Frame assertions for the mutilated-chessboard animation.
 *
 * The failure this guards against is narration drifting from the picture: a
 * caption that claims "30 light squares" while the board on screen visibly has
 * three dominoes sitting on it. Every number the frame states is derived from
 * the cells it renders, and these tests hold that line - including the last
 * one, which fails if anyone reintroduces a hand-written figure.
 */
import { describe, expect, it } from 'vitest';

import { BOARD, DOMINOES, LIGHT, DARK, REMOVED, boardFrames } from './animations';

const colourOf = (key: string) => {
  const [row, col] = key.split(',').map(Number);
  return (row + col) % 2 === 0 ? LIGHT : DARK;
};

describe('mutilated chessboard placements', () => {
  it('covers exactly one light and one dark square with every domino', () => {
    for (const domino of DOMINOES) {
      const colours = domino.cells.map(colourOf).sort();
      expect(colours, domino.cells.join(' + ')).toEqual([DARK, LIGHT].sort());
    }
  });

  it('places every domino on two adjacent squares', () => {
    for (const domino of DOMINOES) {
      const [[r1, c1], [r2, c2]] = domino.cells.map((cell) => cell.split(',').map(Number));
      expect(Math.abs(r1 - r2) + Math.abs(c1 - c2), domino.cells.join(' + ')).toBe(1);
    }
  });

  it('never places a domino on a removed corner', () => {
    const cut = new Set(['0,0', `${BOARD - 1},${BOARD - 1}`]);
    for (const domino of DOMINOES) {
      for (const cell of domino.cells) {
        expect(cut.has(cell), `${cell} is a removed corner`).toBe(false);
      }
    }
  });
});

describe('mutilated chessboard frames', () => {
  it('has a frame for every step', () => {
    expect(boardFrames.length).toBeGreaterThan(1);
  });

  it('accounts for all 64 squares in every frame', () => {
    for (const [index, frame] of boardFrames.entries()) {
      const { light, dark, coveredLight, coveredDark, removed } = frame.counts;
      expect(light + dark + coveredLight + coveredDark + removed, `frame ${index}`).toBe(
        BOARD * BOARD,
      );
    }
  });

  it('derives its counts from the cells it actually renders', () => {
    for (const [index, frame] of boardFrames.entries()) {
      const cells = frame.rows.flat();
      const removed = cells.filter((cell) => cell.label === REMOVED).length;
      const coveredLight = cells.filter(
        (cell) => cell.state === 'done' && cell.label === LIGHT,
      ).length;
      const coveredDark = cells.filter(
        (cell) => cell.state === 'done' && cell.label === DARK,
      ).length;
      const light = cells.filter((cell) => cell.state !== 'done' && cell.label === LIGHT).length;
      const dark = cells.filter((cell) => cell.state !== 'done' && cell.label === DARK).length;
      expect(frame.counts, `frame ${index}`).toMatchObject({
        light,
        dark,
        coveredLight,
        coveredDark,
        removed,
      });
    }
  });

  it('keeps covered light and dark equal, which is the whole argument', () => {
    for (const [index, frame] of boardFrames.entries()) {
      expect(frame.counts.coveredLight, `frame ${index}`).toBe(frame.counts.coveredDark);
      expect(frame.counts.dominoes, `frame ${index}`).toBe(frame.counts.coveredLight);
    }
  });

  it('leaves the cut board with unequal colours and the full board balanced', () => {
    for (const [index, frame] of boardFrames.entries()) {
      const { totalLight, totalDark, removed } = frame.counts;
      if (removed === 0) {
        expect(totalLight, `frame ${index}`).toBe(totalDark);
      } else {
        // Opposite corners share a colour, so cutting them unbalances the board.
        expect(totalLight, `frame ${index}`).toBe(totalDark - removed);
      }
    }
  });

  it('quotes only numbers that the frame can derive', () => {
    for (const [index, frame] of boardFrames.entries()) {
      const { light, dark, coveredLight, coveredDark, removed } = frame.counts;
      const derivable = new Set([
        BOARD,
        light,
        dark,
        coveredLight,
        coveredDark,
        removed,
        frame.counts.dominoes,
        frame.counts.totalLight,
        frame.counts.totalDark,
        frame.counts.playable,
        frame.counts.naiveDominoes,
      ]);
      const quoted = `${frame.caption} ${frame.detail}`.match(/\d+/g) ?? [];
      for (const number of quoted) {
        expect(
          derivable.has(Number(number)),
          `frame ${index} quotes ${number}, which is not derived from its board state`,
        ).toBe(true);
      }
    }
  });
});
