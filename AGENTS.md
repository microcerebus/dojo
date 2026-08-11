# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

## What this is

A Vite + React + TypeScript PWA that teaches the *Cracking the Coding Interview* (6th ed.) curriculum.
See `README.md` for layout and how to add or finish a module, and `COVERAGE.md` for what is written
versus outlined.

`pnpm check` (lint + typecheck + tests) is the gate. `pnpm build` also runs
`scripts/verify-precache.mjs`, which fails the build if the service worker stops precaching the app
shell, the manifest, the icons, the fonts or any narration MP3.

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
  works offline without it. Keep clips in the 30-90 second range - that is roughly 150-200 words at
  this voice and rate, so a narration script that restates the whole section will overshoot. The clip
  is a recap; the lesson blocks carry the detail. Around 400-550 KB per MP3 is the sanity check, and
  `afinfo public/audio/<m>/<s>.mp3` gives the exact duration - when one runs long, trim the script.
  Two manifest traps: `pnpm gen:audio <module>` rewrites `public/audio/manifest.json` from *only* the
  modules named, silently dropping every other clip; and staleness is decided by mtime, so a fresh
  checkout re-synthesises everything. Restore the modules you did not touch with `git checkout`,
  finish with a bare `pnpm gen:audio`, and check the manifest diff is additive before committing.
- **`vite preview` is served through the service worker.** After a rebuild the browser keeps handing
  back the precached old bundle. Unregister the worker and clear the Cache API before screenshotting,
  or you will verify the previous build without noticing.
- **Fonts are self-hosted and committed.** JetBrains Mono lives in `src/assets/fonts/`, vendored by
  `pnpm gen:fonts`. Never load a webfont from a CDN - it cannot be precached, so the first offline
  visit would silently fall back to a system face. They sit under `src/` rather than `public/` so
  Vite hashes them and rewrites the URLs; a `public/` path would have to be absolute and would break
  the `base: './'` promise that the build runs from any subdirectory.
- **The UI is monospace.** `--font` and `--mono` are the same stack. When adding UI, remember
  monospace glyphs are ~25% wider than a sans equivalent: check 390px before assuming a label fits.
- **Animation text is not markdown.** Lesson blocks go through `RichText` (`**bold**`, `*italic*`,
  `` `code` ``), and `src/components/RichText.test.tsx` scans every block for unbalanced markers.
  But an animation's `title`/`blurb`/`caption`/`detail` render literally, so `**bold**` and backticks
  appear on screen as-is - write those without markup. A test in `coverage.test.ts` also enforces
  this. Same family of mistake: `Cells` is a fixed square sized for one value - anything with a
  word-length label wants `Chips`.
- **`Matrix` row labels get 18px.** `rowLabels` is a fixed narrow column, so anything longer than a
  character or two is unreadable. Use single-letter `colLabels` plus a `Caption` legend, and name
  the current row in the `Readout` instead.
- **Progress writes merge, never overwrite.** `progressStore.update` applies the transition to a
  fresh read and then merges the result into storage per entry (`mergeProgress`). The whole document
  lives under one key, so a plain write is last-writer-wins for everything and loses concurrent work
  from another tab. Sections union, quiz scores take the best, drills are entry-wise with `next`
  winning so un-ticking still works. Do not "simplify" this back to a set union - that silently makes
  un-checking a drill impossible.
- **Progress must stay out of the Cache API.** It lives in localStorage precisely so clearing cached
  assets cannot erase it. There is a test asserting the store never calls `caches`.
- **Audio playback rate is a separate localStorage key (`dojo:audio-rate`, `src/lib/audioRate.ts`),
  not part of the progress document.** It is a single scalar preference with no merge concerns, so it
  intentionally does not go through `progressStore`/`mergeProgress`. `audioMachine`'s `skip` and
  `setRate` events follow the same reducer-returns-a-command pattern as `press` - element mutations
  (seek, playback rate) must come from a dispatched command, never bolted on beside it.
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
- Animation frames must derive every number they display from executed state - never hand-count a
  total or retype a computed value into a caption. Capture what a step is about *before* mutating,
  and name each `Readout` entry after the row it mirrors: a generic label like "value" on a frame
  mid-transition silently contradicts the row beside it. `animations.test.ts(x)` beside a module
  pins these by recomputing each claim from an independent reference and by reading the rendered
  DOM back out. Captions bypass `RichText`, so `**bold**` markup shows up literally.
- External live tools (currently VisuAlgo, `src/data/visualgo.ts`) are LINKS ONLY - the app never
  embeds or copies a third party's copyrighted visualizations, only links out with clear attribution.
  A module's `visualizers` field references catalog entries by id via `visualgoUrl()`, never a
  hand-typed URL, so a typo throws in dev instead of shipping a dead link.
  `src/data/visualgo.test.ts` pins the catalog against a recorded, HTTP-verified enumeration -
  re-verify against the live site before editing it, rather than just updating the recorded list.
- The coverage page's "modules" tab shows the reader's own study progress (`moduleStudySummary` /
  `formatStudySummary` in `lib/progress.ts`), not the content-authoring `status`. `COVERAGE.md` and
  its generator still use authoring status - that file is for contributors, not readers - so the two
  never claim to agree.

## Mobile and iOS constraints

The app is dark-only: `color-scheme: dark` plus explicit Catppuccin Mocha tokens, with no
`prefers-color-scheme` branches. A light-OS device therefore gets the same Mocha rendering. If a light
theme is ever wanted, Catppuccin Latte would drop into the `--ctp-*` block in `src/styles/global.css`.

iPhone is the primary surface. Layouts are mobile-first, verified at 390x844, and the page must never
scroll horizontally (wide tables scroll inside their own `.tablewrap`). Touch targets are >= 44px
(`--tap`). Audio `play()` must stay inside the tap handler - iOS ignores it from an effect, which is
why `AudioBite` issues the command synchronously rather than deferring it.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
