/**
 * The user's chosen narration playback speed, persisted alongside progress in
 * localStorage so it survives a reload and carries over between audio bites.
 *
 * Unlike progress, this is a single scalar with no merge concerns - last
 * write wins is the right behaviour for a preference.
 */
const AUDIO_RATE_KEY = 'dojo:audio-rate';

export const PLAYBACK_RATES = [1, 1.25, 1.5, 2] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

/** The captain listens fast: nothing stored yet defaults to 2x. */
const DEFAULT_RATE: PlaybackRate = 2;

function isPlaybackRate(value: number): value is PlaybackRate {
  return (PLAYBACK_RATES as readonly number[]).includes(value);
}

export function readStoredRate(): PlaybackRate {
  try {
    const raw = localStorage.getItem(AUDIO_RATE_KEY);
    if (raw === null) return DEFAULT_RATE;
    const parsed = Number(raw);
    return isPlaybackRate(parsed) ? parsed : DEFAULT_RATE;
  } catch {
    return DEFAULT_RATE;
  }
}

export function storeRate(rate: PlaybackRate): void {
  try {
    localStorage.setItem(AUDIO_RATE_KEY, String(rate));
  } catch {
    // Persisting is best-effort; playback still uses the chosen rate.
  }
}

export function nextRate(current: number): PlaybackRate {
  const index = PLAYBACK_RATES.indexOf(current as PlaybackRate);
  return PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length];
}
