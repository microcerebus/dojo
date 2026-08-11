/**
 * Data-integrity tests for the VisuAlgo catalog and its module links, so the
 * "everything from VisuAlgo" claim on the coverage page cannot silently rot.
 */
import { describe, expect, it } from 'vitest';

import { MODULES, getModule } from '../content';
import { VISUALGO_CATALOG, visualgoUrl } from './visualgo';

/**
 * The full enumeration recorded from https://visualgo.net/en and verified
 * with a live HTTP check (every id below returned 200) when this catalog was
 * built. A change here means the upstream catalog changed and
 * `VISUALGO_CATALOG` needs re-verifying against the live site, not just a
 * quiet edit to make the test pass.
 */
const RECORDED_ENUMERATION = [
  'array',
  'list',
  'heap',
  'hashtable',
  'bst',
  'graphds',
  'ufds',
  'fenwicktree',
  'segmenttree',
  'sorting',
  'bitmask',
  'recursion',
  'dfsbfs',
  'mst',
  'sssp',
  'cyclefinding',
  'maxflow',
  'matching',
  'mvc',
  'steinertree',
  'tsp',
  'suffixtree',
  'suffixarray',
  'polygon',
  'convexhull',
  'reductions',
].sort();

describe('VisuAlgo catalog', () => {
  it('matches the recorded, HTTP-verified enumeration exactly', () => {
    const ids = VISUALGO_CATALOG.map((entry) => entry.id).sort();
    expect(ids).toEqual(RECORDED_ENUMERATION);
  });

  it('has unique ids and unique urls', () => {
    const ids = VISUALGO_CATALOG.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    const urls = VISUALGO_CATALOG.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('links only to visualgo.net, links only (no other host)', () => {
    for (const entry of VISUALGO_CATALOG) {
      expect(entry.url, entry.id).toMatch(/^https:\/\/visualgo\.net\/en\/[a-z]+$/);
    }
  });

  it('gives every entry a non-empty title and category', () => {
    for (const entry of VISUALGO_CATALOG) {
      expect(entry.title.length, entry.id).toBeGreaterThan(0);
      expect(entry.category.length, entry.id).toBeGreaterThan(0);
    }
  });

  it('references only modules that exist', () => {
    for (const entry of VISUALGO_CATALOG) {
      for (const moduleId of entry.moduleIds) {
        expect(getModule(moduleId), `${entry.id} -> ${moduleId}`).toBeDefined();
      }
    }
  });

  it('throws visualgoUrl on an unknown id rather than returning a dead link', () => {
    expect(() => visualgoUrl('not-a-real-id')).toThrow();
  });
});

describe('module visualizer links', () => {
  it('points every module visualizer at a URL in the catalog', () => {
    const catalogUrls = new Set(VISUALGO_CATALOG.map((entry) => entry.url));
    for (const courseModule of MODULES) {
      for (const viz of courseModule.visualizers ?? []) {
        expect(catalogUrls.has(viz.url), `${courseModule.id}: ${viz.url}`).toBe(true);
      }
    }
  });

  it('gives every module visualizer a non-empty note', () => {
    for (const courseModule of MODULES) {
      for (const viz of courseModule.visualizers ?? []) {
        expect(viz.note.length, `${courseModule.id}: ${viz.url}`).toBeGreaterThan(10);
      }
    }
  });

  it('has no duplicate visualizer urls within a module', () => {
    for (const courseModule of MODULES) {
      const urls = (courseModule.visualizers ?? []).map((viz) => viz.url);
      expect(new Set(urls).size, courseModule.id).toBe(urls.length);
    }
  });

  it('agrees with the catalog on which modules a visualizer is linked from', () => {
    // Every catalog entry's moduleIds should be exactly the modules whose
    // `visualizers` list references that entry's url - so the coverage page
    // and the lesson-view rows never disagree about "who links to what".
    for (const entry of VISUALGO_CATALOG) {
      const actualModuleIds = MODULES.filter((courseModule) =>
        (courseModule.visualizers ?? []).some((viz) => viz.url === entry.url),
      )
        .map((courseModule) => courseModule.id)
        .sort();
      expect(actualModuleIds, entry.id).toEqual([...entry.moduleIds].sort());
    }
  });
});
