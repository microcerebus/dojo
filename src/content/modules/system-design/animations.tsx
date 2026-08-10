import {
  Bits,
  Buckets,
  FlowSteps,
  Legend,
  Readout,
  Stage,
  type BucketSpec,
  type FlowStepSpec,
} from '../../../anim/primitives';
import { fromFrames, type AnimationSpec } from '../../../anim/types';

/* ------------------------------------------------------------------------ */
/* 1. One box becomes a system, one bottleneck at a time.                    */
/* ------------------------------------------------------------------------ */

const TIERS = [
  { key: 'client', label: 'Clients' },
  { key: 'lb', label: 'Load balancer' },
  { key: 'app', label: 'App servers' },
  { key: 'cache', label: 'Cache' },
  { key: 'db', label: 'Database' },
  { key: 'queue', label: 'Async workers' },
];

interface EvoFrame {
  present: string[];
  hot: string | null;
  detailFor: Record<string, string>;
  caption: string;
  detail: string;
}

const evoFrames: EvoFrame[] = [
  {
    present: ['client', 'app', 'db'],
    hot: null,
    detailFor: { app: 'one machine, doing everything', db: 'on the same machine' },
    caption:
      'Start deliberately naive: clients, one app server, one database. Draw this before you optimise anything - you cannot find a bottleneck in a system you have not drawn.',
    detail: 'step 3 of the method: draw the major components, end to end',
  },
  {
    present: ['client', 'app', 'db'],
    hot: 'app',
    detailFor: { app: 'CPU pinned; one crash takes everything down' },
    caption:
      'First bottleneck: the single app server. Vertical scaling - more RAM, more cores - is easier and buys real headroom, but it has a ceiling and it never removes the single point of failure.',
    detail: 'vertical scaling: simplest, bounded · horizontal: harder, unbounded',
  },
  {
    present: ['client', 'lb', 'app', 'db'],
    hot: 'lb',
    detailFor: {
      lb: 'spreads requests over identical servers',
      app: 'now a herd, not a pet - and must be stateless',
    },
    caption:
      'Scale horizontally instead: clone the app server and put a load balancer in front. The price is statelessness - any server must be able to serve any request, so sessions move to a shared store.',
    detail: 'add machines, not machine · the whole herd must be interchangeable',
  },
  {
    present: ['client', 'lb', 'app', 'db'],
    hot: 'db',
    detailFor: { db: 'every request still lands here' },
    caption:
      'The bottleneck moves, it never disappears. Ten app servers all read the same database, so the database is now the constraint - and reads usually outnumber writes heavily.',
    detail: 'read-heavy? cache and replicate · write-heavy? queue and shard',
  },
  {
    present: ['client', 'lb', 'app', 'cache', 'db'],
    hot: 'cache',
    detailFor: {
      cache: 'in-memory key→value, checked before the store',
      db: 'now only sees misses and writes',
    },
    caption:
      'A cache in front of the store absorbs the reads. The hard part is never the lookup - it is invalidation: deciding what is stale, and what to do when the underlying data changes.',
    detail: 'memory ~100ns vs SSD ~100µs vs disk seek ~10ms - a cache hit is 1000x',
  },
  {
    present: ['client', 'lb', 'app', 'cache', 'db', 'queue'],
    hot: 'queue',
    detailFor: {
      queue: 'slow work happens after the response',
      db: 'writes batched, sharded by key',
    },
    caption:
      'Finally, anything slow that the user need not wait for moves behind a queue: thumbnails, indexing, emails, analytics rollups. Latency does not vanish - it moves off the request path, and you accept staleness in exchange.',
    detail: 'the write is fast; the result is eventually correct',
  },
  {
    present: ['client', 'lb', 'app', 'cache', 'db', 'queue'],
    hot: null,
    detailFor: {},
    caption:
      'Every arrow you added is also a thing that can fail. Ask what happens when a machine dies, a rack dies, a region dies - and say which parts degrade versus which stop.',
    detail: 'availability is a % of time up · reliability is P(up for a given period)',
  },
];

