import type { CourseModule } from '../../types';

export const threadsLocks: CourseModule = {
  id: 'threads-locks',
  title: 'Threads and Locks',
  track: 'reference',
  status: 'outline',
  source: 'Chapter 15',
  summary:
    'Reference track. The book is Java-specific, but races, deadlock and ordering guarantees are the same everywhere - including async JavaScript.',
  estimatedMinutes: 60,
  concepts: [
    'Processes vs threads: separate address spaces vs shared memory, and the cost of communication between each',
    'Thread lifecycle, and the Runnable/Thread patterns in Java',
    'Race conditions: two threads interleaving on shared mutable state',
    'Atomicity, visibility and ordering as three separate guarantees you can lose independently',
    'Mutual exclusion: synchronized methods, synchronized blocks and explicit Lock objects',
    'What a synchronized method locks (the instance) vs a static synchronized method (the class)',
    'Whether an unsynchronized method can run while a synchronized one holds the lock - yes, and why that matters',
    'Monitors, wait/notify, and condition variables',
    'The four conditions required for deadlock: mutual exclusion, hold and wait, no preemption, circular wait',
    'Breaking any one of the four to prevent deadlock, and global lock ordering as the practical choice',
    'Detecting a potential deadlock by looking for a cycle in the wait-for graph before granting a lock',
    'Enforcing execution order across threads with latches, semaphores or condition variables',
    'Barriers and coordinated multi-thread output (the FizzBuzz and dining-philosophers patterns)',
    'Starvation and liveness, as distinct from safety',
    'Measuring context-switch cost, and why the measurement is dominated by noise',
    'How this maps to JavaScript: a single-threaded event loop removes data races, but async interleaving still creates logical races; workers reintroduce real parallelism',
  ],
  plannedAnimations: [
    'Two threads interleaving on a shared counter, producing a lost update',
    'The four deadlock conditions on a wait-for graph, and the cycle appearing',
    'Global lock ordering preventing that cycle from ever forming',
    'A semaphore admitting a limited number of philosophers to the table',
  ],
  sections: [],
  quiz: [],
  drills: [
    { slug: 'print-in-order', note: 'CTCI 15.5 - the simplest ordering primitive.' },
    { slug: 'print-foobar-alternately', note: 'Two threads taking strict turns.' },
    { slug: 'fizz-buzz-multithreaded', note: 'CTCI 15.7 - four threads, one ordered output.' },
    { slug: 'building-h2o', note: 'Barrier-style coordination with a ratio constraint.' },
    { slug: 'the-dining-philosophers', note: 'CTCI 15.3 - deadlock avoidance, done properly.' },
  ],
  practice: [
    {
      id: 'tl-explain',
      title: 'Explain deadlock in two minutes',
      detail:
        'Name the four conditions, give a two-lock example, then show how a global lock ordering removes the circular wait. This is asked far more often than it is coded.',
    },
    {
      id: 'tl-js',
      title: 'Write down the JavaScript translation',
      detail:
        'No data races on the main thread, but async races are real: two in-flight requests writing the same state, stale closures, and missing cancellation. Have an example from your own work ready.',
    },
  ],
};
