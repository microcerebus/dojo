import {
  Caption,
  Cells,
  FlowSteps,
  Legend,
  Readout,
  Stage,
  type CellSpec,
  type FlowStepSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. Overloading is a compile-time choice; overriding is a runtime one.     */
/* ------------------------------------------------------------------------ */

const PHASES: { key: string; label: string }[] = [
  { key: 'source', label: 'Source: s.computeArea()' },
  { key: 'compile', label: 'Compile time - pick by signature' },
  { key: 'runtime', label: 'Run time - pick by actual object' },
  { key: 'result', label: 'Result' },
];

interface DispatchFrame {
  step: number;
  detailFor: Record<string, string>;
  caption: string;
  detail: string;
}

const dispatchFrames: DispatchFrame[] = [
  {
    step: 0,
    detailFor: { source: 'the declared type is Shape; the object is a Circle' },
    caption:
      'Two words that sound alike and decide different things at different times. Start from one call site: a Shape variable that actually holds a Circle.',
    detail: 'Shape s = new Circle();',
  },
  {
    step: 1,
    detailFor: {
      compile:
        'Overloading: two methods, same name, different parameters. The compiler picks by the argument types it can see.',
    },
    caption:
      'Overloading is resolved here, at compile time. computeArea(Circle c) and computeArea(Square s) are two unrelated methods that happen to share a name - the compiler chooses one from the static types of the arguments and bakes it in.',
    detail: 'chosen by signature · decided before the program runs',
  },
  {
    step: 2,
    detailFor: {
      runtime:
        'Overriding: same name, same signature, redeclared in a subclass. The object decides.',
    },
    caption:
      'Overriding is resolved here, at run time. Circle redeclares computeArea() with the identical signature, so the JVM dispatches on the object in front of it, not on the declared type.',
    detail: 'chosen by the runtime type · the same mechanism as a C++ virtual call',
  },
  {
    step: 3,
    detailFor: { result: 'Circle.computeArea() → 78.75' },
    caption:
      'Circle overrode both printMe and computeArea, so both of its versions run. A sibling class that only overrode computeArea keeps the inherited printMe - which is exactly how you can tell overriding apart from shadowing.',
    detail: '"I am a circle." · 78.75',
  },
  {
    step: 3,
    detailFor: { result: 'in Java every non-static, non-final method is virtual by default' },
    caption:
      'One difference from C++ worth naming: Java has no virtual keyword because it does not need one. Instance methods are dispatched dynamically unless they are static, private or final.',
    detail: 'C++ opts in with virtual · Java opts out with final',
  },
];

function DispatchFrameView({ index }: { index: number }) {
  const frame = dispatchFrames[Math.min(Math.max(index, 0), dispatchFrames.length - 1)];
  const steps: FlowStepSpec[] = PHASES.map((phase, i) => ({
    key: phase.key,
    label: phase.label,
    ...(frame.detailFor[phase.key] ? { detail: frame.detailFor[phase.key] } : {}),
    state: i === frame.step ? 'active' : i < frame.step ? 'done' : 'muted',
  }));
  return (
    <Stage>
      <FlowSteps steps={steps} />
    </Stage>
  );
}

export const javaDispatch: AnimationSpec = fromFrames(
  {
    id: 'java-dispatch',
    title: 'Overload at compile time, override at run time',
    blurb: 'One call site. Two different decisions, made at two different moments.',
  },
  dispatchFrames,
  DispatchFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. HashMap vs TreeMap vs LinkedHashMap.                                   */
/* ------------------------------------------------------------------------ */

const INSERTS = [1, -1, 0];

interface MapFrame {
  inserted: number;
  reveal: boolean;
  focus: 'hash' | 'tree' | 'linked' | null;
  caption: string;
  detail: string;
}

const mapFrames: MapFrame[] = [
  {
    inserted: 0,
    reveal: false,
    focus: null,
    caption:
      'All three are key→value maps you can iterate. The only differences that matter are the cost of an operation and the order the keys come back in - so put the same three keys into each, in the order 1, then -1, then 0.',
    detail: 'insert order: 1, -1, 0',
  },
  {
    inserted: 3,
    reveal: false,
    focus: null,
    caption: 'All three now hold the same three entries. Now iterate each one.',
    detail: 'three entries each · same contents, three different iteration orders',
  },
  {
    inserted: 3,
    reveal: true,
    focus: 'hash',
    caption:
      'HashMap - O(1) lookup and insert, implemented as an array of linked lists. The iteration order is arbitrary: not insertion order, not sorted, and not something you may rely on across runs or versions.',
    detail: 'O(1) · order: unspecified (0, 1, -1 here - but do not count on it)',
  },
  {
    inserted: 3,
    reveal: true,
    focus: 'tree',
    caption:
      'TreeMap - O(log n), a red-black tree, keys in sorted order. Keys must be comparable. It also answers range questions: "give me the next ten names after this one", which is how you build a "More" button.',
    detail: 'O(log n) · order: sorted · supports range and nearest-key queries',
  },
  {
    inserted: 3,
    reveal: true,
    focus: 'linked',
    caption:
      'LinkedHashMap - O(1) like HashMap, but doubly-linked buckets preserve insertion order. Constructed in access-order mode instead, it moves each read entry to the end, which is an LRU cache in one line.',
    detail: 'O(1) · order: insertion (or access) · the cache option',
  },
  {
    inserted: 3,
    reveal: true,
    focus: null,
    caption:
      'The rule: default to HashMap. Use TreeMap when you need the keys in natural order or need range queries; use LinkedHashMap when the order things arrived in matters. The same three-way choice exists in every language you will use.',
    detail: 'need sorted? TreeMap · need insertion order? LinkedHashMap · otherwise HashMap',
  },
];

function MapRow({
  label,
  keys,
  note,
  dim,
}: {
  label: string;
  keys: number[];
  note: string;
  dim: boolean;
}) {
  const cells: CellSpec[] = keys.map((key) => ({
    key: `${label}-${key}`,
    label: String(key),
    state: dim ? 'muted' : 'done',
  }));
  return (
    <div className="viz__bitsRow">
      <span className="viz__bitsLabel">{label}</span>
      {cells.length === 0 ? (
        <span className="viz__stackEmpty">empty</span>
      ) : (
        <Cells cells={cells} size="sm" label={`${label} iteration order`} />
      )}
      <span className="viz__queueEnd">{note}</span>
    </div>
  );
}

function MapFrameView({ index }: { index: number }) {
  const frame = mapFrames[Math.min(Math.max(index, 0), mapFrames.length - 1)];
  const present = INSERTS.slice(0, frame.inserted);
  const sorted = [...present].sort((a, b) => a - b);
  // A plausible arbitrary order for the HashMap, to make the point that it is
  // neither of the other two.
  const arbitrary = [...present].sort((a, b) => Math.abs(a) - Math.abs(b));
  return (
    <Stage tall>
      <Readout
        items={[{ key: 'i', label: 'inserted', value: present.length ? present.join(', ') : '—' }]}
      />
      <MapRow
        label="Hash"
        keys={frame.reveal ? arbitrary : present}
        note="O(1), any order"
        dim={frame.reveal && frame.focus !== null && frame.focus !== 'hash'}
      />
      <MapRow
        label="Tree"
        keys={frame.reveal ? sorted : present}
        note="O(log n), sorted"
        dim={frame.reveal && frame.focus !== null && frame.focus !== 'tree'}
      />
      <MapRow
        label="Linked"
        keys={present}
        note="O(1), insertion order"
        dim={frame.reveal && frame.focus !== null && frame.focus !== 'linked'}
      />
      <Caption>
        {frame.reveal
          ? 'same contents, three iteration orders'
          : 'inserting 1, then -1, then 0 into each'}
      </Caption>
    </Stage>
  );
}

export const javaMaps: AnimationSpec = fromFrames(
  {
    id: 'java-maps',
    title: 'Three maps, three iteration orders',
    blurb: 'Identical contents. The order they come back in is the entire decision.',
  },
  mapFrames,
  MapFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. A stream pipeline is lazy until the terminal operation.                */
/* ------------------------------------------------------------------------ */

const COUNTRIES = [
  { name: 'MX', continent: 'NA', population: 128 },
  { name: 'BR', continent: 'SA', population: 214 },
  { name: 'CA', continent: 'NA', population: 38 },
  { name: 'PE', continent: 'SA', population: 34 },
  { name: 'US', continent: 'NA', population: 332 },
];

interface StreamFrame {
  stage: 'source' | 'filter' | 'map' | 'reduce' | 'lazy';
  kept: string[];
  values: number[] | null;
  total: number | null;
  caption: string;
  detail: string;
}

const streamFrames: StreamFrame[] = [
  {
    stage: 'source',
    kept: COUNTRIES.map((country) => country.name),
    values: null,
    total: null,
    caption:
      'The task: total the population of one continent, given every country. countries.stream() is the source - it produces elements but computes nothing yet.',
    detail: 'source: 5 countries · continent = NA',
  },
  {
    stage: 'filter',
    kept: COUNTRIES.filter((country) => country.continent === 'NA').map((country) => country.name),
    values: null,
    total: null,
    caption:
      '.filter(c -> c.getContinent().equals(continent)) keeps the North American countries. Filter is an intermediate operation: it returns another stream and still runs nothing.',
    detail: 'intermediate · Stream<Country> → Stream<Country>',
  },
  {
    stage: 'map',
    kept: COUNTRIES.filter((country) => country.continent === 'NA').map((country) => country.name),
    values: COUNTRIES.filter((country) => country.continent === 'NA').map(
      (country) => country.population,
    ),
    total: null,
    caption:
      '.map(Country::getPopulation) transforms each element into its population. Still intermediate, still nothing computed - the pipeline has only described the work so far.',
    detail: 'intermediate · Stream<Country> → Stream<Integer>',
  },
  {
    stage: 'reduce',
    kept: COUNTRIES.filter((country) => country.continent === 'NA').map((country) => country.name),
    values: COUNTRIES.filter((country) => country.continent === 'NA').map(
      (country) => country.population,
    ),
    total: COUNTRIES.filter((country) => country.continent === 'NA').reduce(
      (sum, country) => sum + country.population,
      0,
    ),
    caption:
      '.reduce(0, (a, b) -> a + b) is the terminal operation. Only now does anything execute - and each element flows through filter and map on its way to the sum, rather than three full passes over three intermediate lists.',
    detail: 'terminal · Stream<Integer> → int · one pass, not three',
  },
  {
    stage: 'lazy',
    kept: COUNTRIES.map((country) => country.name),
    values: COUNTRIES.map((country) => (country.continent === 'NA' ? country.population : 0)),
    total: COUNTRIES.filter((country) => country.continent === 'NA').reduce(
      (sum, country) => sum + country.population,
      0,
    ),
    caption:
      'For this particular problem the filter is not even needed: map non-matching countries to zero and the sum ignores them. Fewer stages, same answer - worth mentioning, because it shows you understand what the pipeline is doing rather than pattern-matching it.',
    detail: 'map(c -> matches ? c.getPopulation() : 0).reduce(0, +)',
  },
];

function StreamFrameView({ index }: { index: number }) {
  const frame = streamFrames[Math.min(Math.max(index, 0), streamFrames.length - 1)];
  const cells: CellSpec[] = COUNTRIES.map((country) => ({
    key: country.name,
    label: country.name,
    sub:
      frame.values && frame.kept.includes(country.name)
        ? String(frame.values[frame.kept.indexOf(country.name)])
        : country.continent,
    state: frame.kept.includes(country.name)
      ? frame.stage === 'source'
        ? 'idle'
        : 'done'
      : 'muted',
  }));
  return (
    <Stage>
      <Readout
        items={[
          {
            key: 's',
            label: 'stage',
            value:
              frame.stage === 'source'
                ? 'stream()'
                : frame.stage === 'filter'
                  ? '.filter(...)'
                  : frame.stage === 'map'
                    ? '.map(...)'
                    : frame.stage === 'reduce'
                      ? '.reduce(0, +)'
                      : 'filter-free variant',
          },
          {
            key: 'r',
            label: 'result',
            value: frame.total === null ? 'nothing run yet' : String(frame.total),
          },
        ]}
      />
      <Cells cells={cells} label="stream elements" />
      <Legend
        items={[
          { key: 'd', state: 'done', label: 'still in the pipeline' },
          { key: 'm', state: 'muted', label: 'filtered out' },
        ]}
      />
    </Stage>
  );
}

export const javaStream: AnimationSpec = fromFrames(
  {
    id: 'java-stream',
    title: 'A stream pipeline',
    blurb: 'Source, intermediate operations, and the terminal one that finally makes it run.',
  },
  streamFrames,
  StreamFrameView,
);

export const javaAnimations: AnimationSpec[] = [javaDispatch, javaMaps, javaStream];
