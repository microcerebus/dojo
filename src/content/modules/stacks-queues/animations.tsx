import {
  Legend,
  QueueRow,
  Readout,
  Stage,
  StackColumn,
  type CellSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/**
 * `keySuffix` only disambiguates the React key across the two columns - it is
 * deliberately kept off `sub`, which is rendered.
 */
const cell = (label: string, state?: CellSpec['state'], keySuffix?: string): CellSpec => ({
  key: `${label}-${keySuffix ?? ''}`,
  label,
  ...(state ? { state } : {}),
});

/* ------------------------------------------------------------------------ */
/* 1. LIFO vs FIFO on the same operation sequence.                           */
/* ------------------------------------------------------------------------ */

type Op = { kind: 'push'; value: string } | { kind: 'pop' };

const OPS: Op[] = [
  { kind: 'push', value: 'A' },
  { kind: 'push', value: 'B' },
  { kind: 'push', value: 'C' },
  { kind: 'pop' },
  { kind: 'pop' },
  { kind: 'push', value: 'D' },
  { kind: 'pop' },
];

interface LifoFrame {
  stack: string[];
  queue: string[];
  stackOut: string[];
  queueOut: string[];
  touched: string | null;
  caption: string;
  detail: string;
}

const lifoFrames: LifoFrame[] = (() => {
  const stack: string[] = [];
  const queue: string[] = [];
  const stackOut: string[] = [];
  const queueOut: string[] = [];
  const frames: LifoFrame[] = [
    {
      stack: [],
      queue: [],
      stackOut: [],
      queueOut: [],
      touched: null,
      caption:
        'Same sequence of operations, two containers. The only difference is which end removal happens at - and that difference is the entire chapter.',
      detail: 'stack: add/remove at the top · queue: add at the back, remove at the front',
    },
  ];
  for (const op of OPS) {
    if (op.kind === 'push') {
      stack.push(op.value);
      queue.push(op.value);
      frames.push({
        stack: [...stack],
        queue: [...queue],
        stackOut: [...stackOut],
        queueOut: [...queueOut],
        touched: op.value,
        caption: `Add ${op.value}. Both containers put it on the same end - the difference has not shown up yet.`,
        detail: `push/enqueue ${op.value} · both O(1)`,
      });
    } else {
      const fromStack = stack.pop() as string;
      const fromQueue = queue.shift() as string;
      stackOut.push(fromStack);
      queueOut.push(fromQueue);
      frames.push({
        stack: [...stack],
        queue: [...queue],
        stackOut: [...stackOut],
        queueOut: [...queueOut],
        touched: null,
        caption: `Remove: the stack hands back ${fromStack} (most recent), the queue hands back ${fromQueue} (oldest).`,
        detail: `pop → ${fromStack} · dequeue → ${fromQueue}`,
      });
    }
  }
  frames.push({
    stack: [...stack],
    queue: [...queue],
    stackOut: [...stackOut],
    queueOut: [...queueOut],
    touched: null,
    caption: `Removal order: stack ${stackOut.join(', ')} versus queue ${queueOut.join(', ')}. This is why DFS uses a stack and BFS uses a queue.`,
    detail: 'depth-first wants the newest lead; breadth-first wants the oldest',
  });
  return frames;
})();

function LifoFrameView({ index }: { index: number }) {
  const frame = lifoFrames[Math.min(index, lifoFrames.length - 1)];
  return (
    <Stage>
      <div className="viz__stacks">
        <StackColumn
          label="stack (LIFO)"
          hint="push / pop at the top"
          items={frame.stack.map((value) =>
            cell(value, value === frame.touched ? 'active' : 'idle', 'stack'),
          )}
        />
        <div>
          <QueueRow
            label="queue (FIFO)"
            items={frame.queue.map((value) =>
              cell(value, value === frame.touched ? 'active' : 'idle', 'queue'),
            )}
          />
        </div>
      </div>
      <Readout
        items={[
          { key: 's', label: 'stack out', value: frame.stackOut.join(' ') || '—' },
          { key: 'q', label: 'queue out', value: frame.queueOut.join(' ') || '—' },
        ]}
      />
    </Stage>
  );
}

export const stackVsQueue: AnimationSpec = fromFrames(
  {
    id: 'sq-lifo-fifo',
    title: 'LIFO vs FIFO, side by side',
    blurb: 'One operation sequence, two removal orders.',
  },
  lifoFrames,
  LifoFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. A queue built from two stacks.                                          */
/* ------------------------------------------------------------------------ */

type QOp = { kind: 'enqueue'; value: string } | { kind: 'dequeue' };

const Q_OPS: QOp[] = [
  { kind: 'enqueue', value: '1' },
  { kind: 'enqueue', value: '2' },
  { kind: 'enqueue', value: '3' },
  { kind: 'dequeue' },
  { kind: 'dequeue' },
  { kind: 'enqueue', value: '4' },
  { kind: 'dequeue' },
  { kind: 'dequeue' },
];

interface TwoStackFrame {
  inStack: string[];
  outStack: string[];
  transferring: boolean;
  moves: number;
  ops: number;
  caption: string;
  detail: string;
}

const twoStackFrames: TwoStackFrame[] = (() => {
  const inStack: string[] = [];
  const outStack: string[] = [];
  let moves = 0;
  let ops = 0;
  const frames: TwoStackFrame[] = [
    {
      inStack: [],
      outStack: [],
      transferring: false,
      moves: 0,
      ops: 0,
      caption:
        'Two stacks. Everything new goes on "in". Everything leaving comes off "out". Pouring one into the other reverses the order, which turns LIFO into FIFO.',
      detail: 'the golden rule: only pour when "out" is empty',
    },
  ];
  const snapshot = (caption: string, detail: string, transferring = false) => {
    frames.push({
      inStack: [...inStack],
      outStack: [...outStack],
      transferring,
      moves,
      ops,
      caption,
      detail,
    });
  };
  for (const op of Q_OPS) {
    if (op.kind === 'enqueue') {
      inStack.push(op.value);
      ops++;
      snapshot(
        `Enqueue ${op.value}: push onto "in" and stop. Always O(1).`,
        `in: [${inStack.join(', ')}] · out: [${outStack.join(', ')}]`,
      );
    } else {
      if (outStack.length === 0) {
        while (inStack.length > 0) {
          outStack.push(inStack.pop() as string);
          moves++;
        }
        snapshot(
          `"out" is empty, so pour everything across. The order flips, so the oldest item is now on top of "out".`,
          `moved ${moves} items in total so far · this single dequeue cost ${outStack.length}`,
          true,
        );
      }
      const value = outStack.pop() as string;
      ops++;
      snapshot(
        `Dequeue returns ${value} - the oldest item, straight off the top of "out". No pouring needed this time.`,
        `in: [${inStack.join(', ')}] · out: [${outStack.join(', ')}] · total moves ${moves} over ${ops} operations`,
      );
    }
  }
  frames.push({
    inStack: [...inStack],
    outStack: [...outStack],
    transferring: false,
    moves,
    ops,
    caption: `Every element is pushed and popped at most twice, no matter how the operations interleave. One dequeue can cost O(n), but the average over any sequence is O(1) - amortised, exactly like array doubling.`,
    detail: `${moves} moves across ${ops} operations`,
  });
  return frames;
})();

function TwoStackFrameView({ index }: { index: number }) {
  const frame = twoStackFrames[Math.min(index, twoStackFrames.length - 1)];
  return (
    <Stage>
      <div className="viz__stacks">
        <StackColumn
          label="in"
          hint="enqueue pushes here"
          items={frame.inStack.map((value) =>
            cell(value, frame.transferring ? 'muted' : 'idle', 'in'),
          )}
        />
        <StackColumn
          label="out"
          hint="dequeue pops here"
          items={frame.outStack.map((value, i) =>
            cell(
              value,
              frame.transferring ? 'compare' : i === frame.outStack.length - 1 ? 'active' : 'idle',
              'out',
            ),
          )}
        />
      </div>
      <Readout
        items={[
          { key: 'm', label: 'total moves', value: String(frame.moves) },
          { key: 'o', label: 'operations', value: String(frame.ops) },
        ]}
      />
    </Stage>
  );
}

export const queueFromStacks: AnimationSpec = fromFrames(
  {
    id: 'sq-queue-two-stacks',
    title: 'A queue from two stacks',
    blurb: 'Pouring reverses order. Only pour when you have to, and it is O(1) amortised.',
  },
  twoStackFrames,
  TwoStackFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. Min stack: keep the answer, do not recompute it.                       */
/* ------------------------------------------------------------------------ */

type MinOp = { kind: 'push'; value: number } | { kind: 'pop' };

const MIN_OPS: MinOp[] = [
  { kind: 'push', value: 5 },
  { kind: 'push', value: 3 },
  { kind: 'push', value: 7 },
  { kind: 'push', value: 2 },
  { kind: 'pop' },
  { kind: 'pop' },
  { kind: 'pop' },
];

interface MinFrame {
  main: number[];
  mins: number[];
  caption: string;
  detail: string;
}

const minFrames: MinFrame[] = (() => {
  const main: number[] = [];
  const mins: number[] = [];
  const frames: MinFrame[] = [
    {
      main: [],
      mins: [],
      caption:
        'A stack that answers min() in O(1). Scanning is O(n), and a single "current min" variable breaks as soon as you pop it - so keep a second stack of minima.',
      detail: 'the min stack records what the minimum was when each element arrived',
    },
  ];
  for (const op of MIN_OPS) {
    if (op.kind === 'push') {
      main.push(op.value);
      const currentMin = mins.length === 0 ? op.value : Math.min(mins[mins.length - 1], op.value);
      mins.push(currentMin);
      frames.push({
        main: [...main],
        mins: [...mins],
        caption:
          currentMin === op.value && (mins.length === 1 || op.value < mins[mins.length - 2])
            ? `Push ${op.value}. It is the new minimum, so push ${op.value} onto the min stack too.`
            : `Push ${op.value}. It is not smaller than the current minimum, so repeat ${currentMin} on the min stack.`,
        detail: `min() = ${currentMin} - just read the top of the min stack`,
      });
    } else {
      const value = main.pop() as number;
      mins.pop();
      const currentMin = mins[mins.length - 1];
      frames.push({
        main: [...main],
        mins: [...mins],
        caption: `Pop ${value}. Pop the min stack in lockstep, and the previous minimum is instantly correct again - no rescan.`,
        detail:
          main.length === 0 ? 'stack empty, min() undefined' : `min() = ${currentMin}`,
      });
    }
  }
  frames.push({
    main: [...main],
    mins: [...mins],
    caption:
      'Every operation stays O(1); the cost is O(n) extra space. Storing (value, minSoFar) pairs, or only pushing on a strict new minimum, are the two standard space optimisations.',
    detail: 'time O(1) for push/pop/min · space O(n)',
  });
  return frames;
})();

function MinFrameView({ index }: { index: number }) {
  const frame = minFrames[Math.min(index, minFrames.length - 1)];
  return (
    <Stage>
      <div className="viz__stacks">
        <StackColumn
          label="stack"
          items={frame.main.map((value, i) =>
            cell(
              String(value),
              i === frame.main.length - 1 ? 'active' : 'idle',
              `m${i}`,
            ),
          )}
        />
        <StackColumn
          label="min stack"
          hint="top = current minimum"
          items={frame.mins.map((value, i) =>
            cell(
              String(value),
              i === frame.mins.length - 1 ? 'target' : 'idle',
              `n${i}`,
            ),
          )}
        />
      </div>
      <Readout
        items={[
          {
            key: 'min',
            label: 'min()',
            value: frame.mins.length ? String(frame.mins[frame.mins.length - 1]) : '—',
          },
        ]}
      />
      <Legend items={[{ key: 't', state: 'target', label: 'the answer, already computed' }]} />
    </Stage>
  );
}

export const minStack: AnimationSpec = fromFrames(
  {
    id: 'sq-min-stack',
    title: 'Stack with O(1) min',
    blurb: 'Trade space for time by recording the answer as you go.',
  },
  minFrames,
  MinFrameView,
);

/* ------------------------------------------------------------------------ */
/* 4. Sorting a stack with one temporary stack.                              */
/* ------------------------------------------------------------------------ */

interface SortFrame {
  source: number[];
  helper: number[];
  held: number | null;
  caption: string;
  detail: string;
}

const sortFrames: SortFrame[] = (() => {
  const source = [3, 1, 4, 2]; // index 0 is the bottom
  const helper: number[] = [];
  const frames: SortFrame[] = [
    {
      source: [...source],
      helper: [],
      held: null,
      caption:
        'Sort a stack using one extra stack and no arrays. Keep the helper stack sorted at all times: biggest on top.',
      detail: 'invariant: helper is always in sorted order',
    },
  ];
  let moves = 0;
  while (source.length > 0) {
    const held = source.pop() as number;
    moves++;
    frames.push({
      source: [...source],
      helper: [...helper],
      held,
      caption: `Take ${held} off the source stack and hold it in a variable.`,
      detail: `held = ${held} · helper top = ${helper.length ? helper[helper.length - 1] : '∅'}`,
    });
    while (helper.length > 0 && helper[helper.length - 1] > held) {
      const moved = helper.pop() as number;
      source.push(moved);
      moves++;
      frames.push({
        source: [...source],
        helper: [...helper],
        held,
        caption: `helper's top (${moved}) is bigger than ${held}, so it has to move back to the source to make room. This shuffling is why the algorithm is O(n²).`,
        detail: `moved ${moved} back · total moves ${moves}`,
      });
    }
    helper.push(held);
    frames.push({
      source: [...source],
      helper: [...helper],
      held: null,
      caption: `Now ${held} sits in the right place on the helper stack, and the helper is still sorted.`,
      detail: `helper: ${helper.join(' → ')} (bottom to top)`,
    });
  }
  frames.push({
    source: [...source],
    helper: [...helper],
    held: null,
    caption: `Sorted: ${helper.join(', ')} bottom to top. O(n²) time and O(n) space - and if you need smallest-on-top instead, pour it back once.`,
    detail: `${moves} pushes/pops in total`,
  });
  return frames;
})();

function SortFrameView({ index }: { index: number }) {
  const frame = sortFrames[Math.min(index, sortFrames.length - 1)];
  return (
    <Stage>
      <div className="viz__stacks">
        <StackColumn
          label="source"
          items={frame.source.map((value, i) =>
            cell(String(value), i === frame.source.length - 1 ? 'active' : 'idle', `s${i}`),
          )}
        />
        <StackColumn
          label="helper"
          hint="always sorted"
          items={frame.helper.map((value, i) =>
            cell(String(value), 'done', `h${i}`),
          )}
        />
      </div>
      <Readout
        items={[{ key: 'h', label: 'held', value: frame.held === null ? '—' : String(frame.held) }]}
      />
    </Stage>
  );
}

export const sortStack: AnimationSpec = fromFrames(
  {
    id: 'sq-sort-stack',
    title: 'Sorting a stack with one helper',
    blurb: 'Hold one element, make room for it, put it back. Repeat.',
  },
  sortFrames,
  SortFrameView,
);

export const stacksQueuesAnimations: AnimationSpec[] = [
  stackVsQueue,
  queueFromStacks,
  minStack,
  sortStack,
];
