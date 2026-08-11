import {
  Caption,
  Chips,
  FlowSteps,
  Legend,
  Readout,
  Stage,
  type ChipSpec,
  type FlowStepSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. count++ is three operations, and two threads can interleave them.      */
/* ------------------------------------------------------------------------ */

const OPS: { key: string; thread: 'A' | 'B'; label: string }[] = [
  { key: 'a-read', thread: 'A', label: 'A: read count' },
  { key: 'b-read', thread: 'B', label: 'B: read count' },
  { key: 'a-add', thread: 'A', label: 'A: add 1 to its copy' },
  { key: 'b-add', thread: 'B', label: 'B: add 1 to its copy' },
  { key: 'a-write', thread: 'A', label: 'A: write its copy back' },
  { key: 'b-write', thread: 'B', label: 'B: write its copy back' },
];

interface RaceFrame {
  done: number;
  shared: number;
  tempA: number | null;
  tempB: number | null;
  caption: string;
  detail: string;
}

const raceFrames: RaceFrame[] = [
  {
    done: 0,
    shared: 0,
    tempA: null,
    tempB: null,
    caption:
      'count++ looks atomic and is not. It is three machine operations: read the value, add one, write it back. Two threads sharing count can be interleaved at any point between them.',
    detail: 'shared count = 0 · both threads about to increment',
  },
  {
    done: 1,
    shared: 0,
    tempA: 0,
    tempB: null,
    caption: 'Thread A reads count and gets 0 into a register of its own.',
    detail: 'A: temp = 0',
  },
  {
    done: 2,
    shared: 0,
    tempA: 0,
    tempB: 0,
    caption:
      'Before A can write back, the scheduler switches to B. B reads count and also gets 0 - it has no way to know A is mid-increment.',
    detail: 'B: temp = 0 · both now hold a stale 0',
  },
  {
    done: 3,
    shared: 0,
    tempA: 1,
    tempB: 0,
    caption: 'A adds one to its own copy. The shared variable has not changed yet.',
    detail: 'A: temp = 1 · shared count still 0',
  },
  {
    done: 4,
    shared: 0,
    tempA: 1,
    tempB: 1,
    caption: 'B adds one to its copy too. Two threads, two copies, both holding 1.',
    detail: 'B: temp = 1',
  },
  {
    done: 5,
    shared: 1,
    tempA: 1,
    tempB: 1,
    caption: 'A writes back: count is now 1. So far so good.',
    detail: 'shared count = 1',
  },
  {
    done: 6,
    shared: 1,
    tempA: null,
    tempB: null,
    caption:
      "B writes back its 1 - overwriting A's. Two increments happened and the counter reads 1. That is a lost update, and nothing crashed, nothing warned, and on most runs the interleaving never happens at all.",
    detail: 'expected 2 · got 1 · this is the bug that only appears in production',
  },
  {
    done: 6,
    shared: 2,
    tempA: null,
    tempB: null,
    caption:
      'The fix is mutual exclusion: make read-add-write indivisible, so a second thread cannot get in between. synchronized, an explicit lock, or an atomic type - and only one thread can be inside at a time.',
    detail: 'atomicity restored · count = 2',
  },
];

function RaceFrameView({ index }: { index: number }) {
  const frame = raceFrames[Math.min(Math.max(index, 0), raceFrames.length - 1)];
  const steps: FlowStepSpec[] = OPS.map((op, i) => ({
    key: op.key,
    label: op.label,
    state: i === frame.done - 1 ? 'active' : i < frame.done ? 'done' : 'muted',
  }));
  return (
    <Stage>
      <Readout
        items={[
          { key: 's', label: 'shared count', value: String(frame.shared) },
          { key: 'a', label: 'A temp', value: frame.tempA === null ? '—' : String(frame.tempA) },
          { key: 'b', label: 'B temp', value: frame.tempB === null ? '—' : String(frame.tempB) },
        ]}
      />
      <FlowSteps steps={steps} />
    </Stage>
  );
}

export const tlRace: AnimationSpec = fromFrames(
  {
    id: 'tl-race',
    title: 'A lost update, step by step',
    blurb: 'Two threads, one counter, six operations. Watch an increment disappear.',
  },
  raceFrames,
  RaceFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Circular wait, and the global ordering that prevents it.               */
/* ------------------------------------------------------------------------ */

interface DeadlockFrame {
  /** lock id -> holder */
  held: Record<string, string>;
  /** thread -> lock it is blocked on */
  waiting: Record<string, string>;
  cycle: boolean;
  ordered: boolean;
  caption: string;
  detail: string;
}

const LOCKS = ['L1', 'L2'];

const deadlockFrames: DeadlockFrame[] = [
  {
    held: {},
    waiting: {},
    cycle: false,
    ordered: false,
    caption:
      'Two threads and two locks. Thread A needs L1 then L2; thread B needs L2 then L1. Each one on its own is perfectly correct code.',
    detail: 'A: lock(L1) → lock(L2) · B: lock(L2) → lock(L1)',
  },
  {
    held: { L1: 'A' },
    waiting: {},
    cycle: false,
    ordered: false,
    caption: 'A takes L1.',
    detail: 'A holds L1',
  },
  {
    held: { L1: 'A', L2: 'B' },
    waiting: {},
    cycle: false,
    ordered: false,
    caption:
      'Before A can take L2, B is scheduled and takes it. Both threads are now holding one lock and about to ask for the other.',
    detail: 'A holds L1 · B holds L2',
  },
  {
    held: { L1: 'A', L2: 'B' },
    waiting: { A: 'L2' },
    cycle: false,
    ordered: false,
    caption: 'A asks for L2. B has it, so A blocks - while still holding L1.',
    detail: 'A waits on L2, holding L1',
  },
  {
    held: { L1: 'A', L2: 'B' },
    waiting: { A: 'L2', B: 'L1' },
    cycle: true,
    ordered: false,
    caption:
      'B asks for L1. A has it, so B blocks too. The wait-for graph now contains a cycle - A → L2 → B → L1 → A - and neither thread will ever move again. Nothing crashes; the program simply stops.',
    detail: 'circular wait · deadlock',
  },
  {
    held: {},
    waiting: {},
    cycle: false,
    ordered: true,
    caption:
      'Four conditions must all hold for this: mutual exclusion, hold-and-wait, no preemption, and circular wait. Breaking any one prevents it - and in practice you break the fourth, because the first three are usually not yours to give up.',
    detail: 'break circular wait: impose a global order on lock acquisition',
  },
  {
    held: { L1: 'A' },
    waiting: { B: 'L1' },
    cycle: false,
    ordered: true,
    caption:
      'Number the locks and require every thread to acquire them in increasing order. Now B must take L1 before L2 - so it blocks before acquiring anything, holding nothing.',
    detail: 'A holds L1 · B waits on L1, holding nothing',
  },
  {
    held: { L1: 'A', L2: 'A' },
    waiting: { B: 'L1' },
    cycle: false,
    ordered: true,
    caption:
      'A takes L2 unobstructed, finishes, and releases both; B then proceeds. A cycle cannot form, because an edge always points from a lower number to a higher one and can never point back.',
    detail: 'no cycle is expressible under a total order · this is the practical fix',
  },
];

function DeadlockFrameView({ index }: { index: number }) {
  const frame = deadlockFrames[Math.min(Math.max(index, 0), deadlockFrames.length - 1)];
  const lockChips: ChipSpec[] = LOCKS.map((lock) => ({
    key: lock,
    label: lock,
    sub: frame.held[lock] ? `held by ${frame.held[lock]}` : 'free',
    state: frame.cycle ? 'bad' : frame.held[lock] ? 'done' : 'idle',
  }));
  const threadChips: ChipSpec[] = ['A', 'B'].map((thread) => ({
    key: thread,
    label: `thread ${thread}`,
    sub: frame.waiting[thread] ? `blocked on ${frame.waiting[thread]}` : 'running',
    state: frame.cycle ? 'bad' : frame.waiting[thread] ? 'target' : 'active',
  }));
  return (
    <Stage>
      <Readout
        items={[
          {
            key: 'r',
            label: 'rule',
            value: frame.ordered ? 'acquire in increasing order' : 'no ordering rule',
          },
          { key: 's', label: 'state', value: frame.cycle ? 'deadlocked' : 'making progress' },
        ]}
      />
      <Chips chips={threadChips} label="threads" />
      <Chips chips={lockChips} label="locks" />
      <Caption>
        {frame.cycle
          ? 'A → L2 → B → L1 → A: a cycle in the wait-for graph'
          : frame.ordered
            ? 'every edge points from a lower-numbered lock to a higher one'
            : 'no cycle yet'}
      </Caption>
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'running' },
          { key: 't', state: 'target', label: 'blocked' },
          { key: 'b', state: 'bad', label: 'deadlocked' },
        ]}
      />
    </Stage>
  );
}

