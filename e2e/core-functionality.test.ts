import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Enforces that CORE-FUNCTIONALITY.md stays traceable: every CF id it
 * declares must be cited (by exact id, e.g. "CF-3") in the *title* of at
 * least one Playwright test under e2e/*.spec.ts - not merely mentioned
 * anywhere in the file, since a comment referencing an id is not coverage.
 */

const here = dirname(fileURLToPath(import.meta.url));
const coreDoc = readFileSync(resolve(here, '../CORE-FUNCTIONALITY.md'), 'utf8');
const ids = [...coreDoc.matchAll(/^## (CF-\d+):/gm)].map((match) => match[1]);

const specFiles = readdirSync(here).filter((name) => name.endsWith('.spec.ts'));

// Pulls out only the string literal passed as each `test(...)` call's title
// - not the rest of the file, so a CF id mentioned in a comment (e.g. "see
// CF-11 for context") does not count as that id being tested.
function extractTestTitles(source: string): string[] {
  const titles: string[] = [];
  for (const match of source.matchAll(/\btest\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g)) {
    titles.push(match[2]);
  }
  return titles;
}

const testTitles = specFiles.flatMap((name) =>
  extractTestTitles(readFileSync(join(here, name), 'utf8')),
);
const titleText = testTitles.join('\n');

describe('CORE-FUNCTIONALITY.md traceability', () => {
  it('declares at least one CF id', () => {
    expect(ids.length).toBeGreaterThan(0);
  });

  it('found at least one e2e spec file', () => {
    expect(specFiles.length).toBeGreaterThan(0);
  });

  it('extracted at least one test title from the spec files', () => {
    expect(testTitles.length).toBeGreaterThan(0);
  });

  it.each(ids)('%s is cited by at least one e2e test title', (id) => {
    const cited = new RegExp(`\\b${id}\\b`).test(titleText);
    expect(cited).toBe(true);
  });
});
