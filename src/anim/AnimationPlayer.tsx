import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { AnimationSpec } from './types';
import { initialStepState, stepReducer, type StepAction } from './stepper';
import './animation.css';

const TICK_MS = 1200;
/** Horizontal travel (px) that counts as a deliberate swipe rather than a tap. */
const SWIPE_THRESHOLD = 40;

export function AnimationPlayer({ spec }: { spec: AnimationSpec }) {
  const [state, rawDispatch] = useReducer(
    (current: Parameters<typeof stepReducer>[0], action: StepAction) =>
      stepReducer(current, action, spec.length),
    undefined,
    initialStepState,
  );
  const dispatch = rawDispatch as (action: StepAction) => void;
  const stageRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!state.playing) return;
    const id = window.setInterval(() => dispatch({ type: 'tick' }), TICK_MS);
    return () => window.clearInterval(id);
  }, [state.playing, dispatch]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        dispatch({ type: 'next' });
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        dispatch({ type: 'prev' });
      } else if (event.key === 'Home') {
        event.preventDefault();
        dispatch({ type: 'reset' });
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        dispatch({ type: 'togglePlay' });
      }
    },
    [dispatch],
  );

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    // Ignore mostly-vertical gestures so page scrolling still feels normal.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    dispatch({ type: dx < 0 ? 'next' : 'prev' });
  };

  const atStart = state.index === 0;
  const atEnd = state.index >= spec.length - 1;
  const detail = spec.detail?.(state.index) ?? null;
  const { Frame } = spec;

  return (
    <figure className="anim" aria-labelledby={`${spec.id}-title`}>
      <div className="anim__head">
        <h4 className="anim__title" id={`${spec.id}-title`}>
          {spec.title}
        </h4>
        <p className="anim__blurb">{spec.blurb}</p>
      </div>

      <div
        className="anim__stage"
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-label={`${spec.title}. Step ${state.index + 1} of ${spec.length}. Use arrow keys or swipe to step.`}
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Frame index={state.index} />
      </div>

      <div className="anim__caption" aria-live="polite">
        <p className="anim__captionText">{spec.caption(state.index)}</p>
        {detail ? <p className="anim__detail">{detail}</p> : null}
      </div>

      <div className="anim__controls">
        <button
          type="button"
          className="anim__btn"
          onClick={() => dispatch({ type: 'reset' })}
          disabled={atStart && !state.playing}
          aria-label="Back to first step"
        >
          <span aria-hidden="true">↺</span>
        </button>
        <button
          type="button"
          className="anim__btn"
          onClick={() => dispatch({ type: 'prev' })}
          disabled={atStart}
          aria-label="Previous step"
        >
          {/* Arrows for stepping, a triangle only for play - otherwise the
              next and play buttons are two identical glyphs side by side. */}
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          className="anim__btn anim__btn--play"
          onClick={() => dispatch({ type: 'togglePlay' })}
          aria-label={state.playing ? 'Pause' : 'Play'}
        >
          <span aria-hidden="true">{state.playing ? '❙❙' : '▶'}</span>
        </button>
        <button
          type="button"
          className="anim__btn"
          onClick={() => dispatch({ type: 'next' })}
          disabled={atEnd}
          aria-label="Next step"
        >
          <span aria-hidden="true">→</span>
        </button>
        <span className="anim__count" aria-hidden="true">
          {state.index + 1}/{spec.length}
        </span>
      </div>

      <ol className="anim__ticks">
        {Array.from({ length: spec.length }, (_, i) => (
          <li key={i}>
            <button
              type="button"
              className={`anim__tick${i === state.index ? ' is-current' : ''}${
                i < state.index ? ' is-past' : ''
              }`}
              onClick={() => dispatch({ type: 'goto', index: i })}
              aria-current={i === state.index ? 'step' : undefined}
            >
              <span className="visually-hidden">Step {i + 1}</span>
            </button>
          </li>
        ))}
      </ol>
    </figure>
  );
}
