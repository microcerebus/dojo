import { describe, expect, it } from 'vitest';
import {
  audioReducer,
  formatTime,
  initialAudioState,
  type AudioEvent,
  type AudioState,
} from './audioMachine';

const send = (state: AudioState, event: AudioEvent) => audioReducer(state, event);
const stateAfter = (state: AudioState, ...events: AudioEvent[]) =>
  events.reduce((current, event) => send(current, event).state, state);

describe('audio player state machine', () => {
  it('starts idle with no position', () => {
    expect(initialAudioState()).toEqual({ status: 'idle', position: 0, duration: 0, rate: 1 });
  });

  it('accepts a starting rate', () => {
    expect(initialAudioState(2).rate).toBe(2);
  });

  it('only ever enters playback from a press', () => {
    // No element event can move it out of idle - which is what keeps the UI
    // honest under the iOS autoplay policy.
    const events: AudioEvent[] = [
      { type: 'playing' },
      { type: 'waiting' },
      { type: 'timeupdate', position: 5 },
      { type: 'loadedmetadata', duration: 60 },
    ];
    for (const event of events) {
      const next = send(initialAudioState(), event).state;
      expect(next.status).not.toBe('playing');
    }
    expect(send(initialAudioState(), { type: 'press' }).state.status).toBe('loading');
  });

  it('issues a play command on the first press', () => {
    const { state, command } = send(initialAudioState(), { type: 'press' });
    expect(command).toBe('play');
    expect(state.status).toBe('loading');
  });

  it('reaches playing when the element reports it', () => {
    const state = stateAfter(initialAudioState(), { type: 'press' }, { type: 'playing' });
    expect(state.status).toBe('playing');
  });

  it('pauses on a second press and resumes on a third', () => {
    const playing = stateAfter(initialAudioState(), { type: 'press' }, { type: 'playing' });

    const paused = send(playing, { type: 'press' });
    expect(paused.state.status).toBe('paused');
    expect(paused.command).toBe('pause');

    const resumed = send(paused.state, { type: 'press' });
    expect(resumed.state.status).toBe('loading');
    expect(resumed.command).toBe('play');
  });

  it('pausing mid-buffer works too', () => {
    const loading = send(initialAudioState(), { type: 'press' }).state;
    const paused = send(loading, { type: 'press' });
    expect(paused.state.status).toBe('paused');
    expect(paused.command).toBe('pause');
  });

  it('holds the pause when a delayed playing event lands after pausing mid-load', () => {
    // Tap to play, then tap again before the element has started. The first
    // `play()` is still in flight and can resolve afterwards.
    const loading = send(initialAudioState(), { type: 'press' }).state;
    const paused = send(loading, { type: 'press' });
    expect(paused.state.status).toBe('paused');

    const stray = send(paused.state, { type: 'playing' });
    // The UI must not flip back to playing behind the user's back...
    expect(stray.state.status).toBe('paused');
    // ...and the element is told again, since it evidently did start.
    expect(stray.command).toBe('pause');
  });

  it('keeps holding the pause if the element reports playing more than once', () => {
    const paused = send(send(initialAudioState(), { type: 'press' }).state, {
      type: 'press',
    }).state;
    const first = send(paused, { type: 'playing' });
    const second = send(first.state, { type: 'playing' });
    expect(second.state.status).toBe('paused');
    expect(second.command).toBe('pause');
  });

  it('still reaches playing normally when the pause never happened', () => {
    const loading = send(initialAudioState(), { type: 'press' }).state;
    const playing = send(loading, { type: 'playing' });
    expect(playing.state.status).toBe('playing');
    expect(playing.command).toBeNull();
  });

  it('goes back to loading when the stream stalls', () => {
    const playing = stateAfter(initialAudioState(), { type: 'press' }, { type: 'playing' });
    expect(send(playing, { type: 'waiting' }).state.status).toBe('loading');
  });

  it('tracks position and duration', () => {
    const state = stateAfter(
      initialAudioState(),
      { type: 'loadedmetadata', duration: 62.5 },
      { type: 'timeupdate', position: 12.25 },
    );
    expect(state.duration).toBe(62.5);
    expect(state.position).toBe(12.25);
  });

  it('ignores a non-finite duration', () => {
    const state = send(initialAudioState(), {
      type: 'loadedmetadata',
      duration: Number.POSITIVE_INFINITY,
    }).state;
    expect(state.duration).toBe(0);
  });

  it('clamps a stale position when metadata for a new, shorter track arrives', () => {
    // Simulates a track change that, for whatever reason, did not reset state
    // first: the old position must not survive past the new duration.
    const midway = stateAfter(initialAudioState(), {
      type: 'loadedmetadata',
      duration: 90,
    });
    const stale = { ...midway, position: 80 };
    const nextTrack = send(stale, { type: 'loadedmetadata', duration: 30 });
    expect(nextTrack.state.duration).toBe(30);
    expect(nextTrack.state.position).toBe(30);
  });

  it('replays from the start after ending', () => {
    const ended = stateAfter(
      initialAudioState(),
      { type: 'loadedmetadata', duration: 40 },
      { type: 'press' },
      { type: 'playing' },
      { type: 'timeupdate', position: 40 },
      { type: 'ended' },
    );
    expect(ended.status).toBe('ended');
    expect(ended.position).toBe(40);

    const replay = send(ended, { type: 'press' });
    expect(replay.command).toBe('replay');
    expect(replay.state.position).toBe(0);
    expect(replay.state.status).toBe('loading');
  });

  it('surfaces an error and lets the user retry', () => {
    const errored = stateAfter(initialAudioState(), { type: 'press' }, { type: 'error' });
    expect(errored.status).toBe('error');

    const retry = send(errored, { type: 'press' });
    expect(retry.command).toBe('play');
    expect(retry.state.status).toBe('loading');
  });

  it('resets fully', () => {
    const playing = stateAfter(
      initialAudioState(),
      { type: 'press' },
      { type: 'playing' },
      { type: 'timeupdate', position: 9 },
    );
    const reset = send(playing, { type: 'reset' });
    expect(reset.state).toEqual(initialAudioState());
    expect(reset.command).toBe('pause');
  });

  it('resets without losing the chosen rate', () => {
    const state = stateAfter(initialAudioState(), { type: 'setRate', rate: 1.5 });
    const reset = send(state, { type: 'reset' });
    expect(reset.state.rate).toBe(1.5);
  });

  describe('skip', () => {
    it('does nothing before duration is known', () => {
      const skipped = send(initialAudioState(), { type: 'skip', delta: 10 });
      expect(skipped.state.position).toBe(0);
      expect(skipped.command).toBeNull();
    });

    it('clamps forward skips to the duration', () => {
      const withDuration = send(initialAudioState(), {
        type: 'loadedmetadata',
        duration: 30,
      }).state;
      const nearEnd = { ...withDuration, position: 25 };
      const skipped = send(nearEnd, { type: 'skip', delta: 10 });
      expect(skipped.state.position).toBe(30);
      expect(skipped.command).toEqual({ type: 'seek', position: 30 });
    });

    it('clamps backward skips to zero', () => {
      const withDuration = send(initialAudioState(), {
        type: 'loadedmetadata',
        duration: 30,
      }).state;
      const nearStart = { ...withDuration, position: 5 };
      const skipped = send(nearStart, { type: 'skip', delta: -10 });
      expect(skipped.state.position).toBe(0);
      expect(skipped.command).toEqual({ type: 'seek', position: 0 });
    });

    it('is a no-op already-clamped skip', () => {
      const withDuration = send(initialAudioState(), {
        type: 'loadedmetadata',
        duration: 30,
      }).state;
      const skipped = send(withDuration, { type: 'skip', delta: -10 });
      expect(skipped.state.position).toBe(0);
      expect(skipped.command).toBeNull();
    });

    it('seeks while paused without resuming playback', () => {
      const paused = stateAfter(
        initialAudioState(),
        { type: 'loadedmetadata', duration: 30 },
        { type: 'press' },
        { type: 'playing' },
        { type: 'timeupdate', position: 12 },
        { type: 'press' }, // pause
      );
      expect(paused.status).toBe('paused');

      const skipped = send(paused, { type: 'skip', delta: 10 });
      expect(skipped.state.status).toBe('paused');
      expect(skipped.state.position).toBe(22);
      expect(skipped.command).toEqual({ type: 'seek', position: 22 });
    });
  });

  describe('setRate', () => {
    it('changes the rate and commands the element', () => {
      const changed = send(initialAudioState(), { type: 'setRate', rate: 1.5 });
      expect(changed.state.rate).toBe(1.5);
      expect(changed.command).toEqual({ type: 'rate', rate: 1.5 });
    });

    it('is a no-op when the rate is unchanged', () => {
      const state = initialAudioState(1.5);
      const changed = send(state, { type: 'setRate', rate: 1.5 });
      expect(changed.state).toBe(state);
      expect(changed.command).toBeNull();
    });

    it('applies while the element is still loading', () => {
      const loading = send(initialAudioState(), { type: 'press' }).state;
      expect(loading.status).toBe('loading');
      const changed = send(loading, { type: 'setRate', rate: 2 });
      expect(changed.state.status).toBe('loading');
      expect(changed.state.rate).toBe(2);
      expect(changed.command).toEqual({ type: 'rate', rate: 2 });
    });

    it('persists across a track change (a fresh reducer seeded with the prior rate)', () => {
      const chosen = send(initialAudioState(), { type: 'setRate', rate: 1.25 }).state;
      const freshTrack = initialAudioState(chosen.rate);
      expect(freshTrack.rate).toBe(1.25);
    });
  });
});

describe('formatTime', () => {
  it('formats seconds as m:ss', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(9)).toBe('0:09');
    expect(formatTime(62.7)).toBe('1:02');
    expect(formatTime(600)).toBe('10:00');
  });

  it('is safe with junk input', () => {
    expect(formatTime(Number.NaN)).toBe('0:00');
    expect(formatTime(-5)).toBe('0:00');
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('0:00');
  });
});
