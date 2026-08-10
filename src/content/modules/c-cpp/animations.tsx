import {
  Caption,
  Cells,
  Chips,
  FlowSteps,
  Legend,
  Readout,
  Stage,
  StackColumn,
  type CellSpec,
  type CellState,
  type ChipSpec,
  type FlowStepSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. Virtual dispatch through a vtable.                                     */
/* ------------------------------------------------------------------------ */

const DISPATCH: { key: string; label: string; detail: string }[] = [
  { key: 'call', label: 'p->aboutMe()', detail: 'p is declared Person*, but actually points at a Student' },
  { key: 'static', label: 'Not virtual? Resolve now', detail: 'Static binding: the compiler picks by the declared type' },
  { key: 'vptr', label: 'Virtual? Follow the object\'s vptr', detail: 'Every polymorphic object carries a hidden pointer to its class vtable' },
  { key: 'vtable', label: 'Read the slot in the vtable', detail: 'One slot per virtual function, filled with the most derived override' },
  { key: 'run', label: 'Call whatever the slot holds', detail: 'Dynamic binding: the real type decides, at runtime' },
];

interface VtFrame {
  step: number;
  virtual: boolean;
  prints: string | null;
  caption: string;
  detail: string;
}

const vtFrames: VtFrame[] = [
  {
    step: 0,
    virtual: false,
    prints: null,
    caption:
      'Person* p = new Student(); p->aboutMe(); - a base-class pointer holding a derived object. What gets printed depends entirely on one keyword.',
    detail: 'declared type: Person* · actual type: Student',
  },
  {
    step: 1,
    virtual: false,
    prints: 'I am a person.',
    caption:
      'Without virtual, the compiler resolves the call at compile time from the declared type alone. It has no idea a Student is on the other end - so the base implementation runs. This is static binding.',
    detail: 'compile-time decision · Person::aboutMe',
  },
  {
    step: 2,
    virtual: true,
    prints: null,
    caption:
      'Mark aboutMe virtual and the machinery appears. The compiler builds one vtable per class - an array of function pointers - and gives every object a hidden vptr pointing at its own class\'s table.',
    detail: 'Student object → vptr → Student vtable',
  },
  {
    step: 3,
    virtual: true,
    prints: null,
    caption:
      'The Student vtable has the same slot layout as Person\'s. Slot 0 holds Student::aboutMe because Student overrode it; anything Student did not override still points at Person\'s version.',
    detail: 'slot 0: Student::aboutMe · slot 1: inherited from Person',
  },
  {
    step: 4,
    virtual: true,
    prints: 'I am a student.',
    caption:
      'So the call becomes: read the vptr, index the table, jump. One extra indirection at runtime, and the most derived implementation always wins - which is exactly what you want.',
    detail: 'runtime decision · Student::aboutMe · cost: one pointer hop',
  },
  {
    step: 4,
    virtual: true,
    prints: 'Deleting a student. / Deleting a person.',
    caption:
      'This is also why a polymorphic base needs a virtual destructor. delete p through a Person* runs only ~Person unless the destructor is virtual - the Student half is silently leaked. Make it virtual and both run, derived first.',
    detail: 'non-virtual destructor + base pointer = a leak the compiler will not warn about',
  },
];

function VtFrameView({ index }: { index: number }) {
  const frame = vtFrames[Math.min(Math.max(index, 0), vtFrames.length - 1)];
  const steps: FlowStepSpec[] = DISPATCH.filter(
    (item) => (item.key === 'static') !== frame.virtual || item.key === 'call',
  ).map((item) => {
    const position = DISPATCH.findIndex((entry) => entry.key === item.key);
    return {
      key: item.key,
      label: item.label,
      ...(position === frame.step ? { detail: item.detail } : {}),
      state: position === frame.step ? 'active' : position < frame.step ? 'done' : 'muted',
    };
  });
  return (
    <Stage>
      <Readout
        items={[
          { key: 'v', label: 'aboutMe', value: frame.virtual ? 'virtual' : 'not virtual' },
          { key: 'p', label: 'prints', value: frame.prints ?? '—' },
        ]}
      />
      <FlowSteps steps={steps} />
    </Stage>
  );
}

export const cppVtable: AnimationSpec = fromFrames(
  {
    id: 'cpp-vtable',
    title: 'Virtual dispatch, one hop at a time',
    blurb: 'The same call site, with and without virtual. Watch where the decision gets made.',
  },
  vtFrames,
  VtFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Shallow copy vs deep copy.                                             */
/* ------------------------------------------------------------------------ */

interface CopyFrame {
  mode: 'shallow' | 'deep';
  /** which buffer each object points at, or null for none */
  points: [number | null, number | null];
  buffers: { label: string; state: CellState }[];
  note: string;
  caption: string;
  detail: string;
}

const copyFrames: CopyFrame[] = [
  {
    mode: 'shallow',
    points: [0, null],
    buffers: [{ label: '"hello"', state: 'done' }],
    note: 'src owns one heap buffer',
    caption:
      'A struct holding a char* ptr into the heap. src was constructed, so it owns that buffer and its destructor will free it.',
    detail: 'src.ptr → buffer A',
  },
  {
    mode: 'shallow',
    points: [0, 0],
    buffers: [{ label: '"hello"', state: 'compare' }],
    note: 'both point at the same buffer',
    caption:
      'A shallow copy copies the member values - which for a pointer means copying the address. Now src.ptr and dest.ptr hold the same address. The bytes were never duplicated.',
    detail: 'dest.ptr = src.ptr · one buffer, two owners',
  },
  {
    mode: 'shallow',
    points: [0, 0],
    buffers: [{ label: 'freed', state: 'bad' }],
    note: 'dest went out of scope and freed it',
    caption:
      'dest goes out of scope and its destructor frees the buffer. src is still alive and still holds that address - it is now a dangling pointer, and reading it is undefined behaviour.',
    detail: 'src.ptr → freed memory · reading it may work, may crash, may corrupt',
  },
  {
    mode: 'shallow',
    points: [0, null],
    buffers: [{ label: '💥', state: 'bad' }],
    note: 'src frees it again: double free',
    caption:
      'Then src goes out of scope too and frees the same block a second time. A double free corrupts the allocator, and the crash usually lands somewhere unrelated - which is what makes this bug so expensive.',
    detail: 'this is the entire argument for deep copies and for smart pointers',
  },
  {
    mode: 'deep',
    points: [0, 1],
    buffers: [
      { label: '"hello"', state: 'done' },
      { label: '"hello"', state: 'active' },
    ],
    note: 'each object owns its own buffer',
    caption:
      'A deep copy allocates a new buffer and copies the contents into it. Each object owns exactly one block, each destructor frees exactly one block, and neither can be surprised by the other.',
    detail: 'dest.ptr = malloc(len+1); strcpy(dest.ptr, src.ptr)',
  },
  {
    mode: 'deep',
    points: [0, 1],
    buffers: [
      { label: '"hello"', state: 'done' },
      { label: '"HELLO"', state: 'done' },
    ],
    note: 'independent - mutating one leaves the other alone',
    caption:
      'Independence is the other half of what you bought. Deep copy by default; reach for shallow only when you deliberately want shared, read-only data and have decided who frees it.',
    detail: 'copy constructor + assignment operator + destructor - fix all three, or none',
  },
];

function CopyFrameView({ index }: { index: number }) {
  const frame = copyFrames[Math.min(Math.max(index, 0), copyFrames.length - 1)];
  const objects: ChipSpec[] = [
    {
      key: 'src',
      label: 'src.ptr',
      sub: frame.points[0] === null ? '∅' : `→ ${String.fromCharCode(65 + frame.points[0])}`,
      state: 'active',
    },
    {
      key: 'dest',
      label: 'dest.ptr',
      sub: frame.points[1] === null ? '∅' : `→ ${String.fromCharCode(65 + frame.points[1])}`,
      state: frame.points[1] === null ? 'muted' : 'compare',
    },
  ];
  return (
    <Stage>
      <Readout items={[{ key: 'm', label: 'copy', value: frame.mode }]} />
      <Chips chips={objects} label="objects on the stack" />
      <Chips
        chips={frame.buffers.map((buffer, i) => ({
          key: `buf-${i}`,
          label: buffer.label,
          sub: `block ${String.fromCharCode(65 + i)}`,
          state: buffer.state,
        }))}
        label="heap buffers"
      />
      <Caption>{frame.note}</Caption>
      <Legend
        items={[
          { key: 'd', state: 'done', label: 'live, single owner' },
          { key: 'c', state: 'compare', label: 'shared' },
          { key: 'b', state: 'bad', label: 'freed / invalid' },
        ]}
      />
    </Stage>
  );
}

export const cppCopy: AnimationSpec = fromFrames(
  {
    id: 'cpp-copy',
    title: 'Shallow copy, and how it kills you',
    blurb: 'Two pointers, one buffer, two destructors. Then the version that works.',
  },
  copyFrames,
  CopyFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. Reference counting inside a smart pointer.                             */
/* ------------------------------------------------------------------------ */

interface RefFrame {
  scopes: { label: string; sub: string; state: CellState }[];
  count: number;
  alive: boolean;
  caption: string;
  detail: string;
}

const refFrames: RefFrame[] = [
  {
    scopes: [{ label: 'p1', sub: 'ctor', state: 'active' }],
    count: 1,
    alive: true,
    caption:
      'SmartPointer<T> p1(new Widget()). The constructor stores two pointers: one to the object, and one to a heap-allocated counter - heap, so that every copy shares the same counter rather than its own.',
    detail: 'refCount = 1 · both obj and refCount are pointers, deliberately',
  },
  {
    scopes: [
      { label: 'p1', sub: 'ctor', state: 'done' },
      { label: 'p2', sub: 'copy', state: 'active' },
    ],
    count: 2,
    alive: true,
    caption:
      'The copy constructor runs when you pass or copy a smart pointer. It copies both pointers - object and counter - then increments the count.',
    detail: 'refCount = 2 · one object, two handles',
  },
  {
    scopes: [
      { label: 'p1', sub: 'ctor', state: 'done' },
      { label: 'p2', sub: 'copy', state: 'done' },
      { label: 'p3', sub: '= p1', state: 'active' },
    ],
    count: 3,
    alive: true,
    caption:
      'Assignment is the third path in, and it is the one people forget. p3 = p1 must first release whatever p3 already held, then adopt p1\'s object and counter, then increment. Guard against self-assignment first.',
    detail: 'refCount = 3 · operator= : release old, adopt new, increment',
  },
  {
    scopes: [
      { label: 'p1', sub: 'ctor', state: 'done' },
      { label: 'p2', sub: 'copy', state: 'done' },
    ],
    count: 2,
    alive: true,
    caption:
      'p3 leaves scope. Its destructor decrements. The count is still positive, so nothing is freed - the object outlives any individual handle to it.',
    detail: 'refCount = 2',
  },
  {
    scopes: [{ label: 'p1', sub: 'ctor', state: 'done' }],
    count: 1,
    alive: true,
    caption:
      'p2 leaves scope. Decrement again. Still one handle standing, so the object stays.',
    detail: 'refCount = 1',
  },
  {
    scopes: [],
    count: 0,
    alive: false,
    caption:
      'p1 leaves scope, the count reaches zero, and only now is the object deleted and the counter freed. That is the whole of automatic memory management: deterministic, and with no garbage collector anywhere.',
    detail: 'refCount = 0 → delete obj; free refCount',
  },
  {
    scopes: [
      { label: 'a', sub: '→ b', state: 'bad' },
      { label: 'b', sub: '→ a', state: 'bad' },
    ],
    count: 1,
    alive: true,
    caption:
      'The failure mode: a cycle. If a holds a strong reference to b and b holds one back, neither count ever reaches zero and both leak. Break it with a weak reference - one that observes without counting.',
    detail: 'strong ⟷ strong = leak · make one side weak',
  },
];

function RefFrameView({ index }: { index: number }) {
  const frame = refFrames[Math.min(Math.max(index, 0), refFrames.length - 1)];
  return (
    <Stage tall>
      <Readout
        items={[
          { key: 'c', label: 'refCount', value: String(frame.count) },
          { key: 'o', label: 'Widget', value: frame.alive ? 'alive' : 'deleted' },
        ]}
      />
      <StackColumn
        label="live handles"
        hint="innermost scope on top"
        items={frame.scopes.map((scope) => ({
          key: scope.label,
          label: scope.label,
          sub: scope.sub,
          state: scope.state,
        }))}
      />
    </Stage>
  );
}

export const cppRefCount: AnimationSpec = fromFrames(
  {
    id: 'cpp-refcount',
    title: 'A reference-counted smart pointer',
    blurb: 'Constructor, copy, assign, destructor - and the cycle that defeats all four.',
  },
  refFrames,
  RefFrameView,
);

/* ------------------------------------------------------------------------ */
/* 4. One malloc for a 2D array instead of n+1.                              */
/* ------------------------------------------------------------------------ */

interface AllocFrame {
  mode: 'many' | 'one';
  header: number;
  cols: number;
  rows: number;
  highlightRow: number | null;
  allocations: number;
  caption: string;
  detail: string;
}

const allocFrames: AllocFrame[] = [
  {
    mode: 'many',
    header: 3,
    cols: 4,
    rows: 3,
    highlightRow: null,
    allocations: 4,
    caption:
      'The obvious 2D allocation: one malloc for an array of row pointers, then one more per row. For 3 rows that is 4 calls; for 1,000 rows it is 1,001.',
    detail: 'malloc(rows * sizeof(int*)) + rows × malloc(cols * sizeof(int))',
  },
  {
    mode: 'many',
    header: 3,
    cols: 4,
    rows: 3,
    highlightRow: 1,
    allocations: 4,
    caption:
      'The rows land wherever the allocator has room, so they are scattered. Freeing means walking every row pointer before freeing the header - forget that and you leak every row.',
    detail: 'free() must mirror malloc(): rows first, then the header',
  },
  {
    mode: 'one',
    header: 3,
    cols: 4,
    rows: 3,
    highlightRow: null,
    allocations: 1,
    caption:
      'Better: one block sized rows * sizeof(int*) + rows * cols * sizeof(int). The first part is the row-pointer header; the rest is the data, contiguous.',
    detail: 'a single malloc for header + data',
  },
  {
    mode: 'one',
    header: 3,
    cols: 4,
    rows: 3,
    highlightRow: 1,
    allocations: 1,
    caption:
      'Then point each header entry into that same block: row i starts at buf + i * cols. Indexing with arr[i][j] works exactly as before - the compiler follows the pointer, then offsets.',
    detail: 'rowptr[i] = buf + i * cols · arr[1][3] → row 1 → element 3',
  },
  {
    mode: 'one',
    header: 3,
    cols: 4,
    rows: 3,
    highlightRow: null,
    allocations: 1,
    caption:
      'Two wins beyond the call count: free(arr) alone releases everything, and the data is contiguous, so a full traversal walks memory in order and the cache prefetcher can keep up.',
    detail: '1 malloc · 1 free · cache-friendly traversal',
  },
];

function AllocFrameView({ index }: { index: number }) {
  const frame = allocFrames[Math.min(Math.max(index, 0), allocFrames.length - 1)];
  const header: CellSpec[] = Array.from({ length: frame.header }, (_, i) => ({
    key: `h-${i}`,
    label: `r${i}`,
    sub: '*',
    state: frame.highlightRow === i ? 'active' : 'compare',
  }));
  const data: CellSpec[] = Array.from({ length: frame.rows * frame.cols }, (_, i) => ({
    key: `d-${i}`,
    label: '·',
    sub: i % frame.cols === 0 ? `r${Math.floor(i / frame.cols)}` : undefined,
    state:
      frame.highlightRow !== null && Math.floor(i / frame.cols) === frame.highlightRow
        ? 'target'
        : 'done',
  }));
  return (
    <Stage>
      <Readout
        items={[
          { key: 'a', label: 'malloc calls', value: String(frame.allocations) },
          { key: 'l', label: 'layout', value: frame.mode === 'one' ? 'one contiguous block' : 'scattered rows' },
        ]}
      />
      <Cells cells={header} size="sm" label="row pointers" />
      <Cells cells={data} size="sm" label="data" />
      <Caption>
        {frame.mode === 'one'
          ? 'row pointers and data share one allocation'
          : 'each row is its own allocation, placed wherever the heap had space'}
      </Caption>
    </Stage>
  );
}

export const cpp2dAlloc: AnimationSpec = fromFrames(
  {
    id: 'cpp-2d-alloc',
    title: 'A 2D array in one allocation',
    blurb: 'n+1 mallocs and a fiddly free, versus one of each - with the same arr[i][j].',
  },
  allocFrames,
  AllocFrameView,
);

export const cCppAnimations: AnimationSpec[] = [cppVtable, cppCopy, cppRefCount, cpp2dAlloc];
