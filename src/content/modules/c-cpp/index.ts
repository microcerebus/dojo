import type { CourseModule } from '../../types';

export const cCpp: CourseModule = {
  id: 'c-cpp',
  title: 'C and C++',
  track: 'reference',
  status: 'complete',
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
  sections: [
    {
      id: 'classes',
      title: 'Classes, dispatch, and the vtable',
      takeaway: 'Static binding unless you say `virtual` - and destructors are the trap.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'C++ starts from C and adds classes. Two defaults differ from what most people expect: members are **private by default** in a `class` (public in a `struct`), and inheritance is written with its access level - `class Student : public Person`.',
        },
        {
          kind: 'table',
          headers: ['Level', 'Visible to'],
          rows: [
            ['`private`', 'The class itself (and its friends). The default.'],
            ['`protected`', 'The class and everything derived from it'],
            ['`public`', 'Everyone'],
          ],
        },
        {
          kind: 'p',
          text: 'A **constructor** runs on creation; if you write none, the compiler generates a default one. Prefer the initialiser-list form - `Person(int a) : id(a) {}` - over assigning inside the body: it initialises the member before the body runs, and it is the *only* option for `const` members and members without a default constructor. A **destructor** runs on destruction, takes no arguments (you never call it yourself), and is where you release whatever the object owns. Through a hierarchy, construction runs base-first and destruction runs derived-first - the exact reverse.',
        },
        { kind: 'anim', animId: 'cpp-vtable' },
        {
          kind: 'code',
          lang: 'cpp',
          caption: 'The whole of 12.4 and 12.7 in one snippet',
          code: `class Person {
public:
  virtual void aboutMe() { cout << "I am a person."; }
  virtual bool addCourse(string s) = 0;  // pure virtual -> Person is abstract
  virtual ~Person() { cout << "Deleting a person."; }
};

class Student : public Person {
public:
  void aboutMe() { cout << "I am a student."; }
  bool addCourse(string s) { /* ... */ return true; }
  ~Student() { cout << "Deleting a student."; }
};

Person* p = new Student();
p->aboutMe();   // "I am a student."  - virtual, so the real type decides
delete p;       // "Deleting a student." then "Deleting a person."`,
        },
        {
          kind: 'p',
          text: 'The mechanism, which is what "how do virtual functions work?" is asking for: if a class has any virtual function, the compiler builds a **vtable** for it - an array of function pointers - and adds a hidden `vptr` to every object of that class, pointing at its class\'s table. A call through a base pointer reads the vptr, indexes the table, and jumps. Where a derived class did not override, its slot still holds the base implementation. Non-virtual calls are resolved at compile time (static binding); virtual calls at runtime (dynamic binding), for the price of one indirection.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Virtual destructors',
          text: 'If you ever `delete` through a base-class pointer, that base destructor must be virtual. Otherwise only the base half is destroyed and the derived half leaks - silently, with no warning. The rule of thumb: any class with a virtual function needs a virtual destructor.',
        },
        {
          kind: 'p',
          text: 'A **pure virtual** function (`= 0`) has no base implementation and makes the class abstract - it cannot be instantiated. Use it when the operation only makes sense per subclass: `addCourse` means something different for a Student and a Teacher, and nothing at all for a bare Person.',
        },
        {
          kind: 'p',
          text: 'Two smaller features round out the chapter. **Default arguments** must all sit at the right of the parameter list, because otherwise there would be no way to tell which argument you meant: `int func(int a, int b = 3)` allows `func(4)` and `func(4, 5)`. **Operator overloading** lets `+` mean something for your own type - `Bookshelf operator+(Bookshelf& other)` - which is lovely for values like vectors, matrices and money, and awful when the operator does something a reader would not guess.',
        },
      ],
    },
    {
      id: 'memory',
      title: 'Pointers, references, and who owns the memory',
      takeaway: 'Ownership is the real subject. Every allocation needs exactly one owner.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: 'A **pointer** holds an address. Two pointers can hold the same address, so writing through one is visible through the other. A pointer is 32 bits on a 32-bit machine and 64 on a 64-bit one - worth remembering when an interviewer asks how much space a structure takes.',
        },
        {
          kind: 'p',
          text: 'A **reference** is an alias for an existing object. It has no storage of its own, cannot be null, and cannot be re-seated to refer to something else after initialisation. That is the whole difference, and it is why references are the default for parameters you do not intend to reassign, and pointers are what you use when "nothing" is a legal value.',
        },
        {
          kind: 'table',
          headers: ['', 'Pointer', 'Reference'],
          rows: [
            ['Can be null', 'Yes', 'No'],
            ['Can be reassigned', 'Yes', 'No - it binds once'],
            ['Arithmetic', 'Yes', 'No'],
            ['Needs dereferencing', '`*p`, `p->x`', 'Used like the object itself'],
          ],
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'Pointer arithmetic scales by type',
          text: '`p++` on an `int*` advances by `sizeof(int)` bytes, not one byte. That is what makes `p[i]` and `*(p + i)` the same expression - and what makes arithmetic on a `void*` meaningless.',
        },
        {
          kind: 'p',
          text: 'Allocation comes in two flavours. **Stack** objects are freed automatically when the scope ends; they are fast, and their lifetime is exactly their scope. **Heap** objects live until you free them, and you must. Use `new`/`delete` (which run constructors and destructors) or `malloc`/`free` (which do not) - and never cross the streams: `free`ing a `new`ed object skips the destructor and corrupts the allocator. Arrays have their own pairing: `new[]` must be released with `delete[]`.',
        },
        { kind: 'anim', animId: 'cpp-copy' },
        {
          kind: 'code',
          lang: 'cpp',
          caption: 'Shallow vs deep - 12.5',
          code: `struct Test { char* ptr; };

void shallow_copy(Test& src, Test& dest) {
  dest.ptr = src.ptr;                        // one buffer, two owners
}

void deep_copy(Test& src, Test& dest) {
  dest.ptr = (char*) malloc(strlen(src.ptr) + 1);
  strcpy(dest.ptr, src.ptr);                 // one buffer each
}`,
        },
        {
          kind: 'p',
          text: 'A shallow copy duplicates member *values*, so a pointer member ends up shared. That is fine if you have decided who frees it and nobody mutates it - passing a large structure around read-only, for instance. Otherwise it produces the classic pair of bugs: a dangling pointer when the first owner frees, and a double free when the second one does. Deep copy is the default you should reach for.',
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'Fix all three, or none',
          text: 'If a class manages a resource, the copy constructor, the assignment operator and the destructor all have to agree about ownership. Writing one and forgetting the others is how the compiler-generated shallow copy sneaks back in. (Modern C++ calls this the rule of three; with move semantics, five.)',
        },
        { kind: 'anim', animId: 'cpp-refcount' },
        {
          kind: 'code',
          lang: 'cpp',
          caption: 'Reference-counted smart pointer - 12.9, the shape that matters',
          code: `template <class T> class SmartPointer {
public:
  SmartPointer(T* ptr) : ref(ptr) {
    refCount = (unsigned*) malloc(sizeof(unsigned));
    *refCount = 1;
  }

  SmartPointer(SmartPointer<T>& other) {      // copy: share, then count
    ref = other.ref;
    refCount = other.refCount;
    ++(*refCount);
  }

  SmartPointer<T>& operator=(SmartPointer<T>& other) {
    if (this == &other) return *this;         // self-assignment first
    if (*refCount > 0) remove();              // let go of what we held
    ref = other.ref;
    refCount = other.refCount;
    ++(*refCount);
    return *this;
  }

  ~SmartPointer() { remove(); }

protected:
  void remove() {
    if (--(*refCount) == 0) { delete ref; free(refCount); }
  }
  T* ref;
  unsigned* refCount;                          // a pointer, so copies share it
};`,
        },
        {
          kind: 'p',
          text: 'The counter has to be a *pointer* - that is the detail the question is really testing. If it were a plain `unsigned`, every copy would get its own count and none would ever reach zero together. Note also the failure mode reference counting cannot solve on its own: two objects holding strong references to each other never reach zero, so the cycle leaks. That is why weak references exist.',
        },
      ],
    },
    {
      id: 'templates-volatile',
      title: 'Templates, volatile, and alignment',
      takeaway: 'Templates are compiled per type; volatile stops the compiler, not other threads.',
      audio: true,
      blocks: [
        {
          kind: 'p',
          text: '**Templates** reuse code across types. The compiler instantiates a fresh copy of the class or function for each type argument, at compile time.',
        },
        {
          kind: 'code',
          lang: 'cpp',
          caption: 'A rotatable list, instantiated per type',
          code: `template <class T> class ShiftedList {
  T* array;
  int offset, size;
public:
  ShiftedList(int sz) : offset(0), size(sz) { array = new T[size]; }
  ~ShiftedList() { delete[] array; }
  void shiftBy(int n) { offset = (offset + n) % size; }
  T getAt(int i) { return array[convertIndex(i)]; }
private:
  int convertIndex(int i) {
    int index = (i - offset) % size;
    while (index < 0) index += size;   // % can go negative in C++
    return index;
  }
};`,
        },
        {
          kind: 'callout',
          tone: 'key',
          title: 'The consequence that gets asked about',
          text: '`MyClass<Foo>` and `MyClass<Bar>` are genuinely different types with separate static members - because the compiler generated two separate classes. Java generics do the opposite: one class, type arguments erased at compile time. That contrast is question 13.4, from both sides.',
        },
        {
          kind: 'p',
          text: "**`volatile`** tells the compiler that this variable can change from outside the program's control - hardware, the operating system, another thread - so it must reload it from memory on every read instead of caching it in a register. Without it, a loop like `while (flag == 1) {}` can legally be optimised into an infinite loop, because the compiler can see that nothing in the code changes `flag`.",
        },
        {
          kind: 'code',
          lang: 'cpp',
          caption: 'Where the qualifier binds - 12.6',
          code: `volatile int x;            // volatile int
int volatile x;            // the same thing
volatile int* p;           // pointer to volatile int (the data can change)
int* volatile p;           // volatile pointer to int (the pointer can change)
volatile int* volatile p;  // both`,
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'What volatile is not',
          text: 'It is not a threading primitive. It suppresses caching of the value, but it gives you no atomicity and no ordering guarantee, so `volatile int counter; counter++;` still races - that is a read, an add and a write. For threads you want atomics or a lock. Saying this unprompted is what separates a good answer from a memorised one.',
        },
        {
          kind: 'p',
          text: '**Alignment** is the last piece. Many architectures require (or strongly prefer) a value to sit at an address that is a multiple of its size. To hand back an address divisible by some power of two, over-allocate and then round up.',
        },
        {
          kind: 'code',
          lang: 'cpp',
          caption: 'Aligned malloc - 12.10',
          code: `void* aligned_malloc(size_t bytes, size_t alignment) {
  // Extra room to round up, plus room to remember the real start.
  int offset = alignment - 1 + sizeof(void*);
  void* p1 = malloc(bytes + offset);
  if (p1 == NULL) return NULL;

  // Round up to the next multiple of alignment.
  void* p2 = (void*) (((size_t)(p1) + offset) & ~(alignment - 1));

  ((void**) p2)[-1] = p1;   // stash the real pointer just before it
  return p2;
}

void aligned_free(void* p2) {
  free(((void**) p2)[-1]);  // recover it and free the whole block
}`,
        },
        {
          kind: 'p',
          text: 'Two ideas do all the work there. Asking for `alignment - 1` extra bytes guarantees that an aligned address exists somewhere in the block, and `& ~(alignment - 1)` clears the low bits to land on it. Then, because the caller only ever sees the *aligned* pointer, you must hide the original one immediately before it so `aligned_free` can recover it - which is why the extra `sizeof(void*)` is in the over-allocation.',
        },
        { kind: 'anim', animId: 'cpp-2d-alloc' },
        {
          kind: 'code',
          lang: 'cpp',
          caption: '2D array, one malloc - 12.11',
          code: `int** my2DAlloc(int rows, int cols) {
  int header = rows * sizeof(int*);
  int data   = rows * cols * sizeof(int);
  int** rowptr = (int**) malloc(header + data);
  if (rowptr == NULL) return NULL;

  int* buf = (int*) (rowptr + rows);        // data starts after the header
  for (int i = 0; i < rows; i++) {
    rowptr[i] = buf + i * cols;             // point each row into the block
  }
  return rowptr;                            // arr[i][j] still works
}`,
        },
        {
          kind: 'p',
          text: 'One allocation instead of `rows + 1`, one `free` instead of a loop, and the data ends up contiguous - so a full traversal walks memory in order and the prefetcher can keep up. `arr[i][j]` behaves exactly as before: read the row pointer, offset by j.',
        },
      ],
    },
    {
      id: 'questions',
      title: 'The rest of the chapter, quickly',
      takeaway: 'Two coding questions, one comparison, and the answers you should have ready.',
      audio: true,
      blocks: [
        {
          kind: 'code',
          lang: 'cpp',
          caption: '12.2 Reverse a C string in place',
          code: `void reverse(char* str) {
  if (!str) return;
  char* end = str;
  while (*end) ++end;   // walk to the null terminator
  --end;                // step back off it - this is the gotcha

  while (str < end) {
    char tmp = *str;
    *str++ = *end;
    *end-- = tmp;
  }
}`,
        },
        {
          kind: 'p',
          text: 'The only trick is the null terminator: `end` stops *on* it, so it must step back one before the swapping starts, or you will move the terminator into the middle of the string. Check the null pointer too - `reverse(nullptr)` should do nothing, not crash.',
        },
        {
          kind: 'p',
          text: '**12.1, printing the last K lines of a file.** The naive answer reads the file twice: once to count lines, once to print from N-K. One pass is enough with a **circular buffer** of K strings: read every line into `L[size % K]`, overwriting the oldest each time, then print K entries starting at `size % K`. Only K lines are ever in memory, no matter how large the file. Do not forget the case where the file has fewer than K lines.',
        },
        {
          kind: 'p',
          text: '**12.8, deep-copying a node graph.** Each node has two pointers to other nodes, so the structure can contain cycles and shared nodes - a plain recursive copy would loop forever or duplicate shared nodes. Keep a `map<Node*, Node*>` from original to copy, record each node in the map *before* recursing into its pointers, and return the existing copy on a second visit. That map is the visited-set of a depth-first traversal, doing double duty as the answer.',
        },
        {
          kind: 'table',
          caption: '12.3 Hash table vs STL map',
          headers: ['', 'Hash table', 'STL `map`'],
          rows: [
            ['Structure', 'Array of linked lists (chaining)', 'Balanced binary search tree'],
            ['Lookup / insert', 'O(1) amortised, assuming few collisions', 'O(log n), guaranteed'],
            ['Order', 'None - iteration order is arbitrary', 'Sorted by key'],
            ['Collisions', 'Must be handled, usually by chaining', 'Do not exist'],
            [
              'Needs',
              'A good hash function, and resizing at a load threshold',
              'A comparison operator on the key',
            ],
          ],
        },
        {
          kind: 'p',
          text: 'That table is also the answer to "how is a hash table implemented?": an array of linked lists, each node storing **both key and value** (two different keys can land in the same bucket, so the value alone cannot identify what you found), plus a hash function that distributes well and a resize when the load factor gets high - which means rehashing everything, so you do it rarely. And the last part of the question - what to use instead when the input is small - is exactly this: a `map` or a plain binary tree, because O(log n) on a handful of items is nothing, and you skip the array overhead entirely.',
        },
        {
          kind: 'callout',
          tone: 'tip',
          title: 'What to actually prepare',
          text: 'Unless the role is systems work, you are not being asked to write C++ under time pressure. You are being asked to explain five things in two minutes each: virtual dispatch and vtables, why base destructors are virtual, shallow versus deep copy, what `volatile` does and does not promise, and hash table versus map. Rehearse those out loud.',
        },
      ],
    },
  ],
  quiz: [
    {
      id: 'cpp-1',
      kind: 'concept',
      prompt:
        '`Person* p = new Student(); p->aboutMe();` where `aboutMe` is *not* virtual. What runs?',
      options: [
        "Student's version - the object is a Student",
        "Person's version - without virtual, the declared type decides at compile time",
        'Neither; it fails to compile',
        'It depends on the compiler',
      ],
      answerIndex: 1,
      explain:
        'Static binding. Add `virtual` and the call goes through the vtable, so the real type wins instead.',
    },
    {
      id: 'cpp-2',
      kind: 'concept',
      prompt: 'Why must a polymorphic base class have a virtual destructor?',
      options: [
        'To make the class abstract',
        'So `delete` through a base pointer runs the derived destructor too, instead of leaking its half',
        'To allow multiple inheritance',
        'To make the object smaller',
      ],
      answerIndex: 1,
      explain:
        'Without it only `~Person` runs; everything Student owned is leaked, silently and with no warning.',
    },
    {
      id: 'cpp-3',
      kind: 'technique',
      prompt:
        'A struct holds a `char* ptr`. You shallow-copy it and both copies go out of scope. What happens?',
      options: [
        'Nothing - the buffer is freed once',
        'The buffer is freed twice: a dangling pointer, then a double free',
        'The compiler prevents it',
        'The second free is a no-op',
      ],
      answerIndex: 1,
      explain:
        'Both objects hold the same address and both destructors run. This is the entire argument for deep copies.',
    },
    {
      id: 'cpp-4',
      kind: 'concept',
      prompt:
        'In a reference-counted smart pointer, why is the count a *pointer* to an unsigned rather than an unsigned?',
      options: [
        'To save memory',
        'So every copy shares one counter - separate counters would never reach zero together',
        'Because templates require it',
        'To allow negative counts',
      ],
      answerIndex: 1,
      explain:
        'The whole point is one count per object, shared by every handle to it. A plain member would give each copy its own.',
    },
    {
      id: 'cpp-5',
      kind: 'concept',
      prompt: 'What does `volatile` guarantee in a multithreaded program?',
      options: [
        'That reads and writes are atomic',
        'Only that the compiler will not cache the value - no atomicity, no ordering',
        'That the variable is protected by a lock',
        'That writes are visible in program order to all threads',
      ],
      answerIndex: 1,
      explain:
        'It stops one compiler optimisation. `counter++` is still a read, an add and a write, and still races.',
    },
    {
      id: 'cpp-6',
      kind: 'concept',
      prompt: 'How do C++ templates differ from Java generics?',
      options: [
        'They are equivalent, just different syntax',
        'The compiler instantiates a separate copy per type, so `MyClass<Foo>` and `MyClass<Bar>` are different types with separate statics',
        'Templates only work on primitives',
        'Generics are faster at runtime',
      ],
      answerIndex: 1,
      explain:
        'Templates instantiate at compile time; Java erases the type argument and keeps one class. Hence separate statics in C++.',
    },
    {
      id: 'cpp-7',
      kind: 'complexity',
      prompt:
        'Allocating an `n × m` array with one `malloc` for the row pointers and one per row. How many allocations, and how many frees?',
      options: [
        'n allocations, one free',
        'n + 1 allocations, and n + 1 frees - rows first, then the header',
        'One of each',
        'One allocation, n frees',
      ],
      answerIndex: 1,
      explain:
        'The single-block version - header plus contiguous data - reduces both to one, and traverses cache-friendly.',
    },
    {
      id: 'cpp-8',
      kind: 'technique',
      prompt: 'Print the last K lines of a file in one pass. What do you use?',
      options: [
        'Read the whole file into an array',
        'A circular buffer of K lines, overwriting the oldest as you read',
        'Seek to the end and read backwards',
        'A stack of every line',
      ],
      answerIndex: 1,
      explain:
        'Only K lines are ever in memory. Print K entries starting at `size % K` - and handle files shorter than K.',
    },
    {
      id: 'cpp-9',
      kind: 'technique',
      prompt:
        'Deep-copying a node structure where each node has two arbitrary pointers to other nodes. What is essential?',
      options: [
        'Copy depth-first and stop at depth 100',
        'A map from original node to its copy, filled in *before* recursing, so cycles and shared nodes resolve',
        'Sort the nodes first',
        'Copy breadth-first with a queue',
      ],
      answerIndex: 1,
      explain:
        'The map is the visited set. Recording a node before descending is what stops a cycle looping forever.',
    },
    {
      id: 'cpp-10',
      kind: 'concept',
      prompt: 'What distinguishes a reference from a pointer in C++?',
      options: [
        'References are faster',
        'A reference cannot be null and cannot be re-seated after it is bound',
        'References can only refer to primitives',
        'Pointers cannot be passed to functions',
      ],
      answerIndex: 1,
      explain:
        'It is an alias with no storage of its own. Use a pointer when "nothing" is a legal value, or when you need arithmetic.',
    },
  ],
  drills: [
    {
      slug: 'reverse-string',
      note: 'CTCI 12.2 - in place, and think about the null terminator in C.',
    },
    {
      slug: 'copy-list-with-random-pointer',
      note: 'CTCI 12.8 - deep copy with an arbitrary extra pointer.',
    },
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
