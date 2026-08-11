# dojo

Interactive interview-prep course: animated lessons, audio bites, quizzes, mapped to Blind 75 / LeetCode.

It teaches the whole *Cracking the Coding Interview* (6th edition) curriculum without requiring you to
read the book - concise lessons instead of long prose, interactive animations for the mechanics, a
30-90 second spoken recap per section, and a drill list that always tells you what to solve next.

Everything runs on-device. There is no backend, no account, and no network access at runtime except
the LeetCode links you choose to open.

## Quick start

```bash
pnpm install       # also wires up the git hooks below (husky's `prepare` script)
pnpm dev           # http://localhost:5173
```

```bash
pnpm check        # lint + prettier check + typecheck + tests - what CI and `pnpm run check` both run
pnpm build        # static site into dist/, then verifies the offline precache
pnpm preview      # serve the built site
pnpm e2e           # Playwright, against a local dev server - see Testing below
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
| Typeface | JetBrains Mono, self-hosted as woff2 in the repo |

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
  assets/fonts/           JetBrains Mono woff2, vendored and committed
public/audio/<id>/*.mp3   generated narration, committed
scripts/                  audio, fonts, icons, COVERAGE.md, precache verification
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

## Typography

The whole app - UI and code alike - is set in [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono),
self-hosted from `src/assets/fonts/`. Nothing is fetched from a CDN: a remote font cannot be precached,
so it would silently fall back to a system face on the first offline visit.

```bash
pnpm gen:fonts   # re-vendor the woff2 files after bumping the upstream package
```

One variable font (100-800 weight axis) covers every weight, in latin, latin-ext and greek subsets -
greek because the Big O lesson needs Ω and Θ. The type scale is a notch smaller than a sans stack
would use, since monospace glyphs are wider. Licensed under the SIL Open Font License 1.1; the licence
ships with the fonts.

## Where your progress lives

Progress - sections read, quiz scores, drill checkboxes - is stored on the device in `localStorage`
under a single key, `dojo.progress.v1`. Nothing is sent anywhere.

**Across tabs on desktop.** Every write is merged into whatever is on disk at that moment rather than
overwriting it, and each tab listens for the `storage` event, so two open tabs stay in sync live and
neither can clobber the other. The merge is per entry: two tabs ticking different drills both keep
their tick, in either order. Tabs also re-read on focus, since a frozen background tab can miss an
event.

**Separate from the cache.** Progress is deliberately *not* in the service worker's caches. Clearing
cached assets, or the service worker dropping a stale precache on update, cannot touch it - "free up
space" and "erase my progress" are different actions. There is a test for this, and it holds in the
browser: deleting every Cache Storage entry leaves progress fully intact.

**Persistence.** On load the app calls `navigator.storage.persist()`, which asks the browser to move
this origin into a persistent storage bucket that is exempt from eviction under storage pressure.
Browsers decide whether to grant it - Chrome does so for installed or frequently-used apps, Safari on
user engagement - and a refusal changes nothing about how the app works, only how long the data is
guaranteed to last.

**The honest iOS boundary.** Add dojo to the home screen and its data lives in that installed app's
own storage: it survives reloads, app restarts, OS restarts and offline use, and is not subject to
the 7-day cap Safari applies to ordinary websites. It goes away when you delete the app, or clear
website data for it in Settings. Beyond that the OS has the last word - iOS can evict data from apps
under severe storage pressure, and no web API can override that. So: your progress persists until you
clear it, with the operating system as the one exception nobody on the web can promise around. If you
are mid-sprint and short on disk, that is the thing to watch.

## Offline and mobile

The app is an installable PWA. After one online visit the service worker has precached the shell, all
content, the fonts and every narration clip, so lessons, animations, quizzes, audio and the coverage
map all work with the network off. `pnpm build` fails if the precache stops covering any of that.

The layout is mobile-first and designed against a 390x844 iPhone: safe-area insets are respected,
touch targets are at least 44px, animations step by tap or swipe as well as by arrow key, and audio
playback only ever starts from an explicit tap, per the iOS autoplay policy.

## Testing and CI

`pnpm check` (lint, `prettier --check`, typecheck, `vitest run`) is the gate.
It is enforced three times: a pre-commit hook (staged-file lint/format/related-tests via
`lint-staged`), a pre-push hook (the full `pnpm check`), and the `check` job in
`.github/workflows/ci.yml`.
Hooks are bypassable (`--no-verify`), so CI re-runs everything regardless.
Commit messages are validated against [Conventional Commits](https://www.conventionalcommits.org/) by
commitlint, locally via a `commit-msg` hook and in CI via the `commitlint` job, which lints every
commit on the PR.

**CORE-FUNCTIONALITY.md** is the traceable spec of the app's core flows: each entry has a stable
`CF-<n>` id, a one-line behavior, and a manual verification recipe.
Every id must be cited by at least one Playwright test.
`e2e/core-functionality.test.ts` (a vitest test) fails the build if any id has no citing test, so the
spec cannot silently drift from what is actually covered.

**`pnpm e2e`** runs the Playwright suite in `e2e/core-functionality.spec.ts` against a local dev server
it starts itself, on desktop and one mobile viewport, both Chromium.
`.github/workflows/e2e.yml` runs the same suite on every PR against that PR's Vercel preview
deployment instead: it polls the GitHub Deployments API (via `wait-for-vercel-preview`) for the
"Preview"-environment deployment the captain's Vercel integration creates for the PR's commit, then
points Playwright at its URL (`PLAYWRIGHT_BASE_URL`).
CF-8 (installability) skips itself against the plain dev server, since the PWA manifest and service
worker only exist in a production build - it runs for real against the Vercel preview and against a
local `pnpm build && pnpm preview` (see that test and CF-8 in CORE-FUNCTIONALITY.md for the manual,
offline-specific check this does not automate).

**Vercel Deployment Protection.** If this project's Vercel previews sit behind Vercel Authentication
(the default for new projects/teams - preview URLs redirect to `vercel.com/sso-api` for anyone not
logged into that Vercel team), the e2e workflow needs a bypass: generate a secret under the Vercel
project's Settings -> Deployment Protection -> Protection Bypass for Automation, then add it as the
`VERCEL_AUTOMATION_BYPASS_SECRET` GitHub Actions secret on this repo.
Both the preview-URL health check and every Playwright request then carry the bypass header
automatically (see `playwright.config.ts` and `.github/workflows/e2e.yml`) - no further changes
needed.
The alternative is turning protection off for the Preview environment in the same settings page; either
way this is a Vercel-project setting, not something this repo's code can decide on its own.

## Content

All teaching prose in this repo is original. It paraphrases concepts from *Cracking the Coding
Interview* (6th edition) by Gayle Laakmann McDowell; no passages are reproduced from it, and the book
itself is not part of this repository. Buy the book if you want the full solutions.
