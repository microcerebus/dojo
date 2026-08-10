import { useCallback, useEffect, useRef, useState } from 'react';
import {
  audioReducer,
  formatTime,
  initialAudioState,
  type AudioCommand,
  type AudioEvent,
  type AudioState,
} from './audioMachine';
import { nextRate, readStoredRate, storeRate } from '../lib/audioRate';

const SKIP_SECONDS = 10;

/**
 * Narration scripts, bundled at build time so the transcript works offline and
 * stays the single source the MP3 was generated from.
 */
const SCRIPTS = import.meta.glob('../content/narration/**/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export function narrationScript(moduleId: string, sectionId: string): string | null {
  const key = `../content/narration/${moduleId}/${sectionId}.txt`;
  return SCRIPTS[key]?.trim() ?? null;
}

/** Audio lives in `public/`, so it is served (and precached) at this path. */
const audioSrc = (moduleId: string, sectionId: string) =>
  `${import.meta.env.BASE_URL}audio/${moduleId}/${sectionId}.mp3`;

export function AudioBite({
  moduleId,
  sectionId,
  title,
}: {
  moduleId: string;
  sectionId: string;
  title: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const script = narrationScript(moduleId, sectionId);

  const [state, setState] = useState<AudioState>(() => initialAudioState(readStoredRate()));
  /**
   * The authoritative state for transitions.
   *
   * Several events can arrive before React re-renders - a second tap, or the
   * element reporting `playing` right after a pause - and each one has to see
   * the previous one's result. Deriving anything from the render-captured
   * `state` would make those later events act on a stale status. `state`
   * exists only so the component renders.
   */
  const stateRef = useRef<AudioState>(state);

  /** Advance the machine and hand back the command that transition produced. */
  const applyEvent = useCallback((event: AudioEvent): AudioCommand => {
    const { state: next, command } = audioReducer(stateRef.current, event);
    stateRef.current = next;
    setState(next);
    return command;
  }, []);

  /**
   * Every event - the user's tap and the element's own notifications - goes
   * through here. The reducer is the single source of truth: it decides the
   * state and the command together, and this only executes what it is given.
   *
   * Execution is synchronous in the handler rather than deferred to an effect,
   * because iOS Safari only honours `play()` while it is still inside the
   * tap's task.
   */
  const dispatch = useCallback(
    (event: AudioEvent) => {
      const command = applyEvent(event);
      if (!command) return;
      const element = audioRef.current;
      if (!element) return;
      if (typeof command === 'object') {
        if (command.type === 'seek') element.currentTime = command.position;
        else element.playbackRate = command.rate;
        return;
      }
      if (command === 'pause') {
        element.pause();
        return;
      }
      if (command === 'replay') element.currentTime = 0;
      void element.play().catch(() => applyEvent({ type: 'error' }));
    },
    [applyEvent],
  );

  // Applies the current rate to a freshly mounted element and after every
  // change, so a fresh <audio> (which always starts at 1x) picks up the
  // remembered speed without waiting for a user-initiated rate change.
  useEffect(() => {
    const element = audioRef.current;
    if (element) element.playbackRate = state.rate;
  }, [state.rate]);

  const onPress = useCallback(() => dispatch({ type: 'press' }), [dispatch]);
  const onSkipBack = useCallback(
    () => dispatch({ type: 'skip', delta: -SKIP_SECONDS }),
    [dispatch],
  );
  const onSkipForward = useCallback(
    () => dispatch({ type: 'skip', delta: SKIP_SECONDS }),
    [dispatch],
  );
  const onCycleRate = useCallback(() => {
    const rate = nextRate(state.rate);
    storeRate(rate);
    dispatch({ type: 'setRate', rate });
  }, [dispatch, state.rate]);

  const isBusy = state.status === 'loading';
  const isPlaying = state.status === 'playing' || isBusy;
  const progress = state.duration > 0 ? state.position / state.duration : 0;

  return (
    <div className="bite">
      <audio
        ref={audioRef}
        preload="metadata"
        src={audioSrc(moduleId, sectionId)}
        onPlaying={() => dispatch({ type: 'playing' })}
        onWaiting={() => dispatch({ type: 'waiting' })}
        onTimeUpdate={(event) =>
          dispatch({ type: 'timeupdate', position: event.currentTarget.currentTime })
        }
        onLoadedMetadata={(event) =>
          dispatch({ type: 'loadedmetadata', duration: event.currentTarget.duration })
        }
        onEnded={() => dispatch({ type: 'ended' })}
        onError={() => dispatch({ type: 'error' })}
      />

      <div className="bite__controls">
        <button
          type="button"
          className="bite__skip"
          onClick={onSkipBack}
          disabled={state.duration <= 0}
          aria-label={`Back 10 seconds: ${title}`}
        >
          <span aria-hidden="true">«10</span>
        </button>

        <button
          type="button"
          className="bite__play"
          onClick={onPress}
          aria-label={
            state.status === 'error'
              ? `Retry audio: ${title}`
              : isPlaying
                ? `Pause audio: ${title}`
                : `Play audio recap: ${title}`
          }
        >
          <span aria-hidden="true">
            {state.status === 'error' ? '↻' : isPlaying ? '❙❙' : '▶'}
          </span>
        </button>

        <button
          type="button"
          className="bite__skip"
          onClick={onSkipForward}
          disabled={state.duration <= 0}
          aria-label={`Forward 10 seconds: ${title}`}
        >
          <span aria-hidden="true">10»</span>
        </button>
      </div>

      <div className="bite__body">
        {/* Just "Audio recap": the section title sits directly above this
            player, and repeating it wrapped the label onto four lines. The
            button's accessible name still carries the title. */}
        <p className="bite__label">
          {state.status === 'error' ? 'Audio unavailable - tap to retry' : 'Audio recap'}
        </p>
        <div className="bite__track" aria-hidden="true">
          <div className="bite__fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>

      <span className="bite__time" aria-hidden="true">
        {state.duration > 0
          ? `${formatTime(state.position)} / ${formatTime(state.duration)}`
          : '–:––'}
      </span>

      <button
        type="button"
        className="bite__rate"
        onClick={onCycleRate}
        aria-label={`Playback speed, currently ${state.rate}x. Tap to change.`}
      >
        {state.rate}x
      </button>

      {script ? (
        <button
          type="button"
          className="bite__transcript"
          onClick={() => setShowTranscript((open) => !open)}
          aria-expanded={showTranscript}
        >
          {showTranscript ? 'Hide text' : 'Text'}
        </button>
      ) : null}

      {showTranscript && script ? <p className="bite__script">{script}</p> : null}
    </div>
  );
}
