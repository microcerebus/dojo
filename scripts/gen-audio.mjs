#!/usr/bin/env node
/**
 * Regenerates the narration MP3s from the checked-in scripts.
 *
 *   pnpm gen:audio            # only missing or out-of-date clips
 *   pnpm gen:audio --force    # everything
 *   pnpm gen:audio big-o      # only these modules
 *
 * Source of truth: `src/content/narration/<moduleId>/<sectionId>.txt`
 * Output:          `public/audio/<moduleId>/<sectionId>.mp3`
 *
 * The generated MP3s are committed, so the app works (and installs offline)
 * without anyone running this. Regeneration needs network access and edge-tts;
 * it looks for `edge-tts` on PATH, then falls back to `uvx edge-tts` and
 * `python3 -m edge_tts`.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT_DIR = join(ROOT, 'src', 'content', 'narration');
const OUT_DIR = join(ROOT, 'public', 'audio');
const VOICE = 'en-US-AvaMultilingualNeural';
/** Slightly slower than default: this is study material, not a podcast. */
const RATE = '-4%';
/** How many clips to synthesise at once. */
const CONCURRENCY = 4;

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((arg) => !arg.startsWith('--'));

/** Resolve how to invoke edge-tts on this machine. */
function resolveRunner() {
  const candidates = [
    { command: 'edge-tts', prefix: [] },
    { command: 'uvx', prefix: ['edge-tts'] },
    { command: 'python3', prefix: ['-m', 'edge_tts'] },
  ];
  for (const candidate of candidates) {
    const probe = spawnSync(candidate.command, [...candidate.prefix, '--help'], {
      stdio: 'ignore',
      timeout: 120_000,
    });
    if (probe.status === 0) return candidate;
  }
  return null;
}

/**
 * Every narration script in the repo, regardless of the module filter.
 *
 * The filter narrows what gets *synthesised*; it must never narrow the
 * manifest, which describes everything that is committed. Filtering here was
 * how `pnpm gen:audio one-module` used to silently drop every other module's
 * clips from the manifest.
 */
function collectClips() {
  if (!existsSync(SCRIPT_DIR)) return [];
  const clips = [];
  for (const moduleId of readdirSync(SCRIPT_DIR).sort()) {
    const moduleDir = join(SCRIPT_DIR, moduleId);
    if (!statSync(moduleDir).isDirectory()) continue;
    for (const file of readdirSync(moduleDir).sort()) {
      if (!file.endsWith('.txt')) continue;
      clips.push({
        moduleId,
        sectionId: file.replace(/\.txt$/, ''),
        scriptPath: join(moduleDir, file),
        outPath: join(OUT_DIR, moduleId, file.replace(/\.txt$/, '.mp3')),
      });
    }
  }
  return clips;
}

const isStale = (clip) => {
  if (force || !existsSync(clip.outPath)) return true;
  return statSync(clip.scriptPath).mtimeMs > statSync(clip.outPath).mtimeMs;
};

function synthesise(runner, clip) {
  return new Promise((resolve, reject) => {
    mkdirSync(dirname(clip.outPath), { recursive: true });
    const text = readFileSync(clip.scriptPath, 'utf8').trim();
    if (!text) {
      reject(new Error(`${clip.scriptPath} is empty`));
      return;
    }
    const child = spawn(
      runner.command,
      [
        ...runner.prefix,
        '--voice',
        VOICE,
        '--rate',
        RATE,
        '--write-media',
        clip.outPath,
        '--text',
        text,
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    );
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`edge-tts exited ${code} for ${clip.moduleId}/${clip.sectionId}\n${stderr}`));
        return;
      }
      resolve();
    });
  });
}

async function runPool(items, worker) {
  const queue = [...items];
  const failures = [];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let item = queue.shift(); item; item = queue.shift()) {
        try {
          await worker(item);
        } catch (error) {
          failures.push({ item, error });
        }
      }
    }),
  );
  return failures;
}

/** A tiny manifest so the app and the build check know what should exist. */
function writeManifest(clips) {
  const manifest = clips
    .filter((clip) => existsSync(clip.outPath))
    .map((clip) => ({
      moduleId: clip.moduleId,
      sectionId: clip.sectionId,
      path: `audio/${clip.moduleId}/${clip.sectionId}.mp3`,
      bytes: statSync(clip.outPath).size,
    }));
  writeFileSync(
    join(OUT_DIR, 'manifest.json'),
    `${JSON.stringify({ voice: VOICE, rate: RATE, clips: manifest }, null, 2)}\n`,
  );
  return manifest;
}

const clips = collectClips();
if (clips.length === 0) {
  console.error('No narration scripts found.');
  process.exit(1);
}

/** What this run may synthesise. The manifest still covers `clips`. */
const selected = only.length > 0 ? clips.filter((clip) => only.includes(clip.moduleId)) : clips;
if (only.length > 0 && selected.length === 0) {
  console.error(`No narration scripts for: ${only.join(', ')}`);
  process.exit(1);
}

const stale = selected.filter(isStale);
console.log(`${selected.length} narration scripts, ${stale.length} to (re)generate.`);

if (stale.length > 0) {
  const runner = resolveRunner();
  if (!runner) {
    console.error(
      'edge-tts not found. Install it with `uv tool install edge-tts` or `pipx install edge-tts`,\n' +
        'or `pip install edge-tts`. The committed MP3s mean this is only needed to regenerate them.',
    );
    process.exit(1);
  }
  console.log(`Using: ${[runner.command, ...runner.prefix].join(' ')} (voice ${VOICE})`);

  const failures = await runPool(stale, async (clip) => {
    await synthesise(runner, clip);
    const { size } = statSync(clip.outPath);
    console.log(`  ✓ ${clip.moduleId}/${clip.sectionId}.mp3 (${Math.round(size / 1024)} KB)`);
  });

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`  ✗ ${failure.item.moduleId}/${failure.item.sectionId}: ${failure.error.message}`);
    }
    process.exit(1);
  }
}

const manifest = writeManifest(clips);
const totalKb = Math.round(manifest.reduce((sum, clip) => sum + clip.bytes, 0) / 1024);
console.log(`Done. ${manifest.length} clips, ${totalKb} KB total.`);

const missing = clips.filter((clip) => !existsSync(clip.outPath));
if (missing.length > 0) {
  // Anything this run was responsible for is a hard failure. A gap in another
  // module is still worth shouting about - it means the manifest, and so the
  // precache, is short - but it is not this run's job to fix.
  const ours = missing.filter((clip) => selected.includes(clip));
  console.error(`Missing ${missing.length} clips:`);
  for (const clip of missing) console.error(`  - ${clip.moduleId}/${clip.sectionId}`);
  if (ours.length > 0) process.exit(1);
  console.error('Run `pnpm gen:audio` with no arguments to fill the gaps.');
}
