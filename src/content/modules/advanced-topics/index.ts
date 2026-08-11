import type { CourseModule } from '../../types';
import { visualgoUrl } from '../../../data/visualgo';

export const advancedTopics: CourseModule = {
  id: 'advanced-topics',
  title: 'Advanced Topics',
  track: 'techniques',
  status: 'complete',
  source: 'Part XI',
  summary:
    'The reference survey: topological sort, Dijkstra, rolling hashes, self-balancing trees and MapReduce. For recognition, not mastery.',
  estimatedMinutes: 70,
  concepts: [
    'Useful arithmetic identities: sum of 1..n, sum of powers of two, geometric series, and the log identities',
    'Why the sum of the leaves dominates a binary tree (about half the nodes are at the bottom level)',
    'Topological sort by repeatedly removing zero-indegree nodes',
    'Topological sort via DFS post-order, and why the reversed finish order works',
    'Detecting a cycle during either method, and reporting it rather than looping',
    "Dijkstra's algorithm: greedy shortest paths with non-negative weights",
    'Dijkstra with a priority queue: O((V + E) log V), and why negative weights break it',
    'Hash collision resolution: separate chaining vs open addressing (linear probing, quadratic probing, double hashing)',
    'Load factor, resizing, and clustering in open addressing',
    'Rabin-Karp: rolling hashes for substring search, with verification on a hash match',
    'Why Rabin-Karp is O(n + m) expected and O(nm) worst case',
    'AVL trees: balance factors and the four rotation cases',
    'Red-black trees: the colour invariants, recolouring, and when a rotation is forced',
    'Why self-balancing matters: it is what keeps map and set operations O(log n)',
    'MapReduce: the map, shuffle/group and reduce stages',
    'Designing a MapReduce job: what the key is, and why that choice decides everything',
  ],
  sections: [
    {
      id: 'why-this-module',
      title: 'Useful math, and how to use this module',
      takeaway:
        'Recognition, not mastery. Plus the handful of identities that keep appearing in complexity proofs.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'These topics are genuinely rare in interviews. When one does come up, the interviewer usually wants to watch you *derive* it, not recite it - and a candidate who already knows the algorithm is not rewarded for it. So read this for recognition. If you are short on time, this is the module to skim.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'What "recognition" buys you',
          text: 'Knowing that topological sort exists means you spot a dependency-ordering problem in ten seconds instead of ten minutes. Knowing rolling hashes exist means "substring search in linear time" is on your menu. That is the value - not being able to write a red-black delete on a whiteboard.',
        },
        {
          kind: 'p',
          text: 'First, the arithmetic that turns up in complexity arguments over and over.',
        },
        {
          kind: 'table',
          headers: ['Identity', 'Value', 'Where it bites'],
          rows: [
            [
              '1 + 2 + … + n',
              'n(n+1)/2',
              'A loop whose inner bound shrinks each pass - O(n²), not O(n)',
            ],
            [
              '2⁰ + 2¹ + … + 2ⁿ',
              '2ⁿ⁺¹ − 1',
              'A doubling array: all past copies together cost less than the last one',
            ],
            [
              'log_b k vs log_x k',
              'off by the constant 1/log_x b',
              'Why the base of a log never appears in big O',
            ],
            ['n!', 'n · (n−1) · … · 1', 'Permutations of n distinct items'],
            ['n!/(n−k)!', 'n · (n−1) · … · (n−k+1)', 'Ordered k-length selections'],
            [
              'n choose k',
              'n! / (k!(n−k)!)',
              'Unordered subsets - divide out the k! orderings of each',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The leaves dominate',
          text: 'The powers-of-two sum is why a perfect binary tree has about as many leaves as all its other levels combined, and why the bottom level of a recursion tree usually decides the runtime. When you analyse a recursive algorithm, look at the last row first.',
        },
        {
          kind: 'p',
          text: 'And induction, which is the proof form these recursions want. Prove the base case; assume P(n); show P(n) implies P(n+1). To show an n-element set has 2ⁿ subsets: exactly half the subsets of an (n+1)-element set contain the new element and half do not, and the ones that do not are precisely the subsets of the old set. So 2ⁿ + 2ⁿ = 2ⁿ⁺¹.',
        },
      ],
    },
    {
      id: 'topological-sort',
      title: 'Topological sort',
      takeaway: 'Order a dependency graph by repeatedly taking whatever has no prerequisites left.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A topological sort of a directed graph lists the nodes so that every edge (a, b) has a before b. Build order, course prerequisites, task scheduling, spreadsheet recalculation - all the same question. It exists exactly when the graph is directed and acyclic.',
        },
        { kind: 'anim', animId: 'at-toposort' },
        {
          kind: 'steps',
          items: [
            "Count each node's indegree by walking every node's outgoing edges and incrementing the target.",
            'Push every node with indegree 0 onto a queue - these have no prerequisites.',
            'Pop a node, append it to the output, and decrement the indegree of each node it points at.',
            'Whenever a node hits indegree 0, push it.',
            'If the output holds every node, you are done. If it stops short, the leftovers form a cycle.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Why a zero-indegree node must exist',
          text: 'Pick any node and walk edges backwards. Either you stop - and you have found a node with no incoming edges - or you revisit a node, which means there is a cycle. So in an acyclic graph the queue can never be empty while work remains.',
        },
        {
          kind: 'p',
          text: 'There is a second formulation via DFS: run depth-first search and push each node onto a stack when it *finishes*, then read the stack off. A node finishes only after everything it depends on has finished, so the reversed finish order is a valid topological order. A cycle shows up as an edge back into a node that is on the current recursion stack - grey, in the classic white/grey/black colouring.',
        },
        {
          kind: 'table',
          headers: ['', 'Kahn (indegrees)', 'DFS post-order'],
          rows: [
            ['Shape', 'Iterative, queue-driven', 'Recursive'],
            [
              'Cycle detection',
              'Output is shorter than the node count',
              'Edge to a node still on the stack',
            ],
            [
              'Extras',
              'Lexicographically smallest order with a heap; detects all sources',
              'Reuses an existing DFS; no indegree pass',
            ],
            ['Cost', 'O(V + E)', 'O(V + E)'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Report the cycle, do not loop on it',
          text: 'Real inputs contain cycles. An implementation that spins or silently drops nodes is a bug; returning "no valid order, here is the cycle" is the correct behaviour, and interviewers ask for it.',
        },
      ],
    },
    {
      id: 'dijkstra',
      title: "Dijkstra's algorithm",
      takeaway:
        'Settle the cheapest frontier node, relax its edges, repeat. Non-negative weights only.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'BFS finds shortest paths when every edge costs the same. Once edges carry weights, the fewest-hops route and the cheapest route diverge, and you need Dijkstra.',
        },
        {
          kind: 'p',
          text: 'The intuition: imagine cloning yourself at the source and sending a copy down every edge at a speed matching its weight. The first clone to reach a node got there by the shortest path; anyone arriving later can stop. Dijkstra is that race, run one step at a time, always advancing whichever clone has spent the least so far.',
        },
        { kind: 'anim', animId: 'at-dijkstra' },
        {
          kind: 'bullets',
          items: [
            '`dist[node]`: the best distance found so far, ∞ for everything but the source.',
            '`previous[node]`: the predecessor on that path, so you can reconstruct the route at the end.',
            'A min-priority queue of unsettled nodes keyed by `dist`.',
            'Relaxing edge (n, x): if `dist[n] + w(n,x) < dist[x]`, take the improvement and record `previous[x] = n`.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The invariant',
          text: 'When a node is removed from the queue, its distance is final. That holds because every remaining route to it starts by leaving the settled set through some frontier node that already costs at least as much - and with non-negative weights, the rest of the journey can only add.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Negative weights break it, and not subtly',
          text: 'That invariant is exactly what a negative edge destroys: a longer-looking route can get cheaper later, so a settled node may need reopening. Use Bellman-Ford (O(VE), and it detects negative cycles) or Floyd-Warshall for all pairs.',
        },
        {
          kind: 'table',
          headers: ['Priority queue', 'Runtime', 'Best for'],
          rows: [
            ['Array scan for the minimum', 'O(V²)', 'Dense graphs where E approaches V²'],
            ['Binary heap', 'O((V + E) log V)', 'Sparse graphs - the usual case'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Same skeleton, different relaxation',
          text: 'Swap "sum of weights, minimise" for "product of probabilities, maximise" and the same loop finds the most reliable path. Add a hop count to the state and it handles "cheapest with at most k stops". `A*` is Dijkstra with a heuristic added to the queue key. Recognising the skeleton is worth more than memorising the one instance.',
        },
      ],
    },
    {
      id: 'hash-collisions',
      title: 'Hash collision resolution',
      takeaway: 'Chaining or open addressing. Both are O(1) until the load factor climbs.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Any hash table can collide - the pigeonhole principle guarantees it as soon as the key space exceeds the array. What separates implementations is what happens next.',
        },
        {
          kind: 'table',
          headers: ['Scheme', 'How', 'Worst case', 'Watch out for'],
          rows: [
            [
              'Separate chaining (lists)',
              'Each slot holds a linked list of entries',
              'O(n)',
              'Only degenerates with a terrible hash or adversarial keys',
            ],
            [
              'Chaining with BSTs',
              'Each slot holds a balanced tree',
              'O(log n)',
              'Rarely worth it unless the distribution is badly skewed',
            ],
            [
              'Linear probing',
              'On collision, walk to the next free slot',
              'O(n)',
              'Clustering - and the table cannot exceed the array size',
            ],
            [
              'Quadratic probing',
              'Step 1, 4, 9, … slots on',
              'O(n)',
              'Breaks up clusters; can fail to find a free slot without care',
            ],
            [
              'Double hashing',
              'A second hash gives the step size',
              'O(n)',
              'Best clustering behaviour of the three',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Clustering, concretely',
          text: 'In a 100-slot table with linear probing where slots 20-29 are full, the next insert lands on slot 30 if it hashes anywhere in 20-30 - a 10% chance rather than 1%. Full runs attract more entries, which makes them longer. Quadratic probing and double hashing exist to break that feedback loop.',
        },
        {
          kind: 'p',
          text: 'The load factor - entries divided by slots - is what actually governs performance. Chaining degrades gracefully as it passes 1; open addressing degrades sharply as it approaches 1, and cannot exceed it at all. Real tables resize (usually doubling and rehashing everything) at a threshold, which is O(n) for that one insert but O(1) amortised, by the powers-of-two sum from the first section.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'What to say in an interview',
          text: '"Amortised O(1) average, O(n) worst case, assuming a decent hash function" is the answer to give when you use a hash map - and being able to name chaining versus open addressing is the follow-up.',
        },
      ],
    },
    {
      id: 'rabin-karp',
      title: 'Rabin-Karp substring search',
      takeaway:
        'Hash the window instead of comparing it, and update the hash in O(1) as it slides.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Searching for a pattern of length s in a text of length b, the brute force compares up to s characters at each of b − s + 1 positions: O(s(b − s)). Rabin-Karp replaces almost all of those character comparisons with a single integer comparison.',
        },
        { kind: 'anim', animId: 'at-rolling-hash' },
        {
          kind: 'bullets',
          items: [
            'Equal strings always hash equally, so a hash mismatch lets you skip a position without looking at a character.',
            'Unequal strings can still collide, so a hash *match* must be verified character by character.',
            'The hash of the next window is computed from the current one - remove the outgoing character, shift, add the incoming one - which is O(1) per position.',
          ],
        },
        {
          kind: 'code',
          lang: 'text',
          code: `hash("doe") = code(d)·128² + code(o)·128¹ + code(e)·128⁰
hash("oe ") = (hash("doe") − code(d)·128²)·128 + code(" ")`,
          caption:
            'The Rabin fingerprint: treat the window as a base-128 number, so position matters and "ab" ≠ "ba".',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'A sum is not a rolling hash',
          text: 'Summing character codes rolls beautifully and collides constantly, because it ignores order. Every anagram of the pattern is a false positive. Use a positional hash, and take it modulo a large prime so the value stays in a machine word.',
        },
        {
          kind: 'p',
          text: 'Expected time is O(s + b): linear text scan, plus verification only on the rare collisions. Worst case is O(sb), when every window collides - possible with a bad hash or adversarial input. In practice this is the tool for "find repeated substrings" problems, usually combined with a binary search over the length.',
        },
      ],
    },
    {
      id: 'balanced-trees',
      title: 'Self-balancing trees',
      takeaway:
        'Rotations keep the height logarithmic. That is what makes a sorted map O(log n) instead of O(n).',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A binary search tree fed sorted data degenerates into a linked list, and every operation becomes O(n). Self-balancing trees prevent that by re-shaping themselves on insert and delete - and they are the reason `TreeMap`, `std::map` and their equivalents can promise O(log n).',
        },
        { kind: 'anim', animId: 'at-avl' },
        {
          kind: 'p',
          text: "An AVL tree stores each node's balance factor - left height minus right height - and requires it to stay within −1…1. Inserting can push a node to ±2, which is repaired on the way back up the recursion by one or two rotations.",
        },
        {
          kind: 'table',
          headers: ['Shape', 'Balance', 'Fix'],
          rows: [
            ['Left-left', '+2, left child +1', 'One right rotation'],
            ['Left-right', '+2, left child −1', 'Left rotation on the child, then right rotation'],
            ['Right-right', '−2, right child −1', 'One left rotation'],
            ['Right-left', '−2, right child +1', 'Right rotation on the child, then left rotation'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Rotations preserve order',
          text: 'A rotation only re-parents three links; the in-order traversal is untouched. That is why it is always a legal move on a search tree, and why you can apply it purely to fix shape.',
        },
        {
          kind: 'p',
          text: 'Red-black trees take a looser approach. Every node is red or black, the root is black, null leaves count as black, a red node cannot have a red child, and every path from a node to its leaves contains the same number of black nodes.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Why those rules balance anything',
          text: 'No two reds may be adjacent, so at most half the nodes on a path are red. With b black nodes on every path, the shortest possible path is b and the longest is 2b - the two can never differ by more than a factor of two, which is all O(log n) requires.',
        },
        {
          kind: 'steps',
          items: [
            'Insert as in a normal BST; colour the new node red, so no black count changes.',
            'If the root became red, just repaint it black - no other property is affected.',
            "If the new node's parent is red, there is a red violation. Look at the uncle.",
            'Uncle red: recolour parent and uncle black and grandparent red. Black counts are preserved, but the grandparent may now clash with its own parent, so recurse upward.',
            'Uncle black: rotate. In each of the four child-position cases, the middle value of node, parent and grandparent becomes the local root and swaps colour with the grandparent.',
          ],
        },
        {
          kind: 'table',
          headers: ['', 'AVL', 'Red-black'],
          rows: [
            ['Balance', 'Stricter - shallower trees', 'Looser - up to 2x path difference'],
            ['Lookups', 'Faster', 'Slightly slower'],
            ['Insert/delete', 'More rotations', 'Fewer rotations, cheaper rebalancing'],
            [
              'Use when',
              'Read-heavy',
              'Write-heavy - which is why most standard libraries pick it',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Do not memorise the cases',
          text: 'Study why each one works: does it keep the search order, does it keep the black counts equal, does it remove the red violation? Nobody will ask you to reproduce red-black deletion, and if they do, the question is broken.',
        },
      ],
    },
    {
      id: 'mapreduce',
      title: 'MapReduce, and what to read next',
      takeaway: 'Choose the key by asking what Reduce needs. Everything else follows from that.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'MapReduce shows up in system design answers as the standard way to process more data than one machine holds. You write two functions; the framework does the rest.',
        },
        { kind: 'anim', animId: 'at-mapreduce' },
        {
          kind: 'code',
          lang: 'text',
          code: `map(name, document):
  for each word w in document:
    emit(w, 1)

reduce(word, counts):
  emit(word, sum(counts))`,
          caption:
            'Word count - the "hello world" of MapReduce, and worth being able to write from memory.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Reduce output can be re-reduced',
          text: 'Asked for the average temperature per city per year, emitting a bare average is wrong: averaging 80 (from two readings) with 50 (from one) gives 65, not 70. Emit (average, count) and combine with weights. Any Reduce whose output feeds back into Reduce must be associative on the state it emits.',
        },
        {
          kind: 'bullets',
          items: [
            '**The key is the design.** Everything with the same key lands on one reducer, so the key decides what can be aggregated together and how evenly the work spreads.',
            '**Work backwards.** Decide what Reduce needs to see, then write the Map that produces it.',
            '**Watch for skew.** One enormously popular key means one reducer does all the work while the rest idle.',
          ],
        },
        {
          kind: 'p',
          text: 'Finally, the topics worth being able to name if they come up, even without implementing them:',
        },
        {
          kind: 'table',
          headers: ['Topic', 'One line'],
          rows: [
            ['Bellman-Ford', 'Shortest paths with negative edges; detects negative cycles. O(VE)'],
            [
              'Floyd-Warshall',
              'All-pairs shortest paths, negative edges allowed, no negative cycles',
            ],
            [
              'Minimum spanning tree',
              'Cheapest set of edges connecting every vertex - Kruskal or Prim',
            ],
            ['B-trees', 'High-fanout balanced trees for disk; the shape of every database index'],
            ['`A*`', 'Dijkstra plus an admissible heuristic on the queue key'],
            ['Interval trees', 'A balanced BST over ranges - "who overlaps this window?"'],
            [
              'Graph colouring',
              'No two adjacent nodes share a colour; register allocation, scheduling',
            ],
            [
              'Bipartite graphs',
              'Nodes split into two sides with every edge crossing - the same as 2-colourable',
            ],
            [
              'P, NP, NP-complete',
              'Solvable quickly / verifiable quickly / the hardest of those, all reducible to each other',
            ],
            [
              'Regular expressions',
              'Know what they can match, and that matching compiles to a state machine',
            ],
          ],
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'at-1',
      kind: 'technique',
      prompt:
        'Kahn-style topological sort finishes with fewer nodes in the output than the graph contains. This means:',
      options: [
        'The graph is disconnected',
        'The remaining nodes contain a cycle, so no valid ordering exists',
        'The queue was processed in the wrong order',
        'Some node had indegree greater than one',
      ],
      answerIndex: 1,
      explain:
        'Every node in an acyclic graph eventually reaches indegree 0. A short output is the cycle detector - report it rather than looping.',
    },
    {
      id: 'at-2',
      kind: 'concept',
      prompt:
        'Why does the DFS formulation of topological sort push a node when it *finishes* rather than when it is first visited?',
      options: [
        'It is faster',
        'A node finishes only after everything reachable from it has finished, so the reversed finish order respects every edge',
        'To avoid recursion depth issues',
        'So the output is lexicographically smallest',
      ],
      answerIndex: 1,
      explain:
        'Finish time captures "all my dependents are done", which reversed gives "I come before all of them".',
    },
    {
      id: 'at-3',
      kind: 'concept',
      prompt: "A single negative-weight edge breaks Dijkstra's algorithm because:",
      options: [
        'The priority queue cannot store negative keys',
        'A settled node may turn out to be reachable more cheaply later, so "settled means final" no longer holds',
        'The graph becomes cyclic',
        'Distances would go below zero',
      ],
      answerIndex: 1,
      explain:
        'The correctness proof needs every extension of a path to cost at least as much. Use Bellman-Ford when weights can be negative.',
    },
    {
      id: 'at-4',
      kind: 'complexity',
      prompt: 'Dijkstra with a binary heap on a graph with V vertices and E edges runs in:',
      options: ['O(V²)', 'O(V + E)', 'O((V + E) log V)', 'O(E log E + V²)'],
      answerIndex: 2,
      explain:
        'V removals and up to E key updates, each O(log V). The array implementation is O(V²), which is better on dense graphs.',
    },
    {
      id: 'at-5',
      kind: 'concept',
      prompt:
        'A hash table using linear probing has slots 20-29 full and the rest empty. The chance the next insert lands in slot 30 is:',
      options: [
        '1%, like any other slot',
        'About 10%, because anything hashing into 20-30 ends up there',
        '0%',
        '50%',
      ],
      answerIndex: 1,
      explain:
        'That is clustering: a full run captures every key that hashes into it, which makes the run longer. Quadratic probing and double hashing break the feedback loop.',
    },
    {
      id: 'at-6',
      kind: 'technique',
      prompt:
        'In Rabin-Karp, a window whose hash equals the pattern hash still has to be compared character by character. Why?',
      options: [
        'To handle case sensitivity',
        'Because different strings can hash to the same value - equal hashes are necessary but not sufficient',
        'Because the rolling update accumulates rounding error',
        'To find the index of the match',
      ],
      answerIndex: 1,
      explain:
        'Equal strings always hash equally; the converse fails. Verification is what keeps the algorithm correct rather than merely fast.',
    },
    {
      id: 'at-7',
      kind: 'complexity',
      prompt:
        'Rabin-Karp is described as O(s + b) expected but O(sb) worst case. The worst case happens when:',
      options: [
        'The pattern is longer than the text',
        'Nearly every window collides with the pattern hash, so almost every position is verified in full',
        'The text contains no match',
        'The alphabet is large',
      ],
      answerIndex: 1,
      explain:
        'Collisions force full comparisons. A positional hash modulo a large prime makes that vanishingly unlikely on real input.',
    },
    {
      id: 'at-8',
      kind: 'technique',
      prompt: 'An AVL node reaches balance +2 and its left child has balance −1. The repair is:',
      options: [
        'One right rotation at the unbalanced node',
        'Left rotation on the child, then right rotation on the unbalanced node',
        'Recolour the child and recurse upward',
        'Two right rotations',
      ],
      answerIndex: 1,
      explain:
        'That is the left-right shape. The first rotation converts it to left-left; the second fixes it. Rotations never disturb the in-order sequence.',
    },
    {
      id: 'at-9',
      kind: 'concept',
      prompt:
        'Red-black trees guarantee that the longest root-to-leaf path is at most twice the shortest. Which two properties produce that?',
      options: [
        'The root is black, and leaves are black',
        'Red nodes cannot have red children, and every path holds the same number of black nodes',
        'Every node is red or black, and inserts are coloured red',
        'Rotations preserve ordering, and inserts happen at leaves',
      ],
      answerIndex: 1,
      explain:
        'With b blacks on every path and no two adjacent reds, a path is at least b and at most 2b nodes - which is enough for O(log n).',
    },
    {
      id: 'at-10',
      kind: 'technique',
      prompt:
        'A MapReduce job computes the average temperature per city. Reduce emits a bare average, and the framework feeds that output into Reduce again. What goes wrong?',
      options: [
        'Nothing - averaging is associative',
        'Averages of averages ignore how many readings each one summarised, so the result is weighted wrongly',
        'The shuffle stage cannot route floating-point keys',
        'The Map step emits too many pairs',
      ],
      answerIndex: 1,
      explain:
        'Emit (average, count) and combine with weights. Any value that may be re-reduced must carry enough state to be combined correctly.',
    },
  ],
  drills: [
    { slug: 'course-schedule-ii', note: 'CTCI 4.7 - topological sort producing the actual order.' },
    { slug: 'network-delay-time', note: 'Dijkstra, straight.' },
    {
      slug: 'cheapest-flights-within-k-stops',
      note: 'Where plain Dijkstra needs modifying - a good stress test.',
    },
    { slug: 'path-with-maximum-probability', note: 'Dijkstra with a different relaxation rule.' },
    { slug: 'longest-duplicate-substring', note: 'Binary search on length plus Rabin-Karp.' },
    {
      slug: 'redundant-connection',
      note: 'Union-find as the other way to think about connectivity.',
    },
    {
      slug: 'design-hashmap',
      note: 'Implement chaining yourself, then think about open addressing.',
    },
  ],
  visualizers: [
    {
      url: visualgoUrl('sssp'),
      note: "Run Dijkstra one relaxation at a time, then add a negative edge and watch it give a wrong answer.",
    },
    {
      url: visualgoUrl('mst'),
      note: "Compare Kruskal's edge-by-edge picks against Prim's frontier growth on the same weighted graph.",
    },
    {
      url: visualgoUrl('hashtable'),
      note: 'Push the load factor toward 1 under open addressing and watch clustering take over.',
    },
    {
      url: visualgoUrl('bst'),
      note: 'Force an imbalance, switch to the AVL tab, and watch the rotation that fixes it.',
    },
    {
      url: visualgoUrl('cyclefinding'),
      note: 'Same DFS-based detection this module describes, on a graph you build edge by edge.',
    },
    {
      url: visualgoUrl('reductions'),
      note: 'See an NP-complete problem reduce to another - the "all reducible to each other" claim, live.',
    },
  ],
};
