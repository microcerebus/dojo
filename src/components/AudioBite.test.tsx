import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { AudioBite } from './AudioBite';

/**
 * jsdom has no media stack, so `play`/`pause` are stubbed. `play` resolving is
 * what makes the race reproducible: the element can report that it started
 * after the user has already asked for a pause.
 */
let play: ReturnType<typeof vi.fn>;
let pause: ReturnType<typeof vi.fn>;

beforeEach(() => {
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(
    play as unknown as HTMLMediaElement['play'],
  );
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const setup = () => {
  render(<AudioBite moduleId="big-o" sectionId="space" title="Space complexity" />);
  const button = screen.getByRole('button', { name: /audio/i });
  const audio = document.querySelector('audio') as HTMLAudioElement;
  return { button, audio };
};

const labelOf = (element: HTMLElement) => element.getAttribute('aria-label') ?? '';

describe('AudioBite', () => {
  it('starts idle and only plays when tapped', () => {
    const { button } = setup();
    expect(labelOf(button)).toMatch(/^Play audio recap/);
    expect(play).not.toHaveBeenCalled();

    act(() => button.click());
    expect(play).toHaveBeenCalledTimes(1);
    expect(labelOf(button)).toMatch(/^Pause audio/);
  });

  it('pauses on a second tap', () => {
    const { button } = setup();
    act(() => button.click());
    act(() => button.click());
    expect(pause).toHaveBeenCalledTimes(1);
    expect(labelOf(button)).toMatch(/^Play audio recap/);
  });

  it('holds the pause when the element reports playing in the same tick, before any re-render', () => {
    const { button, audio } = setup();

    // All three happen inside one act() block, so React renders once at the
    // end and every handler runs against the same render. This is the
    // event-before-render case: nothing here can rely on `state` from a
    // render that has not happened yet.
    act(() => {
      button.click(); // press  -> loading, play()
      button.click(); // press  -> paused,  pause()
      // The play() issued before the pause resolves late and the element
      // announces that it started.
      audio.dispatchEvent(new Event('playing'));
    });

    // The user asked for pause, so that is what the UI must show...
    expect(labelOf(button)).toMatch(/^Play audio recap/);
    // ...and the element must have been told again, not left running.
    expect(pause).toHaveBeenCalledTimes(2);
  });

  it('holds the pause when the playing event arrives in a later tick', () => {
    const { button, audio } = setup();
    act(() => button.click());
    act(() => button.click());
    act(() => {
      audio.dispatchEvent(new Event('playing'));
    });

    expect(labelOf(button)).toMatch(/^Play audio recap/);
    expect(pause).toHaveBeenCalledTimes(2);
  });

  it('keeps re-asserting if the element insists it is playing', () => {
    const { button, audio } = setup();
    act(() => {
      button.click();
      button.click();
      audio.dispatchEvent(new Event('playing'));
      audio.dispatchEvent(new Event('playing'));
    });

    expect(labelOf(button)).toMatch(/^Play audio recap/);
    expect(pause).toHaveBeenCalledTimes(3); // the tap, then once per stray event
  });

  it('two taps before a render still net out to playing, not a stuck state', () => {
    const { button, audio } = setup();
    act(() => {
      button.click(); // -> loading
      button.click(); // -> paused
      button.click(); // -> loading again
      audio.dispatchEvent(new Event('playing'));
    });

    expect(labelOf(button)).toMatch(/^Pause audio/);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('reaches playing normally when no pause intervened', () => {
    const { button, audio } = setup();
    act(() => button.click());
    act(() => {
      audio.dispatchEvent(new Event('playing'));
    });

    expect(labelOf(button)).toMatch(/^Pause audio/);
    expect(pause).not.toHaveBeenCalled();
  });

  it('surfaces a failed play as a retryable error', async () => {
    play.mockImplementation(() => Promise.reject(new Error('NotAllowedError')));
    const { button } = setup();

    await act(async () => {
      button.click();
    });

    expect(labelOf(button)).toMatch(/^Retry audio/);
    expect(screen.getByText(/Audio unavailable/)).toBeInTheDocument();
  });

  it('shows the narration transcript on request', () => {
    setup();
    const toggle = screen.getByRole('button', { name: 'Text' });
    act(() => toggle.click());
    expect(screen.getByRole('button', { name: 'Hide text' })).toBeInTheDocument();
  });
});
