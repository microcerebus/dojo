/**
 * Progress state: pure data and pure transitions, so it is trivially testable
 * and the React layer stays a thin wrapper (see `store.ts`).
 */
import type { CourseModule } from '../content/types';

export const PROGRESS_STORAGE_KEY = 'dojo.progress.v1';

export interface QuizResult {
  correct: number;
  total: number;
  /** epoch ms */
  at: number;
}

export interface ModuleProgress {
  /** ids of lesson sections marked read */
  readSections: string[];
  /** best attempt so far */
  quizBest: QuizResult | null;
  /** problem slug -> done */
  drills: Record<string, boolean>;
}

export interface ProgressState {
  version: 1;
  modules: Record<string, ModuleProgress>;
}

export const emptyModuleProgress = (): ModuleProgress => ({
  readSections: [],
  quizBest: null,
  drills: {},
});

export const emptyProgress = (): ProgressState => ({ version: 1, modules: {} });

export function moduleProgress(state: ProgressState, moduleId: string): ModuleProgress {
  return state.modules[moduleId] ?? emptyModuleProgress();
}

function withModule(
  state: ProgressState,
  moduleId: string,
  update: (current: ModuleProgress) => ModuleProgress,
): ProgressState {
  const current = moduleProgress(state, moduleId);
  const next = update(current);
  // Identity is preserved when nothing changed, so `useSyncExternalStore`
  // subscribers do not re-render on a no-op write.
  if (next === current && state.modules[moduleId]) return state;
  return { ...state, modules: { ...state.modules, [moduleId]: next } };
}

export function setSectionRead(
  state: ProgressState,
  moduleId: string,
  sectionId: string,
  read: boolean,
): ProgressState {
  return withModule(state, moduleId, (current) => {
    const has = current.readSections.includes(sectionId);
    if (has === read) return current;
    return {
      ...current,
      readSections: read
        ? [...current.readSections, sectionId]
        : current.readSections.filter((id) => id !== sectionId),
    };
  });
}

export function toggleDrill(
  state: ProgressState,
  moduleId: string,
  slug: string,
): ProgressState {
  return withModule(state, moduleId, (current) => ({
    ...current,
    drills: { ...current.drills, [slug]: !current.drills[slug] },
  }));
}

/** Keeps the best score; ties are replaced so `at` reflects the latest attempt. */
export function recordQuizResult(
  state: ProgressState,
  moduleId: string,
  result: QuizResult,
): ProgressState {
  return withModule(state, moduleId, (current) => {
    const best = current.quizBest;
    if (best && best.correct > result.correct) return current;
    return { ...current, quizBest: result };
  });
}

export function resetModule(state: ProgressState, moduleId: string): ProgressState {
  return withModule(state, moduleId, emptyModuleProgress);
}

/** 0..1 for each dimension shown on the progress ring. */
export interface ModuleCompletion {
  lesson: number;
  quiz: number;
  drills: number;
  /** Equal-weight average of the three dimensions. */
  overall: number;
  started: boolean;
}

export function moduleCompletion(
  courseModule: Pick<CourseModule, 'sections' | 'quiz' | 'drills'>,
  progress: ModuleProgress,
): ModuleCompletion {
  const sectionIds = new Set(courseModule.sections.map((section) => section.id));
  const read = progress.readSections.filter((id) => sectionIds.has(id)).length;
  const lesson = sectionIds.size === 0 ? 0 : read / sectionIds.size;

  const quiz =
    courseModule.quiz.length === 0 || !progress.quizBest
      ? 0
      : progress.quizBest.correct / progress.quizBest.total;

  const drillSlugs = courseModule.drills.map((drill) => drill.slug);
  const doneDrills = drillSlugs.filter((slug) => progress.drills[slug]).length;
  const drills = drillSlugs.length === 0 ? 0 : doneDrills / drillSlugs.length;

  // Dimensions a module does not have (e.g. an outline module has no sections)
  // are excluded rather than counted as zero, so the ring stays honest.
  const parts: number[] = [];
  if (sectionIds.size > 0) parts.push(lesson);
  if (courseModule.quiz.length > 0) parts.push(quiz);
  if (drillSlugs.length > 0) parts.push(drills);
  const overall = parts.length === 0 ? 0 : parts.reduce((a, b) => a + b, 0) / parts.length;

  return {
    lesson,
    quiz,
    drills,
    overall,
    started: read > 0 || doneDrills > 0 || progress.quizBest !== null,
  };
}

/**
 * The counts behind a module's study progress - what the coverage page shows
 * instead of the content-authoring `status`. Authoring status ("Complete" /
 * "Outline") describes whether the lesson has been written; this describes
 * whether the reader has actually studied it, which is a different axis and
 * starts at zero for every module regardless of how finished its content is.
 */
export interface ModuleStudySummary {
  started: boolean;
  lessonRead: number;
  lessonTotal: number;
  quizBest: QuizResult | null;
  drillsDone: number;
  drillsTotal: number;
}

