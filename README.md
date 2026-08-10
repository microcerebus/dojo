# dojo

Interactive interview-prep course: animated lessons, audio bites, quizzes, mapped to Blind 75 / LeetCode.

It teaches the whole *Cracking the Coding Interview* (6th edition) curriculum without requiring you to
read the book - concise lessons instead of long prose, interactive animations for the mechanics, a
30-90 second spoken recap per section, and a drill list that always tells you what to solve next.

Everything runs on-device. There is no backend, no account, and no network access at runtime except
the LeetCode links you choose to open.

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

```bash
pnpm check        # lint + typecheck + tests - run this before every commit
pnpm build        # static site into dist/, then verifies the offline precache
pnpm preview      # serve the built site
```

`dist/` is a plain static bundle. It uses a hash router and relative asset paths, so it works from any
static server, including a subdirectory, with no rewrite rules.

## What is in it

| | |
|---|---|
| Modules | 27, covering all 17 chapters plus the process parts and Advanced Topics |
| Fully written | Big O, the technical-question method, Arrays & Strings, Linked Lists, Stacks & Queues |
| Book questions indexed | all 189, each mapped to the module that teaches its technique |
| Blind 75 | all 75, each assigned to exactly one module's drill list |
| Animations | 18 step-through visualisations |
| Audio | 30 narrated recaps, generated with edge-tts and committed |

See [COVERAGE.md](./COVERAGE.md) for the full map - it is generated from the content data, so it
cannot drift.

Remaining modules ship as structured outlines: every concept the finished lesson must cover is listed,
and the drill lists are already complete, so nothing is invisible while the prose is being written.

## Layout

```
src/
  content/
    types.ts              the content schema
    index.ts              module registry
    modules/<id>/
      index.ts            the module: lesson, quiz, drills
      animations.tsx      its animations (fully written modules only)
    narration/<id>/*.txt  audio scripts - the source of truth for the MP3s
  anim/                   animation framework: stepper, player, primitives, registry
  components/             quiz, drill list, audio player, block renderer
  data/                   189 questions, problem catalogue, sprint schedule
  lib/                    progress state and the localStorage-backed store
  pages/                  curriculum, module, sprint, coverage
public/audio/<id>/*.mp3   generated narration, committed
scripts/                  audio, icons, COVERAGE.md, precache verification
```

## Adding or finishing a module

1. Create `src/content/modules/<id>/index.ts` exporting a `CourseModule`, and register it in
   `src/content/index.ts`.
2. Write the lesson as `sections`, each a list of typed blocks. Reference animations by id.
3. Add `animations.tsx` and register the specs in `src/anim/registry.ts`.
4. Write one narration script per section at `src/content/narration/<id>/<sectionId>.txt`, then run
   `pnpm gen:audio` and commit the MP3s.
5. Flip `status` to `'complete'`, run `pnpm gen:coverage`, and run `pnpm check`.

The data-integrity tests in `src/data/coverage.test.ts` enforce the rest: every Blind 75 problem in
exactly one drill list, every drill slug present in the catalogue, every animation referenced, and
COVERAGE.md consistent with the data.

## Audio

Narration scripts are checked in as plain text and the generated MP3s are committed, so the app works
offline without anyone regenerating anything.

```bash
pnpm gen:audio             # regenerate only what changed
pnpm gen:audio --force     # regenerate everything
pnpm gen:audio big-o       # one module
```

Voice: `en-US-AvaMultilingualNeural` via [edge-tts](https://github.com/rany2/edge-tts). The script
finds `edge-tts` on `PATH`, then falls back to `uvx edge-tts` and `python3 -m edge_tts`.

## Offline and mobile

The app is an installable PWA. After one online visit the service worker has precached the shell, all
content and every narration clip, so lessons, animations, quizzes, audio and the coverage map all work
with the network off. `pnpm build` fails if the precache stops covering any of that.

The layout is mobile-first and designed against a 390x844 iPhone: safe-area insets are respected,
touch targets are at least 44px, animations step by tap or swipe as well as by arrow key, and audio
playback only ever starts from an explicit tap, per the iOS autoplay policy.

## Content

All teaching prose in this repo is original. It paraphrases concepts from *Cracking the Coding
Interview* (6th edition) by Gayle Laakmann McDowell; no passages are reproduced from it, and the book
itself is not part of this repository. Buy the book if you want the full solutions.
