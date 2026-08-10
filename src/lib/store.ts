/**
 * A ~50 line external store on top of `useSyncExternalStore`. Progress is
 * persisted to localStorage on every write, which is what makes state survive a
 * reload (and, with the service worker, a fully offline session).
 */
import { useCallback, useSyncExternalStore } from 'react';
import {
  PROGRESS_STORAGE_KEY,
  emptyProgress,
  parseProgress,
  type ProgressState,
} from './progress';

type Listener = () => void;

function readFromStorage(): ProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return emptyProgress();
    return parseProgress(JSON.parse(raw) as unknown);
  } catch {
    // Private mode, quota, or corrupt JSON: start clean rather than crash.
    return emptyProgress();
  }
}

let state: ProgressState = readFromStorage();
/** Serialised form of `state`, so change detection is exact and cheap. */
let serialized = JSON.stringify(state);
const listeners = new Set<Listener>();

/** Adopt `next` as the current state, persisting and notifying if it differs. */
function commit(next: ProgressState): void {
  const nextSerialized = JSON.stringify(next);
  if (nextSerialized === serialized) return;
  state = next;
  serialized = nextSerialized;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, nextSerialized);
  } catch {
    // Persisting is best-effort; the in-memory state still updates.
  }
  for (const listener of listeners) listener();
}

export const progressStore = {
  getSnapshot: (): ProgressState => state,

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Read, merge, write - never write this tab's in-memory blob blindly.
   *
   * The whole progress object lives under one key, so a write built from a
   * stale snapshot silently discards everything another context has saved
   * since. That is not hypothetical: the installed PWA and a browser tab on
   * the same device share this storage, and the `storage` event that would
   * have synced us can arrive late or not at all if the other context was
   * suspended. Applying the transition to freshly-read state means concurrent
   * writers only conflict when they touch the same field.
   */
  update(transition: (current: ProgressState) => ProgressState): void {
    commit(transition(readFromStorage()));
  },

  /** Test helper: drop everything, including what is on disk. */
  reset(): void {
    state = emptyProgress();
    serialized = JSON.stringify(state);
    try {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    for (const listener of listeners) listener();
  },

  /** Re-read from disk; used by the cross-tab `storage` listener. */
  refresh(): void {
    commit(readFromStorage());
  },
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === PROGRESS_STORAGE_KEY) progressStore.refresh();
  });
}

export function useProgressState(): ProgressState {
  return useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
    progressStore.getSnapshot,
  );
}

export function useProgressUpdate() {
  return useCallback((transition: (current: ProgressState) => ProgressState) => {
    progressStore.update(transition);
  }, []);
}
