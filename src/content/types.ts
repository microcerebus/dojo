/**
 * The content schema. Every module is a plain typed TS object in
 * `src/content/modules/<id>/`, so adding a module is a data change plus (for a
 * fully written module) its animations and narration scripts.
 */

export type Track = 'core' | 'techniques' | 'system-design' | 'process' | 'reference';

export const TRACKS: { id: Track; label: string; blurb: string }[] = [
  {
    id: 'core',
    label: 'Core DSA',
    blurb: 'The data structures interviewers actually reach for.',
  },
  {
    id: 'techniques',
    label: 'Techniques',
    blurb: 'How to analyse, attack and recognise problems.',
  },
  {
    id: 'system-design',
    label: 'Design',
    blurb: 'Open-ended object and system design conversations.',
  },
  {
    id: 'process',
    label: 'Process',
    blurb: 'Everything around the whiteboard: prep, behavioural, offers.',
  },
  {
    id: 'reference',
    label: 'Reference',
    blurb: 'Language and platform chapters to skim, not grind.',
  },
];

/** `complete` modules have lesson prose, animations, audio and a quiz. */
export type ModuleStatus = 'complete' | 'outline';

export type CodeLang = 'ts' | 'js' | 'java' | 'cpp' | 'sql' | 'text';

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'steps'; items: string[] }
  | { kind: 'code'; lang: CodeLang; code: string; caption?: string }
  | { kind: 'callout'; tone: 'key' | 'tip' | 'warn'; title: string; text: string }
  | { kind: 'table'; headers: string[]; rows: string[][]; caption?: string }
  | { kind: 'anim'; animId: string };

export interface LessonSection {
  id: string;
  title: string;
  /** One-line "what you get out of this section", shown in the section rail. */
  takeaway: string;
  blocks: Block[];
  /**
   * When true a narration script must exist at
   * `src/content/narration/<moduleId>/<sectionId>.txt` and the generated clip at
   * `public/audio/<moduleId>/<sectionId>.mp3`.
   */
  audio?: boolean;
}

export type QuizKind = 'concept' | 'complexity' | 'technique';

export interface QuizQuestion {
  id: string;
  kind: QuizKind;
  prompt: string;
  /** Optional short code/context snippet shown above the options. */
  context?: string;
  options: string[];
  answerIndex: number;
  /** One line, shown immediately after answering. */
  explain: string;
}

/** A module's drill entry. Problem metadata lives in `src/data/problems.ts`. */
export interface DrillRef {
  slug: string;
  /** Why this problem is here / what to watch for. */
  note?: string;
}

/**
 * A non-LeetCode practice task. Process modules (behavioural, negotiation,
 * before-the-interview) are practised by doing something, not by solving a
 * problem, and their "drill list" is these instead.
 */
export interface PracticeTask {
  id: string;
  title: string;
  detail: string;
}

/**
 * A link to a live VisuAlgo (https://visualgo.net) visualizer, LINKS ONLY -
 * VisuAlgo's visualizations are copyrighted educational material, not
 * licensed for copying or embedding. `url` must match a `VISUALGO_CATALOG`
 * entry in `src/data/visualgo.ts`; `note` is the one-line prompt for what to
 * try there.
 */
export interface VisualizerLink {
  url: string;
  note: string;
}

export interface CourseModule {
  id: string;
  title: string;
  track: Track;
  status: ModuleStatus;
  /** Where this comes from in the book, e.g. "Chapter 1" or "Part VI". */
  source: string;
  /** One sentence for the module card. */
  summary: string;
  estimatedMinutes: number;
  /** Every concept the source chapter covers - listed even for outline modules. */
  concepts: string[];
  sections: LessonSection[];
  quiz: QuizQuestion[];
  drills: DrillRef[];
  /** Non-LeetCode practice, for modules where drilling problems is not the point. */
  practice?: PracticeTask[];
  /** Live VisuAlgo visualizers relevant to this module, shown as "Visualize it live". */
  visualizers?: VisualizerLink[];
  /** For outline modules: what the finished lesson will animate. */
  plannedAnimations?: string[];
}
