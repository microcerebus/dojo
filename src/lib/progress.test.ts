import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PROGRESS_STORAGE_KEY,
  emptyProgress,
  mergeProgress,
  moduleCompletion,
  moduleProgress,
  parseProgress,
  recordQuizResult,
  resetModule,
  setSectionRead,
  toggleDrill,
  type ProgressState,
} from './progress';
import { progressStore, requestPersistentStorage } from './store';

const courseModule = {
  sections: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] as { id: string }[],
  quiz: [{ id: 'q1' }, { id: 'q2' }] as { id: string }[],
  drills: [{ slug: 'x' }, { slug: 'y' }],
} as unknown as Parameters<typeof moduleCompletion>[0];

describe('progress transitions', () => {
  it('marks and unmarks a section without duplicating it', () => {
    let state = emptyProgress();
    state = setSectionRead(state, 'm', 'a', true);
    state = setSectionRead(state, 'm', 'a', true);
    expect(moduleProgress(state, 'm').readSections).toEqual(['a']);

    state = setSectionRead(state, 'm', 'a', false);
    expect(moduleProgress(state, 'm').readSections).toEqual([]);
  });

  it('returns the identical object when nothing changes', () => {
    const state = setSectionRead(emptyProgress(), 'm', 'a', true);
    expect(setSectionRead(state, 'm', 'a', true)).toBe(state);
  });

  it('toggles a drill on and off', () => {
    let state = toggleDrill(emptyProgress(), 'm', 'x');
    expect(moduleProgress(state, 'm').drills.x).toBe(true);
    state = toggleDrill(state, 'm', 'x');
    expect(moduleProgress(state, 'm').drills.x).toBe(false);
  });

  it('keeps the best quiz score, not the latest', () => {
    let state = recordQuizResult(emptyProgress(), 'm', { correct: 8, total: 10, at: 1 });
    state = recordQuizResult(state, 'm', { correct: 3, total: 10, at: 2 });
    expect(moduleProgress(state, 'm').quizBest).toEqual({ correct: 8, total: 10, at: 1 });

    state = recordQuizResult(state, 'm', { correct: 10, total: 10, at: 3 });
    expect(moduleProgress(state, 'm').quizBest?.correct).toBe(10);
  });

  it('keeps modules independent', () => {
    let state = toggleDrill(emptyProgress(), 'm1', 'x');
    state = toggleDrill(state, 'm2', 'y');
    expect(moduleProgress(state, 'm1').drills).toEqual({ x: true });
    expect(moduleProgress(state, 'm2').drills).toEqual({ y: true });
  });

  it('resets a single module', () => {
    let state = toggleDrill(emptyProgress(), 'm1', 'x');
    state = toggleDrill(state, 'm2', 'y');
    state = resetModule(state, 'm1');
    expect(moduleProgress(state, 'm1').drills).toEqual({});
    expect(moduleProgress(state, 'm2').drills).toEqual({ y: true });
  });
});

describe('moduleCompletion', () => {
  it('is zero for an untouched module', () => {
    const completion = moduleCompletion(courseModule, moduleProgress(emptyProgress(), 'm'));
    expect(completion).toMatchObject({ lesson: 0, quiz: 0, drills: 0, overall: 0, started: false });
  });

  it('averages the three dimensions', () => {
    let state = emptyProgress();
    state = setSectionRead(state, 'm', 'a', true);
    state = setSectionRead(state, 'm', 'b', true);
    state = setSectionRead(state, 'm', 'c', true);
    state = recordQuizResult(state, 'm', { correct: 1, total: 2, at: 0 });
    state = toggleDrill(state, 'm', 'x');

    const completion = moduleCompletion(courseModule, moduleProgress(state, 'm'));
    expect(completion.lesson).toBe(1);
    expect(completion.quiz).toBe(0.5);
    expect(completion.drills).toBe(0.5);
    expect(completion.overall).toBeCloseTo((1 + 0.5 + 0.5) / 3);
    expect(completion.started).toBe(true);
  });

  it('ignores read sections that no longer exist', () => {
    const state = setSectionRead(emptyProgress(), 'm', 'deleted-section', true);
    expect(moduleCompletion(courseModule, moduleProgress(state, 'm')).lesson).toBe(0);
  });

  it('excludes dimensions the module does not have, rather than scoring them zero', () => {
    const outline = { sections: [], quiz: [], drills: [{ slug: 'x' }] } as unknown as Parameters<
      typeof moduleCompletion
    >[0];
    const state = toggleDrill(emptyProgress(), 'm', 'x');
    expect(moduleCompletion(outline, moduleProgress(state, 'm')).overall).toBe(1);
  });
});

