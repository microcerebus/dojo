import {
  Caption,
  FlowSteps,
  Matrix,
  Readout,
  Stage,
  type CellSpec,
  type FlowStepSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. Turning a duty into an accomplishment.                                 */
/* ------------------------------------------------------------------------ */

const BULLET_STEPS: { label: string; badge: string; detail: string; bullet: string }[] = [
  {
    label: 'The duty',
    badge: 'weak',
    detail:
      'It describes a job description, not a person. Everyone on that team could have written it, and it gives a screener nothing to react to.',
    bullet: 'Worked on the product search feature.',
  },
  {
    label: 'Add the accomplishment (X)',
    badge: 'better',
    detail:
      'Lead with what changed because of you. "Worked on" becomes a verb with an object - and now the sentence makes a claim you can be asked about.',
    bullet: 'Rebuilt product search.',
  },
  {
    label: 'Add the method (Y)',
    badge: 'better still',
    detail:
      'How you did it is where the technical substance lives, and it is what invites the follow-up question you actually want to be asked.',
    bullet: 'Rebuilt product search on an inverted index, replacing a linear scan.',
  },
  {
    label: 'Add the measured result (Z)',
    badge: 'strong',
    detail:
      'A number turns a claim into evidence. If you have no number, use a proportion, a rank, a scale - anything that is not an adjective.',
    bullet:
      'Cut search latency from 900ms to 120ms by rebuilding product search on an inverted index, lifting search-led purchases 18%.',
  },
  {
    label: 'Now defend it',
    badge: 'the test',
    detail:
      'Every line on a resume is an invitation to be questioned. Why an inverted index? What did you measure, and over what period? What broke? If you cannot talk for five minutes, cut the line.',
    bullet:
      'Cut search latency from 900ms to 120ms by rebuilding product search on an inverted index, lifting search-led purchases 18%.',
  },
];

const bulletFrames = BULLET_STEPS.map((step) => ({
  caption: `"${step.bullet}"`,
  detail: step.detail,
}));

function BulletFrame({ index }: { index: number }) {
  const step = Math.max(0, Math.min(index, BULLET_STEPS.length - 1));
  const steps: FlowStepSpec[] = BULLET_STEPS.map((item, i) => ({
    key: item.label,
    label: item.label,
    badge: item.badge,
    ...(i === step ? { detail: item.bullet } : {}),
    state: i === step ? 'active' : i < step ? 'done' : 'muted',
  }));
  return (
    <Stage>
      <FlowSteps steps={steps} />
      <Caption>accomplished X, by doing Y, producing measurable result Z</Caption>
    </Stage>
  );
}

export const resumeBullet: AnimationSpec = fromFrames(
  {
    id: 'bti-bullet',
    title: 'Rewriting a resume bullet',
    blurb: 'From a duty anyone could claim to a measured accomplishment only you can.',
  },
  bulletFrames,
  BulletFrame,
);

/* ------------------------------------------------------------------------ */
/* 2. Spacing the topics across the sprint.                                  */
/* ------------------------------------------------------------------------ */

const TOPICS = [
  'Big O and the method',
  'Arrays, strings, hash maps',
  'Lists, stacks, queues, trees',
  'Recursion and DP',
  'Sorting, searching, bits',
  'Design and behavioural',
];

/** 0 = untouched, 1 = first pass, 2 = revisit. */
const PLAN: number[][] = [
  [1, 0, 2, 0, 2],
  [1, 2, 0, 2, 0],
  [0, 1, 2, 0, 2],
  [0, 0, 1, 2, 2],
  [0, 0, 0, 1, 2],
  [0, 0, 0, 0, 1],
];

interface WeekFrame {
  week: number;
  caption: string;
  detail: string;
}

const WEEK_NOTES = [
  'Week 1 - the foundations, and the topics everything else is built on. Two topics, no more: learning three at once means learning none.',
  "Week 2 - the next layer starts, and week 1's first topic comes back. The revisit is short: re-solve two problems and reread your mistake list, not the whole chapter.",
  'Week 3 - the hardest new material lands while the earlier topics get their second pass. This is the week that decides whether week 1 stuck.',
  'Week 4 - the last new algorithm topics, plus revisits of everything before them. Mock interviews start now, not in the final week.',
  'Week 5 - design and behavioural, which need rehearsal rather than practice, plus a light revisit of everything. No new material this week.',
];

const scheduleFrames: WeekFrame[] = [
  {
    week: 0,
    caption:
      'A five-week plan is not five weeks of new topics. Topics down the side, weeks across the top - and every topic comes back at least once after you first learn it.',
    detail: '★ first pass · ↻ revisit',
  },
  ...WEEK_NOTES.map((note, i) => ({
    week: i + 1,
    caption: note,
    detail: `week ${i + 1} of 5 · new topics: ${PLAN.filter((row) => row[i] === 1).length} · revisits: ${
      PLAN.filter((row) => row[i] === 2).length
    }`,
  })),
  {
    week: 5,
    caption:
      'Deliberate practice, not volume. Fifteen problems worked end to end - clarify, brute force, optimise, code, test, out loud - beat a hundred solutions you read.',
    detail:
      'Block the hours in a calendar today. Unscheduled preparation does not happen, and week 5 cannot absorb what weeks 1 to 4 skipped.',
  },
];

function ScheduleFrame({ index }: { index: number }) {
  const frame = scheduleFrames[Math.max(0, Math.min(index, scheduleFrames.length - 1))];
  const rows: CellSpec[][] = PLAN.map((topic, row) =>
    topic.map((value, col) => ({
      key: `${row}-${col}`,
      label: col < frame.week ? (value === 1 ? '★' : value === 2 ? '↻' : '·') : '',
      state:
        col === frame.week - 1 && value !== 0
          ? ('active' as const)
          : col < frame.week && value === 1
            ? ('target' as const)
            : col < frame.week && value === 2
              ? ('done' as const)
              : ('idle' as const),
    })),
  );
  const current =
    frame.week === 0
      ? []
      : PLAN.map((row, i) => (row[frame.week - 1] !== 0 ? TOPICS[i] : '')).filter(Boolean);
  return (
    <Stage tall>
      <Matrix rows={rows} colLabels={['1', '2', '3', '4', '5']} />
      <Caption>rows, top to bottom: {TOPICS.join(' · ')}</Caption>
      <Readout
        items={[
          { key: 'w', label: 'week', value: frame.week === 0 ? '-' : String(frame.week) },
          { key: 't', label: 'in play', value: current.length === 0 ? '-' : current.join(', ') },
        ]}
      />
    </Stage>
  );
}

export const spacedSchedule: AnimationSpec = fromFrames(
  {
    id: 'bti-schedule',
    title: 'Spacing the topics',
    blurb: 'Every topic comes back after you first learn it. That second pass is where it sticks.',
  },
  scheduleFrames,
  ScheduleFrame,
);

export const beforeTheInterviewAnimations: AnimationSpec[] = [resumeBullet, spacedSchedule];
