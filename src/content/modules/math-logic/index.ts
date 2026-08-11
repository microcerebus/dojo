import type { CourseModule } from '../../types';

export const mathLogic: CourseModule = {
  id: 'math-logic',
  title: 'Math & Logic Puzzles',
  track: 'techniques',
  status: 'complete',
  source: 'Chapter 6',
  summary:
    'Primes, probability, invariants and the disciplined way to attack a puzzle when there is no algorithm to reach for.',
  estimatedMinutes: 60,
  concepts: [
    'Prime testing up to √n, and why the square root is enough',
    'The Sieve of Eratosthenes for generating primes in a range',
    'Prime factorisation, divisibility, GCD and LCM',
    'Probability of independent events (multiply) and mutually exclusive ones (add)',
    'Conditional probability, and using the complement when the direct count is messy',
    'Information theory in disguise: how many outcomes can one measurement distinguish?',
    'Encoding identity in binary across parallel tests (the poison-bottle pattern)',
    'Weighted measurement: give each candidate a different count so the total identifies it',
    'Invariants and impossibility proofs - colouring arguments and parity',
    'State-space search for constructive puzzles',
    'Worst-case minimisation and decision-tree depth',
    'Balancing the worst case by making early steps costlier (the egg-drop pattern)',
    'Perfect squares as the numbers with an odd divisor count',
    'Rejection sampling to build a uniform distribution from another one',
    'Fisher-Yates shuffling, and reservoir sampling for unknown-length streams',
    'Stating assumptions explicitly, starting from small cases, and looking for the pattern',
  ],
  sections: [
    {
      id: 'primes',
      title: 'Primes and divisibility',
      takeaway:
        'Factorisation explains GCD, LCM and divisibility. √n bounds primality. The sieve bulk-generates.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Every positive integer is a product of primes, and that single fact answers most number-theory questions you will get asked. Write 84 as 2² · 3 · 7 - or, more usefully, as an exponent for *every* prime, most of them zero.',
        },
        {
          kind: 'p',
          text: 'x divides y exactly when every prime in x appears in y at least as many times. Line the two factorisations up and the rest falls out: take the smaller exponent of each prime and you have the GCD, take the larger and you have the LCM.',
        },
        {
          kind: 'code',
          lang: 'text',
          code: `84  = 2² · 3¹ · 5⁰ · 7¹
36  = 2² · 3² · 5⁰ · 7⁰

gcd = 2^min(2,2) · 3^min(1,2) · 7^min(1,0) = 2² · 3 = 12
lcm = 2^max(2,2) · 3^max(1,2) · 7^max(1,0) = 2² · 3² · 7 = 252`,
          caption: 'min for the GCD, max for the LCM - which is why gcd(x,y) · lcm(x,y) = x · y.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Why √n is enough for primality',
          text: 'Divisors come in pairs: if a divides n then so does b = n/a. One of the pair is always ≤ √n. So if nothing up to √n divides n, nothing above it can either - checking 2…√n is not an approximation, it is complete.',
        },
        {
          kind: 'p',
          text: 'That gives O(√n) for one number. When you need *all* the primes below some bound, testing each one separately is the wrong shape - use the sieve instead.',
        },
        { kind: 'anim', animId: 'ml-sieve' },
        {
          kind: 'bullets',
          items: [
            'Cross off multiples of each prime in turn; whatever survives is prime.',
            'Start crossing at p², not 2p - anything smaller already had a smaller prime factor and is gone.',
            'Stop once p > √max, for the same reason primality testing stops there.',
            'O(n log log n) time, O(n) space. Storing only odd numbers halves the space.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'The related tricks worth knowing',
          text: 'Trailing zeros of n! is a divisibility question: count the factors of 5 (there is always a spare 2), which is ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + … Fast exponentiation halves the exponent each step for O(log n). Both come up as "math" problems that are really just counting.',
        },
      ],
    },
    {
      id: 'probability',
      title: 'Probability without the textbook',
      takeaway:
        'Two rules generate all of it. Independence and mutual exclusivity are opposites, not synonyms.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Draw two overlapping circles and you can rederive everything you need on the spot.',
        },
        {
          kind: 'table',
          headers: ['Rule', 'General form', 'Special case'],
          rows: [
            ['A and B', 'P(B given A) · P(A)', 'P(A) · P(B) when independent'],
            ['A or B', 'P(A) + P(B) − P(A and B)', 'P(A) + P(B) when mutually exclusive'],
            [
              'A given B',
              'P(B given A) · P(A) / P(B)',
              "Bayes' theorem, straight from the first row",
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Independent ≠ mutually exclusive',
          text: 'Mutually exclusive means one happening rules the other out - maximum dependence. Independent means one tells you nothing about the other. Two events with non-zero probability can never be both.',
        },
        {
          kind: 'p',
          text: '**Worked example - two basketball games.** Game 1: one shot, make it. Game 2: three shots, make at least two. With shot probability p, Game 1 wins with probability p. Game 2 wins with p³ + 3p²(1−p) = 3p² − 2p³. Setting p > 3p² − 2p³ and factoring gives (2p − 1)(p − 1) > 0, and since p < 1 the second factor is negative, so the first must be too: p < 0.5. Take the single shot if you are a poor shooter; take three if you are good. At p = 0, 0.5 or 1 the games are identical.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Count the complement when the direct count is messy',
          text: 'Three ants on a triangle, each picking a direction at random - what is the chance of a collision? Enumerating collisions is fiddly; enumerating *non*-collisions takes a second. They miss only if all three go the same way round: 2 of 2³ outcomes, so P(collision) = 1 − 2/8 = 3/4. For n ants on an n-gon it is 1 − 2/2ⁿ = 1 − (1/2)ⁿ⁻¹.',
        },
        {
          kind: 'p',
          text: '**Worked example - the birth policy.** Every family has children until the first girl, then stops. What happens to the gender ratio? Intuition says it must favour girls. Instead of computing the expected number of boys per family, forget families entirely and write every birth in the order it happens into one long string. Each character is independently a girl with probability 1/2. Nothing about a stopping rule changes that. The ratio stays 50/50 - a policy about *when to stop* cannot change the distribution of *each* draw.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Simulate to check, never to prove',
          text: 'These questions often end with "now write a simulation". Do it - it catches sign errors and off-by-ones - but lead with the argument. A simulation that agrees with a wrong model still agrees with a wrong model.',
        },
      ],
    },
    {
      id: 'approach',
      title: 'How to attack a puzzle',
      takeaway: 'Talk, write down every rule you discover, and build up from the smallest case.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Puzzles are algorithm questions with the code removed, and the same techniques work. They are almost never trick questions about wording; they can nearly always be deduced. What is being assessed is whether you can make progress out loud when the answer is not immediate.',
        },
        {
          kind: 'steps',
          items: [
            '**Start talking.** Silence reads as stuck. Say what the state is, what you can do to it, and what you want.',
            '**State assumptions explicitly.** "I am assuming the two people reason perfectly and know that the other does." Half the difficulty in a puzzle is an unstated assumption.',
            '**Write down every rule you discover.** Not in your head - on the board. Rules compose, and you will lose them otherwise.',
            '**Base case and build.** Solve n = 1, then n = 2, and look for how the second is built from the first.',
            '**Do it yourself.** Solve a concrete instance by hand at speed, then examine what you actually did.',
          ],
        },
        {
          kind: 'p',
          text: '**Rules in action - the two ropes.** Each rope burns for exactly an hour, but unevenly, so half a rope is not half an hour. Time 15 minutes.',
        },
        {
          kind: 'table',
          headers: ['Rule discovered', 'What it buys'],
          rows: [
            ['Burn rope A, then rope B', 'x + y minutes - so 120'],
            ['Light one rope at both ends', 'x/2 minutes - so 30, and unevenness stops mattering'],
            [
              'Burn one rope while another burns from both ends',
              'turns a y-minute rope into a (y − x/2)-minute rope',
            ],
          ],
          caption: 'Three rules, then the answer assembles itself.',
        },
        {
          kind: 'p',
          text: 'Light rope 1 at both ends and rope 2 at one end. When rope 1 is gone, 30 minutes have passed and rope 2 has 30 minutes left. Light rope 2 at its other end: 15 minutes.',
        },
        {
          kind: 'p',
          text: '**Base case and build in action - blue eyes.** Everyone on an island can see everyone else\'s eye colour but not their own. A visitor announces that at least one person has blue eyes, and that all blue-eyed people must leave on the nightly flight. With exactly one blue-eyed person, they see no other blue eyes and leave the first night. With two, each sees one other and reasons: "if I am not blue, they would have left tonight" - when nobody leaves, both leave on night two. The induction runs all the way up: with c blue-eyed people, all c leave on night c.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The information was already there',
          text: 'Everyone could already see a blue-eyed person, so the announcement told nobody anything new about eyes. What it created was *common knowledge* - and a shared clock. That distinction is the entire puzzle.',
        },
      ],
    },
    {
      id: 'invariants',
      title: 'Invariants and impossibility',
      takeaway:
        'To prove something cannot be done, find a quantity that never changes and show the goal violates it.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'When a puzzle asks "can you…?", the answer is sometimes no - and "I tried for a while and failed" is not a proof. What you want is an invariant: some quantity that every legal move preserves, which the target state gets wrong.',
        },
        { kind: 'anim', animId: 'ml-chessboard' },
        {
          kind: 'p',
          text: 'Every domino covers two adjacent squares, and adjacent squares always differ in colour, so every domino consumes one of each. That is the invariant. Cutting two opposite corners removes two squares of the *same* colour, leaving 30 and 32. Thirty-one dominoes need 31 and 31. No arrangement exists, and you never had to draw one.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Where to look for an invariant',
          text: 'Parity (odd/even) is the usual suspect, then colouring, then a sum or a total that each move leaves alone. Ask: what does one move do to this number? If the answer is "nothing", you have your invariant.',
        },
        {
          kind: 'p',
          text: '**Counting argument - the 100 lockers.** Pass i toggles every ith locker, for i = 1…100. Locker n is toggled once per divisor of n, so it ends open exactly when n has an odd number of divisors. Divisors pair up as (d, n/d), so the count is even - unless some d pairs with itself, which happens only when n is a perfect square. Ten lockers stay open: 1, 4, 9, …, 100.',
        },
        {
          kind: 'p',
          text: '**State search - the jugs.** Five-quart and three-quart jugs, no markings; measure four. Each state is a pair (five-jug, three-jug) and the moves are fill, empty and pour-until-one-is-done. That is a tiny graph, so search it: (5,0) → (2,3) → (2,0) → (0,2) → (5,2) → (4,3). Underneath is a number-theory fact - with jugs of relatively prime sizes you can measure any whole amount up to their sum, because gcd(5,3) = 1.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Do not confuse "I cannot find one" with "one does not exist"',
          text: 'Say which you mean. Claiming impossibility without an invariant is the fastest way to be wrong in front of an interviewer, and admitting "I have not found a construction, and here is what I would need to prove it impossible" is a perfectly strong position.',
        },
      ],
    },
    {
      id: 'information',
      title: 'How much can one measurement tell you?',
      takeaway:
        'Count the distinguishable outcomes first. Then design a test that uses all of them.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A whole family of puzzles is really information theory in a costume. Before designing anything, ask: how many outcomes can my test distinguish, and how many possibilities must I separate? If the first number is smaller, no cleverness will save you; if it is larger, a design exists and you just have to find it.',
        },
        {
          kind: 'p',
          text: '**Weighted measurement - the heavy pill.** Twenty bottles, one of them full of 1.1g pills instead of 1.0g, and one use of an exact scale. One weighing produces a single number, so the *number itself* has to identify the bottle. Take 1 pill from bottle 1, 2 from bottle 2, …, 20 from bottle 20. If everything were normal the total would be 1 + 2 + … + 20 = 210 grams. The overage is 0.1g per heavy pill, so (weight − 210) / 0.1 is the bottle number.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The generalisable idea',
          text: 'When one measurement must identify one of n candidates, give each candidate a different, known weight in the measurement. The reading then decodes to a unique candidate. Different counts, different bases, different bit positions - same idea.',
        },
        {
          kind: 'p',
          text: '**Binary encoding - the poisoned bottle.** 1000 bottles, one poisoned, 10 test strips, results take 7 days and a strip stays positive forever. Each strip is one bit: positive or negative. Ten bits distinguish 2¹⁰ = 1024 possibilities, which is more than 1000, so a 7-day answer must exist. Write each bottle number in binary and drop bottle b onto strip i whenever bit i of b is set. After seven days, read the positive strips as the bits of the answer.',
        },
        {
          kind: 'table',
          headers: ['Approach', 'Days', 'Why'],
          rows: [
            [
              'Split across strips, then recurse on the positive one',
              '28',
              'One 7-day round per 10× narrowing; wastes the waiting time',
            ],
            [
              'One decimal digit per day, plus a tiebreak day',
              '10',
              'Uses parallel days, but needs a 4th test for repeated digits',
            ],
            [
              'Binary encoding across all 10 strips at once',
              '7',
              'One round; 10 bits already separate 1024 bottles',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'The constraint is the hint',
          text: 'Both puzzles hinge on an odd-sounding restriction - "only one weighing", "results take seven days". A strange constraint is telling you what the answer must look like: one weighing means one number must carry all the information; a long lag means the tests have to run in parallel, not in sequence.',
        },
      ],
    },
    {
      id: 'worst-case',
      title: 'Minimising the worst case',
      takeaway:
        'When branches cost different amounts, shift work from the expensive one to the cheap one until they match.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A large class of puzzles asks you to minimise the *worst* number of steps. The technique is worst-case balancing: if one branch of your first decision is much cheaper than another, you are paying for an imbalance you can trade away.',
        },
        {
          kind: 'p',
          text: '**Nine balls, one heavier, two weighings.** Splitting into 4/4 with one ball aside almost works: the odd ball is identified in one weighing, but each group of four needs two more, giving three in the worst case. That gap - one branch costing 1, another costing 3 - is the signal. Penalise the cheap branch: split 3/3/3 instead. One weighing points at a group of three, one more points at the ball. Two, always.',
        },
        { kind: 'anim', animId: 'ml-egg-drop' },
        {
          kind: 'steps',
          items: [
            'Notice that egg 2 always does a linear scan between the last safe floor and the floor that broke egg 1.',
            'A balanced plan is one where drops(egg 1) + drops(egg 2) is the same however it turns out.',
            'Each additional drop of egg 1 therefore has to buy back exactly one drop of egg 2 - shrink the interval by one each time.',
            'So egg 1 goes to X, then X−1 higher, then X−2 higher, … until it reaches the top.',
            'Solve X + (X−1) + … + 1 = X(X+1)/2 ≥ 100, giving X ≈ 13.65, and round *up* to 14.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Round up, and check the rounding',
          text: 'X = 13 covers only up to floor 91, leaving nine floors that cannot be resolved in one drop. X = 14 reaches floor 99 and one more drop settles 100. Always test the rounding boundary rather than assuming.',
        },
        {
          kind: 'p',
          text: 'The general frame is a decision tree. Each measurement or drop is a node, its outcomes are the branches, and the worst case is the depth. A test with k outcomes gives at most kᵈ leaves at depth d, so d ≥ log_k(possibilities) is a hard floor - the same best-conceivable-runtime reasoning you use on algorithms, applied to questions.',
        },
      ],
    },
    {
      id: 'randomness',
      title: 'Building fair randomness',
      takeaway:
        'Uniformity is a property you have to prove by counting outcomes, not one you get by looking plausible.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The last family of questions asks you to build one random process out of another. The trap in every one of them is the same: a procedure that looks even but is not, and no amount of staring reveals it. Count the outcomes.',
        },
        { kind: 'anim', animId: 'ml-rejection' },
        {
          kind: 'p',
          text: 'The counting argument for why a fixed number of calls cannot work: with k calls to rand5() there are 5ᵏ equally likely paths, and each result of rand7() is a sum of some of them. For every result to come out at 1/7, seven would have to divide a power of five. It does not. That is why the answer needs a loop, and why the number of calls has no bound.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Rejection sampling, in general',
          text: 'Generate outcomes uniformly over a range that is a whole multiple of what you need, discard whatever hangs over the edge, and take the rest mod n. Discarding uniform outcomes leaves the survivors uniform - which is the only step you need to justify.',
        },
        { kind: 'anim', animId: 'ml-fisher-yates' },
        {
          kind: 'bullets',
          items: [
            '**Fisher-Yates.** Walk the array; at position i pick k uniformly from the *unfinished* range including i itself, and swap. One pass, O(1) extra space, exactly n! outcomes.',
            '**The biased version.** Picking k from the whole array each time gives nⁿ paths for n! orderings. n! never divides nⁿ for n > 2, so some orderings must be more likely. It looks identical and is wrong.',
            '**Random subset of m.** Take the first m elements, then for each later element i pick k in 0..i and, if k < m, overwrite subset[k]. Same argument, one pass.',
            '**Reservoir sampling.** Same shape when the length is unknown: keep the ith item with probability 1/i, evicting a uniformly chosen incumbent. That is how you pick a random node from a linked list, or a random line from a stream, in one pass and O(1) space.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Say the probability out loud',
          text: 'For any sampling answer, state why each outcome has the probability you claim - "position i is chosen from exactly i+1 candidates, so 1/(i+1)". If you cannot say it, the algorithm is probably biased, and interviewers ask this follow-up almost every time.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'ml-1',
      kind: 'complexity',
      prompt: 'Why is it enough to test divisors only up to √n when checking whether n is prime?',
      options: [
        'Numbers above √n are rarely prime',
        'Divisors come in pairs (a, n/a), and at least one of each pair is ≤ √n',
        'It is an approximation that is right most of the time',
        'Because √n is where the sieve stops',
      ],
      answerIndex: 1,
      explain:
        'If a > √n divides n then n/a < √n also divides it, so you already found the factor. The bound is exact, not a heuristic.',
    },
    {
      id: 'ml-2',
      kind: 'technique',
      prompt:
        'In the Sieve of Eratosthenes, why does crossing off multiples of p start at p² rather than 2p?',
      options: [
        'To save memory',
        'Because every smaller multiple of p already has a smaller prime factor and is crossed off',
        'Because p² is the first multiple of p that is composite',
        'It is arbitrary - starting at 2p is equally efficient',
      ],
      answerIndex: 1,
      explain:
        'k·p for k < p was removed when the sieve processed k’s own prime factors, so the work would be duplicated.',
    },
    {
      id: 'ml-3',
      kind: 'concept',
      prompt: 'Two events each have probability greater than zero. They can be:',
      options: [
        'Both independent and mutually exclusive',
        'Independent, or mutually exclusive, but never both',
        'Mutually exclusive only if they are also independent',
        'Independent only if they overlap',
      ],
      answerIndex: 1,
      explain:
        'Mutual exclusivity means one rules the other out - maximum dependence. Independence means it tells you nothing. They are opposites.',
    },
    {
      id: 'ml-4',
      kind: 'technique',
      prompt:
        'Three ants sit on the vertices of a triangle and each walks along a random edge. The fastest route to P(collision) is:',
      options: [
        'Enumerate every way two ants can meet',
        'Compute P(no collision) - all three going the same way round - and subtract from 1',
        'Simulate a few thousand runs',
        'Use Bayes’ theorem on each pair',
      ],
      answerIndex: 1,
      explain:
        'Only 2 of the 8 direction combinations avoid a collision, so P = 1 − 2/8 = 3/4. The complement is trivial where the direct count is not.',
    },
    {
      id: 'ml-5',
      kind: 'concept',
      prompt:
        'Two opposite corners are cut from an 8x8 board. Why can 31 dominoes not tile the remaining 62 squares?',
      options: [
        'There is no room for the last domino in the corner',
        'Each domino covers one light and one dark square, but the board now has 30 of one colour and 32 of the other',
        '62 is not divisible by 2',
        'The proof requires exhaustive search',
      ],
      answerIndex: 1,
      explain:
        'Opposite corners share a colour, so removing them unbalances the board. The colour count is an invariant every placement preserves.',
    },
    {
      id: 'ml-6',
      kind: 'concept',
      prompt: 'After 100 toggling passes over 100 lockers, the ones left open are exactly the:',
      options: [
        'Even-numbered lockers',
        'Prime-numbered lockers',
        'Perfect squares',
        'Multiples of 10',
      ],
      answerIndex: 2,
      explain:
        'A locker is toggled once per divisor. Divisors pair up as (d, n/d), so the count is odd only when d = n/d - that is, when n is a perfect square.',
    },
    {
      id: 'ml-7',
      kind: 'technique',
      prompt:
        'Twenty bottles, one full of heavier pills, and a single use of an exact scale. The key move is to:',
      options: [
        'Weigh ten bottles against ten',
        'Take a different number of pills from each bottle so the total decodes to one bottle',
        'Weigh one pill from each bottle together',
        'Weigh the bottles in pairs',
      ],
      answerIndex: 1,
      explain:
        'One pill from bottle 1, two from bottle 2 … the overage divided by 0.1 is the bottle number. One reading has to carry all the information.',
    },
    {
      id: 'ml-8',
      kind: 'technique',
      prompt:
        '1000 bottles, one poisoned, 10 strips, and results take seven days. Seven days is achievable because:',
      options: [
        'Each strip can be reused as soon as it reads negative',
        '10 binary indicators distinguish 1024 possibilities, so each bottle can be encoded as a 10-bit pattern in one round',
        'The bottles can be split into ten groups of 100',
        'Poison spreads between strips',
      ],
      answerIndex: 1,
      explain:
        'Drop bottle b on strip i when bit i of b is set; the positive strips spell the answer in binary. One round, seven days, which is the floor.',
    },
    {
      id: 'ml-9',
      kind: 'technique',
      prompt:
        'A plan drops the first egg every 10 floors and costs between 10 and 19 drops depending on where it breaks. What does that spread tell you?',
      options: [
        'The plan is optimal because the average is good',
        'There is an imbalance to trade away - shrink the interval by one each time so every branch costs the same',
        'You need a third egg',
        'The building is too tall for two eggs',
      ],
      answerIndex: 1,
      explain:
        'Worst-case balancing: every extra drop of egg 1 must buy back one drop of egg 2. Intervals of 14, 13, 12 … make every branch cost 14.',
    },
    {
      id: 'ml-10',
      kind: 'concept',
      prompt:
        'Shuffling by walking the array and swapping each element with a uniformly random index anywhere in the array is:',
      options: [
        'Uniform, and the standard algorithm',
        'Biased, because nⁿ equally likely paths cannot divide evenly among n! orderings',
        'Uniform but slower than Fisher-Yates',
        'Biased only for arrays longer than 52',
      ],
      answerIndex: 1,
      explain:
        'Fisher-Yates picks from the unfinished range only, giving exactly n! paths. The naive version has nⁿ, which n! does not divide.',
    },
  ],
  drills: [
    { slug: 'count-primes', note: 'Implement the sieve and state its complexity.' },
    { slug: 'happy-number', note: 'Cycle detection applied to arithmetic.' },
    { slug: 'factorial-trailing-zeroes', note: 'CTCI 16.5 - count the factors of five.' },
    { slug: 'powx-n', note: 'Fast exponentiation by halving.' },
    { slug: 'excel-sheet-column-number', note: 'Base conversion with an awkward offset.' },
    { slug: 'implement-rand10-using-rand7', note: 'CTCI 16.23 - rejection sampling.' },
    { slug: 'random-pick-with-weight', note: 'Prefix sums plus binary search.' },
    { slug: 'water-and-jug-problem', note: 'CTCI 6.5 - state search, or the GCD insight.' },
    { slug: 'super-egg-drop', note: 'CTCI 6.8 - the full DP version.' },
    { slug: 'bulb-switcher', note: 'CTCI 6.9 - only perfect squares survive.' },
    { slug: 'poor-pigs', note: 'CTCI 6.10 - binary encoding across tests.' },
    {
      slug: 'shuffle-an-array',
      note: 'CTCI 17.2 - Fisher-Yates, and why the naive shuffle is biased.',
    },
    { slug: 'linked-list-random-node', note: 'CTCI 17.3 - reservoir sampling.' },
    { slug: 'number-of-digit-one', note: 'CTCI 17.6 - count per digit position.' },
    { slug: 'set-mismatch', note: 'CTCI 17.19 - recover missing values from sums.' },
    {
      slug: 'max-points-on-a-line',
      note: 'CTCI 16.14 - slopes as hash keys, with the precision trap.',
    },
  ],
};
