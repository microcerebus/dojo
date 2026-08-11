import { Legend, NodeChain, Readout, Stage, type NodeSpec } from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. The runner: kth node from the end in one pass.                         */
/* ------------------------------------------------------------------------ */

const LIST = [1, 2, 3, 4, 5, 6];
const K = 2;

interface RunnerFrame {
  lead: number;
  trail: number | null;
  caption: string;
  detail: string;
}

const runnerFrames: RunnerFrame[] = (() => {
  const frames: RunnerFrame[] = [
    {
      lead: 0,
      trail: null,
      caption: `You cannot walk backwards in a singly linked list, and you are not allowed a second pass. So build the gap first: send one pointer ${K} nodes ahead.`,
      detail: `k = ${K} · list length is unknown to the algorithm`,
    },
  ];
  for (let step = 1; step <= K; step++) {
    frames.push({
      lead: step,
      trail: null,
      caption: `Advance lead to node ${LIST[step]}. That is ${step} of ${K} steps of head start.`,
      detail: `gap so far: ${step}`,
    });
  }
  frames.push({
    lead: K,
    trail: 0,
    caption: `Now put trail at the head. The gap between them is exactly ${K} and will stay that way.`,
    detail: `invariant: lead index − trail index = ${K}`,
  });
  let lead = K;
  let trail = 0;
  while (lead < LIST.length - 1) {
    lead++;
    trail++;
    frames.push({
      lead,
      trail,
      caption: `Move both forward one step. lead is on ${LIST[lead]}, trail is on ${LIST[trail]}.`,
      detail: `gap held at ${lead - trail}`,
    });
  }
  frames.push({
    lead: LIST.length - 1,
    trail,
    caption: `lead is on the last node, so trail is sitting on the ${K}th node from the end: ${LIST[trail]}. One pass, constant extra space.`,
    detail: 'O(n) time, O(1) space',
  });
  return frames;
})();

function RunnerFrameView({ index }: { index: number }) {
  const frame = runnerFrames[Math.min(index, runnerFrames.length - 1)];
  const nodes: NodeSpec[] = LIST.map((value, i) => {
    const tags: string[] = [];
    if (i === frame.lead) tags.push('lead');
    if (i === frame.trail) tags.push('trail');
    return {
      key: `n-${i}`,
      label: String(value),
      ...(tags.length ? { tag: tags.join(' + ') } : {}),
      state: i === frame.trail ? 'done' : i === frame.lead ? 'active' : 'idle',
    };
  });
  return (
    <Stage tall>
      <Readout
        items={[
          { key: 'k', label: 'k', value: String(K) },
          {
            key: 'gap',
            label: 'gap',
            value: frame.trail === null ? `${frame.lead}` : `${frame.lead - frame.trail}`,
          },
        ]}
      />
      <NodeChain nodes={nodes} />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'lead' },
          { key: 'd', state: 'done', label: 'trail (the answer)' },
        ]}
      />
    </Stage>
  );
}

