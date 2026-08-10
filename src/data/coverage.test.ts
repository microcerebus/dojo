/**
 * Data-integrity tests. These are the guardrails that keep the Coverage Map,
 * COVERAGE.md and the module content from drifting apart as modules are filled
 * in over subsequent PRs.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { MODULES, getModule } from '../content';
import { TRACKS } from '../content/types';
import { BOOK_QUESTIONS } from './questions';
import { BLIND_75, PROBLEMS, getProblem } from './problems';
import { SPRINT_WEEKS } from './sprint';
import { ALL_ANIMATIONS, getAnimation } from '../anim/registry';

const CHAPTERS_WITH_QUESTIONS = [
  'Chapter 1. Arrays and Strings',
  'Chapter 2. Linked Lists',
  'Chapter 3. Stacks and Queues',
  'Chapter 4. Trees and Graphs',
  'Chapter 5. Bit Manipulation',
  'Chapter 6. Math and Logic Puzzles',
  'Chapter 7. Object-Oriented Design',
  'Chapter 8. Recursion and Dynamic Programming',
  'Chapter 9. System Design and Scalability',
  'Chapter 10. Sorting and Searching',
  'Chapter 11. Testing',
  'Chapter 12. C and C++',
  'Chapter 13. Java',
  'Chapter 14. Databases',
  'Chapter 15. Threads and Locks',
  'Chapter 16. Moderate',
  'Chapter 17. Hard',
];

/** The number of numbered questions in each chapter, per the book. */
const EXPECTED_PER_CHAPTER: Record<string, number> = {
  'Chapter 1. Arrays and Strings': 9,
  'Chapter 2. Linked Lists': 8,
  'Chapter 3. Stacks and Queues': 6,
  'Chapter 4. Trees and Graphs': 12,
  'Chapter 5. Bit Manipulation': 8,
  'Chapter 6. Math and Logic Puzzles': 10,
  'Chapter 7. Object-Oriented Design': 12,
  'Chapter 8. Recursion and Dynamic Programming': 14,
  'Chapter 9. System Design and Scalability': 8,
  'Chapter 10. Sorting and Searching': 11,
  'Chapter 11. Testing': 6,
  'Chapter 12. C and C++': 11,
  'Chapter 13. Java': 8,
  'Chapter 14. Databases': 7,
  'Chapter 15. Threads and Locks': 7,
  'Chapter 16. Moderate': 26,
  'Chapter 17. Hard': 26,
};

describe('book questions', () => {
  it('indexes all 189 numbered questions', () => {
    expect(BOOK_QUESTIONS).toHaveLength(189);
  });

  it('has no duplicate question ids', () => {
    const ids = BOOK_QUESTIONS.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has the right number of questions in every chapter', () => {
    for (const chapter of CHAPTERS_WITH_QUESTIONS) {
      const count = BOOK_QUESTIONS.filter((question) => question.chapter === chapter).length;
      expect(count, chapter).toBe(EXPECTED_PER_CHAPTER[chapter]);
    }
  });

  it('numbers each chapter contiguously from 1', () => {
    for (const chapter of CHAPTERS_WITH_QUESTIONS) {
      const numbers = BOOK_QUESTIONS.filter((q) => q.chapter === chapter)
        .map((q) => Number(q.id.split('.')[1]))
        .sort((a, b) => a - b);
      expect(numbers, chapter).toEqual(
        Array.from({ length: numbers.length }, (_, i) => i + 1),
      );
    }
  });

  it('maps every question to a module that exists', () => {
    for (const question of BOOK_QUESTIONS) {
      expect(getModule(question.moduleId), `${question.id} -> ${question.moduleId}`).toBeDefined();
    }
  });

  it('gives every question a non-empty gist and title', () => {
    for (const question of BOOK_QUESTIONS) {
      expect(question.title.length, question.id).toBeGreaterThan(0);
      expect(question.gist.length, question.id).toBeGreaterThan(10);
    }
  });

  it('gives every LeetCode mapping a slug and a title', () => {
    for (const question of BOOK_QUESTIONS) {
      if (!question.leetcode) continue;
      expect(question.leetcode.slug, question.id).toMatch(/^[a-z0-9-]+$/);
      expect(question.leetcode.title.length, question.id).toBeGreaterThan(0);
    }
  });
});

