import type { CourseModule } from '../../types';
import { visualgoUrl } from '../../../data/visualgo';

export const treesGraphs: CourseModule = {
  id: 'trees-graphs',
  title: 'Trees & Graphs',
  track: 'core',
  status: 'complete',
  source: 'Chapter 4',
  summary:
    'Tree shapes, the three traversals, BFS vs DFS, and the graph problems that hide inside tree questions.',
  estimatedMinutes: 90,
  concepts: [
    'Tree vocabulary: root, child, leaf, no cycles - and that a tree is a kind of graph',
    'Binary tree vs binary search tree, and clarifying which one you have been given',
    'Complete, full and perfect trees, and the node counts that follow',
    'Balanced vs unbalanced, and why "balanced" only promises O(log n), not perfection',
    'In-order, pre-order and post-order traversal, and what each is used for',
    'Adjacency list vs adjacency matrix, and when the matrix is worth the O(V²) space',
    'Directed vs undirected graphs; connected components; forests',
    'DFS: recursive or explicit stack, low memory, goes deep, good for exhaustive search',
    'BFS: queue-based, finds shortest unweighted paths, good for "closest" questions',
    'Bidirectional search and why it shrinks the frontier so dramatically',
    'Visited sets, and that graphs need them where trees do not',
    'Building a minimum-height BST from sorted data by repeatedly taking the middle',
    'Validating a BST with min/max bounds rather than local comparisons',
    'Height propagation for balance checks in a single pass',
    'In-order successor with and without parent pointers',
    'Topological sort and cycle detection for dependency ordering',
    'Lowest common ancestor, with and without parent links',
    'Subtree matching, including the string-serialisation trick',
    'Prefix sums along a root-to-node path for path-sum counting',
    'Uniform random selection from a mutable tree using subtree sizes',
  ],
  sections: [
    {
      id: 'tree-shapes',
      title: 'What kind of tree is it?',
      takeaway:
        'Five words - binary, search, complete, full, balanced - that all mean different things.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A tree is a connected graph with no cycles. Every node has one parent except the root, which has none, and a node with no children is a leaf. That is the whole definition - everything else in this chapter is a *restriction* on top of it, and the restrictions are what interviewers leave unsaid.',
        },
        {
          kind: 'table',
          headers: ['Term', 'What it actually promises'],
          rows: [
            ['Binary tree', 'At most two children per node. Nothing about ordering.'],
            [
              'Binary search tree',
              'Binary, plus: *all* left descendants ≤ node < *all* right descendants.',
            ],
            [
              'Complete',
              'Every level filled except possibly the last, which fills left to right. This is what lets a heap live in an array.',
            ],
            ['Full', 'Every node has zero or two children. No only-children.'],
            ['Perfect', 'Full *and* complete: exactly 2ᵏ − 1 nodes, all leaves on the last level.'],
            [
              'Balanced',
              'Height is O(log n). That is all - it does not mean the halves are equal.',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The single most common wrong assumption',
          text: 'Candidates hear "tree" and code a BST. Ask. A binary tree with no ordering rules out binary search, in-order sortedness, and half the shortcuts you were about to take.',
        },
        {
          kind: 'p',
          text: 'The ordering condition has to hold for *every descendant*, not just the immediate children. A node can be larger than its left child and smaller than its right child and still be in the wrong place - that is the trap the validation section is built around.',
        },
        {
          kind: 'bullets',
          items: [
            '**Duplicates** - some definitions forbid them, some put them on the right, some allow either side. Ask, because it changes the comparison operator.',
            '**Not all trees are binary.** A trie over the alphabet is 26-ary; a phone-number tree is 10-ary. If the branching is over an alphabet, think trie, not binary tree.',
            '**"Balanced" is a promise about height, not shape.** Red-black and AVL trees are the standard self-balancing implementations; you should know they exist and that they buy O(log n) insert and find, not how to rotate them.',
            '**Perfect trees are vanishingly rare.** Do not let your code depend on one, and do not draw one as your only test case - the bugs live in the lopsided trees.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Height is the whole complexity story',
          text: 'Almost every tree algorithm here is O(n) time and O(h) space, where h is the height. Balanced means h = log n. Degenerate - a tree that is really a linked list - means h = n, and your "O(log n)" recursion is now O(n) stack.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'The node you will be handed - sometimes with a parent pointer, sometimes not',
          code: `class TreeNode {
  value: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  parent?: TreeNode | null; // ask - it changes several answers
  constructor(value: number) {
    this.value = value;
  }
}`,
        },
      ],
    },
    {
      id: 'traversals',
      title: 'The traversals',
      takeaway: 'Three DFS orders and one BFS order. Pick the one whose output *is* your answer.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'All three depth-first traversals are the same three lines in a different order. Where you put the visit relative to the two recursive calls is the entire difference.',
        },
        { kind: 'anim', animId: 'tg-traversals' },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'One function, three positions for `visit`',
          code: `function walk(node: TreeNode | null, visit: (n: TreeNode) => void) {
  if (!node) return;
  // visit(node);            <- pre-order
  walk(node.left, visit);
  // visit(node);            <- in-order
  walk(node.right, visit);
  // visit(node);            <- post-order
}`,
        },
        {
          kind: 'table',
          headers: ['Order', 'Sequence', 'Reach for it when'],
          rows: [
            [
              'In-order',
              'left, node, right',
              "You want a BST's values in sorted order: kth smallest, validation, BST → sorted list.",
            ],
            [
              'Pre-order',
              'node, left, right',
              'You want to copy or serialise: the root comes out first, so you can rebuild top-down.',
            ],
            [
              'Post-order',
              'left, right, node',
              "A node's answer depends on its children: heights, deletion, folding subtree results upward.",
            ],
            [
              'Level order (BFS)',
              'by depth, left to right',
              'The question mentions levels, depth, or "closest": list of depths, right-side view, minimum depth.',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Level order does not require a queue',
          text: 'Grouping nodes by depth is usually done with BFS, but a pre-order walk that carries `level` as a parameter and appends into `lists[level]` works just as well and is shorter. Both are O(n) time; the recursive one adds O(h) stack, which is dwarfed by the O(n) output either way.',
        },
        {
          kind: 'p',
          text: 'When you do use a queue, record the queue size before you start draining a level. That count is exactly one level, and it is what separates "level order traversal" from "list of nodes in some order".',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Level boundaries from the queue length',
          code: `function levels(root: TreeNode | null): number[][] {
  const out: number[][] = [];
  const queue = root ? [root] : [];
  while (queue.length) {
    const width = queue.length; // freeze it: the loop below grows the queue
    const level: number[] = [];
    for (let i = 0; i < width; i++) {
      const node = queue.shift() as TreeNode;
      level.push(node.value);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    out.push(level);
  }
  return out;
}`,
        },
        {
          kind: 'bullets',
          items: [
            '**Iterative in-order** uses an explicit stack: push the whole left spine, pop and visit, then move to the right child and repeat. Worth being able to write - it is the honest answer to "do it without recursion".',
            '**Two traversals rebuild a tree, one does not.** Pre-order gives you the root; in-order tells you how many nodes are on each side of it. Either alone is ambiguous.',
            '**Unless you record the nulls.** A pre-order traversal *with* null markers is unique, which is what makes `serialize`/`deserialize` work with a single sequence.',
          ],
        },
      ],
    },
    {
      id: 'bst-work',
      title: 'Working with a BST',
      takeaway:
        'The ordering is free information. Bounds beat local comparisons; the middle element beats insertion.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Given sorted data, the minimal-height BST is built by taking the middle element as the root and recursing on the two halves. Inserting the values one at a time reaches the same shape but costs O(n log n) and a lot of pointer walking; slicing the array is O(n) and is three lines.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Minimal-height BST from sorted input - O(n)',
          code: `function build(values: number[], lo = 0, hi = values.length - 1): TreeNode | null {
  if (hi < lo) return null;
  const mid = (lo + hi) >> 1;
  const node = new TreeNode(values[mid]);
  node.left = build(values, lo, mid - 1);
  node.right = build(values, mid + 1, hi);
  return node;
}`,
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'This is where off-by-ones live',
          text: 'Test the empty array, one element, two elements. `hi < lo` rather than `hi <= lo` is the base case, and `mid - 1` / `mid + 1` must exclude the middle from both halves or you will loop forever.',
        },
        {
          kind: 'p',
          text: 'Validation is the other classic, and the naive version is wrong in a way that passes every small test you draw. Checking `left < node < right` at each node individually does not enforce the property, because the property is about *all* descendants.',
        },
        { kind: 'anim', animId: 'tg-bst-bounds' },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Validation by narrowing bounds - O(n) time, O(h) space',
          code: `function isBST(node: TreeNode | null, min = -Infinity, max = Infinity): boolean {
  if (!node) return true;
  if (node.value <= min || node.value > max) return false;
  return (
    isBST(node.left, min, node.value) &&   // going left tightens the max
    isBST(node.right, node.value, max)     // going right tightens the min
  );
}`,
        },
        {
          kind: 'bullets',
          items: [
            'The **in-order alternative** works too: walk in order and check every value beats the previous one. Keep only the previous value, not an array - you never use anything else.',
            'It has one weakness: with duplicates allowed, in-order cannot distinguish a legal tree from an illegal one, since both produce the same sequence. Bounds can.',
            '**kth smallest** falls straight out of in-order: stop after k nodes. Augmenting each node with its subtree size turns it into O(h).',
          ],
        },
        {
          kind: 'p',
          text: 'The **in-order successor** is the next value in sorted order, and it splits into two cases. If the node has a right subtree, the answer is the leftmost node of that subtree. If it does not, walk up through parent pointers until you step up from a *left* child - that parent is the successor. Walking all the way to the root without ever being a left child means the node was the maximum, so there is no successor.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'In-order successor with parent pointers',
          code: `function successor(node: TreeNode): TreeNode | null {
  if (node.right) {
    let n = node.right;
    while (n.left) n = n.left;
    return n;
  }
  let child = node;
  let parent = node.parent ?? null;
  while (parent && parent.left !== child) {
    child = parent;
    parent = parent.parent ?? null;
  }
  return parent; // null if we ran off the top
}`,
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Without parent pointers',
          text: 'Do a normal BST descent from the root, remembering the last node where you turned left. That node is the successor - the search path itself carries the answer.',
        },
        {
          kind: 'p',
          text: "Two more BST questions worth recognising. **Which insertion orders produce this tree?** The root must have gone in first; after that the left and right subtrees are independent, so the answer is every *weave* of the two subtrees' sequences, prefixed by the root - a merge that preserves relative order within each side. And **converting a BST into a sorted doubly linked list in place** is just an in-order traversal that relinks `left` as `prev` and `right` as `next` as it goes.",
        },
      ],
    },
    {
      id: 'tree-recursion',
      title: 'Recursion patterns that solve most tree questions',
      takeaway: 'Return one thing, track another. Nearly every hard tree problem is that shape.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The recurring move in this chapter: a recursive call returns the value its *parent* needs, while a variable outside the recursion accumulates the answer. Getting these two confused is why people write O(n log n) or O(n²) solutions to O(n) problems.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Balance in one pass',
          text: "The obvious balance check computes each subtree's height from scratch at every node - that is O(n log n), because every node is re-measured once per ancestor. Instead have the height function *also* report failure: return the height when balanced and a sentinel (−∞, or null) the moment any subtree is not. One pass, O(n).",
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Height and balance in the same recursion',
          code: `const UNBALANCED = -Infinity;

function height(node: TreeNode | null): number {
  if (!node) return -1;
  const left = height(node.left);
  if (left === UNBALANCED) return UNBALANCED;   // pass the failure up
  const right = height(node.right);
  if (right === UNBALANCED) return UNBALANCED;
  if (Math.abs(left - right) > 1) return UNBALANCED;
  return Math.max(left, right) + 1;
}

const isBalanced = (root: TreeNode | null) => height(root) !== UNBALANCED;`,
        },
        {
          kind: 'p',
          text: '**Diameter** and **maximum path sum** are the same trick with a different accumulator: the recursion returns the best path going *down* from this node, and a variable outside it records the best path *through* this node (left + node + right). Return one, track the other.',
        },
        {
          kind: 'p',
          text: '**Lowest common ancestor** has one answer per set of tools you are given:',
        },
        {
          kind: 'table',
          headers: ['You have', 'Approach', 'Cost'],
          rows: [
            [
              'A BST',
              'Descend from the root; the first node that sits between the two values is the answer.',
              'O(h)',
            ],
            [
              'Parent pointers',
              'Equalise the two depths, then walk up in lockstep - identical to linked-list intersection.',
              'O(h)',
            ],
            [
              'Neither',
              'Recurse; return the node if it is one of the targets, otherwise the non-null child result, or the node itself if both children returned non-null.',
              'O(n)',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The bug everyone ships',
          text: 'The recursive LCA returns a target node when only that one target is in the tree - which is indistinguishable from "one is the ancestor of the other". If the problem does not guarantee both nodes exist, either return a (node, foundBoth) pair or confirm both are present in a first pass.',
        },
        {
          kind: 'p',
          text: '**Subtree matching** ("is T2 inside T1?") also has two answers worth naming. Serialise both with pre-order *including null markers* and ask whether one string contains the other: O(n + m) time, but O(n + m) memory, which matters when T1 has millions of nodes. Or walk T1 and, at every node whose value equals T2\'s root, compare the subtrees node by node. That is O(n + km) where k is the number of value matches, with only O(log n + log m) extra space - usually the better trade.',
        },
        {
          kind: 'p',
          text: '**Counting downward paths that sum to a target** is the prefix-sum trick from arrays, applied to a root-to-node path. Carry a running sum, and keep a map from running sum to how many times it has occurred on the current path. At each node, `runningSum − target` looked up in the map is the number of paths ending here.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Path sums in O(n) - note the undo on the way out',
          code: `function countPaths(node: TreeNode | null, target: number, sum = 0, seen = new Map([[0, 1]])): number {
  if (!node) return 0;
  sum += node.value;
  let total = seen.get(sum - target) ?? 0;

  seen.set(sum, (seen.get(sum) ?? 0) + 1);
  total += countPaths(node.left, target, sum, seen);
  total += countPaths(node.right, target, sum, seen);
  seen.set(sum, (seen.get(sum) as number) - 1); // leaving this path - undo

  return total;
}`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Backtrack the map',
          text: 'Without the decrement on the way out, a sum recorded in the left subtree stays visible while you search the right subtree, and you will count paths that bend sideways. The brute force - try every start node - is O(n log n) on a balanced tree and O(n²) on a degenerate one.',
        },
        {
          kind: 'p',
          text: 'Last pattern: **uniform random selection from a tree you own**. Store a subtree size in every node and maintain it on insert and delete. Then pick a random index in [0, size) and descend: if the index is below the left size go left; if it equals the left size return this node; otherwise go right after subtracting `leftSize + 1`. Every node comes back with probability 1/n, in O(h) time and one random call.',
        },
      ],
    },
    {
      id: 'graph-shapes',
      title: 'Graphs, and how you are given one',
      takeaway:
        'A tree is a graph with the interesting parts removed. Everything else needs a visited set.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A graph is nodes plus edges between some of them. Trees are the special case that is connected and acyclic. Drop "acyclic" and you need a visited set; drop "connected" and one search no longer reaches everything.',
        },
        {
          kind: 'bullets',
          items: [
            '**Directed or undirected** - one-way street or two-way. In an undirected adjacency list, every edge is stored twice.',
            '**Cyclic or acyclic** - a directed acyclic graph (DAG) is what makes topological sorting possible.',
            '**Connected or not** - connected means you can get from any node to any other. Otherwise the graph has several *components*, and you must loop over all nodes, starting a fresh search from each one you have not visited.',
            '**Forest** - a graph that is acyclic but not connected: a set of trees.',
          ],
        },
        {
          kind: 'table',
          headers: ['', 'Adjacency list', 'Adjacency matrix'],
          rows: [
            ['Space', 'O(V + E)', 'O(V²) always'],
            ["Iterate a node's neighbours", 'O(degree)', 'O(V) - you scan the whole row'],
            ['"Is there an edge u→v?"', 'O(degree)', 'O(1)'],
            [
              'Best for',
              'Sparse graphs, which is nearly all of them',
              'Dense graphs, or when edge lookup dominates',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The default is an adjacency list',
          text: 'A hash map from node to array of neighbours is enough; you rarely need a Graph class. Reach for a matrix only when the graph is dense or the algorithm asks "is there an edge here?" far more often than "who are my neighbours?".',
        },
        {
          kind: 'p',
          text: 'Unlike a tree, you cannot hold a graph by one node - there may be no node that reaches every other. That is why graph problems hand you a *list* of nodes, and why "count the components" is a loop over that list rather than a single traversal.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Grids are graphs',
          text: 'Islands, flood fill, rotting oranges, water flow: a cell is a node and its four (or eight) neighbours are its edges. You never build the adjacency list - you compute neighbours from the coordinates, and the visited set is often the grid itself, overwritten in place. Recognising this converts a "matrix problem" into a search you already know.',
        },
        {
          kind: 'p',
          text: 'Two shortcuts worth having ready. **Union-find** answers "are these two in the same component?" and merges components in near-constant time, which is often cleaner than repeated DFS for connectivity and equivalence-class questions such as merging accounts by shared email. And a **valid tree check** on an undirected graph is two conditions at once: exactly n − 1 edges, and connected. Either alone is not enough.',
        },
      ],
    },
    {
      id: 'graph-search',
      title: 'DFS, BFS, and choosing between them',
      takeaway: 'Same code, different container. The container decides what the answer means.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Depth-first search follows one branch as far as it goes before backing up. Breadth-first search finishes everything at distance 1, then everything at distance 2. DFS is naturally recursive; BFS is not, and expecting it to be is the single most common implementation mistake in this chapter. BFS needs a queue.',
        },
        { kind: 'anim', animId: 'tg-bfs-dfs' },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Both searches, side by side',
          code: `function dfs(node: Node, seen = new Set<Node>()) {
  if (seen.has(node)) return;
  seen.add(node);          // mark on entry, before recursing
  visit(node);
  for (const next of node.neighbours) dfs(next, seen);
}

function bfs(start: Node) {
  const seen = new Set([start]);
  const queue: Node[] = [start];
  while (queue.length) {
    const node = queue.shift() as Node;
    visit(node);
    for (const next of node.neighbours) {
      if (seen.has(next)) continue;
      seen.add(next);      // mark on enqueue, not on dequeue
      queue.push(next);
    }
  }
}`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Mark when you enqueue',
          text: 'Marking a node visited only when it comes *off* the queue lets the same node be enqueued several times before it is processed. It still terminates, but the queue can blow up to O(E) and you will do duplicate work.',
        },
        {
          kind: 'table',
          headers: ['', 'DFS', 'BFS'],
          rows: [
            ['Container', 'Call stack or explicit stack', 'Queue'],
            ['Memory', 'O(h) - the current path', 'O(width) - a whole level, which can be O(V)'],
            ['Finds shortest unweighted path', 'No', 'Yes'],
            [
              'Good for',
              'Visit everything, backtracking, cycle detection, topological order',
              'Closest / fewest steps / level-by-level',
            ],
            ['Watch out for', 'Stack overflow on deep graphs', 'Memory on wide graphs'],
          ],
        },
        {
          kind: 'p',
          text: 'The intuition that sticks: to find a chain of friendships between two people, DFS wanders off through friends-of-friends-of-friends and may cross the world before noticing they were connected directly. BFS stays close to the start, so if a short path exists it finds it early - and it finds the *shortest* one.',
        },
        {
          kind: 'bullets',
          items: [
            'Both are O(V + E). The choice is about what the answer means, not raw speed.',
            'Trees do not need a visited set - there is exactly one path to each node. Graphs do, always, or a cycle turns into an infinite loop.',
            '**Multi-source BFS** - seed the queue with every start node before the loop - answers "how far is each cell from the nearest X?" in one pass. That is the rotting-oranges shape.',
            'Search from the *answer* when it shrinks the work. "Which cells drain to both oceans?" is brutal forwards and easy backwards from the edges.',
          ],
        },
        {
          kind: 'p',
          text: 'When you know both endpoints, you can do better than one BFS. **Bidirectional search** runs two breadth-first searches, one forwards from the source and one backwards from the target, and stops when the frontiers touch.',
        },
        { kind: 'anim', animId: 'tg-bidirectional' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Why it is a square root, not a constant factor',
          text: 'With branching factor k and a shortest path of length d, one search explores about kᵈ nodes. Two searches each go d/2 levels, so together about 2·kᵈᐟ² - and (kᵈᐟ²)² = kᵈ. Same budget, paths twice as long. The catch: you need a known target and the ability to follow edges backwards.',
        },
      ],
    },
    {
      id: 'dependency-order',
      title: 'Topological sort and cycle detection',
      takeaway:
        'Build what is waiting on nothing, delete its arrows, repeat. Failure to finish *is* the cycle test.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Given projects and "a must be built before b" pairs, produce a build order or report that none exists. Draw it as a directed graph, decide once which way the arrows point, and label your diagram - half the mistakes here are reversed edges.',
        },
        {
          kind: 'p',
          text: 'The derivation is short. Something has to go first, and it cannot depend on anything, so start with the nodes that have no incoming edges. Once they are built, nothing that depended on them is blocked by them any more - so delete their outgoing edges and look again.',
        },
        { kind: 'anim', animId: 'tg-toposort' },
        {
          kind: 'steps',
          items: [
            "Count each node's indegree - the number of dependencies it is waiting on.",
            'Put every node with indegree 0 into a queue.',
            'Pop a node, append it to the order, and decrement the indegree of each node it points at. Any that reach 0 join the queue.',
            'Repeat until the queue is empty. If the order is shorter than the node count, the leftovers form a cycle and there is no valid build order.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Cycle detection is free',
          text: 'You do not add a cycle check - you notice that the queue emptied with work left over. Every remaining node is waiting on another remaining node, which is exactly what a cycle is. O(V + E), same as the sort.',
        },
        {
          kind: 'p',
          text: "There is a DFS formulation too: recurse, and *after* a node's children are all finished, push it onto a stack. Reading the stack top-down gives a valid order, because a node is only pushed once everything that must follow it is already there.",
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The DFS version needs three states, not two',
          text: 'Visited/unvisited is not enough. You need *in progress* as well: meeting a node that is currently on the recursion stack means you have looped back into your own path, which is a cycle. Meeting a fully finished node is fine - it just means someone else already handled it.',
        },
        {
          kind: 'bullets',
          items: [
            'The order is usually not unique. Any node with no remaining dependencies may go next, so "wrong" answers that satisfy every constraint are correct - say so rather than chasing one specific output.',
            'Isolated nodes with no edges in either direction still belong in the order. Forgetting them is a common miss.',
            'Course schedules, package installs, spreadsheet recalculation and alien alphabets are all this problem. In the alphabet version the hard part is building the graph - compare adjacent words and take the first differing character - after which it is a plain topological sort.',
          ],
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'tg-1',
      kind: 'concept',
      prompt: 'An interviewer says "you are given a binary tree". What have they promised?',
      options: [
        'At most two children per node, and nothing about ordering',
        'At most two children, sorted left to right',
        'A balanced tree with height O(log n)',
        'Every level completely filled',
      ],
      answerIndex: 0,
      explain:
        '"Binary" is only about branching. Sorted means binary *search* tree - a separate promise you must ask for.',
    },
    {
      id: 'tg-2',
      kind: 'technique',
      prompt: 'Which check correctly validates a binary search tree?',
      context:
        'A node can be larger than its left child and smaller than its right child and still be misplaced.',
      options: [
        'At each node, compare it to its left and right children',
        'Pass a (min, max) window down, narrowing max going left and min going right',
        'Check the tree is balanced first',
        'Compare the root to every leaf',
      ],
      answerIndex: 1,
      explain:
        'The property is about all descendants, so the constraint has to travel down the tree. Local comparisons miss it.',
    },
    {
      id: 'tg-3',
      kind: 'complexity',
      prompt:
        'Checking balance by calling a separate `height()` at every node costs what, on a balanced tree - and what is the fix?',
      options: [
        'O(n); no fix needed',
        'O(n log n); make the height function also report failure so one pass does both',
        'O(n²); memoise the heights',
        'O(log n); it is already optimal',
      ],
      answerIndex: 1,
      explain:
        'Each node is re-measured once per ancestor. Returning a sentinel height on the first imbalance collapses it to one O(n) pass.',
    },
    {
      id: 'tg-4',
      kind: 'concept',
      prompt: 'Why does breadth-first search need a queue rather than recursion?',
      options: [
        'Recursion cannot handle cycles',
        'A queue is faster than the call stack',
        'Recursion is inherently depth-first - it always finishes a branch before returning to a sibling',
        'It does not; recursive BFS is standard',
      ],
      answerIndex: 2,
      explain:
        'The call stack *is* a stack, which gives you DFS. FIFO order is what produces level-by-level exploration.',
    },
    {
      id: 'tg-5',
      kind: 'technique',
      prompt:
        'You need the shortest path between two nodes in an unweighted graph. Which search, and why?',
      options: [
        'DFS, because it is simpler to implement recursively',
        'BFS, because it reaches every node at distance d before any node at distance d + 1',
        'Either - they both return the shortest path',
        'DFS, because it uses less memory',
      ],
      answerIndex: 1,
      explain:
        'BFS finds a node the first time at its true distance. DFS finds *a* path, usually not the shortest one.',
    },
    {
      id: 'tg-6',
      kind: 'complexity',
      prompt:
        'A graph has branching factor k and the shortest s→t path has length d. What does bidirectional search change?',
      options: [
        'O(kᵈ) becomes O(kᵈᐟ²) - two frontiers of depth d/2 each',
        'O(kᵈ) becomes O(d)',
        'It halves the constant factor only',
        'It removes the need for a visited set',
      ],
      answerIndex: 0,
      explain:
        'Two searches of depth d/2 cost about 2·kᵈᐟ², and (kᵈᐟ²)² = kᵈ. The same budget buys paths twice as long.',
    },
    {
      id: 'tg-7',
      kind: 'technique',
      prompt:
        'In an indegree-based topological sort, how do you detect that no valid order exists?',
      options: [
        'Run a separate DFS cycle check first',
        'The queue empties while some nodes are still unordered',
        'Some node has indegree greater than the node count',
        'Two nodes end up with the same position',
      ],
      answerIndex: 1,
      explain:
        'Leftover nodes are all waiting on each other - that is a cycle. The detection is a by-product of the sort, not extra work.',
    },
    {
      id: 'tg-8',
      kind: 'concept',
      prompt: 'Why do graph traversals need a visited set when tree traversals do not?',
      options: [
        'Graphs are larger',
        'Graphs can have cycles and multiple paths to the same node, so a search can revisit or loop forever',
        'Graph nodes lack parent pointers',
        'Because BFS uses a queue',
      ],
      answerIndex: 1,
      explain:
        'A tree has exactly one path to each node, so it cannot revisit. Any cycle turns an unguarded graph search into an infinite loop.',
    },
    {
      id: 'tg-9',
      kind: 'technique',
      prompt:
        'Counting downward root-to-node paths that sum to a target, in O(n). What is the key structure?',
      options: [
        'A max-heap of partial sums',
        'A map from running prefix sum to how many times it occurred on the current path, decremented on the way back up',
        "Memoising each subtree's total",
        'Sorting the values first',
      ],
      answerIndex: 1,
      explain:
        'Same prefix-sum trick as subarrays. Forgetting to decrement on backtrack counts paths that bend sideways.',
    },
    {
      id: 'tg-10',
      kind: 'concept',
      prompt: 'To reconstruct a binary tree exactly, which single traversal is enough?',
      options: [
        'In-order',
        'Pre-order, if null children are recorded as explicit markers',
        'Post-order, on a BST',
        'None - you always need two',
      ],
      answerIndex: 1,
      explain:
        'Nulls make a pre-order sequence unique, which is why serialisation uses them. Without them you need pre-order plus in-order.',
    },
  ],
  drills: [
    { slug: 'maximum-depth-of-binary-tree', note: 'The warm-up recursion.' },
    { slug: 'same-tree', note: 'Structural comparison - the base of subtree matching.' },
    { slug: 'invert-binary-tree', note: 'Two lines, but say the complexity out loud.' },
    { slug: 'binary-tree-level-order-traversal', note: 'CTCI 4.3 - BFS with level boundaries.' },
    { slug: 'validate-binary-search-tree', note: 'CTCI 4.5 - bounds, not local comparisons.' },
    {
      slug: 'lowest-common-ancestor-of-a-binary-search-tree',
      note: 'Use the ordering; it is much easier than the general tree.',
    },
    {
      slug: 'binary-tree-maximum-path-sum',
      note: 'Return one value, track another - the classic two-value recursion.',
    },
    { slug: 'serialize-and-deserialize-binary-tree', note: 'Pre-order with null markers.' },
    { slug: 'subtree-of-another-tree', note: 'CTCI 4.10.' },
    {
      slug: 'construct-binary-tree-from-preorder-and-inorder-traversal',
      note: 'Why you need two traversals to reconstruct.',
    },
    { slug: 'kth-smallest-element-in-a-bst', note: 'In-order traversal is sorted order.' },
    { slug: 'clone-graph', note: 'A map from old node to new node is the whole trick.' },
    { slug: 'course-schedule', note: 'CTCI 4.7 - cycle detection on a dependency graph.' },
    { slug: 'number-of-islands', note: 'Grid as graph. DFS or BFS both work.' },
    {
      slug: 'pacific-atlantic-water-flow',
      note: 'Search backwards from the edges, not forwards from each cell.',
    },
    { slug: 'alien-dictionary', note: 'Topological sort in disguise. Premium.' },
    { slug: 'graph-valid-tree', note: 'Connected and exactly n−1 edges. Premium.' },
    {
      slug: 'number-of-connected-components-in-an-undirected-graph',
      note: 'Union-find or repeated DFS. Premium.',
    },
    { slug: 'balanced-binary-tree', note: 'CTCI 4.4 - do it in one pass, not O(n log n).' },
    { slug: 'diameter-of-binary-tree', note: 'Same two-value recursion as max path sum.' },
    { slug: 'path-sum-iii', note: 'CTCI 4.12 - running prefix sums in a map.' },
    { slug: 'lowest-common-ancestor-of-a-binary-tree', note: 'CTCI 4.8 - the general case.' },
    { slug: 'binary-tree-right-side-view', note: 'BFS, taking the last node of each level.' },
    { slug: 'rotting-oranges', note: 'Multi-source BFS - the "wave" made literal.' },
    {
      slug: 'convert-sorted-array-to-binary-search-tree',
      note: 'CTCI 4.2 - minimal height by construction.',
    },
    { slug: 'inorder-successor-in-bst', note: 'CTCI 4.6. Premium.' },
    {
      slug: 'binary-tree-inorder-traversal',
      note: 'Then do it iteratively with an explicit stack.',
    },
    { slug: 'find-if-path-exists-in-graph', note: 'CTCI 4.1 - plain reachability.' },
    { slug: 'accounts-merge', note: 'CTCI 17.7 - components over a synonym graph.' },
    { slug: 'word-ladder', note: 'CTCI 17.22 - BFS over word transformations.' },
    { slug: 'max-area-of-island', note: 'CTCI 16.19 - flood fill returning a size.' },
    {
      slug: 'convert-binary-search-tree-to-sorted-doubly-linked-list',
      note: 'CTCI 17.12. Premium.',
    },
  ],
  visualizers: [
    {
      url: visualgoUrl('bst'),
      note: 'Insert values yourself and predict the shape before it draws - then flip to AVL to see rotations fix it.',
    },
    {
      url: visualgoUrl('graphds'),
      note: 'Toggle between adjacency list and adjacency matrix on the same graph to feel the space tradeoff.',
    },
    {
      url: visualgoUrl('dfsbfs'),
      note: 'Run DFS and BFS on the same graph side by side and watch the visited order diverge.',
    },
    {
      url: visualgoUrl('ufds'),
      note: 'Union components and watch path compression flatten the tree on the very next find.',
    },
    {
      url: visualgoUrl('cyclefinding'),
      note: 'Add a back edge mid-traversal and see exactly which DFS state catches the cycle.',
    },
  ],
};
