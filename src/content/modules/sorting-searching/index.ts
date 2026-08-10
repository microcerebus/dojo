import type { CourseModule } from '../../types';

export const sortingSearching: CourseModule = {
  id: 'sorting-searching',
  title: 'Sorting & Searching',
  track: 'core',
  status: 'complete',
  source: 'Chapter 10',
  summary:
    'The sorts worth knowing, binary search on things that are not quite sorted, and searching data that will not fit in memory.',
  estimatedMinutes: 75,
  concepts: [
    'Bubble and selection sort: O(n²), worth knowing only as a baseline',
    'Merge sort: O(n log n) always, stable, O(n) auxiliary space',
    'Quicksort: O(n log n) expected, O(n²) worst, in place, not stable; pivot choice matters',
    'Radix sort: O(kn) for fixed-width integers - beating the comparison bound by not comparing',
    'Counting and bucket sorts when the value range is small and known',
    'Stability, in-place behaviour, worst case and auxiliary space as the four axes to compare on',
    'Binary search and its boundary conditions: inclusive vs exclusive bounds, overflow-safe midpoints',
    'Finding the first or last occurrence rather than any occurrence',
    'Binary search on a rotated array: work out which half is sorted, then decide',
    'Duplicates degrading rotated search to O(n)',
    'Exponential probing to find the length of a structure with no size method',
    'Searching sorted data with gaps, by walking to the nearest non-empty entry',
    'External merge sort for files far larger than memory',
    'Bit vectors and chunked counting passes under strict memory limits',
    'Eliminating a row or column per step in a row/column-sorted matrix',
    'Augmenting a BST with subtree sizes for online rank queries',
    'Sorting as preprocessing: the interval, closest-pair and sweep-line patterns',
    'Local rearrangement into alternating peaks and valleys without a full sort',
  ],
  sections: [
    {
      id: 'the-sorts',
      title: 'The sorts worth knowing',
      takeaway: 'Merge, quick and bucket. The quadratic two exist only as a baseline.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Most sorting questions are a tweak of a standard algorithm, so the productive move when you are stuck is to run down the list and ask which one the constraints are pointing at.',
        },
        {
          kind: 'bullets',
          items: [
            '**Bubble sort** - sweep the array swapping out-of-order neighbours until a sweep changes nothing. O(n²) time, O(1) space. Know the name; never propose it.',
            '**Selection sort** - scan for the smallest remaining element, move it to the front, repeat. Also O(n²), also O(1) space, and it does the fewest writes of any simple sort.',
            '**Merge sort** - split in half, sort each half, merge. O(n log n) always, stable, O(n) auxiliary.',
            '**Quicksort** - pick a pivot, partition around it, recurse into both sides. O(n log n) expected and O(n²) worst, in place, not stable.',
            '**Radix sort** - bucket by one digit at a time, least significant first. O(kn) for k-digit integers, which beats the comparison bound because it never compares two elements.',
            '**Counting / bucket sort** - when the values come from a small known range, count occurrences and read them back out. O(n + range).',
          ],
        },
        { kind: 'anim', animId: 'sort-merge-sort' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The merge detail people miss',
          text: 'When one side runs out, the leftovers from the *left* side must be copied back, but the leftovers from the right side need no work at all - they are already sitting in exactly the right positions. Being able to say why is a good signal that you actually understand the merge.',
        },
        { kind: 'anim', animId: 'sort-quick-partition' },
        {
          kind: 'p',
          text: 'Quicksort earns its name from the constant factor: it swaps within the array instead of building a helper, so it is cache-friendly and needs no allocation. The cost is the pivot. If the pivot is always the extreme value, each partition peels off one element and the whole thing degrades to O(n²).',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'The age question',
          text: '"Sort a very large array of people by age." Two clues: the array is large, so efficiency matters, and ages fall in a small known range. That points at bucket or counting sort for O(n) - a comparison sort here is leaving the constraint on the table.',
        },
      ],
    },
    {
      id: 'comparing',
      title: 'Four axes, not one',
      takeaway: 'Time is only one of the four things an interviewer is comparing.',
      audio: true,
      blocks: [
        {
          kind: 'table',
          caption: 'The comparison to have memorised',
          headers: ['Sort', 'Average', 'Worst', 'Space', 'Stable'],
          rows: [
            ['Bubble', 'O(n²)', 'O(n²)', 'O(1)', 'yes'],
            ['Selection', 'O(n²)', 'O(n²)', 'O(1)', 'no'],
            ['Merge', 'O(n log n)', 'O(n log n)', 'O(n)', 'yes'],
            ['Quick', 'O(n log n)', 'O(n²)', 'O(log n) stack', 'no'],
            ['Radix', 'O(kn)', 'O(kn)', 'O(n + base)', 'yes'],
            ['Counting', 'O(n + range)', 'O(n + range)', 'O(range)', 'yes'],
          ],
        },
        {
          kind: 'bullets',
          items: [
            '**Stability** means equal elements keep their input order. It matters the moment you sort by one key after already sorting by another - which is exactly how radix sort works internally.',
            '**In place** means O(1) or O(log n) extra memory. Quicksort qualifies; merge sort does not.',
            '**Worst case** matters when an adversary controls the input, or when a tail-latency guarantee is needed. Merge sort has none; quicksort does.',
            '**Auxiliary space** is the number people forget. Merge sort\'s O(n) helper is a real cost on large inputs, and it is why library sorts are often hybrids.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The Ω(n log n) bound, and how to dodge it',
          text: 'Any sort that only ever *compares* elements needs Ω(n log n) comparisons - there are n! orderings and each comparison halves the possibilities. Radix and counting sorts are not exceptions to the rule; they simply do not compare. That is the honest answer to "can you beat n log n": yes, if you know something about the values.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Say what "sorted" means first',
          text: 'Sorting strings so anagrams end up adjacent is not the same as sorting them alphabetically. The trick is a **canonical key** - sort each word\'s characters and group by that - which turns an all-pairs comparison into one pass with a hash map.',
        },
      ],
    },
    {
      id: 'binary-search',
      title: 'Binary search, precisely',
      takeaway: 'The idea is trivial; the plus-ones are not. Fix one template.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Compare the target to the midpoint, discard the half it cannot be in, repeat. The concept takes one sentence and the implementation takes three attempts, because every boundary decision has to be consistent with every other one.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Inclusive bounds - pick one template and never deviate',
          code: `function binarySearch(a: number[], x: number): number {
  let lo = 0;
  let hi = a.length - 1;            // inclusive, so the loop is <=
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1); // never (lo + hi) / 2: that can overflow
    if (a[mid] === x) return mid;
    if (a[mid] < x) lo = mid + 1;   // the +1 and -1 are what guarantee progress
    else hi = mid - 1;
  }
  return -1;
}`,
        },
        {
          kind: 'bullets',
          items: [
            'With **inclusive** `hi = length - 1`, the loop condition is `lo <= hi`. With **exclusive** `hi = length`, it is `lo < hi`. Mixing the two is the single most common binary-search bug.',
            'Always move at least one index past `mid`. `lo = mid` with a floored midpoint is an infinite loop on a two-element window.',
            '`lo + ((hi - lo) >> 1)` cannot overflow. In JavaScript the values are unlikely to get that big, but saying it costs one second and shows you know why the idiom exists.',
            'To find the **first** occurrence, do not stop on a match: record it and keep searching left. For the **last**, record and search right. That is also the lower-bound / upper-bound pair you need for counting duplicates.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Binary search does not need a sorted array',
          text: 'It needs a *monotone predicate*: some test that is false, false, false, then true, true, true across the range. Finding a peak element, finding the smallest capacity that fits a schedule, or finding the partition point in the median-of-two-arrays problem all qualify. Ask "what is my yes/no test, and is it monotone?" - not "is the array sorted?".',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Think past binary search',
          text: 'The book is explicit that binary search is not the only way to search. A hash map, a BST, a heap, or a single linear scan with the right invariant may all beat it. Binary search is a tool for ordered data, not a reflex.',
        },
      ],
    },
    {
      id: 'modified-search',
      title: 'When the array is not quite sorted',
      takeaway: 'Restore some invariant locally, and binary search still applies.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Most of this chapter\'s search questions take binary search and break one of its assumptions. The pattern for each is to find a weaker property that is still enough to discard half the data.',
        },
        { kind: 'anim', animId: 'sort-rotated-search' },
        {
          kind: 'bullets',
          items: [
            '**Rotated array.** Comparing the target to the midpoint no longer tells you the side. But at least one half is always still in sorted order - decide which by comparing the low value to the mid value, range-check the target against that half, and keep or discard it.',
            '**Rotated with duplicates.** If the low, mid and high values are all equal you cannot tell which half is sorted at all. The only correct move is to shrink one end by one, which makes the worst case O(n). Say so rather than claiming O(log n).',
            '**No size method.** If the structure only offers `elementAt(i)` and returns a sentinel past the end, probe 1, 2, 4, 8… until you overshoot, then binary search between the last good index and the first bad one. Doubling costs O(log n), so the whole thing stays O(log n).',
            '**Sorted with empty gaps.** Comparison against an empty entry is meaningless, so from the midpoint walk outwards to the nearest non-empty entry and compare there. It is still O(log n) typically, but a run of empties degrades it to O(n) - which is the point of the question.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The "any index" get-out',
          text: 'Several of these questions say "return any matching index". That permission is doing real work: it lets you stop at the first hit instead of proving it is the first one. When a question does *not* say it, check whether it wants the leftmost.',
        },
        {
          kind: 'p',
          text: 'Two more shapes are worth recognising. Finding the **minimum** of a rotated array is the same reasoning aimed at the pivot point rather than a value. And "**find any peak**" needs no sortedness at all: if the midpoint is smaller than its right neighbour, a peak must exist to the right, because the sequence has to turn back down eventually.',
        },
      ],
    },
    {
      id: 'matrix-search',
      title: 'Searching a sorted matrix',
      takeaway: 'From the right corner, one comparison kills a whole row or column.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A matrix whose rows and columns are each sorted is not a sorted list - the value below a cell and the value to its right are incomparable. Binary searching every row works and costs O(m log n). Starting from the right corner is better.',
        },
        { kind: 'anim', animId: 'sort-matrix-corner' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Why the corner is special',
          text: 'The top-right cell is the maximum of its row and the minimum of its column. So "too big" rules out its entire column and "too small" rules out its entire row - one comparison, one line eliminated, never any ambiguity. The bottom-left corner works identically. The other two corners do not, and knowing why is the real question.',
        },
        {
          kind: 'p',
          text: 'The alternative is a divide-and-conquer on the diagonal: binary search the diagonal for the point where values cross the target, which eliminates the top-left and bottom-right quadrants and recurses into the other two. It is more elegant, harder to code correctly, and no faster in practice - mention it, then write the corner walk.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Two different "sorted matrix" problems',
          text: 'If every row is sorted *and each row starts after the previous one ends*, the matrix is one sorted list folded up, so a single binary search over m·n cells works in O(log mn). If only rows and columns are individually sorted, that is false and you need the corner walk. Clarify which one you have been given.',
        },
      ],
    },
    {
      id: 'big-data',
      title: 'When it does not fit in memory',
      takeaway: 'Chunk it, count it, or pack it into bits.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A run of questions in this chapter is really about memory rather than sorting. The giveaway is a stated limit: 20 GB of data, 1 GB of RAM, 10 MB of RAM, 4 KB of RAM.',
        },
        {
          kind: 'steps',
          items: [
            '**External merge sort.** Read as much of the file as fits, sort it in memory, write it back out as a sorted chunk. Repeat until the whole file is a set of sorted chunks.',
            'Then merge the chunks together, keeping only a small buffer from each open chunk in memory at a time.',
            'The merge is exactly the merge step of merge sort with k inputs instead of 2 - a heap of the k current heads picks the next value in O(log k).',
          ],
        },
        {
          kind: 'p',
          text: 'Bit vectors are the other lever. A boolean per possible value costs one bit rather than one byte or one object, which is a 32-fold or 64-fold saving over the obvious representation.',
        },
        {
          kind: 'table',
          caption: 'The memory arithmetic you should be able to do out loud',
          headers: ['Task', 'Budget', 'Approach'],
          rows: [
            ['Find a missing value among 4 billion ints', '1 GB', 'One bit per possible value: 2³² bits = 512 MB. One pass, then scan for a zero.'],
            ['Same, distinct values, ≤ 1 billion of them', '10 MB', 'Pass one: count how many values fall in each block. Some block must be short. Pass two: bit vector over that block only.'],
            ['Print duplicates among values 1..32,000', '4 KB', '32,000 bits is 4 KB exactly. Set a bit on first sight; a value whose bit is already set is a duplicate.'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The two-pass counting pattern',
          text: 'When even a bit vector will not fit, count into buckets first. The pigeonhole principle guarantees at least one bucket is missing a value, and now you only have to represent that one bucket exactly. This "narrow the range, then be precise" shape reappears far beyond this chapter.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Do the arithmetic, do not hand-wave it',
          text: 'These questions are graded on whether you can convert "4 billion booleans" into megabytes and compare it with the stated budget. Say the numbers.',
        },
      ],
    },
    {
      id: 'preprocessing',
      title: 'Sorting as preprocessing',
      takeaway: 'The sort is rarely the answer - it is the setup that makes one scan enough.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The most useful thing about sorting in interviews is not the algorithms. It is that an O(n log n) sort is almost free relative to an O(n²) scan, and after sorting, a single linear pass usually suffices.',
        },
        {
          kind: 'bullets',
          items: [
            '**Closest pair across two arrays.** Sort both, then walk with one pointer each, always advancing the pointer at the smaller value. O(a log a + b log b) instead of O(ab).',
            '**Intervals.** Sort by start, then sweep: overlapping intervals are adjacent after sorting, so merging is one pass. For "how many can I keep without overlap", sort by *end* instead - the greedy choice is the earliest finisher.',
            '**Sweep line and delta counting.** For "which year had the most people alive", do not simulate every year of every life. Record +1 at each birth and −1 after each death, then take a running total. O(n log n) for the sort, O(n + range) for the sweep.',
            '**Pairs summing to a target.** Sort and converge two pointers for O(1) space, or use a hash map of complements for O(n) time. Handling duplicate pairs is the part that gets graded.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Sometimes a full sort is more than you need',
          text: 'To rearrange an array into alternating peaks and valleys, you do not have to sort at all. Walk the array and, at every other position, swap with whichever neighbour is larger. Each local fix cannot break the pair before it, so one O(n) pass is enough - versus O(n log n) for the sort-and-interleave version.',
        },
        {
          kind: 'p',
          text: 'The final pattern is online rather than batch: maintaining answers as data arrives. To answer "how many values so far are at most x" on a stream, keep a BST where each node also stores the size of its left subtree. Insert is O(log n), and a rank query walks one root-to-leaf path adding up left-subtree sizes.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Augmenting is a general move',
          text: 'Storing one extra number per node - a subtree size, a subtree minimum, a count - turns a structure that answers one question into one that answers several, at no change in asymptotic cost. Counting inversions with a modified merge sort is the same trick applied offline.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'sort-1',
      kind: 'complexity',
      prompt: 'Which sort is O(n log n) in the worst case, stable, and needs O(n) extra space?',
      options: ['Quicksort', 'Merge sort', 'Heapsort', 'Radix sort'],
      answerIndex: 1,
      explain:
        'Merge sort is the reliable one: no bad case and stable, paid for with the helper array. Quicksort trades the guarantee for in-place operation.',
    },
    {
      id: 'sort-2',
      kind: 'concept',
      prompt: 'Why can radix sort beat the Ω(n log n) comparison lower bound?',
      options: [
        'It uses less memory',
        'It never compares two elements - it buckets them by digit',
        'It is only faster on already-sorted input',
        'The bound applies only to recursive sorts',
      ],
      answerIndex: 1,
      explain:
        'The bound is about comparison sorts. Radix and counting sorts exploit the structure of the values instead, so they sidestep it rather than break it.',
    },
    {
      id: 'sort-3',
      kind: 'technique',
      prompt:
        'You are searching a rotated sorted array of distinct integers. What do you check at each step?',
      options: [
        'Whether the target is greater than the midpoint',
        'Which half is still in sorted order, then whether the target lies inside that half',
        'Whether the array length is even',
        'The first and last elements only',
      ],
      answerIndex: 1,
      explain:
        'At least one half never wraps. Identify it, range-check the target against it, and keep or discard it - one extra comparison per step.',
    },
    {
      id: 'sort-4',
      kind: 'complexity',
      prompt:
        'Searching a rotated sorted array that may contain duplicates. What is the worst-case time?',
      options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
      answerIndex: 1,
      explain:
        'When the low, mid and high values are equal you cannot tell which half is sorted, so you can only shrink an end by one - and an array of all-equal values degrades to a linear scan.',
    },
    {
      id: 'sort-5',
      kind: 'technique',
      prompt:
        'A sorted array-like structure has `elementAt(i)` but no length, returning −1 past the end. How do you find an element in O(log n)?',
      options: [
        'Scan linearly until you hit −1',
        'Probe indices 1, 2, 4, 8… until you overshoot, then binary search that window',
        'Binary search from 0 to Number.MAX_SAFE_INTEGER',
        'It cannot be done in O(log n)',
      ],
      answerIndex: 1,
      explain:
        'Doubling finds a bound in O(log n) probes, and the resulting window is at most twice the true size - so the follow-up binary search is O(log n) too.',
    },
    {
      id: 'sort-6',
      kind: 'complexity',
      prompt:
        'An m×n matrix has every row and every column sorted ascending. Walking in from the top-right corner costs:',
      options: ['O(log mn)', 'O(m + n)', 'O(m log n)', 'O(mn)'],
      answerIndex: 1,
      explain:
        'Each comparison eliminates a full row or a full column, so the walk visits at most m + n cells. Binary searching each row would be O(m log n).',
    },
    {
      id: 'sort-7',
      kind: 'technique',
      prompt:
        'Four billion non-negative 32-bit integers, 1 GB of memory, find a value that is missing. What is the approach?',
      options: [
        'Sort the file in memory',
        'A bit vector of 2³² bits (512 MB): set a bit per value in one pass, then find a zero',
        'A hash set of every value seen',
        'Sample a million values at random',
      ],
      answerIndex: 1,
      explain:
        'One bit per possible value is 512 MB, which fits. With only 10 MB you would first count values per block, then bit-vector the one block that is short.',
    },
    {
      id: 'sort-8',
      kind: 'technique',
      prompt: 'Sorting an array of strings so that anagrams end up adjacent. What is the key idea?',
      options: [
        'Compare every pair of strings for anagram-ness',
        'Sort each string\'s characters to build a canonical key, then group by it',
        'Sort by string length',
        'Sort alphabetically and scan for neighbours',
      ],
      answerIndex: 1,
      explain:
        'Anagrams share a canonical form, so a hash map keyed on it does in one pass what pairwise comparison does in O(n²).',
    },
    {
      id: 'sort-9',
      kind: 'concept',
      prompt: 'Binary search requires:',
      options: [
        'A sorted array, always',
        'A monotone yes/no test over the range - sortedness is just the common case',
        'Distinct elements',
        'Random access and a known length',
      ],
      answerIndex: 1,
      explain:
        'Anything that is false then true across the range can be bisected: find-peak, minimum feasible capacity, or the partition point in median-of-two-arrays.',
    },
    {
      id: 'sort-10',
      kind: 'technique',
      prompt:
        'Rearranging an array into alternating peaks and valleys. What is the O(n) approach?',
      options: [
        'Sort, then interleave the two halves',
        'At every other index, swap with the larger neighbour - each local fix cannot break the previous pair',
        'Repeatedly find the maximum and place it',
        'Shuffle until the property holds',
      ],
      answerIndex: 1,
      explain:
        'Sorting works but costs O(n log n). The local swap is enough because fixing position i only touches i−1 and i+1, and i−1 stays valid.',
    },
  ],
  drills: [
    { slug: 'binary-search', note: 'Write it with no off-by-one. Then write the first-occurrence variant.' },
    { slug: 'search-in-rotated-sorted-array', note: 'CTCI 10.3 - decide which half is sorted first.' },
    { slug: 'find-minimum-in-rotated-sorted-array', note: 'The same reasoning, looking for the pivot.' },
    { slug: 'group-anagrams', note: 'CTCI 10.2 - a canonical key beats comparing pairs.' },
    { slug: 'merge-intervals', note: 'Sort by start, then sweep. The interval template.' },
    { slug: 'insert-interval', note: 'Same family, without needing the sort.' },
    { slug: 'non-overlapping-intervals', note: 'Greedy by end time - prove why that is optimal.' },
    { slug: 'meeting-rooms', note: 'Sort and check adjacency. Premium.' },
    { slug: 'meeting-rooms-ii', note: 'Sweep line or a heap of end times. Premium.' },
    { slug: 'search-a-2d-matrix-ii', note: 'CTCI 10.9 - start from a corner.' },
    { slug: 'find-peak-element', note: 'Binary search with no sorted array in sight.' },
    { slug: 'search-insert-position', note: 'Lower-bound binary search.' },
    { slug: 'single-element-in-a-sorted-array', note: 'Binary search on parity of indices.' },
    { slug: 'median-of-two-sorted-arrays', note: 'Hard - binary search on the partition point.' },
    { slug: 'sort-an-array', note: 'Implement merge sort and quicksort by hand.' },
    { slug: 'h-index', note: 'Counting sort makes it O(n).' },
    { slug: 'merge-sorted-array', note: 'CTCI 10.1 - fill from the back.' },
    { slug: 'first-missing-positive', note: 'CTCI 10.7 - index-as-hash, O(1) space.' },
    { slug: 'minimum-absolute-difference', note: 'CTCI 16.6 - sort, then a single scan.' },
    { slug: 'maximum-population-year', note: 'CTCI 16.10 - the delta/sweep trick.' },
    { slug: 'count-of-smaller-numbers-after-self', note: 'CTCI 10.10 - augmented BST or merge sort.' },
    { slug: 'wiggle-sort', note: 'CTCI 10.11 - local swaps, no full sort needed. Premium.' },
    { slug: 'search-in-rotated-sorted-array-ii', note: 'The duplicate case that breaks the clean O(log n).' },
  ],
};
