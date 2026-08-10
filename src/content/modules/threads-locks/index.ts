import type { CourseModule } from '../../types';

export const threadsLocks: CourseModule = {
  id: 'threads-locks',
  title: 'Threads and Locks',
  track: 'reference',
  status: 'complete',
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
  sections: [
    {
      id: 'threads-and-races',
      title: 'Processes, threads, and the race underneath',
      takeaway: 'Shared memory is the feature and the bug. `count++` is three operations.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'It is not common to be asked to *implement* a threaded algorithm outside teams that need it. It is very common to be asked whether you understand threads - and above all, deadlock. Start with the distinction question 15.1 asks for.',
        },
        {
          kind: 'table',
          headers: ['', 'Process', 'Thread'],
          rows: [
            ['Memory', 'Its own address space', 'Shares the process heap; has its own stack and registers'],
            ['Isolation', 'Cannot touch another process\'s memory', 'Sees every change a sibling makes, immediately'],
            ['Communication', 'Pipes, sockets, files, shared memory - explicit and slower', 'Just read the variable - fast, and dangerous'],
            ['Failure', 'A crash is contained', 'A crash usually takes the whole process down'],
            ['Cost to create', 'Heavier', 'Lighter'],
          ],
        },
        {
          kind: 'p',
          text: 'In Java a thread is either a class implementing `Runnable` and passed to a `Thread`, or a subclass of `Thread` itself; either way you call `start()`, never `run()` - calling `run()` directly just executes it on the current thread. Prefer `Runnable`: Java has single inheritance, so extending `Thread` spends the one base class you get, and most classes only want to *be runnable*, not to *be a thread*.',
        },
        { kind: 'anim', animId: 'tl-race' },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Three guarantees, lost independently',
          text: '**Atomicity** - an operation completes without another thread getting between its parts (`count++` is a read, an add and a write). **Visibility** - a write by one thread is actually seen by another, rather than sitting in a register or a core-local cache. **Ordering** - operations appear to happen in program order, which compilers and CPUs are otherwise free to rearrange. A lock gives you all three; `volatile` gives you only visibility.',
        },
        {
          kind: 'p',
          text: 'Two failure modes are worth naming apart. A **safety** failure means something wrong happened - a lost update, a corrupted structure. A **liveness** failure means nothing happens at all: deadlock, livelock (threads politely backing off forever), or starvation, where a thread is repeatedly passed over while others make progress. Safety bugs give wrong answers; liveness bugs give no answer.',
        },
      ],
    },
    {
      id: 'locks',
      title: 'Mutual exclusion: synchronized, locks and monitors',
      takeaway: 'A lock protects an object, not a method - and only the code that takes it.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: '`synchronized` on a method means: while a thread is inside it, no other thread may enter *any* synchronized method **on the same object**. The lock belongs to the instance, not to the method - which is what question 15.6 is really about.',
        },
        {
          kind: 'code',
          lang: 'java',
          caption: 'Same object or different object?',
          code: `MyObject obj1 = new MyObject(), obj2 = new MyObject();
new MyClass(obj1, "1").start();
new MyClass(obj2, "2").start();   // different instances -> both run foo() at once

MyObject obj = new MyObject();
new MyClass(obj, "1").start();
new MyClass(obj, "2").start();    // same instance -> one waits for the other`,
        },
        {
          kind: 'bullets',
          items: [
            '**Two threads, same instance, both calling synchronized `A`** - no. One waits.',
            '**Two threads, different instances** - yes. Two different locks.',
            '**One thread in synchronized `A`, another in unsynchronized `B`** - yes, always. `B` never asks for the lock, so nothing stops it. This is the part people get wrong, and it matters: if `B` touches the same state, synchronizing `A` alone protects nothing.',
            '**`static synchronized`** - locks the *class*, not an instance, so two threads cannot run two different static synchronized methods of the same class at once, whatever objects they hold.',
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The rule that follows',
          text: 'A lock is a convention, not a fence. It only protects state if *every* path that touches that state takes the same lock. One unsynchronized accessor is enough to reintroduce the race you thought you had removed.',
        },
        {
          kind: 'p',
          text: 'A **synchronized block** narrows the critical section to the lines that need it - `synchronized (this) { … }` - which matters because holding a lock across slow work (I/O, a network call) serialises everything. An explicit **`Lock`** object goes further: it can be passed around, acquired in one method and released in another, and offers `tryLock()`, which returns false instead of blocking. That single capability is what makes several deadlock strategies possible.',
        },
        {
          kind: 'p',
          text: 'A **monitor** is a lock plus a waiting room. `wait()` releases the lock and parks the thread; `notify()`/`notifyAll()` wakes waiters, which then re-acquire the lock before continuing. It is how you say "sleep until this condition might have changed" without burning a core spinning. Two rules make it work: always call `wait()` inside a `while` loop re-checking the condition, never an `if` (wake-ups can be spurious, and another thread may have taken the state again before you re-acquired), and prefer `notifyAll()` unless you can prove any single waiter will do.',
        },
        {
          kind: 'p',
          text: 'The same primitives appear everywhere under other names: a **semaphore** is a counter of permits with no owner, a **latch** blocks until a count reaches zero, a **barrier** holds every thread until all have arrived, and a **condition variable** is the wait/notify pair split out from the lock. Recognising them by behaviour rather than by name is what lets you answer these questions in any language.',
        },
      ],
    },
    {
      id: 'deadlock',
      title: 'Deadlock: the four conditions, and the one you break',
      takeaway: 'Circular wait is the removable one. A global lock order kills it.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Deadlock is when a thread waits for a lock another thread holds, while that thread waits for a lock the first one holds. Both wait forever. Nothing crashes and nothing logs - the program simply stops making progress.',
        },
        { kind: 'anim', animId: 'tl-deadlock' },
        {
          kind: 'table',
          caption: 'All four must hold at once - remove any one and deadlock is impossible',
          headers: ['Condition', 'Meaning', 'Can you remove it?'],
          rows: [
            ['Mutual exclusion', 'Only one thread can hold the resource', 'Rarely - it is usually the whole point of the lock'],
            ['Hold and wait', 'A thread holding one resource may request another', 'Sometimes: acquire everything at once, or nothing'],
            ['No preemption', 'You cannot take a resource off another thread', 'Sometimes, with `tryLock()` and a back-off'],
            ['Circular wait', 'A cycle of threads each waiting on the next', '**Yes** - impose a global order. This is the practical answer'],
          ],
        },
        {
          kind: 'p',
          text: '**15.3, the dining philosophers.** Five philosophers around a table, one chopstick between each, each needs both to eat, and each reaches left first. If they all reach left at once, everyone holds one chopstick and waits forever - a textbook cycle. Two fixes, and the contrast between them is the lesson:',
        },
        {
          kind: 'bullets',
          items: [
            '**All or nothing.** Use `tryLock()`: if the second chopstick is unavailable, put the first one down and retry. That removes hold-and-wait, and it works - but nothing prevents perfectly synchronised philosophers from grabbing, failing and releasing in lockstep forever. It is deadlock-free but not livelock-free.',
            '**Prioritised chopsticks.** Number them 0..n-1 and make every philosopher take the lower-numbered one first. Four of them still go left-then-right; the last one goes right-then-left, and that one asymmetry breaks the ring. No cycle can form, because every edge points from a lower number to a higher one and can never point back.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'This is the answer you rehearse',
          text: 'Name the four conditions, give the two-lock example, then show that ordering the locks removes the circular wait. That is the two-minute answer, and it is asked far more often than anything here is coded.',
        },
        {
          kind: 'p',
          text: '**15.4, a class that grants a lock only when no deadlock is possible.** Have each thread *declare its lock order up front*, then model those declarations as a graph: an edge (v, w) means some thread will request w immediately after v. A deadlock is exactly a cycle in that graph, so on each `declare` you add the new edges and depth-first search for a cycle - if one appears, back the edges out and reject the declaration. Only the newly added edges can have created a cycle, so you only need to search from those, and a three-state visited marker (fresh, visiting, visited) is what distinguishes a genuine back edge from a node you have merely seen before.',
        },
        {
          kind: 'p',
          text: 'And **15.2, measuring a context switch**: the honest answer is that it is hard, and saying why is the point. You cannot timestamp the switch itself, and the operating system is switching for its own reasons throughout. The trick is to force a switch you can bracket: two processes play ping-pong with a token over a pipe, so sending the token blocks the sender and makes the receiver runnable. Time the full round trip, subtract the send/receive cost measured by having a process ping itself (no switch there), and halve. Run it many times and take the *minimum*, because every source of noise only ever adds. Then say out loud that it is still an approximation that depends on the scheduler.',
        },
      ],
    },
    {
      id: 'coordination',
      title: 'Making threads take turns',
      takeaway: 'Semaphores and shared-state loops - and what all this means in JavaScript.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'The other half of the chapter is not mutual exclusion but **ordering**: not "keep them apart" but "make them go in this sequence".',
        },
        { kind: 'anim', animId: 'tl-ordering' },
        {
          kind: 'code',
          lang: 'java',
          caption: '15.5 - guarantee first, then second, then third',
          code: `public class Foo {
  private Semaphore sem1 = new Semaphore(1), sem2 = new Semaphore(1);

  public Foo() throws InterruptedException {
    sem1.acquire();      // drain both to zero, so second and third block
    sem2.acquire();
  }

  public void first()  { /* work */ sem1.release(); }

  public void second() throws InterruptedException {
    sem1.acquire(); sem1.release();   // wait for first, then let others through
    /* work */
    sem2.release();
  }

  public void third() throws InterruptedException {
    sem2.acquire(); sem2.release();
    /* work */
  }
}`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Why not two locks?',
          text: 'A Java lock is *owned* by the thread that acquired it, and only that thread may release it. Locking in the constructor and unlocking from three different threads throws at run time. A semaphore is just a permit count with no owner, which is exactly why it fits here.',
        },
        {
          kind: 'p',
          text: '**15.7, multithreaded FizzBuzz.** Four threads share one counter: one prints "FizzBuzz", one "Fizz", one "Buzz", one the number. Each loops on the shared state, and inside a single synchronized block it must check the bound, test its own divisibility predicate, print, and increment - all four together. Split that block and `current` can change between the bound check and the print, so the loop overshoots or a number gets printed twice. The clean factoring is one thread class parameterised by a predicate and a printer, so the four differ only in data. And do not forget the single-threaded lesson underneath: test divisibility by 15 *before* 3 and 5, or the output is wrong before threads are even involved.',
        },
        {
          kind: 'p',
          text: 'The "everyone waits, then everyone goes" shape - one H thread and two O threads forming a water molecule, or any batch that must assemble before it proceeds - is a **barrier**, usually built from semaphores with more than one permit, or from a purpose-built `CyclicBarrier`. Same idea: permits meter how many may proceed.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'What this means in JavaScript',
          text: 'The main thread runs one thing at a time, so there are no *data* races: no torn writes, no lost `count++`. There are still **logical** races. Two in-flight requests writing the same state and landing out of order gives you the stale one; a `check-then-act` across an `await` is exactly the read-modify-write hazard, because anything can run between the two halves; and a closure captured before an await can read state that has since changed. The fixes rhyme with locks: sequence the work, keep a request id and ignore stale responses, or cancel. Web Workers reintroduce real parallelism, and `SharedArrayBuffer` plus `Atomics` reintroduces genuine data races along with it.',
        },
        {
          kind: 'p',
          text: 'Two design habits carry across all of it. Prefer not sharing at all - immutable data, message passing, and per-thread state have no races to reason about. And when you must share, hold the lock for as little as possible and always in the same order, because every additional line under a lock is contention, and every inconsistent order is a future cycle.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'tl-1',
      kind: 'concept',
      prompt: 'What is the essential difference between a process and a thread?',
      options: [
        'Threads are faster to create',
        'Processes have separate address spaces; threads share the heap and see each other\'s writes immediately',
        'Only processes can run in parallel',
        'Threads cannot crash',
      ],
      answerIndex: 1,
      explain:
        'Shared memory is why thread communication is cheap - and why it needs synchronisation at all.',
    },
    {
      id: 'tl-2',
      kind: 'concept',
      prompt: 'Two threads each run `count++` on a shared counter, unprotected. What can happen?',
      options: [
        'Nothing - `++` is atomic',
        'Both read the same value, both add one, and one write overwrites the other: two increments, one result',
        'The program crashes',
        'The counter becomes negative',
      ],
      answerIndex: 1,
      explain:
        'It is read, add, write. A lost update is silent, and on most runs the interleaving does not happen at all.',
    },
    {
      id: 'tl-3',
      kind: 'concept',
      prompt:
        'Thread 1 is inside synchronized method A on an object. Can thread 2 run unsynchronized method B on the same object?',
      options: [
        'No - the object is locked',
        'Yes - B never asks for the lock, which is why synchronizing only some methods protects nothing',
        'Only if B is static',
        'Only after A returns',
      ],
      answerIndex: 1,
      explain:
        'A lock is a convention. It protects state only if every path touching that state takes the same lock.',
    },
    {
      id: 'tl-4',
      kind: 'concept',
      prompt: 'What does a `static synchronized` method lock?',
      options: [
        'The instance it is called on',
        'The class - so two threads cannot run two different static synchronized methods of that class at once',
        'Nothing; static methods are not synchronizable',
        'Every object of that class individually',
      ],
      answerIndex: 1,
      explain:
        'There is no instance, so the lock is the class object. Different methods, same class, still mutually exclusive.',
    },
    {
      id: 'tl-5',
      kind: 'concept',
      prompt: 'Which of the four deadlock conditions is the one you actually break in practice?',
      options: [
        'Mutual exclusion',
        'Circular wait - by imposing a global order on lock acquisition',
        'No preemption',
        'Hold and wait, always',
      ],
      answerIndex: 1,
      explain:
        'The first three are usually not yours to give up. Ordering makes a cycle inexpressible: edges only point upward.',
    },
    {
      id: 'tl-6',
      kind: 'technique',
      prompt:
        'Dining philosophers, solved by putting the left chopstick back when the right is unavailable. What flaw remains?',
      options: [
        'It can still deadlock',
        'Livelock: perfectly synchronised philosophers can grab, fail and release in lockstep forever',
        'It uses too much memory',
        'It requires a global lock',
      ],
      answerIndex: 1,
      explain:
        'Deadlock-free is not the same as making progress. Numbering the chopsticks breaks the ring outright.',
    },
    {
      id: 'tl-7',
      kind: 'technique',
      prompt: 'Three threads must call `first`, `second`, `third` in order. Why semaphores rather than two locks?',
      options: [
        'Semaphores are faster',
        'A lock is owned by the thread that took it, so unlocking from a different thread throws. A semaphore has no owner',
        'Locks cannot be used in constructors',
        'Semaphores support timeouts',
      ],
      answerIndex: 1,
      explain:
        'The constructor drains both permits; each method releases the next one. Lock ownership is what defeats the lock version.',
    },
    {
      id: 'tl-8',
      kind: 'technique',
      prompt:
        'Multithreaded FizzBuzz: four threads share a counter. What must be inside one synchronized block?',
      options: [
        'Only the print',
        'The bound check, the divisibility test, the print and the increment - all four together',
        'Only the increment',
        'Nothing; the counter can be volatile',
      ],
      answerIndex: 1,
      explain:
        'Split them and `current` can change between the check and the print - so the loop overshoots or repeats a number.',
    },
    {
      id: 'tl-9',
      kind: 'concept',
      prompt: 'Why call `wait()` inside a `while` loop rather than an `if`?',
      options: [
        'It is only a style preference',
        'Wake-ups can be spurious, and another thread may have consumed the condition before you re-acquired the lock',
        '`if` does not compile inside synchronized blocks',
        'To avoid deadlock',
      ],
      answerIndex: 1,
      explain:
        'Waking up means "the condition may have changed", never "the condition holds". Always re-check it.',
    },
    {
      id: 'tl-10',
      kind: 'concept',
      prompt: 'How much of this applies to single-threaded JavaScript?',
      options: [
        'None - the event loop removes all concurrency bugs',
        'Data races go away, but logical races do not: out-of-order responses, check-then-act across an `await`, stale closures',
        'All of it, unchanged',
        'Only in Node, not in browsers',
      ],
      answerIndex: 1,
      explain:
        'Anything can run between the two halves of an `await`. Workers plus SharedArrayBuffer bring the real data races back too.',
    },
  ],
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