export const runnerPointer: AnimationSpec = fromFrames(
  {
    id: 'll-runner',
    title: 'The runner: kth from the end',
    blurb: 'Two pointers, a fixed gap, one pass. The pattern behind half of the chapter.',
  },
  runnerFrames,
  RunnerFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Floyd cycle detection, including finding the loop entry.               */
/* ------------------------------------------------------------------------ */

const CYCLE_VALUES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const LOOP_START = 3; // G's next points back to D

const nextIndex = (i: number) => (i === CYCLE_VALUES.length - 1 ? LOOP_START : i + 1);

interface CycleFrame {
  slow: number;
  fast: number;
  phase: 'detect' | 'meet' | 'locate' | 'found';
  caption: string;
  detail: string;
}

const cycleFrames: CycleFrame[] = (() => {
  const frames: CycleFrame[] = [];
  let slow = 0;
  let fast = 0;
  frames.push({
    slow,
    fast,
    phase: 'detect',
    caption: `Both pointers start at the head. slow takes one step at a time, fast takes two. If the list ends, there is no loop; if there is a loop, fast must eventually lap slow.`,
    detail: 'a faster runner on a circular track always catches a slower one',
  });
  for (let step = 0; step < 12; step++) {
    slow = nextIndex(slow);
    fast = nextIndex(nextIndex(fast));
    if (slow === fast) {
      frames.push({
        slow,
        fast,
        phase: 'meet',
        caption: `They meet at ${CYCLE_VALUES[slow]}. That proves a loop exists - but this is not the start of the loop, and that is the part people get wrong.`,
        detail: `collision node: ${CYCLE_VALUES[slow]}`,
      });
      break;
    }
    frames.push({
      slow,
      fast,
      phase: 'detect',
      caption: `slow → ${CYCLE_VALUES[slow]}, fast → ${CYCLE_VALUES[fast]}. Still apart.`,
      detail: `step ${step + 1} · slow moved 1, fast moved 2`,
    });
  }
  // Phase two: move one pointer back to the head, then advance both by one.
  let probe = 0;
  let inLoop = slow;
  frames.push({
    slow: probe,
    fast: inLoop,
    phase: 'locate',
    caption: `Now move one pointer back to the head and leave the other at the collision. Advance both one step at a time - they will meet exactly at the loop entry.`,
    detail: 'the distance head→entry equals the distance collision→entry',
  });
  while (probe !== inLoop) {
    probe = nextIndex(probe);
    inLoop = nextIndex(inLoop);
    if (probe === inLoop) {
      frames.push({
        slow: probe,
        fast: inLoop,
        phase: 'found',
        caption: `They meet at ${CYCLE_VALUES[probe]}: the first node of the loop. O(n) time, O(1) space, no hash set needed.`,
        detail: `loop starts at ${CYCLE_VALUES[probe]}`,
      });
      break;
    }
    frames.push({
      slow: probe,
      fast: inLoop,
      phase: 'locate',
      caption: `Both step once: ${CYCLE_VALUES[probe]} and ${CYCLE_VALUES[inLoop]}.`,
      detail: 'same speed now - one step each',
    });
  }
  return frames;
})();

function CycleFrameView({ index }: { index: number }) {
  const frame = cycleFrames[Math.min(index, cycleFrames.length - 1)];
  const nodes: NodeSpec[] = CYCLE_VALUES.map((value, i) => {
    const tags: string[] = [];
    if (i === frame.slow)
      tags.push(frame.phase === 'locate' || frame.phase === 'found' ? 'p1' : 'slow');
    if (i === frame.fast)
      tags.push(frame.phase === 'locate' || frame.phase === 'found' ? 'p2' : 'fast');
    return {
      key: `c-${i}`,
      label: value,
      ...(tags.length ? { tag: tags.join(' + ') } : {}),
      state:
        frame.phase === 'found' && i === frame.slow
          ? 'done'
          : frame.slow === frame.fast && i === frame.slow
            ? 'target'
            : i === frame.slow
              ? 'active'
              : i === frame.fast
                ? 'compare'
                : i === LOOP_START
                  ? 'idle'
                  : 'idle',
    };
  });
  return (
    <Stage tall>
      <Readout
        items={[
          {
            key: 'p',
            label: 'phase',
            value:
              frame.phase === 'detect'
                ? 'detect'
                : frame.phase === 'meet'
                  ? 'collision'
                  : 'find entry',
          },
        ]}
      />
      <NodeChain
        nodes={nodes}
        tail={null}
        loopFrom={{ from: CYCLE_VALUES.length - 1, to: LOOP_START }}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'slow / p1' },
          { key: 'c', state: 'compare', label: 'fast / p2' },
          { key: 't', state: 'target', label: 'meeting point' },
        ]}
      />
    </Stage>
  );
}

