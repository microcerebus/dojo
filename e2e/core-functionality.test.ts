import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Enforces that CORE-FUNCTIONALITY.md stays traceable: every CF id it
 * declares must be cited (by exact id, e.g. "CF-3") in the title of at
 * least one Playwright test under e2e/*.spec.ts.
 */

const here = dirname(fileURLToPath(import.meta.url));
const coreDoc = readFileSync(resolve(here, '../CORE-FUNCTIONALITY.md'), 'utf8');
const ids = [...coreDoc.matchAll(/^## (CF-\d+):/gm)].map((match) => match[1]);

const specFiles = readdirSync(here).filter((name) => name.endsWith('.spec.ts'));
const specText = specFiles.map((name) => readFileSync(join(here, name), 'utf8')).join('\n');

describe('CORE-FUNCTIONALITY.md traceability', () => {
  it('declares at least one CF id', () => {
    expect(ids.length).toBeGreaterThan(0);
  });

  it('found at least one e2e spec file', () => {
    expect(specFiles.length).toBeGreaterThan(0);
  });

  it.each(ids)('%s is cited by at least one e2e test', (id) => {
    const cited = new RegExp(`\\b${id}\\b`).test(specText);
    expect(cited).toBe(true);
  });
});
