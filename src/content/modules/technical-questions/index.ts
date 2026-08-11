import type { CourseModule } from '../../types';

export const technicalQuestions: CourseModule = {
  id: 'technical-questions',
  title: 'The technical-question method',
  track: 'techniques',
  status: 'complete',
  source: 'Part VII',
  summary:
    'The repeatable loop for attacking any coding question: clarify, example, brute force, BUD, BCR, code, test.',
  estimatedMinutes: 40,
  concepts: [
    'The problem-solving loop: listen, example, brute force, optimise, walk through, implement, test',
    'Listening for the constraint that the optimal solution depends on',
    'Drawing an example that is specific, large enough, and not a special case',
    'Stating a brute force and its complexity as a baseline to beat',
    'BUD: bottlenecks, unnecessary work, duplicated work',
    'DIY: solve it by hand on a big example, then reverse-engineer your own method',
    'Simplify and generalise',
    'Base case and build',
    'Data-structure brainstorming',
    'Best conceivable runtime as a target and as a stopping rule',
    'Time vs space tradeoffs and precomputation',
    'What good interview code looks like: modular, named, reusable, error-checked',
    'Testing order: conceptual, odd-looking lines, hot spots, small cases, edge cases',
    'Handling mistakes, hints, and questions you have seen before',
  ],
  sections: [
    {
      id: 'the-loop',
      title: 'The loop',
      takeaway: 'Seven steps, always in this order. Skipping one is where interviews go wrong.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Most failed interviews are not knowledge failures. They are process failures: coding before the algorithm was settled, or optimising something that was never the bottleneck. The fix is a loop you run every single time, until it is boring.',
        },
        { kind: 'anim', animId: 'tq-seven-steps' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Where the time goes',
          text: 'Roughly half the interview should be over before you write a line of code. Whiteboard coding is slow and editing it is slower, so the cheapest place to fix a design is out loud.',
        },
        {
          kind: 'p',
          text: 'You are being assessed continuously, not on a final answer. How you narrow ambiguity, whether you can name your own complexity, whether you take a hint gracefully - all of it counts, and all of it is visible only if you think out loud.',
        },
      ],
    },
    {
      id: 'listen-example',
      title: 'Listen, then draw',
      takeaway: 'Every stated constraint is a hint. Every bad example hides the pattern.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Interviewers rarely include a detail by accident. Treat each one as a load-bearing hint and write it down where you can see it.',
        },
        {
          kind: 'table',
          headers: ['If they say…', 'They are probably telling you…'],
          rows: [
            [
              '"the array is sorted"',
              'binary search or two pointers - do not throw the order away',
            ],
            [
              '"this runs repeatedly on a server"',
              'precompute or cache; amortise setup across many queries',
            ],
            ['"the values are all distinct"', 'a set or map key is safe; no duplicate bookkeeping'],
            [
              '"the integers are between 0 and 32,000"',
              'a bit vector or counting array fits in memory',
            ],
            [
              '"you only have 10 MB"',
              'chunking, external sort, or a bit vector - this is the real constraint',
            ],
            ['"return any valid answer"', 'stop looking for the lexicographically smallest one'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The classic failure',
          text: 'Candidates hear the constraint, then forget it ten minutes later and produce an algorithm that ignores it. When you are stuck, the first question is always: have I used everything I was given?',
        },
        {
          kind: 'p',
          text: 'Then draw an example - on the board, not in your head. A good example is specific (real values, not "some elements"), big enough to show a pattern (most candidates draw one about half the size it should be), and not a special case.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Accidental special cases',
          text: 'A four-node tree that happens to be perfectly balanced. An array that happens to be sorted. A string with no repeated characters. If your example is accidentally special, your algorithm will be accidentally wrong.',
        },
      ],
    },
    {
      id: 'brute-force',
      title: 'State a brute force',
      takeaway: 'Name the obvious solution and its cost. You cannot optimise from nowhere.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Say the naive solution out loud, with its time and space, then say you are going to improve it. It takes twenty seconds and it buys you three things: a baseline to measure against, proof you understand the problem, and a concrete thing to apply BUD to.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Do not skip it because it is embarrassing',
          text: 'Silence while you hunt for the clever answer reads as being stuck. "The brute force is compare-every-pair, O(n²) time, O(1) space - let me do better" reads as being in control.',
        },
        {
          kind: 'p',
          text: 'And do not start coding it. A brute force is something you say, not something you type, unless the interviewer explicitly asks for it.',
        },
      ],
    },
    {
      id: 'bud',
      title: 'Optimise with BUD',
      takeaway: 'Bottlenecks, unnecessary work, duplicated work - in that order.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'BUD is the workhorse. Walk your brute force and hunt for three specific kinds of waste.',
        },
        {
          kind: 'bullets',
          items: [
            '**Bottleneck** - the step that dominates the runtime. Either a one-off expensive phase (a sort in front of a linear scan) or a cheap-looking operation repeated n times (a linear search inside a loop). Optimising anything else is wasted effort.',
            '**Unnecessary work** - work whose result you already know or can compute directly. A loop that keeps going after the answer is fixed; a search for a value you could derive with arithmetic.',
            '**Duplicated work** - the same computation performed on many iterations. Hoist it out and precompute it once, usually into a hash map.',
          ],
        },
        { kind: 'anim', animId: 'tq-bud' },
        {
          kind: 'p',
          text: 'Bottleneck example: count pairs with difference k. Brute force searches the rest of the array for each element - O(n²), and the repeated search is the bottleneck. Sorting lets you binary-search for x+k in O(log n), giving O(n log n) - but now the sort is the bottleneck. Drop the sort entirely, put every value in a hash set, and look up x+k in O(1). O(n).',
        },
        {
          kind: 'p',
          text: 'Unnecessary work example: find all a, b, c, d in 1..1000 with a³ + b³ = c³ + d³. Four nested loops is O(n⁴). But once a, b and c are fixed, d is not something to search for - it is determined: d = ∛(a³ + b³ − c³). Compute it and verify. That is O(n³) for free.',
        },
        {
          kind: 'p',
          text: 'Duplicated work example: the same problem. The inner loops rebuild the whole set of (c, d) pairs for every (a, b) pair. Build the map from sum → list of pairs once, then every matching group is right there. O(n²).',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'BUD is a loop, not a pass',
          text: 'After each improvement, re-run it on the new algorithm. The bottleneck moves - a sort that was irrelevant next to O(n²) becomes the thing to remove next.',
        },
      ],
    },
    {
      id: 'other-tools',
      title: 'When BUD stalls',
      takeaway: 'Four more openings, plus the data-structure sweep.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'If BUD does not crack it, cycle through these deliberately rather than staring harder.',
        },
        {
          kind: 'steps',
          items: [
            '**DIY.** Write a big example and solve it by hand, fast, without thinking about algorithms. Then ask what you actually did. Asked to find every permutation of "abbc" inside a long string, nobody generates 24 permutations - people slide a four-character window along and check the letter counts. Your intuition already found the O(b) algorithm; write down what it did, including the shortcuts you took without noticing.',
            '**Simplify and generalise.** Relax a constraint, solve the easier problem, then put the constraint back. Matching a ransom note against a magazine is easier if you cut out letters instead of words: count characters in an array. Generalise the array to a hash map keyed by word, and you have the real answer.',
            '**Base case and build.** Solve n = 1, then n = 2, then n = 3, and look for how each answer is built from the previous one. Permutations of "abc" are the permutations of "ab" with "c" inserted at every position. This naturally produces the recursion.',
            '**Solve it wrong on purpose.** Build something that is nearly right and study the failure. An almost-uniform random generator tells you exactly which probabilities need rebalancing.',
            '**Data-structure brainstorm.** Walk the list out loud: array, linked list, hash map, set, stack, queue, heap, tree, BST, trie, graph, bit vector. Nine times out of ten the problem is trivial once you land on the right one - a streaming median is hard until you say "two heaps".',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Hash tables first',
          text: 'When you need "have I seen this?", "how many times?", or "where was it?", the answer is almost always a hash map, and it almost always turns an O(n) inner search into O(1).',
        },
      ],
    },
    {
      id: 'bcr',
      title: 'Best conceivable runtime',
      takeaway: 'Know the floor before you start climbing, and stop when you reach it.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The best conceivable runtime is the fastest any solution could possibly be, derived from the inputs and outputs alone - not from any algorithm. If you have to read all n elements to be correct, the BCR is at least O(n). If you have to print n² pairs, it is at least O(n²).',
        },
        { kind: 'anim', animId: 'tq-bcr' },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The trap',
          text: '"Find all pairs summing to k, so the BCR is O(n²)" is wrong. You want pairs *with a property*, not all pairs - and there may be very few. Derive the BCR from what you must read and must output, never from how your algorithm happens to work.',
        },
        {
          kind: 'p',
          text: 'BCR earns its keep in four ways:',
        },
        {
          kind: 'bullets',
          items: [
            'It tells you whether to keep optimising. Brute force O(n²) against a BCR of O(n) means there is room.',
            'It hints at what to reduce. Going from O(n·n) to O(n log n) means turning that second O(n) into an O(log n) - which is a search, which suggests sorting or a tree.',
            'It makes setup work free. If the BCR is O(n), any O(n) precomputation costs nothing asymptotically - so building a hash map up front is a freebie.',
            'It tells you when to stop, and what to optimise next. Matching the BCR means time is done: switch to space, and expect "can you do it in O(1) extra space?"',
          ],
        },
        {
          kind: 'p',
          text: 'Worked example: count the common elements of two sorted arrays of length n. Brute force is O(n²). BCR is O(n) since every element must be looked at. Binary search gets you to O(n log n). A hash set gets you to O(n) time and O(n) space - the BCR. But then notice: that solution never used the fact that the arrays were sorted, which is a strong hint you are missing something. Walking both arrays with two pointers, each picking up where it left off, is O(n) time and O(1) space. Now you have hit the BCR *and* constant space, so you are provably done.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The unused-information check',
          text: 'If your solution would work identically without a constraint you were given, you have probably not found the intended answer.',
        },
      ],
    },
    {
      id: 'code-and-test',
      title: 'Write it, then break it',
      takeaway: 'Beautiful code, then test in the order that finds bugs fastest.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Before typing, walk through the algorithm once more and know what every variable is and when it changes. If you cannot narrate it, you cannot write it.',
        },
        {
          kind: 'bullets',
          items: [
            '**Modularise from the start.** Call `buildFrequencyMap(words)` and define it afterwards. It shows structure, it saves board space, and it makes each piece testable.',
            '**Use real data structures.** Returning `{ start, end }` objects beats a two-element array. Inventing a small type is a signal, not over-engineering.',
            '**Name things.** `startChild` beats `i` when it means something. Announce an abbreviation ("I will call this sc") and move on.',
            '**Reuse.** One `convertFromBase(str, base)` beats separate binary and hex parsers.',
            '**Handle errors.** Validate inputs, or say out loud "I would check for null and an empty array here" and leave a line for it. Saying it counts.',
            '**Be flexible.** If the question says a 3×3 board, writing it for n×n is usually free and always looks better.',
          ],
        },
        {
          kind: 'p',
          text: 'Then test in this order - it is deliberately cheapest-first:',
        },
        {
          kind: 'steps',
          items: [
            'Conceptual pass: read each line and say what it does, like a code review. Most bugs die here.',
            'Odd-looking code: any `length - 2`, any loop starting at 1, any `<=`. You wrote it for a reason; check the reason.',
            'Hot spots: recursion base cases, integer division, null checks, the first and last iteration of a loop.',
            'A small test case - three or four elements. It finds the same bugs as a ten-element case in a third of the time.',
            'Edge cases: empty, one element, all-identical, negative values, duplicates.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Fix bugs deliberately',
          text: 'When you find one, do not slap in the first patch that occurs to you. Say why it happened and why your fix is the right one. Panicked patching is far more damaging than the original bug.',
        },
        {
          kind: 'p',
          text: 'Three things worth internalising about how this is judged. Interviews are not marked right or wrong: the signals are how good your eventual approach was, how much prompting it took to get there, and how clean the code came out - all weighed against how hard the question was and how other candidates handled it. Flawless performances are vanishingly rare, and plenty of people are hired after a rocky interview. And if you have met the question before, say so immediately: it is the honest move, and hiding it destroys the very signal they were trying to collect.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Language choice',
          text: 'Use the language you write correct code fastest in - for you, TypeScript or JavaScript. Prefer something widely readable, be aware that terse languages hide fewer mistakes, and remember that you can assume a helper exists rather than writing it.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'tq-1',
      kind: 'technique',
      prompt:
        'You have a brute force and you are hunting for the bottleneck. Which of these is a bottleneck?',
      options: [
        'An O(1) operation inside an O(n) loop',
        'A linear search performed once per element of the input',
        'A single O(n) pass before an O(n²) phase',
        'Allocating one extra array',
      ],
      answerIndex: 1,
      explain:
        'A cheap-looking search repeated n times is O(n²) overall - that repeated work is exactly what BUD targets.',
    },
    {
      id: 'tq-2',
      kind: 'concept',
      prompt: 'The interviewer says "the array is sorted". What has probably just been ruled out?',
      options: [
        'Using a hash map at all',
        'A solution that would work identically on unsorted input',
        'Recursion',
        'Anything using O(n) space',
      ],
      answerIndex: 1,
      explain:
        'If sortedness changes nothing in your solution, you are likely missing the intended one. Unused information is a hint you dropped.',
    },
    {
      id: 'tq-3',
      kind: 'concept',
      prompt:
        'Given an unsorted array, you must return every pair summing to k. What is the best conceivable runtime?',
      options: [
        'O(n²), because there are n² pairs',
        'O(n), because every element must be read at least once',
        'O(log n)',
        'O(1)',
      ],
      answerIndex: 1,
      explain:
        'BCR comes from inputs and outputs. You must read all n elements, but you never have to enumerate all n² pairs.',
    },
    {
      id: 'tq-4',
      kind: 'technique',
      prompt: 'Your algorithm has matched the BCR on time. What is the right next move?',
      options: [
        'Declare it optimal and start coding immediately',
        'Keep trying to beat the BCR',
        'Say you have hit the BCR, then look at space complexity',
        'Switch to a completely different approach',
      ],
      answerIndex: 2,
      explain:
        'Time is provably done; space is the remaining axis - and "can you do it in O(1) space?" is the standard follow-up.',
    },
    {
      id: 'tq-5',
      kind: 'technique',
      prompt: 'You need "have I seen this value before?" inside a loop. Reach for:',
      options: [
        'A sorted array with binary search',
        'A hash set',
        'A stack',
        'A second nested loop',
      ],
      answerIndex: 1,
      explain:
        'A set turns the O(n) inner search into O(1), which is usually the whole optimisation.',
    },
    {
      id: 'tq-6',
      kind: 'concept',
      prompt: 'Which example of a binary search tree is best for working out an algorithm?',
      options: [
        'A three-node perfectly balanced tree',
        'An eight-node tree with real values and slightly uneven depth',
        'An empty tree',
        'A tree drawn with letters rather than numbers',
      ],
      answerIndex: 1,
      explain:
        'Specific, big enough to show a pattern, and not accidentally a special case - a perfect tree hides bugs.',
    },
    {
      id: 'tq-7',
      kind: 'technique',
      prompt:
        'Asked to generate all permutations of a string, you solve n=1, then n=2, then build n=3 from n=2. Which technique is this?',
      options: ['BUD', 'Base case and build', 'Simplify and generalise', 'DIY'],
      answerIndex: 1,
      explain:
        'Base case and build - solving small cases and constructing the next from the last, which naturally yields the recursion.',
    },
    {
      id: 'tq-8',
      kind: 'technique',
      prompt: 'You just finished coding. What is the first test you run?',
      options: [
        'The big eight-element example from the algorithm phase',
        'A conceptual read-through, line by line, explaining what each does',
        'The empty input',
        'A randomised stress test',
      ],
      answerIndex: 1,
      explain:
        'Conceptual first: it is the fastest way to find the most bugs. Hand-tracing a big example is the slowest.',
    },
    {
      id: 'tq-9',
      kind: 'concept',
      prompt: 'You recognise the question - you solved it last week. You should:',
      options: [
        'Say nothing and solve it smoothly',
        'Tell the interviewer immediately',
        'Pretend to struggle for realism',
        'Ask for a different question without explaining why',
      ],
      answerIndex: 1,
      explain:
        'Disclosing it is both honest and practical - otherwise they learn nothing about you, and being caught is far worse.',
    },
    {
      id: 'tq-10',
      kind: 'technique',
      prompt:
        'A brute force loops over a, b, c and d looking for a³+b³ = c³+d³. Recognising that d is determined by the other three is an example of removing:',
      options: ['A bottleneck', 'Unnecessary work', 'Duplicated work', 'Stack space'],
      answerIndex: 1,
      explain:
        'Searching for something you can compute directly is unnecessary work - it takes O(n⁴) to O(n³).',
    },
  ],
  drills: [
    {
      slug: 'sort-colors',
      note: 'Practice the loop out loud: brute force (count and rewrite), then the one-pass three-pointer version.',
    },
    {
      slug: 'find-the-duplicate-number',
      note: 'A BCR/constraint exercise: read-only input and O(1) space is what forces the cycle-detection answer.',
    },
    {
      slug: 'insert-delete-getrandom-o1',
      note: 'Data-structure brainstorm: no single structure works, so combine a map with an array.',
    },
    {
      slug: 'kth-largest-element-in-an-array',
      note: 'Say all three (sort, heap, quickselect) with complexities before choosing - exactly the brute-force-then-optimise script.',
    },
    {
      slug: 'string-to-integer-atoi',
      note: 'Pure clarify-the-spec drill. List every edge case before writing anything.',
    },
    {
      slug: 'roman-to-integer',
      note: 'Small enough to practise the full loop end to end in ten minutes, including testing.',
    },
  ],
};