describe('Blind 75', () => {
  it('has exactly 75 problems', () => {
    expect(BLIND_75).toHaveLength(75);
  });

  it('assigns every Blind 75 problem to exactly one module', () => {
    const owners = new Map<string, string[]>();
    for (const courseModule of MODULES) {
      for (const drill of courseModule.drills) {
        const problem = getProblem(drill.slug);
        if (!problem?.blind75) continue;
        owners.set(drill.slug, [...(owners.get(drill.slug) ?? []), courseModule.id]);
      }
    }

    const unassigned = BLIND_75.filter((problem) => !owners.has(problem.slug)).map((p) => p.slug);
    expect(unassigned, 'Blind 75 problems not in any drill list').toEqual([]);

    const duplicated = [...owners.entries()]
      .filter(([, modules]) => modules.length > 1)
      .map(([slug, modules]) => `${slug}: ${modules.join(', ')}`);
    expect(duplicated, 'Blind 75 problems in more than one drill list').toEqual([]);
  });
});

describe('problem catalogue', () => {
  it('has no duplicate slugs', () => {
    const slugs = PROBLEMS.map((problem) => problem.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('uses url-safe slugs', () => {
    for (const problem of PROBLEMS) {
      expect(problem.slug, problem.title).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('contains every slug referenced by a drill list', () => {
    const missing: string[] = [];
    for (const courseModule of MODULES) {
      for (const drill of courseModule.drills) {
        if (!getProblem(drill.slug)) missing.push(`${courseModule.id}: ${drill.slug}`);
      }
    }
    expect(missing, 'drill slugs missing from src/data/problems.ts').toEqual([]);
  });

  it('has no catalogue entries that no module drills', () => {
    const used = new Set(MODULES.flatMap((m) => m.drills.map((d) => d.slug)));
    const orphans = PROBLEMS.filter((problem) => !used.has(problem.slug)).map((p) => p.slug);
    expect(orphans, 'catalogue entries not referenced by any module').toEqual([]);
  });
});

describe('modules', () => {
  it('has unique ids', () => {
    const ids = MODULES.map((courseModule) => courseModule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('puts every module in a known track', () => {
    const trackIds = new Set(TRACKS.map((track) => track.id));
    for (const courseModule of MODULES) {
      expect(trackIds.has(courseModule.track), courseModule.id).toBe(true);
    }
  });

  it('gives every module something to practise', () => {
    for (const courseModule of MODULES) {
      const total = courseModule.drills.length + (courseModule.practice?.length ?? 0);
      expect(total, `${courseModule.id} has no drills and no practice tasks`).toBeGreaterThan(0);
    }
  });

  it('gives every module a summary and at least one concept', () => {
    for (const courseModule of MODULES) {
      expect(courseModule.summary.length, courseModule.id).toBeGreaterThan(20);
      expect(courseModule.concepts.length, courseModule.id).toBeGreaterThan(0);
    }
  });

  it('has no duplicate drill slugs within a module', () => {
    for (const courseModule of MODULES) {
      const slugs = courseModule.drills.map((drill) => drill.slug);
      expect(new Set(slugs).size, courseModule.id).toBe(slugs.length);
    }
  });

  it('covers every chapter of the book with at least one module', () => {
    const sources = new Set(MODULES.map((courseModule) => courseModule.source));
    const required = [
      'Part I',
      'Part II',
      'Part III',
      'Part IV',
      'Part V',
      'Part VI',
      'Part VII',
      'Part VIII',
      'Part XI',
      ...Array.from({ length: 17 }, (_, i) => `Chapter ${i + 1}`),
    ];
    for (const chapter of required) {
      const covered = [...sources].some((source) => source.startsWith(chapter));
      expect(covered, `no module sourced from ${chapter}`).toBe(true);
    }
  });
});

describe('complete modules', () => {
  const complete = MODULES.filter((courseModule) => courseModule.status === 'complete');

  /**
   * Modules are finished in waves, so listing the finished ones here would have
   * to be edited by every branch that finishes another. Instead of a list, this
   * holds `status: 'complete'` to its full meaning, which is strictly stronger:
   * a module cannot claim to be complete unless it really is, whatever order the
   * branches land in. "Every week 1-2 module is complete" is separately asserted
   * from the sprint data, so nothing that is finished can quietly regress.
   */
  it('holds every complete module to the full completeness bar', () => {
    for (const courseModule of complete) {
      const where = courseModule.id;
      expect(courseModule.sections.length, `${where}: no lesson sections`).toBeGreaterThan(0);
      expect(courseModule.quiz.length, `${where}: quiz too short`).toBeGreaterThanOrEqual(5);
      expect(courseModule.quiz.length, `${where}: quiz too long`).toBeLessThanOrEqual(10);

      // Drills for the problem-solving modules, practice tasks for the process
      // ones - `PracticeTask` exists precisely because drilling LeetCode is not
      // how you rehearse a behavioural answer. Either satisfies the bar; neither
      // does not.
      expect(
        courseModule.drills.length + (courseModule.practice?.length ?? 0),
        `${where}: nothing to practise`,
      ).toBeGreaterThan(0);

      const animations = courseModule.sections
        .flatMap((section) => section.blocks)
        .filter((block) => block.kind === 'anim');
      expect(animations.length, `${where}: no animations`).toBeGreaterThan(0);

      expect(
        courseModule.plannedAnimations ?? [],
        `${where}: plannedAnimations is for outlines - the animations should exist`,
      ).toEqual([]);

      for (const section of courseModule.sections) {
        expect(section.audio, `${where}/${section.id}: section is not narrated`).toBe(true);
        const script = join('src', 'content', 'narration', where, `${section.id}.txt`);
        const clip = join('public', 'audio', where, `${section.id}.mp3`);
        expect(existsSync(join(process.cwd(), script)), `missing ${script}`).toBe(true);
        expect(existsSync(join(process.cwd(), clip)), `missing ${clip}`).toBe(true);
      }
    }
  });

  it('gives every section an id, a takeaway and content', () => {
    for (const courseModule of complete) {
      const ids = courseModule.sections.map((section) => section.id);
      expect(new Set(ids).size, `${courseModule.id} duplicate section ids`).toBe(ids.length);
      for (const section of courseModule.sections) {
        expect(section.title.length, section.id).toBeGreaterThan(0);
        expect(section.takeaway.length, section.id).toBeGreaterThan(0);
        expect(section.blocks.length, section.id).toBeGreaterThan(0);
      }
    }
  });

  it('references only animations that exist in the registry', () => {
    for (const courseModule of MODULES) {
      for (const section of courseModule.sections) {
        for (const block of section.blocks) {
          if (block.kind !== 'anim') continue;
          expect(getAnimation(block.animId), `${courseModule.id}/${block.animId}`).toBeDefined();
        }
      }
    }
  });

  it('has a valid quiz answer index and an explanation for every question', () => {
    for (const courseModule of MODULES) {
      for (const question of courseModule.quiz) {
        expect(question.options.length, question.id).toBeGreaterThanOrEqual(2);
        expect(question.answerIndex, question.id).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex, question.id).toBeLessThan(question.options.length);
        expect(question.explain.length, question.id).toBeGreaterThan(10);
      }
    }
  });

  it('has unique quiz question ids across the whole course', () => {
    const ids = MODULES.flatMap((courseModule) => courseModule.quiz.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('mixes quiz kinds in each complete module', () => {
    for (const courseModule of complete) {
      const kinds = new Set(courseModule.quiz.map((question) => question.kind));
      expect(kinds.size, `${courseModule.id} should mix concept/complexity/technique`).toBeGreaterThan(
        1,
      );
    }
  });
});

describe('outline modules', () => {
  const outlines = MODULES.filter((courseModule) => courseModule.status === 'outline');

  it('lists the concepts the finished lesson must cover', () => {
    for (const courseModule of outlines) {
      expect(courseModule.concepts.length, courseModule.id).toBeGreaterThanOrEqual(8);
    }
  });

  it('has no half-written lessons', () => {
    for (const courseModule of outlines) {
      expect(courseModule.sections, courseModule.id).toEqual([]);
    }
  });
});

describe('animations', () => {
  it('has unique ids', () => {
    const ids = ALL_ANIMATIONS.map((spec) => spec.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has at least two steps and a caption for every step', () => {
    for (const spec of ALL_ANIMATIONS) {
      expect(spec.length, spec.id).toBeGreaterThan(1);
      for (let i = 0; i < spec.length; i++) {
        expect(spec.caption(i).length, `${spec.id} step ${i}`).toBeGreaterThan(10);
      }
    }
  });

  it('keeps markdown out of captions, blurbs and details', () => {
    // The player renders these as plain text (`anim__captionText`), unlike
    // lesson blocks which go through `RichText` - so `**bold**` and `code`
    // ticks would show up literally on screen.
    const offenders: string[] = [];
    for (const spec of ALL_ANIMATIONS) {
      const strings: [string, string][] = [
        ['title', spec.title],
        ['blurb', spec.blurb],
      ];
      for (let i = 0; i < spec.length; i++) {
        strings.push([`caption ${i}`, spec.caption(i)]);
        const detail = spec.detail?.(i);
        if (detail) strings.push([`detail ${i}`, detail]);
      }
      for (const [where, text] of strings) {
        if (/\*\*|`/.test(text)) offenders.push(`${spec.id} ${where}`);
      }
    }
    expect(offenders, 'animation text is rendered literally - no markdown').toEqual([]);
  });

  it('clamps captions for out-of-range indices', () => {
    for (const spec of ALL_ANIMATIONS) {
      expect(spec.caption(-5)).toBe(spec.caption(0));
      expect(spec.caption(spec.length + 10)).toBe(spec.caption(spec.length - 1));
    }
  });

  it('is referenced by a lesson', () => {
    const referenced = new Set(
      MODULES.flatMap((courseModule) =>
        courseModule.sections
          .flatMap((section) => section.blocks)
          .flatMap((block) => (block.kind === 'anim' ? [block.animId] : [])),
      ),
    );
    const orphans = ALL_ANIMATIONS.filter((spec) => !referenced.has(spec.id)).map((s) => s.id);
    expect(orphans, 'animations not used by any lesson').toEqual([]);
  });
});

describe('sprint schedule', () => {
  it('references modules that exist', () => {
    for (const week of SPRINT_WEEKS) {
      for (const id of week.moduleIds) {
        expect(getModule(id), `${week.id} -> ${id}`).toBeDefined();
      }
    }
  });

  it('runs contiguously from Aug 11 to Sep 14', () => {
    expect(SPRINT_WEEKS[0].start).toBe('2026-08-11');
    expect(SPRINT_WEEKS[SPRINT_WEEKS.length - 1].end).toBe('2026-09-14');
    for (let i = 1; i < SPRINT_WEEKS.length; i++) {
      const previousEnd = new Date(`${SPRINT_WEEKS[i - 1].end}T00:00:00Z`);
      const start = new Date(`${SPRINT_WEEKS[i].start}T00:00:00Z`);
      expect((start.getTime() - previousEnd.getTime()) / 86_400_000, SPRINT_WEEKS[i].id).toBe(1);
    }
  });

  it('schedules every week-1 and week-2 module as a complete module', () => {
    const firstTwo = new Set([...SPRINT_WEEKS[0].moduleIds, ...SPRINT_WEEKS[1].moduleIds]);
    for (const id of firstTwo) {
      expect(getModule(id)?.status, id).toBe('complete');
    }
  });
});

describe('COVERAGE.md', () => {
  const coverage = readFileSync(join(process.cwd(), 'COVERAGE.md'), 'utf8');

  it('lists every module id', () => {
    for (const courseModule of MODULES) {
      expect(coverage, `COVERAGE.md is missing ${courseModule.id}`).toContain(courseModule.id);
    }
  });

  it('states the correct status for every module', () => {
    for (const courseModule of MODULES) {
      // Each module has a table row of the form `| ... | \`id\` | ... | status |`
      const row = coverage
        .split('\n')
        .find((line) => line.includes(`\`${courseModule.id}\``) && line.startsWith('|'));
      expect(row, `no COVERAGE.md row for ${courseModule.id}`).toBeDefined();
      const expected = courseModule.status === 'complete' ? 'Complete' : 'Outline';
      expect(row, `${courseModule.id} status`).toContain(expected);
    }
  });

  it('records the same question and Blind 75 totals as the data', () => {
    expect(coverage).toContain(`${BOOK_QUESTIONS.length} questions`);
    expect(coverage).toContain(`${BLIND_75.length} of 75`);
  });
});
