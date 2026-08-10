import type { CourseModule } from '../../types';

export const java: CourseModule = {
  id: 'java',
  title: 'Java',
  track: 'reference',
  status: 'outline',
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
  plannedAnimations: [
    'Overload resolution at compile time vs override dispatch at runtime, on the same call site',
    'The three map implementations side by side: iteration order and operation cost',
    'A stream pipeline: source, intermediate operations, and the terminal operation that triggers it',
  ],
  sections: [],
  quiz: [],
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
