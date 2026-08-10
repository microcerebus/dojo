import type { CourseModule } from '../../types';

export const recursionDp: CourseModule = {
  id: 'recursion-dp',
  title: 'Recursion, Backtracking & DP',
  track: 'core',
  status: 'complete',
  source: 'Chapter 8',
  summary:
    'Design the recursive case, then decide whether to memoise it, tabulate it, or prune it with backtracking.',
  estimatedMinutes: 100,
  concepts: [
    'Spotting recursive problems: "compute the nth…", "list all…", "count all ways…"',
    'Three ways to find the recursion: build up from the smallest case, break the problem down from the top, or split it in half and combine',
    'Defining the base case so it is reached and is correct',
    'Shrinking the state on every call, so the recursion terminates',
    'Recursion always costs O(depth) stack space; every recursion has an iterative form',
    'Overlapping subproblems as the signal for memoisation',
    'Top-down memoisation vs bottom-up tabulation, and the space each needs',
    'Rolling arrays: keeping only the last row or last two values',
    'State-key design - what exactly identifies a subproblem',
    'Backtracking as choose / recurse / unchoose',
    'Pruning: abandoning a branch the moment it cannot lead to an answer',
    'Generating subsets recursively and via bit masks',
    'Generating permutations, with and without duplicate characters',
    'Counting the ways instead of enumerating them, when only the count is asked for',
    'Grid path counting and reachability with obstacles',
    'Flood fill and connected regions',
    'Optimal substructure in stacking, partitioning and expression problems',
    'Recursive halving: multiply, power and magic index via divide and conquer',
    'Towers of Hanoi as the model recursive construction',
  ],
  sections: [
    {
      id: 'spotting',
      title: 'Spotting the recursion',
      takeaway: 'Three standard ways to split a problem, and the phrases that hint at each.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A problem is a candidate for recursion when the answer can be assembled out of answers to smaller versions of the same problem. The wording usually gives it away: "compute the nth…", "list the first n…", "compute all…", "count the ways to…".',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The instinct is about 50% accurate',
          text: 'The book is candid that "this feels recursive" is right roughly half the time. Use the instinct - it is worth having - but stay willing to abandon it. Many problems that look recursive are greedy, two-pointer or counting problems in disguise.',
        },
        {
          kind: 'p',
          text: 'Once you suspect recursion, there are three standard ways to find the actual split.',
        },
        {
          kind: 'bullets',
          items: [
            '**Bottom-up.** Solve it for one element, then work out how to extend a solution for k elements into one for k+1. The most concrete of the three, and usually the fastest to get right.',
            '**Top-down.** Ask how the problem for n decomposes into subproblems. Less concrete, but sometimes the only natural framing. Watch for *overlap* between the cases - that overlap is what dynamic programming exploits.',
            '**Half-and-half.** Split the data in two, solve both halves, combine. Binary search and merge sort are the archetypes; so is recursive multiply, and so is "find a magic index".',
          ],
        },
        {
          kind: 'p',
          text: 'Towers of Hanoi is the model construction. To move n disks from A to C using B: move the top n−1 to B (using C as spare), move the bottom disk to C, then move the n−1 back on top (using A as spare). You never reason about the whole tower - you trust the recursive call and only handle the one disk you are moving.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Trust the smaller call',
          text: 'The single biggest unlock in this chapter is refusing to trace the recursion in your head. Assume the recursive call is already correct for a smaller input, and write only the work that turns its answer into yours. That is the leap of faith the whole technique runs on.',
        },
      ],
    },
    {
      id: 'base-and-stack',
      title: 'Base cases, shrinking state, and the stack',
      takeaway: 'It terminates because the state shrinks, and it costs O(depth) memory.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Two obligations make a recursion correct, and they are separate. The base case must be **reachable** from every path, and it must return the **right** value.',
        },
        {
          kind: 'bullets',
          items: [
            'Reachable: every recursive call must shrink the state - a smaller index, a shorter remaining string, one fewer coin, a strictly smaller amount. Write down what shrinks before you write the code.',
            'Correct: the classic mistake is returning 0 where the answer is 1. "How many ways to make 0 cents?" is one way (take nothing), not zero ways. Getting that wrong makes every count come out as zero.',
            'Guard the impossible cases separately from the base case: a negative amount, an out-of-bounds cell, an empty string. They usually return a different value from the true base.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Recursion is never free on space',
          text: 'A recursion that goes n deep holds n stack frames, so it is O(n) memory even when it looks like it allocates nothing. On a large input that is a real stack overflow, not a theoretical one. Say this out loud in an interview - it is a complexity point most candidates miss.',
        },
        {
          kind: 'p',
          text: 'Every recursive algorithm has an iterative form, because the call stack is a stack you can maintain yourself. Sometimes the iterative version is trivially better (Fibonacci with two variables); sometimes it is much uglier (tree traversal with an explicit stack). Before you commit, ask which one you can actually write correctly, and say the trade-off aloud.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'The same recurrence, three ways - and the space each costs',
          code: `// O(2ⁿ) time, O(n) stack
const fib = (n: number): number => (n < 2 ? n : fib(n - 1) + fib(n - 2));

// O(n) time, O(n) memo + O(n) stack
function fibMemo(n: number, memo = new Map<number, number>()): number {
  if (n < 2) return n;
  const hit = memo.get(n);
  if (hit !== undefined) return hit;
  const value = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, value);
  return value;
}

// O(n) time, O(1) space - the rolling version
function fibIter(n: number): number {
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}`,
        },
      ],
    },
    {
      id: 'memoisation',
      title: 'Overlapping subproblems',
      takeaway: 'Draw the tree. Repeated nodes are the whole opportunity.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Dynamic programming is not a separate technique. It is a plain recursion plus the observation that the same subproblem is being solved over and over. Write the recursion first, draw the call tree, and look for identical nodes.',
        },
        { kind: 'anim', animId: 'rdp-memo-tree' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Why the saving is so large',
          text: 'A cache hit does not remove one call - it removes an entire subtree. If there are only n distinct arguments, the memoised tree is a spine of depth n where each node has one extra child, so an exponential tree collapses to O(n) nodes.',
        },
        {
          kind: 'p',
          text: 'The design decision that matters is the **state key**: exactly which values identify a subproblem. Get it too narrow and you return wrong answers from stale cache entries; too wide and nothing ever repeats, so the memo does nothing.',
        },
        {
          kind: 'table',
          caption: 'What identifies a subproblem',
          headers: ['Problem', 'State key', 'Why'],
          rows: [
            ['Climb n stairs', '`n`', 'the remaining height is all that matters'],
            ['Word break', 'start index', 'the answer depends only on the suffix'],
            ['Coin combinations', '`(amount, coinIndex)`', 'without the index, orderings get counted twice'],
            ['Target sum', '`(index, runningSum)`', 'the sum so far changes what is still reachable'],
            ['Edit distance', '`(i, j)`', 'a position in each string'],
            ['Boolean parenthesisation', '`(lo, hi, target)`', 'the same span can be asked for true and for false'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The coin-change trap',
          text: 'Counting *combinations* (order does not matter) needs the coin index in the state, or you will count 1+2 and 2+1 separately. Counting *permutations* deliberately drops it. The recurrence looks almost identical, so state which one the question is asking for before you write it.',
        },
      ],
    },
    {
      id: 'tabulation',
      title: 'Top-down or bottom-up',
      takeaway: 'Same recurrence, different direction - and usually much less space.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Once you have a memoised recursion, you can often flip it: instead of recursing down and caching on the way back, fill a table in an order that guarantees every dependency is already computed. Both are dynamic programming.',
        },
        { kind: 'anim', animId: 'rdp-dp-table' },
        {
          kind: 'table',
          caption: 'Choosing a direction',
          headers: ['', 'Top-down (memoised recursion)', 'Bottom-up (table)'],
          rows: [
            ['Reads like', 'the recurrence you derived', 'a loop over states'],
            ['Computes', 'only reachable states', 'every state in the table'],
            ['Space', 'memo + O(depth) stack', 'table only, often reducible'],
            ['Best when', 'the state space is sparse or awkward to order', 'the order is obvious and space matters'],
            ['Risk', 'stack overflow on deep inputs', 'filling in the wrong order'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Rolling arrays',
          text: 'Look at what each cell actually reads. If it only reads the previous row, keep two rows instead of the whole table - O(n) instead of O(mn). If it only reads the previous two values, keep two variables. This is the single most common follow-up question in DP interviews.',
        },
        {
          kind: 'p',
          text: 'Keep the full table only when you need to *reconstruct* the answer rather than measure it. "How long is the longest common subsequence" needs one row; "what is the subsequence" needs the whole grid so you can walk back through it.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'A trick for the runtime',
          text: 'If counting nodes in a memoised tree is confusing, redraw it expanding the *upper* nodes rather than the lower ones - breadth-first instead of depth-first. The set of computed values is the same, but the shape makes the node count obvious.',
        },
      ],
    },
    {
      id: 'counting-and-grids',
      title: 'Counting, grids and fills',
      takeaway: 'If only the count is wanted, never build the list.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Watch the verb. "List all the ways" forces you to build every answer, so the runtime is at least the size of the output. "Count the ways" does not - and collapsing enumeration into arithmetic is usually the entire optimisation.',
        },
        {
          kind: 'bullets',
          items: [
            'Paths across an r×c grid moving only right and down: `paths(r, c) = paths(r-1, c) + paths(r, c-1)`, with 1 along the top row and left column. Exponential as a bare recursion, O(rc) with a table, O(c) with a rolling row.',
            'With obstacles, a blocked cell contributes 0 - and if you need an actual path rather than a count, remember the cells you already proved unreachable, or the search degenerates to exponential.',
            'Ways to make an amount from coin denominations: recurse on `(amount, coinIndex)`, taking 0, 1, 2… of the current coin. Base case: an amount of 0 has exactly one representation.',
            'Ways to place n pairs of parentheses: track how many opens and closes remain. Add an open whenever any are left; add a close only while closes outnumber opens. That builds only valid strings, so nothing has to be filtered afterwards.',
          ],
        },
        {
          kind: 'p',
          text: 'Flood fill is the other grid recursion. From a starting cell, if the neighbour has the original colour, paint it and recurse. Two details decide whether it works: check the *original* colour rather than the new one, and return immediately if they are equal, or the recursion never terminates.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Connected regions',
          text: 'Sizing every region - ponds in a field, islands in a grid - is the same fill run from every unvisited cell, summing the cells it paints. Marking visited cells in place is O(1) space; the alternative is a parallel visited grid. Say which one you chose and why.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Ask about connectivity',
          text: 'Four-directional or eight-directional? It changes the answer and the code by one line, and it is exactly the kind of assumption an interviewer is waiting for you to surface.',
        },
      ],
    },
    {
      id: 'backtracking',
      title: 'Choose, recurse, unchoose',
      takeaway: 'One template generates subsets, permutations and placements.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Backtracking is recursion that mutates shared state on the way down and restores it on the way back up. Everything in this half of the chapter is the same three lines.',
        },
        {
          kind: 'steps',
          items: [
            '**Choose** - commit to one option and record it in the shared state.',
            '**Recurse** - solve the smaller problem that remains.',
            '**Unchoose** - undo the change exactly, so the next option starts from a clean state.',
          ],
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'The template, and the two subset formulations',
          code: `function permutations(chars: string[]): string[][] {
  const out: string[][] = [];
  const current: string[] = [];
  const used = new Array(chars.length).fill(false);

  const walk = () => {
    if (current.length === chars.length) return void out.push([...current]);
    for (let i = 0; i < chars.length; i++) {
      if (used[i]) continue;
      used[i] = true; current.push(chars[i]);   // choose
      walk();                                    // recurse
      current.pop(); used[i] = false;            // unchoose
    }
  };
  walk();
  return out;
}

// Subsets, recursively: each element is in or out.
// Subsets, by counting: mask 0..2ⁿ-1, bit i decides element i.
const subsets = <T,>(items: T[]): T[][] =>
  Array.from({ length: 1 << items.length }, (_, mask) =>
    items.filter((_, i) => (mask & (1 << i)) !== 0));`,
        },
        { kind: 'anim', animId: 'rdp-subsets-bits' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Duplicates: branch on counts, not positions',
          text: 'To generate the distinct permutations of a string with repeated characters, do not generate everything and filter - that is exponentially wasteful. Build a count map and, at each step, loop over the *distinct* remaining characters. Each branch then produces a genuinely different prefix, so no duplicate can ever be created.',
        },
        {
          kind: 'p',
          text: 'The same "make the duplicate impossible" idea shows up everywhere: a start index stops combination-sum from producing the same multiset in different orders, and remembering visited cells stops a grid word search from walking back over itself. Restoring the marker on the way out is what makes it backtracking rather than a one-shot search.',
        },
      ],
    },
    {
      id: 'pruning',
      title: 'Pruning',
      takeaway: 'Reject a branch the moment it cannot possibly work.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Backtracking is only affordable because most branches die early. The cost of a search is the number of nodes you actually visit, so every check that kills a branch before recursing removes an entire subtree.',
        },
        { kind: 'anim', animId: 'rdp-n-queens' },
        {
          kind: 'bullets',
          items: [
            '**Encode constraints into the shape of the search.** Placing one queen per row makes row conflicts unrepresentable rather than merely detected - the cheapest kind of pruning.',
            '**Test before you recurse, not after.** Checking validity at the leaf means you have already paid for the whole branch.',
            '**Track constraint state incrementally.** Keeping sets of occupied columns and diagonals makes each test O(1) instead of a scan of everything placed so far.',
            '**Bail out on a bound.** If the best possible completion of this branch is worse than an answer you already have, stop.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Say the complexity honestly',
          text: 'Pruned searches rarely have a tidy closed form. "O(n!) in the worst case, far less in practice because most branches die within a few rows" is a better answer than a made-up bound - and it is what the interviewer expects to hear.',
        },
      ],
    },
    {
      id: 'substructure',
      title: 'Finding the substructure',
      takeaway: 'Sort it, split it, or halve it - then the recurrence appears.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The harder problems in this chapter hide the recurrence behind one preparatory move. Three moves cover most of them.',
        },
        {
          kind: 'bullets',
          items: [
            '**Sort first, then recurse on one dimension.** Boxes that must be strictly decreasing in width, height *and* depth: sort by one dimension so it is automatically satisfied, and the problem becomes a longest increasing subsequence on the others. The circus-tower question is the same problem with two dimensions.',
            '**Split at every operator.** To count parenthesisations of a boolean expression that evaluate to a target, try each operator as the last one applied, recurse on the left and right spans, and combine the true/false counts according to the operator. Memoise on `(lo, hi, target)` - the same span is asked about repeatedly.',
            '**Halve the input.** Multiplying without a multiply operator is `(a * (b >> 1)) << 1`, plus a when b is odd - O(log b) rather than O(b). Powers work the same way, and you should always halve the **smaller** operand.',
          ],
        },
        {
          kind: 'p',
          text: 'A magic index - an index where `A[i] === i` - is the purest half-and-half. In a sorted array of distinct values, `A[mid] < mid` means no earlier index can work, so binary search applies directly. With duplicates that argument breaks: you must search both sides, but you can still skip ranges using the value at the midpoint as a bound.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Kadane is a DP you can state in one line',
          text: 'The maximum-sum contiguous run: `best(i)` is the best run ending at i, which is either `a[i]` alone or `a[i] + best(i-1)`. Keep the running total, reset it whenever it goes negative, and track the maximum. That is a rolling-array DP in two variables - and saying so is worth more than the code.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'When the recurrence will not come',
          text: 'Try the smallest inputs by hand and tabulate the answers. Seeing 1, 2, 4, 7, 13 for the triple-step staircase makes the recurrence obvious in a way that staring at the general case does not. Base-case-and-build is a technique, not a fallback.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'rdp-1',
      kind: 'complexity',
      prompt:
        'Plain recursive Fibonacci: `fib(n) = fib(n-1) + fib(n-2)`. What are the time and space costs?',
      options: [
        'O(n) time, O(1) space',
        'O(2ⁿ) time, O(n) space',
        'O(n²) time, O(n) space',
        'O(2ⁿ) time, O(2ⁿ) space',
      ],
      answerIndex: 1,
      explain:
        'The call tree has roughly 2ⁿ nodes, but only one root-to-leaf path is live at a time, so the stack is O(n) deep - not O(2ⁿ).',
    },
    {
      id: 'rdp-2',
      kind: 'concept',
      prompt: 'What is the signal that a recursion should be memoised?',
      options: [
        'It is deeper than 100 frames',
        'The same subproblem - the same arguments - is solved more than once',
        'It has more than one base case',
        'It returns an array rather than a number',
      ],
      answerIndex: 1,
      explain:
        'Overlapping subproblems are the entire opportunity. Draw the call tree and look for identical nodes; if there are none, a memo adds cost and no benefit.',
    },
    {
      id: 'rdp-3',
      kind: 'technique',
      prompt:
        'Counting the ways to make an amount from coin denominations, where order does not matter. What must be in the memo key?',
      options: [
        'The amount only',
        'The amount and the index of the current coin',
        'The amount and the number of coins used',
        'The list of coins used so far',
      ],
      answerIndex: 1,
      explain:
        'Without the coin index, 1+2 and 2+1 are counted separately. The index is what forces a single canonical order per combination.',
    },
    {
      id: 'rdp-4',
      kind: 'complexity',
      prompt:
        'The longest-common-subsequence table is m×n, and each cell reads only the previous row and the cell to its left. Best space, if you only need the length?',
      options: ['O(mn)', 'O(m + n)', 'O(min(m, n))', 'O(1)'],
      answerIndex: 2,
      explain:
        'Two rows suffice, and you can choose the shorter string as the row - so O(min(m, n)). Keep the full table only if you must reconstruct the subsequence itself.',
    },
    {
      id: 'rdp-5',
      kind: 'technique',
      prompt: 'What are the three steps of the backtracking template?',
      options: [
        'Sort, search, return',
        'Choose, recurse, unchoose',
        'Guess, verify, restart',
        'Split, solve, merge',
      ],
      answerIndex: 1,
      explain:
        'Undoing the choice exactly is what lets shared mutable state be reused for the next branch instead of copied.',
    },
    {
      id: 'rdp-6',
      kind: 'technique',
      prompt:
        'Generating the *distinct* permutations of a string with repeated characters. What is the right approach?',
      options: [
        'Generate all permutations, then deduplicate with a set',
        'Build a character-count map and branch on distinct remaining characters',
        'Sort the string first, then permute',
        'Generate permutations of the unique characters only',
      ],
      answerIndex: 1,
      explain:
        'Branching on counts makes duplicates impossible to create. Generating then filtering does exponentially more work and then throws it away.',
    },
    {
      id: 'rdp-7',
      kind: 'concept',
      prompt: 'How many ways are there to represent an amount of 0, and why does it matter?',
      options: [
        'Zero - there is nothing to count',
        'One - take nothing. If you return 0, every count collapses to 0',
        'It depends on the coin denominations',
        'Undefined - the case should be rejected',
      ],
      answerIndex: 1,
      explain:
        'The empty selection is a valid representation. This base case is the most common silent bug in counting DPs.',
    },
    {
      id: 'rdp-8',
      kind: 'complexity',
      prompt: 'Generating every subset of an n-element set. What is the best conceivable runtime?',
      options: ['O(n²)', 'O(n log n)', 'O(2ⁿ · n)', 'O(n!)'],
      answerIndex: 2,
      explain:
        'There are 2ⁿ subsets and writing each one costs up to n, so the output alone is that big - no algorithm can beat it.',
    },
    {
      id: 'rdp-9',
      kind: 'technique',
      prompt:
        'Stacking boxes so each is strictly smaller than the one below in width, height and depth. What is the first move?',
      options: [
        'Try every ordering with backtracking',
        'Sort by one dimension so that constraint is automatic, then run a longest-increasing-subsequence DP on the others',
        'Sort by volume and take a greedy prefix',
        'Build a graph and find the longest path with BFS',
      ],
      answerIndex: 1,
      explain:
        'Sorting removes one dimension from the search entirely, which turns an exponential enumeration into an O(n²) sequence DP.',
    },
    {
      id: 'rdp-10',
      kind: 'concept',
      prompt: 'Why does placing exactly one queen per row help in n-queens?',
      options: [
        'It makes the code shorter',
        'It makes row conflicts unrepresentable, so only columns and diagonals need checking',
        'It guarantees a solution exists',
        'It removes the need to backtrack',
      ],
      answerIndex: 1,
      explain:
        'Encoding a constraint into the shape of the search is the cheapest pruning there is - the invalid branches are never generated at all.',
    },
  ],
  drills: [
    { slug: 'climbing-stairs', note: 'CTCI 8.1 - the "hello world" of DP. Do all four versions.' },
    { slug: 'coin-change', note: 'Minimising, not counting. Know the difference from CTCI 8.11.' },
    { slug: 'house-robber', note: 'CTCI 17.16 - non-adjacent maximum.' },
    { slug: 'house-robber-ii', note: 'Same, in a circle - run it twice with one house excluded.' },
    { slug: 'longest-increasing-subsequence', note: 'O(n²) DP, then the O(n log n) patience version.' },
    { slug: 'longest-common-subsequence', note: 'The two-dimensional table to know cold.' },
    { slug: 'word-break', note: 'CTCI 17.13 - memoise on the suffix index.' },
    { slug: 'combination-sum-iv', note: 'Order matters here - notice it changes the recurrence.' },
    { slug: 'decode-ways', note: 'Careful base cases and zero handling.' },
    { slug: 'unique-paths', note: 'The plainest grid DP.' },
    { slug: 'unique-paths-ii', note: 'CTCI 8.2 - the same grid with obstacles.' },
    { slug: 'jump-game', note: 'Greedy beats DP - work out why.' },
    { slug: 'maximum-subarray', note: 'CTCI 16.17 - Kadane. Say the DP framing.' },
    { slug: 'maximum-product-subarray', note: 'Track the running minimum too, because of negatives.' },
    { slug: 'subsets', note: 'CTCI 8.4 - recursion and the bit-mask version.' },
    { slug: 'permutations', note: 'CTCI 8.7 - choose / recurse / unchoose.' },
    { slug: 'combination-sum', note: 'Backtracking with reuse and a start index.' },
    { slug: 'generate-parentheses', note: 'CTCI 8.9 - track open and close counts remaining.' },
    { slug: 'n-queens', note: 'CTCI 8.12 - the canonical pruning problem.' },
    { slug: 'word-search', note: 'Backtracking on a grid with an in-place visited marker.' },
    { slug: 'flood-fill', note: 'CTCI 8.10 - paint fill.' },
    { slug: 'edit-distance', note: 'The other two-dimensional table to know cold.' },
    { slug: 'partition-equal-subset-sum', note: 'Subset sum as a boolean DP.' },
    { slug: 'min-cost-climbing-stairs', note: 'A gentle rolling-array exercise.' },
    { slug: 'target-sum', note: 'Counting sign assignments - memoise on (index, runningSum).' },
    { slug: 'russian-doll-envelopes', note: 'CTCI 8.13 and 17.8 - sort, then LIS on the other dimension.' },
    { slug: 'different-ways-to-add-parentheses', note: 'CTCI 8.14 - split at every operator.' },
    { slug: 'coin-change-ii', note: 'CTCI 8.11 - counting combinations, where order does not matter.' },
    { slug: 'permutations-ii', note: 'CTCI 8.8 - branch on counts to avoid duplicates.' },
    { slug: 'fixed-point', note: 'CTCI 8.3 - magic index by binary search. Premium.' },
    { slug: 'largest-1-bordered-square', note: 'CTCI 17.23 - precompute runs, then test squares.' },
    { slug: 'max-sum-of-rectangle-no-larger-than-k', note: 'CTCI 17.24 - fix a row pair, then Kadane.' },
  ],
};
