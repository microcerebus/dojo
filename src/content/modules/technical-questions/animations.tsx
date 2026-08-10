import {
  Cells,
  FlowSteps,
  Legend,
  Pointers,
  Readout,
  Stage,
  type CellSpec,
  type FlowStepSpec,
  type PointerSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. The seven-step loop.                                                   */
/* ------------------------------------------------------------------------ */

const LOOP: { label: string; detail: string; say: string }[] = [
  {
    label: 'Listen and clarify',
    detail: 'Restate the problem. Pin down input types, sizes, duplicates, sortedness, and what to return on empty.',
    say: '"Just to confirm: the array can contain negatives, and I return indices not values?"',
  },
  {
    label: 'Draw an example',
    detail: 'Big enough to be interesting, specific enough to check by hand. Not [1,2,3].',
    say: 'Every detail the interviewer gave you is a hint - use an example that exercises it.',
  },
  {
    label: 'State a brute force',
    detail: 'Say the obvious solution out loud with its complexity. You now have a baseline you can beat.',
    say: '"Brute force is compare-every-pair, O(n²) time, O(1) space. Let me improve it."',
  },
  {
    label: 'Optimise',
    detail: 'Apply BUD, then unused info, DIY on a bigger example, simplify/generalise, base-case-and-build, and the data-structure sweep.',
    say: 'This is where the interview is won. Do it out loud.',
  },
  {
    label: 'Walk through it',
    detail: 'Talk the whole algorithm through before typing. Fixing a design on a whiteboard is cheap; fixing it in half-written code is not.',
    say: 'You should know every variable you are about to write.',
  },
  {
    label: 'Implement',
    detail: 'Clean, modular code. Real names. Push details into helper functions you can define afterwards.',
    say: 'Leave yourself room - start at the top left of the board.',
  },
  {
    label: 'Test',
    detail: 'Read the code line by line, then run a small case, then edge cases (empty, one element, duplicates, negatives), then fix bugs deliberately.',
    say: 'A bug you find yourself costs far less than one the interviewer finds.',
  },
];

const loopFrames = LOOP.map((step, i) => ({
  caption: `${i + 1}. ${step.label} - ${step.detail}`,
  detail: step.say,
}));

function LoopFrame({ index }: { index: number }) {
  const step = Math.min(index, LOOP.length - 1);
  const steps: FlowStepSpec[] = LOOP.map((item, i) => ({
    key: item.label,
    label: item.label,
    ...(i === step ? { detail: item.detail } : {}),
    state: i === step ? 'active' : i < step ? 'done' : 'muted',
  }));
  return (
    <Stage>
      <FlowSteps steps={steps} />
    </Stage>
  );
}

export const sevenSteps: AnimationSpec = fromFrames(
  {
    id: 'tq-seven-steps',
    title: 'The problem-solving loop',
    blurb: 'The order that keeps you out of trouble. Step through it before your next mock.',
  },
  loopFrames,
  LoopFrame,
);

/* ------------------------------------------------------------------------ */
/* 2. BUD in action: find a pair summing to a target.                        */
/* ------------------------------------------------------------------------ */

const ARR = [3, 8, 1, 5, 7];
const TARGET = 10;

interface BudFrame {
  phase: 'brute' | 'insight' | 'hash';
  i: number;
  j: number;
  comparisons: number;
  seen: number[];
  found: [number, number] | null;
  caption: string;
  detail: string;
}

const budFrames: BudFrame[] = (() => {
  const frames: BudFrame[] = [];
  let comparisons = 0;
  // Brute force: show the first few pairs, enough to feel the nested scan.
  const pairs: [number, number][] = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 2],
  ];
  for (const [i, j] of pairs) {
    comparisons += 1;
    const sum = ARR[i] + ARR[j];
    frames.push({
      phase: 'brute',
      i,
      j,
      comparisons,
      seen: [],
      found: sum === TARGET ? [i, j] : null,
      caption:
        sum === TARGET
          ? `${ARR[i]} + ${ARR[j]} = ${TARGET}. Found - but we only got here by trying every pair.`
          : `Compare ${ARR[i]} + ${ARR[j]} = ${sum}. Not ${TARGET}, keep scanning.`,
      detail: `comparisons so far: ${comparisons} · worst case n(n-1)/2 = 10`,
    });
  }
  frames.push({
    phase: 'insight',
    i: 0,
    j: -1,
    comparisons,
    seen: [],
    found: null,
    caption:
      'B for Bottleneck: the outer loop is fine, the inner rescan is the cost. The question "is 10 − x in the array?" is being answered by a linear scan every single time.',
    detail: 'BUD: Bottleneck · Unnecessary work · Duplicated work',
  });
  // Optimised pass: one scan, hash set of complements.
  const seen: number[] = [];
  for (let i = 0; i < ARR.length; i++) {
    const need = TARGET - ARR[i];
    const hit = seen.includes(need);
    frames.push({
      phase: 'hash',
      i,
      j: hit ? ARR.indexOf(need) : -1,
      comparisons: i + 1,
      seen: [...seen],
      found: hit ? [ARR.indexOf(need), i] : null,
      caption: hit
        ? `${ARR[i]} needs ${need}, and ${need} is already in the set. Answer found on the first pass.`
        : `${ARR[i]} needs ${need}. Not in the set yet, so remember ${ARR[i]} and move on.`,
      detail: `one lookup per element · ${i + 1} steps so far · O(n) time, O(n) space`,
    });
    if (hit) break;
    seen.push(ARR[i]);
  }
  return frames;
})();

