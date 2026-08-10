import type { CourseModule } from '../../types';

export const systemDesign: CourseModule = {
  id: 'system-design',
  title: 'System Design & Scalability',
  track: 'system-design',
  status: 'complete',
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
  sections: [
    {
      id: 'the-conversation',
      title: 'It is a conversation, not a quiz',
      takeaway: 'Five steps, driven by you, with the assumptions said out loud.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Scalability questions look intimidating and are often the easiest thing in the loop. There is no trick, no hidden algorithm and no memorised answer. The question is: your manager asks you to design this - what do you actually do? So do that. Ask, sketch, estimate, poke holes.',
        },
        {
          kind: 'steps',
          items: [
            '**Scope the problem.** What exactly are we building? For a URL shortener: custom short codes or generated? Click analytics? Do links expire? Accounts? List the major use cases, and list what is out of scope.',
            '**Make reasonable assumptions.** A million new URLs a day is reasonable; a hundred users a day, or infinite memory, is not. Some assumptions need product sense - a *link* being ten minutes stale is a dealbreaker, but *statistics* being ten minutes stale is fine.',
            '**Draw the major components.** Get to the whiteboard early. Frontend servers, data store, workers. Then walk one request end to end: a user submits a URL - then what? Deliberately ignore scale here.',
            '**Identify the key issues.** Where does this break first? For the shortener: most links are cold, but one posted to a busy forum goes hot instantly, and you do not want to hammer the database for it.',
            '**Redesign for those issues.** Sometimes a tweak (add a cache), sometimes a rethink. Update the drawing as you go, and say out loud what your design still cannot do.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'There is no perfect system',
          text: 'Two strong candidates can produce very different designs and both be excellent under different assumptions. What is being assessed is whether you can scope a problem, assume sensibly, design against those assumptions, and name your own design\'s weaknesses.',
        },
        {
          kind: 'p',
          text: 'How you behave matters as much as the boxes you draw:',
        },
        {
          kind: 'bullets',
          items: [
            '**Communicate and drive.** You are in the driver\'s seat. Silence reads as being stuck; narrating reads as thinking.',
            '**Go broad before deep.** Do not fall into the one part you find interesting and leave the rest undrawn.',
            '**Take the interviewer\'s concerns seriously.** When they interrupt with a worry, it is a hint. Validate it and change the design; brushing it off is the worst possible response.',
            '**Be careful about assumptions, and state them.** "The analytics must be perfectly up to date" versus "may lag ten minutes" is an entirely different system. Say which you assumed, so it can be corrected.',
            '**Estimate when you lack data.** You will not be handed the numbers. Derive them and show the arithmetic.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Sketch the API and the data model early',
          text: 'Two or three endpoints (`POST /links`, `GET /{code}`, `GET /{code}/stats`) and the fields you would store pin the design down fast, and they expose disagreements about scope before you have drawn ten boxes on top of a misunderstanding.',
        },
      ],
    },
    {
      id: 'estimation',
      title: 'Back-of-the-envelope numbers',
      takeaway: 'Powers of two and a latency ladder turn hand-waving into arithmetic.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Estimation is not a party trick. It is how you decide whether something fits in memory, whether one machine is enough, and whether a design is even worth drawing. Two tables carry almost all of it.',
        },
        {
          kind: 'table',
          caption: 'Powers of two - the only table genuinely worth memorising',
          headers: ['Power', 'Exact', 'Call it', 'Bytes'],
          rows: [
            ['2^10', '1,024', 'a thousand', '1 KB'],
            ['2^20', '1,048,576', 'a million', '1 MB'],
            ['2^30', '1,073,741,824', 'a billion', '1 GB'],
            ['2^32', '4,294,967,296', 'four billion', '4 GB'],
            ['2^40', '1,099,511,627,776', 'a trillion', '1 TB'],
          ],
        },
        {
          kind: 'p',
          text: 'Worked example, the classic one: could you map every 32-bit integer to a boolean in memory? There are 2^32 integers, one bit each, so 2^32 bits = 2^29 bytes = half a gigabyte. Yes - comfortably, on a laptop.',
        },
        {
          kind: 'p',
          text: 'Another, straight from this chapter: ten billion URLs at roughly 100 characters each, four bytes per character, is about four terabytes. That single line is what tells you the problem needs disk or many machines, and it takes ten seconds to produce.',
        },
        {
          kind: 'table',
          caption: 'Rough latencies - within an order of magnitude is enough',
          headers: ['Operation', 'Time', 'Relative'],
          rows: [
            ['Main memory read', '~100 ns', '1x'],
            ['SSD random read', '~100 µs', '1,000x'],
            ['Round trip, same datacentre', '~0.5 ms', '5,000x'],
            ['Disk seek', '~10 ms', '100,000x'],
            ['Round trip, across the world', '~150 ms', '1,500,000x'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Bandwidth, throughput, latency',
          text: 'Think of a conveyor belt. **Latency** is how long one item takes to cross the factory. **Throughput** is how many items actually roll off per second. **Bandwidth** is how many could, at best. A wider belt raises throughput and bandwidth but not latency. A shorter belt cuts latency and changes nothing else. Compression buys throughput; almost nothing buys latency except moving closer.',
        },
        {
          kind: 'p',
          text: 'Estimate the four quantities that decide a design: **queries per second** (daily volume ÷ 86,400, then multiply by 2-10 for peak), **storage** (bytes per record × records × replication factor × retention), **bandwidth** (QPS × response size), and the **read-to-write ratio**, which is the single number that tells you whether to reach for caching and replicas or for queues and sharding.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Round hard, out loud',
          text: 'A day is ~100,000 seconds. A year is ~30 million. Ten thousand a second is a lot; ten a second is nothing. Nobody wants three significant figures - they want to hear you reason in orders of magnitude without stalling.',
        },
      ],
    },
    {
      id: 'building-blocks',
      title: 'The building blocks',
      takeaway: 'Scale out, spread load, cache reads, queue slow work. Bottleneck by bottleneck.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Start naive and let each bottleneck justify the next component. Designing the finished architecture up front is the mistake that reads as memorisation.',
        },
        { kind: 'anim', animId: 'sd-evolution' },
        {
          kind: 'table',
          headers: ['', 'Vertical scaling', 'Horizontal scaling'],
          rows: [
            ['What it is', 'A bigger machine', 'More machines'],
            ['Difficulty', 'Easy - often no code change', 'Harder - requires statelessness and coordination'],
            ['Ceiling', 'Real: RAM, cores and disk run out', 'Effectively none'],
            ['Failure', 'Still a single point of failure', 'Survives losing a node'],
            ['Use when', 'Early, or the workload genuinely will not partition', 'At scale, and whenever uptime matters'],
          ],
        },
        {
          kind: 'p',
          text: 'A **load balancer** spreads requests over a set of cloned servers, which only works if they are interchangeable - so any session state has to move out of the process into a shared store or a signed token. "Make it stateless" is the actual price of horizontal scaling, and saying it unprompted is worth marks.',
        },
        {
          kind: 'p',
          text: 'A **cache** is an in-memory key-value store between the application and the data store. You can cache the query and its result, or the rendered object (a page fragment, a top-posts list). It is the cheapest large win in a read-heavy system - and its hard part is not the lookup.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Invalidation is the whole problem',
          text: 'Decide up front: does the entry expire on a timer (simple, and stale for that long), get deleted when the underlying data changes (fresh, but every writer must know every cache key), or get overwritten on write? And say what happens on a cold start when every request misses at once.',
        },
        {
          kind: 'p',
          text: '**Asynchronous work queues** take anything slow off the request path: video transcoding, search indexing, email, analytics rollups, re-rendering a "most popular posts" page. The user gets a fast response and the result becomes correct shortly afterwards. Sometimes you pre-compute instead - and sometimes you tell the user honestly that it will take a few minutes and you will notify them.',
        },
        {
          kind: 'p',
          text: '**Decomposing into services** is the same idea applied to code: separate the crawler from the indexer from the query serving, so each scales, deploys and fails on its own. The cost is real - network calls where function calls used to be, and failures that are now partial.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'MapReduce, in one line',
          text: 'You write a **map** that turns each record into key-value pairs, and a **reduce** that folds all values for one key into a result; the framework handles distribution, shuffling and retries. Reach for it whenever the answer is "count/group/aggregate an enormous pile of logs".',
        },
        {
          kind: 'p',
          text: 'And whatever you draw, assume every box can die. Say what happens when a machine, a rack or a whole region goes: which parts degrade, which parts stop, and how the system notices. **Availability** is the percentage of time the system is up; **reliability** is the probability it stays up over a period. They are not the same claim.',
        },
      ],
    },
    {
      id: 'the-data',
      title: 'Where the data lives',
      takeaway: 'Shard by how you read, replicate for reads, denormalise to skip joins.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Almost every system-design question becomes a data question. Four decisions carry it: what store, how to split it, how to copy it, and what to give up.',
        },
        {
          kind: 'p',
          text: '**SQL or NoSQL** is a question about data shape and access pattern, never about fashion. Relational stores give you joins, constraints and multi-row transactions, which is exactly what you want when the data is genuinely relational and correctness matters. Document and key-value stores drop joins - and that is the point: joins are what get expensive as the data grows, so removing them is what lets the store partition freely.',
        },
        {
          kind: 'p',
          text: '**Denormalisation** buys the same thing inside a relational store: copy the teacher\'s name into the courses table and the join disappears from a hot read. You pay in writes (now two places to update), in storage, and in the risk of the copies disagreeing. Large systems almost always use both - normalised where correctness dominates, denormalised where reads dominate.',
        },
        { kind: 'anim', animId: 'sd-sharding' },
        {
          kind: 'table',
          caption: 'Three ways to split data across machines',
          headers: ['Scheme', 'How', 'Cost'],
          rows: [
            [
              'Vertical (by feature)',
              'Profiles on one cluster, messages on another',
              'Simple - until one table alone outgrows a machine and needs re-splitting anyway',
            ],
            [
              'Key-based (hash)',
              '`shard = hash(key) % n`; no lookup needed',
              'Changing `n` relocates nearly everything - use a consistent hash ring',
            ],
            [
              'Directory',
              'A lookup table says where each key lives',
              'Easy to rebalance, but the table is a single point of failure and a hop on every request',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'What sharding takes away',
          text: 'Cross-shard joins, transactions spanning two keys, globally unique auto-increment ids, and any query that does not carry the shard key (which now has to fan out to every shard). Choose the shard key from how the data is *read*, and watch for hot keys - one celebrity account can swamp the shard it lands on.',
        },
        {
          kind: 'p',
          text: '**Replication** is a different axis: keep copies of the same data. The usual shape is one leader taking writes and several followers serving reads, which scales reads and gives you a failover candidate. Followers lag, so a user can write and then immediately read their own stale data - decide whether that matters, and if it does, route that user\'s reads to the leader.',
        },
        {
          kind: 'p',
          text: '**Indexes** are the same trade in miniature: a sorted structure beside the table that turns a full scan into a seek. Every index makes writes slower and the database larger, and a composite index only helps queries that use its columns left to right.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The tradeoff space, named',
          text: 'Consistency (does everyone see the same data now?), availability (does it answer at all?), latency (how fast?), and durability (does it survive a crash?). You do not get all four everywhere. **Eventual consistency** - correct soon, not immediately - is fine for like counts, feeds, search indexes and analytics, and is not fine for balances, inventory and anything a user is looking at right after they changed it.',
        },
      ],
    },
    {
      id: 'at-scale',
      title: 'Algorithms that scale, and the eight questions',
      takeaway: 'Solve it on one machine, then ask what breaks when it will not fit.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Sometimes you are not asked for a whole system, only for one algorithm that has to work at scale. There is a four-step version for that.',
        },
        {
          kind: 'steps',
          items: [
            '**Ask questions.** Same as before - the details left out are often the problem.',
            '**Make believe.** Pretend it all fits on one machine with unlimited memory. Solve that. This is the outline of the real answer.',
            '**Get real.** How much *does* fit on one machine? What breaks when you split the data - how do you divide it, and how does a machine find data it does not hold?',
            '**Solve those problems.** Sometimes by removing the issue, sometimes by mitigating it. Expect the fixes to create new problems, and iterate.',
          ],
        },
        {
          kind: 'p',
          text: 'The worked example: find every document containing a set of words, over millions of documents. On one machine it is an inverted index - a hash map from word to the list of documents containing it - and a query is an intersection of those lists. Split it by keyword range (machine 1 owns "after" to "apple"), send each machine only the words it owns, let it intersect locally, then intersect the machines\' answers. The lookup table stays tiny because it only stores ranges; the weakness is that adding documents can force an expensive re-shuffle of keywords.',
        },
        { kind: 'anim', animId: 'sd-bloom' },
        {
          kind: 'p',
          text: 'The same "make believe, then get real" move handles deduplication at ten billion URLs. In memory it is a hash set. In reality, either hash each URL to one of 4,000 files (`hash(u) % 4000`) and process one file at a time, or send it to one of 4,000 machines and process them in parallel - faster, but now you depend on 4,000 machines behaving. A bloom filter shrinks the memory further at the cost of false positives.',
        },
        {
          kind: 'table',
          caption: 'The eight chapter questions, and the decision each turns on',
          headers: ['Question', 'The move'],
          rows: [
            [
              '9.1 Stock data',
              'Compare the delivery mechanisms honestly - flat files on FTP, a SQL database exposed to clients, a web service with a documented API - against client ease, our maintenance cost, future flexibility and efficiency. The web service wins because it hides our schema and lets us change it later.',
            ],
            [
              '9.2 Social network',
              'Store friends as ids, not objects, and traverse machine to machine. Use **bidirectional BFS**: searching from both ends turns O(k^q) into O(k^(q/2)) - for a path of length 4 with 100 friends each, 20,000 nodes instead of 100 million. Batch the machine hops, and shard people by country or city so friends usually share a machine.',
            ],
            [
              '9.3 Web crawler',
              'Infinite loops are cycles in the link graph, so track what you have visited - but "same page" is genuinely undefined. URL parameters can mean a different page or nothing at all; content can be randomised. Use a similarity signature over URL and content, deprioritise near-duplicates rather than banning them, and crawl by priority queue.',
            ],
            [
              '9.4 Duplicate URLs',
              'Estimate first: 10 billion × 100 chars × 4 bytes ≈ 4 TB. Then split by hash into chunks that do fit - on disk in two passes, or across machines in parallel. Say which and why.',
            ],
            [
              '9.5 Cache',
              'An LRU cache is a hash map plus a doubly linked list: the map gives O(1) lookup, the list gives O(1) eviction of the stalest entry, and every hit moves its node to the front. Across 100 machines, choose between per-machine caches (simple, low hit rate), a shared cache (one hop, better hit rate), or hashing queries to a machine so each query has one home. Update by expiring on a timer *and* invalidating on known content changes - popular entries never expire on their own.',
            ],
            [
              '9.6 Sales rank',
              'Do not re-aggregate all history hourly. Keep a per-product row of the last seven days as a small circular buffer plus a running total, batch the writes in memory before committing, and sort by category then volume once so one walk yields every category\'s ranking. Accuracy can be tiered: hourly for the top 100, daily for the long tail.',
            ],
            [
              '9.7 Personal financial manager',
              'Write-heavy and read-light: users transact daily and log in weekly. So pull from banks on a schedule rather than at login, categorise asynchronously, and never silently re-categorise old transactions when the rules change - users would see their history rewrite itself.',
            ],
            [
              '9.8 Pastebin',
              'Documents are large and never searched, so store them as files and keep only the URL→location mapping in the database. Generate 10 random alphanumeric characters (36^10 possibilities) rather than a sequential id, so URLs cannot be guessed; detect the rare collision and retry. Cache hot documents - they can never go stale, since pastes are immutable. Log raw analytics, and sample them probabilistically for very popular pages.',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Poke holes in your own design',
          text: 'You are not being asked to re-architect something a company spent millions on. Finding the next weakness in your own answer, unprompted, is the single strongest signal you can send - and it is also the honest way to end the conversation.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'sd-1',
      kind: 'technique',
      prompt: 'You are asked to design TinyURL. What comes first?',
      options: [
        'Choose a database',
        'Scope it: custom codes or generated, analytics, expiry, accounts - and what is out of scope',
        'Estimate the number of servers',
        'Draw a load balancer',
      ],
      answerIndex: 1,
      explain:
        'You cannot design what you have not defined, and scoping is itself part of what is being assessed.',
    },
    {
      id: 'sd-2',
      kind: 'complexity',
      prompt: 'Roughly how much memory maps every 32-bit integer to one boolean?',
      options: ['4 MB', '512 MB', '4 GB', '512 GB'],
      answerIndex: 1,
      explain:
        '2^32 bits = 2^29 bytes ≈ half a gigabyte. That fits on a laptop - which is exactly the kind of thing the powers-of-two table settles in seconds.',
    },
    {
      id: 'sd-3',
      kind: 'concept',
      prompt: 'What does horizontal scaling demand that vertical scaling does not?',
      options: [
        'A faster network card',
        'Stateless servers, so any machine can serve any request',
        'A relational database',
        'More memory per node',
      ],
      answerIndex: 1,
      explain:
        'Cloned servers behind a load balancer must be interchangeable, so session state moves to a shared store or a token.',
    },
    {
      id: 'sd-4',
      kind: 'concept',
      prompt: 'You shard with `hash(key) % n` and add one machine. What happens?',
      options: [
        'Only the new machine\'s share of keys moves',
        'Nearly every key\'s home changes, forcing a huge data migration',
        'Nothing - the mapping is stable',
        'Only keys with hash collisions move',
      ],
      answerIndex: 1,
      explain:
        'The modulus changed, so almost every key recomputes. Consistent hashing limits it to roughly 1/n of the keys.',
    },
    {
      id: 'sd-5',
      kind: 'technique',
      prompt: 'A bloom filter says a URL is present. What do you actually know?',
      options: [
        'It is definitely present',
        'It is probably present - the bits could have been set by other items',
        'Nothing at all',
        'It is definitely absent',
      ],
      answerIndex: 1,
      explain:
        'False positives are possible; false negatives are not. A "no" is conclusive, a "yes" needs confirming if it matters.',
    },
    {
      id: 'sd-6',
      kind: 'technique',
      prompt: 'Design a cache with O(1) lookup and O(1) eviction of the stalest entry.',
      options: [
        'A sorted array of entries by last-access time',
        'A hash map to nodes of a doubly linked list, moving each hit to the front',
        'A min-heap keyed by timestamp',
        'A queue of queries, scanned on lookup',
      ],
      answerIndex: 1,
      explain:
        'That is LRU: the map gives constant lookup, the list gives constant reordering and eviction from the tail.',
    },
    {
      id: 'sd-7',
      kind: 'complexity',
      prompt:
        'Finding the shortest path between two people in a huge social graph, where each has k friends and the path has length q. Bidirectional BFS costs:',
      options: ['O(k^q)', 'O(k^(q/2))', 'O(q)', 'O(k log q)'],
      answerIndex: 1,
      explain:
        'Searching from both ends and meeting in the middle. For q=4 and k=100 that is 20,000 nodes instead of 100 million.',
    },
    {
      id: 'sd-8',
      kind: 'concept',
      prompt: 'When is eventual consistency an acceptable trade?',
      options: [
        'Always - it is strictly faster',
        'For like counts, feeds and analytics; not for balances, inventory, or a value the user just changed',
        'Only in relational databases',
        'Never in an interview answer',
      ],
      answerIndex: 1,
      explain:
        'The test is whether a briefly stale answer can cause a wrong decision - or just a slightly out-of-date number.',
    },
    {
      id: 'sd-9',
      kind: 'concept',
      prompt: 'You widen the network pipe between two datacentres. What improves?',
      options: [
        'Latency only',
        'Throughput and bandwidth, but not latency',
        'All three equally',
        'Nothing measurable',
      ],
      answerIndex: 1,
      explain:
        'A wider conveyor belt carries more items per second; each item still takes the same time to cross. Only a shorter path cuts latency.',
    },
    {
      id: 'sd-10',
      kind: 'technique',
      prompt:
        'Ten billion URLs, ~100 characters each. What is the first thing to say?',
      options: [
        'Sort them and scan for adjacent duplicates',
        'That is roughly 4 TB, so it will not fit in memory - split by hash across files or machines',
        'Use a balanced binary search tree',
        'Compress them first',
      ],
      answerIndex: 1,
      explain:
        'The estimate is what makes the rest of the answer inevitable. Solve it in memory first, then split by `hash(u) % chunks`.',
    },
  ],
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
