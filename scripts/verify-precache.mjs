#!/usr/bin/env node
/**
 * Build-level check: does the generated service worker actually precache
 * everything the app needs to work offline?
 *
 * Runs as the last step of `pnpm build`. A silently-shrinking precache list is
 * exactly the kind of regression that only shows up as "the app is blank on the
 * train", so it fails the build instead.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SW = join(DIST, 'sw.js');

export function readPrecachedUrls(swSource) {
  // Workbox inlines the manifest as an array of {revision, url} objects.
  const urls = new Set();
  for (const match of swSource.matchAll(/"url"\s*:\s*"([^"]+)"/g)) urls.add(match[1]);
  for (const match of swSource.matchAll(/url\s*:\s*"([^"]+)"/g)) urls.add(match[1]);
  return urls;
}

function walk(dir, base = dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full, base) : [relative(base, full)];
  });
}

export function checkPrecache({ precached, distFiles }) {
  const problems = [];
  const has = (predicate) => [...precached].some(predicate);

  if (!has((url) => url === 'index.html' || url.endsWith('/index.html'))) {
    problems.push('index.html is not precached - the app shell will not load offline');
  }
  if (!has((url) => url.endsWith('.js'))) problems.push('no JavaScript bundle is precached');
  if (!has((url) => url.endsWith('.css'))) problems.push('no stylesheet is precached');
  if (!has((url) => url.endsWith('.webmanifest'))) {
    problems.push('the web app manifest is not precached - install will not work offline');
  }
  for (const icon of ['icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png']) {
    if (!precached.has(icon)) problems.push(`${icon} is not precached`);
  }

  const audioInDist = distFiles.filter((file) => file.endsWith('.mp3'));
  if (audioInDist.length === 0) {
    problems.push('no MP3s were emitted into dist - the audio bites are missing');
  }
  const missingAudio = audioInDist.filter((file) => !precached.has(file.split('\\').join('/')));
  if (missingAudio.length > 0) {
    problems.push(
      `${missingAudio.length} narration clip(s) are not precached, starting with ${missingAudio[0]}`,
    );
  }

  return { problems, audioCount: audioInDist.length, precachedCount: precached.size };
}

function main() {
  if (!existsSync(DIST)) {
    console.error('dist/ does not exist - run `pnpm build` first.');
    process.exit(1);
  }
  if (!existsSync(SW)) {
    console.error('dist/sw.js is missing - the PWA plugin did not produce a service worker.');
    process.exit(1);
  }

  const precached = readPrecachedUrls(readFileSync(SW, 'utf8'));
  const distFiles = walk(DIST).map((file) => file.split('\\').join('/'));
  const { problems, audioCount, precachedCount } = checkPrecache({ precached, distFiles });

  if (problems.length > 0) {
    console.error('Service worker precache check failed:');
    for (const problem of problems) console.error(`  ✗ ${problem}`);
    process.exit(1);
  }

  console.log(
    `Precache OK: ${precachedCount} entries, including ${audioCount} narration clips, ` +
      'the app shell, the manifest and the icons.',
  );
}

// Only run when invoked directly, so the pure helpers stay importable by tests.
if (process.argv[1] && process.argv[1].endsWith('verify-precache.mjs')) main();
