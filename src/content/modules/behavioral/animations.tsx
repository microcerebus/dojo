import {
  Bars,
  Caption,
  Matrix,
  Readout,
  Stage,
  type BarSpec,
  type CellSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. The story grid.                                                        */
/* ------------------------------------------------------------------------ */

const THEMES = [
  { key: 'C', label: 'challenge' },
  { key: 'F', label: 'failure' },
  { key: 'E', label: 'enjoyed' },
  { key: 'L', label: 'leadership' },
  { key: 'X', label: 'conflict' },
  { key: 'D', label: 'do differently' },
];

const PROJECTS: { name: string; cells: string[] }[] = [
  {
    name: 'Search rewrite',
    cells: ['●', '·', '●', '●', '·', '●'],
    // challenge, failure, enjoyed, leadership, conflict, differently
  },
  {
    name: 'Payments migration',
    cells: ['●', '●', '·', '●', '●', '●'],
  },
  {
    name: 'Mobile app launch',
    cells: ['●', '·', '●', '·', '·', '●'],
  },
  {
    name: 'On-call overhaul',
    cells: ['·', '●', '●', '●', '●', '●'],
  },
  {
    name: 'Open-source library',
    cells: ['●', '●', '●', '·', '·', '●'],
  },
];

interface GridFrame {
  rows: number;
  project: number | null;
  highlightColumn: number | null;
  caption: string;
  detail: string;
}

const gridFrames: GridFrame[] = [
  {
    rows: 0,
    project: null,
    highlightColumn: null,
    caption:
      'Build the grid once and every behavioural question becomes a lookup. Your projects and jobs down one side, the questions that keep coming back across the top.',
    detail:
      'Reduce each cell to two or three keywords. You want to recall a story, not read a script.',
  },
  ...PROJECTS.map((project, i) => ({
    rows: i + 1,
    project: i,
    highlightColumn: null,
    caption: `${project.name}: covers ${THEMES.filter((_, j) => project.cells[j] === '●')
      .map((theme) => theme.label)
      .join(', ')}. Same events, told with different emphasis for each column.`,
    detail:
      'One project rarely fills every cell, and it does not need to. Coverage across the grid is what matters.',
  })),
  {
    rows: PROJECTS.length,
    project: null,
    highlightColumn: 4,
    caption:
      'Now read down the columns rather than across the rows. Thin columns are your gaps - here, only two stories say anything about conflict, which is a question you will definitely be asked.',
    detail:
      'A gap is not a reason to invent something. It is a signal to think harder about a real situation you have downplayed.',
  },
  {
    rows: PROJECTS.length,
    project: null,
    highlightColumn: null,
    caption:
      'And pick two or three projects to master in real technical depth: hardest decision, the tradeoffs, what broke in production, what you would do differently. Behavioural questions turn technical fast.',
    detail:
      'Choose projects with genuinely hard components where you played a central role - ideally on the hard part.',
  },
];

function GridFrame({ index }: { index: number }) {
  const frame = gridFrames[Math.max(0, Math.min(index, gridFrames.length - 1))];
  const rows: CellSpec[][] = PROJECTS.map((project, row) =>
    project.cells.map((mark, col) => ({
      key: `${project.name}-${THEMES[col].key}`,
      label: row < frame.rows ? mark : '',
      state:
        row === frame.project
          ? ('active' as const)
          : frame.highlightColumn === col && mark === '●'
            ? ('target' as const)
            : row < frame.rows && mark === '●'
              ? ('done' as const)
              : ('idle' as const),
    })),
  );
  return (
    <Stage tall>
      <Matrix rows={rows} colLabels={THEMES.map((theme) => theme.key)} />
      <Caption>{THEMES.map((theme) => `${theme.key} ${theme.label}`).join(' · ')}</Caption>
      <Readout
        items={[
          {
            key: 'p',
            label: 'story',
            value: frame.project === null ? 'all' : PROJECTS[frame.project].name,
          },
          {
            key: 'g',
            label: 'thinnest column',
            value: frame.highlightColumn === null ? '-' : THEMES[frame.highlightColumn].label,
          },
        ]}
      />
    </Stage>
  );
}

export const storyGrid: AnimationSpec = fromFrames(
  {
    id: 'bq-grid',
    title: 'The story grid',
    blurb:
      'Projects down, themes across. Build it once and every behavioural question becomes a lookup.',
  },
  gridFrames,
  GridFrame,
);

/* ------------------------------------------------------------------------ */
/* 2. Where the time in an answer should go.                                 */
/* ------------------------------------------------------------------------ */

const PARTS = ['nugget', 'situation', 'action', 'result'];

interface SarFrame {
  split: number[];
  focus: number | null;
  caption: string;
  detail: string;
}

const TYPICAL = [0, 65, 20, 15];
const GOOD = [10, 15, 60, 15];

const sarFrames: SarFrame[] = [
  {
    split: TYPICAL,
    focus: 1,
    caption:
      'The answer most people give: a long wander through the situation, a quick summary of what happened, and almost nothing about what they personally did.',
    detail: 'The interviewer comes away knowing about a project, and nothing about you.',
  },
  {
    split: GOOD,
    focus: 0,
    caption:
      'Open with a nugget - one sentence saying what the story is about. "Let me tell you about the time I convinced the team to delete our caching layer." It grabs attention and forces you to know your own point.',
    detail:
      'Nugget first also keeps you focused: if you cannot say it in a sentence, the story is not ready.',
  },
  {
    split: GOOD,
    focus: 1,
    caption:
      'Situation: short. Enough context for the actions to make sense and no more. Detail here confuses an interviewer who does not know your system.',
    detail:
      'Translate rather than explain. State the impact instead of the internals, and offer to go deeper.',
  },
  {
    split: GOOD,
    focus: 2,
    caption:
      'Action: the bulk of it, and the part everyone rushes. Break it down explicitly - "I did three things. First…" - which forces the depth an interviewer is looking for.',
    detail:
      'Say "I" for what you did and "we" for what the team did. Assume every question is about your role.',
  },
  {
    split: GOOD,
    focus: 3,
    caption:
      'Result: short, and quantified where you can. What changed, and what you learned or did differently afterwards.',
    detail: 'A story with no result reads as a story with no outcome.',
  },
  {
    split: GOOD,
    focus: null,
    caption:
      'Then check what the story says about you. Initiative, empathy, humility, teamwork? If the honest answer is "nothing", rework how you tell it - or pick a different story.',
    detail:
      'Never state the trait. "I called the client myself, because I knew he would want to hear it from me" shows it; "I have empathy" does not.',
  },
];

function SarFrame({ index }: { index: number }) {
  const frame = sarFrames[Math.max(0, Math.min(index, sarFrames.length - 1))];
  const bars: BarSpec[] = PARTS.map((part, i) => ({
    key: part,
    label: part,
    value: frame.split[i] / 65,
    caption: `${frame.split[i]}%`,
    state: frame.focus === i ? 'active' : frame.split === TYPICAL ? 'bad' : 'done',
  }));
  return (
    <Stage>
      <Bars bars={bars} />
      <Readout
        items={[
          {
            key: 's',
            label: 'shape',
            value: frame.split === TYPICAL ? 'the common answer' : 'nugget + S.A.R.',
          },
          {
            key: 'f',
            label: 'in focus',
            value: frame.focus === null ? 'whole answer' : PARTS[frame.focus],
          },
        ]}
      />
    </Stage>
  );
}

export const sarShape: AnimationSpec = fromFrames(
  {
    id: 'bq-sar',
    title: 'The shape of a good answer',
    blurb:
      'Nugget, then situation, action, result - with most of the time on what you actually did.',
  },
  sarFrames,
  SarFrame,
);

export const behavioralAnimations: AnimationSpec[] = [storyGrid, sarShape];
