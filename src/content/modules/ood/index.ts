import type { CourseModule } from '../../types';

export const ood: CourseModule = {
  id: 'ood',
  title: 'Object-Oriented Design',
  track: 'system-design',
  status: 'complete',
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
  sections: [
    {
      id: 'the-method',
      title: 'The method',
      takeaway: 'Clarify, name the objects, draw the relationships, walk a use case. In that order.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'An object-oriented design question is a two-word prompt - "design a parking lot", "design a jukebox" - and the vagueness is the test. The interviewer wants to see whether you assume or ask. Four steps get you through every one of them.',
        },
        { kind: 'anim', animId: 'ood-method' },
        {
          kind: 'steps',
          items: [
            '**Handle ambiguity.** Who uses this, and how? What are the top use cases? What is explicitly out of scope? How many of these exist, and does anything survive a restart? A coffee machine for a restaurant serving hundreds an hour and a coffee machine for one elderly user are different designs; the words are identical.',
            '**Define the core objects.** The handful of nouns the problem is really about. For a restaurant: Table, Party, Guest, Order, Meal, Employee, Server, Host. Each usually becomes a class.',
            '**Analyse relationships.** Which object holds which? A Party has many Guests. A Table has one Party - unless communal tables exist, which is a question, not an assumption. Server and Host are Employees. Name each relationship as one-to-one, one-to-many or many-to-many.',
            '**Investigate actions.** Walk a real use case end to end: a party arrives, asks the host for a table, the host checks reservations, seats them or queues them; on leaving, the table frees and takes the next party. This is where you discover the objects you forgot.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Say your assumptions out loud',
          text: 'You will have to assume something - nobody can specify a jukebox in five minutes. The scoring is not "did you guess right"; it is "did you notice you were guessing". Name the assumption, then design against it.',
        },
        {
          kind: 'p',
          text: 'A useful set of clarifying questions to keep in your head, roughly the "six Ws": who uses it, what must it do, where does it run (one machine, one building, many), when does state change, how do users reach it, and why does it exist at all. Two more earn their place in nearly every question: **is there one instance or many**, and **does anything need to outlive the process** - because persistence is the difference between a data structure and a system.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Scope down, deliberately',
          text: 'A chat server is months of work. Say so, then pick a slice you can actually design in the time - users, presence, conversations, message delivery - and say what you are leaving out: voice, video, file transfer, the network layer. Naming the boundary is worth more than sprawling across all of it.',
        },
      ],
    },
    {
      id: 'relationships',
      title: 'Has-a, is-a, and where inheritance goes wrong',
      takeaway: 'Inherit for identity, compose for traits. Anything that can change is a field.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Once the objects exist, the design is the relationships between them. Three shapes cover almost everything.',
        },
        {
          kind: 'table',
          headers: ['Relationship', 'Reads as', 'Modelled as'],
          rows: [
            ['is-a', 'A Bus *is a* Vehicle', 'Subclass, or an interface it implements'],
            ['has-a (one)', 'A Spot *has* at most one Vehicle', 'A nullable field'],
            ['has-a (many)', 'A Level *has* many Spots', 'A collection field on the owner'],
            [
              'many-to-many',
              'A Student takes many Courses; a Course has many Students',
              'A third object that owns the pairing (an Enrolment)',
            ],
          ],
        },
        { kind: 'anim', animId: 'ood-composition' },
        {
          kind: 'p',
          text: 'Inheritance is the one people over-reach with. It buys you exactly one axis of variation. The moment a second independent axis appears - electric versus petrol, on top of car versus bus - a class hierarchy has to multiply out every combination, while composition just adds a field.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The test to say out loud',
          text: 'Is-a must hold forever and under substitution: a bus is a vehicle, always, and anywhere a vehicle is accepted a bus is fine. Has-a survives change: this vehicle is electric *today*. If the trait can change during the object\'s life, it is a field, not a subclass.',
        },
        {
          kind: 'p',
          text: 'Two concrete rulings from this chapter\'s questions, both worth quoting because they show restraint:',
        },
        {
          kind: 'bullets',
          items: [
            '**Parking spots do not need subclasses.** LargeSpot, CompactSpot and MotorcycleSpot behave identically - they differ only in size. That is one `Spot` class with a size field. Vehicles *do* deserve subclasses, because a bus genuinely behaves differently: it needs five consecutive large spots.',
            '**Othello pieces do not need BlackPiece and WhitePiece.** A piece flips colour constantly, so subclassing would mean destroying and recreating an object that never actually changed identity. One `Piece` with a colour field.',
          ],
        },
        {
          kind: 'p',
          text: 'Where inheritance does earn its place, prefer an **abstract base you cannot instantiate**. `Employee` in the call-centre design exists to hold name, address and job title, and to declare `receiveCall`; nobody should ever construct a bare Employee. Respondent, Manager and Director are then thin subclasses that differ in escalation rank alone. Same story for `Card`, whose `value()` means nothing until a game says what it means, and `Conversation`, which is always either a GroupChat or a PrivateChat.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'Encapsulation, concretely',
          text: 'Callers should ask an object to do something, not read its fields and decide for it. `level.park(vehicle)` beats `if (level.spots[i].size >= vehicle.size) …` - the second one has moved the level\'s rules into every caller, and every caller can now get them wrong.',
        },
      ],
    },
    {
      id: 'responsibilities',
      title: 'Responsibilities, state, and layers',
      takeaway: 'Each object owns its own rules; status is an enum with a transition table.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Once the relationships are drawn, the interesting question is who owns each decision. The default answer: the object that owns the data owns the rule. A Level knows its own rows, so finding five consecutive large spots is a Level method, and the ParkingLot just asks each level in turn. A Board knows where the pieces are, so flipping captured Othello pieces is a Board method, while the Game owns turns, timing and who won.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The god object',
          text: 'The commonest failure is one class that does everything - `OnlineReaderSystem` holding the library, the user accounts and the display. Split it: Library, UserManager, Display. On a tiny system that split looks like ceremony; by the time the class is 800 lines it is the only thing keeping it readable.',
        },
        {
          kind: 'p',
          text: 'The other commonest failure is modelling status as a pile of booleans. Three booleans have eight combinations and half of them are contradictions you now have to defend in every branch.',
        },
        { kind: 'anim', animId: 'ood-state-machine' },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'An enum plus the legal moves, in one place',
          code: `type SpotState = 'free' | 'reserved' | 'occupied' | 'outOfService';

const LEGAL: Record<SpotState, SpotState[]> = {
  free: ['reserved', 'occupied', 'outOfService'],
  reserved: ['free', 'occupied'],
  occupied: ['free'],
  outOfService: ['free'],
};

class Spot {
  private state: SpotState = 'free';

  transitionTo(next: SpotState): void {
    if (!LEGAL[this.state].includes(next)) {
      throw new Error(\`cannot go \${this.state} -> \${next}\`);
    }
    this.state = next;
  }
}`,
        },
        {
          kind: 'p',
          text: 'The same shape covers a chat message (drafted, sent, delivered, read), an order (placed, paid, shipped, refunded) and a call (queued, ringing, answered, escalated, ended). When an interviewer asks "what if two threads try to park in the same spot?", the answer is much easier to give when the transition already lives in one guarded method.',
        },
        {
          kind: 'p',
          text: 'Finally, keep four kinds of code separate even in a whiteboard sketch:',
        },
        {
          kind: 'table',
          headers: ['Layer', 'Owns', 'In the parking lot'],
          rows: [
            ['Domain model', 'The rules and the invariants', '`Spot`, `Level`, `Vehicle`'],
            ['Orchestration', 'Use cases, sequencing across objects', '`ParkingLot.park(vehicle)`'],
            ['Persistence', 'Loading and saving', '`TicketRepository`'],
            ['Presentation', 'Display and input', '`Display`, the ticket printer'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Extensibility without fortune-telling',
          text: 'Design for the change the interviewer actually mentions - "what if we add buses?" - and say how you would absorb it. Do not pre-build a plugin architecture for changes nobody asked for. "I would add a Vehicle subclass and a size check; nothing else moves" is a better answer than a framework.',
        },
      ],
    },
    {
      id: 'patterns',
      title: 'The three patterns worth naming',
      takeaway: 'Singleton, factory, and the observer/strategy/state trio - plus when not to.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Interviews are testing capability, not vocabulary, so most design patterns are out of scope. Two come up constantly anyway, and both come with an argument attached.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Singleton - one instance, reached from anywhere',
          code: `class Restaurant {
  private static instance: Restaurant | null = null;
  private constructor() {}

  static getInstance(): Restaurant {
    if (Restaurant.instance === null) {
      Restaurant.instance = new Restaurant();
    }
    return Restaurant.instance;
  }
}`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Be ready to defend singleton',
          text: 'Plenty of engineers call it an anti-pattern, and the objection is concrete: it is global mutable state under a nicer name. Nothing in a signature says a function depends on it, so coupling hides; tests cannot get a fresh one, so state leaks between them; and it silently forbids ever having two. "I would make Game a singleton for convenience, but it means we can never run two games in one process - is that acceptable?" is the answer that scores.',
        },
        {
          kind: 'code',
          lang: 'ts',
          caption: 'Factory method - the caller asks for a kind, not a class',
          code: `abstract class CardGame {
  static create(type: 'poker' | 'blackjack'): CardGame {
    return type === 'poker' ? new PokerGame() : new BlackjackGame();
  }
}`,
        },
        {
          kind: 'p',
          text: 'A factory keeps the decision of *which* subclass in exactly one place. It comes in two flavours: an abstract creator whose subclasses each decide, or a concrete creator that takes a parameter and switches, as above. Say which you picked - the parameterised one is simpler, the abstract one is what you want when new kinds arrive from other modules.',
        },
        {
          kind: 'p',
          text: 'Three more are worth being able to name in one sentence each, because they solve problems these questions actually raise:',
        },
        {
          kind: 'bullets',
          items: [
            '**Observer** - objects register interest and get notified on change. This is how a chat server pushes a message to everyone in a conversation, and how a display refreshes when the reader turns a page, without the model knowing what a screen is.',
            '**Strategy** - swap the algorithm behind a stable interface. A jukebox with shuffle, repeat-one and in-order playback has three strategies, not three branches repeated at every call site.',
            '**State** - behaviour that changes with status, factored into one object per state. Reach for it only when the per-state behaviour is large; for four states and a couple of rules, the enum-plus-table from the last section is smaller and clearer.',
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Do not hunt for the "right" pattern',
          text: 'The trap is treating the question as "which pattern is this?". Design what the problem needs. Sometimes that lands on a named pattern and you can say so; often it does not, and forcing one in is worse than not knowing it.',
        },
      ],
    },
    {
      id: 'worked',
      title: 'The twelve questions, decided',
      takeaway: 'Every chapter question reduces to one design call. Here they all are.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'Each of these has one decision that carries the answer. Know the decision and you can rebuild the rest live.',
        },
        {
          kind: 'table',
          headers: ['Question', 'The decision that carries it'],
          rows: [
            [
              '7.1 Deck of cards',
              '`Card` is abstract - `value()` is meaningless until a game defines it. `Deck<T extends Card>` is generic. Blackjack subclasses Card, and aces (1 or 11) belong to `Hand`, which scores all possibilities and keeps the best under 21.',
            ],
            [
              '7.2 Call centre',
              'Abstract `Employee` with a rank; Respondent, Manager, Director are thin subclasses. A `CallHandler` owns dispatch and one queue *per rank*, so an escalated call waits with its peers rather than at the back of one line.',
            ],
            [
              '7.3 Jukebox',
              'Clarify first (CDs or MP3s? does it take money?). Then Jukebox, CDPlayer (holds one CD at a time, like the real thing), CD, Song, Playlist, User, Display. `Playlist` is a queue wrapper - which is exactly why the shuffle strategy lives there.',
            ],
            [
              '7.4 Parking lot',
              'ParkingLot → Level → Spot, with size on the spot rather than three spot subclasses. Vehicles *do* subclass, because a bus needs five consecutive large spots in one row. Splitting Level out is what keeps the search logic from turning into 2D-array bookkeeping in ParkingLot.',
            ],
            [
              '7.5 Online book reader',
              'Resist the god object. `OnlineReaderSystem` delegates to Library, UserManager and Display; User and Book are mostly data. The active-session state (which user, which book, which page) is the thing worth being explicit about.',
            ],
            [
              '7.6 Jigsaw',
              'Model `Edge` shapes (inner, outer, flat) with a pointer back to its Piece, and let a Piece map orientation → edge so rotation is a remap, not a rebuild. Group into corners, borders and middles first, then fill the grid in order using `fitsWith`.',
            ],
            [
              '7.7 Chat server',
              'Users, AddRequests, UserStatus, and an abstract `Conversation` split into GroupChat and PrivateChat. `UserManager` owns the friending flow. Then name the hard parts: knowing someone is *really* online (ping them), reconciling memory against the database, sharding without desync, and denial of service.',
            ],
            [
              '7.8 Othello',
              'One `Piece` with a colour flag, not two classes. Keep `Board` (placement, flipping, score) apart from `Game` (turns, flow, players). Ask out loud whether Game should be a singleton, and say what that would cost.',
            ],
            [
              '7.9 Circular array',
              'Never shift elements. Keep a `head` offset and convert indices through one private helper - rotation becomes `head += n`. Watch the negative modulo, and implement the iterator interface so `for (x of arr)` works.',
            ],
            [
              '7.10 Minesweeper',
              '`Cell` with `isBomb`, `isExposed`, `isGuess` flags - not subclasses, because a cell flips state and the board holds references to it. Place bombs by shuffling rather than retry-until-free, set the numbers by incrementing neighbours *of each bomb*, and expand blanks with a queue.',
            ],
            [
              '7.11 File system',
              'The composite pattern: `File` and `Directory` both extend `Entry`, and a Directory holds a list of Entries. Size and search then recurse uniformly. Separate file and directory lists would make `numberOfFiles` tidier but block sorting everything by name or date.',
            ],
            [
              '7.12 Hash table',
              'An array of linked lists, and each node stores **both key and value** - two different keys collide into the same bucket, so the value alone cannot tell you which one you found. Plus: a good hash function, a collision strategy, and resizing when the load factor crosses a threshold.',
            ],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'How to practise these',
          text: 'Give yourself 25 minutes and a sheet of paper. Clarify out loud, list the objects, draw the arrows, then walk two use cases through. If a use case cannot be traced through your boxes, the design is not finished - and that is exactly the failure the interviewer is watching for.',
        },
        {
          kind: 'p',
          text: 'One last thing that transfers to every one of them: the interviewer usually cares less about which option you chose than about whether you noticed there was a choice. "I kept Board and Game separate; that adds a layer of pass-through calls but keeps the game flow out of the piece-flipping logic" scores better than either option chosen silently.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'ood-1',
      kind: 'technique',
      prompt: 'You are asked to "design a coffee maker". What is the first move?',
      options: [
        'List the classes: CoffeeMaker, Cup, Water, Bean',
        'Ask who uses it and how - an industrial machine and a one-button machine for the elderly are different designs',
        'Pick a design pattern that fits',
        'Start writing the constructor',
      ],
      answerIndex: 1,
      explain:
        'The vagueness is the test. Scope and use cases change the design completely, so they come before any class.',
    },
    {
      id: 'ood-2',
      kind: 'concept',
      prompt:
        'A parking lot has motorcycle, compact and large spots. Should each be its own subclass of Spot?',
      options: [
        'Yes - three sizes means three types',
        'No - they behave identically and differ only in size, so size is a field',
        'Yes, and they should also be singletons',
        'Only if the lot has multiple levels',
      ],
      answerIndex: 1,
      explain:
        'Subclass when behaviour differs. Vehicles differ (a bus needs five consecutive spots); spots do not.',
    },
    {
      id: 'ood-3',
      kind: 'technique',
      prompt:
        'Your Vehicle hierarchy has Car, Bus and Motorcycle. Now some vehicles are electric. What happens if you model that with inheritance?',
      options: [
        'Nothing - just add ElectricVehicle above Vehicle',
        'You need one subclass per combination, and it doubles again with each new axis',
        'It works, but only in languages with multiple inheritance',
        'The compiler rejects it',
      ],
      answerIndex: 1,
      explain:
        'Inheritance encodes one axis of variation. Independent traits belong in fields - a powertrain field, not six classes.',
    },
    {
      id: 'ood-4',
      kind: 'concept',
      prompt:
        'An Othello piece flips between black and white constantly. BlackPiece and WhitePiece classes?',
      options: [
        'Yes - they are genuinely different pieces',
        'No - a piece keeps its identity when it flips, so colour is a field',
        'Yes, with a factory to swap them',
        'Only if the board is larger than 8x8',
      ],
      answerIndex: 1,
      explain:
        'Subclassing would mean destroying and recreating an object whose identity never changed - and the board holds references to it.',
    },
    {
      id: 'ood-5',
      kind: 'technique',
      prompt: 'What is the strongest argument *against* using a singleton?',
      options: [
        'It uses more memory',
        'It is global mutable state: hidden coupling, no fresh instance for tests, and you can never have two',
        'It is slower than a normal object',
        'It cannot be subclassed',
      ],
      answerIndex: 1,
      explain:
        'Nothing in a signature reveals the dependency, and "exactly one, forever" is an assumption that eventually breaks.',
    },
    {
      id: 'ood-6',
      kind: 'concept',
      prompt:
        'A hash table with separate chaining. Why must each list node store the key as well as the value?',
      options: [
        'To make iteration faster',
        'Because different keys collide into the same bucket, so the value alone cannot say which key you found',
        'To support resizing',
        'Because the hash function needs it later',
      ],
      answerIndex: 1,
      explain:
        '`jim` and `bob` may hash to the same index. Without the original key you cannot tell which entry is which.',
    },
    {
      id: 'ood-7',
      kind: 'technique',
      prompt: 'How should you model a parking spot that is free, reserved, occupied or out of service?',
      options: [
        'Three booleans: isFree, isReserved, isBroken',
        'An enum plus a table of legal transitions, applied in one guarded method',
        'A subclass per state',
        'An integer status code, checked at each call site',
      ],
      answerIndex: 1,
      explain:
        'Three booleans allow eight combinations, half of them contradictions. One enum and one transition table make illegal states unrepresentable.',
    },
    {
      id: 'ood-8',
      kind: 'concept',
      prompt: 'Designing an in-memory file system, what is the key structural choice?',
      options: [
        'Store everything in one flat hash map of paths',
        'File and Directory both extend Entry, and a Directory holds a list of Entries',
        'Directories are strings; files are objects',
        'Use a binary search tree keyed by filename',
      ],
      answerIndex: 1,
      explain:
        'That is the composite pattern - it lets size, search and listing recurse uniformly over the tree.',
    },
    {
      id: 'ood-9',
      kind: 'technique',
      prompt:
        'You have listed the objects and drawn the relationships. What does step four, "investigate actions", actually buy you?',
      options: [
        'A chance to add design patterns',
        'It surfaces the objects and methods you forgot - gaps only show up when a use case is traced end to end',
        'Nothing; it is a formality',
        'A performance estimate',
      ],
      answerIndex: 1,
      explain:
        'Tracing "a car leaves" is how you notice that freeing a spot must notify its level, or the free count drifts.',
    },
    {
      id: 'ood-10',
      kind: 'concept',
      prompt: 'A student takes many courses and a course has many students. How is that modelled?',
      options: [
        'A list of courses on Student only',
        'A third object owning the pairing - an Enrolment - which can also carry grade and term',
        'Inheritance from a shared base class',
        'A singleton registry',
      ],
      answerIndex: 1,
      explain:
        'Many-to-many needs a join object. It also gives the relationship somewhere to keep its own attributes.',
    },
  ],
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
