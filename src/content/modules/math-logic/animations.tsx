import {
  Bars,
  Cells,
  Legend,
  Matrix,
  Readout,
  Stage,
  type BarSpec,
  type CellSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. The Sieve of Eratosthenes.                                             */
/* ------------------------------------------------------------------------ */

const SIEVE_MAX = 30;
const SIEVE_NUMBERS = Array.from({ length: SIEVE_MAX - 1 }, (_, i) => i + 2);

interface SieveFrame {
  crossed: number[];
  prime: number | null;
  justCrossed: number[];
  done: boolean;
  caption: string;
  detail: string;
}

const sieveFrames: SieveFrame[] = (() => {
  const frames: SieveFrame[] = [];
  const crossed = new Set<number>();
  frames.push({
    crossed: [],
    prime: null,
    justCrossed: [],
    done: false,
    caption: `Write down every integer from 2 to ${SIEVE_MAX}. Nothing is crossed off yet, and nothing is known to be prime.`,
    detail: 'The sieve rests on one fact: every composite number has a prime factor.',
  });
  for (const prime of [2, 3, 5]) {
    const justCrossed: number[] = [];
    for (let multiple = prime * prime; multiple <= SIEVE_MAX; multiple += prime) {
      if (crossed.has(multiple)) continue;
      crossed.add(multiple);
      justCrossed.push(multiple);
    }
    frames.push({
      crossed: [...crossed],
      prime,
      justCrossed,
      done: false,
      caption: `${prime} is not crossed off, so ${prime} is prime. Cross off its multiples, starting at ${prime}² = ${prime * prime}.`,
      detail:
        justCrossed.length === 0
          ? 'Nothing new: every multiple was already removed by a smaller prime.'
          : `Newly removed: ${justCrossed.join(', ')}. Anything below ${prime}² already had a smaller prime factor.`,
    });
  }
  frames.push({
    crossed: [...crossed],
    prime: null,
    justCrossed: [],
    done: true,
    caption: `The next candidate is 7, and 7² = 49 is past ${SIEVE_MAX}. Stop: everything still standing is prime.`,
    detail: `Sieving to n costs O(n log log n) time and O(n) space - far better than testing each number separately.`,
  });
  return frames;
})();

function SieveFrame({ index }: { index: number }) {
  const frame = sieveFrames[Math.max(0, Math.min(index, sieveFrames.length - 1))];
  const crossed = new Set(frame.crossed);
  const just = new Set(frame.justCrossed);
  const cells: CellSpec[] = SIEVE_NUMBERS.map((value) => {
    let state: CellSpec['state'] = 'idle';
    if (value === frame.prime) state = 'target';
    else if (just.has(value)) state = 'compare';
    else if (crossed.has(value)) state = 'bad';
    else if (frame.done) state = 'done';
    return { key: `n${value}`, label: String(value), state };
  });
  const primes = SIEVE_NUMBERS.filter((value) => !crossed.has(value));
  return (
    <Stage>
      <Cells cells={cells} size="sm" label={`integers 2 to ${SIEVE_MAX}`} />
      <Readout
        items={[
          { key: 'p', label: 'sieving on', value: frame.prime === null ? '-' : String(frame.prime) },
          { key: 'left', label: 'still standing', value: String(primes.length) },
          { key: 'stop', label: 'stop after', value: `√${SIEVE_MAX} ≈ 5.5` },
        ]}
      />
      <Legend
        items={[
          { key: 'l1', state: 'target', label: 'prime being used' },
          { key: 'l2', state: 'compare', label: 'crossed off now' },
          { key: 'l3', state: 'bad', label: 'composite' },
        ]}
      />
    </Stage>
  );
}

export const sieve: AnimationSpec = fromFrames(
  {
    id: 'ml-sieve',
    title: 'Sieve of Eratosthenes',
    blurb: 'Generate every prime below n by crossing off multiples, prime by prime.',
  },
  sieveFrames,
  SieveFrame,
);

/* ------------------------------------------------------------------------ */
/* 2. The mutilated chessboard: a colouring argument.                        */
/* ------------------------------------------------------------------------ */

const BOARD = 8;
/** Removed corners - both are light squares, which is the whole point. */
const CUT = new Set(['0,0', '7,7']);

interface DominoPlacement {
  cells: [string, string];
}

const DOMINOES: DominoPlacement[] = [
  { cells: ['1,0', '1,1'] },
  { cells: ['1,2', '1,3'] },
  { cells: ['2,0', '3,0'] },
  { cells: ['4,4', '4,5'] },
  { cells: ['6,6', '6,7'] },
];

interface BoardFrame {
  cut: boolean;
  dominoes: number;
  caption: string;
  detail: string;
}

const boardFrames: BoardFrame[] = [
  {
    cut: false,
    dominoes: 0,
    caption:
      'A full 8x8 board: 64 squares, 32 light and 32 dark. Thirty-two dominoes would tile it with room to spare.',
    detail: 'Colour is not decoration here - it is the invariant the whole proof runs on.',
  },
  {
    cut: true,
    dominoes: 0,
    caption:
      'Cut off two diagonally opposite corners. Opposite corners are always the same colour, so 62 squares remain: 30 light, 32 dark.',
    detail: 'Counting squares alone says 62 / 2 = 31 dominoes should fit. Counting colours says otherwise.',
  },
  {
    cut: true,
    dominoes: 1,
    caption:
      'Place one domino. It covers two adjacent squares, and adjacent squares always differ in colour - so it takes exactly one light and one dark.',
    detail: 'This is true of every placement, horizontal or vertical, anywhere on the board.',
  },
  {
    cut: true,
    dominoes: 3,
    caption: 'Keep going. Three dominoes down: 3 light and 3 dark consumed. The ratio never budges.',
    detail: 'covered so far: 3 light, 3 dark · remaining: 27 light, 29 dark',
  },
  {
    cut: true,
    dominoes: 5,
    caption:
      'Thirty-one dominoes would consume exactly 31 light and 31 dark squares. We only have 30 light. Impossible - no search needed.',
    detail:
      'An invariant beats exhaustive trial: it rules out every arrangement at once, including the ones you never drew.',
  },
];

function BoardFrame({ index }: { index: number }) {
  const frame = boardFrames[Math.max(0, Math.min(index, boardFrames.length - 1))];
  const covered = new Set(DOMINOES.slice(0, frame.dominoes).flatMap((domino) => domino.cells));
  const rows: CellSpec[][] = Array.from({ length: BOARD }, (_, row) =>
    Array.from({ length: BOARD }, (_, col) => {
      const key = `${row},${col}`;
      const light = (row + col) % 2 === 0;
      if (frame.cut && CUT.has(key)) {
        return { key, label: '✕', state: 'bad' as const };
      }
      return {
        key,
        label: light ? '□' : '■',
        state: covered.has(key) ? ('done' as const) : ('idle' as const),
      };
    }),
  );
  const lightLeft = frame.cut ? 30 : 32;
  const darkLeft = 32;
  return (
    <Stage tall>
      <Matrix rows={rows} />
      <Readout
        items={[
          { key: 'light', label: 'light squares', value: String(lightLeft) },
          { key: 'dark', label: 'dark squares', value: String(darkLeft) },
          { key: 'dom', label: 'dominoes placed', value: String(frame.dominoes) },
        ]}
      />
    </Stage>
  );
}

export const mutilatedBoard: AnimationSpec = fromFrames(
  {
    id: 'ml-chessboard',
    title: 'The mutilated chessboard',
    blurb: 'A colouring invariant that proves an arrangement impossible without trying any.',
  },
  boardFrames,
  BoardFrame,
);

/* ------------------------------------------------------------------------ */
/* 3. Egg drop: balancing the worst case.                                    */
/* ------------------------------------------------------------------------ */

/** Every-ten strategy: if egg 1 breaks on its kth drop, egg 2 checks 9 floors. */
const NAIVE_TOTALS = Array.from({ length: 10 }, (_, i) => i + 1 + 9);
/** Balanced strategy: intervals 14, 13, 12, ... so every branch costs 14. */
const BALANCED_TOTALS = Array.from({ length: 11 }, () => 14);

interface EggFrame {
  totals: number[];
  worstIndex: number | null;
  caption: string;
  detail: string;
}

const eggFrames: EggFrame[] = [
  {
    totals: NAIVE_TOTALS,
    worstIndex: null,
    caption:
      'Two eggs, 100 floors. Obvious plan: drop egg 1 from floor 10, 20, 30 … then walk egg 2 up the nine floors below wherever it breaks.',
    detail: 'Each bar is one branch: how many drops that outcome costs in total.',
  },
  {
    totals: NAIVE_TOTALS,
    worstIndex: 9,
    caption:
      'The branches are wildly uneven. Breaking at floor 10 costs 10 drops; breaking at floor 100 costs 19. The worst case is what counts, so this plan costs 19.',
    detail: 'best branch 10 · worst branch 19 · every step of egg 1 makes the tail one drop more expensive',
  },
  {
    totals: NAIVE_TOTALS,
    worstIndex: 9,
    caption:
      'The fix is worst-case balancing. Every extra drop of egg 1 must buy back exactly one drop of egg 2 - so the interval has to shrink by one each time.',
    detail: 'Start at floor X, then X−1 more, then X−2 … until the intervals reach the top of the building.',
  },
  {
    totals: BALANCED_TOTALS,
    worstIndex: null,
    caption:
      'Drop from 14, then 27, 39, 50, 60, 69, 77, 84, 90, 95, 99. Now every branch costs the same: 14 drops. Flat is optimal.',
    detail: 'No branch is cheap and no branch is expensive - the definition of a balanced worst case.',
  },
  {
    totals: BALANCED_TOTALS,
    worstIndex: null,
    caption:
      'Solve for X: X + (X−1) + … + 1 = X(X+1)/2 ≥ 100 gives X ≈ 13.65. Round up to 14 - 13 leaves floors 92-100 uncovered.',
    detail: 'Same idea generalises: for f floors, solve X(X+1)/2 ≥ f and round up.',
  },
];

function EggFrame({ index }: { index: number }) {
  const frame = eggFrames[Math.max(0, Math.min(index, eggFrames.length - 1))];
  const bars: BarSpec[] = frame.totals.map((total, i) => ({
    key: `b${i}`,
    label: String(i + 1),
    value: total / 20,
    caption: String(total),
    state: frame.worstIndex === i ? 'bad' : frame.totals === BALANCED_TOTALS ? 'done' : 'idle',
  }));
  const worst = Math.max(...frame.totals);
  const best = Math.min(...frame.totals);
  return (
    <Stage>
      <Bars bars={bars} />
      <Readout
        items={[
          { key: 'w', label: 'worst case', value: `${worst} drops` },
          { key: 'b', label: 'best case', value: `${best} drops` },
          { key: 's', label: 'spread', value: String(worst - best) },
        ]}
      />
    </Stage>
  );
}

export const eggDrop: AnimationSpec = fromFrames(
  {
    id: 'ml-egg-drop',
    title: 'Egg drop: balancing the worst case',
    blurb: 'Why the optimal first drop is floor 14, and how to derive it rather than guess it.',
  },
  eggFrames,
  EggFrame,
);

/* ------------------------------------------------------------------------ */
/* 4. Rejection sampling: rand7 from rand5.                                  */
/* ------------------------------------------------------------------------ */

interface RejectFrame {
  reject: boolean;
  highlightResidue: number | null;
  caption: string;
  detail: string;
}

const rejectFrames: RejectFrame[] = [
  {
    reject: false,
    highlightResidue: null,
    caption:
      'rand5() gives 0-4 uniformly. Combine two calls as 5·rand5() + rand5() and every value 0-24 comes out exactly one way, so all 25 are equally likely.',
    detail: 'Row = first call, column = second call. 2·rand5() + rand5() would NOT work - some values arise several ways.',
  },
  {
    reject: false,
    highlightResidue: null,
    caption:
      'Tempting shortcut: return value % 7. But 25 is not a multiple of 7 - the leftovers 21, 22, 23, 24 hand an extra slot to residues 0, 1, 2 and 3.',
    detail: 'Residues 0-3 would appear 4 times out of 25; residues 4-6 only 3 times. Not uniform, so not a correct answer.',
  },
  {
    reject: true,
    highlightResidue: null,
    caption:
      'Throw those four away and try again. What remains is 21 outcomes - exactly 3 × 7 - and they are still all equally likely.',
    detail: 'Discarding uniformly-chosen outcomes leaves the survivors uniform. That is the whole trick.',
  },
  {
    reject: true,
    highlightResidue: 3,
    caption: 'Now take the value mod 7. Every residue is hit by exactly three cells, so each result has probability 1/7.',
    detail: 'Highlighted: the cells giving 3 - namely 3, 10 and 17. Every other residue looks the same.',
  },
  {
    reject: true,
    highlightResidue: null,
    caption:
      'Cost: each round succeeds with probability 21/25, so it takes about 1.19 rounds - roughly 2.4 rand5() calls on average. There is no bound on the worst case.',
    detail:
      'This is why the answer needs a while loop: no fixed number of rand5() calls can produce sevenths, because powers of 5 never divide by 7.',
  },
];

function RejectFrame({ index }: { index: number }) {
  const frame = rejectFrames[Math.max(0, Math.min(index, rejectFrames.length - 1))];
  const rows: CellSpec[][] = Array.from({ length: 5 }, (_, a) =>
    Array.from({ length: 5 }, (_, b) => {
      const value = 5 * a + b;
      let state: CellSpec['state'] = 'idle';
      if (value >= 21) state = frame.reject ? 'muted' : 'bad';
      else if (frame.highlightResidue !== null && value % 7 === frame.highlightResidue) state = 'target';
      else if (frame.reject) state = 'done';
      return { key: `v${value}`, label: frame.reject && value >= 21 ? '✕' : String(value), state };
    }),
  );
  return (
    <Stage>
      <Matrix
        rows={rows}
        rowLabels={['0', '1', '2', '3', '4']}
        colLabels={['0', '1', '2', '3', '4']}
      />
      <Readout
        items={[
          { key: 'k', label: 'outcomes kept', value: frame.reject ? '21' : '25' },
          { key: 'p', label: 'per result', value: frame.reject ? '3/21 = 1/7' : 'uneven' },
          { key: 'r', label: 'retry chance', value: frame.reject ? '4/25' : '-' },
        ]}
      />
    </Stage>
  );
}

export const rejectionSampling: AnimationSpec = fromFrames(
  {
    id: 'ml-rejection',
    title: 'Rejection sampling',
    blurb: 'Turn one uniform generator into another by throwing away the outcomes that would skew it.',
  },
  rejectFrames,
  RejectFrame,
);

/* ------------------------------------------------------------------------ */
/* 5. Fisher-Yates.                                                          */
/* ------------------------------------------------------------------------ */

const DECK = ['A', 'B', 'C', 'D', 'E'];
/** Pre-chosen "random" picks so the walkthrough is reproducible. */
const PICKS: { i: number; k: number }[] = [
  { i: 4, k: 1 },
  { i: 3, k: 3 },
  { i: 2, k: 0 },
  { i: 1, k: 1 },
];

interface ShuffleFrame {
  order: string[];
  i: number | null;
  k: number | null;
  fixedFrom: number;
  caption: string;
  detail: string;
}

const shuffleFrames: ShuffleFrame[] = (() => {
  const order = [...DECK];
  const frames: ShuffleFrame[] = [
    {
      order: [...order],
      i: null,
      k: null,
      fixedFrom: DECK.length,
      caption:
        'Five cards in order. The naive shuffle - walk the array and swap each element with a random index anywhere - looks fine and is provably biased.',
      detail: 'It has 5⁵ = 3125 equally likely execution paths mapping onto 5! = 120 orderings. 3125 is not divisible by 120, so some orderings must come out more often.',
    },
  ];
  for (const { i, k } of PICKS) {
    const swapped = order[i] !== order[k];
    [order[i], order[k]] = [order[k], order[i]];
    frames.push({
      order: [...order],
      i,
      k,
      fixedFrom: i,
      caption: swapped
        ? `Position ${i}: pick k uniformly from 0..${i}, which lands on ${k}. Swap, and position ${i} is finished forever.`
        : `Position ${i}: k comes out as ${k}, which is position ${i} itself. An element must be allowed to stay put, or the shuffle is biased.`,
      detail: `remaining choices: ${i} · a card is only ever swapped out of the unfinished prefix, never back into it`,
    });
  }
  frames.push({
    order: [...order],
    i: null,
    k: null,
    fixedFrom: 0,
    caption:
      'Done in one pass. Each of the 5! orderings is produced by exactly one sequence of picks, so all of them are equally likely.',
    detail: 'O(n) time, O(1) extra space, and the correctness argument is a one-liner: 5 × 4 × 3 × 2 × 1 = 120 = 5!.',
  });
  return frames;
})();

function ShuffleFrame({ index }: { index: number }) {
  const frame = shuffleFrames[Math.max(0, Math.min(index, shuffleFrames.length - 1))];
  const cells: CellSpec[] = frame.order.map((label, position) => {
    let state: CellSpec['state'] = 'idle';
    if (position >= frame.fixedFrom) state = 'done';
    if (position === frame.i) state = 'active';
    else if (position === frame.k) state = 'compare';
    return { key: `p${position}`, label, state, sub: String(position) };
  });
  return (
    <Stage>
      <Cells cells={cells} label="deck" />
      <Readout
        items={[
          { key: 'i', label: 'position', value: frame.i === null ? '-' : String(frame.i) },
          { key: 'k', label: 'picked k', value: frame.k === null ? '-' : String(frame.k) },
          {
            key: 'f',
            label: 'settled',
            value: `${DECK.length - frame.fixedFrom} of ${DECK.length}`,
          },
        ]}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'position being filled' },
          { key: 'b', state: 'compare', label: 'random partner k' },
          { key: 'c', state: 'done', label: 'settled' },
        ]}
      />
    </Stage>
  );
}

export const fisherYates: AnimationSpec = fromFrames(
  {
    id: 'ml-fisher-yates',
    title: 'Fisher-Yates shuffle',
    blurb: 'The one-pass shuffle that is genuinely uniform, and why the obvious version is not.',
  },
  shuffleFrames,
  ShuffleFrame,
);

export const mathLogicAnimations: AnimationSpec[] = [
  sieve,
  mutilatedBoard,
  eggDrop,
  rejectionSampling,
  fisherYates,
];
