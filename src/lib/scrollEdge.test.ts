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
  const viewport = (scrollLeft: number) => ({ scrollLeft, clientWidth: 358 });

  it('leaves an item that is already in view alone', () => {
    expect(scrollLeftToReveal(viewport(0), { offsetLeft: 120, offsetWidth: 100 })).toBe(0);
  });

  it('scrolls forward far enough to show the whole item plus a peek', () => {
    expect(scrollLeftToReveal(viewport(0), { offsetLeft: 600, offsetWidth: 120 })).toBe(
      600 + 120 + 24 - 358,
    );
  });

  it('scrolls back to the item with a peek in front of it', () => {
    expect(scrollLeftToReveal(viewport(500), { offsetLeft: 120, offsetWidth: 100 })).toBe(96);
  });

  it('never asks for a negative offset', () => {
    expect(scrollLeftToReveal(viewport(30), { offsetLeft: 10, offsetWidth: 100 })).toBe(0);
  });
});