function EvoFrameView({ index }: { index: number }) {
  const frame = evoFrames[Math.min(Math.max(index, 0), evoFrames.length - 1)];
  const steps: FlowStepSpec[] = TIERS.filter((tier) => frame.present.includes(tier.key)).map(
    (tier) => ({
      key: tier.key,
      label: tier.label,
      ...(frame.detailFor[tier.key] ? { detail: frame.detailFor[tier.key] } : {}),
      ...(tier.key === frame.hot ? { badge: 'bottleneck' } : {}),
      state: tier.key === frame.hot ? 'bad' : 'done',
    }),
  );
  return (
    <Stage>
      <FlowSteps steps={steps} />
    </Stage>
  );
}

export const sdEvolution: AnimationSpec = fromFrames(
  {
    id: 'sd-evolution',
    title: 'One box becomes a system',
    blurb: 'Find the bottleneck, fix that one thing, then find the next. Never design it all at once.',
  },
  evoFrames,
  EvoFrameView,
);

/* ------------------------------------------------------------------------ */
/* 2. Sharding, and what resharding costs.                                   */
/* ------------------------------------------------------------------------ */

const KEYS = [
  { label: 'u17', hash: 21 },
  { label: 'u34', hash: 34 },
  { label: 'u58', hash: 15 },
  { label: 'u61', hash: 42 },
  { label: 'u73', hash: 27 },
  { label: 'u82', hash: 8 },
];

interface ShardFrame {
  shards: number;
  placed: number;
  /** keys that just changed home */
  moved: string[];
  consistent: boolean;
  caption: string;
  detail: string;
}

const home = (hash: number, shards: number) => hash % shards;
/** Consistent hashing: keys land on the first shard clockwise on a 48-point ring. */
const ringHome = (hash: number, shards: number) => {
  const points = Array.from({ length: shards }, (_, i) => ({ at: (i * 48) / shards, shard: i }));
  for (const point of points) if (hash <= point.at + 48 / shards - 1) return point.shard;
  return 0;
};

const shardFrames: ShardFrame[] = [
  {
    shards: 4,
    placed: 2,
    moved: [],
    consistent: false,
    caption:
      'Key-based sharding: shard = hash(key) % n. No lookup table, no coordination - every machine can compute where a key lives from the key alone.',
    detail: 'hash(u17)=21 → 21 % 4 = shard 1 · hash(u34)=34 → shard 2',
  },
  {
    shards: 4,
    placed: 6,
    moved: [],
    consistent: false,
    caption:
      'With a decent hash the load spreads evenly, which is the whole point. Compare the alternatives: vertical partitioning splits by feature (profiles here, messages there) and directory partitioning keeps a lookup table - flexible, but a single point of failure on every read.',
    detail: '6 keys over 4 shards · lookup cost O(1), no table to maintain',
  },
  {
    shards: 5,
    placed: 6,
    moved: [],
    consistent: false,
    caption:
      'Now traffic grows and you add a fifth shard. Watch what happens: the modulus changed, so most keys recompute to a different home.',
    detail: 'n: 4 → 5 · every key recomputes',
  },
  {
    shards: 5,
    placed: 6,
    moved: KEYS.filter((key) => home(key.hash, 4) !== home(key.hash, 5)).map((key) => key.label),
    consistent: false,
    caption:
      'Four of these six keys moved - and with a realistic key count it is the overwhelming majority. At scale that is terabytes crossing the network while the system is live, which is why "just add a machine" is not free.',
    detail: `${KEYS.filter((k) => home(k.hash, 4) !== home(k.hash, 5)).length} of ${KEYS.length} keys relocated`,
  },
  {
    shards: 5,
    placed: 6,
    moved: [],
    consistent: true,
    caption:
      'Consistent hashing fixes it. Place shards and keys on a ring; a key belongs to the first shard clockwise from it. Adding a shard only steals the arc in front of it.',
    detail: 'roughly 1/n of keys move instead of nearly all of them',
  },
  {
    shards: 5,
    placed: 6,
    moved: [],
    consistent: true,
    caption:
      'Sharding also costs you things you had for free: cross-shard joins, global uniqueness, transactions spanning two keys, and any query that does not include the shard key. Choose the key by how the data is read.',
    detail: 'pick the shard key from the access pattern, never from the schema',
  },
];

