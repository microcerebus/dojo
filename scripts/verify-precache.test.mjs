import { describe, expect, it } from 'vitest';
import { checkPrecache, readPrecachedUrls } from './verify-precache.mjs';

const SW_SAMPLE = `
self.__WB_MANIFEST;
precacheAndRoute([
  {"revision":"abc","url":"index.html"},
  {"revision":null,"url":"assets/index-1234.js"},
  {"revision":null,"url":"assets/index-1234.css"},
  {"revision":"d","url":"manifest.webmanifest"},
  {"revision":"e","url":"icons/icon-192.png"},
  {"revision":"f","url":"icons/icon-512.png"},
  {"revision":"g","url":"icons/apple-touch-icon.png"},
  {"revision":"h","url":"audio/big-o/space.mp3"}
]);
`;

const DIST = [
  'index.html',
  'assets/index-1234.js',
  'assets/index-1234.css',
  'manifest.webmanifest',
  'sw.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'audio/big-o/space.mp3',
];

describe('readPrecachedUrls', () => {
  it('extracts every url from the workbox manifest', () => {
    const urls = readPrecachedUrls(SW_SAMPLE);
    expect(urls.has('index.html')).toBe(true);
    expect(urls.has('audio/big-o/space.mp3')).toBe(true);
    expect(urls.size).toBe(8);
  });

  it('returns an empty set for a service worker with no manifest', () => {
    expect(readPrecachedUrls('self.addEventListener("fetch", () => {});').size).toBe(0);
  });
});

describe('checkPrecache', () => {
  it('passes when the shell, manifest, icons and audio are all precached', () => {
    const result = checkPrecache({ precached: readPrecachedUrls(SW_SAMPLE), distFiles: DIST });
    expect(result.problems).toEqual([]);
    expect(result.audioCount).toBe(1);
  });

  it('fails when an MP3 is emitted but not precached', () => {
    const result = checkPrecache({
      precached: readPrecachedUrls(SW_SAMPLE),
      distFiles: [...DIST, 'audio/big-o/amortised.mp3'],
    });
    expect(result.problems.join(' ')).toMatch(/not precached/);
    expect(result.problems.join(' ')).toMatch(/amortised\.mp3/);
  });

  it('fails when the app shell is missing', () => {
    const precached = readPrecachedUrls(SW_SAMPLE);
    precached.delete('index.html');
    const result = checkPrecache({ precached, distFiles: DIST });
    expect(result.problems.join(' ')).toMatch(/index\.html is not precached/);
  });

  it('fails when the web app manifest is missing, since install would break', () => {
    const precached = readPrecachedUrls(SW_SAMPLE);
    precached.delete('manifest.webmanifest');
    const result = checkPrecache({ precached, distFiles: DIST });
    expect(result.problems.join(' ')).toMatch(/manifest is not precached/);
  });

  it('fails when the apple-touch-icon is missing, since iOS install would break', () => {
    const precached = readPrecachedUrls(SW_SAMPLE);
    precached.delete('icons/apple-touch-icon.png');
    const result = checkPrecache({ precached, distFiles: DIST });
    expect(result.problems.join(' ')).toMatch(/apple-touch-icon\.png is not precached/);
  });

  it('fails when no audio reached dist at all', () => {
    const result = checkPrecache({
      precached: readPrecachedUrls(SW_SAMPLE),
      distFiles: DIST.filter((file) => !file.endsWith('.mp3')),
    });
    expect(result.problems.join(' ')).toMatch(/no MP3s/);
  });
});