export const tlDeadlock: AnimationSpec = fromFrames(
  {
    id: 'tl-deadlock',
    title: 'Circular wait, then the fix',
    blurb:
      'Two correct threads that together stop forever - and one rule that makes it impossible.',
  },
  deadlockFrames,
  DeadlockFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. Semaphores force an order across threads.                              */
/* ------------------------------------------------------------------------ */

interface OrderFrame {
  permits: [number, number];
  ran: string[];
  blocked: string[];
  caption: string;
  detail: string;
}

const orderFrames: OrderFrame[] = [
  {
    permits: [0, 0],
    ran: [],
    blocked: [],
    caption:
      'Three threads call first(), second() and third() on one object, and they must run in that order. A boolean flag will not do it: checking a flag and acting on it is not atomic, and there is nothing to wait on.',
    detail: 'two semaphores, both drained to 0 in the constructor',
  },
  {
    permits: [0, 0],
    ran: [],
    blocked: ['second', 'third'],
    caption:
      'The constructor acquires both permits immediately, so both semaphores sit at zero. second and third each call acquire() on the semaphore in front of them and block right away - even if their threads were scheduled first.',
    detail: 'acquire() on an empty semaphore blocks until someone releases',
  },
  {
    permits: [1, 0],
    ran: ['first'],
    blocked: ['second', 'third'],
    caption:
      'Whenever first runs, it does its work and then releases semaphore 1. Order no longer depends on which thread the scheduler happened to pick.',
    detail: 'first() done → sem1.release()',
  },
  {
    permits: [0, 1],
    ran: ['first', 'second'],
    blocked: ['third'],
    caption:
      'second wakes, re-releases semaphore 1 so the permit is not consumed for good, does its work, and releases semaphore 2.',
    detail: 'sem1.acquire(); sem1.release(); … ; sem2.release()',
  },
  {
    permits: [0, 0],
    ran: ['first', 'second', 'third'],
    blocked: [],
    caption:
      'third wakes and runs. The order is now guaranteed no matter how the threads were scheduled - which is the whole point of a synchronisation primitive.',
    detail: 'first → second → third, always',
  },
  {
    permits: [0, 0],
    ran: ['first', 'second', 'third'],
    blocked: [],
    caption:
      'Why semaphores and not two locks? A lock in Java is owned by the thread that took it, and only that thread may release it. Locking in the constructor and unlocking from three other threads throws. A semaphore is just a permit count with no owner.',
    detail: 'lock ownership is the trap; semaphores have none',
  },
];

function OrderFrameView({ index }: { index: number }) {
  const frame = orderFrames[Math.min(Math.max(index, 0), orderFrames.length - 1)];
  const methods: ChipSpec[] = ['first', 'second', 'third'].map((name) => ({
    key: name,
    label: name,
    state: frame.ran.includes(name) ? 'done' : frame.blocked.includes(name) ? 'target' : 'idle',
  }));
  return (
    <Stage>
      <Readout
        items={[
          { key: 's1', label: 'sem1 permits', value: String(frame.permits[0]) },
          { key: 's2', label: 'sem2 permits', value: String(frame.permits[1]) },
        ]}
      />
      <Chips chips={methods} label="methods" />
      <Caption>
        {frame.ran.length === 3
          ? 'ordering achieved'
          : 'blocked threads wait on a permit, not on a flag'}
      </Caption>
      <Legend
        items={[
          { key: 'd', state: 'done', label: 'ran' },
          { key: 't', state: 'target', label: 'blocked on acquire()' },
        ]}
      />
    </Stage>
  );
}

export const tlOrdering: AnimationSpec = fromFrames(
  {
    id: 'tl-ordering',
    title: 'Forcing an order with semaphores',
    blurb: 'Three threads, one required sequence - and why two locks would throw instead.',
  },
  orderFrames,
  OrderFrameView,
);

export const threadsLocksAnimations: AnimationSpec[] = [tlRace, tlDeadlock, tlOrdering];
