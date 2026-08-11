import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
import { scrollMore, type ScrollMore } from '../lib/scrollEdge';

/**
 * The app's single horizontal-scroll pattern.
 *
 * Every row that is wider than a phone - tab strips, the lesson section rail,
 * code blocks, wide tables - goes through this. It owns the three things that
 * make sideways movement acceptable on a 390px screen: momentum scrolling that
 * does not rubber-band the page behind it, a hidden scrollbar (iOS never shows
 * one anyway, so reserving space for it just misaligns desktop), and an edge
 * fade that only appears on the side that actually has more content.
 *
 * The fade lives on the non-scrolling wrapper rather than on the scroller, so a
 * bordered container keeps a crisp border while its contents fade underneath.
 */
export function ScrollX({
  children,
  className,
  viewportClassName,
  label,
  viewportRef,
}: {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
  /** Set when the strip is a scrollable region in its own right (wide tables). */
  label?: string;
  viewportRef?: Ref<HTMLDivElement>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState<ScrollMore>('none');
  useImperativeHandle(viewportRef, () => ref.current as HTMLDivElement);

  const measure = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    setMore(scrollMore(element.scrollLeft, element.scrollWidth, element.clientWidth));
  }, []);

  // Content and viewport both change without a scroll event - a tab switch
  // swaps the rows, a rotation changes the width - so the observer is what
  // keeps the fade honest. jsdom has no ResizeObserver; the guard keeps the
  // component renderable in tests.
  useEffect(() => {
    measure();
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of Array.from(element.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [measure, children]);

  return (
    <div className={`scrollx${className ? ` ${className}` : ''}`} data-more={more}>
      <div
        ref={ref}
        className={`scrollx__viewport${viewportClassName ? ` ${viewportClassName}` : ''}`}
        onScroll={measure}
        {...(label ? { role: 'region', 'aria-label': label, tabIndex: 0 } : {})}
      >
        {children}
      </div>
    </div>
  );
}
