import type { CourseModule } from '../../types';

export const arraysStrings: CourseModule = {
  id: 'arrays-strings',
  title: 'Arrays & Strings',
  track: 'core',
  status: 'complete',
  source: 'Chapter 1',
  summary:
    'Hash maps, resizable arrays, two pointers, sliding windows and in-place matrix work - the base layer everything else builds on.',
  estimatedMinutes: 60,
  concepts: [
    'Hash tables: hash code, bucket index, chaining, and why lookup is O(1) on average and O(n) at worst',
    'Balanced-BST maps as the ordered alternative to hashing',
    'Fixed vs resizable arrays and amortised O(1) append',
    'Immutable strings, the quadratic concatenation trap, and string builders',
    'Two-pointer scans: converging, fast/slow, and one pointer per input',
    'Writing in place from the end of a buffer to avoid shifting',
    'Sliding windows over strings and arrays',
    'Character-count invariants and permutation tests',
    'Palindrome permutation: at most one odd count',
    'One-edit-away comparison with a single scan',
    'Run-length encoding and when compression is not worth returning',
    'Layer-by-layer in-place matrix rotation',
    'Row/column marking for zeroing a matrix without cascading',
    'Reducing rotation checks to one substring search on a doubled string',
  ],
  sections: [
    {
      id: 'hash-tables',
      title: 'Hash tables',
      takeaway: 'The single most useful structure in interviews. Know how it works inside.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A hash table maps keys to values in constant average time. The classic implementation is an array of buckets, each holding a small linked list.',
        },
        {
          kind: 'steps',
          items: [
            'Compute a hash code from the key - an integer, usually much larger than the table.',
            'Map it to a slot: `hash(key) % bucketCount`.',
            'Store the key *and* the value in that bucket. The key must be stored too, because two different keys can land in the same bucket.',
          ],
        },
        {
          kind: 'p',
          text: 'Lookup repeats the same steps and then walks the bucket comparing keys. Collisions are normal, not errors: there are infinitely many possible keys and finitely many slots.',
        },
        { kind: 'anim', animId: 'as-hash-buckets' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The complexity, stated properly',
          text: 'O(1) average for insert, lookup and delete. O(n) worst case, when every key collides into one bucket. The average holds because a good hash spreads keys and the table resizes to keep chains short.',
        },
        {
          kind: 'p',
          text: 'The alternative implementation is a balanced binary search tree, giving O(log n) lookup. You give up speed and gain two things: less memory (no large sparse array) and the ability to iterate keys in sorted order. That is the difference between a JavaScript `Map` and a sorted structure, or between `HashMap` and `TreeMap`.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'In JS/TS',
          text: 'Use `Map` and `Set`, not plain objects, when keys are dynamic: `Map` accepts any key type, preserves insertion order, has a real `.size`, and has no prototype keys to collide with. Objects coerce every key to a string.',
        },
        {
          kind: 'p',
          text: 'Three questions should immediately make you reach for one: "have I seen this before?" (Set), "how many times?" (Map to count), "where was it?" (Map to index or list of indices).',
        },
      ],
    },
    {
      id: 'arrays',
      title: 'Arrays that grow',
      takeaway: 'Append is O(1) amortised; inserting at the front is not.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A fixed array has its size set at creation. A resizable array - JS `Array`, Java `ArrayList`, C++ `vector` - keeps a backing block with spare capacity, and when it fills up it allocates a bigger block (typically double) and copies everything across.',
        },
        {
          kind: 'p',
          text: 'That copy is O(n), but it happens rarely enough that appending n elements costs O(n) in total: the copies are n/2 + n/4 + n/8 + … which sums to just under n. So append is O(1) amortised, with random access still O(1).',
        },
        {
          kind: 'table',
          caption: 'JavaScript array operations worth knowing cold',
          headers: ['Operation', 'Cost', 'Note'],
          rows: [
            ['`arr[i]`', 'O(1)', 'the reason arrays beat linked lists for indexing'],
            ['`push` / `pop`', 'O(1) amortised', 'the fast end'],
            ['`shift` / `unshift`', 'O(n)', 'every element moves - never do this in a loop'],
            ['`includes` / `indexOf`', 'O(n)', 'inside a loop this is your O(n²)'],
            ['`slice` / `concat` / `[...arr]`', 'O(n)', 'copies; inside a loop it is O(n²)'],
            ['`splice`', 'O(n)', 'shifts the tail'],
            ['`sort`', 'O(n log n)', 'comparison sort'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Queue smell',
          text: 'If you find yourself calling `shift()` to consume a queue, you have written an O(n²) loop. Keep a head index, or use a real deque.',
        },
      ],
    },
    {
      id: 'strings',
      title: 'Strings are immutable',
      takeaway: 'Build with an array and join once. Never with += in a loop.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'In JavaScript, Java, Python and C#, strings cannot be modified in place. Every concatenation allocates a new string and copies both sides into it.',
        },
        {
          kind: 'p',
          text: 'Concatenating n pieces of length x in a loop copies x, then 2x, then 3x… which is O(x·n²) characters. The fix is a builder: push the pieces into an array and join at the end, for O(x·n).',
        },
        { kind: 'anim', animId: 'as-string-building' },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'The only string-building pattern you need',
          code: `// O(n²) characters copied
let out = '';
for (const piece of pieces) out += piece;

// O(n) - one allocation at the end
const parts: string[] = [];
for (const piece of pieces) parts.push(piece);
const out2 = parts.join('');`,
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Say this in the interview',
          text: 'Mentioning that you are using a builder "so the concatenation does not go quadratic" is a cheap, visible complexity point. Interviewers notice it.',
        },
        {
          kind: 'p',
          text: 'The same reasoning applies to in-place character work: if you need to mutate, convert to an array of characters once, mutate that, and join at the end.',
        },
      ],
    },
    {
      id: 'two-pointers',
      title: 'Two pointers',
      takeaway: 'One index is a scan; two indices are an algorithm.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A huge fraction of array and string problems collapse once you use two indices instead of one. Three shapes cover almost all of them.',
        },
        {
          kind: 'bullets',
          items: [
            '**Converging** - `lo` at the start, `hi` at the end, moving towards each other. Needs a rule that lets you discard one end: sortedness, or a symmetry like palindromes.',
            '**Fast and slow** - both move forward at different rates, or one lags the other by a fixed gap. Used for midpoints, kth-from-end, and cycle detection.',
            '**One pointer per input** - two sorted arrays walked together, each advancing only when its value is behind. This is the merge step of merge sort.',
          ],
        },
        { kind: 'anim', animId: 'as-two-pointers' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Why converging pointers are correct',
          text: 'Each comparison eliminates an entire row or column of the brute-force pair grid. On a sorted array, if `a[lo] + a[hi]` is too small, no partner smaller than `a[hi]` can save `a[lo]` - so `a[lo]` is finished. That argument is the proof, and it is what the interviewer wants to hear.',
        },
        {
          kind: 'p',
          text: 'The other essential pointer trick is writing backwards. To replace every space in a character buffer with `%20`, going left to right forces you to shift the tail on every replacement - O(n²). Count the spaces first, compute the final length, then copy from the end backwards: every character is written exactly once, in place, in O(n).',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Generalise it',
          text: 'Whenever an in-place edit makes the data longer, fill from the back. Whenever it makes the data shorter, fill from the front. Either way you never overwrite something you still need.',
        },
      ],
    },
    {
      id: 'sliding-window',
      title: 'Sliding windows',
      takeaway: 'Grow on the right, shrink on the left, never restart.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A sliding window is a converging-pointer variant for "best contiguous run with property P". Both pointers only ever move forward, so each element enters and leaves the window at most once - O(n) total, no matter how much the window moves.',
        },
        { kind: 'anim', animId: 'as-sliding-window' },
        {
          kind: 'steps',
          items: [
            'Extend `hi` by one and update the window state (a count map, a sum, a set).',
            'While the window violates the property, advance `lo` and undo its contribution.',
            'The window is now valid - record it if it beats the best so far.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The common bug',
          text: 'When you jump `lo` forwards using a remembered index, check that the index is still inside the current window. A stale position from before `lo` must be ignored, or the window shrinks backwards.',
        },
        {
          kind: 'p',
          text: 'Fixed-size windows are simpler still: slide by one, add the entering element, remove the leaving one. That is how you find every anagram of a short string inside a long one in O(b) instead of generating permutations.',
        },
      ],
    },
    {
      id: 'counting',
      title: 'Counting and invariants',
      takeaway: 'Most string questions are really questions about character counts.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Reframing a string problem as a counting problem usually removes a whole layer of complexity.',
        },
        {
          kind: 'table',
          headers: ['Question', 'The counting reframe'],
          rows: [
            ['All characters unique?', 'Any count > 1, or a set whose size differs from the length'],
            ['Are these permutations of each other?', 'Identical count maps (and, first, identical lengths)'],
            [
              'Can the letters form a palindrome?',
              'At most one character has an odd count - the middle one',
            ],
            ['Are these one edit apart?', 'Lengths differ by at most 1, and one scan finds at most one mismatch'],
            ['Compress runs', 'Count each run and only return the compressed form if it is shorter'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'The no-extra-space follow-up',
          text: '"Now do it without a data structure." For a fixed alphabet you can pack presence into a single integer as a bit vector - one bit per letter, tested with `&` and set with `|`. Otherwise, sorting first gives O(n log n) time and O(1) extra space.',
        },
        {
          kind: 'p',
          text: 'Two details that catch people out. Ask what the character set is - 128 ASCII, 256 extended, or full Unicode changes both the array size and whether an array is viable at all. And for the one-edit check, handle replace and insert in the same loop: compare characters, and on the first mismatch advance only the longer string if the lengths differ, otherwise advance both.',
        },
        {
          kind: 'p',
          text: 'For compression, build with an array and join - and check the length before returning, because "aabb" compresses to "a2b2", which is not shorter. A neat optimisation is to compute the compressed length first and bail out early if it will not help.',
        },
      ],
    },
    {
      id: 'matrices',
      title: 'Matrices and clever reductions',
      takeaway: 'Work in layers, mark before you mutate, and look for the one-line reduction.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Rotating an n×n matrix 90° in place is done one concentric layer at a time. Within a layer, four cells form a cycle: top goes to right, right to bottom, bottom to left, left to top - held together by a single temporary.',
        },
        { kind: 'anim', animId: 'as-rotate-matrix' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Index carefully',
          text: 'For a layer with bounds `first` and `last`, and offset `i − first`, the four positions are `[first][i]`, `[last−offset][first]`, `[last][last−offset]` and `[i][last]`. Write them on the board before coding - this is where the bugs live.',
        },
        {
          kind: 'p',
          text: 'Zeroing a matrix has a different trap. If an element is 0, its whole row and column become 0 - but if you zero them as you go, the new zeroes trigger more zeroing and the whole matrix collapses. Two passes fix it: first record which rows and columns contain a zero, then apply. That is O(m+n) extra space, or O(1) if you reuse the first row and column as the marker storage.',
        },
        {
          kind: 'p',
          text: 'Finally, keep an eye out for reductions that make the problem disappear. To check whether `s2` is a rotation of `s1` with a single substring search: every rotation of `s1` appears inside `s1 + s1`. So the answer is `s1.length === s2.length && (s1 + s1).includes(s2)`.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Recognise the shape',
          text: 'A problem that restricts you to one call of some primitive is telling you a reduction exists. Ask what larger object makes the answer obvious - here, the doubled string.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'as-1',
      kind: 'complexity',
      prompt: 'What is the average and worst-case lookup cost of a chained hash table?',
      options: [
        'O(1) average, O(1) worst',
        'O(1) average, O(n) worst',
        'O(log n) average, O(n) worst',
        'O(n) average, O(n) worst',
      ],
      answerIndex: 1,
      explain:
        'If every key collides into one bucket you are walking a linked list - the average only holds with a good hash and short chains.',
    },
    {
      id: 'as-2',
      kind: 'complexity',
      prompt: 'How many characters does this copy for n pieces of length x?',
      context: `let s = '';
for (const piece of pieces) s += piece;`,
      options: ['O(x · n)', 'O(x · n²)', 'O(n log n)', 'O(x + n)'],
      answerIndex: 1,
      explain:
        'Copy x, then 2x, then 3x… summing to x·n(n+1)/2. Push into an array and join for O(x·n).',
    },
    {
      id: 'as-3',
      kind: 'technique',
      prompt:
        'You must replace every space in a character buffer with "%20", in place, with room already at the end. What is the key move?',
      options: [
        'Shift the tail right on each replacement',
        'Count the spaces, then write backwards from the end',
        'Build a new string and copy it back',
        'Sort the characters first',
      ],
      answerIndex: 1,
      explain:
        'Writing backwards means every character is written once - O(n) instead of the O(n²) you get from shifting.',
    },
    {
      id: 'as-4',
      kind: 'concept',
      prompt: 'A string can be rearranged into a palindrome exactly when:',
      options: [
        'Every character count is even',
        'At most one character count is odd',
        'The string has odd length',
        'Its first and last characters match',
      ],
      answerIndex: 1,
      explain: 'Every character pairs off around the centre; a single odd count can sit in the middle.',
    },
    {
      id: 'as-5',
      kind: 'complexity',
      prompt:
        'Longest substring without repeating characters, solved with a sliding window and a map of last-seen indices. Time?',
      options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(n · k) where k is the alphabet size'],
      answerIndex: 2,
      explain:
        'Both pointers only move forward, so each index enters and leaves the window at most once.',
    },
    {
      id: 'as-6',
      kind: 'technique',
      prompt:
        'Given a *sorted* array, find whether two elements sum to a target, in O(1) extra space. Which technique?',
      options: [
        'Hash set of complements',
        'Converging two pointers from both ends',
        'Binary search for each element',
        'Sliding window',
      ],
      answerIndex: 1,
      explain:
        'The hash set is O(n) space. Converging pointers exploit the sortedness for O(n) time and O(1) space.',
    },
    {
      id: 'as-7',
      kind: 'technique',
      prompt:
        'Zeroing rows and columns of a matrix that contain a zero. Why must you not zero as you scan?',
      options: [
        'It is slower',
        'The zeroes you write are indistinguishable from original zeroes, so they cascade',
        'It uses more memory',
        'It only works on square matrices',
      ],
      answerIndex: 1,
      explain:
        'You cannot tell your own writes from the input. Record which rows and columns are affected first, then apply.',
    },
    {
      id: 'as-8',
      kind: 'technique',
      prompt: 'Check whether s2 is a rotation of s1 using exactly one substring search:',
      options: [
        'Search for s2 inside s1',
        'Search for s2 inside s1 + s1, after checking the lengths match',
        'Sort both and compare',
        'Compare character counts',
      ],
      answerIndex: 1,
      explain:
        'Every rotation of s1 appears in the doubled string. The length check is required - without it, short strings match spuriously.',
    },
    {
      id: 'as-9',
      kind: 'complexity',
      prompt: 'Rotating an n×n matrix 90° in place, layer by layer. Time and space?',
      options: [
        'O(n²) time, O(1) space',
        'O(n²) time, O(n²) space',
        'O(n) time, O(1) space',
        'O(n log n) time, O(n) space',
      ],
      answerIndex: 0,
      explain:
        'Every one of the n² cells is written exactly once, and only a single temporary is needed.',
    },
    {
      id: 'as-10',
      kind: 'technique',
      prompt:
        'You need to decide whether all characters in a string are unique, with no extra data structures and a fixed lowercase alphabet. Best approach?',
      options: [
        'Nested loops comparing every pair',
        'A single integer used as a bit vector, one bit per letter',
        'Sort the string first',
        'Convert to a Set and compare sizes',
      ],
      answerIndex: 1,
      explain:
        'A bit vector gives O(n) time with a single integer of state - exactly what "no data structures" is fishing for.',
    },
  ],
  drills: [
    { slug: 'contains-duplicate', note: 'Set vs sort. The warm-up for the whole chapter.' },
    { slug: 'valid-anagram', note: 'CTCI 1.2 - count map, and discuss the Unicode follow-up.' },
    { slug: 'two-sum', note: 'The hash-map complement pattern. Do it without looking.' },
    { slug: 'valid-palindrome', note: 'Converging pointers with filtering. Watch the edge cases.' },
    {
      slug: 'longest-substring-without-repeating-characters',
      note: 'The canonical sliding window. Guard the stale-index bug.',
    },
    { slug: 'product-of-array-except-self', note: 'Prefix and suffix passes, no division.' },
    { slug: 'best-time-to-buy-and-sell-stock', note: 'One pass tracking the running minimum.' },
    { slug: 'container-with-most-water', note: 'Converging pointers - prove why you move the shorter side.' },
    { slug: '3sum', note: 'Sort, then a converging pair inside a loop. Duplicate handling is the hard part.' },
    { slug: 'longest-consecutive-sequence', note: 'A hash set turns an O(n log n) sort into O(n).' },
    {
      slug: 'longest-repeating-character-replacement',
      note: 'Sliding window where the validity test uses the most frequent character.',
    },
    { slug: 'minimum-window-substring', note: 'Hard, but it is the sliding window in full generality.' },
    { slug: 'longest-palindromic-substring', note: 'Expand around each of the 2n−1 centres.' },
    { slug: 'palindromic-substrings', note: 'Same expansion, counting instead of measuring.' },
    { slug: 'encode-and-decode-strings', note: 'Length-prefix encoding. A clarify-the-spec problem.' },
    { slug: 'rotate-image', note: 'CTCI 1.7 exactly - in place, layer by layer.' },
    { slug: 'set-matrix-zeroes', note: 'CTCI 1.8 - mark first, then apply. Try the O(1) space version.' },
    { slug: 'spiral-matrix', note: 'Boundary bookkeeping. Test on non-square inputs.' },
    { slug: 'move-zeroes', note: 'Slow/fast write pointer, in place.' },
    { slug: 'two-sum-ii-input-array-is-sorted', note: 'The sorted version - two pointers, O(1) space.' },
    { slug: 'valid-palindrome-ii', note: 'Two pointers with one allowed deletion.' },
    { slug: 'find-all-anagrams-in-a-string', note: 'Fixed-size window with a count map.' },
    { slug: 'string-compression', note: 'CTCI 1.6 - in place, and only if it is shorter.' },
    { slug: 'rotate-array', note: 'The reverse-three-times trick gives O(1) space.' },
    { slug: 'longest-common-prefix', note: 'Simple, but a good warm-up for careful edge cases.' },
    { slug: 'is-subsequence', note: 'One pointer per input.' },
    { slug: 'repeated-substring-pattern', note: 'The doubled-string trick from CTCI 1.9, in another disguise.' },
  ],
};
