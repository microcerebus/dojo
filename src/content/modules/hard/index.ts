import type { CourseModule } from '../../types';

export const hard: CourseModule = {
  id: 'hard',
  title: 'Hard Mixed Review',
  track: 'techniques',
  status: 'complete',
  source: 'Chapter 17',
  summary:
    'Twenty-six problems that combine two or three techniques. The goal is to derive and defend, not to recall.',
  estimatedMinutes: 150,
  concepts: [
    'Composing techniques: a trie inside a backtracking search, a heap inside a stream',
    'Bitwise arithmetic and recursive bit reconstruction',
    'Fisher-Yates shuffling and reservoir/random-subset sampling',
    'Prefix-difference maps for balanced-span and equal-count problems',
    'Minimal covering windows across multiple sequences',
    'Union-find and connected components for equivalence classes',
    'Longest increasing subsequence and its two-dimensional variants',
    'Heaps, quickselect and streaming order statistics',
    'Tries for multi-pattern search and prefix pruning',
    'Bidirectional BFS and reconstructing the path once the frontiers meet',
    'Histogram water trapping and maximal-submatrix reasoning',
    'Geometric preprocessing to make a brute force affordable',
    'Sparse inverted indexes and pairwise accumulation instead of all-pairs comparison',
    'Backtracking with prefix pruning for combinatorial construction',
    'Defending correctness and complexity under pressure when the answer is not standard',
  ],
  sections: [
    {
      id: 'composing',
      title: 'What makes these hard',
      takeaway: 'Not one exotic trick - two ordinary techniques stacked, and a bound to argue.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Almost nothing in this chapter needs an algorithm you have not already met. What it needs is combining two of them, and then defending the result: why it is correct, and why the complexity is what you say it is.',
        },
        {
          kind: 'bullets',
          items: [
            'A **trie** inside a **backtracking** search, so invalid prefixes die immediately.',
            'A **heap** inside a **stream**, so an order statistic stays available without re-sorting.',
            'A **prefix sum** inside a **hash map**, so a range question becomes a lookup.',
            'A **sort** inside a **DP**, so one dimension of the constraint disappears.',
            'An **inverted index** inside a **pairwise** problem, so the all-pairs loop never runs.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Best conceivable runtime, out loud',
          text: 'Before optimising, say what the floor is. If you must read every element, you cannot beat O(n). If the output is 2ⁿ items, you cannot beat O(2ⁿ). BCR tells you when to stop optimising, and it stops you chasing an O(log n) solution to a problem that has to read all its input.',
        },
        {
          kind: 'p',
          text: 'The working method is the same as everywhere else, just applied with more discipline: state a brute force with its cost, then attack it with BUD - the **b**ottleneck, **u**nnecessary work, **d**uplicated work. In this chapter the answer is almost always "duplicated work", and the fix is almost always a precomputed index.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Defend, do not assert',
          text: 'For non-standard answers, "this is correct because…" is the deliverable. Give the invariant that holds after each step, or the exchange argument for why a greedy choice is safe. An unexplained correct answer scores below an explained near-miss.',
        },
      ],
    },
    {
      id: 'bits-and-randomness',
      title: 'Bits, digits and randomness',
      takeaway: 'When you cannot read a value, reconstruct it one bit at a time.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Several questions here restrict what you are allowed to touch - no arithmetic operators, no whole-integer reads, no extra memory - and the answer is to work at the level of bits or digits instead.',
        },
        {
          kind: 'bullets',
          items: [
            '**Add without arithmetic operators.** XOR gives the column-wise sum with the carry discarded, and `(a & b) << 1` gives the carry. Loop until the carry is zero.',
            '**A missing value when you can only read one bit at a time.** Look at the least significant bit of every number. Among 0..n exactly one of "even" and "odd" should be more numerous; whichever count is short tells you the missing number\'s low bit. Keep only the numbers matching that bit and recurse on the next bit up. Each round halves the data, so n + n/2 + n/4 … is O(n).',
            '**One or two missing values from 1..N.** For one, the sum formula or a full XOR recovers it in O(1) space. For two, one equation is not enough: add a second - the sum of squares, or partition the numbers by a bit where the XOR of everything differs from the XOR of 1..N, which splits the two missing values into different buckets.',
            '**Counting a digit across a range.** Do not iterate to n. Count position by position: for each digit place, the count of 2s contributed by that place is a closed-form expression of the digits above and below it. O(log n) rather than O(n log n).',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Fisher-Yates, and why the obvious shuffle is wrong',
          text: 'Walk from the end, and swap each position with a uniformly random index from 0 up to and including itself. That gives every one of the n! orderings equal probability. Swapping with a random index over the *whole* array instead produces nⁿ equally likely execution paths onto n! outcomes, which do not divide evenly - so some orderings become more likely than others. Be able to say that; it is the entire question.',
        },
        {
          kind: 'p',
          text: 'Choosing m elements uniformly from n is the same argument, truncated: run the first m steps of the shuffle and take the prefix. For a stream of unknown length, use reservoir sampling instead - keep the first m, and for the i-th arriving element replace a random reservoir slot with probability m/i. The induction that this stays uniform at every prefix is what is actually being tested.',
        },
      ],
    },
    {
      id: 'prefix-and-window',
      title: 'Prefix differences and covering windows',
      takeaway: 'Turn "some range has property P" into an equality between two prefix values.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A large family of range problems is unlocked by the same rewriting: define a running quantity over prefixes, and notice that the property you want is an equation relating two of them.',
        },
        {
          kind: 'steps',
          items: [
            'For "the longest span with equally many letters and digits", define `diff` as letters minus digits over the prefix ending at each index.',
            'A span has equal counts exactly when `diff` is the same at both its endpoints - the differences cancel.',
            'So store the *first* index at which each `diff` value was seen, and for every later index with the same value, the span between them is a candidate. One pass, O(n) time and space.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The same rewriting, four disguises',
          text: 'Equal counts of two symbols, a subarray summing to k, a subarray whose sum is divisible by k, a binary array with equal 0s and 1s - all four are "two prefixes are equal (or differ by k)", answered by a hash map from prefix value to earliest index. Recognising the shape is worth more than any single solution.',
        },
        {
          kind: 'p',
          text: 'The shortest window containing every required value is a different pattern with a similar smell. Preprocess the positions of each required value into its own sorted list, then advance whichever list currently holds the smallest position - the window is bounded by the smallest and largest of the current heads. A min-heap of the heads makes each step O(log k), for O(n log k) overall.',
        },
        {
          kind: 'bullets',
          items: [
            '**Majority element in O(n) time and O(1) space.** Boyer-Moore: hold a candidate and a counter; a matching element increments it, a differing element decrements it, and a zero counter adopts the next element as the new candidate. A true majority survives because it outnumbers everything else combined - but the survivor is only a *candidate*, so a second pass must verify it. Skipping that pass is the classic failure.',
            '**Shortest distance between two words in a file.** One query: a single pass keeping the last-seen index of each word. Many queries over the same file: precompute a map from word to its sorted list of positions, then answer each query by walking the two lists together - O(a + b) instead of O(file).',
          ],
        },
      ],
    },
    {
      id: 'order-statistics',
      title: 'Order statistics and streams',
      takeaway: 'You rarely need the whole sorted order - just one position in it.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Sorting to find one rank is usually overkill. Three tools cover the space, and choosing between them is the question.',
        },
        {
          kind: 'table',
          headers: ['Need', 'Tool', 'Cost'],
          rows: [
            ['The smallest k, offline', 'Max-heap of size k, or quickselect', 'O(n log k) / O(n) expected'],
            ['The median of a stream', 'A max-heap of the low half, a min-heap of the high half', 'O(log n) insert, O(1) query'],
            ['The kth item of a generated sequence', 'A min-heap, or one queue per multiplier', 'O(k log k) / O(k)'],
          ],
        },
        {
          kind: 'bullets',
          items: [
            '**Smallest k.** A max-heap of size k keeps the k best seen so far and evicts its own maximum - O(n log k) and it never holds more than k items, which matters for a stream. Quickselect partitions like quicksort but recurses into only one side, giving O(n) expected and O(n²) worst, and it mutates the array.',
            '**Streaming median.** Keep the smaller half in a max-heap and the larger half in a min-heap, rebalancing so their sizes differ by at most one. The median is then one or both heap tops, in O(1).',
            '**The kth number whose only prime factors are 3, 5 and 7.** Do not test numbers for factors. *Generate* them: every such number is 3, 5 or 7 times a smaller one, so a min-heap seeded with 1 that pushes 3x, 5x and 7x on each pop produces them in order - with a set to suppress duplicates. Three queues do the same thing without a heap, in O(k).',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Generate, do not filter',
          text: 'When valid items are sparse in a huge space, constructing them directly beats testing candidates. That flip - from "check every number" to "build the next number from previous ones" - is the reusable idea, and it is exactly what a heap or a queue is for.',
        },
      ],
    },
    {
      id: 'tries-and-graphs',
      title: 'Tries, components and search',
      takeaway: 'Index the patterns, not the text - and search from both ends.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Word problems at this level are graph and trie problems wearing a disguise. The question is always which side of the problem to index.',
        },
        {
          kind: 'bullets',
          items: [
            '**Search one long text for many short patterns.** Build a trie of the *patterns*, then walk it from every starting position in the text. That is O(text × longest pattern) rather than O(text × patterns). Which side to index depends on which is larger - say so explicitly.',
            '**The longest word made of other words.** Sort by descending length and, for each candidate, ask recursively whether the remaining suffix can also be built from dictionary words - memoising on the suffix so the same tail is never re-solved.',
            '**Re-inserting spaces to minimise unrecognised characters.** A DP over suffixes: the best cost from position i is the minimum over every word that matches starting at i, plus the cost of treating one character as garbage and moving on. A trie makes "every word matching here" cheap to enumerate.',
            '**A rectangle whose rows and columns are all words.** Backtracking, one row at a time, with the trie checking after each row that every partial column is still a valid prefix. Without that check the search never finishes; with it, it prunes almost immediately.',
          ],
        },
        { kind: 'anim', animId: 'hard-union-find' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Equivalence means union-find',
          text: 'Whenever a relation is stated as transitive and symmetric - "these two names are the same, and it carries over" - you are being asked for connected components. Union-find is one array plus two short functions, and with path compression and union by size each operation is effectively constant. Building a graph and running a search per component gives the same answer with more code.',
        },
        { kind: 'anim', animId: 'hard-bidirectional-bfs' },
        {
          kind: 'p',
          text: 'A word ladder is a shortest path on an implicit graph, so it is BFS, not backtracking. Two refinements matter. Precompute the adjacency by bucketing words under wildcard keys like `D_MP`, so finding neighbours is a lookup instead of a scan over the dictionary. And search from both ends at once: two frontiers of depth d/2 explore roughly the square root of what one frontier of depth d does. Interleave them, and when they touch, join the two half-paths - remembering to reverse the backward one.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'In-place tree surgery',
          text: 'Converting a BST into a sorted doubly linked list in place is the same recursion as an in-order traversal: convert the left subtree, convert the right subtree, then join left-tail → node → right-head. Returning the head *and* the tail of each converted piece is what makes the joins O(1); returning only the head forces a walk and turns it quadratic.',
        },
      ],
    },
    {
      id: 'preprocess-then-dp',
      title: 'Preprocess, then run something simple',
      takeaway: 'The expensive-looking step is usually a cheap step over a precomputed table.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The last group all share a shape: an O(n³) or O(n⁴) brute force becomes affordable once you precompute the right summary and then run a one-dimensional algorithm over it.',
        },
        { kind: 'anim', animId: 'hard-trapping-water' },
        {
          kind: 'bullets',
          items: [
            '**Water in a histogram.** Each bar holds `min(tallest to the left, tallest to the right) − its own height`. Precomputing both maxima arrays is O(n) time and O(n) space; two converging pointers get it to O(1) space, because the shorter end is always safe to resolve.',
            '**Maximum-sum submatrix.** Fix a top row and a bottom row, collapse the rows between them into a single array of column sums, and run Kadane on it. O(n²) row pairs × O(n) Kadane = O(n³), and precomputed column prefix sums make the collapse O(n) rather than O(n²).',
            '**The largest square with a fully black border.** For every cell precompute the run of black pixels extending right and downwards. Then testing whether a given square has a solid border is four O(1) lookups instead of an O(k) scan - which turns O(n⁴) into O(n³).',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Sort one dimension away',
          text: 'A tower of people each strictly shorter and lighter than the one below is a two-dimensional ordering problem. Sort by height, and the height constraint is automatically satisfied for any subsequence - so what remains is a longest increasing subsequence on weight, in O(n²) or O(n log n). Removing a dimension by sorting is the reusable move.',
        },
        {
          kind: 'p',
          text: 'Not everything needs preprocessing, though. Maximising non-adjacent appointment minutes is a plain sequence DP: the best total up to each request is either skipping it - keeping the previous best - or taking it plus the best from two requests back. Two rolling variables, O(n) time and O(1) space. Recognising a dressed-up standard DP is worth as much as inventing a new one.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Sparse means invert the index',
          text: 'Comparing every pair of documents for overlap is O(D²·W). But if overlaps are rare, invert it: build a map from each element to the documents containing it, then for every element increment a counter for each pair of documents in its (short) list. Only pairs that genuinely share something are ever touched, so the cost tracks the number of real intersections instead of the number of possible pairs.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'hard-1',
      kind: 'technique',
      prompt:
        'Trapping rain water above a histogram, in O(1) extra space. Why is it safe to process the shorter of the two end bars?',
      options: [
        'Because it is the smallest value in the array',
        'Because the taller end guarantees a wall at least that high on the other side, so the near maximum is the binding one',
        'Because water always flows left to right',
        'It is not safe - the two-pointer version is only an approximation',
      ],
      answerIndex: 1,
      explain:
        'The bound is min(leftMax, rightMax). When the left bar is shorter, whatever lies between cannot lower the right-hand bound below it, so leftMax alone decides.',
    },
    {
      id: 'hard-2',
      kind: 'technique',
      prompt:
        'Longest subarray with equally many letters and digits. What is the O(n) formulation?',
      options: [
        'Sliding window with a count map',
        'Track letters-minus-digits over prefixes and store the first index of each value - equal values bound a balanced span',
        'Sort the array first',
        'Binary search on the answer length',
      ],
      answerIndex: 1,
      explain:
        'Equal counts means the running difference is unchanged across the span. The same rewriting solves "sum equals k" and "sum divisible by k".',
    },
    {
      id: 'hard-3',
      kind: 'concept',
      prompt: 'Boyer-Moore finds a majority-element candidate in one pass. What must follow?',
      options: [
        'Nothing - the candidate is always the majority',
        'A second pass to verify the candidate actually occurs more than n/2 times',
        'A sort to confirm the ordering',
        'A hash map count of every element',
      ],
      answerIndex: 1,
      explain:
        'The algorithm only guarantees that *if* a majority exists it is the survivor. With no majority it still returns something, so verification is mandatory.',
    },
    {
      id: 'hard-4',
      kind: 'technique',
      prompt: 'Maintaining the median of a stream of numbers. What is the standard structure?',
      options: [
        'A sorted array with binary-search insertion',
        'A max-heap of the lower half and a min-heap of the upper half, kept balanced',
        'A single min-heap',
        'A balanced BST re-sorted on each query',
      ],
      answerIndex: 1,
      explain:
        'The two heap tops straddle the median, so insertion is O(log n) and the query is O(1). Sorted-array insertion is O(n) per element.',
    },
    {
      id: 'hard-5',
      kind: 'complexity',
      prompt:
        'Bidirectional BFS on a graph with branching factor k and a shortest path of length d. Roughly how many nodes are explored?',
      options: ['k^d', '2·k^(d/2)', 'd·k', 'k^(2d)'],
      answerIndex: 1,
      explain:
        'Each frontier only has to reach depth d/2, so the work is about the square root of a single-ended search - the difference between minutes and milliseconds on a real dictionary.',
    },
    {
      id: 'hard-6',
      kind: 'concept',
      prompt:
        'Shuffling a deck by swapping each position with a uniformly random index over the whole array is biased. Why?',
      options: [
        'The random generator is not good enough',
        'It has nⁿ equally likely execution paths mapping onto n! outcomes, and n! does not divide nⁿ evenly',
        'It never produces the identity permutation',
        'It only shuffles the first half',
      ],
      answerIndex: 1,
      explain:
        'Fisher-Yates fixes it by drawing from 0..i inclusive, which gives exactly n! equally likely paths - one per permutation.',
    },
    {
      id: 'hard-7',
      kind: 'technique',
      prompt:
        'Merging name frequencies where "same name" is transitive and symmetric. What is the natural tool?',
      options: [
        'A hash map from name to canonical name',
        'Union-find, with path compression and union by size',
        'Sorting the names alphabetically',
        'A trie of the names',
      ],
      answerIndex: 1,
      explain:
        'Transitive equivalence classes are connected components. A plain map breaks as soon as two already-merged groups have to be joined.',
    },
    {
      id: 'hard-8',
      kind: 'complexity',
      prompt:
        'Maximum-sum submatrix of an n×n grid, by fixing a row pair and running Kadane on the collapsed columns. Total time?',
      options: ['O(n²)', 'O(n³)', 'O(n⁴)', 'O(n² log n)'],
      answerIndex: 1,
      explain:
        'O(n²) row pairs times O(n) for Kadane. Precomputed column prefix sums are what keep the collapse at O(n) instead of O(n²).',
    },
    {
      id: 'hard-9',
      kind: 'technique',
      prompt:
        'Finding all pairs of documents with non-zero overlap, when overlaps are known to be rare. What beats comparing every pair?',
      options: [
        'Sort each document and use two pointers',
        'Build an inverted index from element to documents, then increment a counter for each document pair inside each element\'s list',
        'Hash each document and compare the hashes',
        'Sample the documents',
      ],
      answerIndex: 1,
      explain:
        'The inverted index means only pairs that actually share an element are ever touched, so the cost tracks real intersections rather than possible pairs.',
    },
    {
      id: 'hard-10',
      kind: 'technique',
      prompt:
        'Building the largest rectangle whose rows and columns are all dictionary words. What makes the backtracking finish?',
      options: [
        'Trying rows in alphabetical order',
        'After each row, using a trie to check that every partial column is still a valid word prefix',
        'Limiting the rectangle to squares',
        'Memoising on the set of rows used',
      ],
      answerIndex: 1,
      explain:
        'Prefix pruning kills a branch as soon as any column becomes impossible, which is almost immediately. Without it the search space is hopeless.',
    },
  ],
  drills: [
    { slug: 'trapping-rain-water', note: 'CTCI 17.21 - do the two-pointer version, not just the DP one.' },
    { slug: 'maximal-rectangle', note: 'Histogram per row, then largest rectangle.' },
    { slug: 'sliding-window-maximum', note: 'A monotonic deque - the window pattern taken further.' },
    { slug: 'majority-element-ii', note: 'CTCI 17.10 generalised - Boyer-Moore with two candidates.' },
    { slug: 'contiguous-array', note: 'CTCI 17.5 - prefix differences in a hash map.' },
    { slug: 'shortest-word-distance-ii', note: 'CTCI 17.11 - preprocess positions. Premium.' },
    { slug: 'redundant-connection', note: 'Union-find, and the cycle it detects.' },
    { slug: 'word-ladder', note: 'CTCI 17.22 - then do it bidirectionally.' },
  ],
};
