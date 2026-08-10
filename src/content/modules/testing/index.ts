import type { CourseModule } from '../../types';

export const testing: CourseModule = {
  id: 'testing',
  title: 'Testing',
  track: 'techniques',
  status: 'outline',
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
  plannedAnimations: [
    'A test-matrix filling in: components down one axis, test types across the other',
    'Bisecting a failure across a range of runs to isolate the trigger',
    'The boundary-value number line: below, at, and above each limit',
  ],
  sections: [],
  quiz: [],
  drills: [
    { slug: 'first-bad-version', note: 'Bisection as a debugging technique, made into an algorithm.' },
    { slug: 'valid-number', note: 'A specification exercise: enumerate every case before writing code.' },
    { slug: 'guess-number-higher-or-lower', note: 'Interactive testing against a hidden oracle.' },
    { slug: 'find-the-index-of-the-first-occurrence-in-a-string', note: 'Small enough to write an exhaustive test list for.' },
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
