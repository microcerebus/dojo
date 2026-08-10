import type { CourseModule } from '../../types';

export const linkedLists: CourseModule = {
  id: 'linked-lists',
  title: 'Linked Lists',
  track: 'core',
  status: 'complete',
  source: 'Chapter 2',
  summary:
    'Pointer surgery: runners, dummy heads, reversal, cycle detection, and knowing when recursion costs you O(n) stack.',
  estimatedMinutes: 55,
  concepts: [
    'Singly vs doubly linked lists and what each buys you',
    'No constant-time indexing: reaching the kth node costs O(k)',
    'O(1) insert and delete at a known position - the actual advantage',
    'Safe deletion: find the previous node, update head/tail, watch for null',
    'The runner technique: fixed-gap and fast/slow pointers',
    'Dummy heads to avoid special-casing the first node',
    'Hash-based dedup vs the O(n²) no-buffer scan',
    'Building two lists and splicing them (partition)',
    'Carry propagation through digit lists, forwards and backwards',
    'Palindrome checks via reversal, a stack, or the runner + recursion',
    'Reference identity vs value equality',
    'Floyd cycle detection and locating the loop entry',
    'Recursion on lists costs O(n) stack space',
  ],
  sections: [
    {
      id: 'shape',
      title: 'What a linked list is good at',
      takeaway: 'Cheap edits at a known position; expensive everything else.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A linked list is a chain of nodes, each holding a value and a reference to the next. In a doubly linked list each node also points backwards, which makes deletion possible without first finding the predecessor.',
        },
        {
          kind: 'table',
          headers: ['Operation', 'Array', 'Linked list'],
          rows: [
            ['Access index k', 'O(1)', 'O(k) - you have to walk'],
            ['Insert/delete at the front', 'O(n)', 'O(1)'],
            ['Insert/delete at a node you already hold', 'O(n)', 'O(1)'],
            ['Search for a value', 'O(n)', 'O(n)'],
            ['Memory per element', 'value only', 'value + one or two pointers'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The whole tradeoff',
          text: 'Linked lists trade random access for O(1) structural edits. If a problem never edits the structure, an array is almost certainly better.',
        },
        {
          kind: 'p',
          text: 'In interviews you usually get a bare `Node` with a `next` field and no wrapper class, and you refer to the list by its head. That matters: if the head can change - deleting the first node, or prepending - you must return the new head, because a caller holding the old one is now looking at the wrong list.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'The node you will be handed',
          code: `class ListNode {
  value: number;
  next: ListNode | null = null;
  constructor(value: number) {
    this.value = value;
  }
}`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Always ask',
          text: 'Singly or doubly linked? Is there a tail pointer? Can the list be empty? Are the values unique? Each answer changes the code.',
        },
      ],
    },
    {
      id: 'deletion-and-dummies',
      title: 'Deletion and dummy heads',
      takeaway: 'A dummy head deletes every "what if it is the first node?" branch.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'To delete a node from a singly linked list you need its predecessor, then set `prev.next = node.next`. Two things go wrong: the node might be the head, and `prev` might be null.',
        },
        {
          kind: 'p',
          text: 'A dummy (sentinel) head fixes both. Allocate one throwaway node in front of the real list, do the work uniformly, and return `dummy.next` at the end. There is now no such thing as "the first node" as a special case.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Delete every node with a given value',
          code: `function removeValue(head: ListNode | null, target: number): ListNode | null {
  const dummy = new ListNode(0);
  dummy.next = head;
  let prev = dummy;
  while (prev.next) {
    if (prev.next.value === target) prev.next = prev.next.next;
    else prev = prev.next;
  }
  return dummy.next; // never \`head\` - it may have been deleted
}`,
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'The one exception worth knowing',
          text: 'If you are given only the node to delete and no access to the head, you cannot unlink it - but you can copy the successor\'s value into it and delete the successor instead. It fails on the last node, and you should say so.',
        },
        {
          kind: 'p',
          text: 'Removing duplicates from an unsorted list is the standard first question. A `Set` of seen values gives O(n) time and O(n) space. The "no buffer allowed" follow-up forces a second runner that scans the remaining tail for each node: O(n²) time, O(1) space. Say both, then ask which tradeoff they want.',
        },
      ],
    },
    {
      id: 'runners',
      title: 'The runner technique',
      takeaway: 'Two pointers at different speeds or a fixed gap. Half this chapter is this.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'You cannot walk backwards and you often do not know the length. Two pointers solve both without a second pass.',
        },
        { kind: 'anim', animId: 'll-runner' },
        {
          kind: 'bullets',
          items: [
            '**Fixed gap** - advance `lead` k nodes, then move both together. When `lead` hits the end, `trail` is on the kth from the end.',
            '**Fast and slow** - `fast` moves two nodes per step of `slow`. When `fast` reaches the end, `slow` is at the midpoint. This is how you split a list without counting it.',
            '**Weaving** - use fast/slow to find the middle, then interleave the two halves. That is the shape of "reorder list".',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Where the off-by-ones live',
          text: 'Decide up front whether the midpoint of an even-length list is the first or second middle node, and always test `fast && fast.next` before stepping twice.',
        },
        {
          kind: 'p',
          text: 'The intersection problem is a neat variant. Two lists intersect by *reference*, not by value, so the tails are identical from the intersection onwards. Walk both to the end to get their lengths (and confirm the tails are the same object - if not, they never intersect), advance the longer list by the difference, then step together until the node references are equal.',
        },
      ],
    },
    {
      id: 'reversal',
      title: 'Reversal and palindromes',
      takeaway: 'prev, curr, next - and the order of the three assignments.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Reversing a list is the most-asked linked-list operation, and it is one link flip repeated. Save the next node before you overwrite the pointer, or you lose the rest of the list.',
        },
        { kind: 'anim', animId: 'll-reversal' },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Iterative reversal - O(n) time, O(1) space',
          code: `function reverse(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr) {
    const next = curr.next; // 1. save
    curr.next = prev;       // 2. flip
    prev = curr;            // 3. advance
    curr = next;
  }
  return prev; // curr is null, so prev is the new head
}`,
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The recursive version is not free',
          text: 'It reads more elegantly but costs O(n) stack space, and on a long list it will overflow. Mention the tradeoff - it is exactly the kind of thing being tested.',
        },
        {
          kind: 'p',
          text: 'Palindrome checking has three standard answers, and being able to rank them is the point:',
        },
        {
          kind: 'bullets',
          items: [
            'Reverse a copy and compare - simple, O(n) time, O(n) space.',
            'Push the first half onto a stack using fast/slow, then pop while walking the second half - O(n) time, O(n/2) space.',
            'Reverse the second half in place, compare, then restore it - O(n) time, O(1) space. Mutating the input is worth flagging.',
          ],
        },
      ],
    },
    {
      id: 'building-lists',
      title: 'Building lists: partition and arithmetic',
      takeaway: 'Grow separate chains and splice, instead of shuffling one in place.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Partitioning around a value looks like it needs swaps. It does not. Build two lists - one for values below the pivot, one for the rest - appending each node as you meet it, then join the tail of the first to the head of the second.',
        },
        { kind: 'anim', animId: 'll-partition' },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Read the spec carefully',
          text: 'The classic version does not require stability, and nodes equal to the pivot may sit anywhere in the right partition. That freedom is what makes the two-list build legal - so confirm it before relying on it.',
        },
        {
          kind: 'p',
          text: 'Digit arithmetic is the other list-building pattern. With digits stored in reverse order (ones digit first), addition is a straight walk: sum the two digits plus the carry, append `sum % 10`, carry `sum >= 10`. Keep going while either list has nodes or the carry is non-zero - forgetting that final carry node is the classic bug.',
        },
        {
          kind: 'p',
          text: 'Forward order is harder, because addition starts at the tail. Three options: reverse both lists and reuse the easy version; pad the shorter list with leading zeros and recurse to the end, propagating the carry back up as you unwind; or push both onto stacks and pop. All are acceptable - name the tradeoff and pick one.',
        },
      ],
    },
    {
      id: 'cycles',
      title: 'Cycle detection',
      takeaway: 'Detect with fast/slow; then find the entry by restarting one pointer at the head.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A corrupted list whose tail points back into itself never terminates. A hash set of visited nodes detects that in O(n) time and O(n) space. Floyd\'s algorithm does it in O(1) space, and the second half - finding where the loop starts - is the part interviews actually care about.',
        },
        { kind: 'anim', animId: 'll-floyd' },
        {
          kind: 'steps',
          items: [
            'Move `slow` one node and `fast` two nodes per step. If `fast` reaches null there is no cycle. On a circular track a faster runner always laps a slower one, so if there is a cycle they must collide.',
            'They collide somewhere inside the loop - not at its start.',
            'Move one pointer back to the head, leave the other at the collision, and advance both one step at a time. They meet exactly at the first node of the loop.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Why step three works',
          text: 'If the list has k nodes before the loop, the collision happens k nodes into the loop (measured forwards from the entry). So the distance from the head to the entry equals the distance from the collision to the entry - and two pointers moving at the same speed close both gaps together.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Compare references, not values',
          text: 'Throughout this chapter, `a === b` must mean "the same node object". Duplicate values are legal and will silently break a value-based comparison.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'll-1',
      kind: 'complexity',
      prompt: 'What is the cost of accessing the kth element of a singly linked list?',
      options: ['O(1)', 'O(log k)', 'O(k)', 'O(n log n)'],
      answerIndex: 2,
      explain: 'There is no index arithmetic - you walk k pointers. This is the price of O(1) structural edits.',
    },
    {
      id: 'll-2',
      kind: 'technique',
      prompt: 'Find the kth node from the end of a singly linked list in one pass. Which technique?',
      options: [
        'Recursion, counting on the way back',
        'Two pointers with a fixed gap of k',
        'Reverse the list first',
        'A hash map from index to node',
      ],
      answerIndex: 1,
      explain:
        'Advance the lead pointer k nodes, then move both together. Recursion works but costs O(n) stack.',
    },
    {
      id: 'll-3',
      kind: 'technique',
      prompt: 'Why use a dummy head node?',
      options: [
        'It makes the list faster to traverse',
        'It removes the special case where the operation changes the first node',
        'It is required for doubly linked lists',
        'It saves memory',
      ],
      answerIndex: 1,
      explain:
        'With a sentinel in front, every node has a predecessor - so insertion and deletion need no head-specific branch.',
    },
    {
      id: 'll-4',
      kind: 'concept',
      prompt: 'After Floyd\'s fast/slow pointers collide, that collision node is:',
      options: [
        'The first node of the loop',
        'The last node before the loop',
        'Somewhere inside the loop, not necessarily its start',
        'Always the midpoint of the list',
      ],
      answerIndex: 2,
      explain:
        'Detection and location are two different steps - restart one pointer at the head and step both by one to find the entry.',
    },
    {
      id: 'll-5',
      kind: 'complexity',
      prompt:
        'Removing duplicates from an unsorted linked list, with no additional data structure allowed. Time and space?',
      options: [
        'O(n) time, O(n) space',
        'O(n²) time, O(1) space',
        'O(n log n) time, O(1) space',
        'O(n) time, O(1) space',
      ],
      answerIndex: 1,
      explain:
        'Without a buffer, each node scans the rest of the list with a runner. The Set version is the O(n)/O(n) tradeoff.',
    },
    {
      id: 'll-6',
      kind: 'concept',
      prompt: 'Two linked lists "intersect". What does that mean here?',
      options: [
        'They contain some equal values',
        'They share a node by reference, so their tails are the same objects',
        'They have the same length',
        'One is a sublist of the other',
      ],
      answerIndex: 1,
      explain:
        'Intersection is by reference. A quick check: if the last nodes are not the same object, they cannot intersect.',
    },
    {
      id: 'll-7',
      kind: 'complexity',
      prompt: 'Recursive list reversal versus iterative. What is the difference that matters?',
      options: [
        'Recursive is O(n²) time',
        'Recursive uses O(n) stack space; iterative uses O(1)',
        'Iterative cannot handle an empty list',
        'There is no difference',
      ],
      answerIndex: 1,
      explain: 'Both are O(n) time. Recursion depth is real memory, and on a long list it overflows.',
    },
    {
      id: 'll-8',
      kind: 'technique',
      prompt:
        'Partition a list around x so smaller values come first. The cleanest approach is:',
      options: [
        'Swap node values in place',
        'Sort the list',
        'Build a "before" list and an "after" list, then join them',
        'Move every small node to the head as you find it',
      ],
      answerIndex: 2,
      explain:
        'Two growing chains plus one splice - a single pass, no swaps, and no index arithmetic.',
    },
    {
      id: 'll-9',
      kind: 'technique',
      prompt:
        'Adding two numbers stored as digit lists in reverse order. What is the most commonly forgotten case?',
      options: [
        'Lists of different lengths',
        'A final carry after both lists are exhausted',
        'Leading zeros',
        'Negative numbers',
      ],
      answerIndex: 1,
      explain:
        '99 + 1 needs a new most-significant node. Loop while either list has nodes *or* the carry is non-zero.',
    },
    {
      id: 'll-10',
      kind: 'technique',
      prompt: 'Palindrome check on a linked list in O(1) extra space requires:',
      options: [
        'A stack of the first half',
        'Reversing the second half in place, comparing, then restoring it',
        'Copying to an array',
        'It is not possible',
      ],
      answerIndex: 1,
      explain:
        'The stack version is O(n) space. Reversing in place is the O(1) answer - and mutating the input is worth calling out.',
    },
  ],
  drills: [
    { slug: 'reverse-linked-list', note: 'The one to be able to write without thinking. Both ways.' },
    { slug: 'linked-list-cycle', note: 'Floyd, part one - detection only.' },
    { slug: 'linked-list-cycle-ii', note: 'CTCI 2.8 - part two, finding the entry node.' },
    { slug: 'merge-two-sorted-lists', note: 'Dummy head plus one pointer per input.' },
    { slug: 'remove-nth-node-from-end-of-list', note: 'CTCI 2.2 - fixed-gap runner, with a dummy head.' },
    { slug: 'reorder-list', note: 'Three techniques in one: find middle, reverse, weave.' },
    { slug: 'middle-of-the-linked-list', note: 'Fast/slow. Decide which middle you return.' },
    { slug: 'palindrome-linked-list', note: 'CTCI 2.6 - get to the O(1) space version.' },
    { slug: 'intersection-of-two-linked-lists', note: 'CTCI 2.7 - by reference, using the length difference.' },
    { slug: 'add-two-numbers', note: 'CTCI 2.5 - watch the final carry.' },
    { slug: 'partition-list', note: 'CTCI 2.4 - two chains, one splice.' },
    { slug: 'delete-node-in-a-linked-list', note: 'CTCI 2.3 - copy the successor forward. Say why it fails on the tail.' },
    { slug: 'copy-list-with-random-pointer', note: 'Interleave-and-split for O(1) extra space.' },
    { slug: 'swap-nodes-in-pairs', note: 'Pointer surgery where a dummy head really pays off.' },
    { slug: 'odd-even-linked-list', note: 'Another two-chains-then-splice problem.' },
    { slug: 'lru-cache', note: 'CTCI 16.25 - hash map for lookup, doubly linked list for recency.' },
  ],
};
