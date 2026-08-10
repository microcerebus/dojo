/**
 * Catalogue of every LeetCode problem referenced by a module drill list.
 *
 * Modules reference problems by slug only, so difficulty/title/Blind-75 status
 * live in exactly one place. `src/data/problems.test.ts` checks the catalogue
 * against the drill lists.
 */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  slug: string;
  title: string;
  difficulty: Difficulty;
  /** Part of the canonical Blind 75 list. */
  blind75: boolean;
  /** Needs a LeetCode Premium subscription to open. */
  premium?: boolean;
}

export const leetcodeUrl = (slug: string) => `https://leetcode.com/problems/${slug}/`;

const p = (
  slug: string,
  title: string,
  difficulty: Difficulty,
  blind75 = false,
  premium = false,
): Problem => ({ slug, title, difficulty, blind75, ...(premium ? { premium } : {}) });

export const PROBLEMS: Problem[] = [
  // ---------------------------------------------------------------- Blind 75
  // Array
  p('two-sum', 'Two Sum', 'Easy', true),
  p('best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'Easy', true),
  p('contains-duplicate', 'Contains Duplicate', 'Easy', true),
  p('product-of-array-except-self', 'Product of Array Except Self', 'Medium', true),
  p('maximum-subarray', 'Maximum Subarray', 'Medium', true),
  p('maximum-product-subarray', 'Maximum Product Subarray', 'Medium', true),
  p(
    'find-minimum-in-rotated-sorted-array',
    'Find Minimum in Rotated Sorted Array',
    'Medium',
    true,
  ),
  p('search-in-rotated-sorted-array', 'Search in Rotated Sorted Array', 'Medium', true),
  p('3sum', '3Sum', 'Medium', true),
  p('container-with-most-water', 'Container With Most Water', 'Medium', true),
  // Binary
  p('sum-of-two-integers', 'Sum of Two Integers', 'Medium', true),
  p('number-of-1-bits', 'Number of 1 Bits', 'Easy', true),
  p('counting-bits', 'Counting Bits', 'Easy', true),
  p('missing-number', 'Missing Number', 'Easy', true),
  p('reverse-bits', 'Reverse Bits', 'Easy', true),
  // Dynamic programming
  p('climbing-stairs', 'Climbing Stairs', 'Easy', true),
  p('coin-change', 'Coin Change', 'Medium', true),
  p('longest-increasing-subsequence', 'Longest Increasing Subsequence', 'Medium', true),
  p('longest-common-subsequence', 'Longest Common Subsequence', 'Medium', true),
  p('word-break', 'Word Break', 'Medium', true),
  p('combination-sum-iv', 'Combination Sum IV', 'Medium', true),
  p('house-robber', 'House Robber', 'Medium', true),
  p('house-robber-ii', 'House Robber II', 'Medium', true),
  p('decode-ways', 'Decode Ways', 'Medium', true),
  p('unique-paths', 'Unique Paths', 'Medium', true),
  p('jump-game', 'Jump Game', 'Medium', true),
  // Graph
  p('clone-graph', 'Clone Graph', 'Medium', true),
  p('course-schedule', 'Course Schedule', 'Medium', true),
  p('pacific-atlantic-water-flow', 'Pacific Atlantic Water Flow', 'Medium', true),
  p('number-of-islands', 'Number of Islands', 'Medium', true),
  p('longest-consecutive-sequence', 'Longest Consecutive Sequence', 'Medium', true),
  p('alien-dictionary', 'Alien Dictionary', 'Hard', true, true),
  p('graph-valid-tree', 'Graph Valid Tree', 'Medium', true, true),
  p(
    'number-of-connected-components-in-an-undirected-graph',
    'Number of Connected Components in an Undirected Graph',
    'Medium',
    true,
    true,
  ),
  // Interval
  p('insert-interval', 'Insert Interval', 'Medium', true),
  p('merge-intervals', 'Merge Intervals', 'Medium', true),
  p('non-overlapping-intervals', 'Non-overlapping Intervals', 'Medium', true),
  p('meeting-rooms', 'Meeting Rooms', 'Easy', true, true),
  p('meeting-rooms-ii', 'Meeting Rooms II', 'Medium', true, true),
  // Linked list
  p('reverse-linked-list', 'Reverse Linked List', 'Easy', true),
  p('linked-list-cycle', 'Linked List Cycle', 'Easy', true),
  p('merge-two-sorted-lists', 'Merge Two Sorted Lists', 'Easy', true),
  p('merge-k-sorted-lists', 'Merge k Sorted Lists', 'Hard', true),
  p('remove-nth-node-from-end-of-list', 'Remove Nth Node From End of List', 'Medium', true),
  p('reorder-list', 'Reorder List', 'Medium', true),
  // Matrix
  p('set-matrix-zeroes', 'Set Matrix Zeroes', 'Medium', true),
  p('spiral-matrix', 'Spiral Matrix', 'Medium', true),
  p('rotate-image', 'Rotate Image', 'Medium', true),
  p('word-search', 'Word Search', 'Medium', true),
  // String
  p(
    'longest-substring-without-repeating-characters',
    'Longest Substring Without Repeating Characters',
    'Medium',
    true,
  ),
  p(
    'longest-repeating-character-replacement',
    'Longest Repeating Character Replacement',
    'Medium',
    true,
  ),
  p('minimum-window-substring', 'Minimum Window Substring', 'Hard', true),
  p('valid-anagram', 'Valid Anagram', 'Easy', true),
  p('group-anagrams', 'Group Anagrams', 'Medium', true),
  p('valid-parentheses', 'Valid Parentheses', 'Easy', true),
  p('valid-palindrome', 'Valid Palindrome', 'Easy', true),
  p('longest-palindromic-substring', 'Longest Palindromic Substring', 'Medium', true),
  p('palindromic-substrings', 'Palindromic Substrings', 'Medium', true),
  p('encode-and-decode-strings', 'Encode and Decode Strings', 'Medium', true, true),
  // Tree
  p('maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree', 'Easy', true),
  p('same-tree', 'Same Tree', 'Easy', true),
  p('invert-binary-tree', 'Invert Binary Tree', 'Easy', true),
  p('binary-tree-maximum-path-sum', 'Binary Tree Maximum Path Sum', 'Hard', true),
  p('binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal', 'Medium', true),
  p(
    'serialize-and-deserialize-binary-tree',
    'Serialize and Deserialize Binary Tree',
    'Hard',
    true,
  ),
  p('subtree-of-another-tree', 'Subtree of Another Tree', 'Easy', true),
  p(
    'construct-binary-tree-from-preorder-and-inorder-traversal',
    'Construct Binary Tree from Preorder and Inorder Traversal',
    'Medium',
    true,
  ),
  p('validate-binary-search-tree', 'Validate Binary Search Tree', 'Medium', true),
  p('kth-smallest-element-in-a-bst', 'Kth Smallest Element in a BST', 'Medium', true),
  p(
    'lowest-common-ancestor-of-a-binary-search-tree',
    'Lowest Common Ancestor of a Binary Search Tree',
    'Medium',
    true,
  ),
  p('implement-trie-prefix-tree', 'Implement Trie (Prefix Tree)', 'Medium', true),
  p(
    'design-add-and-search-words-data-structure',
    'Design Add and Search Words Data Structure',
    'Medium',
    true,
  ),
  p('word-search-ii', 'Word Search II', 'Hard', true),
  // Heap
  p('top-k-frequent-elements', 'Top K Frequent Elements', 'Medium', true),
  p('find-median-from-data-stream', 'Find Median from Data Stream', 'Hard', true),

  // ----------------------------------------------------------- Supplemental
  // Big O
  p('fibonacci-number', 'Fibonacci Number', 'Easy'),
  p('sqrtx', 'Sqrt(x)', 'Easy'),
  p('majority-element', 'Majority Element', 'Easy'),
  p('search-a-2d-matrix', 'Search a 2D Matrix', 'Medium'),
  p('range-sum-query-immutable', 'Range Sum Query - Immutable', 'Easy'),
  // Technical questions / method
  p('sort-colors', 'Sort Colors', 'Medium'),
  p('find-the-duplicate-number', 'Find the Duplicate Number', 'Medium'),
  p('insert-delete-getrandom-o1', 'Insert Delete GetRandom O(1)', 'Medium'),
  p('kth-largest-element-in-an-array', 'Kth Largest Element in an Array', 'Medium'),
  p('string-to-integer-atoi', 'String to Integer (atoi)', 'Medium'),
  p('roman-to-integer', 'Roman to Integer', 'Easy'),
  // Arrays and strings
  p('move-zeroes', 'Move Zeroes', 'Easy'),
  p(
    'two-sum-ii-input-array-is-sorted',
    'Two Sum II - Input Array Is Sorted',
    'Medium',
  ),
  p('valid-palindrome-ii', 'Valid Palindrome II', 'Easy'),
  p('find-all-anagrams-in-a-string', 'Find All Anagrams in a String', 'Medium'),
  p('string-compression', 'String Compression', 'Medium'),
  p('rotate-array', 'Rotate Array', 'Medium'),
  p('longest-common-prefix', 'Longest Common Prefix', 'Easy'),
  p('is-subsequence', 'Is Subsequence', 'Easy'),
  p('repeated-substring-pattern', 'Repeated Substring Pattern', 'Easy'),
  // Linked lists
  p('middle-of-the-linked-list', 'Middle of the Linked List', 'Easy'),
  p('palindrome-linked-list', 'Palindrome Linked List', 'Easy'),
  p(
    'intersection-of-two-linked-lists',
    'Intersection of Two Linked Lists',
    'Easy',
  ),
  p('linked-list-cycle-ii', 'Linked List Cycle II', 'Medium'),
  p('add-two-numbers', 'Add Two Numbers', 'Medium'),
  p('copy-list-with-random-pointer', 'Copy List with Random Pointer', 'Medium'),
  p('partition-list', 'Partition List', 'Medium'),
  p('swap-nodes-in-pairs', 'Swap Nodes in Pairs', 'Medium'),
  p('odd-even-linked-list', 'Odd Even Linked List', 'Medium'),
  p('delete-node-in-a-linked-list', 'Delete Node in a Linked List', 'Medium'),
  // Stacks and queues
  p('min-stack', 'Min Stack', 'Medium'),
  p('implement-queue-using-stacks', 'Implement Queue using Stacks', 'Easy'),
  p('implement-stack-using-queues', 'Implement Stack using Queues', 'Easy'),
  p('daily-temperatures', 'Daily Temperatures', 'Medium'),
  p(
    'evaluate-reverse-polish-notation',
    'Evaluate Reverse Polish Notation',
    'Medium',
  ),
  p('next-greater-element-i', 'Next Greater Element I', 'Easy'),
  p('asteroid-collision', 'Asteroid Collision', 'Medium'),
  p('design-circular-queue', 'Design Circular Queue', 'Medium'),
  p('basic-calculator-ii', 'Basic Calculator II', 'Medium'),
  p('largest-rectangle-in-histogram', 'Largest Rectangle in Histogram', 'Hard'),
  // Trees and graphs
  p('binary-tree-inorder-traversal', 'Binary Tree Inorder Traversal', 'Easy'),
  p('balanced-binary-tree', 'Balanced Binary Tree', 'Easy'),
  p('diameter-of-binary-tree', 'Diameter of Binary Tree', 'Easy'),
  p('path-sum-iii', 'Path Sum III', 'Medium'),
  p(
    'lowest-common-ancestor-of-a-binary-tree',
    'Lowest Common Ancestor of a Binary Tree',
    'Medium',
  ),
  p('binary-tree-right-side-view', 'Binary Tree Right Side View', 'Medium'),
  p('rotting-oranges', 'Rotting Oranges', 'Medium'),
  p('inorder-successor-in-bst', 'Inorder Successor in BST', 'Medium', false, true),
  p(
    'convert-sorted-array-to-binary-search-tree',
    'Convert Sorted Array to Binary Search Tree',
    'Easy',
  ),
  // Heaps and tries
  p('last-stone-weight', 'Last Stone Weight', 'Easy'),
  p('k-closest-points-to-origin', 'K Closest Points to Origin', 'Medium'),
  p('task-scheduler', 'Task Scheduler', 'Medium'),
  p('kth-largest-element-in-a-stream', 'Kth Largest Element in a Stream', 'Easy'),
  p('design-twitter', 'Design Twitter', 'Medium'),
  // Recursion, backtracking and DP
  p('subsets', 'Subsets', 'Medium'),
  p('permutations', 'Permutations', 'Medium'),
  p('combination-sum', 'Combination Sum', 'Medium'),
  p('generate-parentheses', 'Generate Parentheses', 'Medium'),
  p('n-queens', 'N-Queens', 'Hard'),
  p(
    'letter-combinations-of-a-phone-number',
    'Letter Combinations of a Phone Number',
    'Medium',
  ),
  p('unique-paths-ii', 'Unique Paths II', 'Medium'),
  p('edit-distance', 'Edit Distance', 'Medium'),
  p('partition-equal-subset-sum', 'Partition Equal Subset Sum', 'Medium'),
  p('min-cost-climbing-stairs', 'Min Cost Climbing Stairs', 'Easy'),
  p('flood-fill', 'Flood Fill', 'Easy'),
  p('target-sum', 'Target Sum', 'Medium'),
  // Sorting and searching
  p('binary-search', 'Binary Search', 'Easy'),
  p('search-a-2d-matrix-ii', 'Search a 2D Matrix II', 'Medium'),
  p('find-peak-element', 'Find Peak Element', 'Medium'),
  p('sort-an-array', 'Sort an Array', 'Medium'),
  p('search-insert-position', 'Search Insert Position', 'Easy'),
  p(
    'single-element-in-a-sorted-array',
    'Single Element in a Sorted Array',
    'Medium',
  ),
  p('median-of-two-sorted-arrays', 'Median of Two Sorted Arrays', 'Hard'),
  p('h-index', 'H-Index', 'Medium'),
  // Bit manipulation
  p('single-number', 'Single Number', 'Easy'),
  p('power-of-two', 'Power of Two', 'Easy'),
  p('single-number-ii', 'Single Number II', 'Medium'),
  p(
    'bitwise-and-of-numbers-range',
    'Bitwise AND of Numbers Range',
    'Medium',
  ),
  p('add-binary', 'Add Binary', 'Easy'),
  // Math and logic
  p('happy-number', 'Happy Number', 'Easy'),
  p('count-primes', 'Count Primes', 'Medium'),
  p('factorial-trailing-zeroes', 'Factorial Trailing Zeroes', 'Medium'),
  p('excel-sheet-column-number', 'Excel Sheet Column Number', 'Easy'),
  p('powx-n', 'Pow(x, n)', 'Medium'),
  p('implement-rand10-using-rand7', 'Implement Rand10() Using Rand7()', 'Medium'),
  p('random-pick-with-weight', 'Random Pick with Weight', 'Medium'),
  // Object-oriented design
  p('design-parking-system', 'Design Parking System', 'Easy'),
  p('design-underground-system', 'Design Underground System', 'Medium'),
  p('design-hashmap', 'Design HashMap', 'Easy'),
  p('design-browser-history', 'Design Browser History', 'Medium'),
  p('design-circular-deque', 'Design Circular Deque', 'Medium'),
  // System design and scalability
  p('encode-and-decode-tinyurl', 'Encode and Decode TinyURL', 'Medium'),
  p('lfu-cache', 'LFU Cache', 'Hard'),
  p('design-hit-counter', 'Design Hit Counter', 'Medium', false, true),
  p('web-crawler-multithreaded', 'Web Crawler Multithreaded', 'Medium', false, true),
  p(
    'design-in-memory-file-system',
    'Design In-Memory File System',
    'Hard',
    false,
    true,
  ),
  // Testing
  p('first-bad-version', 'First Bad Version', 'Easy'),
  p('valid-number', 'Valid Number', 'Hard'),
  p('guess-number-higher-or-lower', 'Guess Number Higher or Lower', 'Easy'),
  p(
    'find-the-index-of-the-first-occurrence-in-a-string',
    'Find the Index of the First Occurrence in a String',
    'Easy',
  ),
  // Moderate mixed
  p(
    'shortest-unsorted-continuous-subarray',
    'Shortest Unsorted Continuous Subarray',
    'Medium',
  ),
  p('lru-cache', 'LRU Cache', 'Medium'),
  p('max-points-on-a-line', 'Max Points on a Line', 'Hard'),
  p('integer-to-english-words', 'Integer to English Words', 'Hard'),
  p('game-of-life', 'Game of Life', 'Medium'),
  // Hard mixed
  p('trapping-rain-water', 'Trapping Rain Water', 'Hard'),
  p('maximal-rectangle', 'Maximal Rectangle', 'Hard'),
  p('sliding-window-maximum', 'Sliding Window Maximum', 'Hard'),
  p('concatenated-words', 'Concatenated Words', 'Hard'),
  p('word-ladder', 'Word Ladder', 'Hard'),
  p('majority-element-ii', 'Majority Element II', 'Medium'),
  // Advanced topics
  p('network-delay-time', 'Network Delay Time', 'Medium'),
  p(
    'cheapest-flights-within-k-stops',
    'Cheapest Flights Within K Stops',
    'Medium',
  ),
  p('longest-duplicate-substring', 'Longest Duplicate Substring', 'Hard'),
  p('course-schedule-ii', 'Course Schedule II', 'Medium'),
  p('redundant-connection', 'Redundant Connection', 'Medium'),
  p('path-with-maximum-probability', 'Path with Maximum Probability', 'Medium'),
  // C and C++
  p('reverse-string', 'Reverse String', 'Easy'),
  p('reverse-words-in-a-string', 'Reverse Words in a String', 'Medium'),
  // Java
  p('sort-list', 'Sort List', 'Medium'),
  p('design-hashset', 'Design HashSet', 'Easy'),
  // Databases (LeetCode SQL track)
  p('combine-two-tables', 'Combine Two Tables', 'Easy'),
  p(
    'employees-earning-more-than-their-managers',
    'Employees Earning More Than Their Managers',
    'Easy',
  ),
  p('duplicate-emails', 'Duplicate Emails', 'Easy'),
  p('department-highest-salary', 'Department Highest Salary', 'Medium'),
  p('rank-scores', 'Rank Scores', 'Medium'),
  p('second-highest-salary', 'Second Highest Salary', 'Medium'),
  // Threads and locks (LeetCode concurrency track)
  p('print-in-order', 'Print in Order', 'Easy'),
  p('print-foobar-alternately', 'Print FooBar Alternately', 'Medium'),
  p('fizz-buzz-multithreaded', 'Fizz Buzz Multithreaded', 'Medium'),
  p('building-h2o', 'Building H2O', 'Medium'),
  p('the-dining-philosophers', 'The Dining Philosophers', 'Medium'),

  // ------------------------------- Closest equivalents for book questions
  // These are the LeetCode problems that mirror a specific CTCI question and
  // are drilled in the module that teaches that question's technique.
  p('merge-sorted-array', 'Merge Sorted Array', 'Easy'),
  p('first-missing-positive', 'First Missing Positive', 'Hard'),
  p('search-in-rotated-sorted-array-ii', 'Search in Rotated Sorted Array II', 'Medium'),
  p('minimum-absolute-difference', 'Minimum Absolute Difference', 'Easy'),
  p('maximum-population-year', 'Maximum Population Year', 'Easy'),
  p(
    'count-of-smaller-numbers-after-self',
    'Count of Smaller Numbers After Self',
    'Hard',
  ),
  p('wiggle-sort', 'Wiggle Sort', 'Medium', false, true),
  p('find-if-path-exists-in-graph', 'Find if Path Exists in Graph', 'Easy'),
  p('accounts-merge', 'Accounts Merge', 'Medium'),
  p('max-area-of-island', 'Max Area of Island', 'Medium'),
  p(
    'convert-binary-search-tree-to-sorted-doubly-linked-list',
    'Convert BST to Sorted Doubly Linked List',
    'Medium',
    false,
    true,
  ),
  p('ugly-number-ii', 'Ugly Number II', 'Medium'),
  p('stream-of-characters', 'Stream of Characters', 'Hard'),
  p('coin-change-ii', 'Coin Change II', 'Medium'),
  p('permutations-ii', 'Permutations II', 'Medium'),
  p('russian-doll-envelopes', 'Russian Doll Envelopes', 'Hard'),
  p(
    'different-ways-to-add-parentheses',
    'Different Ways to Add Parentheses',
    'Medium',
  ),
  p('fixed-point', 'Fixed Point', 'Easy', false, true),
  p('largest-1-bordered-square', 'Largest 1-Bordered Square', 'Medium'),
  p(
    'max-sum-of-rectangle-no-larger-than-k',
    'Max Sum of Rectangle No Larger Than K',
    'Hard',
  ),
  p('hamming-distance', 'Hamming Distance', 'Easy'),
  p('max-consecutive-ones-iii', 'Max Consecutive Ones III', 'Medium'),
  p('divide-two-integers', 'Divide Two Integers', 'Medium'),
  p('water-and-jug-problem', 'Water and Jug Problem', 'Medium'),
  p('super-egg-drop', 'Super Egg Drop', 'Hard'),
  p('bulb-switcher', 'Bulb Switcher', 'Medium'),
  p('poor-pigs', 'Poor Pigs', 'Hard'),
  p('shuffle-an-array', 'Shuffle an Array', 'Medium'),
  p('linked-list-random-node', 'Linked List Random Node', 'Medium'),
  p('number-of-digit-one', 'Number of Digit One', 'Hard'),
  p('set-mismatch', 'Set Mismatch', 'Easy'),
  p('valid-tic-tac-toe-state', 'Valid Tic-Tac-Toe State', 'Medium'),
  p('bulls-and-cows', 'Bulls and Cows', 'Medium'),
  p('word-pattern', 'Word Pattern', 'Easy'),
  p('fair-candy-swap', 'Fair Candy Swap', 'Easy'),
  p('top-k-frequent-words', 'Top K Frequent Words', 'Medium'),
  p('contiguous-array', 'Contiguous Array', 'Medium'),
  p('shortest-word-distance-ii', 'Shortest Word Distance II', 'Medium', false, true),
  p('minesweeper', 'Minesweeper', 'Medium'),
  p('swap-salary', 'Swap Salary', 'Easy'),
];

const bySlug = new Map(PROBLEMS.map((problem) => [problem.slug, problem]));

export function getProblem(slug: string): Problem | undefined {
  return bySlug.get(slug);
}

export const BLIND_75 = PROBLEMS.filter((problem) => problem.blind75);
