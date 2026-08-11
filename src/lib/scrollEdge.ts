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
 * How far to scroll so `item` sits fully inside `viewport`.
 *
 * An item already comfortably in view - fully visible with `peek` of its
 * neighbour still showing on the side it is nearest, so the strip keeps reading
 * as scrollable - does not move at all. Anything else is centred.
 *
 * Centring rather than bringing the item just past the edge is what makes this
 * agree with the strip's `scroll-snap-align: center`. Scrolling to a position
 * that is not a snap point is not a smaller correction, it is no correction:
 * the snap engine pulls straight back to the nearest snapped offset, which is
 * how selecting the second section used to leave its own pill hanging off the
 * end of the rail.
 */
export function scrollLeftToReveal(
  viewport: { scrollLeft: number; clientWidth: number; scrollWidth: number },
  item: { offsetLeft: number; offsetWidth: number },
  peek = 24,
): number {
  const atLeast = item.offsetLeft + item.offsetWidth + peek - viewport.clientWidth;
  const atMost = item.offsetLeft - peek;
  if (viewport.scrollLeft >= atLeast && viewport.scrollLeft <= atMost) return viewport.scrollLeft;
  const centred = item.offsetLeft + item.offsetWidth / 2 - viewport.clientWidth / 2;
  return Math.max(0, Math.min(centred, viewport.scrollWidth - viewport.clientWidth));
}
