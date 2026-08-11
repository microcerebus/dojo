import {
  Caption,
  Cells,
  Chips,
  Legend,
  Pointers,
  Readout,
  Stage,
  Track,
  type CellSpec,
  type ChipSpec,
  type PointerSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. The four join types over the same two tables.                          */
/* ------------------------------------------------------------------------ */

const REGULAR = [
  { name: 'Budweiser', code: 'BUD' },
  { name: 'Coca-Cola', code: 'COKE' },
];
const DIET = [
  { name: 'Diet Coke', code: 'COKE' },
  { name: 'Fresca', code: 'FRESCA' },
  { name: 'Diet Pepsi', code: 'PEPSI' },
  { name: 'Pepsi Light', code: 'PEPSI' },
];

type JoinKind = 'none' | 'inner' | 'left' | 'right' | 'full' | 'cross';

interface JoinFrame {
  kind: JoinKind;
  caption: string;
  detail: string;
}

const MATCHED = REGULAR.flatMap((left) =>
  DIET.filter((right) => right.code === left.code).map((right) => `${left.name} | ${right.name}`),
);
const LEFT_ONLY = REGULAR.filter((left) => !DIET.some((right) => right.code === left.code)).map(
  (left) => `${left.name} | NULL`,
);
const RIGHT_ONLY = DIET.filter((right) => !REGULAR.some((left) => left.code === right.code)).map(
  (right) => `NULL | ${right.name}`,
);
const CROSS = REGULAR.flatMap((left) => DIET.map((right) => `${left.name} × ${right.name}`));

/** Result rows for a join, as `left | right` pairs with NULLs spelled out. */
function joinRows(kind: JoinKind): string[] {
  switch (kind) {
    case 'inner':
      return MATCHED;
    case 'left':
      return [...MATCHED, ...LEFT_ONLY];
    case 'right':
      return [...MATCHED, ...RIGHT_ONLY];
    case 'full':
      return [...MATCHED, ...LEFT_ONLY, ...RIGHT_ONLY];
    case 'cross':
      return CROSS;
    default:
      return [];
  }
}

const joinFrames: JoinFrame[] = [
  {
    kind: 'none',
    caption:
      'Two tables, matched on a product code. Regular beverages has two rows; calorie-free has four. Note that COKE matches once and PEPSI appears twice on the right - that duplication is where join results surprise people.',
    detail: 'left: 2 rows · right: 4 rows · match on code',
  },
  {
    kind: 'inner',
    caption:
      'INNER JOIN keeps only rows that matched on both sides. Coca-Cola pairs with Diet Coke; Budweiser has no calorie-free counterpart and disappears entirely. This is the default, and its silent row-dropping is the commonest join bug.',
    detail: '1 row · rows without a partner are gone',
  },
  {
    kind: 'left',
    caption:
      'LEFT OUTER JOIN keeps every row from the left table regardless. Budweiser survives with NULLs where the right table\'s columns would be. Use it whenever "show every X, with its Ys if any" is the requirement.',
    detail: '2 rows · every left row survives; unmatched right columns are NULL',
  },
  {
    kind: 'right',
    caption:
      'RIGHT OUTER JOIN is the mirror: every row from the right table survives. A LEFT JOIN B and B RIGHT JOIN A are the same query - which is why most people only ever write LEFT.',
    detail: '4 rows · Fresca and both Pepsis survive with NULL on the left',
  },
  {
    kind: 'full',
    caption:
      'FULL OUTER JOIN keeps everything from both sides, NULLs wherever there was no partner. Reach for it when you want to find the mismatches themselves - reconciling two systems that should agree.',
    detail: '5 rows · union of left and right outer',
  },
  {
    kind: 'cross',
    caption:
      'CROSS JOIN has no condition at all: every left row paired with every right row, 2 × 4 = 8. Occasionally you want it (generating a grid of every date × every product); usually seeing it means you forgot an ON clause.',
    detail: '8 rows · the Cartesian product',
  },
];

function JoinFrameView({ index }: { index: number }) {
  const frame = joinFrames[Math.min(Math.max(index, 0), joinFrames.length - 1)];
  const matched = (code: string) =>
    REGULAR.some((left) => left.code === code) && DIET.some((right) => right.code === code);

  const leftChips: ChipSpec[] = REGULAR.map((row) => ({
    key: `l-${row.name}`,
    label: row.name,
    sub: row.code,
    state:
      frame.kind === 'none' || frame.kind === 'cross'
        ? 'idle'
        : matched(row.code)
          ? 'done'
          : frame.kind === 'inner' || frame.kind === 'right'
            ? 'muted'
            : 'target',
  }));
  const rightChips: ChipSpec[] = DIET.map((row) => ({
    key: `r-${row.name}`,
    label: row.name,
    sub: row.code,
    state:
      frame.kind === 'none' || frame.kind === 'cross'
        ? 'idle'
        : matched(row.code)
          ? 'done'
          : frame.kind === 'inner' || frame.kind === 'left'
            ? 'muted'
            : 'target',
  }));
  const rows = joinRows(frame.kind);
  return (
    <Stage tall>
      <Readout
        items={[
          {
            key: 'j',
            label: 'join',
            value:
              frame.kind === 'none'
                ? '—'
                : frame.kind === 'cross'
                  ? 'CROSS JOIN'
                  : frame.kind === 'inner'
                    ? 'INNER JOIN'
                    : `${frame.kind.toUpperCase()} OUTER JOIN`,
          },
          { key: 'r', label: 'result rows', value: String(rows.length) },
        ]}
      />
      <Chips chips={leftChips} label="regular beverages" />
      <Chips chips={rightChips} label="calorie-free beverages" />
      <Caption>{rows.length ? rows.join(' · ') : 'pick a join type to see the result set'}</Caption>
      <Legend
        items={[
          { key: 'd', state: 'done', label: 'matched' },
          { key: 't', state: 'target', label: 'kept, padded with NULL' },
          { key: 'm', state: 'muted', label: 'dropped' },
        ]}
      />
    </Stage>
  );
}

export const dbJoins: AnimationSpec = fromFrames(
  {
    id: 'db-joins',
    title: 'Five joins, one pair of tables',
    blurb: 'Same data every time. Only the rows that survive change.',
  },
  joinFrames,
  JoinFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. An index turns a scan into a seek.                                     */
/* ------------------------------------------------------------------------ */

const ROWS = [
  { id: 1, name: 'zoe' },
  { id: 2, name: 'amir' },
  { id: 3, name: 'mei' },
  { id: 4, name: 'raj' },
  { id: 5, name: 'bo' },
  { id: 6, name: 'sara' },
  { id: 7, name: 'ken' },
  { id: 8, name: 'ida' },
];
const TARGET = 'raj';
const SORTED = [...ROWS].sort((a, b) => a.name.localeCompare(b.name));

interface IndexFrame {
  mode: 'scan' | 'seek' | 'cost';
  at: number;
  reads: number;
  caption: string;
  detail: string;
}

const indexFrames: IndexFrame[] = (() => {
  const frames: IndexFrame[] = [];
  // Full table scan, stopping when we hit the row.
  for (let i = 0; i < ROWS.length; i++) {
    const hit = ROWS[i].name === TARGET;
    frames.push({
      mode: 'scan',
      at: i,
      reads: i + 1,
      caption: hit
        ? `Found it on read ${i + 1}. But the query planner cannot stop early in general - if the column is not unique it must keep going to the end.`
        : `No index on name, so the database reads every row and compares. Row ${i + 1}: ${ROWS[i].name}, not a match.`,
      detail: `full table scan · ${i + 1} of ${ROWS.length} rows read · O(n)`,
    });
    if (hit) break;
  }
  // Binary search over the index.
  let lo = 0;
  let hi = SORTED.length - 1;
  let probes = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    probes += 1;
    const cmp = SORTED[mid].name.localeCompare(TARGET);
    frames.push({
      mode: 'seek',
      at: mid,
      reads: probes,
      caption:
        cmp === 0
          ? `Match at probe ${probes}. The index entry carries a pointer to the row, so one more read fetches the data itself.`
          : `An index is the same column, kept sorted, beside the table. Probe ${probes}: ${SORTED[mid].name} sorts ${cmp < 0 ? 'before' : 'after'} the target, so ${cmp < 0 ? 'the left half is eliminated' : 'the right half is eliminated'}.`,
      detail: `index seek · ${probes} probe${probes === 1 ? '' : 's'} · O(log n)`,
    });
    if (cmp === 0) break;
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  frames.push({
    mode: 'cost',
    at: -1,
    reads: 0,
    caption:
      'That is the deal, and it is not free. Every index has to be updated on every insert, update and delete of its columns, and it takes disk. Index the columns you filter, join and sort on - not every column.',
    detail: 'faster reads · slower writes · more storage',
  });
  frames.push({
    mode: 'cost',
    at: -1,
    reads: 0,
    caption:
      'A composite index on (a, b) is sorted by a first, then b - so it serves WHERE a = ? and WHERE a = ? AND b = ?, but not WHERE b = ? alone. Column order is part of the design, exactly like a phone book sorted by surname then first name.',
    detail: 'leftmost-prefix rule · order the columns by how you query them',
  });
  return frames;
})();

function IndexFrameView({ index }: { index: number }) {
  const frame = indexFrames[Math.min(Math.max(index, 0), indexFrames.length - 1)];
  const tableCells: CellSpec[] = ROWS.map((row, i) => ({
    key: `t-${row.id}`,
    label: row.name,
    sub: `#${row.id}`,
    state:
      frame.mode === 'scan'
        ? i === frame.at
          ? row.name === TARGET
            ? 'done'
            : 'active'
          : i < frame.at
            ? 'bad'
            : 'idle'
        : row.name === TARGET && frame.mode === 'seek'
          ? 'target'
          : 'idle',
  }));
  const indexCells: CellSpec[] = SORTED.map((row, i) => ({
    key: `i-${row.id}`,
    label: row.name,
    sub: `→#${row.id}`,
    state:
      frame.mode !== 'seek'
        ? 'muted'
        : i === frame.at
          ? row.name === TARGET
            ? 'done'
            : 'active'
          : 'idle',
  }));
  const pointers: PointerSpec[] =
    frame.mode === 'seek' && frame.at >= 0
      ? [{ key: 'probe', at: frame.at, label: 'probe', tone: 'a' }]
      : [];
  return (
    <Stage tall>
      <Readout
        items={[
          { key: 'q', label: 'query', value: `name = '${TARGET}'` },
          {
            key: 'r',
            label: 'reads',
            value: frame.mode === 'cost' ? '—' : String(frame.reads),
          },
        ]}
      />
      <Track>
        <Cells cells={tableCells} size="sm" label="table, in insertion order" />
        <Pointers pointers={pointers} count={SORTED.length} />
        <Cells cells={indexCells} size="sm" label="index on name, sorted" />
      </Track>
    </Stage>
  );
}

export const dbIndex: AnimationSpec = fromFrames(
  {
    id: 'db-index',
    title: 'Scan, then seek',
    blurb: 'Eight rows read, or three probes. Then the price you pay on every write.',
  },
  indexFrames,
  IndexFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. Normalised vs denormalised.                                            */
/* ------------------------------------------------------------------------ */

interface NormFrame {
  denormalised: boolean;
  tablesTouchedByRead: number;
  rowsTouchedByRename: number;
  inconsistent: boolean;
  caption: string;
  detail: string;
}

const normFrames: NormFrame[] = [
  {
    denormalised: false,
    tablesTouchedByRead: 2,
    rowsTouchedByRename: 1,
    inconsistent: false,
    caption:
      "Normalised: Courses stores a teacherId, and the teacher's name lives in exactly one row of Teachers. Redundancy is minimised, so the data cannot contradict itself.",
    detail: 'Courses(courseId, name, teacherId) · Teachers(teacherId, name)',
  },
  {
    denormalised: false,
    tablesTouchedByRead: 2,
    rowsTouchedByRename: 1,
    inconsistent: false,
    caption:
      'Reading "every course with its teacher\'s name" therefore needs a join. On small tables that is nothing. On huge ones, joins are exactly the operation that stops scaling - which is the whole reason this tradeoff exists.',
    detail: 'read: JOIN across 2 tables · rename a teacher: UPDATE 1 row',
  },
  {
    denormalised: true,
    tablesTouchedByRead: 1,
    rowsTouchedByRename: 4,
    inconsistent: false,
    caption:
      'Denormalised: copy teacherName into Courses as well. The read is now a single-table query - no join, simpler SQL, and fewer places for the query to be slow or wrong.',
    detail: 'read: 1 table, no join · storage: the name is stored n+1 times',
  },
  {
    denormalised: true,
    tablesTouchedByRead: 1,
    rowsTouchedByRename: 4,
    inconsistent: true,
    caption:
      'The bill arrives on write. A teacher changes their name and now every copy has to be updated too. Miss one - a crash mid-update, a code path someone forgot - and the database holds two answers to the same question, with nothing to say which is right.',
    detail: 'writes and inserts cost more, and can leave the data inconsistent',
  },
  {
    denormalised: true,
    tablesTouchedByRead: 1,
    rowsTouchedByRename: 4,
    inconsistent: false,
    caption:
      'So: denormalise deliberately, where reads dominate and the duplicated field rarely changes, and keep the normalised copy as the source of truth. Real systems at scale use both, in different parts of the same schema.',
    detail: 'normalise for correctness · denormalise for read speed · say which and why',
  },
];

function NormFrameView({ index }: { index: number }) {
  const frame = normFrames[Math.min(Math.max(index, 0), normFrames.length - 1)];
  const courses = ['Algebra', 'Biology', 'Chemistry', 'Drama'];
  const courseChips: ChipSpec[] = courses.map((course, i) => ({
    key: course,
    label: course,
    sub: frame.denormalised ? (frame.inconsistent && i > 1 ? 'A. Old' : 'A. New') : 't7',
    state: frame.denormalised ? (frame.inconsistent && i > 1 ? 'bad' : 'done') : 'idle',
  }));
  return (
    <Stage tall>
      <Readout
        items={[
          { key: 's', label: 'schema', value: frame.denormalised ? 'denormalised' : 'normalised' },
          { key: 'r', label: 'tables per read', value: String(frame.tablesTouchedByRead) },
          { key: 'w', label: 'rows per rename', value: String(frame.rowsTouchedByRename) },
        ]}
      />
      <Chips chips={courseChips} label="courses" />
      <Chips
        chips={[
          {
            key: 't7',
            label: 'A. New',
            sub: 't7',
            state: frame.inconsistent ? 'target' : 'done',
          },
        ]}
        label="teachers"
      />
      <Caption>
        {frame.denormalised
          ? frame.inconsistent
            ? 'two courses were missed: the database now disagrees with itself'
            : 'the teacher name is duplicated into every course row'
          : 'the teacher name exists in exactly one place'}
      </Caption>
    </Stage>
  );
}

export const dbNormalisation: AnimationSpec = fromFrames(
  {
    id: 'db-normalisation',
    title: 'Normalise, then denormalise on purpose',
    blurb: 'One join removed from every read, paid for on every write. Watch it go wrong.',
  },
  normFrames,
  NormFrameView,
);

export const databasesAnimations: AnimationSpec[] = [dbJoins, dbIndex, dbNormalisation];
