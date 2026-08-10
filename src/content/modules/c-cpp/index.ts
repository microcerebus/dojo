import type { CourseModule } from '../../types';

export const cCpp: CourseModule = {
  id: 'c-cpp',
  title: 'C and C++',
  track: 'reference',
  status: 'outline',
  source: 'Chapter 12',
  summary:
    'Reference track. Memory ownership, virtual dispatch and pointer semantics - skim unless a role asks for systems work.',
  estimatedMinutes: 60,
  concepts: [
    'Class inheritance and the public/protected/private access levels',
    'Constructors, destructors, and the order in which they run through a hierarchy',
    'Virtual functions, dynamic dispatch and the vtable that implements it',
    'Why a polymorphic base class needs a virtual destructor',
    'Default arguments and their evaluation rules',
    'Operator overloading, and when it helps rather than obscures',
    'Pointers vs references: nullability, rebinding, and arithmetic',
    'Pointer arithmetic and how it scales by the pointed-to type',
    'Stack vs heap allocation; new/delete and malloc/free, and never mixing them',
    'Shallow vs deep copy, and the copy constructor / assignment operator that control it',
    'Reference-counted smart pointers and what "ownership" means',
    'Templates and compile-time instantiation (contrast with Java generics)',
    'volatile: what it prevents the compiler from doing, and what it does not guarantee about threads',
    'Memory alignment, and implementing an aligned allocator',
    'Allocating a 2D array in one contiguous block instead of n allocations',
    'Reading a file tail efficiently with a circular buffer',
  ],
  plannedAnimations: [
    'A vtable dispatching a call through a base-class pointer to a derived implementation',
    'Shallow vs deep copy: two objects sharing a buffer, then one freeing it',
    'Reference counting rising and falling as smart pointers go out of scope',
    'One contiguous allocation for a 2D array vs n separate row allocations',
  ],
  sections: [],
  quiz: [],
  drills: [
    { slug: 'reverse-string', note: 'CTCI 12.2 - in place, and think about the null terminator in C.' },
    { slug: 'copy-list-with-random-pointer', note: 'CTCI 12.8 - deep copy with an arbitrary extra pointer.' },
    { slug: 'reverse-words-in-a-string', note: 'In-place buffer manipulation practice.' },
  ],
  practice: [
    {
      id: 'cpp-explain',
      title: 'Be able to explain five things in two minutes each',
      detail:
        'Virtual dispatch and vtables; why base destructors are virtual; shallow vs deep copy; what volatile does and does not promise; hash table vs std::map. These are asked as explanations, not as code.',
    },
    {
      id: 'cpp-smart-pointer',
      title: 'Write a reference-counted smart pointer on paper',
      detail:
        'Constructor, copy constructor, assignment operator, destructor. The cycle problem and why weak references exist.',
    },
  ],
};