describe('parseProgress', () => {
  it('rejects junk and returns an empty state', () => {
    expect(parseProgress(null)).toEqual(emptyProgress());
    expect(parseProgress('nope')).toEqual(emptyProgress());
    expect(parseProgress({ version: 99, modules: {} })).toEqual(emptyProgress());
  });

  it('drops malformed fields but keeps the rest', () => {
    const parsed = parseProgress({
      version: 1,
      modules: {
        m: {
          readSections: ['a', 7, null],
          quizBest: { correct: 2, total: 3 },
          drills: { x: true, y: 'yes' },
        },
        bad: 'not an object',
      },
    });
    expect(parsed.modules.m?.readSections).toEqual(['a']);
    expect(parsed.modules.m?.quizBest).toEqual({ correct: 2, total: 3, at: 0 });
    expect(parsed.modules.m?.drills).toEqual({ x: true });
    expect(parsed.modules.bad).toBeUndefined();
  });
});

describe('mergeProgress', () => {
  const withDrills = (moduleId: string, drills: Record<string, boolean>): ProgressState => ({
    version: 1,
    modules: { [moduleId]: { readSections: [], quizBest: null, drills } },
  });

  it('unions read sections, because the app never un-reads one', () => {
    const stored = setSectionRead(emptyProgress(), 'm', 'a', true);
    const next = setSectionRead(emptyProgress(), 'm', 'b', true);
    expect(moduleProgress(mergeProgress(stored, next), 'm').readSections.sort()).toEqual([
      'a',
      'b',
    ]);
  });

  it('keeps the higher quiz score whichever side it is on', () => {
    const low = recordQuizResult(emptyProgress(), 'm', { correct: 3, total: 10, at: 100 });
    const high = recordQuizResult(emptyProgress(), 'm', { correct: 9, total: 10, at: 50 });
    expect(moduleProgress(mergeProgress(low, high), 'm').quizBest?.correct).toBe(9);
    expect(moduleProgress(mergeProgress(high, low), 'm').quizBest?.correct).toBe(9);
  });

  it('breaks a quiz tie on the later timestamp', () => {
    const early = recordQuizResult(emptyProgress(), 'm', { correct: 5, total: 10, at: 100 });
    const late = recordQuizResult(emptyProgress(), 'm', { correct: 5, total: 10, at: 900 });
    expect(moduleProgress(mergeProgress(early, late), 'm').quizBest?.at).toBe(900);
    expect(moduleProgress(mergeProgress(late, early), 'm').quizBest?.at).toBe(900);
  });

  it('keeps drills only the stored side knows about', () => {
    const merged = mergeProgress(withDrills('m', { a: true }), withDrills('m', { b: true }));
    expect(moduleProgress(merged, 'm').drills).toEqual({ a: true, b: true });
  });

  it('lets an explicit un-tick win, so un-checking is not resurrected', () => {
    // A plain set-union would make this impossible: `next` deliberately says
    // false, and that is the newer intent because it was derived from a read.
    const merged = mergeProgress(withDrills('m', { a: true }), withDrills('m', { a: false }));
    expect(moduleProgress(merged, 'm').drills.a).toBe(false);
  });

  it('keeps modules only one side knows about', () => {
    const merged = mergeProgress(withDrills('m1', { a: true }), withDrills('m2', { b: true }));
    expect(moduleProgress(merged, 'm1').drills.a).toBe(true);
    expect(moduleProgress(merged, 'm2').drills.b).toBe(true);
  });

  it('is idempotent', () => {
    const one = withDrills('m', { a: true });
    expect(mergeProgress(one, one)).toEqual(one);
  });

  it('merges in either order for disjoint entries', () => {
    const a = withDrills('m', { a: true });
    const b = withDrills('m', { b: true });
    expect(mergeProgress(a, b)).toEqual(mergeProgress(b, a));
  });
});

