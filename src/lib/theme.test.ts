import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_CHOICE,
  LIGHT_QUERY,
  SCHEME_CHROME,
  THEME_CHOICES,
  THEME_STORAGE_KEY,
  applyScheme,
  nextThemeChoice,
  parseThemeChoice,
  readStoredChoice,
  resolveScheme,
  storeChoice,
  themeStore,
} from './theme';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const indexHtml = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
const globalCss = readFileSync(resolve(ROOT, 'src/styles/global.css'), 'utf8');

function setMetas(): void {
  document.head.innerHTML = `
    <meta name="theme-color" content="#000000" />
    <meta name="apple-mobile-web-app-status-bar-style" content="stale" />
  `;
  document.documentElement.removeAttribute('data-theme');
}

function metaContent(name: string): string | null {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;
}

beforeEach(() => {
  localStorage.clear();
  setMetas();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('choice parsing', () => {
  it.each(THEME_CHOICES)('keeps the valid choice %s', (choice) => {
    expect(parseThemeChoice(choice)).toBe(choice);
  });

  it.each([null, undefined, '', 'mocha', 'DARK', 0, {}])(
    'falls back to the default for %o',
    (raw) => {
      expect(parseThemeChoice(raw)).toBe(DEFAULT_CHOICE);
    },
  );
});

describe('resolveScheme', () => {
  it('honours an explicit choice regardless of the system preference', () => {
    expect(resolveScheme('dark', true)).toBe('dark');
    expect(resolveScheme('light', false)).toBe('light');
  });

  it('follows the system preference for `system`', () => {
    expect(resolveScheme('system', true)).toBe('light');
    expect(resolveScheme('system', false)).toBe('dark');
  });
});

describe('nextThemeChoice', () => {
  it('cycles through all three and returns to the start', () => {
    const seen = [DEFAULT_CHOICE];
    for (let i = 0; i < THEME_CHOICES.length; i++) {
      seen.push(nextThemeChoice(seen[seen.length - 1]));
    }
    expect(seen.slice(0, -1).sort()).toEqual([...THEME_CHOICES].sort());
    expect(seen[seen.length - 1]).toBe(DEFAULT_CHOICE);
  });
});

describe('persistence', () => {
  it('round-trips a choice through localStorage', () => {
    storeChoice('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(readStoredChoice()).toBe('light');
  });

  it('reads a corrupt stored value as the default rather than throwing', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'latte');
    expect(readStoredChoice()).toBe(DEFAULT_CHOICE);
  });

  it('survives storage being unavailable', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readStoredChoice()).toBe(DEFAULT_CHOICE);
    expect(() => storeChoice('dark')).not.toThrow();
    getItem.mockRestore();
    setItem.mockRestore();
  });
});

describe('applyScheme', () => {
  it.each(['dark', 'light'] as const)('stamps %s onto the document and the chrome', (scheme) => {
    applyScheme(scheme);
    expect(document.documentElement.getAttribute('data-theme')).toBe(scheme);
    expect(metaContent('theme-color')).toBe(SCHEME_CHROME[scheme].themeColor);
    expect(metaContent('apple-mobile-web-app-status-bar-style')).toBe(
      SCHEME_CHROME[scheme].statusBar,
    );
  });

  it('is idempotent', () => {
    applyScheme('light');
    applyScheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

describe('themeStore', () => {
  afterEach(() => {
    themeStore.set(DEFAULT_CHOICE);
  });

  it('notifies subscribers and applies the resolved scheme on set', () => {
    const listener = vi.fn();
    const unsubscribe = themeStore.subscribe(listener);

    themeStore.set('light');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(themeStore.getChoice()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // A no-op set still re-applies (cheap and idempotent) but must not churn
    // React with a state change that did not happen.
    themeStore.set('light');
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    themeStore.set('dark');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('picks up a value another tab wrote', () => {
    themeStore.set('dark');
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    themeStore.refresh();
    expect(themeStore.getChoice()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('resolves `system` against the live media query', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === LIGHT_QUERY,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    themeStore.set('system');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

/**
 * The boot script in index.html is a hand-written copy of what `applyScheme`
 * does, because it has to run before any bundle exists (see the comment on it).
 * A copy that can drift is a flash of the wrong theme waiting to happen, so
 * every constant it hardcodes is pinned here.
 */
describe('the pre-paint boot script in index.html', () => {
  const script = indexHtml.slice(
    indexHtml.indexOf('<script>'),
    indexHtml.indexOf('</script>') + '</script>'.length,
  );

  it('exists as an inline script', () => {
    expect(script).toContain('data-theme');
  });

  it('uses the same storage key and choices as the module', () => {
    expect(script).toContain(`'${THEME_STORAGE_KEY}'`);
    expect(script).toContain(`'${LIGHT_QUERY}'`);
    for (const choice of THEME_CHOICES) expect(script).toContain(`'${choice}'`);
  });

  it.each(['dark', 'light'] as const)('hardcodes the same chrome values for %s', (scheme) => {
    expect(script).toContain(`'${SCHEME_CHROME[scheme].themeColor}'`);
    expect(script).toContain(`'${SCHEME_CHROME[scheme].statusBar}'`);
  });

  it('runs before the app bundle, or it would not prevent the flash', () => {
    expect(indexHtml.indexOf('<script>')).toBeLessThan(indexHtml.indexOf('<script type="module"'));
  });

  it('leaves the static meta tags on the dark defaults it falls back to', () => {
    expect(indexHtml).toContain(
      `<meta name="theme-color" content="${SCHEME_CHROME.dark.themeColor}"`,
    );
    expect(indexHtml).toContain(
      `<meta name="apple-mobile-web-app-status-bar-style" content="${SCHEME_CHROME.dark.statusBar}"`,
    );
  });
});

/**
 * `theme-color` paints the browser chrome directly above the page, so it is
 * wrong the moment it stops equalling the palette's `--bg`.
 */
describe('the chrome colours track the palettes', () => {
  it('reads --bg from the page background token', () => {
    expect(globalCss).toContain('--bg: var(--ctp-mantle);');
  });

  it.each(['dark', 'light'] as const)('matches %s’s --ctp-mantle', (scheme) => {
    const mantles = [...globalCss.matchAll(/--ctp-mantle:\s*(#[0-9a-f]{6});/g)].map((m) => m[1]);
    // Declared once per palette block, dark first - see global.css.
    expect(mantles).toHaveLength(2);
    const index = scheme === 'dark' ? 0 : 1;
    expect(SCHEME_CHROME[scheme].themeColor).toBe(mantles[index]);
  });
});
