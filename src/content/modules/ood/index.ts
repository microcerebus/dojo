import type { CourseModule } from '../../types';

export const ood: CourseModule = {
  id: 'ood',
  title: 'Object-Oriented Design',
  track: 'system-design',
  status: 'outline',
  source: 'Chapter 7',
  summary:
    'Turn a vague noun ("design a parking lot") into objects, responsibilities and relationships, without over-engineering.',
  estimatedMinutes: 60,
  concepts: [
    'Clarifying first: who uses it, what are the use cases, what is in and out of scope, what scale',
    'Asking whether it is one instance or many, and what the persistence story is',
    'Identifying the core objects - the handful of nouns the problem is really about',
    'Analysing relationships: has-a vs is-a, one-to-many, many-to-many',
    'Assigning responsibilities: each object owns its own state and rules',
    'Composition over inheritance, and where inheritance genuinely fits',
    'Interfaces, encapsulation and hiding state behind behaviour',
    'Modelling state transitions explicitly (an enum plus the legal moves between values)',
    'Extensibility without premature abstraction - design for the change they mention, not every change',
    'Singleton: what it is, and its testability and coupling costs',
    'Factory: creating the right subclass without the caller knowing which',
    'Observer, strategy and state as the other patterns worth naming',
    'Separating domain model, orchestration, persistence and presentation',
    'Walking the use cases back through your design to prove it works',
  ],
  plannedAnimations: [
    'A design growing: nouns extracted, then relationships drawn, then responsibilities assigned',
    'A state machine for a parking spot or a chat message, with legal transitions highlighted',
    'Composition vs inheritance on the same problem, side by side',
  ],
  sections: [],
  quiz: [],
  drills: [
    { slug: 'design-parking-system', note: 'CTCI 7.4 in miniature - then design the full version on paper.' },
    { slug: 'design-hashmap', note: 'CTCI 7.12 - separate chaining, implemented properly.' },
    { slug: 'design-underground-system', note: 'Choosing the right keys is the whole design.' },
    { slug: 'design-browser-history', note: 'Two stacks, or a doubly linked list - justify the choice.' },
    { slug: 'design-circular-deque', note: 'CTCI 7.9 - circular array with a rotation offset.' },
    { slug: 'minesweeper', note: 'CTCI 7.10 - cascading reveal, modelled cleanly.' },
    { slug: 'design-in-memory-file-system', note: 'CTCI 7.11 - the composite pattern. Premium.' },
  ],
  practice: [
    {
      id: 'ood-whiteboard-set',
      title: 'Whiteboard four designs in 25 minutes each',
      detail:
        'Deck of cards (then blackjack), call centre with escalation, jukebox, and chat server. For each: clarify, list core objects, draw relationships, assign responsibilities, then walk two use cases through it.',
    },
    {
      id: 'ood-patterns',
      title: 'Be able to defend singleton and factory',
      detail:
        'Write down when you would use each, and the argument against singleton (global state, hidden coupling, hard to test). Interviewers often push on this.',
    },
  ],
};