describe('persistence across a reload', () => {
  /** What a reload - or another context - would read off disk. */
  const readDisk = (): ProgressState => {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? parseProgress(JSON.parse(raw)) : emptyProgress();
  };

  /**
   * Another tab writing. It goes through the same merge, because every context
   * runs this same store - the merge is what makes the two writers
   * conflict-free, not the ordering.
   */
  const writeAsOtherTab = (next: ProgressState) => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(mergeProgress(readDisk(), next)));
  };

  /** A blunt overwrite, to prove *our* write is the one doing the merging. */
  const overwriteAsOtherTab = (next: ProgressState) => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
  };

  beforeEach(() => {
    localStorage.clear();
    progressStore.reset();
  });

  it('writes to localStorage and reads the same state back', () => {
    progressStore.update((state) => toggleDrill(state, 'arrays-strings', 'two-sum'));
    progressStore.update((state) =>
      recordQuizResult(state, 'arrays-strings', { correct: 9, total: 10, at: 123 }),
    );
    progressStore.update((state) => setSectionRead(state, 'arrays-strings', 'hash-tables', true));

    // What a page reload does: re-read the persisted JSON from scratch.
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const reloaded = parseProgress(JSON.parse(raw as string));

    const state = moduleProgress(reloaded, 'arrays-strings');
    expect(state.drills['two-sum']).toBe(true);
    expect(state.quizBest).toEqual({ correct: 9, total: 10, at: 123 });
    expect(state.readSections).toEqual(['hash-tables']);
  });

  it('notifies subscribers on every write', () => {
    let notifications = 0;
    const unsubscribe = progressStore.subscribe(() => {
      notifications += 1;
    });
    progressStore.update((state) => toggleDrill(state, 'm', 'x'));
    progressStore.update((state) => toggleDrill(state, 'm', 'y'));
    unsubscribe();
    progressStore.update((state) => toggleDrill(state, 'm', 'z'));
    expect(notifications).toBe(2);
  });

  it('does not clobber another tab that wrote while this one was stale', () => {
    // This tab does some work and holds the resulting snapshot.
    progressStore.update((state) => toggleDrill(state, 'arrays-strings', 'two-sum'));
    const staleSnapshot = progressStore.getSnapshot();

    // Another context - the installed PWA next to a browser tab - writes
    // directly to the same key. No `storage` event reaches us, so our
    // in-memory snapshot is now behind what is on disk.
    const onDiskNow = parseProgress(
      JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) as string),
    );
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify(toggleDrill(onDiskNow, 'linked-lists', 'reverse-linked-list')),
    );
    expect(progressStore.getSnapshot()).toBe(staleSnapshot);

    // Now this tab writes again. Building the write from our stale snapshot
    // would drop the other tab's drill entirely.
    progressStore.update((state) => toggleDrill(state, 'stacks-queues', 'valid-parentheses'));

    const merged = parseProgress(
      JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) as string),
    );
    expect(moduleProgress(merged, 'arrays-strings').drills['two-sum']).toBe(true);
    expect(moduleProgress(merged, 'linked-lists').drills['reverse-linked-list']).toBe(true);
    expect(moduleProgress(merged, 'stacks-queues').drills['valid-parentheses']).toBe(true);
    // And the in-memory snapshot reflects the merge, not just our own write.
    expect(
      moduleProgress(progressStore.getSnapshot(), 'linked-lists').drills[
        'reverse-linked-list'
      ],
    ).toBe(true);
  });

  it("picks up another tab's changes even when the transition is a no-op", () => {
    progressStore.update((state) => toggleDrill(state, 'big-o', 'sqrtx'));

    const other = toggleDrill(
      parseProgress(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) as string)),
      'big-o',
      'fibonacci-number',
    );
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(other));

    let notifications = 0;
    const unsubscribe = progressStore.subscribe(() => {
      notifications += 1;
    });
    // Marking an already-read section is a no-op transition, but the read
    // still has to adopt what the other tab wrote.
    progressStore.update((state) => setSectionRead(state, 'big-o', 'space', false));
    unsubscribe();

    expect(notifications).toBe(1);
    expect(moduleProgress(progressStore.getSnapshot(), 'big-o').drills['fibonacci-number']).toBe(
      true,
    );
  });

  it('does not notify when genuinely nothing changed anywhere', () => {
    progressStore.update((state) => toggleDrill(state, 'big-o', 'sqrtx'));

    let notifications = 0;
    const unsubscribe = progressStore.subscribe(() => {
      notifications += 1;
    });
    progressStore.update((state) => setSectionRead(state, 'big-o', 'space', false));
    unsubscribe();

    expect(notifications).toBe(0);
  });

  it('merges at write time, even when the caller hands back a stale document', () => {
    progressStore.update((s) => toggleDrill(s, 'arrays-strings', 'two-sum'));
    // A caller captures a snapshot and holds on to it.
    const stale = progressStore.getSnapshot();

    // Another context writes while that snapshot is being held.
    overwriteAsOtherTab(toggleDrill(readDisk(), 'linked-lists', 'reverse-linked-list'));

    // The caller now writes, derived from its stale snapshot rather than from
    // the state it was handed. Reading fresh inside `update` cannot save this;
    // only merging the result at write time can.
    progressStore.update(() => toggleDrill(stale, 'stacks-queues', 'valid-parentheses'));

    const disk = readDisk();
    expect(moduleProgress(disk, 'arrays-strings').drills['two-sum']).toBe(true);
    expect(moduleProgress(disk, 'linked-lists').drills['reverse-linked-list']).toBe(true);
    expect(moduleProgress(disk, 'stacks-queues').drills['valid-parentheses']).toBe(true);
  });

  it('lets two interleaved writers keep each other’s entries', () => {
    // Both contexts start from the same document.
    progressStore.update((s) => toggleDrill(s, 'arrays-strings', 'two-sum'));

    // The other context reads now, and will write from this older read.
    const otherTabsRead = readDisk();

    // This tab writes first.
    progressStore.update((s) => toggleDrill(s, 'linked-lists', 'reverse-linked-list'));

    // The other tab now writes its own change, through the same merge path,
    // still working from the read it took before ours landed.
    writeAsOtherTab(toggleDrill(otherTabsRead, 'stacks-queues', 'valid-parentheses'));

    const disk = readDisk();
    expect(moduleProgress(disk, 'arrays-strings').drills['two-sum']).toBe(true);
    expect(moduleProgress(disk, 'linked-lists').drills['reverse-linked-list']).toBe(true);
    expect(moduleProgress(disk, 'stacks-queues').drills['valid-parentheses']).toBe(true);
  });

  it('is order-independent: the same two writers in the other order agree', () => {
    progressStore.update((s) => toggleDrill(s, 'arrays-strings', 'two-sum'));
    const otherTabsRead = readDisk();

    // Other tab first this time.
    writeAsOtherTab(toggleDrill(otherTabsRead, 'stacks-queues', 'valid-parentheses'));
    progressStore.update((s) => toggleDrill(s, 'linked-lists', 'reverse-linked-list'));

    const disk = readDisk();
    expect(moduleProgress(disk, 'arrays-strings').drills['two-sum']).toBe(true);
    expect(moduleProgress(disk, 'linked-lists').drills['reverse-linked-list']).toBe(true);
    expect(moduleProgress(disk, 'stacks-queues').drills['valid-parentheses']).toBe(true);
  });

  it('merges concurrent work inside the same module', () => {
    progressStore.update((s) => setSectionRead(s, 'big-o', 'space', true));
    const otherTabsRead = readDisk();

    progressStore.update((s) => toggleDrill(s, 'big-o', 'sqrtx'));
    writeAsOtherTab(
      recordQuizResult(setSectionRead(otherTabsRead, 'big-o', 'amortised', true), 'big-o', {
        correct: 9,
        total: 10,
        at: 1,
      }),
    );

    const bigO = moduleProgress(readDisk(), 'big-o');
    expect(bigO.readSections.sort()).toEqual(['amortised', 'space']);
    expect(bigO.drills['sqrtx']).toBe(true);
    expect(bigO.quizBest?.correct).toBe(9);
  });

  it('picks up another tab’s write live, via the storage event', () => {
    progressStore.update((s) => toggleDrill(s, 'big-o', 'sqrtx'));

    let notifications = 0;
    const unsubscribe = progressStore.subscribe(() => {
      notifications += 1;
    });

    writeAsOtherTab(toggleDrill(readDisk(), 'big-o', 'fibonacci-number'));
    // jsdom does not deliver storage events between contexts, so raise the one
    // the browser would have raised in this tab.
    window.dispatchEvent(
      new StorageEvent('storage', { key: PROGRESS_STORAGE_KEY, storageArea: localStorage }),
    );
    unsubscribe();

    expect(notifications).toBe(1);
    const drills = moduleProgress(progressStore.getSnapshot(), 'big-o').drills;
    expect(drills['fibonacci-number']).toBe(true);
    expect(drills['sqrtx']).toBe(true);
  });

  it('ignores storage events for unrelated keys', () => {
    let notifications = 0;
    const unsubscribe = progressStore.subscribe(() => {
      notifications += 1;
    });
    window.dispatchEvent(new StorageEvent('storage', { key: 'some.other.key' }));
    unsubscribe();
    expect(notifications).toBe(0);
  });

  it('survives corrupt storage without throwing', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, '{ this is not json');
    expect(() => progressStore.refresh()).not.toThrow();
    expect(progressStore.getSnapshot()).toEqual(emptyProgress());
  });
});