function BudFrameView({ index }: { index: number }) {
  const frame = budFrames[Math.min(index, budFrames.length - 1)];
  const cells: CellSpec[] = ARR.map((value, i) => ({
    key: `v-${i}`,
    label: String(value),
    sub: String(i),
    state: frame.found?.includes(i)
      ? 'done'
      : i === frame.i
        ? 'active'
        : i === frame.j
          ? 'compare'
          : frame.phase === 'hash' && frame.seen.includes(value)
            ? 'muted'
            : 'idle',
  }));
  const pointers: PointerSpec[] = [];
  if (frame.phase !== 'insight') {
    pointers.push({ key: 'i', at: frame.i, label: 'i', tone: 'a' });
    if (frame.j >= 0) pointers.push({ key: 'j', at: frame.j, label: 'j', tone: 'b' });
  }
  return (
    <Stage>
      <Readout
        items={[
          { key: 't', label: 'target', value: String(TARGET) },
          {
            key: 'phase',
            label: 'approach',
            value:
              frame.phase === 'brute'
                ? 'brute force O(n²)'
                : frame.phase === 'insight'
                  ? 'BUD analysis'
                  : 'hash set O(n)',
          },
          { key: 'c', label: 'steps', value: String(frame.comparisons) },
        ]}
      />
      <Pointers pointers={pointers} count={ARR.length} />
      <Cells cells={cells} label="input array" />
      {frame.phase === 'hash' ? (
        <div className="viz__readout">
          <div className="viz__readoutItem">
            <dt>set</dt>
            <dd>{frame.seen.length ? `{${frame.seen.join(', ')}}` : '{}'}</dd>
          </div>
        </div>
      ) : null}
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'current element' },
          { key: 'b', state: 'compare', label: 'partner' },
          { key: 'd', state: 'done', label: 'answer' },
        ]}
      />
    </Stage>
  );
}

export const budWalkthrough: AnimationSpec = fromFrames(
  {
    id: 'tq-bud',
    title: 'BUD: from O(n²) to O(n)',
    blurb: 'Find a pair summing to 10. Watch the bottleneck get named, then removed.',
  },
  budFrames,
  BudFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. Best conceivable runtime as a target.                                  */
/* ------------------------------------------------------------------------ */

const BCR_LADDER: { key: string; label: string; note: string }[] = [
  { key: 'n2', label: 'O(n²) - compare every pair', note: 'where the brute force lands' },
  { key: 'nlogn', label: 'O(n log n) - sort, then scan', note: 'usually the first real improvement' },
  { key: 'n', label: 'O(n) - one pass with a hash set', note: 'matches the BCR: we are done optimising' },
  { key: 'logn', label: 'O(log n) - impossible here', note: 'you must at least look at every element once' },
];

const bcrFrames = [
  {
    caption:
      'Best conceivable runtime is not "the runtime of the best algorithm" - it is the runtime you could not possibly beat, because you have to do at least this much work.',
    detail: 'BCR is a target and a stopping rule, not a promise.',
  },
  {
    caption:
      'For "does any pair sum to 10?", you must read every element at least once - if you skip one, an adversary hides the answer there. So the BCR is O(n).',
    detail: 'BCR = O(n)',
  },
  {
    caption: 'Our brute force is O(n²). There is a gap between here and the BCR, so keep optimising.',
    detail: 'current O(n²) · BCR O(n) · gap: yes',
  },
  {
    caption:
      'Sorting first gets us to O(n log n) with two pointers. Better, but there is still a gap.',
    detail: 'current O(n log n) · BCR O(n) · gap: yes',
  },
  {
    caption:
      'The hash-set pass is O(n) - equal to the BCR. Stop. You cannot do better on time, so any further discussion is about space.',
    detail: 'current O(n) · BCR O(n) · gap: none → stop',
  },
  {
    caption:
      'Careful: matching the BCR on time does not end the conversation. "Can you do it in O(1) extra space?" is the natural follow-up.',
    detail: 'time O(n) · space O(n) → next axis to optimise is space',
  },
];

function BcrFrame({ index }: { index: number }) {
  const step = Math.min(index, bcrFrames.length - 1);
  // Which rung we are standing on at each step.
  const current = [-1, -1, 0, 1, 2, 2][step] ?? -1;
  const bcrKnown = step >= 1;
  const steps: FlowStepSpec[] = BCR_LADDER.map((rung, i) => ({
    key: rung.key,
    label: rung.label,
    detail: rung.note,
    ...(i === current ? { badge: 'you are here' } : bcrKnown && i === 2 ? { badge: 'BCR' } : {}),
    state:
      i === current ? 'active' : bcrKnown && i === 2 ? 'target' : i === 3 ? 'muted' : 'idle',
  }));
  return (
    <Stage>
      <FlowSteps steps={steps} />
    </Stage>
  );
}

export const bcrLadder: AnimationSpec = fromFrames(
  {
    id: 'tq-bcr',
    title: 'Best conceivable runtime',
    blurb: 'How to know when to stop optimising - and when you are not allowed to stop.',
  },
  bcrFrames,
  BcrFrame,
);

export const technicalQuestionsAnimations: AnimationSpec[] = [
  sevenSteps,
  budWalkthrough,
  bcrLadder,
];
