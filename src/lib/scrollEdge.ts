/**
 * Which side of a horizontal scroller still has content off-screen.
 *
 * The value is written to `data-more` and CSS turns it into the edge fade that
 * makes a horizontal strip legible on a phone: without it, a row that scrolls
 * looks identical to a row that is simply clipped, and the reader has no reason
 * to try swiping it.
 */
export type ScrollMore = 'none' | 'left' | 'right' | 'left right';

/** Sub-pixel layout means the ends never land exactly on 0 / scrollWidth. */
const EPSILON = 1;

export function scrollMore(
  scrollLeft: number,
  scrollWidth: number,
  clientWidth: number,
): ScrollMore {
  const left = scrollLeft > EPSILON;
  const right = scrollLeft + clientWidth < scrollWidth - EPSILON;
  if (left && right) return 'left right';
  if (left) return 'left';
  if (right) return 'right';
  return 'none';
}

/**
 * How far to scroll so `item` sits fully inside `viewport`, keeping the nearest
 * edge rule people expect from a tab strip: an item already in view does not
 * move, and one that is off-screen comes in with a little of its neighbour
 * showing so the strip still reads as scrollable.
 */
export function scrollLeftToReveal(
  viewport: { scrollLeft: number; clientWidth: number },
  item: { offsetLeft: number; offsetWidth: number },
  peek = 24,
): number {
  const start = item.offsetLeft - peek;
  const end = item.offsetLeft + item.offsetWidth + peek - viewport.clientWidth;
  if (viewport.scrollLeft > start) return Math.max(0, start);
  if (viewport.scrollLeft < end) return end;
  return viewport.scrollLeft;
}
