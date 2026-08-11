import type { CourseModule } from '../../types';

export const stacksQueues: CourseModule = {
  id: 'stacks-queues',
  title: 'Stacks & Queues',
  track: 'core',
  status: 'complete',
  source: 'Chapter 3',
  summary:
    'LIFO and FIFO, the structures built out of them, and the habit of storing extra state so queries stay O(1).',
  estimatedMinutes: 45,
  concepts: [
    'LIFO semantics and the stack API: push, pop, peek, isEmpty',
    'FIFO semantics and the queue API: add, remove, peek, isEmpty',
    'Implementing both with a linked list, and a stack with an array',
    'No constant-time indexing - that is the price of O(1) ends',
    'Stacks for recursion, backtracking, and converting recursion to iteration',
    'Queues for BFS and for caches',
    'Packing several logical stacks into one array, fixed or flexible',
    'Auxiliary state for O(1) aggregate queries (min stack)',
    'Amortised transfer between two stacks to build a queue',
    'Capacity-bounded stacks of stacks, and indexed pop with rollover',
    'Sorting with only one temporary stack',
    'Timestamp ordering across multiple category queues',
    'The monotonic stack pattern for next-greater problems',
  ],
  sections: [
    {
      id: 'both-structures',
      title: 'The two structures',
      takeaway: 'Same container, different end. That is the entire difference.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A stack is last-in-first-out: like a stack of plates, the most recently added item comes off first. A queue is first-in-first-out: like a line at a counter, the earliest arrival leaves first.',
        },
        { kind: 'anim', animId: 'sq-lifo-fifo' },
        {
          kind: 'table',
          headers: ['', 'Stack (LIFO)', 'Queue (FIFO)'],
          rows: [
            ['Add', '`push` (top)', '`add` / `enqueue` (back)'],
            ['Remove', '`pop` (top)', '`remove` / `dequeue` (front)'],
            ['Look', '`peek`', '`peek`'],
            ['Both', '`isEmpty`', '`isEmpty`'],
            ['Natural fit', 'DFS, backtracking, undo, parsing', 'BFS, scheduling, caches, buffers'],
          ],
        },
        {
          kind: 'p',
          text: 'Neither offers indexing. In exchange, adds and removes are O(1) with no shifting of elements. A stack is easy on an array (push and pop at the end are already the fast operations) or on a linked list, adding and removing at the head. A queue on a linked list needs both a `first` and a `last` pointer.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The queue bug everyone writes',
          text: 'Keeping `first` and `last` consistent is where queue implementations break. Adding to an empty queue must set both; removing the last item must null both. Write those two cases out explicitly.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'In JS/TS',
          text: 'An array is a fine stack (`push`/`pop`). It is a bad queue: `shift()` is O(n), so a loop over a large queue silently becomes O(n²). Keep a head index and advance it, or use a linked list.',
        },
        {
          kind: 'p',
          text: 'The reason both matter beyond their own chapter: a stack is exactly the call stack, so any recursive algorithm can be rewritten iteratively with an explicit stack - useful when recursion would blow the stack. And BFS is defined by its queue: process a node, enqueue its neighbours, and nodes come out in the order they were discovered, which is what makes BFS find shortest unweighted paths.',
        },
      ],
    },
    {
      id: 'extra-state',
      title: 'Store the answer, do not recompute it',
      takeaway: 'A second stack of metadata keeps aggregate queries O(1).',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The signature question of this chapter: add `min()` to a stack, with push, pop and min all O(1).',
        },
        {
          kind: 'p',
          text: 'Scanning on demand is O(n). A single `min` variable looks right until you pop the minimum - and then there is nothing to fall back to. The fix is to keep a parallel stack recording what the minimum was at the moment each element was pushed.',
        },
        { kind: 'anim', animId: 'sq-min-stack' },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Min stack',
          code: `class MinStack {
  private values: number[] = [];
  private mins: number[] = [];

  push(value: number): void {
    this.values.push(value);
    const currentMin = this.mins.length === 0
      ? value
      : Math.min(value, this.mins[this.mins.length - 1]);
    this.mins.push(currentMin);
  }

  pop(): number | undefined {
    this.mins.pop();          // always in lockstep
    return this.values.pop();
  }

  min(): number | undefined {
    return this.mins[this.mins.length - 1];
  }
}`,
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The generalisable idea',
          text: 'When a query would need a scan, ask what you could have recorded on the way in. Trading O(n) space for O(1) queries is the move, and it reappears in caches, prefix sums and augmented trees.',
        },
        {
          kind: 'p',
          text: 'Two space optimisations are worth naming: store `(value, minSoFar)` pairs in a single stack, or only push onto the min stack when a strictly smaller value arrives (popping it only when the popped value equals the current minimum). The second is cheaper when minima are rare and is the answer to "can you use less space?".',
        },
      ],
    },
    {
      id: 'composites',
      title: 'Building one structure from another',
      takeaway: 'Pouring a stack into a stack reverses it. That is a queue.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Implement a queue with two stacks. Everything enqueued goes onto `in`. Everything dequeued comes off `out`. When `out` is empty, pour the whole of `in` into it - the order flips, so the oldest item ends up on top.',
        },
        { kind: 'anim', animId: 'sq-queue-two-stacks' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Only pour when "out" is empty',
          text: 'Pouring eagerly on every operation is O(n) every time and also wrong - it re-reverses items already in the right order. The lazy rule is what makes it correct *and* O(1) amortised.',
        },
        {
          kind: 'p',
          text: 'The complexity argument is worth rehearsing, because it is the same one as array doubling: every element is pushed and popped at most twice across its whole lifetime, so any sequence of n operations costs O(n) - O(1) amortised each, even though one individual dequeue can be O(n).',
        },
        {
          kind: 'p',
          text: 'Three more composite structures show up in this chapter:',
        },
        {
          kind: 'bullets',
          items: [
            '**Three stacks in one array.** Fixed division: give each stack a third of the array and track three tops - simple, but wastes space when usage is uneven. Flexible division: let the stacks grow into each other and shift when one hits a neighbour - better utilisation, much more bookkeeping. State both and pick based on whether sizes are known.',
            '**A stack of stacks.** When one substack hits capacity, start a new one. `push` and `pop` behave exactly like a single stack. The follow-up, `popAt(index)`, forces a decision: either leave holes in earlier substacks, or roll elements over from the next substack to keep them full. Rollover is O(n) but keeps the invariant - say which you chose and why.',
            '**Two queues with shared ordering.** For the animal shelter (adopt the oldest overall, or the oldest of one species), keep one queue per species and stamp each arrival with an increasing counter. Serving "any" compares the two front timestamps. This beats a single queue, which would need a scan to find the oldest of one type.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'The recurring lesson',
          text: 'When a structure cannot answer a query efficiently, do not rebuild it - add the metadata that makes the query trivial. A timestamp, a min, a size, a pointer.',
        },
      ],
    },
    {
      id: 'sorting-and-monotonic',
      title: 'Sorting a stack, and monotonic stacks',
      takeaway: 'Keep the helper stack sorted; keep the monotonic stack decreasing.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Sort a stack using only one additional stack and no other structure. The trick is an invariant: the helper stack is always sorted. Pop an element into a temporary variable, move elements back from the helper until it fits, then push it.',
        },
        { kind: 'anim', animId: 'sq-sort-stack' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Complexity',
          text: 'O(n²) time and O(n) space. Each element can be shuffled back and forth many times - and if you need the smallest on top rather than the largest, pour the result across once more.',
        },
        {
          kind: 'p',
          text: 'The same "maintain an invariant on the stack" idea powers the monotonic stack, which is not in the book chapter but is the pattern most stack questions on LeetCode actually test.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Next greater element - the monotonic stack template',
          code: `function nextGreater(nums: number[]): number[] {
  const result = new Array<number>(nums.length).fill(-1);
  const stack: number[] = []; // indices, values decreasing

  for (let i = 0; i < nums.length; i++) {
    // Anything smaller than nums[i] has just found its answer.
    while (stack.length && nums[stack[stack.length - 1]] < nums[i]) {
      result[stack.pop() as number] = nums[i];
    }
    stack.push(i);
  }
  return result;
}`,
        },
        {
          kind: 'p',
          text: 'Each index is pushed once and popped once, so despite the inner `while` this is O(n). Recognising that shape - "for each element, find the next one that is bigger/smaller" - is worth more marks than any single problem.',
        },
        {
          kind: 'p',
          text: 'Expression evaluation is the other classic. To evaluate `2 + 3 * 4` without parentheses, keep a stack of terms: push numbers, but when you see `*` or `/`, pop the last number, apply the operator immediately, and push the result. Sum the stack at the end. Higher-precedence operators bind eagerly; lower-precedence ones wait.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'sq-1',
      kind: 'concept',
      prompt: 'Which structure does breadth-first search use, and why?',
      options: [
        'A stack, because it explores deeply first',
        'A queue, so nodes are processed in the order they were discovered',
        'A heap, to order by distance',
        'Either works identically',
      ],
      answerIndex: 1,
      explain:
        'FIFO is what makes BFS explore level by level - swap in a stack and you get DFS instead.',
    },
    {
      id: 'sq-2',
      kind: 'complexity',
      prompt:
        'A queue built from two stacks, pouring only when the output stack is empty. Dequeue cost?',
      options: [
        'O(1) worst case',
        'O(n) every time',
        'O(1) amortised, O(n) worst case',
        'O(log n)',
      ],
      answerIndex: 2,
      explain:
        'Each element is pushed and popped at most twice overall, so n operations cost O(n) in total.',
    },
    {
      id: 'sq-3',
      kind: 'technique',
      prompt: 'Why does a single `min` variable fail for a stack with O(1) min?',
      options: [
        'It uses too much memory',
        'When the minimum is popped there is no record of the previous minimum',
        'It cannot handle duplicate values',
        'It only works for integers',
      ],
      answerIndex: 1,
      explain:
        'You would have to rescan to recover it. A parallel min stack keeps the previous answer available.',
    },
    {
      id: 'sq-4',
      kind: 'complexity',
      prompt: 'Sorting a stack using one additional temporary stack costs:',
      options: [
        'O(n log n) time, O(n) space',
        'O(n²) time, O(n) space',
        'O(n) time, O(1) space',
        'O(n²) time, O(1) space',
      ],
      answerIndex: 1,
      explain:
        'Elements shuffle back and forth to keep the helper sorted - quadratic time, and the helper is O(n) space.',
    },
    {
      id: 'sq-5',
      kind: 'complexity',
      prompt: 'In JavaScript, using an array as a queue by calling `shift()` in a loop gives you:',
      options: [
        'O(n) total, since shift is O(1)',
        'O(n²) total, since shift is O(n)',
        'O(n log n) total',
        'The same cost as `pop()`',
      ],
      answerIndex: 1,
      explain:
        '`shift()` moves every remaining element. Keep a head index instead, or use a linked list.',
    },
    {
      id: 'sq-6',
      kind: 'technique',
      prompt:
        'An animal shelter serves the oldest animal overall, or the oldest of a chosen species. Best design?',
      options: [
        'One queue, scanned for the right species',
        'One queue per species, with an arrival timestamp on each animal',
        'A sorted array rebuilt on each adoption',
        'A stack per species',
      ],
      answerIndex: 1,
      explain:
        'Separate queues make per-species O(1); the shared timestamp makes "any" O(1) by comparing the two fronts.',
    },
    {
      id: 'sq-7',
      kind: 'technique',
      prompt:
        'For each element of an array, find the next element to its right that is larger. Which pattern?',
      options: [
        'Sliding window',
        'A monotonic stack of indices',
        'Binary search',
        'Two converging pointers',
      ],
      answerIndex: 1,
      explain:
        'Push indices, and pop them as soon as a bigger value arrives - each index moves twice, giving O(n).',
    },
    {
      id: 'sq-8',
      kind: 'concept',
      prompt:
        'For a `SetOfStacks` with capacity per substack, `popAt(index)` on a middle substack. The design decision is:',
      options: [
        'Whether to sort the substacks',
        'Whether to leave a gap, or roll elements over from later substacks to keep them full',
        'Whether to use a queue instead',
        'Whether to store the capacity',
      ],
      answerIndex: 1,
      explain:
        'Rollover preserves the "all full but the last" invariant at O(n) cost; gaps are cheaper but complicate later pops. Either is fine if you justify it.',
    },
    {
      id: 'sq-9',
      kind: 'technique',
      prompt: 'Evaluating `2 + 3 * 4` with a stack and no parentheses. The rule is:',
      options: [
        'Push everything and evaluate left to right at the end',
        'Apply `*` and `/` immediately against the top of the stack; defer `+` and `-` and sum at the end',
        'Convert to postfix first - there is no other way',
        'Sort the operators by precedence',
      ],
      answerIndex: 1,
      explain:
        'Higher-precedence operators bind eagerly to the number on top; lower-precedence terms wait on the stack.',
    },
    {
      id: 'sq-10',
      kind: 'concept',
      prompt: 'What do you give up by choosing a stack or a queue over an array?',
      options: [
        'Constant-time add and remove',
        'Constant-time access to an arbitrary index',
        'The ability to store objects',
        'Nothing at all',
      ],
      answerIndex: 1,
      explain:
        'Both restrict you to the ends. That restriction is what keeps adds and removes O(1) with no shifting.',
    },
  ],
  drills: [
    { slug: 'valid-parentheses', note: 'The canonical stack problem. Five minutes, no excuses.' },
    { slug: 'min-stack', note: 'CTCI 3.2 exactly. Then do the reduced-space version.' },
    {
      slug: 'implement-queue-using-stacks',
      note: 'CTCI 3.4 - and be ready to explain the amortised analysis.',
    },
    {
      slug: 'implement-stack-using-queues',
      note: 'The mirror image; decide which operation eats the cost.',
    },
    {
      slug: 'evaluate-reverse-polish-notation',
      note: 'Stack evaluation with no precedence to worry about.',
    },
    { slug: 'basic-calculator-ii', note: 'CTCI 16.26 - precedence without parentheses.' },
    { slug: 'daily-temperatures', note: 'The monotonic stack, in its purest form.' },
    { slug: 'next-greater-element-i', note: 'Same pattern, plus a map from value to answer.' },
    {
      slug: 'asteroid-collision',
      note: 'A stack simulation where the pop conditions are the whole problem.',
    },
    {
      slug: 'design-circular-queue',
      note: 'Fixed-capacity ring buffer - index arithmetic practice.',
    },
    {
      slug: 'largest-rectangle-in-histogram',
      note: 'Hard, but it is the monotonic stack taken to its limit.',
    },
  ],
};
