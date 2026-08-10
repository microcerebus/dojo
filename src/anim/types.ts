import type { FC } from 'react';

/**
 * An animation is a fixed sequence of frames plus a renderer for one frame.
 *
 * Frames are computed once when the module loads, so stepping is just an index
 * change - no per-frame simulation work, which keeps it smooth on a phone.
 * The index-driven shape (rather than a generic `Animation<Frame>`) is what
 * lets the registry stay a plain, fully-typed record.
 */
export interface AnimationSpec {
  id: string;
  title: string;
  /** One line: what this animation is showing you. */
  blurb: string;
  /** Number of steps. */
  length: number;
  /** What happens at this step. */
  caption: (index: number) => string;
  /** Optional second line: the invariant, the cost so far, the "why". */
  detail?: (index: number) => string | null;
  Frame: FC<{ index: number }>;
}

/** Helper for building a spec from a precomputed frame array. */
export function fromFrames<F extends { caption: string; detail?: string }>(
  meta: { id: string; title: string; blurb: string },
  frames: F[],
  Frame: FC<{ index: number }>,
): AnimationSpec {
  return {
    ...meta,
    length: frames.length,
    caption: (index) => frames[Math.max(0, Math.min(index, frames.length - 1))].caption,
    detail: (index) =>
      frames[Math.max(0, Math.min(index, frames.length - 1))].detail ?? null,
    Frame,
  };
}
