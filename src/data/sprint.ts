/**
 * The five-week sprint. Dates are the captain's schedule, ending a day before
 * the Sep 15 target so there is a buffer.
 */

export interface SprintWeek {
  id: string;
  label: string;
  /** ISO dates, inclusive. */
  start: string;
  end: string;
  dateLabel: string;
  focus: string;
  moduleIds: string[];
  /** What "done" looks like at the end of this week. */
  goal: string;
}

export const SPRINT_WEEKS: SprintWeek[] = [
  {
    id: 'week-1',
    label: 'Week 1',
    start: '2026-08-11',
    end: '2026-08-17',
    dateLabel: 'Aug 11 - 17',
    focus: 'Foundations and the method',
    moduleIds: ['big-o', 'technical-questions', 'arrays-strings', 'linked-lists'],
    goal: 'Analyse any snippet without hesitating, and run the seven-step loop out loud on every problem.',
  },
  {
    id: 'week-2',
    label: 'Week 2',
    start: '2026-08-18',
    end: '2026-08-24',
    dateLabel: 'Aug 18 - 24',
    focus: 'Linear structures, then into trees',
    moduleIds: ['linked-lists', 'stacks-queues', 'trees-graphs'],
    goal: 'Finish the linked-list drills, own the stack patterns, and be comfortable with the three traversals.',
  },
  {
    id: 'week-3',
    label: 'Week 3',
    start: '2026-08-25',
    end: '2026-08-31',
    dateLabel: 'Aug 25 - 31',
    focus: 'Trees, graphs, heaps and tries',
    moduleIds: ['trees-graphs', 'heaps-tries'],
    goal: 'BFS vs DFS chosen deliberately every time; top-k and prefix problems recognised on sight.',
  },
  {
    id: 'week-4',
    label: 'Week 4',
    start: '2026-09-01',
    end: '2026-09-07',
    dateLabel: 'Sep 1 - 7',
    focus: 'Recursion, DP, sorting and searching',
    moduleIds: ['recursion-dp', 'sorting-searching'],
    goal: 'Write the recurrence before the code, and get binary search right with no off-by-one.',
  },
  {
    id: 'week-5',
    label: 'Week 5',
    start: '2026-09-08',
    end: '2026-09-14',
    dateLabel: 'Sep 8 - 14',
    focus: 'Mixed review, bits, and mocks',
    moduleIds: ['moderate', 'hard', 'bit-manipulation'],
    goal: 'Unlabelled problems, timed. Two full mock interviews. Revisit whatever the quizzes say is weak.',
  },
];

/** Modules that are not tied to a week - do these alongside, or when relevant. */
export const UNSCHEDULED_NOTE =
  'Process and reference modules float: read the process ones early (they change how you practise), and skim the reference ones only if a target role asks for them.';

/**
 * Local calendar date as `YYYY-MM-DD`.
 *
 * Deliberately not `toISOString()`: that converts to UTC first, so anywhere
 * east of Greenwich an early-morning "today" reports as yesterday - which would
 * silently fail to highlight the current week.
 */
export function localIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function weekForDate(date: Date): SprintWeek | undefined {
  const today = localIsoDate(date);
  return SPRINT_WEEKS.find((week) => today >= week.start && today <= week.end);
}

export const SCHEDULED_MODULE_IDS = new Set(SPRINT_WEEKS.flatMap((week) => week.moduleIds));
