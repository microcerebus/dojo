# Core functionality

This is the traceable source of truth for what "the app works" means.
Each entry has a stable ID, a one-line behavior, and how a human would verify it by hand.

This describes the app as it exists on `main` today.
It is not auto-generated: update it by hand whenever a core flow changes shape, and keep IDs stable
(add new ones rather than renumbering) so old e2e citations do not silently point at the wrong flow.

Every entry here must be cited by at least one Playwright test in `e2e/`.
`e2e/core-functionality.spec.ts` has a test that fails if any CF ID below has no citing test.

## CF-1: Curriculum home lists all modules with progress

Visiting `/` renders every module from the content registry, grouped by track, each with a completion
ring and lesson/quiz/drill progress bars.
The header stat row shows modules-started, overall course progress, Blind 75 done, and sprint-weeks
count.

**Verify:** open the app, confirm the module count in the "Modules started" stat matches the number of
module cards on the page, and that each card shows a title, source, and progress ring.

## CF-2: Opening a module renders its lesson

Navigating to `/module/:id` for a `status: 'complete'` module renders its lesson sections (rich text,
animations, audio) with a section rail and prev/next controls.
For a `status: 'outline'` module it instead renders the concept list and planned animations, with no
lesson content.

**Verify:** open a complete module (e.g. `big-o`) and confirm lesson text and a "Next" button appear;
open an outline module and confirm it shows a "still being written" notice and a concept list instead.

## CF-3: Quiz answers score and persist across reload

The Quiz tab presents one question at a time; selecting an option locks in right/wrong feedback and an
explanation, and reaching the end shows a scored result screen.
The best score is written to `localStorage` and displayed as "best N/M" on the next visit, surviving a
full page reload.

**Verify:** open a module's Quiz tab, answer all questions, note the final score, reload the page,
reopen the Quiz tab, and confirm "best" reflects the score just earned.

## CF-4: Drill checkboxes persist

Each drill (LeetCode problem or practice task) in the Drills tab has a checkbox; toggling it updates the
done count immediately and survives a reload.

**Verify:** open a module's Drills tab, check one item, reload the page, and confirm it is still
checked and the "N of M done" summary reflects it.

## CF-5: Audio recap plays with speed and skip controls

Each lesson section with narration shows a play/pause button, ±10s skip buttons, a cycling playback-rate
button, and a transcript toggle.
Playback rate is remembered independently of the rest of progress and applies to the next clip played.

**Verify:** open a module with audio, press play, confirm the time readout advances, press the skip
buttons and confirm the position jumps by ~10s, cycle the rate button and confirm the label changes
(e.g. 1x -> 1.25x).

## CF-6: Sprint view maps modules to weeks

`/sprint` lists five weeks, each naming its focus, goal, and the modules assigned to it with a link and
per-module progress percentage; the current week (by today's date) is visually marked; modules not
assigned to any week appear in an "Unscheduled" list.

**Verify:** open `/sprint`, confirm five week entries render, each linking to real modules, and that
exactly one week (or none, if outside the sprint's date range) is marked "this week".

## CF-7: Coverage page shows study progress and Blind 75 view

`/coverage` has three tabs: all 189 book questions (filterable by id/title/chapter/LeetCode name, each
linking to its owning module), the full Blind 75 list with a done checkmark driven by the same drill
progress as the module Drills tab, and a table of all modules with their status and counts.

**Verify:** open `/coverage`, type a filter term in the questions tab and confirm the list narrows,
switch to the Blind 75 tab and confirm a problem checked off in a module's Drills tab shows as done
here too.

## CF-8: App installs and works offline after first load

The build registers a service worker (via `vite-plugin-pwa`) that precaches the app shell, manifest,
icons, fonts, and every narration MP3, and exposes a valid web app manifest for installability.

**Verify (manual, not CI):** build and serve the app, load it once online, then go offline and reload -
the app shell and a previously-opened module's audio should still work.
CI e2e coverage is intentionally narrower - see the e2e spec header for what is and is not checked here
and why.

## CF-9: Navigation between sections and modules

The header/tabbar nav (Curriculum / Sprint / Coverage) switches top-level pages and highlights the
active one; a module's Lesson/Quiz/Drills tabs switch sub-views without leaving the page; the lesson
section rail, prev/next buttons, and Left/Right arrow keys move between sections; an unknown route
renders the not-found page.

**Verify:** click through Curriculum -> Sprint -> Coverage and confirm the active nav item updates each
time; open a module, switch between its three tabs, then use the arrow keys on the Lesson tab to move
sections; visit a nonexistent hash route and confirm a not-found page renders instead of a blank screen.

## CF-10: Progress persists locally and merges across concurrent writes

All progress (read sections, quiz bests, drill completions) lives in one `localStorage` document
(`dojo.progress.v1`) and merges field-by-field on write rather than overwriting, so progress made in one
browser tab is not lost by a write from another.

**Verify:** open the app in two tabs, complete a drill in tab A, complete a different drill in tab B,
reload tab A, and confirm both drills show as done (see `src/lib/progress.ts` `mergeProgress` and
`AGENTS.md` for why this is not a plain overwrite).

## CF-11: Audio playback speed persists across section navigation

Setting a playback rate on one lesson section's audio recap and then navigating to the next section
keeps playing audio at that same rate - it must not silently revert to 1x, since the rate control
would then be lying about what is actually playing.
This is user-observable behavior across a page transition, not just a single page's rendering, and is
the template for this class of CF: state that a control claims to hold must actually still be applied
after navigation, not just still be displayed.

**Verify:** open a module with audio, cycle the rate button to 2x on the first section, move to the
next section (arrow key or the section rail), press play, and confirm the audio is audibly playing
at 2x - not just that the rate button still reads "2x".

**Status:** currently broken on `main` - the displayed rate label persists correctly, but the
`<audio>` element's actual `playbackRate` silently resets to 1x after navigating sections (the
component only reapplies it when its own rate *state* changes, not on every section change, and the
browser resets `playbackRate` when the element's `src` changes). A fix is in progress on a sibling
branch; the citing e2e test below is marked `test.fail()` until that lands, so it stays a red flag in
the test file without failing this otherwise-unrelated CI run.
