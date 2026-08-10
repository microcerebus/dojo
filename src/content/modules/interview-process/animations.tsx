import { Bars, Readout, Stage, type BarSpec } from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. What an interviewer actually scores.                                   */
/* ------------------------------------------------------------------------ */

interface Axis {
  key: string;
  label: string;
  algorithm: number;
  design: number;
  detail: string;
}

const AXES: Axis[] = [
  {
    key: 'analytical',
    label: 'analysis',
    algorithm: 35,
    design: 40,
    detail:
      'How much help did you need? How optimal was the solution? How long did it take? Did you structure the problem and weigh the tradeoffs?',
  },
  {
    key: 'coding',
    label: 'coding',
    algorithm: 30,
    design: 10,
    detail:
      'Did the algorithm survive translation into code? Was it clean, organised and named? Did you think about error cases?',
  },
  {
    key: 'fundamentals',
    label: 'CS basics',
    algorithm: 15,
    design: 15,
    detail:
      'Do you have a foundation in data structures, complexity and the technologies the role depends on?',
  },
  {
    key: 'experience',
    label: 'experience',
    algorithm: 10,
    design: 25,
    detail:
      'Have you made good technical decisions before? Built anything hard? Shown drive and initiative?',
  },
  {
    key: 'communication',
    label: 'comms / fit',
    algorithm: 10,
    design: 10,
    detail:
      'Did you think out loud, take a hint well, and explain clearly? Would this team enjoy solving problems with you?',
  },
];

interface AxisFrame {
  focus: number | null;
  profile: 'algorithm' | 'design';
  caption: string;
  detail: string;
}

const axisFrames: AxisFrame[] = [
  {
    focus: null,
    profile: 'algorithm',
    caption:
      'There is no scoresheet with points on it. Your interviewer forms a judgement across five areas and writes it up - and the weighting shifts with the question, the role and the company.',
    detail: 'A number may get attached at the end, but it is a summary of a judgement, not the output of a formula.',
  },
  ...AXES.map((axis, i) => ({
    focus: i,
    profile: 'algorithm' as const,
    caption: `${axis.label}: ${axis.detail}`,
    detail: `weight in a standard algorithm round: roughly ${axis.algorithm}%`,
  })),
  {
    focus: null,
    profile: 'design' as const,
    caption:
      'Change the question and the weights move. A system design round leans on analysis and experience and barely looks at syntax - which is why an experienced candidate is judged differently, not more leniently.',
    detail: 'Same five axes, different mix. Ask the recruiter which kinds of round you will get.',
  },
  {
    focus: null,
    profile: 'algorithm' as const,
    caption:
      'And it is graded on a curve. Your interviewer compares you against everyone they have ever asked this question - so a hard question is not bad news, because it is hard for everyone.',
    detail: 'False negatives are a cost companies accept. False positives are the thing they are really guarding against.',
  },
];

function AxisFrame({ index }: { index: number }) {
  const frame = axisFrames[Math.max(0, Math.min(index, axisFrames.length - 1))];
  const bars: BarSpec[] = AXES.map((axis, i) => {
    const weight = frame.profile === 'design' ? axis.design : axis.algorithm;
    return {
      key: axis.key,
      label: axis.label,
      value: weight / 45,
      caption: `${weight}%`,
      state: frame.focus === i ? 'active' : frame.focus === null ? 'done' : 'muted',
    };
  });
  return (
    <Stage>
      <Bars bars={bars} />
      <Readout
        items={[
          {
            key: 'p',
            label: 'round type',
            value: frame.profile === 'design' ? 'system design' : 'algorithms',
          },
          {
            key: 'f',
            label: 'in focus',
            value: frame.focus === null ? 'all five' : AXES[frame.focus].label,
          },
        ]}
      />
    </Stage>
  );
}

