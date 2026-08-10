import type { CourseModule } from '../../types';

export const systemDesign: CourseModule = {
  id: 'system-design',
  title: 'System Design & Scalability',
  track: 'system-design',
  status: 'outline',
  source: 'Chapter 9',
  summary:
    'A structured conversation: scope, estimate, sketch the data flow, find the bottleneck, then trade off deliberately.',
  estimatedMinutes: 90,
  concepts: [
    'The shape of the conversation: scope, assumptions, estimates, data flow, bottlenecks, tradeoffs',
    'Clarifying requirements and explicitly listing what you are not building',
    'Back-of-the-envelope estimation, and the powers-of-two table (2^10 ≈ a thousand, 2^20 ≈ a million, 2^30 ≈ a billion)',
    'Sketching the API and the data model before the boxes and arrows',
    'Vertical vs horizontal scaling, and why horizontal is usually the answer at scale',
    'Load balancing and statelessness',
    'Caching: what to cache, where, and how it is invalidated',
    'Database sharding: by hash, by range, by directory - and the resharding problem',
    'Replication, leader/follower, and read/write splitting',
    'Database indexes: what they cost on write and what they buy on read',
    'SQL vs NoSQL as a data-shape and access-pattern decision, not a fashion one',
    'Asynchronous work queues and decomposing into services',
    'The consistency/availability/latency/durability tradeoff space',
    'Eventual consistency and when it is acceptable',
    'Designing for failure: what happens when a machine, a rack or a region dies',
    'Bottleneck identification followed by targeted refinement, rather than designing everything at once',
    'Hashing and bloom filters for deduplication at scale',
    'Crawler design: cycles, politeness, and content-based duplicate detection',
    'Hot keys, ranking, and time-series aggregation strategies',
    'Being explicit that there is no single right answer - the reasoning is the answer',
  ],
  plannedAnimations: [
    'A design evolving: single server → load balancer + replicas → cache → sharded store',
    'Sharding by hash, and what happens to the keys when you add a shard (with and without consistent hashing)',
    'A bloom filter: three hash functions setting bits, and a false positive being explained',
    'A write path with an async queue, showing where latency moves to',
  ],
  sections: [],
  quiz: [],
  drills: [
    { slug: 'encode-and-decode-tinyurl', note: 'CTCI 9.8 - the coding core of a pastebin/URL shortener.' },
    { slug: 'lru-cache', note: 'CTCI 9.5 - the eviction policy behind most cache designs.' },
    { slug: 'lfu-cache', note: 'The harder eviction policy. Know when LFU beats LRU.' },
    { slug: 'design-hit-counter', note: 'Time-window aggregation. Premium.' },
    { slug: 'web-crawler-multithreaded', note: 'CTCI 9.3 - the concurrency core of a crawler. Premium.' },
  ],
  practice: [
    {
      id: 'sd-whiteboard-set',
      title: 'Talk through four designs, 30 minutes each',
      detail:
        'A URL shortener, a social feed, a web crawler at scale, and a stock-data service. Force yourself through the same six steps every time, and say the estimates out loud.',
    },
    {
      id: 'sd-estimates',
      title: 'Memorise the estimation building blocks',
      detail:
        'Powers of two up to 2^40, plus rough latencies: memory access ~100ns, SSD read ~100µs, disk seek ~10ms, same-datacentre round trip ~0.5ms, cross-continent ~150ms.',
    },
  ],
};