function ShardFrameView({ index }: { index: number }) {
  const frame = shardFrames[Math.min(Math.max(index, 0), shardFrames.length - 1)];
  const visible = KEYS.slice(0, frame.placed);
  const buckets: BucketSpec[] = Array.from({ length: frame.shards }, (_, shard) => ({
    key: `shard-${shard}`,
    index: shard,
    state: frame.consistent ? 'done' : shard === 4 ? 'active' : 'idle',
    entries: visible
      .filter(
        (key) =>
          (frame.consistent ? ringHome(key.hash, frame.shards) : home(key.hash, frame.shards)) ===
          shard,
      )
      .map((key) => ({
        key: key.label,
        label: key.label,
        state: frame.moved.includes(key.label) ? ('bad' as const) : ('done' as const),
      })),
  }));
  return (
    <Stage>
      <Readout
        items={[
          { key: 'n', label: 'shards', value: String(frame.shards) },
          {
            key: 'm',
            label: 'mapping',
            value: frame.consistent ? 'consistent hash ring' : 'hash(key) % n',
          },
        ]}
      />
      <Buckets buckets={buckets} />
      <Legend
        items={[
          { key: 'd', state: 'done', label: 'in place' },
          { key: 'b', state: 'bad', label: 'had to move' },
        ]}
      />
    </Stage>
  );
}

export const sdSharding: AnimationSpec = fromFrames(
  {
    id: 'sd-sharding',
    title: 'Sharding, and the cost of adding a machine',
    blurb: 'Modulo sharding is trivial until n changes. Watch nearly every key move, then watch the fix.',
  },
  shardFrames,
  ShardFrameView,
);

/* ------------------------------------------------------------------------ */
/* 3. A bloom filter: cheap "definitely not", uncertain "maybe".             */
/* ------------------------------------------------------------------------ */

const M = 12;
/** Three toy hash functions over a 12-bit filter. */
const hashes = (seed: number): number[] => [
  (seed * 7) % M,
  (seed * 13 + 5) % M,
  (seed * 29 + 3) % M,
];

interface BloomFrame {
  bits: number[];
  probing: number[];
  verdict: 'insert' | 'absent' | 'present' | 'false-positive' | null;
  label: string;
  caption: string;
  detail: string;
}

