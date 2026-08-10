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
const listeners = new Set<Listener>();

export const progressStore = {
  getSnapshot: (): ProgressState => state,

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  update(transition: (current: ProgressState) => ProgressState): void {
    const next = transition(state);
    if (next === state) return;
    state = next;
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Persisting is best-effort; the in-memory state still updates.
    }
    for (const listener of listeners) listener();
  },

  /** Test helper: drop everything, including what is on disk. */
  reset(): void {
    state = emptyProgress();
    try {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    for (const listener of listeners) listener();
  },

  /** Re-read from disk; used by the cross-tab `storage` listener. */
  refresh(): void {
    state = readFromStorage();
    for (const listener of listeners) listener();
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
