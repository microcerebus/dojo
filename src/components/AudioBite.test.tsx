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
  localStorage.clear();
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
  const rateButton = screen.getByRole('button', { name: /playback speed/i });
  const backButton = screen.getByRole('button', { name: /back 10 seconds/i });
  const forwardButton = screen.getByRole('button', { name: /forward 10 seconds/i });
  const audio = document.querySelector('audio') as HTMLAudioElement;
  return { button, rateButton, backButton, forwardButton, audio };
};

const labelOf = (element: HTMLElement) => element.getAttribute('aria-label') ?? '';

/** jsdom's <audio> has no real media stack, so duration has to be forced on. */
const withDuration = (audio: HTMLAudioElement, duration: number) => {
  Object.defineProperty(audio, 'duration', { value: duration, configurable: true });
  act(() => audio.dispatchEvent(new Event('loadedmetadata')));
};

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

  it('defaults to 2x on a fresh visit', () => {
    const { rateButton, audio } = setup();
    expect(rateButton).toHaveTextContent('2x');
    expect(audio.playbackRate).toBe(2);
  });

  it('cycles 1x -> 1.25x -> 1.5x -> 2x -> 1x on tap and remembers the choice', () => {
    const { rateButton, audio } = setup();
    expect(rateButton).toHaveTextContent('2x');

    act(() => rateButton.click());
    expect(rateButton).toHaveTextContent('1x');
    expect(audio.playbackRate).toBe(1);

    act(() => rateButton.click());
    expect(rateButton).toHaveTextContent('1.25x');

    act(() => rateButton.click());
    expect(rateButton).toHaveTextContent('1.5x');

    act(() => rateButton.click());
    expect(rateButton).toHaveTextContent('2x');

    expect(localStorage.getItem('dojo:audio-rate')).toBe('2');
  });

  it('starts a fresh player at the last chosen rate, not the 2x default', () => {
    localStorage.setItem('dojo:audio-rate', '1.5');
    const { rateButton, audio } = setup();
    expect(rateButton).toHaveTextContent('1.5x');
    expect(audio.playbackRate).toBe(1.5);
  });

  it('disables skip buttons until duration is known', () => {
    const { backButton, forwardButton } = setup();
    expect(backButton).toBeDisabled();
    expect(forwardButton).toBeDisabled();
  });

  it('skips forward and back once duration is known, clamped to the track', () => {
    const { forwardButton, backButton, audio } = setup();
    withDuration(audio, 30);
    expect(forwardButton).not.toBeDisabled();

    act(() => forwardButton.click());
    expect(audio.currentTime).toBe(10);

    act(() => backButton.click());
    expect(audio.currentTime).toBe(0);
  });

  it('seeks without resuming playback when paused', () => {
    const { button, forwardButton, audio } = setup();
    withDuration(audio, 30);

    act(() => button.click()); // play
    act(() => audio.dispatchEvent(new Event('playing')));
    act(() => button.click()); // pause
    play.mockClear();

    act(() => forwardButton.click());
    expect(audio.currentTime).toBe(10);
    expect(play).not.toHaveBeenCalled();
    expect(labelOf(button)).toMatch(/^Play audio recap/);
  });

  it('resets position and duration on a track change, so a skip does not jump from stale state', () => {
    // ModulePage swaps moduleId/sectionId on the same AudioBite instance when
    // navigating sections rather than remounting it, so the reducer has to be
    // told explicitly that the track changed.
    const { rerender } = render(
      <AudioBite moduleId="big-o" sectionId="space" title="Space complexity" />,
    );
    const audio = document.querySelector('audio') as HTMLAudioElement;
    withDuration(audio, 90);
    Object.defineProperty(audio, 'currentTime', { value: 80, writable: true, configurable: true });
    act(() => audio.dispatchEvent(new Event('timeupdate')));

    rerender(<AudioBite moduleId="big-o" sectionId="amortised-time" title="Amortised time" />);

    const forwardButton = screen.getByRole('button', { name: /forward 10 seconds/i });
    // The new track has not reported its own metadata yet - duration is
    // unknown again, so skipping is disabled rather than jumping from 80s.
    expect(forwardButton).toBeDisabled();

    withDuration(audio, 20);
    expect(forwardButton).not.toBeDisabled();
    act(() => forwardButton.click());
    expect(audio.currentTime).toBe(10);
  });
});
