import type { CourseModule } from '../../types';

export const bigO: CourseModule = {
  id: 'big-o',
  title: 'Big O',
  track: 'techniques',
  status: 'complete',
  source: 'Part VI',
  summary:
    'Read code and say what it costs - in time and in space - without guessing or memorising labels.',
  estimatedMinutes: 45,
  concepts: [
    'Asymptotic upper bounds and comparing rates of growth',
    'Big O vs big theta vs big omega, and what industry actually means by O',
    'Best case, worst case and expected case - and why they are unrelated to the bounds',
    'Time complexity vs auxiliary space complexity, including recursion stack space',
    'Dropping constants',
    'Dropping non-dominant terms',
    'Adding sequential work vs multiplying nested work',
    'Amortised analysis, especially dynamic-array growth',
    'Recognising O(log n) from repeated halving and from balanced trees',
    'Recursive call trees: O(branches^depth), and what memoisation collapses',
    'Using one variable per independent input instead of calling everything n',
  ],
  sections: [
    {
      id: 'what-it-measures',
      title: 'What big O actually measures',
      takeaway: 'Big O is a rate of growth, not a stopwatch.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Big O describes how the work an algorithm does grows as its input grows. It is deliberately blind to hardware, language and constant factors, because those change and the growth rate does not.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The one-sentence version',
          text: 'If the input doubles, how much more work do you do? That answer is the complexity.',
        },
        {
          kind: 'p',
          text: 'This is why an O(n) algorithm can genuinely beat an O(1) one on your actual inputs. O(1) means "does not grow with n", not "fast". Big O only tells you who wins as n heads for infinity.',
        },
        { kind: 'anim', animId: 'big-o-growth-race' },
        {
          kind: 'bullets',
          items: [
            'O(1) - constant. Reading `arr[5]`, a hash lookup, popping a stack.',
            'O(log n) - the problem halves each step. Binary search, descending a balanced tree.',
            'O(n) - one pass. A scan, a single loop over the input.',
            'O(n log n) - the comparison-sort barrier. Merge sort, heap sort, most `.sort()` implementations.',
            'O(n²) - every pair. Nested loops over the same array.',
            'O(2ⁿ) and O(n!) - subsets and orderings. Naive recursion that branches.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'There is no fixed menu',
          text: 'Runtime is not multiple choice. O(√n), O(n log log n) and O(b log b + a log b) are all real answers. Derive it; do not pick the nearest familiar label.',
        },
        {
          kind: 'p',
          text: 'Academically, O is an upper bound (≤), Ω is a lower bound (≥), and Θ is both (a tight bound). By that definition, printing an array is O(n) but also, technically, O(n³). Industry has quietly merged O and Θ: in an interview, "O" means the tightest bound you can state, and calling a single scan O(n²) will be marked wrong.',
        },
        {
          kind: 'p',
          text: 'Separately, you can describe an algorithm on its best, worst or expected input. Quicksort is O(n log n) expected and O(n²) worst case when the pivot keeps landing at an extreme. Best case is nearly useless - special-case any algorithm and you can claim O(1) best case.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Two axes people confuse',
          text: 'Best/worst/expected picks which input you are talking about. O/Ω/Θ picks how tightly you are bounding it. They are independent - you can state a tight bound on the worst case.',
        },
      ],
    },
    {
      id: 'reducing',
      title: 'Reducing an expression',
      takeaway: 'Drop constants, drop dominated terms, then add or multiply.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Once you have counted the work, three rules turn it into an answer.',
        },
        {
          kind: 'steps',
          items: [
            'Drop constants. O(2n) is O(n). Two separate loops over the same array is still one pass in big-O terms - counting instructions precisely would mean counting assembly, and you would still be wrong after the compiler optimised it.',
            'Drop non-dominant terms. O(n² + n) is O(n²); O(n + log n) is O(n). Keep a sum only when the terms are genuinely independent: O(a + b) cannot be reduced without knowing how a and b relate.',
            'Add sequential work, multiply nested work. "Do this, then that" adds. "Do this for each of those" multiplies.',
          ],
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Add vs multiply - the mistake that costs the most marks',
          code: `// O(a + b): first one, then the other.
for (const x of arrA) visit(x);
for (const y of arrB) visit(y);

// O(a * b): the whole of B, once per element of A.
for (const x of arrA) {
  for (const y of arrB) visit(x, y);
}`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Two inputs means two variables',
          text: 'Nested loops over two different arrays is O(a · b), not O(n²). Reusing "n" for two different quantities is the single most common analysis error, and it usually produces a wrong answer rather than a sloppy one.',
        },
        {
          kind: 'p',
          text: 'A worked example: you are given an array of strings, and you sort each string and then sort the array. Call `s` the length of the longest string and `a` the number of strings. Sorting one string is O(s log s), so sorting all of them is O(a · s log s). Sorting the array costs O(a log a) comparisons, but each comparison compares strings, which is O(s) - so that step is O(a · s log a). Total: O(a · s · (log a + log s)). Say "n" anywhere in that derivation and you will get it wrong.',
        },
        {
          kind: 'table',
          caption: 'Loop shapes and what they cost',
          headers: ['Shape', 'Cost', 'Why'],
          rows: [
            ['`for i in 0..n`', 'O(n)', 'n iterations of constant work'],
            ['`for i in 0..n/2`', 'O(n)', 'halving the iterations is a constant factor'],
            [
              '`for i in 0..n { for j in i+1..n }`',
              'O(n²)',
              'n(n−1)/2 pairs - half of a square is still a square',
            ],
            ['`for (x = 2; x*x <= n; x++)`', 'O(√n)', 'stops at √n'],
            ['`while (n > 0) n = Math.floor(n / 10)`', 'O(log n)', 'the number of digits in n'],
            ['`while (n > 1) n = n / 2`', 'O(log n)', 'repeated halving'],
          ],
        },
      ],
    },
    {
      id: 'space',
      title: 'Space complexity',
      takeaway: 'Count what exists at the same time, not what was ever created.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Space complexity is the same idea applied to memory. An array of n needs O(n); an n×n grid needs O(n²). Usually you are asked about auxiliary space - extra memory beyond the input itself.',
        },
        {
          kind: 'p',
          text: 'The part people forget: recursion costs stack space. Each pending call is a real stack frame holding real memory.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Same number of calls, different space',
          code: `// O(n) time, O(n) space - n frames are alive at once.
function sumTo(n: number): number {
  return n <= 0 ? 0 : n + sumTo(n - 1);
}

// O(n) time, O(1) space - n calls happen, but one at a time.
function pairSums(n: number): number {
  let total = 0;
  for (let i = 0; i < n; i++) total += add(i, i + 1);
  return total;
}`,
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The rule',
          text: 'n calls in sequence is O(1) stack. n calls nested inside each other is O(n) stack. Depth is what costs, not count.',
        },
        {
          kind: 'p',
          text: 'That distinction shows up constantly in answers: "iterative reversal is O(1) space, recursive reversal is O(n) space", or "the recursion tree has 2ⁿ nodes but only n of them exist at once, so it is O(2ⁿ) time and O(n) space".',
        },
      ],
    },
    {
      id: 'amortised',
      title: 'Amortised time',
      takeaway: 'A rare expensive operation can still average out to O(1).',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Pushing onto a dynamic array (JavaScript arrays, Java ArrayList, C++ vector) is usually a single write. But when the backing block is full, the runtime allocates a bigger one - typically double - and copies everything across. That push is O(n).',
        },
        {
          kind: 'p',
          text: 'So what do you call push? Neither O(1) nor O(n) alone is honest. Amortised time is the answer: the average cost per operation across any sequence of operations.',
        },
        { kind: 'anim', animId: 'big-o-amortised-doubling' },
        {
          kind: 'p',
          text: 'The arithmetic is worth knowing because it recurs. Doubling to reach n elements means copying 1, then 2, then 4, ... up to n/2 elements. Read that sum backwards - n/2 + n/4 + n/8 + … + 1 - and it is just under n. So n pushes cost O(n) work in total, and each push is O(1) amortised.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Say it like this',
          text: '"Push is O(1) amortised - worst case O(n) when it resizes, but resizes are rare enough that n pushes cost O(n) total."',
        },
        {
          kind: 'p',
          text: 'The same argument justifies a queue built from two stacks, and any structure that rebuilds itself on a doubling schedule.',
        },
      ],
    },
    {
      id: 'logs-recursion',
      title: 'Where logs and exponentials come from',
      takeaway: 'Halving gives log n; branching gives branches^depth.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'You almost never need to compute a log. You need to recognise two shapes.',
        },
        {
          kind: 'bullets',
          items: [
            'Something halves each step → O(log n). Binary search, descending a balanced BST, dividing by 10 to walk digits. Formally: k halvings reach 1 when 2ᵏ = n, so k = log₂ n.',
            'A recursive call branches → roughly O(branches^depth). Two calls per level and depth n gives O(2ⁿ).',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'The base of the log does not matter',
          text: 'Different bases differ by a constant factor, and constants are dropped. The base of an *exponent* very much does matter: 8ⁿ is 2²ⁿ times bigger than 2ⁿ.',
        },
        { kind: 'anim', animId: 'big-o-recursion-tree' },
        {
          kind: 'p',
          text: 'Apply the branching rule carefully, because depth is not always n. Summing every node of a balanced BST recurses twice per call, so it looks like O(2^depth) - but depth is log n, and 2^(log₂ n) = n. The answer is O(n), which you could also have got by noticing that the code touches each node once and does constant work per touch.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Two ways to the same answer',
          text: 'Derive it from the recursion shape, then sanity-check it by asking what the code *means* ("it touches every node once"). If they disagree, you have made an error - find it before the interviewer does.',
        },
        {
          kind: 'p',
          text: 'Memoisation is the standard cure for a branching recursion whose subproblems repeat. Naive `fib(n)` is O(2ⁿ) because it recomputes whole subtrees; caching each value makes every call O(1) after the first and the whole thing O(n). The animation above shows exactly which nodes a memo deletes.',
        },
      ],
    },
    {
      id: 'in-the-room',
      title: 'Doing this in the interview',
      takeaway: 'State both complexities, in the right variables, unprompted.',
      audio: true,
      blocks: [
        {
          kind: 'steps',
          items: [
            'Name the variables first. "Let n be the number of intervals and k the number of queries." Never let one letter mean two things.',
            'Count the work of the innermost operation - including the hidden cost of things like string concatenation, `Array.prototype.includes`, or a `slice` inside a loop.',
            'Combine: add sequential phases, multiply nested ones.',
            'Reduce: drop constants, drop dominated terms.',
            'State time and space separately, and say what the space is used by.',
            'Sanity-check against what the code means, and against the best conceivable runtime.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Hidden costs in JS/TS',
          text: '`arr.includes(x)` and `arr.indexOf(x)` are O(n) - inside a loop that is O(n²). `str += piece` in a loop is O(n²) characters copied. `arr.shift()` is O(n). `[...arr, x]` inside a loop is O(n²). A `Set` or `Map` lookup is the O(1) fix.',
        },
        {
          kind: 'table',
          caption: 'Answers worth having ready',
          headers: ['Code', 'Time'],
          rows: [
            ['Build an array by repeated copy-and-append', 'O(n²)'],
            ['Sum the digits of n', 'O(log n)'],
            ['Find an element in an unbalanced BST', 'O(n) - it can be a straight line'],
            ['Find a value in a binary tree that is not a BST', 'O(n) - no ordering to exploit'],
            ['Generate all strings of length k over c letters, then check each', 'O(k · cᵏ)'],
            ['Sort b, then binary-search it for each of a elements', 'O(b log b + a log b)'],
            ['All permutations of a string of length n', 'O(n² · n!)'],
          ],
        },
        {
          kind: 'p',
          text: 'Complexity analysis is also a design tool, not just a report you file at the end. Knowing you are at O(n²) and that the best conceivable runtime is O(n) is what tells you to keep optimising - which is the next module.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'bo-1',
      kind: 'complexity',
      prompt: 'What is the time complexity?',
      context: `for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    check(a[i], a[j]);
  }
}`,
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n²/2)'],
      answerIndex: 2,
      explain:
        'It visits n(n−1)/2 pairs. Halving is a constant factor, and you drop constants - so O(n²), never O(n²/2).',
    },
    {
      id: 'bo-2',
      kind: 'complexity',
      prompt: 'Two arrays of different lengths. What is the complexity?',
      context: `for (const x of arrA) {       // length a
  for (const y of arrB) {     // length b
    if (x < y) count++;
  }
}`,
      options: ['O(n²)', 'O(a · b)', 'O(a + b)', 'O(max(a, b)²)'],
      answerIndex: 1,
      explain:
        'Two independent inputs need two variables. Collapsing both to "n" is the most common analysis mistake there is.',
    },
    {
      id: 'bo-3',
      kind: 'complexity',
      prompt: 'What are the time and space complexities of this function?',
      context: `function sumTo(n: number): number {
  return n <= 0 ? 0 : n + sumTo(n - 1);
}`,
      options: [
        'O(n) time, O(1) space',
        'O(n) time, O(n) space',
        'O(n²) time, O(n) space',
        'O(log n) time, O(log n) space',
      ],
      answerIndex: 1,
      explain:
        'n calls are nested inside each other, so n stack frames are alive at once. Recursion depth is space.',
    },
    {
      id: 'bo-4',
      kind: 'concept',
      prompt: 'Pushing onto a dynamic array that doubles when full is best described as:',
      options: [
        'O(n), because a resize copies everything',
        'O(1), because resizes are rare enough to ignore',
        'O(1) amortised - worst case O(n), but n pushes cost O(n) in total',
        'O(log n), because the capacity doubles',
      ],
      answerIndex: 2,
      explain:
        'Amortised is the precise word: the copies sum to just under n across n pushes, so the average is constant.',
    },
    {
      id: 'bo-5',
      kind: 'complexity',
      prompt: 'This sums every node of a *balanced* binary search tree. What is the runtime?',
      context: `function sum(node: Node | null): number {
  if (!node) return 0;
  return sum(node.left) + node.value + sum(node.right);
}`,
      options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'],
      answerIndex: 1,
      explain:
        'Branches^depth gives 2^(log n), which is exactly n. It also just touches every node once - both routes agree.',
    },
    {
      id: 'bo-6',
      kind: 'complexity',
      prompt: 'What is the runtime of this loop?',
      context: `let count = 0;
while (n > 0) {
  count += n % 10;
  n = Math.floor(n / 10);
}`,
      options: ['O(1)', 'O(log n)', 'O(√n)', 'O(n)'],
      answerIndex: 1,
      explain:
        'It runs once per digit, and a number n has about log₁₀ n digits. Dividing by a constant each step is a log.',
    },
    {
      id: 'bo-7',
      kind: 'concept',
      prompt: 'Which of these is NOT equivalent to O(n)?',
      options: ['O(2n)', 'O(n + log n)', 'O(n + m)', 'O(n + p) where p < n/2'],
      answerIndex: 2,
      explain:
        'With no stated relationship between n and m, both terms have to stay. The others reduce by dropping constants or dominated terms.',
    },
    {
      id: 'bo-8',
      kind: 'technique',
      prompt:
        'Your recursive solution is O(2ⁿ) because it recomputes the same subproblems on different branches. The first tool to reach for is:',
      options: [
        'Convert the recursion to a loop',
        'Memoise the results, keyed by the subproblem',
        'Sort the input first',
        'Add a second pointer',
      ],
      answerIndex: 1,
      explain:
        'Overlapping subproblems is the signature of memoisation - it collapses the repeated subtrees into O(1) lookups.',
    },
    {
      id: 'bo-9',
      kind: 'complexity',
      prompt: 'In JavaScript, what does this cost for an array of n strings?',
      context: `let out = '';
for (const piece of pieces) out += piece;`,
      options: [
        'O(n) - one pass',
        'O(n²) characters copied, because strings are immutable',
        'O(n log n)',
        'O(1) - the engine optimises it away',
      ],
      answerIndex: 1,
      explain:
        'Each concatenation copies everything accumulated so far. Push into an array and `join` at the end for O(n).',
    },
    {
      id: 'bo-10',
      kind: 'concept',
      prompt: 'Which statement about best case and best conceivable runtime is right?',
      options: [
        'They are two names for the same thing',
        'Best case describes an algorithm on lucky input; BCR is a lower bound on the problem itself',
        'BCR is always achievable',
        'Best case is the most useful of the three cases to discuss',
      ],
      answerIndex: 1,
      explain:
        'BCR is a property of the problem (its inputs and outputs). Best case is a mostly useless property of one algorithm.',
    },
  ],
  drills: [
    {
      slug: 'fibonacci-number',
      note: 'Write it three ways - naive, memoised, iterative - and state the time and space of each.',
    },
    { slug: 'sqrtx', note: 'Compare the linear guess loop O(√n) with the binary search O(log n).' },
    {
      slug: 'majority-element',
      note: 'Sorting is O(n log n); the voting algorithm is O(n) time and O(1) space. Justify both.',
    },
    {
      slug: 'search-a-2d-matrix',
      note: 'O(log(m·n)) treating it as one sorted array. Say why that equals O(log m + log n).',
    },
    {
      slug: 'range-sum-query-immutable',
      note: 'The point of the problem is the tradeoff: O(n) precompute buys O(1) queries.',
    },
  ],
};