export const evaluationAxes: AnimationSpec = fromFrames(
  {
    id: 'ip-axes',
    title: 'What is being scored',
    blurb: 'Five axes, weighted differently by round. Only two of them are about the answer.',
  },
  axisFrames,
  AxisFrame,
);

/* ------------------------------------------------------------------------ */
/* 2. Where the 45 minutes go.                                               */
/* ------------------------------------------------------------------------ */

const SLICES = [
  { key: 'intro', label: 'intro', minutes: 5, detail: 'Introductions and a behavioural question or two. Have your 90-second pitch ready so this costs you no thinking.' },
  { key: 'clarify', label: 'clarify', minutes: 5, detail: 'Restate the problem. Pin down input types, sizes, duplicates, sortedness, and what to return on empty. Every constraint you are given is a hint.' },
  { key: 'example', label: 'example', minutes: 3, detail: 'Draw one specific example, big enough to show a pattern and not accidentally a special case.' },
  { key: 'optimise', label: 'brute + optimise', minutes: 10, detail: 'State the brute force with its complexity, then improve it out loud. This is where the interview is won, and it is entirely verbal.' },
  { key: 'walk', label: 'walk through', minutes: 3, detail: 'Talk the whole algorithm through before typing. Fixing a design on a whiteboard is cheap; fixing half-written code is not.' },
  { key: 'code', label: 'code', minutes: 12, detail: 'Clean, modular, real names. Push details into helpers you define afterwards.' },
  { key: 'test', label: 'test', minutes: 5, detail: 'Conceptual read-through, then odd-looking lines, then a small case, then edge cases. Volunteer the complexity without being asked.' },
  { key: 'ask', label: 'your questions', minutes: 2, detail: 'Two or three specific questions, prepared in advance. They count.' },
];

const TOTAL = SLICES.reduce((sum, slice) => sum + slice.minutes, 0);

const timelineFrames = [
  {
    caption: `Forty-five minutes, and most candidates get through exactly one question. Here is roughly where the time should go - note that the first ${
      SLICES[0].minutes + SLICES[1].minutes + SLICES[2].minutes + SLICES[3].minutes
    } minutes contain no code at all.`,
    detail: `${TOTAL} minutes budgeted · coding is under a third of it`,
  },
  ...SLICES.map((slice) => ({
    caption: `${slice.label} (~${slice.minutes} min): ${slice.detail}`,
    detail: 'Silence is the single most common thing that sinks an otherwise strong candidate.',
  })),
  {
    caption:
      'The classic failure is spending two minutes on clarifying and thirty on debugging code built from the wrong algorithm. Time spent talking before you type is the cheapest time in the interview.',
    detail: 'Practise against a clock. The budget is a habit, not a plan you consult mid-interview.',
  },
];

function TimelineFrame({ index }: { index: number }) {
  const step = Math.max(0, Math.min(index, timelineFrames.length - 1));
  const focus = step - 1;
  const bars: BarSpec[] = SLICES.map((slice, i) => ({
    key: slice.key,
    label: slice.label,
    value: slice.minutes / 12,
    caption: `${slice.minutes}m`,
    state: focus === i ? 'active' : focus < 0 || focus >= SLICES.length ? 'done' : 'muted',
  }));
  return (
    <Stage>
      <Bars bars={bars} />
      <Readout
        items={[
          { key: 't', label: 'total', value: `${TOTAL} min` },
          {
            key: 'b',
            label: 'before any code',
            value: `${SLICES.slice(0, 5).reduce((sum, slice) => sum + slice.minutes, 0)} min`,
          },
        ]}
      />
    </Stage>
  );
}

export const interviewTimeline: AnimationSpec = fromFrames(
  {
    id: 'ip-timeline',
    title: 'Where the 45 minutes go',
    blurb: 'Over half the interview is over before you write a line of code. That is deliberate.',
  },
  timelineFrames,
  TimelineFrame,
);

export const interviewProcessAnimations: AnimationSpec[] = [evaluationAxes, interviewTimeline];