export const floydCycle: AnimationSpec = fromFrames(
  {
    id: 'll-floyd',
    title: 'Floyd cycle detection',
    blurb: 'Detect the loop, then find where it starts - the second half is the interview.',
  },
  cycleFrames,
  CycleFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. Reversal: three pointers rewiring one link at a time.                   */
/* ------------------------------------------------------------------------ */

const REV = [1, 2, 3, 4];

interface ReverseFrame {
  /** values in the already-reversed prefix, head first */
  reversed: number[];
  /** values still in the original list, head first */
  remaining: number[];
  caption: string;
  detail: string;
}

const reverseFrames: ReverseFrame[] = (() => {
  const frames: ReverseFrame[] = [
    {
      reversed: [],
      remaining: [...REV],
      caption:
        'Reversal is one link flip repeated. Keep three references: prev (the reversed part), curr (the node being flipped) and next (so you do not lose the rest).',
      detail: 'prev = null · curr = head',
    },
  ];
  const reversed: number[] = [];
  const remaining = [...REV];
  while (remaining.length > 0) {
    const value = remaining.shift() as number;
    reversed.unshift(value);
    frames.push({
      reversed: [...reversed],
      remaining: [...remaining],
      caption: `Save next (${remaining.length ? remaining[0] : 'null'}), point ${value}'s next at prev, then slide prev and curr forward one node.`,
      detail: `prev = ${value} · curr = ${remaining.length ? remaining[0] : 'null'} · flipped ${reversed.length}/${REV.length}`,
    });
  }
  frames.push({
    reversed: [...reversed],
    remaining: [],
    caption:
      'curr is null, so prev is the new head. O(n) time, O(1) space - and the recursive version costs O(n) stack instead.',
    detail: 'the order the three assignments happen in is the whole trick',
  });
  return frames;
})();

function ReverseFrameView({ index }: { index: number }) {
  const frame = reverseFrames[Math.min(index, reverseFrames.length - 1)];
  return (
    <Stage tall>
      <div className="viz__note">reversed so far (prev)</div>
      {frame.reversed.length ? (
        <NodeChain
          nodes={frame.reversed.map((value, i) => ({
            key: `r-${value}`,
            label: String(value),
            ...(i === 0 ? { tag: 'prev' } : {}),
            state: 'done',
          }))}
        />
      ) : (
        <p className="viz__note">∅ (prev = null)</p>
      )}
      <div className="viz__note">still to do (curr →)</div>
      {frame.remaining.length ? (
        <NodeChain
          nodes={frame.remaining.map((value, i) => ({
            key: `m-${value}`,
            label: String(value),
            ...(i === 0 ? { tag: 'curr' } : {}),
            state: i === 0 ? 'active' : 'idle',
          }))}
        />
      ) : (
        <p className="viz__note">∅ (curr = null → done)</p>
      )}
    </Stage>
  );
}

export const listReversal: AnimationSpec = fromFrames(
  {
    id: 'll-reversal',
    title: 'Reversing a list, link by link',
    blurb: 'prev, curr, next - and the exact order the three assignments must happen in.',
  },
  reverseFrames,
  ReverseFrameView,
);

/* ------------------------------------------------------------------------ */
/* 4. Partition with two dummy-headed lists.                                 */
/* ------------------------------------------------------------------------ */

const PART = [3, 5, 8, 5, 10, 2, 1];
const PIVOT = 5;

interface PartitionFrame {
  at: number;
  before: number[];
  after: number[];
  caption: string;
  detail: string;
}

const partitionFrames: PartitionFrame[] = (() => {
  const frames: PartitionFrame[] = [
    {
      at: -1,
      before: [],
      after: [],
      caption: `Partition around ${PIVOT}: every node smaller than ${PIVOT} must come before every node that is not. The order within each group does not matter, which is what makes this cheap.`,
      detail: 'grow two separate lists, then join them - no swapping, no counting',
    },
  ];
  const before: number[] = [];
  const after: number[] = [];
  PART.forEach((value, i) => {
    const goesBefore = value < PIVOT;
    if (goesBefore) before.push(value);
    else after.push(value);
    frames.push({
      at: i,
      before: [...before],
      after: [...after],
      caption: `${value} ${goesBefore ? `< ${PIVOT}` : `≥ ${PIVOT}`}, so append it to the ${goesBefore ? '"before"' : '"after"'} list.`,
      detail: `before: ${before.length ? before.join(' → ') : '∅'} · after: ${after.length ? after.join(' → ') : '∅'}`,
    });
  });
  frames.push({
    at: PART.length,
    before: [...before],
    after: [...after],
    caption:
      'Join the tail of "before" to the head of "after". One pass, stable-enough, O(1) extra space beyond the two head pointers.',
    detail: `result: ${[...before, ...after].join(' → ')}`,
  });
  return frames;
})();

function PartitionFrameView({ index }: { index: number }) {
  const frame = partitionFrames[Math.min(index, partitionFrames.length - 1)];
  const finished = frame.at >= PART.length;
  return (
    <Stage tall>
      <NodeChain
        nodes={PART.map((value, i) => ({
          key: `p-${i}`,
          label: String(value),
          ...(i === frame.at ? { tag: 'curr' } : {}),
          state: i === frame.at ? 'active' : i < frame.at ? 'muted' : 'idle',
        }))}
      />
      <div className="viz__note">two lists being grown</div>
      <NodeChain
        nodes={[
          ...frame.before.map((value, i) => ({
            key: `b-${i}`,
            label: String(value),
            state: 'done' as const,
          })),
          ...(finished
            ? frame.after.map((value, i) => ({
                key: `a-${i}`,
                label: String(value),
                state: 'compare' as const,
              }))
            : []),
        ]}
        tail={finished ? '∅' : null}
      />
      {finished ? null : (
        <NodeChain
          nodes={frame.after.map((value, i) => ({
            key: `a-${i}`,
            label: String(value),
            state: 'compare' as const,
          }))}
        />
      )}
      <Legend
        items={[
          { key: 'd', state: 'done', label: `before (< ${PIVOT})` },
          { key: 'c', state: 'compare', label: `after (≥ ${PIVOT})` },
        ]}
      />
    </Stage>
  );
}

export const partitionList: AnimationSpec = fromFrames(
  {
    id: 'll-partition',
    title: 'Partition with two growing lists',
    blurb: 'The dummy-head trick: build two chains, then splice. No index arithmetic.',
  },
  partitionFrames,
  PartitionFrameView,
);

export const linkedListsAnimations: AnimationSpec[] = [
  runnerPointer,
  floydCycle,
  listReversal,
  partitionList,
];
