/**
 * Stepping logic for the animation player, kept pure so the behaviour is
 * testable without rendering anything.
 */

export interface StepState {
  index: number;
  playing: boolean;
}

export type StepAction =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'reset' }
  | { type: 'goto'; index: number }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'togglePlay' }
  /** autoplay heartbeat; stops itself on the last frame */
  | { type: 'tick' };

const clamp = (index: number, length: number) =>
  Math.max(0, Math.min(index, Math.max(0, length - 1)));

export const initialStepState = (): StepState => ({ index: 0, playing: false });

export function stepReducer(state: StepState, action: StepAction, length: number): StepState {
  switch (action.type) {
    case 'next': {
      const index = clamp(state.index + 1, length);
      return index === state.index ? state : { ...state, index };
    }
    case 'prev': {
      const index = clamp(state.index - 1, length);
      // Stepping backwards is an explicit "let me look again" - stop autoplay.
      return index === state.index && !state.playing ? state : { index, playing: false };
    }
    case 'reset':
      return state.index === 0 && !state.playing ? state : { index: 0, playing: false };
    case 'goto': {
      const index = clamp(action.index, length);
      return index === state.index && !state.playing ? state : { index, playing: false };
    }
    case 'play':
      // Pressing play on the last frame restarts from the beginning.
      return { index: state.index >= length - 1 ? 0 : state.index, playing: true };
    case 'pause':
      return state.playing ? { ...state, playing: false } : state;
    case 'togglePlay':
      return stepReducer(state, { type: state.playing ? 'pause' : 'play' }, length);
    case 'tick': {
      if (!state.playing) return state;
      const index = clamp(state.index + 1, length);
      if (index === state.index) return { ...state, playing: false };
      return { index, playing: index < length - 1 };
    }
    default:
      return state;
  }
}
