import {
  Caption,
  Cells,
  Legend,
  Matrix,
  Readout,
  Stage,
  type CellSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. The test matrix: components down, test types across.                   */
/* ------------------------------------------------------------------------ */

const TEST_TYPES = [
  { key: 'N', label: 'normal' },
  { key: 'B', label: 'boundary' },
  { key: 'I', label: 'invalid' },
  { key: 'F', label: 'failure' },
  { key: 'C', label: 'concurrency' },
  { key: 'S', label: 'security' },
];

const COMPONENTS: { name: string; cases: string[] }[] = [
  {
    name: 'Log in',
    cases: [
      'valid card and PIN',
      'PIN at the digit limit',
      'wrong PIN, unknown card, expired card',
      'card reader jams mid-read',
      'same card used at two machines at once',
      'three wrong PINs must lock the card, and the PIN must never be logged',
    ],
  },
  {
    name: 'Withdraw',
    cases: [
      'amount well inside the balance',
      'exactly the balance, exactly the daily limit, zero, one cent over',
      'negative amount, non-multiple of the note denomination',
      'network drops after debit but before dispense',
      'two withdrawals racing against one balance',
      'no path that dispenses cash without a matching debit',
    ],
  },
  {
    name: 'Deposit',
    cases: [
      'cash and cheque, correctly credited',
      "one note, the machine's maximum, zero notes",
      'foreign notes, torn notes, a jammed envelope',
      'power cut with the notes inside the machine',
      'deposit and withdrawal on the same account at once',
      'credited to the right account, and only once',
    ],
  },
  {
    name: 'Balance',
    cases: [
      'shows what the backend holds',
      'zero balance, overdrawn balance, very large balance',
      'closed account, account not owned by this card',
      'backend unreachable - degrade, do not show a stale number as current',
      'balance read during a transfer',
      "no other customer's balance is ever reachable",
    ],
  },
  {
    name: 'Transfer',
    cases: [
      'between two accounts of the same customer',
      'entire balance, one cent, the daily transfer cap',
      'nonexistent target account, self-transfer',
      'crash between the debit and the credit - money must not vanish',
      'circular transfers between two accounts at once',
      'target account ownership is verified before the money moves',
    ],
  },
];

interface MatrixFrame {
  rows: number;
  component: number | null;
  caption: string;
  detail: string;
}

const matrixFrames: MatrixFrame[] = [
  {
    rows: 0,
    component: null,
    caption:
      'Asked to test an ATM, most candidates start listing cases at random and miss whole categories. Build a grid instead: components down one side, kinds of test across the top.',
    detail: 'The grid is the answer to "are you organised?" - and it is also how you avoid gaps.',
  },
  ...COMPONENTS.map((component, i) => ({
    rows: i + 1,
    component: i,
    caption: `${component.name}: ${component.cases
      .map((text, j) => `${TEST_TYPES[j].label} - ${text}`)
      .join('; ')}.`,
    detail: `${(i + 1) * TEST_TYPES.length} cells filled of ${COMPONENTS.length * TEST_TYPES.length}`,
  })),
  {
    rows: COMPONENTS.length,
    component: null,
    caption:
      'Thirty cells, and each one is a real test. Now say which you would automate (all the standard paths, and the concurrency ones especially) and which need a human at the machine.',
    detail:
      'Then state the priority: for an ATM, money must always be accounted for and accounts must always be protected. Layout bugs come after that.',
  },
];

function MatrixFrame({ index }: { index: number }) {
  const frame = matrixFrames[Math.max(0, Math.min(index, matrixFrames.length - 1))];
  const rows: CellSpec[][] = COMPONENTS.map((component, row) =>
    TEST_TYPES.map((type) => ({
      key: `${component.name}-${type.key}`,
      label: row < frame.rows ? '✓' : '·',
      state:
        row === frame.component
          ? ('active' as const)
          : row < frame.rows
            ? ('done' as const)
            : ('idle' as const),
    })),
  );
  return (
    <Stage tall>
      <Matrix rows={rows} colLabels={TEST_TYPES.map((type) => type.key)} />
      <Caption>{TEST_TYPES.map((type) => `${type.key} ${type.label}`).join(' · ')}</Caption>
      <Readout
        items={[
          {
            key: 'c',
            label: 'component',
            value: frame.component === null ? '-' : COMPONENTS[frame.component].name,
          },
          { key: 'f', label: 'cases so far', value: String(frame.rows * TEST_TYPES.length) },
        ]}
      />
    </Stage>
  );
}

export const testMatrix: AnimationSpec = fromFrames(
  {
    id: 't-matrix',
    title: 'The test matrix',
    blurb: 'Components down, kinds of test across. Structure is what stops you missing a category.',
  },
  matrixFrames,
  MatrixFrame,
);

/* ------------------------------------------------------------------------ */
/* 2. Boundary values.                                                       */
/* ------------------------------------------------------------------------ */

interface BoundaryFrame {
  cells: CellSpec[];
  caption: string;
  detail: string;
}

const line = (labels: string[], states: (CellSpec['state'] | undefined)[]): CellSpec[] =>
  labels.map((label, i) => ({
    key: `v${i}-${label}`,
    label,
    ...(states[i] ? { state: states[i] } : {}),
  }));

const RANGE_LABELS = ['−1', '0', '1', '2', '…', '99', '100', '101'];

const boundaryFrames: BoundaryFrame[] = [
  {
    cells: line(RANGE_LABELS, []),
    caption:
      'The spec says the function accepts 1 to 100. There are infinitely many inputs and you get to pick a handful, so pick where behaviour changes.',
    detail:
      'A boundary is a pair of neighbouring values that are treated differently. Test both, and the point itself.',
  },
  {
    cells: line(RANGE_LABELS, ['bad', 'bad', 'target', 'done', 'done', 'done', 'target', 'bad']),
    caption:
      'Six values do almost all the work: just below, exactly at, and just above each end. Everything in the middle behaves the same, so one representative is enough.',
    detail: 'accepted 1…100 · rejected 0 and 101 · the pair that matters is (0, 1) and (100, 101)',
  },
  {
    cells: line(
      ['null', '[]', '[x]', 'min', '−1', '0', 'max', 'dup'],
      ['bad', 'target', 'target', 'target', 'compare', 'target', 'target', 'compare'],
    ),
    caption:
      'Then the boundaries the type itself brings, which the spec never mentions: empty, one element, the smallest and largest representable values, zero, negatives, duplicates, and null.',
    detail:
      'Illegal input deserves a decision, not an accident: does it return an error or throw? Ask, then test for it.',
  },
  {
    cells: line(['3', '2', '1', '0', '2³²−1'], ['done', 'done', 'done', 'target', 'bad']),
    caption:
      'The C loop "unsigned int i; for (i = 100; i >= 0; --i)" never ends. An unsigned value is never below zero, so at 0 the decrement wraps to 2³²−1 and the condition stays true.',
    detail:
      'The fix is i > 0, and print 0 separately if you need it. (Also %u, not %d, for an unsigned value.)',
  },
  {
    cells: line(RANGE_LABELS, ['bad', 'bad', 'target', 'done', 'done', 'done', 'target', 'bad']),
    caption:
      'So: normal cases, the extremes, illegal input, and strange-but-legal input - an already sorted array, a reverse-sorted one, all-identical elements.',
    detail:
      'Then define the expected result for each, including "the input array must come back unmodified".',
  },
];

function BoundaryFrame({ index }: { index: number }) {
  const frame = boundaryFrames[Math.max(0, Math.min(index, boundaryFrames.length - 1))];
  return (
    <Stage>
      <Cells cells={frame.cells} label="test values" />
      <Legend
        items={[
          { key: 'a', state: 'target', label: 'boundary - always test' },
          { key: 'b', state: 'done', label: 'accepted' },
          { key: 'c', state: 'bad', label: 'rejected' },
        ]}
      />
    </Stage>
  );
}

export const boundaries: AnimationSpec = fromFrames(
  {
    id: 't-boundaries',
    title: 'Where the bugs live',
    blurb:
      'Boundaries are pairs of neighbours treated differently. Test both sides, and the point between them.',
  },
  boundaryFrames,
  BoundaryFrame,
);

/* ------------------------------------------------------------------------ */
/* 3. Bisecting a failure.                                                   */
/* ------------------------------------------------------------------------ */

const BUILDS = 16;
const FIRST_BAD = 11;

interface BisectFrame {
  lo: number;
  hi: number;
  probe: number | null;
  answer: number | null;
  caption: string;
  detail: string;
}

const bisectFrames: BisectFrame[] = (() => {
  const frames: BisectFrame[] = [
    {
      lo: 1,
      hi: BUILDS,
      probe: null,
      answer: null,
      caption: `Something broke somewhere in the last ${BUILDS} builds. Testing each one costs ${BUILDS} runs - and you almost never need that many.`,
      detail:
        'The only property you need: once it is broken, it stays broken. That makes the sequence monotone.',
    },
  ];
  let lo = 1;
  let hi = BUILDS;
  let probes = 0;
  while (lo < hi) {
    const probe = Math.floor((lo + hi) / 2);
    const bad = probe >= FIRST_BAD;
    probes += 1;
    if (bad) hi = probe;
    else lo = probe + 1;
    frames.push({
      lo,
      hi,
      probe,
      answer: null,
      caption: bad
        ? `Build ${probe} is broken, so the first bad build is at or before it. Everything after ${probe} can be discarded.`
        : `Build ${probe} is fine, so the break is after it. Everything up to ${probe} can be discarded.`,
      detail: `probes used: ${probes} · candidates left: ${hi - lo + 1}`,
    });
  }
  frames.push({
    lo,
    hi,
    probe: null,
    answer: lo,
    caption: `One candidate left: build ${lo} is the first bad one. Four probes instead of sixteen, and the same idea scales - a thousand builds cost ten.`,
    detail:
      'The same move works on inputs, config flags and feature toggles: halve the space, do not walk it. Also: probe = (lo + hi) / 2 overflows on large ranges - use lo + (hi − lo) / 2.',
  });
  return frames;
})();

function BisectFrame({ index }: { index: number }) {
  const frame = bisectFrames[Math.max(0, Math.min(index, bisectFrames.length - 1))];
  const cells: CellSpec[] = Array.from({ length: BUILDS }, (_, i) => {
    const build = i + 1;
    const inRange = build >= frame.lo && build <= frame.hi;
    let state: CellSpec['state'] = inRange ? 'idle' : 'muted';
    if (frame.answer === build) state = 'target';
    else if (frame.probe === build) state = build >= FIRST_BAD ? 'bad' : 'done';
    return { key: `b${build}`, label: String(build), state, sub: inRange ? '?' : '' };
  });
  return (
    <Stage>
      <Cells cells={cells} size="sm" label="builds" />
      <Readout
        items={[
          { key: 'r', label: 'range', value: `${frame.lo}…${frame.hi}` },
          { key: 'p', label: 'probe', value: frame.probe === null ? '-' : String(frame.probe) },
          {
            key: 'a',
            label: 'first bad',
            value: frame.answer === null ? '-' : String(frame.answer),
          },
        ]}
      />
      <Legend
        items={[
          { key: 'g', state: 'done', label: 'probe passed' },
          { key: 'b', state: 'bad', label: 'probe failed' },
          { key: 'm', state: 'muted', label: 'ruled out' },
        ]}
      />
    </Stage>
  );
}

export const bisect: AnimationSpec = fromFrames(
  {
    id: 't-bisect',
    title: 'Bisecting a failure',
    blurb:
      'Halve the search space instead of walking it - the single most useful debugging habit there is.',
  },
  bisectFrames,
  BisectFrame,
);

export const testingAnimations: AnimationSpec[] = [testMatrix, boundaries, bisect];
