import type { CourseModule } from '../../types';
import { visualgoUrl } from '../../../data/visualgo';

export const heapsTries: CourseModule = {
  id: 'heaps-tries',
  title: 'Heaps & Tries',
  track: 'core',
  status: 'complete',
  source: 'Chapter 4 (heaps and tries)',
  summary:
    'Two structures that turn hard problems easy: heaps for "top k" and streaming order, tries for prefix work.',
  estimatedMinutes: 50,
  concepts: [
    'Min-heap and max-heap as complete binary trees stored in an array',
    'Array index arithmetic: children at 2i+1 and 2i+2, parent at (i−1)/2',
    'Insert then bubble up; extract-min then bubble down - both O(log n)',
    'Peek is O(1); building a heap from an array is O(n), not O(n log n)',
    'A heap gives you the extreme, never the sorted order - use it when you only need the top',
    'Top-k with a heap of size k: O(n log k) time and O(k) space',
    'Two heaps balanced around the centre for a streaming median',
    'Heaps for merging k sorted sequences',
    'Tries: prefix trees where each edge is a character and each node marks whether a word ends there',
    'Trie lookup is O(length of the key), independent of how many words are stored',
    'Tries answer "is this a valid prefix?" - which is what makes them prune backtracking so well',
    'Space cost of a trie, and the child-map vs fixed-array tradeoff',
    'Tries for multi-pattern search and for word-grid problems',
  ],
  sections: [
    {
      id: 'heap-shape',
      title: 'A heap is an array wearing a tree costume',
      takeaway: 'Complete binary tree, no pointers, and only one guarantee: the root is the extreme.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A min-heap is a *complete* binary tree - every level full except possibly the last, which fills left to right - in which every node is smaller than both of its children. A max-heap is the same with the comparison flipped. That is the entire definition, and it is deliberately weak.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'What a heap does not promise',
          text: 'A heap is not sorted. It does not tell you the second smallest element without work, it cannot search for an arbitrary value faster than O(n), and reading the array left to right gives you nothing useful. It promises one thing: the extreme is at index 0.',
        },
        {
          kind: 'p',
          text: 'Because the tree is complete, it has no holes - so it can be laid out level by level in a flat array, and the parent/child links become arithmetic instead of pointers. That is why a heap is the cheapest priority queue there is.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'The only three formulas you need',
          code: `const left   = (i: number) => 2 * i + 1;
const right  = (i: number) => 2 * i + 2;
const parent = (i: number) => (i - 1) >> 1;   // floor((i - 1) / 2)

// heap[0] is the minimum. heap.length is the size. There is no other state.`,
        },
        {
          kind: 'table',
          headers: ['Operation', 'Cost', 'Why'],
          rows: [
            ['Peek the minimum', 'O(1)', 'It is index 0.'],
            ['Insert', 'O(log n)', 'One comparison per level on the path to the root.'],
            ['Extract the minimum', 'O(log n)', 'One comparison pair per level on the way down.'],
            ['Build from an unsorted array', 'O(n)', 'Sift down from the middle backwards - most nodes are near the bottom and barely move.'],
            ['Find an arbitrary value', 'O(n)', 'There is no ordering to search by. Use a map alongside if you need this.'],
            ['Delete an arbitrary value', 'O(log n) *given its index*', 'Finding the index is the expensive half.'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Build-heap really is O(n)',
          text: 'Inserting n items one at a time is O(n log n). Heapifying an existing array is O(n), because only the single root can sift log n levels while half the nodes are leaves that cannot move at all. It is a nice thing to be able to justify out loud.',
        },
        {
          kind: 'p',
          text: 'In an interview you will normally say "priority queue" and use the library one. Know which way round it defaults - most, including Java\'s `PriorityQueue`, are min-heaps - and know that you turn a min-heap into a max-heap by inverting the comparator or by pushing negated values.',
        },
      ],
    },
    {
      id: 'heap-operations',
      title: 'Bubble up, sink down',
      takeaway: 'Both operations restore the property along a single root-to-leaf path.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Both operations work the same way: put the element somewhere that keeps the tree complete, then walk it along one path until the property holds again. Nothing else in the heap ever moves.',
        },
        { kind: 'anim', animId: 'ht-heap-ops' },
        {
          kind: 'steps',
          items: [
            '**Insert.** Append to the end of the array - the only spot that keeps the tree complete - then swap with the parent while the parent is larger. At most one swap per level.',
            '**Extract-min.** The answer is index 0. Move the *last* element into the root so the tree stays complete, then swap it down with its **smaller** child while a child is smaller than it.',
          ],
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Sift down - the half people get wrong',
          code: `function siftDown(heap: number[], i: number) {
  for (;;) {
    let smallest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < heap.length && heap[l] < heap[smallest]) smallest = l;
    if (r < heap.length && heap[r] < heap[smallest]) smallest = r;
    if (smallest === i) return;                 // property restored
    [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
    i = smallest;
  }
}`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Swap with the smaller child',
          text: 'There is no ordering between siblings, so you must compare against both and take the smaller. Swapping with the larger child promotes it above its own sibling and breaks the heap one level down - and it breaks it quietly, in a way small test cases miss.',
        },
        {
          kind: 'bullets',
          items: [
            'Both operations touch one path, so both are O(log n) on a heap of n elements - the tree is complete, so its height is always ⌊log₂ n⌋.',
            'Everything is in place: no allocation per operation, and excellent cache behaviour compared with a pointer tree.',
            'A tie between a node and a child needs no swap. `<` rather than `<=` in the comparison keeps the operation stable-ish and avoids pointless work.',
          ],
        },
      ],
    },
    {
      id: 'top-k-and-streams',
      title: 'What heaps are actually for',
      takeaway: 'When you need the extreme repeatedly, or the top k, or the middle of a stream.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Recognising a heap problem is easier than implementing one. The signal is that you need an *extreme* over and over while the set keeps changing - "next smallest", "largest so far", "k best" - and you never need the full order.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The top-k inversion',
          text: 'For the k *largest* values keep a **min**-heap of size k. Its root is the weakest thing you have kept, so a new value only needs one comparison to be dismissed. O(n log k) time and O(k) space, against O(n log n) and O(n) for sorting - and it works on a stream, where sorting cannot.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'k largest from a stream, in O(k) space',
          code: `function topK(values: Iterable<number>, k: number): MinHeap {
  const heap = new MinHeap(); // holds the k best seen so far
  for (const value of values) {
    if (heap.size < k) heap.push(value);
    else if (value > heap.peek()) {  // beats the weakest survivor
      heap.pop();
      heap.push(value);
    }
  }
  return heap;
}`,
        },
        {
          kind: 'table',
          headers: ['Approach', 'Time', 'Notes'],
          rows: [
            ['Sort, take k', 'O(n log n)', 'Fine when n is small or you need the k in order anyway.'],
            ['Heap of size k', 'O(n log k)', 'The streaming answer. O(k) space; never holds the whole input.'],
            ['Quickselect', 'O(n) expected', 'Fastest on an array you may reorder, but O(n²) worst case and it needs the whole input up front.'],
            ['Counting / bucket sort', 'O(n)', 'Only when the values or frequencies are bounded small integers - e.g. top-k frequent elements.'],
          ],
        },
        {
          kind: 'p',
          text: '**Merging k sorted sequences** is the other canonical use. Push the head of each sequence into a min-heap; repeatedly pop the smallest and push that sequence\'s next element. The heap never exceeds k entries, giving O(n log k) rather than the O(nk) of scanning all k heads each time.',
        },
        {
          kind: 'p',
          text: 'A **streaming median** needs both flavours at once. Keep the smaller half in a max-heap and the larger half in a min-heap, sized to differ by at most one. The two roots are the two middle values.',
        },
        { kind: 'anim', animId: 'ht-two-heaps' },
        {
          kind: 'bullets',
          items: [
            'Insert, then rebalance by moving at most one element across. O(log n) per value.',
            'Let one heap deliberately hold the extra element on an odd count - then its root *is* the median and there is no case analysis at read time.',
            'Reading the median is O(1). That asymmetry - expensive to update, free to query - is the whole reason for the structure.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Generating in order',
          text: 'A heap also generates sequences in sorted order without ever sorting: for the kth number whose only prime factors are 3, 5 and 7, pop the smallest, push it multiplied by each factor, and skip duplicates. Three queues do the same job with no heap and no duplicate check - a good tradeoff to be able to name.',
        },
      ],
    },
    {
      id: 'tries',
      title: 'Tries',
      takeaway: 'A tree over characters. Lookup costs the length of the key, not the size of the dictionary.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A trie (prefix tree) stores a set of strings by their characters. Each edge is one character, so each path from the root spells a prefix, and shared prefixes are stored exactly once. It is an n-ary tree where n is the alphabet size.',
        },
        { kind: 'anim', animId: 'ht-trie-build' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Mark where words end',
          text: 'Reaching a node only proves the path is a prefix of something. A boolean flag on the node - or a dedicated terminator child - is what distinguishes a stored word from a prefix. Without it, storing "cart" would make "car" look like a word.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'The whole structure',
          code: `class TrieNode {
  children = new Map<string, TrieNode>();
  isWord = false;
}

function insert(root: TrieNode, word: string) {
  let node = root;
  for (const ch of word) {
    if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
    node = node.children.get(ch) as TrieNode;
  }
  node.isWord = true;
}

/** Returns the node the prefix ends at, or null if the prefix is dead. */
function walk(root: TrieNode, prefix: string): TrieNode | null {
  let node: TrieNode | null = root;
  for (const ch of prefix) {
    node = node.children.get(ch) ?? null;
    if (!node) return null;
  }
  return node;
}`,
        },
        {
          kind: 'p',
          text: 'The runtime is worth stating precisely, because the usual comparison is sloppy. Looking a word up in a trie is O(K) for a key of length K. A hash table is *also* O(K), because hashing has to read every character - "O(1) lookup" quietly ignores the key length. The trie\'s real advantage is a different question entirely.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The question only a trie answers',
          text: '"Is this string a prefix of any word I know?" A hash table of words cannot answer that without trying every extension. A trie answers it by walking K pointers and looking at whether the node exists. Every use of a trie in this chapter comes back to that.',
        },
        {
          kind: 'table',
          headers: ['Child storage', 'Cost', 'Use when'],
          rows: [
            ['Fixed array of 26', 'Fast, one indexed lookup, but 26 slots per node even if one is used', 'Small known alphabet, dense dictionary, speed matters'],
            ['Hash map char → node', 'Pays only for the children that exist', 'Unicode, sparse branches, or memory pressure'],
          ],
        },
        {
          kind: 'bullets',
          items: [
            'Space is the trie\'s weakness: a node per character across all *distinct* prefixes. Words that share nothing share nothing.',
            'Insertion is O(K) and, like lookup, does not depend on how many words are already stored.',
            'A trie also gives you every word with a given prefix for free - walk to the prefix node, then collect the subtree below it. That is autocomplete.',
            'When you probe related prefixes in sequence - `M`, then `MA`, then `MAN` - carry the current node down the recursion instead of restarting at the root. Each extra character then costs one hop.',
          ],
        },
      ],
    },
    {
      id: 'trie-pruning',
      title: 'Tries as pruners',
      takeaway: 'The trie usually is not the answer. It is the thing that tells the search to stop.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The strongest use of a trie is not storage, it is *early termination*. A backtracking search that builds a string one character at a time can ask the trie, at every step, whether the string so far can still become a word. When the answer is no, the entire subtree of continuations is dead and never explored.',
        },
        { kind: 'anim', animId: 'ht-trie-prune' },
        {
          kind: 'p',
          text: 'That is the shape of word-search-on-a-grid: DFS from every cell, extending the path, cutting the branch the moment the prefix leaves the trie. Two refinements are worth naming: build the trie from the *dictionary* rather than the grid, and pass the current trie node into the recursion so each step is one map lookup rather than a fresh root-down walk.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Prune the trie as you go',
          text: 'Once a word has been found, unflag it; once a trie node has no children and is not a word, delete it from its parent. The trie shrinks as the search proceeds, which both dedupes the results and speeds up everything after it.',
        },
        {
          kind: 'p',
          text: 'Two more families use the same idea:',
        },
        {
          kind: 'bullets',
          items: [
            '**Searching one long text for many patterns.** Naively it is O(b) per pattern. Instead build a trie of every *suffix* of the text and look each pattern up in it - or build a trie of the patterns and slide it along the text. Either way you handle all the patterns in one structure instead of one pass each.',
            '**Splitting a string into dictionary words.** "Is this word made of other words?" is a recursion over split points, and the trie both proposes the splits and kills doomed prefixes early. Memoise on the suffix you are trying to split - the same suffix recurs constantly.',
            '**Building words under two constraints at once.** In a word rectangle, every row must be a word and so must every column. After each row you check whether all the partial columns are still valid prefixes, and abandon the whole rectangle the moment one is not.',
            '**Keypad mapping.** T9 turns a digit sequence into words - either a trie descended one digit at a time (following every letter a digit could be), or a precomputed map from digit string to word list, which is faster if the dictionary is fixed.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Do not reach for a trie by reflex',
          text: 'If the problem only ever asks "is this exact string in the set?", a hash set is simpler, smaller and just as fast. The trie earns its space only when you need prefixes, ordering by prefix, or pruning.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'ht-1',
      kind: 'concept',
      prompt: 'In a min-heap stored in an array, where are the children of index i?',
      options: ['i−1 and i+1', '2i and 2i+1', '2i+1 and 2i+2', 'i/2 and i/2+1'],
      answerIndex: 2,
      explain:
        'With a 0-based array, children are 2i+1 and 2i+2 and the parent is ⌊(i−1)/2⌋. The tree is complete, so nothing is wasted.',
    },
    {
      id: 'ht-2',
      kind: 'concept',
      prompt: 'Which of these does a min-heap give you cheaply?',
      options: [
        'The elements in sorted order',
        'The minimum, in O(1)',
        'Whether an arbitrary value is present, in O(log n)',
        'The second smallest element, in O(1)',
      ],
      answerIndex: 1,
      explain:
        'Only the extreme is guaranteed. Searching is O(n), and the second smallest is one of the root\'s two children - not a fixed slot.',
    },
    {
      id: 'ht-3',
      kind: 'technique',
      prompt: 'To keep the k largest values from a stream of n numbers, which heap do you keep?',
      options: [
        'A max-heap of size k',
        'A min-heap of size k',
        'A max-heap of size n',
        'A min-heap of size n',
      ],
      answerIndex: 1,
      explain:
        'A min-heap of size k puts the weakest survivor on top, so a new value is accepted or dismissed in one comparison. O(n log k) time, O(k) space.',
    },
    {
      id: 'ht-4',
      kind: 'complexity',
      prompt: 'Building a heap from an existing unsorted array of n elements costs:',
      options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'],
      answerIndex: 0,
      explain:
        'Sift down from the middle backwards: half the nodes are leaves that cannot move, and only the root can travel log n levels.',
    },
    {
      id: 'ht-5',
      kind: 'technique',
      prompt: 'Maintaining the median of a stream. What is the standard structure?',
      options: [
        'One min-heap of everything',
        'A max-heap of the lower half and a min-heap of the upper half, kept within one element of each other',
        'A sorted array with binary-search insertion',
        'A trie of the values',
      ],
      answerIndex: 1,
      explain:
        'The two roots straddle the middle: add in O(log n), read the median in O(1). Sorted insertion is O(n) per value.',
    },
    {
      id: 'ht-6',
      kind: 'complexity',
      prompt: 'Looking up a word of length K in a trie holding W words costs:',
      options: ['O(W)', 'O(K)', 'O(log W)', 'O(K log W)'],
      answerIndex: 1,
      explain:
        'One hop per character, regardless of dictionary size. A hash table is also O(K) - it must read every character to hash it.',
    },
    {
      id: 'ht-7',
      kind: 'concept',
      prompt: 'What can a trie do that a hash set of the same words cannot?',
      options: [
        'Answer exact-membership queries faster',
        'Tell you whether a string is a prefix of some stored word',
        'Store the words in less memory',
        'Handle duplicate words',
      ],
      answerIndex: 1,
      explain:
        'Prefix queries are the reason tries exist, and they are what lets a trie cut a backtracking search off early.',
    },
    {
      id: 'ht-8',
      kind: 'technique',
      prompt: 'Why does a trie speed up word search on a letter grid so much?',
      options: [
        'It makes the final dictionary check O(1)',
        'It lets the DFS abandon a path as soon as the prefix cannot become any word, cutting the whole subtree of continuations',
        'It removes the need for a visited set',
        'It orders the grid cells so the search visits promising ones first',
      ],
      answerIndex: 1,
      explain:
        'The saving is in paths never walked. Checking the dictionary only at the end means exploring every doomed branch to its full length.',
    },
    {
      id: 'ht-9',
      kind: 'complexity',
      prompt: 'Merging k sorted lists with n elements in total, using a heap:',
      options: ['O(nk)', 'O(n log k)', 'O(n log n)', 'O(k log n)'],
      answerIndex: 1,
      explain:
        'The heap holds one head per list, so it never exceeds k. Each of the n elements enters and leaves once, at O(log k) each.',
    },
    {
      id: 'ht-10',
      kind: 'technique',
      prompt:
        'When sift-down moves an element past its children, which child do you swap it with, and why?',
      options: [
        'The left child, for consistency',
        'The smaller child, or the swap would leave that child above its own sibling',
        'Either - siblings are ordered, so it makes no difference',
        'The one that keeps the tree complete',
      ],
      answerIndex: 1,
      explain:
        'Siblings have no ordering between them. Promoting the larger one restores the property at this node while breaking it one level down.',
    },
  ],
  drills: [
    { slug: 'top-k-frequent-elements', note: 'Count with a map, then a heap of size k (or bucket sort for O(n)).' },
    { slug: 'find-median-from-data-stream', note: 'CTCI 17.20 - the two-heap answer.' },
    { slug: 'merge-k-sorted-lists', note: 'The heap solution: O(n log k).' },
    { slug: 'implement-trie-prefix-tree', note: 'Build it from scratch once.' },
    { slug: 'design-add-and-search-words-data-structure', note: 'Trie plus wildcard recursion.' },
    { slug: 'word-search-ii', note: 'CTCI 17.25-adjacent - trie-pruned backtracking on a grid.' },
    { slug: 'last-stone-weight', note: 'The simplest possible max-heap loop.' },
    { slug: 'k-closest-points-to-origin', note: 'Heap of size k, or quickselect.' },
    { slug: 'task-scheduler', note: 'Greedy with counts - a heap makes it obvious.' },
    { slug: 'kth-largest-element-in-a-stream', note: 'A min-heap of size k, maintained online.' },
    { slug: 'design-twitter', note: 'Merging k feeds with a heap.' },
    { slug: 'ugly-number-ii', note: 'CTCI 17.9 - generate in order with a heap or three queues.' },
    { slug: 'concatenated-words', note: 'CTCI 17.15 - trie plus memoised splitting.' },
    { slug: 'stream-of-characters', note: 'CTCI 17.17 - multi-pattern search with a suffix trie.' },
    { slug: 'letter-combinations-of-a-phone-number', note: 'CTCI 16.20 - the T9 mapping.' },
  ],
  visualizers: [
    {
      url: visualgoUrl('heap'),
      note: 'Insert and extract-min repeatedly and watch bubble-up/bubble-down move array indices, not pointers.',
    },
  ],
};
