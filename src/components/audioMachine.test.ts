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
    expect(initialAudioState()).toEqual({ status: 'idle', position: 0, duration: 0 });
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
