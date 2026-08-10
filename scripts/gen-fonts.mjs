#!/usr/bin/env node
/**
 * Vendors the JetBrains Mono woff2 files into `src/assets/fonts/`.
 *
 *   pnpm gen:fonts
 *
 * The files are committed. Remote font loading is not an option here: the app
 * must render correctly with no network at all, and a webfont fetched from a
 * CDN cannot be precached by our service worker.
 *
 * `@fontsource-variable/jetbrains-mono` is only the delivery mechanism for the
 * upstream binaries, which is why it is a devDependency - nothing imports it at
 * runtime.
 *
 * JetBrains Mono is licensed under the SIL Open Font License 1.1; the licence
 * travels with the fonts in `src/assets/fonts/OFL.txt`.
 */
import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'node_modules', '@fontsource-variable', 'jetbrains-mono');
// Under `src/` rather than `public/` so Vite resolves, hashes and rewrites
// the URLs. A `public/` path would have to be absolute, which breaks the
// `base: './'` promise that the build works from any subdirectory.
const OUT = join(ROOT, 'src', 'assets', 'fonts');

/**
 * Subsets we ship. `greek` is not optional decoration: the Big O lesson uses
 * Ω and Θ when it explains the difference between the bounds.
 * Everything else (arrows, box drawing, maths symbols) falls back to the
 * system font by design - shipping those subsets would cost far more than the
 * handful of glyphs is worth.
 */
const SUBSETS = ['latin', 'latin-ext', 'greek'];
const STYLES = ['normal', 'italic'];

mkdirSync(OUT, { recursive: true });

let total = 0;
const copied = [];
for (const subset of SUBSETS) {
  for (const style of STYLES) {
    const name = `jetbrains-mono-${subset}-wght-${style}.woff2`;
    const from = join(SRC, 'files', name);
    const to = join(OUT, name);
    copyFileSync(from, to);
    const { size } = statSync(to);
    total += size;
    copied.push({ name, size });
    console.log(`  ${name} (${(size / 1024).toFixed(1)} KB)`);
  }
}

copyFileSync(join(SRC, 'LICENSE'), join(OUT, 'OFL.txt'));

// Record what was vendored, so a future update is a diff rather than a guess.
const version = JSON.parse(readFileSync(join(SRC, 'package.json'), 'utf8')).version;
writeFileSync(
  join(OUT, 'SOURCE.md'),
  [
    '# Vendored fonts',
    '',
    'JetBrains Mono (variable weight axis), copied here by `pnpm gen:fonts`.',
    '',
    `- Source: \`@fontsource-variable/jetbrains-mono\` ${version}`,
    '- Upstream: https://github.com/JetBrains/JetBrainsMono',
    `- Subsets: ${SUBSETS.join(', ')} - normal and italic`,
    '- Licence: SIL Open Font License 1.1 (see `OFL.txt`)',
    '',
    'These are committed on purpose. The app has to work with no network, so the',
    'fonts must be precached alongside everything else - see',
    '`scripts/verify-precache.mjs`, which fails the build if they are not.',
    '',
  ].join('\n'),
);

console.log(`Vendored ${copied.length} files, ${(total / 1024).toFixed(1)} KB total, into src/assets/fonts/.`);
