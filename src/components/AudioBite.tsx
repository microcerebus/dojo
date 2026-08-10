import { useCallback, useRef, useState } from 'react';
import {
  audioReducer,
  formatTime,
  initialAudioState,
  type AudioEvent,
  type AudioState,
} from './audioMachine';

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

  const [state, setState] = useState<AudioState>(initialAudioState);

  /** Events coming *from* the element only move the state machine. */
  const send = useCallback((event: AudioEvent) => {
    setState((current) => audioReducer(current, event).state);
  }, []);

  /**
   * The press handler also drives the element, and does so synchronously:
   * iOS Safari only honours `play()` while it is still inside the tap's task,
   * so this cannot be deferred to an effect.
   */
  const onPress = useCallback(() => {
    const { state: next, command } = audioReducer(state, { type: 'press' });
    setState(next);
    const element = audioRef.current;
    if (!element || !command) return;
    if (command === 'pause') {
      element.pause();
      return;
    }
    if (command === 'replay') element.currentTime = 0;
    void element.play().catch(() => send({ type: 'error' }));
  }, [state, send]);

  const isBusy = state.status === 'loading';
  const isPlaying = state.status === 'playing' || isBusy;
  const progress = state.duration > 0 ? state.position / state.duration : 0;

  return (
    <div className="bite">
      <audio
        ref={audioRef}
        preload="metadata"
        src={audioSrc(moduleId, sectionId)}
        onPlaying={() => send({ type: 'playing' })}
        onWaiting={() => send({ type: 'waiting' })}
        onTimeUpdate={(event) =>
          send({ type: 'timeupdate', position: event.currentTarget.currentTime })
        }
        onLoadedMetadata={(event) =>
          send({ type: 'loadedmetadata', duration: event.currentTarget.duration })
        }
        onEnded={() => send({ type: 'ended' })}
        onError={() => send({ type: 'error' })}
      />

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
