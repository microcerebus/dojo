import type { CourseModule } from '../../types';

export const testing: CourseModule = {
  id: 'testing',
  title: 'Testing',
  track: 'techniques',
  status: 'complete',
  source: 'Chapter 11',
  summary:
    'How to design tests for an object, a system, a function or a bug report - and how to debug something that only fails sometimes.',
  estimatedMinutes: 40,
  concepts: [
    'The four shapes of testing question: a physical object, a piece of software, a function, and "debug this"',
    'Clarifying who the user is and what the thing is actually for before listing any test',
    'Decomposing the object or system into components and the interactions between them',
    'Normal cases, boundary values, invalid inputs, and deliberate failure injection',
    'Functional, performance, load, stress, security, usability and concurrency testing',
    'State transitions and interaction testing for physical objects',
    'Black-box vs white-box reasoning, and when each is appropriate',
    'Writing test cases as (input, expected output) pairs, including the ones you expect to reject',
    'Debugging intermittent failures: reproduce, isolate, minimise, then fix',
    'Instrumenting for a bug you cannot reproduce - logging, assertions, telemetry',
    'Distinguishing a broken implementation from a broken specification',
    'Knowing what cannot be tested directly, and choosing a proxy',
    'Load-testing manually when you have no tools: many clients, a script, a stopwatch',
  ],
  sections: [
    {
      id: 'what-is-assessed',
      title: 'What is actually being assessed',
      takeaway:
        'Not the length of your list. Priorities, structure, how the pieces connect, and whether the plan is doable.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Testing questions come up even for pure development roles, and they take one of four shapes: test a physical object, test a piece of software, write test code for a function, or debug something that is already broken. All four run on the same method.',
        },
        {
          kind: 'p',
          text: 'On the surface the task is "list a lot of test cases". It is not. Four things are being watched:',
        },
        {
          kind: 'bullets',
          items: [
            '**Do you know what the thing is for?** Testing an e-commerce site, product images in the right place matters; customers never being double-charged matters far more. Say which is which.',
            '**Do you see how the pieces fit?** A spreadsheet app is not just open/save/edit - it lives inside an ecosystem of mail, plug-ins and other apps, and the seams are where bugs hide.',
            '**Are you organised?** Reeling off whatever comes to mind is disorganised and guarantees a missed category. Break the thing into parts and work through them.',
            '**Is the plan practical?** "Reinstall the software" is not a diagnosis, and a test that needs five real years of use is not a test. Propose something a team could actually run.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Assume abuse',
          text: 'Whatever you are testing, do not assume the input or the user will play nice. People will use the product in ways you did not design for, feed it garbage, and unplug it halfway through. Every one of those is a test case.',
        },
        {
          kind: 'table',
          headers: ['Axis', 'Question it answers'],
          rows: [
            [
              'Manual vs automated',
              'Can a machine check this, or does it need judgement (is this image acceptable? does this feel slow?)',
            ],
            [
              'Black box vs white box',
              'Do you only get the product, or can you call individual functions and inspect state?',
            ],
          ],
          caption: 'Settle both early - they change what your test plan can even contain.',
        },
        {
          kind: 'p',
          text: 'Automation scales and never gets bored, but only finds what it was told to look for. A human notices problems nobody thought to specify. Real plans use both, and saying so is part of the answer.',
        },
      ],
    },
    {
      id: 'real-world-object',
      title: 'Testing a physical object',
      takeaway:
        'Ask who uses it and why. The question you were given is almost never the question you thought.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: '"How would you test a pen?" is not a joke question. It is a clarification exercise wearing a disguise, and diving straight into test cases fails it.',
        },
        {
          kind: 'steps',
          items: [
            '**Who will use it, and why?** A pen for teachers signing forms and a pen for five-year-olds drawing on clothing are different products with different test plans.',
            '**What are the use cases?** Write them down. Often there are several - write *and* erase, send *and* receive.',
            '**What are the bounds of use?** How many sheets before the paperclip deforms? What temperature range? Numbers, not adjectives.',
            '**What are the stress and failure conditions?** Nothing is failure-proof, so agree what failure should look like. An overloaded washing machine may clean badly; it must not flood the room.',
            '**How would you actually run the tests?** If a chair must survive five years of use, define a "sit", then build a rig - you cannot wait five years.',
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'What the pen conversation looks like',
          text: '"Who uses it?" - children. "What for?" - drawing. "On what?" - clothing. "Felt or ballpoint? Washable or permanent?" - washable felt tip. Six questions in you are testing a washable fabric marker for five-to-ten-year-olds, which is a completely different problem from the one you were handed.',
        },
        {
          kind: 'p',
          text: 'Only now list the tests, and list them by component rather than at random:',
        },
        {
          kind: 'bullets',
          items: [
            '**Fact check** - it really is a felt tip, in one of the four approved colours.',
            '**Intended use** - it writes on fabric, in every colour, on the fabrics it claims to support.',
            '**Intended use** - it washes out, in hot, warm and cold water, after an hour and after a month.',
            '**Safety** - non-toxic, no choking hazard, survives being chewed. Non-negotiable for this user.',
            '**Unintended use** - walls, skin, the sofa; dropped, stamped on, left uncapped, left in the sun.',
            '**Environment and lifecycle** - heat, cold, altitude, ink running out, cap lost.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Interviewers pick ambiguous questions on purpose',
          text: 'Everyone knows what a pen is - which is exactly why it makes a good test of whether you assume or ask. Users make the same wrong assumptions, only by accident.',
        },
      ],
    },
    {
      id: 'software-system',
      title: 'Testing a system',
      takeaway: 'Break it into components, then walk the same categories across every component.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Testing software follows the same five steps, with more weight on *how* you would run the tests. Settle black box versus white box, then who the users are - note the plural. Parental-control software has parents configuring it, children subject to it, and guests who should be neither.',
        },
        { kind: 'anim', animId: 't-matrix' },
        {
          kind: 'p',
          text: 'The grid is the whole technique. Down one side, the components. Across the top, the kinds of test. Then fill it in, out loud.',
        },
        {
          kind: 'table',
          headers: ['Kind of test', 'What it asks'],
          rows: [
            ['Functional', 'Does the normal path produce the right result?'],
            ['Boundary', 'What happens at, just below and just above every stated limit?'],
            [
              'Invalid input',
              'What happens on garbage - and is that a documented behaviour or an accident?',
            ],
            [
              'Failure injection',
              'Kill the network, the power, the disk mid-operation. What is the state afterwards?',
            ],
            [
              'Concurrency',
              'Two operations on the same data at once. Can money be created or destroyed?',
            ],
            [
              'Performance and load',
              'How does it behave at 1x, 10x, 100x expected traffic? Where does it break, and how?',
            ],
            ['Security', 'Can a user reach data that is not theirs? Are secrets logged?'],
            ['Usability', 'Can the actual user complete the task? Needs a human.'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'State the priority order',
          text: 'For an ATM: money is always accounted for, and accounts are always protected. Everything else - screen layout, receipt formatting - comes after. Knowing what matters most about a system is the "big picture understanding" signal.',
        },
        {
          kind: 'p',
          text: '**Load testing with no tools.** Decide the metrics first: response time, throughput, resource use, and the maximum load the system survives. Then build the tool - a multithreaded client where each thread behaves like one user, hammering the page and recording its own timings. Ramp the thread count until a metric falls off a cliff, and compare against the target. The point of the answer is that "no tools" means write one, not give up.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Say what you would automate',
          text: 'Standard paths: automated. Race conditions: automated, in a closed system with fake accounts, because a human will never hit them reliably. Card reader jams and receipt legibility: manual. Splitting the list this way is a large part of the answer.',
        },
      ],
    },
    {
      id: 'function',
      title: 'Testing a function',
      takeaway: 'Four categories of input, an expected result for each, then the code.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The easiest of the four shapes, because the scope is small - but do not skip the conversation. Ask what should happen on illegal input before you decide it for yourself.',
        },
        { kind: 'anim', animId: 't-boundaries' },
        {
          kind: 'steps',
          items: [
            '**Normal cases.** The typical input, and any typical input the implementation might treat differently - an odd-length array for something that partitions, for instance.',
            '**Extremes.** Empty, one element, and something very large.',
            '**Illegal input.** Null, negative where negative makes no sense. Agree first whether it returns an error or throws, then test that.',
            '**Strange but legal input.** Already sorted, reverse sorted, all identical, all duplicates.',
          ],
        },
        {
          kind: 'p',
          text: 'Then define the expected result for each - which is not always just the output. If a sort returns a new array, the test should also assert that the original was left alone. Only then write the code, as plain (input, expected) assertions.',
        },
        {
          kind: 'code',
          lang: 'ts',
          code: `test('addThreeSorted keeps the list ordered', () => {
  const list = new MyList();
  list.addThreeSorted(3, 1, 2);
  expect(list.toArray()).toEqual([1, 2, 3]);
});`,
          caption: 'Once the cases are chosen, writing them down is the easy part.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'A broken spec looks exactly like a broken implementation',
          text: 'Asked to test `boolean canMoveTo(int x, int y)` on a chess `Piece`, notice that the signature cannot express "off the board" separately from "not allowed". Before writing tests, ask what it should do for x = −1: return false, or throw? A test suite written against a guess tests your guess.',
        },
        {
          kind: 'p',
          text: 'For `canMoveTo`, split the work in two. Extreme-case validation: negative coordinates, coordinates past the board width and height, a completely full board, an empty board, wildly unbalanced piece counts. Then general testing: you cannot enumerate every board, so cover the space systematically instead - for each piece type, against each other piece type and empty space, in each direction, build a small board and check the return value. Recognising that exhaustive testing is impossible, and choosing sensible coverage instead, is the answer.',
        },
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Debugging what you cannot reproduce',
      takeaway:
        'Understand the scenario, break the flow into testable steps, then halve the search space.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: '"Chrome crashes on launch for this user - what do you do?" Reinstalling might fix that one user and teaches you nothing. The goal is to find out what is actually happening so it can be fixed for everyone.',
        },
        {
          kind: 'steps',
          items: [
            '**Understand the scenario.** How long has it happened? Which version, which OS? Every time, or sometimes? What changed just before it started? Is there a crash report?',
            '**Break the problem into testable units.** Click icon → process starts → settings load → request homepage → response arrives → parse → render. The failure is at one of those joints.',
            '**Make each step a specific, manageable test.** Something you can do yourself, or realistically ask the user to do. "Launch with a blank homepage" is a test; "recompile with symbols" is not, for a customer.',
            '**Narrow, then fix.** Once you know which step, reduce to the smallest input that still fails - and only then change code.',
          ],
        },
        { kind: 'anim', animId: 't-bisect' },
        {
          kind: 'p',
          text: 'Bisection works on anything monotone: builds, commits, config flags, input size, the number of rows in a file. It turns a linear hunt into a logarithmic one, and it is the highest-leverage debugging habit there is.',
        },
        {
          kind: 'p',
          text: '**The intermittent crash.** A single-threaded C program using only the standard library crashes in a different place every run. Ten runs, ten stacks. What could do that?',
        },
        {
          kind: 'table',
          headers: ['Cause', 'Why it moves around', 'How to test it'],
          rows: [
            [
              'Something genuinely varying',
              'User input, a random number, the clock, file contents',
              'Pin the input; seed the generator; freeze the clock and re-run',
            ],
            [
              'Uninitialised variable',
              'Reads whatever was in that memory - different each run',
              'A memory checker or sanitiser flags it in one run',
            ],
            [
              'Memory corruption or exhaustion',
              'Heap overflow, stack smashing, or a leak that only sometimes runs out',
              'Watch memory over time; run under a sanitiser; shrink the workload',
            ],
            [
              'External dependency',
              'Another process, machine or resource is not always there or not always fast',
              'Close everything else; run on a clean machine; stub the dependency',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Change one thing at a time',
          text: 'Eliminate rather than guess: disable parts of the program, close other applications, run it on a different machine, track resource use. Every variable you remove shrinks the space the bug can hide in. Shotgun debugging - three changes at once - tells you nothing when the symptom moves.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'When you cannot reproduce it at all',
          text: 'Instrument and wait. Add logging around the suspect path, add assertions that fail loudly on states you believe impossible, and ship telemetry that records the shape of the failure. A bug that happens on one machine in ten thousand is found by data, not by staring - and "here is what I would instrument" is a perfectly strong answer.',
        },
        {
          kind: 'p',
          text: 'Some things cannot be measured directly at all, and then you pick a proxy and say that you are: crash-free session rate for stability, time-to-first-render for perceived speed, a task-completion rate for usability. Naming the proxy, and its limits, beats claiming you can measure the thing itself.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'te-1',
      kind: 'concept',
      prompt: 'You are asked how you would test a pen. The first move is:',
      options: [
        'List twenty test cases quickly to show breadth',
        'Ask who uses it and what for - the answer changes the entire plan',
        'Split into ink, tip, barrel and cap',
        'Ask whether it is black box or white box',
      ],
      answerIndex: 1,
      explain:
        'A pen for children drawing on clothing and a pen for signing documents are different products. The question is deliberately ambiguous.',
    },
    {
      id: 'te-2',
      kind: 'technique',
      prompt: 'Which is the strongest way to structure an answer to "test an ATM"?',
      options: [
        'Everything you can think of, in the order it occurs to you',
        'Components down one axis and kinds of test across the other, worked through systematically',
        'Only the security cases, since that is what matters most',
        'Only cases that can be automated',
      ],
      answerIndex: 1,
      explain:
        'The grid is what prevents a missed category, and demonstrating structure is a large part of what the question measures.',
    },
    {
      id: 'te-3',
      kind: 'concept',
      prompt: 'A spec says a function accepts values from 1 to 100. The highest-value tests are:',
      options: [
        'A hundred values spread across the range',
        '0, 1, 100 and 101 - both sides of each boundary, plus the boundaries themselves',
        '50, because it is representative',
        'Only the invalid values',
      ],
      answerIndex: 1,
      explain:
        'A boundary is a pair of neighbouring values treated differently. Interior values almost all behave the same, so one representative covers them.',
    },
    {
      id: 'te-4',
      kind: 'concept',
      prompt:
        'What is wrong with `unsigned int i; for (i = 100; i >= 0; --i) printf("%d\\n", i);`?',
      options: [
        'Nothing - it prints 100 down to 0',
        'An unsigned value is never negative, so the condition never fails and 0 wraps to a huge number - and %d is wrong for unsigned',
        'The decrement should be postfix',
        'printf cannot take an unsigned int',
      ],
      answerIndex: 1,
      explain:
        'Use i > 0 and print 0 separately if you need it. %u is the correct format for an unsigned value.',
    },
    {
      id: 'te-5',
      kind: 'technique',
      prompt:
        'Asked to test `boolean canMoveTo(int x, int y)`, you notice it cannot distinguish "off the board" from "not allowed". You should:',
      options: [
        'Write tests assuming it returns false',
        'Raise it with the interviewer and agree the behaviour before writing tests',
        'Skip the invalid coordinate cases',
        'Rewrite the method signature first',
      ],
      answerIndex: 1,
      explain:
        'A broken specification and a broken implementation look identical from the outside. Tests written against a guess only test the guess.',
    },
    {
      id: 'te-6',
      kind: 'technique',
      prompt: 'You must load test a web page and have no testing tools. The right answer is:',
      options: [
        'Explain that load testing is impossible without tools',
        'Decide the metrics, then write a multithreaded client where each thread behaves as one user and records its own timings',
        'Refresh the page manually as fast as possible',
        'Estimate capacity from the server specification',
      ],
      answerIndex: 1,
      explain:
        'Response time, throughput, resource use and maximum sustainable load - then build the simulator yourself and ramp until something breaks.',
    },
    {
      id: 'te-7',
      kind: 'concept',
      prompt:
        'A single-threaded C program crashes in a different place every run. Which is NOT a plausible cause?',
      options: [
        'An uninitialised variable picking up whatever was in memory',
        'A race condition between two threads',
        'Heap corruption or running out of memory',
        'An external dependency that is not always available',
      ],
      answerIndex: 1,
      explain:
        'The program is single-threaded, so there is no second thread to race. Varying input, uninitialised memory, corruption and dependencies all remain live.',
    },
    {
      id: 'te-8',
      kind: 'technique',
      prompt:
        'A regression appeared somewhere in the last 1024 builds. Bisection finds it in about:',
      options: ['1024 runs', '512 runs', '10 runs', '32 runs'],
      answerIndex: 2,
      explain:
        'Each probe halves the range, so it is log₂(1024) = 10. Bisection works on anything monotone: builds, commits, flags, input size.',
    },
    {
      id: 'te-9',
      kind: 'concept',
      prompt: 'The strongest reason to keep manual testing in a plan that is mostly automated is:',
      options: [
        'Automation is expensive to write',
        'A machine only finds what it was told to look for, while a person notices problems nobody specified',
        'Manual testing is faster',
        'Some languages cannot be automated',
      ],
      answerIndex: 1,
      explain:
        'Judgement calls and unspecified oddities need a human. Automation is for scale and repetition - real plans use both.',
    },
    {
      id: 'te-10',
      kind: 'technique',
      prompt:
        'You cannot reproduce a bug that a small fraction of users hit. The best next step is:',
      options: [
        'Close the report as not reproducible',
        'Instrument: add logging on the suspect path, assertions on states you believe impossible, and telemetry to capture the failure shape',
        'Rewrite the component',
        'Ask every user to reinstall',
      ],
      answerIndex: 1,
      explain:
        'Rare bugs are found with data, not by staring. Naming what you would instrument is a complete answer to this kind of question.',
    },
  ],
  drills: [
    {
      slug: 'first-bad-version',
      note: 'Bisection as a debugging technique, made into an algorithm.',
    },
    {
      slug: 'valid-number',
      note: 'A specification exercise: enumerate every case before writing code.',
    },
    { slug: 'guess-number-higher-or-lower', note: 'Interactive testing against a hidden oracle.' },
    {
      slug: 'find-the-index-of-the-first-occurrence-in-a-string',
      note: 'Small enough to write an exhaustive test list for.',
    },
  ],
  practice: [
    {
      id: 'test-a-pen',
      title: 'Write a full test plan for a physical object',
      detail:
        'Pick a pen, a lift or a coffee machine. Start by asking who uses it and for what, then decompose it into components, then list normal, boundary, abuse and environmental cases. Twenty minutes, out loud.',
    },
    {
      id: 'test-an-atm',
      title: 'Test a component inside a distributed system',
      detail:
        'Take an ATM. Cover the local device, the network, the bank backend, concurrency (two withdrawals at once), partial failure (network drops mid-transaction) and security. Say which parts you would automate.',
    },
    {
      id: 'debug-intermittent',
      title: 'Rehearse the intermittent-crash script',
      detail:
        'Given "it crashes about one run in fifty", practise the answer: what changes between runs (state, memory, timing, environment, input), how you would narrow it, and what you would instrument.',
    },
  ],
};
