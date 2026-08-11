import { describe, expect, it } from 'vitest';
import { scrollLeftToReveal, scrollMore } from './scrollEdge';

describe('scrollMore', () => {
  it('reports nothing when the content fits', () => {
    expect(scrollMore(0, 320, 320)).toBe('none');
  });

  it('reports the right edge before any scrolling', () => {
    expect(scrollMore(0, 900, 358)).toBe('right');
  });

  it('reports both edges in the middle', () => {
    expect(scrollMore(200, 900, 358)).toBe('left right');
  });

  it('reports only the left edge at the end', () => {
    expect(scrollMore(542, 900, 358)).toBe('left');
  });

  it('tolerates the sub-pixel widths a fractional layout produces', () => {
    expect(scrollMore(0.4, 358.6, 358)).toBe('none');
  });
});

describe('scrollLeftToReveal', () => {
  const viewport = (scrollLeft: number, scrollWidth = 900) => ({
    scrollLeft,
    clientWidth: 358,
    scrollWidth,
  });
  /** Where `scroll-snap-align: center` would put this item. */
  const snapPoint = (offsetLeft: number, offsetWidth: number) =>
    offsetLeft + offsetWidth / 2 - 358 / 2;

  it('leaves an item that is already in view alone', () => {
    expect(scrollLeftToReveal(viewport(0), { offsetLeft: 120, offsetWidth: 100 })).toBe(0);
  });

  it('scrolls an item off the right edge onto its snap point', () => {
    expect(scrollLeftToReveal(viewport(0), { offsetLeft: 600, offsetWidth: 120 })).toBe(
      snapPoint(600, 120),
    );
  });

  it('scrolls back to an item off the left edge', () => {
    expect(scrollLeftToReveal(viewport(500), { offsetLeft: 300, offsetWidth: 100 })).toBe(
      snapPoint(300, 100),
    );
  });

  it('clamps to the start rather than centring an item near it', () => {
    expect(scrollLeftToReveal(viewport(500), { offsetLeft: 120, offsetWidth: 100 })).toBe(0);
  });

  it('moves an item that is visible but flush against the edge', () => {
    // Fully on screen, but with no peek after it: 255 + 138 = 393 > 358. This
    // is the second section of a three-section rail, and the case a
    // nearest-edge target used to hand to the snap engine to undo.
    expect(scrollLeftToReveal(viewport(0, 585), { offsetLeft: 255, offsetWidth: 138 })).toBe(
      snapPoint(255, 138),
    );
  });

  it('never asks for a negative offset', () => {
    expect(scrollLeftToReveal(viewport(30), { offsetLeft: 10, offsetWidth: 100 })).toBe(0);
  });

  it('never scrolls past the end of the content', () => {
    expect(scrollLeftToReveal(viewport(0, 585), { offsetLeft: 440, offsetWidth: 145 })).toBe(
      585 - 358,
    );
  });
});