describe('requestPersistentStorage', () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'storage');

  const stubStorage = (value: unknown) => {
    Object.defineProperty(navigator, 'storage', { value, configurable: true });
  };

  afterEach(() => {
    if (original) Object.defineProperty(navigator, 'storage', original);
    else Reflect.deleteProperty(navigator as object, 'storage');
  });

  it('reports unsupported where the API is missing', async () => {
    stubStorage(undefined);
    await expect(requestPersistentStorage()).resolves.toBe('unsupported');
  });

  it('does not ask again when the bucket is already persistent', async () => {
    const persist = vi.fn();
    stubStorage({ persisted: async () => true, persist });
    await expect(requestPersistentStorage()).resolves.toBe('persisted');
    expect(persist).not.toHaveBeenCalled();
  });

  it('asks, and reports the grant', async () => {
    stubStorage({ persisted: async () => false, persist: async () => true });
    await expect(requestPersistentStorage()).resolves.toBe('persisted');
  });

  it('reports a refusal without throwing', async () => {
    stubStorage({ persisted: async () => false, persist: async () => false });
    await expect(requestPersistentStorage()).resolves.toBe('denied');
  });

  it('treats a throwing implementation as unsupported', async () => {
    stubStorage({
      persisted: async () => {
        throw new Error('nope');
      },
      persist: async () => true,
    });
    await expect(requestPersistentStorage()).resolves.toBe('unsupported');
  });
});

