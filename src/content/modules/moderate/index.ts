import type { CourseModule } from '../../types';

export const moderate: CourseModule = {
  id: 'moderate',
  title: 'Moderate Mixed Review',
  track: 'techniques',
  status: 'complete',
  source: 'Chapter 16',
  summary:
    'Twenty-six problems with the technique label removed. The skill being tested is recognition.',
  estimatedMinutes: 120,
  concepts: [
    'Recognising the right tool when no chapter heading tells you what it is',
    'Algebraic rearrangement and bit tricks in place of branching',
    'Frequency maps, and precomputing when the same query repeats',
    'Geometry: slopes, intersections, midpoints, and floating-point precision traps',
    'Sweep line and delta counting instead of per-unit simulation',
    'Sorted two-pointer scans across two collections',
    'Maximum-subarray reasoning (Kadane) and its relatives',
    'Minimal-window and smallest-disorder-range reasoning',
    'Flood fill and grid simulation, including grids that grow',
    'Rejection sampling for unbiased randomness',
    'Hash map plus doubly linked list for O(1) LRU operations',
    'Tokenisation and precedence-aware expression evaluation',
    'Building a solution around a data structure the question never mentions',
  ],
  sections: [
    {
      id: 'recognition',
      title: 'Recognition, without the label',
      takeaway: 'The chapter heading was the hint. Here you have to generate it yourself.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Every earlier chapter told you the technique before it told you the problem. This one deliberately does not, and that is the whole exercise: real interviews never come with a heading either.',
        },
        {
          kind: 'p',
          text: 'When a problem has no obvious home, run a fixed checklist rather than staring at it. The point is not that every entry applies - it is that the list stops you freezing.',
        },
        {
          kind: 'table',
          caption: 'What the wording is usually pointing at',
          headers: ['If the question says…', 'Reach for'],
          rows: [
            ['"how many times does X appear", asked repeatedly', 'Precompute a frequency map once'],
            [
              '"without using an if statement / comparison / temporary"',
              'Bit tricks and algebraic rearrangement',
            ],
            ['"the largest / smallest contiguous…"', 'A running scan: Kadane, or a sliding window'],
            ['"the most X at the same time"', 'Sweep line over start and end events'],
            ['"all pairs that…"', 'Hash map of complements, or sort and converge'],
            ['"connected region", "spreads to neighbours"', 'Flood fill or BFS'],
            ['"in O(1) per operation" for something ordered', 'Two structures cross-linked'],
            ['"uniformly at random"', 'Rejection sampling, and prove the uniformity'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Ask how often it will be called',
          text: 'Several questions here hinge on one clarification: is this called once, or a million times? Counting a word in a book is a linear scan if it happens once, and a preprocessed map if it repeats. Detecting a tic-tac-toe winner is eight checks if it is one-off, and an incrementally-maintained set of counters if you are validating every move. The interviewer is waiting for you to ask.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Brute force first, and say the cost',
          text: 'A correct O(n²) answer stated in thirty seconds buys you the rest of the interview to improve it. Then apply BUD - bottlenecks, unnecessary work, duplicated work - to the baseline rather than to the blank page.',
        },
      ],
    },
    {
      id: 'arithmetic',
      title: 'Arithmetic and bit tricks',
      takeaway: 'Rearrange the algebra before you write a branch.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A cluster of these problems removes an operator or a construct and asks you to rebuild the behaviour. The move is always to find an expression that computes what a branch would have decided.',
        },
        {
          kind: 'bullets',
          items: [
            '**Swap without a temporary.** `a ^= b; b ^= a; a ^= b` works because XOR is its own inverse, and so does the addition/subtraction version. Both break when the two operands are the *same variable* - the value zeroes itself out. Mention that, then use a temporary in real code.',
            '**Maximum without a comparison.** Compute the sign bit of `a - b` - shift it down to 0 or 1 - and use it to index the pair: `k * a + (1 - k) * b`. Branchless selection is the general idea; the trap is that `a - b` can overflow, which you fix by also inspecting the signs of a and b.',
            '**Trailing zeros in n factorial.** Do not compute the factorial. A trailing zero needs a factor of 10, and 2s are far more plentiful than 5s, so the answer is the number of 5s: `n/5 + n/25 + n/125 + …`, counting 25 twice because it contributes two.',
            '**Subtract, multiply and divide from addition alone.** Negate by adding −1 repeatedly (or by flipping the sign bit properly), multiply by repeated addition of the smaller operand, and divide by counting how many times the divisor fits. Say the complexity in terms of the operand values, not the bit width.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Count the distinct results, not the arrangements',
          text: 'Building a board from exactly K planks of two lengths looks like 2^K possibilities. But the length depends only on *how many* of each kind you used, so there are at most K+1 distinct answers - one per split. Recognising that a huge search space collapses to a small set of outcomes is the single most valuable habit in this chapter.',
        },
        {
          kind: 'p',
          text: 'Randomness gets the same treatment. To build a uniform 0-6 generator from a uniform 0-4 one, form a two-digit base-5 number for a uniform 0-24 range, discard anything from 21 upwards, and take the remainder mod 7. Discarding is what keeps it exactly uniform, and the expected number of retries is small and finite - which is the part you must argue, because "loop until it works" only sounds unbounded.',
        },
      ],
    },
    {
      id: 'counting',
      title: 'Counting, maps and matching',
      takeaway: 'A count map, built once, answers questions a rescan would pay for repeatedly.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The workhorse of this chapter is the hash map used as a counter or an index. It converts "search for it again" into "look it up".',
        },
        {
          kind: 'bullets',
          items: [
            '**Word frequencies in a book.** One query: scan, O(n). Repeated queries: build a map from normalised word to count once, then every query is O(1). Ask about case, punctuation and hyphenation - that is half the question.',
            '**Pairs summing to a target.** A map of complements gives O(n) time and O(n) space; sorting and converging two pointers gives O(n log n) time and O(1) space. Both need a stated rule for duplicates and for whether an element may pair with itself.',
            '**Smallest difference across two arrays.** Sort both, then walk one pointer per array, always advancing the one pointing at the smaller value - the difference can only improve that way. O(a log a + b log b) instead of O(ab).',
            '**One swap to equalise two array sums.** Algebra first: swapping x from A with y from B moves `x − y` across, so you need `x − y = (sumA − sumB) / 2`. If that difference is odd, no swap exists. Then it is one pass with a set - not a nested loop.',
            '**Scoring a Mastermind guess.** Count exact position matches in a first pass and remove them from consideration. Only then count colour-only matches from the leftovers, using frequency maps. Doing it in one pass double-counts, which is the bug the question is fishing for.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Index by the answer you will be asked for',
          text: 'A T9 keypad lookup is slow if you translate each dictionary word on demand, and instant if you precompute a map from digit string to the words that produce it. Same data, keyed by the question instead of by the source.',
        },
        {
          kind: 'p',
          text: 'Not everything is a map, though. Deciding whether a string matches an `a`/`b` pattern has no counting shortcut: the length of one part determines the length of the other, so you try every possible length for `a`, derive `b`, and verify in one pass. That is O(n²) attempts of O(n) work each, and the honest framing - "the search space is one number wide" - is what makes it tractable.',
        },
      ],
    },
    {
      id: 'scans',
      title: 'Scans, windows and sweeps',
      takeaway: 'Two passes with the right running value usually beat one clever pass.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: "Three of this chapter's problems are solved by walking the data while maintaining one or two running values. They look different and are the same shape.",
        },
        { kind: 'anim', animId: 'mod-kadane' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Kadane in one sentence',
          text: 'The best run ending at each element is either that element alone or that element added to the best run ending just before it - so keep a running total, reset it whenever it drops below the element itself, and track the maximum seen. Decide up front what an all-negative array should return; "0" and "the least negative element" are both defensible, and the interviewer wants you to ask.',
        },
        {
          kind: 'p',
          text: 'The smallest window whose sorting would sort the whole array is the two-pass version of the same idea. Sweep left to right tracking the running maximum: any element smaller than it must be inside the window, so the last such element is the right edge. Sweep right to left tracking the running minimum for the left edge. Two O(n) passes, no sorting, and the array is left untouched.',
        },
        { kind: 'anim', animId: 'mod-sweep-line' },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Never simulate what you can difference',
          text: 'Incrementing every year a person was alive is O(people × lifespan). Recording +1 at the birth and −1 just after the death, then taking a running total, is O(people + years). The same delta-and-prefix-sum move answers meeting-room counts, maximum interval overlap and "busiest moment" questions of every kind.',
        },
      ],
    },
    {
      id: 'geometry-simulation',
      title: 'Geometry, grids and simulation',
      takeaway: 'Do the maths on paper first, and decide the representation before you code.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Geometry questions are rarely hard mathematically. They are graded on enumerating the degenerate cases and on not trusting floating point.',
        },
        {
          kind: 'bullets',
          items: [
            "**Segment intersection.** Compute the infinite-line intersection, then check that the point lies within both segments' ranges. The cases that break naive code: parallel lines with different intercepts (no intersection), parallel and collinear (infinitely many - return an endpoint of the overlap), and vertical segments where the slope is undefined.",
            "**A line bisecting two squares.** Any line through a square's centre halves it, so the answer is the line through both centres - no calculus, one formula. Handle the identical-centres case, and clip the result to the squares if the question wants a segment.",
            '**The line through the most points.** For every pair, compute a normalised (slope, intercept) key and count. That is O(n²) pairs, and the trap is floating-point equality: round slopes to a tolerance and check neighbouring buckets, or store the slope as a reduced integer fraction to avoid the problem entirely.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Floating point does not do equality',
          text: 'Two slopes that should be identical will differ in the last bits. Either compare within an epsilon - which means checking adjacent hash buckets, not just the exact one - or keep exact rational arithmetic by reducing `dy/dx` with a gcd. Say which you chose and why.',
        },
        {
          kind: 'p',
          text: "Grid problems in this chapter are about representation. Pond sizes is a flood fill run from every unvisited water cell, summing the connected cells - with the wrinkle that connectivity is eight-directional, diagonals included. Langton's Ant is a simulation on an *unbounded* board, so the interesting decision is the data structure: grow the grid when the ant leaves it, or store only the flipped cells in a hash set and compute the bounding box at the end.",
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Recursion is also a representation choice',
          text: 'Serialising a tree of XML elements to a compact token stream is a plain recursive walk - emit the tag code, the attributes, an end marker, the children, another end marker. The whole difficulty is defining the format precisely and then following it exactly, which is a coding-clarity test rather than an algorithms one.',
        },
      ],
    },
    {
      id: 'structures',
      title: 'When the structure is the answer',
      takeaway: 'Sometimes the question is really "which data structure did you not think of?"',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The last group of problems here name no technique at all, because the technique is choosing a structure - often two of them, wired together.',
        },
        { kind: 'anim', animId: 'mod-lru-cache' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Two structures, cross-linked',
          text: 'A hash map gives O(1) lookup but no order. A linked list gives order but O(n) lookup. Store the *node* in the map rather than the value, and both operations are O(1). The list must be doubly linked, because unlinking a node in O(1) needs its predecessor. This pairing reappears constantly - it is worth being able to write from memory.',
        },
        {
          kind: 'p',
          text: 'Expression evaluation with precedence and no parentheses is the other one. Tokenise first - digits into numbers, operators into symbols - and keep the parsing separate from the evaluation, because merging them is where the bugs live.',
        },
        {
          kind: 'steps',
          items: [
            'Push each number onto a stack as you read it.',
            'On `*` or `/`, pop the last number, apply the operator immediately to it and the next number, and push the result. High-precedence operators never wait.',
            'On `+` or `-`, push the *next* number with its sign applied and move on. Low-precedence operators are deferred.',
            'At the end, sum the stack. Everything left on it is a term that only needed adding.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Say what you are not handling',
          text: 'Parentheses, unary minus, whitespace, multi-digit numbers, division by zero. Naming the cases you are deliberately excluding is worth as much as handling them, and it stops the interviewer wondering whether you simply missed them.',
        },
        {
          kind: 'p',
          text: 'Spelling an integer in English is the purest example of the same skill with no algorithm at all. There is one insight - English repeats itself every three digits, so write a helper that converts a number below 1000 and then apply it per chunk with "thousand", "million", "billion" attached. Everything else is careful decomposition: the teens are irregular, zero has no chunk of its own, and negatives and the exact value zero are separate special cases.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'These are readability questions',
          text: 'Problems with no trick are graded on structure: small named helpers, a table of irregular words instead of a chain of conditionals, and no duplicated logic between the chunks. Writing one clean function and reusing it is the answer being looked for.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'mod-1',
      kind: 'technique',
      prompt:
        'Counting how many times a word appears in a book. What changes if the operation will be run many times?',
      options: [
        'Nothing - a scan is optimal either way',
        'Preprocess the book into a word→count map once, so each query becomes O(1)',
        'Sort the words first',
        'Cache only the most recent query',
      ],
      answerIndex: 1,
      explain:
        'Amortising the preprocessing over many queries is the entire point of the follow-up. Asking "how often is this called?" is what surfaces it.',
    },
    {
      id: 'mod-2',
      kind: 'concept',
      prompt: 'How many trailing zeros does n! have?',
      options: [
        'The number of 2s in its prime factorisation',
        'n/5 + n/25 + n/125 + … - the number of factors of 5',
        'n / 10, rounded down',
        'The number of even numbers below n',
      ],
      answerIndex: 1,
      explain:
        'Each trailing zero needs a 2 and a 5, and 2s are far more common - so the 5s are the binding constraint. 25 contributes two, 125 three, hence the series.',
    },
    {
      id: 'mod-3',
      kind: 'complexity',
      prompt:
        'Finding the year with the most people alive, given birth and death years. Best approach?',
      options: [
        'Increment a counter for every year each person was alive - O(people × lifespan)',
        'Record +1 at each birth and −1 after each death, then take a running total',
        'Sort by birth year and take the median',
        'Binary search the year range',
      ],
      answerIndex: 1,
      explain:
        'Only two moments per person change the count. Delta counting plus a prefix sum is O(people + years) rather than O(people × lifespan).',
    },
    {
      id: 'mod-4',
      kind: 'technique',
      prompt: 'What makes an LRU cache O(1) for both get and put?',
      options: [
        'An array kept sorted by last-access time',
        'A hash map storing node references, plus a doubly linked list for recency',
        'A min-heap keyed on timestamp',
        'A single map with a periodic sweep',
      ],
      answerIndex: 1,
      explain:
        'The map finds the node without scanning, and because the node knows both neighbours it can be unlinked and re-inserted at the front in constant time. Singly linked would not work.',
    },
    {
      id: 'mod-5',
      kind: 'technique',
      prompt:
        'You must generate a uniform value in 0-6 using only a uniform generator for 0-4. What is the approach?',
      options: [
        'Add two draws and take the result mod 7',
        'Build a uniform 0-24 value from two draws, discard 21-24, and take the remainder mod 7',
        'Multiply a draw by 7/5 and round',
        'Draw once and add a random 0 or 1',
      ],
      answerIndex: 1,
      explain:
        'Sums are not uniform, and 25 does not divide evenly by 7. Rejecting the extra 4 outcomes makes the remaining 21 split exactly three ways per result.',
    },
    {
      id: 'mod-6',
      kind: 'technique',
      prompt:
        'The smallest subarray whose sorting would sort the entire array. What is the two-pass method?',
      options: [
        'Sort a copy and compare element by element',
        'Left-to-right tracking the running maximum for the right edge, right-to-left tracking the running minimum for the left edge',
        'Binary search for the first inversion',
        'Find the minimum and maximum and take the span between them',
      ],
      answerIndex: 1,
      explain:
        'Any element below the running maximum to its left must be inside the window; the mirror pass finds the other edge. Two O(n) passes, no sorting.',
    },
    {
      id: 'mod-7',
      kind: 'concept',
      prompt: 'Scoring a Mastermind guess. Why must hits be counted before pseudo-hits?',
      options: [
        'It is faster',
        'A slot that is an exact match must not also be counted as a wrong-position match',
        'The colours must be sorted first',
        'Pseudo-hits are undefined otherwise',
      ],
      answerIndex: 1,
      explain:
        'Removing exact matches first is what stops the same peg being counted twice. Doing both in a single pass is the classic bug here.',
    },
    {
      id: 'mod-8',
      kind: 'technique',
      prompt:
        'Finding the line that passes through the most points, by hashing on slope. What is the trap?',
      options: [
        'Vertical lines have infinite slope, and floating-point slopes never compare exactly equal',
        'There may be fewer than two points',
        'The slope must be an integer',
        'Hash maps cannot store numeric keys',
      ],
      answerIndex: 0,
      explain:
        'Handle verticals as a special case, and either compare slopes within an epsilon - checking adjacent buckets - or store the slope as a gcd-reduced fraction so equality is exact.',
    },
    {
      id: 'mod-9',
      kind: 'complexity',
      prompt:
        'Generating every board length buildable from exactly K planks of two different lengths. How many distinct results are there?',
      options: ['2^K', 'K!', 'At most K + 1', 'Unbounded'],
      answerIndex: 2,
      explain:
        'The length depends only on how many of each type were used, not on their order - so there is one result per split, and the exponential search space collapses.',
    },
    {
      id: 'mod-10',
      kind: 'technique',
      prompt:
        'Evaluating `2*3+5/6*3+15` with correct precedence and no parentheses. What does the stack approach do?',
      options: [
        'Push everything and evaluate left to right at the end',
        'Push numbers; apply `*` and `/` immediately to the stack top; defer `+` and `-` by pushing signed numbers; sum the stack at the end',
        'Convert to postfix with two stacks, then evaluate',
        'Recursively split at every operator',
      ],
      answerIndex: 1,
      explain:
        'High-precedence operators can be resolved the moment their right operand arrives; low-precedence ones simply become signed terms waiting to be added.',
    },
  ],
  drills: [
    {
      slug: 'lru-cache',
      note: 'CTCI 16.25 - map plus doubly linked list. Write it without a library.',
    },
    {
      slug: 'shortest-unsorted-continuous-subarray',
      note: 'CTCI 16.16 - running max and min from both ends.',
    },
    { slug: 'integer-to-english-words', note: 'CTCI 16.8 - pure decomposition and care.' },
    { slug: 'max-points-on-a-line', note: 'CTCI 16.14 - hash by normalised slope.' },
    { slug: 'game-of-life', note: 'Grid simulation, with the in-place encoding follow-up.' },
    { slug: 'valid-tic-tac-toe-state', note: 'CTCI 16.4 - and discuss one-off vs repeated calls.' },
    { slug: 'bulls-and-cows', note: 'CTCI 16.15 - exact matches first, then the rest by count.' },
    { slug: 'word-pattern', note: 'CTCI 16.18 - a bijection needs both maps.' },
    { slug: 'fair-candy-swap', note: 'CTCI 16.21 - the difference determines the pair.' },
    { slug: 'top-k-frequent-words', note: 'CTCI 16.2 - precompute once, answer many queries.' },
  ],
};
