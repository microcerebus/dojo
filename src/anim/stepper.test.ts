import { describe, expect, it } from 'vitest';
import { initialStepState, stepReducer, type StepState } from './stepper';

const LENGTH = 5;
const run = (state: StepState, ...actions: Parameters<typeof stepReducer>[1][]) =>
  actions.reduce((current, action) => stepReducer(current, action, LENGTH), state);

describe('animation stepper', () => {
  it('starts at the first frame, paused', () => {
    expect(initialStepState()).toEqual({ index: 0, playing: false });
  });

  it('steps forward and back', () => {
    let state = run(initialStepState(), { type: 'next' }, { type: 'next' });
    expect(state.index).toBe(2);
    state = run(state, { type: 'prev' });
    expect(state.index).toBe(1);
  });

  it('clamps at both ends', () => {
    const atStart = run(initialStepState(), { type: 'prev' }, { type: 'prev' });
    expect(atStart.index).toBe(0);

    const atEnd = run(initialStepState(), ...Array(20).fill({ type: 'next' as const }));
    expect(atEnd.index).toBe(LENGTH - 1);
  });

  it('resets to the first frame and stops playing', () => {
    const state = run(initialStepState(), { type: 'next' }, { type: 'play' }, { type: 'reset' });
    expect(state).toEqual({ index: 0, playing: false });
  });

  it('jumps to a specific frame, clamped', () => {
    expect(run(initialStepState(), { type: 'goto', index: 3 }).index).toBe(3);
    expect(run(initialStepState(), { type: 'goto', index: 99 }).index).toBe(LENGTH - 1);
    expect(run(initialStepState(), { type: 'goto', index: -3 }).index).toBe(0);
  });

  it('stops autoplay when the user steps back', () => {
    const state = run(initialStepState(), { type: 'next' }, { type: 'play' }, { type: 'prev' });
    expect(state.playing).toBe(false);
    expect(state.index).toBe(0);
  });

  it('toggles play and pause', () => {
    let state = run(initialStepState(), { type: 'togglePlay' });
    expect(state.playing).toBe(true);
    state = run(state, { type: 'togglePlay' });
    expect(state.playing).toBe(false);
  });

  it('restarts from the beginning when play is pressed on the last frame', () => {
    const state = run(initialStepState(), { type: 'goto', index: LENGTH - 1 }, { type: 'play' });
    expect(state).toEqual({ index: 0, playing: true });
  });

  it('advances on tick and stops itself at the end', () => {
    let state = run(initialStepState(), { type: 'play' });
    for (let i = 0; i < LENGTH - 1; i++) state = run(state, { type: 'tick' });
    expect(state.index).toBe(LENGTH - 1);
    expect(state.playing).toBe(false);

    // Further ticks do nothing once stopped.
    expect(run(state, { type: 'tick' })).toBe(state);
  });

  it('ignores ticks while paused', () => {
    const paused = initialStepState();
    expect(run(paused, { type: 'tick' })).toBe(paused);
  });

  it('handles a single-frame animation without looping forever', () => {
    const single = stepReducer({ index: 0, playing: true }, { type: 'tick' }, 1);
    expect(single).toEqual({ index: 0, playing: false });
  });
});