describe('storage separation', () => {
  beforeEach(() => {
    localStorage.clear();
    progressStore.reset();
  });

  it('never touches the Cache API, so clearing cached assets cannot erase progress', () => {
    // Progress lives in localStorage; the app shell and audio live in the
    // service worker's caches. Different buckets is what makes "clear the
    // cache" and "erase my progress" separate actions.
    const cacheApi = {
      open: vi.fn(),
      match: vi.fn(),
      keys: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
    };
    Object.defineProperty(globalThis, 'caches', { value: cacheApi, configurable: true });

    try {
      progressStore.update((s) => toggleDrill(s, 'big-o', 'sqrtx'));
      progressStore.refresh();
      progressStore.getSnapshot();

      for (const spy of Object.values(cacheApi)) expect(spy).not.toHaveBeenCalled();
      expect(localStorage.getItem(PROGRESS_STORAGE_KEY)).toContain('sqrtx');
    } finally {
      Reflect.deleteProperty(globalThis as object, 'caches');
    }
  });

  it('survives every cache being dropped', () => {
    progressStore.update((s) => toggleDrill(s, 'big-o', 'sqrtx'));
    const before = localStorage.getItem(PROGRESS_STORAGE_KEY);

    // Whatever the service worker does to its own caches, this key is not in
    // them, so nothing here changes.
    progressStore.refresh();

    expect(localStorage.getItem(PROGRESS_STORAGE_KEY)).toBe(before);
    expect(moduleProgress(progressStore.getSnapshot(), 'big-o').drills['sqrtx']).toBe(true);
  });
});
