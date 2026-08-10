import { beforeEach, describe, expect, it } from 'vitest';
import {
  PROGRESS_STORAGE_KEY,
  emptyProgress,
  moduleCompletion,
  moduleProgress,
  parseProgress,
  recordQuizResult,
  resetModule,
  setSectionRead,
  toggleDrill,
} from './progress';
import { progressStore } from './store';

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

describe('persistence across a reload', () => {
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

  it('survives corrupt storage without throwing', () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, '{ this is not json');
    expect(() => progressStore.refresh()).not.toThrow();
    expect(progressStore.getSnapshot()).toEqual(emptyProgress());
  });
});
