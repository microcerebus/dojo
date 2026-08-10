/**
 * A small external store on top of `useSyncExternalStore`.
 *
 * Progress is persisted to localStorage on every write, which is what makes
 * state survive a reload, a restart, and a fully offline session.
 *
 * Two deliberate choices:
 *
 * - **localStorage, not the Cache API.** Progress must be untouched when the
 *   user clears cached assets or the service worker drops a stale precache.
 *   Keeping it in a different storage bucket from the app shell is what makes
 *   "clear the cache" and "erase my progress" separate actions.
 * - **Merged, not overwritten.** See `mergeProgress`.
 */
import { useCallback, useSyncExternalStore } from 'react';
import {
  PROGRESS_STORAGE_KEY,
  emptyProgress,
  mergeProgress,
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
   * Apply a transition and merge the result into whatever is on disk *now*.
   *
   * The transition runs against a fresh read so it never operates on a stale
   * snapshot, and the result is merged rather than written over the top, so it
   * does not matter whether another context wrote in between. Two tabs ticking
   * different drills both keep their tick, in either order.
   */
  update(transition: (current: ProgressState) => ProgressState): void {
    const next = transition(readFromStorage());
    commit(mergeProgress(readFromStorage(), next));
  },

  /** Wipe everything, in memory and on disk. This is the only lossy path. */
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
  // Cross-tab sync. `storage` fires in every *other* same-origin context when
  // one of them writes, so a second tab picks changes up live. `key === null`
  // means storage was cleared wholesale, which also has to be reflected.
  window.addEventListener('storage', (event) => {
    if (event.key === PROGRESS_STORAGE_KEY || event.key === null) progressStore.refresh();
  });

  // A background tab can miss events while frozen, so re-read on the way back.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') progressStore.refresh();
  });
  window.addEventListener('focus', () => progressStore.refresh());
}

/**
 * Ask the browser to make this origin's storage persistent.
 *
 * Without it, localStorage sits in the "best-effort" bucket and can be evicted
 * under storage pressure along with the caches. With it granted, the data
 * survives until the user deletes it - which is the promise the app makes
 * about progress. Chrome grants it silently for installed apps; Safari grants
 * it on user engagement. Failure is not an error: everything still works, the
 * data is just evictable.
 */
export async function requestPersistentStorage(): Promise<'persisted' | 'denied' | 'unsupported'> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) return 'unsupported';
  try {
    if (await navigator.storage.persisted?.()) return 'persisted';
    return (await navigator.storage.persist()) ? 'persisted' : 'denied';
  } catch {
    return 'unsupported';
  }
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