const bloomFrames: BloomFrame[] = (() => {
  const frames: BloomFrame[] = [];
  const bits = new Array<number>(M).fill(0);
  const inserts: { url: string; seed: number }[] = [
    { url: 'a.com/1', seed: 4 },
    { url: 'b.com/2', seed: 9 },
    { url: 'c.com/3', seed: 17 },
  ];

  frames.push({
    bits: [...bits],
    probing: [],
    verdict: null,
    label: '—',
    caption:
      'A crawler with ten billion URLs cannot hold a hash set of them in memory - at 100 characters each that is terabytes. A bloom filter answers "have I seen this?" in a few bits per item.',
    detail: 'start: 12 bits, all zero · 3 hash functions',
  });

  for (const item of inserts) {
    const positions = hashes(item.seed);
    for (const position of positions) bits[position] = 1;
    frames.push({
      bits: [...bits],
      probing: positions,
      verdict: 'insert',
      label: item.url,
      caption: `Insert ${item.url}: run all three hash functions and set those three bits. Nothing about the URL itself is stored - the filter has no idea what is in it.`,
      detail: `bits ${positions.join(', ')} set · ${bits.filter(Boolean).length}/${M} bits now 1`,
    });
  }

  const absent = hashes(6);
  frames.push({
    bits: [...bits],
    probing: absent,
    verdict: 'absent',
    label: 'z.com/9',
    caption:
      'Query z.com/9: one of its three bits is still zero. That is conclusive - if it had ever been inserted, every one of its bits would be set. A "no" from a bloom filter is always true.',
    detail: `bits ${absent.join(', ')} · at least one is 0 → definitely not present`,
  });

  const known = hashes(9);
  frames.push({
    bits: [...bits],
    probing: known,
    verdict: 'present',
    label: 'b.com/2',
    caption:
      'Query b.com/2, which really was inserted: all three bits are set, so the filter says "probably yes". Correct here - but the reasoning is weaker than it looks.',
    detail: `bits ${known.join(', ')} · all 1 → maybe present`,
  });

  // Find a seed that collides on already-set bits without ever being inserted.
  let collidingSeed = 0;
  for (let seed = 1; seed < 400; seed++) {
    if (inserts.some((item) => item.seed === seed)) continue;
    if (hashes(seed).every((position) => bits[position] === 1)) {
      collidingSeed = seed;
      break;
    }
  }
  const collide = hashes(collidingSeed);
  frames.push({
    bits: [...bits],
    probing: collide,
    verdict: 'false-positive',
    label: 'q.com/7',
    caption:
      'And here is the catch. q.com/7 was never inserted, but its three bits were each set by different earlier URLs. The filter says "probably yes" and is wrong - a false positive.',
    detail: `bits ${collide.join(', ')} all 1, set by other items → false positive`,
  });

  frames.push({
    bits: [...bits],
    probing: [],
    verdict: null,
    label: '—',
    caption:
      'So the contract is asymmetric: "no" is certain, "yes" is probabilistic, and there are no deletions. For a crawler that is a fine trade - a false positive skips one page, and you can confirm the maybes against the real store.',
    detail: 'false-positive rate falls with more bits per item; never reaches zero',
  });

  return frames;
})();

function BloomFrameView({ index }: { index: number }) {
  const frame = bloomFrames[Math.min(Math.max(index, 0), bloomFrames.length - 1)];
  return (
    <Stage>
      <Readout
        items={[
          { key: 'k', label: 'key', value: frame.label },
          {
            key: 'v',
            label: 'verdict',
            value:
              frame.verdict === 'insert'
                ? 'inserted'
                : frame.verdict === 'absent'
                  ? 'definitely not present'
                  : frame.verdict === 'present'
                    ? 'probably present'
                    : frame.verdict === 'false-positive'
                      ? 'probably present (wrong)'
                      : '—',
          },
        ]}
      />
      <Bits
        label="filter"
        showIndices
        bits={frame.bits.map((bit, i) => ({
          key: `bit-${i}`,
          value: bit as 0 | 1,
          state: !frame.probing.includes(i)
            ? bit
              ? 'done'
              : 'idle'
            : frame.verdict === 'insert'
              ? 'active'
              : bit === 0
                ? 'bad'
                : frame.verdict === 'false-positive'
                  ? 'target'
                  : 'compare',
        }))}
      />
      <Legend
        items={[
          { key: 'a', state: 'active', label: 'just set' },
          { key: 'c', state: 'compare', label: 'probed, set' },
          { key: 'b', state: 'bad', label: 'probed, still zero' },
          { key: 't', state: 'target', label: 'set by someone else' },
        ]}
      />
    </Stage>
  );
}

export const sdBloom: AnimationSpec = fromFrames(
  {
    id: 'sd-bloom',
    title: 'Bloom filter',
    blurb: '"Definitely not" for a few bits per item - and a false positive, shown happening.',
  },
  bloomFrames,
  BloomFrameView,
);

export const systemDesignAnimations: AnimationSpec[] = [sdEvolution, sdSharding, sdBloom];