export function moduleStudySummary(
  courseModule: Pick<CourseModule, 'sections' | 'quiz' | 'drills'>,
  progress: ModuleProgress,
): ModuleStudySummary {
  const sectionIds = new Set(courseModule.sections.map((section) => section.id));
  const lessonRead = progress.readSections.filter((id) => sectionIds.has(id)).length;
  const drillSlugs = courseModule.drills.map((drill) => drill.slug);
  const drillsDone = drillSlugs.filter((slug) => progress.drills[slug]).length;

  return {
    lessonRead,
    lessonTotal: sectionIds.size,
    quizBest: progress.quizBest,
    drillsDone,
    drillsTotal: drillSlugs.length,
    started: lessonRead > 0 || drillsDone > 0 || progress.quizBest !== null,
  };
}

/**
 * The compact string the coverage page shows per module, e.g.
 * "3/12 drills · quiz 80%" - only the dimensions the module actually has are
 * included, and an untouched module reads plainly as "Not started" rather
 * than a row of zeroes.
 */
export function formatStudySummary(summary: ModuleStudySummary): string {
  if (!summary.started) return 'Not started';

  const parts: string[] = [];
  if (summary.lessonTotal > 0) {
    parts.push(`${summary.lessonRead}/${summary.lessonTotal} sections`);
  }
  if (summary.quizBest) {
    const pct = Math.round((summary.quizBest.correct / summary.quizBest.total) * 100);
    parts.push(`quiz ${pct}%`);
  }
  if (summary.drillsTotal > 0) {
    parts.push(`${summary.drillsDone}/${summary.drillsTotal} drills`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Not started';
}

/* ------------------------------------------------------------------ merge */

/** The better of two attempts; ties go to the later one. */
function betterQuiz(a: QuizResult | null, b: QuizResult | null): QuizResult | null {
  if (!a) return b;
  if (!b) return a;
  if (a.correct !== b.correct) return a.correct > b.correct ? a : b;
  return a.at >= b.at ? a : b;
}

export function mergeModuleProgress(
  stored: ModuleProgress,
  next: ModuleProgress,
): ModuleProgress {
  return {
    // Sections are read-only-once in practice: the app never un-marks one, so
    // union is exactly right and can never lose a read.
    readSections: [...new Set([...stored.readSections, ...next.readSections])],

    // "Best" is monotone by definition, so take the higher score and the later
    // timestamp on a tie.
    quizBest: betterQuiz(stored.quizBest, next.quizBest),

    // Entry-wise. `next` was derived from a read of this same document, so
    // where it has an opinion it is the newer one - including an explicit
    // `false` from un-ticking a drill. Slugs only `stored` knows about were
    // written by another context after our read, so they survive untouched.
    drills: { ...stored.drills, ...next.drills },
  };
}

/**
 * Merge two whole documents entry by entry.
 *
 * Progress is stored under a single key, so any write is a whole-document
 * write and would otherwise be last-writer-wins for everything. Merging per
 * entry makes concurrent writers conflict-free by construction: two contexts
 * touching different drills, sections or modules both keep their work,
 * regardless of how their reads and writes interleave.
 */
export function mergeProgress(stored: ProgressState, next: ProgressState): ProgressState {
  const modules: Record<string, ModuleProgress> = { ...stored.modules };
  for (const [id, nextModule] of Object.entries(next.modules)) {
    const storedModule = stored.modules[id];
    modules[id] = storedModule ? mergeModuleProgress(storedModule, nextModule) : nextModule;
  }
  return { version: 1, modules };
}

/** Narrow an unknown parsed value back to `ProgressState`, dropping junk. */
export function parseProgress(raw: unknown): ProgressState {
  if (typeof raw !== 'object' || raw === null) return emptyProgress();
  const candidate = raw as Partial<ProgressState>;
  if (candidate.version !== 1 || typeof candidate.modules !== 'object' || !candidate.modules) {
    return emptyProgress();
  }
  const modules: Record<string, ModuleProgress> = {};
  for (const [id, value] of Object.entries(candidate.modules)) {
    if (typeof value !== 'object' || value === null) continue;
    const entry = value as Partial<ModuleProgress>;
    modules[id] = {
      readSections: Array.isArray(entry.readSections)
        ? entry.readSections.filter((s): s is string => typeof s === 'string')
        : [],
      quizBest:
        entry.quizBest &&
        typeof entry.quizBest.correct === 'number' &&
        typeof entry.quizBest.total === 'number'
          ? {
              correct: entry.quizBest.correct,
              total: entry.quizBest.total,
              at: typeof entry.quizBest.at === 'number' ? entry.quizBest.at : 0,
            }
          : null,
      drills:
        typeof entry.drills === 'object' && entry.drills !== null
          ? Object.fromEntries(
              Object.entries(entry.drills).filter(([, v]) => typeof v === 'boolean'),
            )
          : {},
    };
  }
  return { version: 1, modules };
}
