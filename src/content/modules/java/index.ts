import type { CourseModule } from '../../types';

export const java: CourseModule = {
  id: 'java',
  title: 'Java',
  track: 'reference',
  status: 'complete',
  source: 'Chapter 13',
  summary:
    'Reference track. Language-model questions with precise answers - worth an hour even if you never write Java, because the collection tradeoffs are universal.',
  estimatedMinutes: 45,
  concepts: [
    'Overloading (chosen at compile time by signature) vs overriding (chosen at runtime by type)',
    'Access modifiers, and what a private constructor means for subclassing and instantiation',
    'Whether finally runs when try returns - and the cases where it does not',
    'final (cannot change), finally (always runs), finalize (pre-collection hook, deprecated and unreliable)',
    'Java generics and type erasure, vs C++ templates and compile-time instantiation',
    'What erasure forbids: no new T[], no instanceof on a type parameter, no primitive type arguments',
    'HashMap: O(1) average, unordered; TreeMap: O(log n), sorted; LinkedHashMap: O(1) with insertion or access order',
    'Choosing between them by required ordering and by iteration needs',
    'Reflection: inspecting and invoking at runtime, and its legitimate uses (frameworks, serialisation, tooling)',
    'Functional interfaces, lambdas and streams; grouping and filtering with collectors',
    'Checked vs unchecked exceptions',
    'Autoboxing, and the equality trap it creates for boxed integers',
  ],
  sections: [
    {
      id: 'language-model',
      title: 'The language-model questions',
      takeaway: 'Overload vs override, private constructors, and the final/finally/finalize trio.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'This chapter is knowledge, not aptitude - which is why big companies mostly skip it and smaller ones lean on it. If one stumps you, do not bluff. Build a small example and reason out what *must* happen, ask how another language handles it, or ask what you would have done as the language designer. Deriving the answer often impresses more than reciting it.',
        },
        { kind: 'anim', animId: 'java-dispatch' },
        {
          kind: 'table',
          headers: ['', 'Overloading', 'Overriding'],
          rows: [
            ['Same name, and…', 'different parameter types or count', 'identical signature, in a subclass'],
            ['Chosen', 'At compile time, from the static types', 'At run time, from the actual object'],
            ['Relationship', 'Unrelated methods that share a name', 'A subclass replacing its parent\'s behaviour'],
          ],
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'No `virtual` keyword, on purpose',
          text: 'Every non-static, non-private, non-final instance method in Java is dispatched dynamically. C++ makes you opt in with `virtual`; Java makes you opt out with `final`. Same mechanism underneath.',
        },
        {
          kind: 'p',
          text: '**13.1, a private constructor.** Private means "visible only where A\'s private members are visible" - which is A itself, A\'s inner classes, and if A is an inner class of Q, Q\'s other inner classes. Since a subclass constructor must call its parent\'s, that is exactly the set of places A can be subclassed from. It is not "cannot be subclassed"; it is "cannot be subclassed from outside". This is also the mechanism behind singletons, static factories and utility classes.',
        },
        {
          kind: 'p',
          text: '**13.2, does `finally` run if `try` returns?** Yes. The `finally` block runs when the try block exits by any route: falling off the end, `return`, `break`, `continue`, or an exception. The ordering is worth being precise about - the return *expression* is evaluated first, then `finally` runs, then the method actually returns.',
        },
        {
          kind: 'code',
          lang: 'java',
          caption: 'The order, made visible',
          code: `public static String foo() {
  try {
    System.out.println("start try");
    int b = 5 / 0;                       // throws
    return "returned from try";
  } catch (Exception ex) {
    System.out.println("catch");
    return lem() + " | returned from catch";   // lem() runs here...
  } finally {
    System.out.println("finally");             // ...then this...
  }
}                                              // ...then the method returns

// start try / catch / lem / finally / return from lem | returned from catch`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'The exceptions to "always"',
          text: '`finally` does not run if the JVM exits during the block (`System.exit`), or if the thread executing it is killed. Naming those two is what turns a right answer into a complete one.',
        },
        {
          kind: 'table',
          caption: '13.3 - three words, three unrelated jobs',
          headers: ['Keyword', 'What it does'],
          rows: [
            [
              '`final`',
              'Controls changeability. On a primitive: the value cannot change. On a reference: it cannot be re-pointed (the object it points at can still mutate). On a method: cannot be overridden. On a class: cannot be subclassed.',
            ],
            [
              '`finally`',
              'The optional block after try/catch. Runs on every exit path; used for cleanup.',
            ],
            [
              '`finalize()`',
              'A hook the garbage collector calls before destroying an object. You cannot predict when, or whether, it runs - deprecated, and never the right place for cleanup.',
            ],
          ],
        },
        {
          kind: 'p',
          text: 'Two more that come up constantly even though the chapter does not number them. **Checked vs unchecked exceptions**: checked ones must be declared or caught, which forces the caller to acknowledge recoverable failures (`IOException`); unchecked ones (`RuntimeException` and its subclasses) signal programming errors. **Autoboxing**: `Integer` caches -128 to 127, so `==` on two boxed values compares references and quietly gives the "right" answer for small numbers and the wrong one for large ones. Use `.equals`, or unbox to `int`.',
        },
      ],
    },
    {
      id: 'generics-collections',
      title: 'Generics, erasure, and the three maps',
      takeaway: 'Java erases the type argument; the map you pick is decided by iteration order.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: '**13.4, generics vs templates.** They look identical and work completely differently. Java generics are implemented by **type erasure**: the compiler checks the types, then throws them away and inserts casts, so only one class exists at run time.',
        },
        {
          kind: 'code',
          lang: 'java',
          caption: 'What the compiler actually produces',
          code: `// what you write
Vector<String> vector = new Vector<String>();
vector.add(new String("hello"));
String str = vector.get(0);

// what the JVM sees
Vector vector = new Vector();
vector.add(new String("hello"));
String str = (String) vector.get(0);`,
        },
        {
          kind: 'p',
          text: 'C++ templates go the other way: the compiler generates a fresh copy of the code for every type argument, so `MyClass<Foo>` and `MyClass<Bar>` are genuinely different types - each with its own static members. In Java they are the same type and share statics.',
        },
        {
          kind: 'table',
          headers: ['', 'Java generics', 'C++ templates'],
          rows: [
            ['Mechanism', 'Erasure - one class, casts inserted', 'Instantiation - one class per type argument'],
            ['Primitive arguments', 'No - `Integer`, not `int`', 'Yes - `vector<int>` is fine'],
            ['Static members', 'Shared across all type arguments', 'Separate per type argument'],
            ['Type constraints', '`<T extends CardGame>`', 'Duck-typed until C++20 concepts'],
            ['Can instantiate `T`', 'No', 'Yes'],
            ['At run time', 'The type argument is gone', 'The types are fully distinct'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'What erasure forbids',
          text: 'No `new T[]` and no `new T()`, no `instanceof T`, no primitive type arguments, and no type-parameter use in a static field or method - since one static would have to be shared by every instantiation. If you have ever wondered why generic code passes `Class<T>` around, this is why.',
        },
        { kind: 'anim', animId: 'java-maps' },
        {
          kind: 'table',
          caption: '13.5 - the map decision, in one table',
          headers: ['', 'Implementation', 'Lookup / insert', 'Iteration order'],
          rows: [
            ['`HashMap`', 'Array of linked lists (buckets)', 'O(1) average', 'Arbitrary - never rely on it'],
            ['`TreeMap`', 'Red-black tree', 'O(log n) guaranteed', 'Sorted by key (must be `Comparable`)'],
            ['`LinkedHashMap`', 'Hash buckets + a doubly linked list', 'O(1) average', 'Insertion order, or access order'],
          ],
        },
        {
          kind: 'p',
          text: 'When each is right, concretely. **TreeMap** when you need names in alphabetical order, or the range query it also gives you: "the next ten people after this one" is what a *More* button is made of. **LinkedHashMap** when arrival order matters - the access-order constructor moves each read entry to the end, so overriding `removeEldestEntry` gives you an LRU cache almost for free. **HashMap** otherwise: it is faster and has less overhead.',
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'This one transfers everywhere',
          text: 'Hash map versus sorted map versus insertion-ordered map is the same decision in every language. JavaScript\'s `Map` is the insertion-ordered one and has no sorted equivalent, Python\'s `dict` is insertion-ordered since 3.7, C++ gives you `unordered_map` and `map`. Know the axis and you know all of them.',
        },
        {
          kind: 'p',
          text: 'The rest of the collection framework is worth being fluent in but not thinking hard about: `ArrayList` is a dynamically resizing array; `Vector` is the same thing with synchronised methods (legacy - the synchronisation is per-call and rarely what you want); `LinkedList` is a doubly linked list and is where you meet `Iterator`.',
        },
      ],
    },
    {
      id: 'reflection-lambdas',
      title: 'Reflection, lambdas and streams',
      takeaway: 'Reflection is how frameworks work; a stream does nothing until the terminal call.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: '**13.6, reflection** is the ability to inspect and manipulate classes at run time: list the methods and fields of a class, construct an instance, read or write a field regardless of its access modifier, and invoke a method by name.',
        },
        {
          kind: 'code',
          lang: 'java',
          caption: 'Constructing and calling, by name',
          code: `Class<?> def = Class.forName("MyProj.Rectangle");

Constructor<?> ctor = def.getConstructor(double.class, double.class);
Rectangle rectangle = (Rectangle) ctor.newInstance(4.2, 3.9);

Method m = def.getDeclaredMethod("area");
Double area = (Double) m.invoke(rectangle);

// exactly equivalent to:
// Rectangle rectangle = new Rectangle(4.2, 3.9);
// Double area = rectangle.area();`,
        },
        {
          kind: 'p',
          text: 'That looks like a pointlessly long way to write two lines - and it is, when you know the class at compile time. It earns its keep when you do not: **frameworks** wiring up classes they have never seen, **serialisation** walking arbitrary fields, **testing tools** reaching private state, and any case where the class name arrives as a string at run time. Doing that without reflection means a giant if-chain, if it is possible at all. The costs are real too: no compile-time checking, slower calls, and code that refactoring tools cannot follow.',
        },
        { kind: 'anim', animId: 'java-stream' },
        {
          kind: 'p',
          text: 'A **functional interface** is any interface with exactly one abstract method, which is what lets a lambda stand in for it: `Predicate<T>` (T → boolean), `Function<T, R>`, `Supplier<T>`, `Consumer<T>`. Streams are built on them.',
        },
        {
          kind: 'code',
          lang: 'java',
          caption: '13.7 - total the population of one continent',
          code: `int getPopulation(List<Country> countries, String continent) {
  Stream<Country> matching = countries.stream()
      .filter(c -> c.getContinent().equals(continent));
  Stream<Integer> populations = matching.map(Country::getPopulation);
  return populations.reduce(0, (a, b) -> a + b);
}

// Or, since a non-match can just contribute zero, skip the filter entirely:
int getPopulation(List<Country> countries, String continent) {
  return countries.stream()
      .map(c -> c.getContinent().equals(continent) ? c.getPopulation() : 0)
      .reduce(0, (a, b) -> a + b);
}`,
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Intermediate vs terminal',
          text: '`filter` and `map` return another stream and run nothing - they only describe work. `reduce`, `collect`, `forEach` and `count` are terminal, and they are what actually executes the pipeline. Because it is lazy, each element flows through every stage once, rather than the pipeline building an intermediate list per stage.',
        },
        {
          kind: 'p',
          text: 'For grouping, `Collectors.groupingBy` does in one line what a loop plus a map-of-lists does in six: `countries.stream().collect(groupingBy(Country::getContinent))` gives you a `Map<String, List<Country>>`, and `groupingBy(Country::getContinent, summingInt(Country::getPopulation))` totals each group directly.',
        },
        {
          kind: 'p',
          text: '**13.8, a uniformly random subset.** The tempting approach - pick a size, then pick a subset of that size - is wrong twice over: the sizes are not equally likely (there are far more subsets of size n/2 than of size n), and generating a subset of a *fixed* size is harder than generating one of any size. Think per element instead. For any particular element, subsets split exactly in half between those containing it and those that do not - pair them up by adding the element and the halves match one for one. So flip a fair coin per element.',
        },
        {
          kind: 'code',
          lang: 'java',
          caption: 'One coin flip per element - every subset equally likely',
          code: `Random random = new Random();
Predicate<Object> flipCoin = o -> random.nextBoolean();

List<Integer> getRandomSubset(List<Integer> list) {
  return list.stream().filter(flipCoin).collect(Collectors.toList());
}`,
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'If you do not write Java',
          text: 'Two things here still pay off. The map tradeoff is the same everywhere. And "the pipeline is lazy until something terminal asks for a value" is the model behind JS iterators, Python generators and Rust iterators alike.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'java-1',
      kind: 'concept',
      prompt: 'When is an overloaded method chosen, and when is an overridden one?',
      options: [
        'Both at run time',
        'Overload at compile time from the static types; override at run time from the actual object',
        'Both at compile time',
        'Overload at run time; override at compile time',
      ],
      answerIndex: 1,
      explain:
        'Overloads are unrelated methods sharing a name. An override replaces behaviour for the real type.',
    },
    {
      id: 'java-2',
      kind: 'concept',
      prompt: 'A class has a private constructor. What follows for inheritance?',
      options: [
        'It can never be subclassed',
        'It can only be subclassed from where its private members are visible - its own inner classes, or sibling inner classes of an enclosing class',
        'Subclasses must also be private',
        'Nothing; constructors are not inherited anyway',
      ],
      answerIndex: 1,
      explain:
        'A subclass constructor must call the parent\'s, so subclassing is limited to exactly where that constructor is visible.',
    },
    {
      id: 'java-3',
      kind: 'concept',
      prompt: 'Does `finally` run when the `try` block executes a `return`?',
      options: [
        'No - the return exits immediately',
        'Yes - the return expression is evaluated, then finally runs, then the method returns',
        'Only if there is no catch block',
        'Only for checked exceptions',
      ],
      answerIndex: 1,
      explain:
        'It runs on every exit path. The two exceptions: the JVM exiting, or the executing thread being killed.',
    },
    {
      id: 'java-4',
      kind: 'concept',
      prompt: 'What is `finalize()`?',
      options: [
        'A block that always runs after try/catch',
        'A hook the garbage collector may call before destroying an object - unpredictable, and deprecated',
        'A modifier preventing subclassing',
        'The destructor, guaranteed to run at scope exit',
      ],
      answerIndex: 1,
      explain:
        'You cannot predict when or whether it runs, so it is never the right place for cleanup. Use try-with-resources.',
    },
    {
      id: 'java-5',
      kind: 'concept',
      prompt: 'Java generics use type erasure. What does that make impossible?',
      options: [
        'Nothing - it is purely an implementation detail',
        '`new T[]`, `instanceof T`, primitive type arguments, and type parameters in static members',
        'Using generics with interfaces',
        'Passing generic types to methods',
      ],
      answerIndex: 1,
      explain:
        'The type argument is gone at run time, so anything that needs it at run time is out - hence `Class<T>` parameters.',
    },
    {
      id: 'java-6',
      kind: 'complexity',
      prompt: 'You need keys back in sorted order and range queries. Which map?',
      options: [
        'HashMap - it is fastest',
        'TreeMap - O(log n), a red-black tree, sorted keys',
        'LinkedHashMap - it keeps order',
        'Any of them; ordering is configurable',
      ],
      answerIndex: 1,
      explain:
        'LinkedHashMap preserves *insertion* order, not sorted order. Only TreeMap sorts and supports "the next ten after this".',
    },
    {
      id: 'java-7',
      kind: 'technique',
      prompt: 'Which map gives you an LRU cache with the least work?',
      options: [
        'HashMap with a timestamp per entry',
        'LinkedHashMap in access-order mode, overriding `removeEldestEntry`',
        'TreeMap keyed by access time',
        'Two HashMaps',
      ],
      answerIndex: 1,
      explain:
        'Access order moves each read entry to the end, so the eldest entry is exactly the least recently used one.',
    },
    {
      id: 'java-8',
      kind: 'concept',
      prompt: 'In a stream, when does `filter` actually run?',
      options: [
        'Immediately, producing a new list',
        'Not until a terminal operation such as `reduce` or `collect` is called',
        'On the first call to `size()`',
        'In a background thread',
      ],
      answerIndex: 1,
      explain:
        'Intermediate operations only describe work. Laziness is why each element flows through every stage once.',
    },
    {
      id: 'java-9',
      kind: 'technique',
      prompt: 'Return a random subset of a list, with every subset equally likely. How?',
      options: [
        'Pick a random size, then a random subset of that size',
        'Flip a fair coin per element - for any element, exactly half of all subsets contain it',
        'Shuffle and take the first half',
        'Pick each element with probability 1/n',
      ],
      answerIndex: 1,
      explain:
        'Sizes are not equally likely, so picking a size first skews it. The per-element coin flip is uniform over all 2^n subsets.',
    },
    {
      id: 'java-10',
      kind: 'technique',
      prompt: 'When is reflection the right tool rather than a smell?',
      options: [
        'Whenever you want to avoid writing an interface',
        'When the class or method is only known at run time - frameworks, serialisation, test tooling',
        'For performance-critical inner loops',
        'To make private fields part of your public API',
      ],
      answerIndex: 1,
      explain:
        'It trades compile-time checking and speed for the ability to act on names discovered at run time.',
    },
  ],
  drills: [
    { slug: 'design-hashset', note: 'Forces you to think about hashing and collisions directly.' },
    { slug: 'sort-list', note: 'Merge sort on a linked list - a good comparator/stability discussion.' },
  ],
  practice: [
    {
      id: 'java-explain',
      title: 'Write two-minute answers to the eight chapter questions',
      detail:
        'Private constructors, finally with return, final/finally/finalize, generics vs templates, the three maps, reflection, lambdas for grouping, and a random subset with a stream filter.',
    },
    {
      id: 'java-maps',
      title: 'Learn the map tradeoffs properly',
      detail:
        'They transfer directly: hash map vs sorted map vs insertion-ordered map is the same decision in every language, including the JS Map you already use.',
    },
  ],
};
