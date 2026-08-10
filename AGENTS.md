# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

## What this is

A Vite + React + TypeScript PWA that teaches the *Cracking the Coding Interview* (6th ed.) curriculum.
See `README.md` for layout and how to add or finish a module, and `COVERAGE.md` for what is written
versus outlined.

`pnpm check` (lint + typecheck + tests) is the gate. `pnpm build` also runs
`scripts/verify-precache.mjs`, which fails the build if the service worker stops precaching the app
shell, the manifest, the icons or any narration MP3.

## Sharp edges

- **COVERAGE.md is generated.** Never hand-edit it; run `pnpm gen:coverage`.
  `src/data/coverage.test.ts` fails if it disagrees with the content data, and that suite is also
  what enforces "every Blind 75 problem in exactly one drill list" and "all 189 questions mapped".
- **Content prose must stay original.** Paraphrase; do not reproduce book passages. The source text
  lives outside this repo and must never be committed. A useful check is to slide a 7-word window
  over the content and grep it against the source before shipping new lessons.
- **Audio is committed, not built.** `public/audio/**/*.mp3` is generated from
  `src/content/narration/**/*.txt` by `pnpm gen:audio` (edge-tts, voice
  `en-US-AvaMultilingualNeural`). Regenerating needs network access; the committed files mean the app
  works offline without it. Keep clips in the 30-90 second range.
- **Dates must use local time, not UTC.** `src/data/sprint.ts` exports `localIsoDate` for this;
  `toISOString().slice(0,10)` reports yesterday for early-morning local times east of UTC.
- **`vite-node` runs the TS scripts** (`scripts/gen-coverage.ts`). Plain `node` cannot resolve this
  project's extensionless directory imports.
- **`pnpm` settings live in `pnpm-workspace.yaml`**, not `package.json` - notably
  `onlyBuiltDependencies: [esbuild]`, without which vite cannot build.

## Conventions that the tests enforce

- One directory per module under `src/content/modules/<id>/`, registered in `src/content/index.ts`.
- Lessons are typed data (`Block[]`), never JSX. Animations are referenced by id from
  `src/anim/registry.ts`.
- Modules are `status: 'complete'` only when they have lesson sections, a 5-10 question quiz, at least
  one animation and narration for every section. Otherwise `'outline'`, with `sections: []` and the
  concepts listed.
- Drills reference `src/data/problems.ts` by slug only; problem metadata lives there once.
- Behaviour lives in pure reducers next to the component (`quizMachine`, `audioMachine`,
  `anim/stepper`, `lib/progress`) so it is testable without rendering.

## Mobile and iOS constraints

iPhone is the primary surface. Layouts are mobile-first, verified at 390x844, and the page must never
scroll horizontally (wide tables scroll inside their own `.tablewrap`). Touch targets are >= 44px
(`--tap`). Audio `play()` must stay inside the tap handler - iOS ignores it from an effect, which is
why `AudioBite` issues the command synchronously rather than deferring it.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
