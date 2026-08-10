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
}

export type AudioEvent =
  | { type: 'press' } // the one and only user-initiated toggle
  | { type: 'playing' } // the element started producing sound
  | { type: 'waiting' }
  | { type: 'timeupdate'; position: number }
  | { type: 'loadedmetadata'; duration: number }
  | { type: 'ended' }
  | { type: 'error' }
  | { type: 'reset' };

export const initialAudioState = (): AudioState => ({
  status: 'idle',
  position: 0,
  duration: 0,
});

/** What the component should ask the <audio> element to do after a transition. */
export type AudioCommand = 'play' | 'pause' | 'replay' | null;

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
      return state.status === 'loading' || state.status === 'playing' || state.status === 'paused'
        ? { state: { ...state, status: 'playing' }, command: null }
        : { state, command: null };

    case 'waiting':
      return state.status === 'playing'
        ? { state: { ...state, status: 'loading' }, command: null }
        : { state, command: null };

    case 'timeupdate':
      return { state: { ...state, position: event.position }, command: null };

    case 'loadedmetadata':
      return {
        state: {
          ...state,
          duration: Number.isFinite(event.duration) ? event.duration : 0,
        },
        command: null,
      };

    case 'ended':
      return { state: { ...state, status: 'ended', position: state.duration }, command: null };

    case 'error':
      return { state: { ...state, status: 'error' }, command: null };

    case 'reset':
      return { state: initialAudioState(), command: 'pause' };

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
