/**
 * The audio-bite player's state machine, kept pure and separate from React.
 *
 * The important rule it encodes: playback only ever starts from an explicit
 * user tap. iOS Safari refuses programmatic `play()` outside a user gesture,
 * so a player that pretends to autoplay would show a lie. `idle` is therefore
 * the only entry point into `playing`, and it takes a `press` to get there.
 */

export type AudioStatus =
  | 'idle' // never played, or reset
  | 'loading' // play requested, waiting for enough data
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error'; // the file is missing or the browser refused

export interface AudioState {
  status: AudioStatus;
  /** seconds */
  position: number;
  duration: number;
  /** playback rate, e.g. 1, 1.25, 1.5, 2 */
  rate: number;
}

export type AudioEvent =
  | { type: 'press' } // the one and only user-initiated toggle
  | { type: 'playing' } // the element started producing sound
  | { type: 'waiting' }
  | { type: 'timeupdate'; position: number }
  | { type: 'loadedmetadata'; duration: number }
  | { type: 'ended' }
  | { type: 'error' }
  | { type: 'reset' }
  | { type: 'skip'; delta: number } // seconds, positive or negative
  | { type: 'setRate'; rate: number };

export const initialAudioState = (rate = 1): AudioState => ({
  status: 'idle',
  position: 0,
  duration: 0,
  rate,
});

/** What the component should ask the <audio> element to do after a transition. */
export type AudioCommand =
  | 'play'
  | 'pause'
  | 'replay'
  | { type: 'seek'; position: number }
  | { type: 'rate'; rate: number }
  | null;

export function audioReducer(
  state: AudioState,
  event: AudioEvent,
): { state: AudioState; command: AudioCommand } {
  switch (event.type) {
    case 'press':
      switch (state.status) {
        case 'idle':
        case 'paused':
          return { state: { ...state, status: 'loading' }, command: 'play' };
        case 'ended':
          return { state: { ...state, status: 'loading', position: 0 }, command: 'replay' };
        case 'loading':
        case 'playing':
          return { state: { ...state, status: 'paused' }, command: 'pause' };
        case 'error':
          // Let the user retry a failed load.
          return { state: { ...state, status: 'loading' }, command: 'play' };
        default:
          return { state, command: null };
      }

    case 'playing':
      // Only trust this if we asked for playback. An element event arriving
      // while we are idle must not move the UI into a playing state - that is
      // the invariant that keeps the player honest under iOS autoplay rules.
      if (state.status === 'loading' || state.status === 'playing') {
        return { state: { ...state, status: 'playing' }, command: null };
      }
      // Paused is the racy one: pausing while still loading leaves an in-flight
      // `play()` that can resolve afterwards and report that it started. The
      // user asked for pause, so hold the state and tell the element again
      // rather than flipping the UI back to playing behind their back.
      if (state.status === 'paused') {
        return { state, command: 'pause' };
      }
      return { state, command: null };

    case 'waiting':
      return state.status === 'playing'
        ? { state: { ...state, status: 'loading' }, command: null }
        : { state, command: null };

    case 'timeupdate':
      return { state: { ...state, position: event.position }, command: null };

    case 'loadedmetadata': {
      const duration = Number.isFinite(event.duration) ? event.duration : 0;
      // Defensive: a new source reporting metadata should never leave the
      // previous track's position stranded above its own duration - e.g. if
      // the component did not (or could not) reset state first.
      return {
        state: { ...state, duration, position: Math.min(state.position, duration) },
        command: null,
      };
    }

    case 'ended':
      return { state: { ...state, status: 'ended', position: state.duration }, command: null };

    case 'error':
      return { state: { ...state, status: 'error' }, command: null };

    case 'reset':
      return { state: initialAudioState(state.rate), command: 'pause' };

    case 'skip': {
      // Duration unknown yet: nothing to clamp against, so no-op rather than
      // guess. Position is otherwise clamped to the playable range regardless
      // of status - seeking while paused must not resume playback.
      if (state.duration <= 0) return { state, command: null };
      const position = Math.min(Math.max(state.position + event.delta, 0), state.duration);
      if (position === state.position) return { state, command: null };
      return { state: { ...state, position }, command: { type: 'seek', position } };
    }

    case 'setRate': {
      if (event.rate === state.rate) return { state, command: null };
      return { state: { ...state, rate: event.rate }, command: { type: 'rate', rate: event.rate } };
    }

    default:
      return { state, command: null };
  }
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, '0')}`;
}
