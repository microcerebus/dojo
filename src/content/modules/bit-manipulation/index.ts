import type { CourseModule } from '../../types';

export const bitManipulation: CourseModule = {
  id: 'bit-manipulation',
  title: 'Bit Manipulation',
  track: 'core',
  status: 'complete',
  source: 'Chapter 5',
  summary:
    'Masks, shifts and two\'s complement - plus the handful of tricks that turn arithmetic problems into one-liners.',
  estimatedMinutes: 60,
  concepts: [
    'Binary representation and doing binary addition, subtraction and multiplication by hand',
    "Two's complement: negation is invert-then-add-one; the sign bit",
    'Arithmetic vs logical right shift (>> vs >>> in JavaScript) and when the difference bites',
    'AND, OR, XOR, NOT and the identities worth memorising (x ^ 0 = x, x ^ x = 0, x & (x−1))',
    'The four mask operations: get, set, clear and update a bit',
    'Clearing all bits above or below a position with a shifted mask',
    'n & (n−1) clears the lowest set bit - so it tests powers of two and counts set bits',
    'XOR to count differing bits, and to cancel out paired values',
    'Isolating and moving runs of ones',
    'Bit vectors: packing booleans into integers, and byte-packed bitmap addressing',
    'JavaScript specifics: bitwise operators coerce to 32-bit signed integers; BigInt for more',
    'Adding without the plus operator: XOR for the sum, AND-and-shift for the carry',
    'Building subsets by counting in binary',
  ],
  sections: [
    {
      id: 'by-hand',
      title: 'Binary by hand',
      takeaway: 'Base 2 arithmetic is base 10 arithmetic. Shifts are multiplication.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Bit questions are lost on arithmetic slips, not on cleverness. Before anything else, be able to add, subtract and multiply four-bit numbers on paper - and when you get confused, work the same sum in base 10 and copy the process across.',
        },
        {
          kind: 'table',
          caption: 'Warm-up: do these by hand before reading on',
          headers: ['Expression', 'Answer', 'Why'],
          rows: [
            ['`0110 + 0010`', '`1000`', 'carry propagates exactly as in base 10'],
            ['`0011 * 0101`', '`1111`', '3 × 5 = 15'],
            ['`0110 + 0110`', '`1100`', 'doubling is a left shift by 1'],
            ['`0100 * 0011`', '`1100`', 'multiplying by 4 is a left shift by 2'],
            ['`1101 >> 2`', '`0011`', 'right shift divides by 4, discarding the remainder'],
            ['`1101 ^ 0101`', '`1000`', 'XOR is 1 exactly where the bits differ'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Shifts are arithmetic',
          text: '`x << k` multiplies by 2^k and `x >> k` divides by 2^k (rounding towards negative infinity). Any time a problem says "without the multiply operator", shifting is the first thing to reach for.',
        },
        {
          kind: 'p',
          text: 'Two more identities fall straight out of doing it by hand. `~0` is a solid run of 1s, so `~0 << k` is 1s followed by k zeros - the standard "clear the bottom k bits" mask. And `x ^ (~x)` is all 1s, because every bit is XORed against its own opposite.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Name your n',
          text: 'When you state the complexity of a bit algorithm, `n` is ambiguous: is it the value or the number of bits? Say `b` for the bit width. A loop over the bits of a 32-bit integer is O(b), not O(n), and interviewers notice the distinction.',
        },
      ],
    },
    {
      id: 'twos-complement',
      title: "Two's complement and shifts",
      takeaway: 'Negation is invert-then-add-one. The two right shifts are not the same operator.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Computers store signed integers in two\'s complement. A non-negative number is just itself; a negative number is stored as the complement of its absolute value, with the top bit set to mark it negative.',
        },
        {
          kind: 'p',
          text: 'The mechanical rule is the one to remember: to negate, invert every bit and add one. As a formula, the N-bit representation of −K is the bit pattern of 2^(N−1) − K with the sign bit set.',
        },
        { kind: 'anim', animId: 'bm-twos-complement' },
        {
          kind: 'table',
          caption: 'Four-bit signed values - the halves mirror each other',
          headers: ['Value', 'Bits', 'Value', 'Bits'],
          rows: [
            ['3', '`0011`', '−3', '`1101`'],
            ['2', '`0010`', '−2', '`1110`'],
            ['1', '`0001`', '−1', '`1111`'],
            ['0', '`0000`', '−4', '`1100`'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Why this representation',
          text: 'Adding a number to its negation carries off the top of the word and leaves zero. So subtraction is addition, and one adder circuit does both. It also explains why there is one more negative value than positive.',
        },
        {
          kind: 'p',
          text: 'That sign bit is why there are two right shifts. **Arithmetic** right shift (`>>`) copies the sign bit into the vacated positions, so it keeps dividing by two and a negative number stays negative. **Logical** right shift (`>>>`) feeds in zeros, so a negative number becomes a large positive one.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Shift −93242 right 40 times, two ways',
          code: `let x = -93242;
for (let i = 0; i < 40; i++) x >>= 1;   // ends at -1: all ones
let y = -93242;
for (let i = 0; i < 40; i++) y >>>= 1;  // ends at 0: zeros shifted in`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'JavaScript: everything is 32-bit signed',
          text: 'Bitwise operators coerce their operands to 32-bit signed integers, so `1 << 31` is negative and anything above 2^31 silently wraps. Use `>>> 0` to read a result as unsigned, and `BigInt` (with its own `&`, `|`, `<<`) when you genuinely need more than 32 bits. Shift counts are taken mod 32, so `x << 32` is `x`.',
        },
      ],
    },
    {
      id: 'identities',
      title: 'The identities',
      takeaway: 'Learn which operator leaves a bit alone, and every mask derives itself.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Bitwise operators act on each position independently - what happens in one column never affects another. So a fact proven for a single bit is automatically true for a whole word, which is why this short table is worth more than any memorised expression.',
        },
        {
          kind: 'table',
          caption: '`0s` and `1s` mean a run of zeros or ones',
          headers: ['XOR', 'AND', 'OR'],
          rows: [
            ['`x ^ 0s = x`', '`x & 0s = 0`', '`x | 0s = x`'],
            ['`x ^ 1s = ~x`', '`x & 1s = x`', '`x | 1s = 1s`'],
            ['`x ^ x = 0`', '`x & x = x`', '`x | x = x`'],
          ],
        },
        {
          kind: 'bullets',
          items: [
            '**AND leaves a bit alone when the mask bit is 1**, and clears it when the mask bit is 0. So AND is the clearing operator.',
            '**OR leaves a bit alone when the mask bit is 0**, and sets it when the mask bit is 1. So OR is the setting operator.',
            '**XOR leaves a bit alone when the mask bit is 0**, and flips it when the mask bit is 1. So XOR is the toggling operator.',
            '`x ^ x = 0` and `x ^ 0 = x` together make XOR a *cancellation* operator: XOR a whole list together and everything that appears an even number of times vanishes.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Do not memorise, derive',
          text: 'The book is blunt about this: memorising get/set/clear leads to mistakes you cannot recover from mid-interview. Remember "AND with 1, OR with 0, XOR with 0 all leave a bit unchanged" and rebuild the expression on the spot.',
        },
      ],
    },
    {
      id: 'masks',
      title: 'Get, set, clear, update',
      takeaway: 'Build a mask, then pick the operator that leaves everything else alone.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Every single-bit operation is the same two moves. Build `1 << i`, a value with exactly one bit set where you intend to act, then combine it with the operator that ignores the other positions.',
        },
        { kind: 'anim', animId: 'bm-mask-ops' },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'The four operations, derived rather than memorised',
          code: `const getBit = (n: number, i: number) => (n & (1 << i)) !== 0;
const setBit = (n: number, i: number) => n | (1 << i);
const clearBit = (n: number, i: number) => n & ~(1 << i);
const toggleBit = (n: number, i: number) => n ^ (1 << i);

// Update: clear first, then OR the value in. Clearing is what makes v = 0 work.
const updateBit = (n: number, i: number, v: 0 | 1) => (n & ~(1 << i)) | (v << i);`,
        },
        {
          kind: 'p',
          text: 'Clearing a range is the same trick with a fatter mask, and both variants come from one observation: subtracting 1 from a lone set bit turns it into a run of ones below that position.',
        },
        {
          kind: 'table',
          headers: ['Goal', 'Mask', 'Shape'],
          rows: [
            ['Keep only bits below i', '`n & ((1 << i) - 1)`', '`00000111`'],
            ['Keep only bits at or above i+1', '`n & (-1 << (i + 1))`', '`11110000`'],
            ['Isolate the lowest set bit', '`n & -n`', 'one bit, wherever it was'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The bugs live in the plus-ones',
          text: 'Inserting an m-bit pattern into bits j..i means clearing that window and shifting m left by i. Off-by-one errors here are near-universal - write out a concrete 8-bit example on the board and check both boundaries before you trust the code.',
        },
      ],
    },
    {
      id: 'tricks',
      title: 'The tricks worth knowing',
      takeaway: 'A handful of expressions answer most of the chapter.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Subtracting 1 from a number flips its lowest 1 to a 0 and turns every 0 below it into a 1. Everything above that bit is untouched. That single fact powers the most-used expression in the chapter.',
        },
        { kind: 'anim', animId: 'bm-clear-lowest-bit' },
        {
          kind: 'bullets',
          items: [
            '`n & (n - 1)` clears the lowest set bit. Loop until zero and you have counted the set bits in O(set bits) rather than O(width).',
            '`(n & (n - 1)) === 0` means n has at most one set bit - the **power of two** test. Guard `n > 0` separately, because zero passes it too.',
            '`n & -n` isolates the lowest set bit, because `-n` is `~n + 1`, which agrees with n only at that position.',
            '`a ^ b` has a 1 wherever a and b differ, so popcount of `a ^ b` is the **number of bit flips** to turn a into b.',
            'XOR an array of values in which everything is paired except one, and the survivor is the odd one out - no extra space at all.',
            'Sum-versus-XOR: for 0..n with one missing, either the sum formula or a full XOR recovers it, but XOR cannot overflow.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Runs of ones',
          text: 'For "flip one 0 to maximise a run of 1s", picture the number as alternating blocks of 0s and 1s. Walk the bits keeping `currentLength` and `previousLength`; on a 0, set `previousLength` to `currentLength` only if the *next* bit is also 1, otherwise reset it. That is O(b) time and O(1) space, versus O(b) space for building the block list first.',
        },
        {
          kind: 'p',
          text: 'Two more shapes recur. **Pairwise swap** of odd and even bits is `((x & 0xaaaaaaaa) >>> 1) | ((x & 0x55555555) << 1)` - mask the two interleaved halves, shift them past each other, merge. The logical shift matters, so the sign bit is filled with zero.',
        },
        {
          kind: 'p',
          text: 'And **next number with the same popcount**: flip the rightmost non-trailing zero, then push all the ones below it as far right as possible. If `c0` is the count of trailing zeros and `c1` the ones immediately above them, the whole thing collapses to `n + (1 << c0) + (1 << (c1 - 1)) - 1`.',
        },
      ],
    },
    {
      id: 'arithmetic',
      title: 'Arithmetic without operators',
      takeaway: 'Split every operation into "the answer" and "the carry".',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A whole family of questions removes an operator and asks you to rebuild it. They all come from the same observation: a column of binary addition produces two things, the digit you write down and the digit you carry.',
        },
        { kind: 'anim', animId: 'bm-add-without-plus' },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Addition with no + operator',
          code: `function add(a: number, b: number): number {
  while (b !== 0) {
    const sum = a ^ b;          // addition, carries thrown away
    const carry = (a & b) << 1; // exactly the columns that carried
    a = sum;
    b = carry;
  }
  return a;
}`,
        },
        {
          kind: 'bullets',
          items: [
            '**Subtract** by adding the negation: `a - b` is `add(a, add(~b, 1))`.',
            '**Multiply** by shifting and adding: for each set bit i of b, add `a << i`. That is O(b) additions, not b repeated ones.',
            '**Divide** by shifting the divisor left until it would overshoot, subtracting, and recording the bit - long division in base 2.',
            '**Recursive multiply** halves the smaller operand: `a * b` is `(a * (b >> 1)) << 1`, plus a when b is odd. Halving the *smaller* number keeps the recursion shallow.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Binary fractions',
          text: 'To print a fraction in binary, multiply by two repeatedly: if the result reaches 1, emit a 1 and subtract it, otherwise emit a 0. Equivalently, compare against 0.5, 0.25, 0.125… If you pass 32 characters without terminating, the value has no exact binary representation - report that rather than looping forever.',
        },
      ],
    },
    {
      id: 'bit-vectors',
      title: 'Bits as a data structure',
      takeaway: 'A word of bits is a set. Use it when memory is the constraint.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The other half of the chapter is not arithmetic at all: it is using integers as compact arrays of booleans. One 32-bit integer holds 32 flags, and a typed array of them holds millions.',
        },
        {
          kind: 'bullets',
          items: [
            '**A fixed alphabet as one integer.** "Are all 26 letters distinct?" becomes one `int`: test with `&`, set with `|`. No data structure, O(1) space.',
            '**A subset as a number.** Counting from 0 to 2^n − 1 and reading the bits of the counter enumerates every subset of an n-element set exactly once.',
            '**A huge membership set.** Four billion possible integers need 4 billion bits, or 512 MB - fine in 1 GB, hopeless in 10 MB. Under 10 MB you make one pass counting values per block, find a block whose count is short, then re-scan only that block with a bit vector.',
            '**Byte-packed images.** Pixel x of a row lives in byte `x >> 3` at bit `7 - (x & 7)`. Dividing and modding by 8 is exactly a shift and a mask.',
          ],
        },
        { kind: 'anim', animId: 'bm-draw-line' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The pattern behind both bitmap questions',
          text: 'Handle the ragged ends with masks and the aligned middle with whole-word writes. It turns O(pixels) into O(bytes), and the case that breaks it is both ends landing in the same byte - then there is no middle and the two masks must be ANDed together.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Test like it is off-by-one, because it is',
          text: 'Bit code fails on the boundaries: bit 0, bit 31, the sign bit, an empty range, a single-element range. Trace them by hand before you say you are done - it is the cheapest correctness win in this chapter.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'bm-1',
      kind: 'concept',
      prompt: 'What does `(n & (n - 1)) === 0` test?',
      options: [
        'n is odd',
        'n has at most one set bit, i.e. n is zero or a power of two',
        'n is negative',
        'n and n − 1 are both even',
      ],
      answerIndex: 1,
      explain:
        'n − 1 clears n\'s lowest set bit and sets everything below it, so the AND is zero only when there was nothing above that bit. Zero passes too, so guard it.',
    },
    {
      id: 'bm-2',
      kind: 'complexity',
      prompt: 'Counting set bits with `while (n) { count++; n &= n - 1; }` on a 32-bit integer costs:',
      options: [
        'O(1) - always 32 iterations',
        'O(number of set bits), at most 32',
        'O(value of n)',
        'O(log(value of n)) but never fewer than 32 steps',
      ],
      answerIndex: 1,
      explain:
        'Each iteration removes exactly one set bit, so the loop runs once per 1 in the word - often far fewer than the width.',
    },
    {
      id: 'bm-3',
      kind: 'technique',
      prompt: 'You need to set bit i of n to a value v that may be 0 or 1. Which expression is correct?',
      options: [
        '`n | (v << i)`',
        '`n ^ (v << i)`',
        '`(n & ~(1 << i)) | (v << i)`',
        '`n & (v << i)`',
      ],
      answerIndex: 2,
      explain:
        'You must clear the bit first. `n | (v << i)` can never turn a bit off, so it silently fails whenever v is 0.',
    },
    {
      id: 'bm-4',
      kind: 'concept',
      prompt: 'In JavaScript, what is the value of `x` after `let x = -8; x >>>= 1;`?',
      options: [
        '−4',
        '2147483644',
        '−1',
        '4',
      ],
      answerIndex: 1,
      explain:
        '`>>>` is the logical shift: it feeds in a 0 at the top rather than copying the sign bit, so a negative value becomes a large positive one. `>>` would have given −4.',
    },
    {
      id: 'bm-5',
      kind: 'technique',
      prompt:
        'Every value in an array appears exactly twice except one. How do you find the single value in O(n) time and O(1) space?',
      options: [
        'Sort the array and scan for a neighbour mismatch',
        'XOR every element together',
        'AND every element together',
        'Use a hash set of seen values',
      ],
      answerIndex: 1,
      explain:
        '`x ^ x = 0` and `x ^ 0 = x`, so all the pairs cancel and only the unpaired value survives. The hash set works but costs O(n) space.',
    },
    {
      id: 'bm-6',
      kind: 'technique',
      prompt: 'How many bits must be flipped to turn A into B?',
      context: 'A = 29 (11101), B = 15 (01111)',
      options: [
        'Popcount of `A & B`',
        'Popcount of `A ^ B`',
        'The absolute difference of the popcounts',
        '`|A - B|` in binary',
      ],
      answerIndex: 1,
      explain:
        'XOR is 1 exactly where the two differ, so counting its set bits counts the flips. Here `A ^ B` is 10010, giving 2.',
    },
    {
      id: 'bm-7',
      kind: 'concept',
      prompt: 'Adding two integers with no `+` operator: which pair of expressions is the loop body?',
      options: [
        'sum = `a | b`, carry = `(a ^ b) << 1`',
        'sum = `a ^ b`, carry = `(a & b) << 1`',
        'sum = `a & b`, carry = `(a | b) >> 1`',
        'sum = `a ^ b`, carry = `(a | b) << 1`',
      ],
      answerIndex: 1,
      explain:
        'XOR is column-wise addition with the carry discarded; AND marks exactly the columns that carried, and the carry lands one place to the left.',
    },
    {
      id: 'bm-8',
      kind: 'complexity',
      prompt:
        'A 20-pixel horizontal line is drawn in a byte-packed monochrome screen using masks for the ends and whole-byte writes for the middle. How many byte writes, roughly?',
      options: [
        '20 - one per pixel',
        'About 4: two ragged ends plus the full bytes between them',
        '1 - the whole row is one write',
        '8 - one per bit of a byte',
      ],
      answerIndex: 1,
      explain:
        'Only the partial bytes at each end need a read-modify-write; the aligned interior is stored eight pixels at a time as 0xFF.',
    },
    {
      id: 'bm-9',
      kind: 'technique',
      prompt:
        'You must enumerate every subset of an 8-element set. What is the bit-manipulation formulation?',
      options: [
        'XOR the elements pairwise',
        'Count from 0 to 2⁸ − 1 and read each counter as a membership mask',
        'Shift a single 1 bit through all 8 positions',
        'Sort the elements, then take every prefix',
      ],
      answerIndex: 1,
      explain:
        'Each n-bit integer is a distinct membership vector, so counting to 2ⁿ − 1 generates all 2ⁿ subsets exactly once, with no recursion.',
    },
    {
      id: 'bm-10',
      kind: 'complexity',
      prompt:
        'You loop over the 32 bits of an integer. Stating this as "O(n)" is a problem because:',
      options: [
        'The loop is really O(1) since 32 is a constant',
        'It is ambiguous whether n means the value or the bit width - say O(b)',
        'Bit loops cannot be given a complexity',
        'It should be O(log n) instead',
      ],
      answerIndex: 1,
      explain:
        'The cost is linear in the number of bits, not the value. Naming the width separately - b - removes the ambiguity for you and your interviewer.',
    },
  ],
  drills: [
    { slug: 'number-of-1-bits', note: 'Do it with n & (n−1) and count the iterations.' },
    { slug: 'counting-bits', note: 'The DP relation using the lowest bit.' },
    { slug: 'reverse-bits', note: 'Careful with unsigned handling in JavaScript.' },
    { slug: 'missing-number', note: 'CTCI 17.4 - XOR or the sum formula.' },
    { slug: 'sum-of-two-integers', note: 'CTCI 17.1 - add without +.' },
    { slug: 'single-number', note: 'XOR cancellation in its purest form.' },
    { slug: 'single-number-ii', note: 'Counting bits mod 3 - the generalisation.' },
    { slug: 'power-of-two', note: 'CTCI 5.5 - exactly the n & (n−1) test.' },
    { slug: 'bitwise-and-of-numbers-range', note: 'The common prefix of the range.' },
    { slug: 'add-binary', note: 'Manual carry propagation on strings.' },
    { slug: 'max-consecutive-ones-iii', note: 'CTCI 5.3 - flip-one-zero as a sliding window.' },
    { slug: 'hamming-distance', note: 'CTCI 5.6 - XOR then popcount.' },
    { slug: 'divide-two-integers', note: 'CTCI 16.9 - division by shifting.' },
  ],
};
