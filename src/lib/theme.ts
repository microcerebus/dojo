/**
 * The reader's colour-scheme choice: system, dark, or light.
 *
 * Three deliberate choices:
 *
 * - **A choice, not a scheme.** What is stored is `system | dark | light`;
 *   the concrete scheme is derived from it and the OS preference on every
 *   read. Storing the resolved scheme instead would freeze a reader who picked
 *   "system" into whatever their OS said the day they first opened the app.
 * - **localStorage, and its own key.** Like `dojo:audio-rate` and unlike
 *   progress, this is a single scalar preference with no merge concerns, so it
 *   does not go through `progressStore`/`mergeProgress`. It is also not in the
 *   Cache API, so clearing cached assets cannot reset it.
 * - **Applied by writing an attribute, not by swapping stylesheets.** The two
 *   palettes both live in `src/styles/global.css` keyed on
 *   `html[data-theme]`, so applying a scheme is one attribute write and the
 *   pre-paint boot script in `index.html` can do it with no bundle loaded.
 *   That script is the reason there is no flash of the wrong theme, and
 *   `src/lib/theme.test.ts` pins it to the constants below.
 */

export const THEME_STORAGE_KEY = 'dojo:theme';

export const THEME_CHOICES = ['system', 'dark', 'light'] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

/** What actually gets painted once a choice is resolved. */
export type ColorScheme = 'dark' | 'light';

/** dojo is dark-first: an unset preference follows the OS, and the OS is
 *  assumed dark when it will not say. */
export const DEFAULT_CHOICE: ThemeChoice = 'system';

export const THEME_LABELS: Record<ThemeChoice, string> = {
  system: 'System',
  dark: 'Dark',
  light: 'Light',
};

/**
 * Geometric glyphs rather than a sun/moon pair: `☀` and `☾` render as colour
 * emoji on iOS, which would drop a non-monospace, non-token-coloured blob into
 * a monospace bar. A half-filled circle for "follow the system" reads as
 * partial on purpose.
 */
export const THEME_ICONS: Record<ThemeChoice, string> = {
  system: '◐',
  dark: '●',
  light: '○',
};

/**
 * The browser-chrome colour and iOS status-bar style for each scheme.
 *
 * `themeColor` must equal the palette's `--bg` (`--ctp-mantle`) or the notch
 * area and the page will not match; `src/lib/theme.test.ts` reads both out of
 * `global.css` and fails if they drift apart.
 *
 * `black-translucent` lets the page run under the status bar and forces white
 * status text, which is unreadable over Latte - so light mode uses `default`
 * and simply starts below the bar. The layout already pads by
 * `env(safe-area-inset-top)`, which collapses to 0 in that mode, so nothing
 * else has to change. iOS only reads this meta while loading the page, which
 * is why the boot script sets it rather than the toggle.
 */
export const SCHEME_CHROME: Record<ColorScheme, { themeColor: string; statusBar: string }> = {
  dark: { themeColor: '#181825', statusBar: 'black-translucent' },
  light: { themeColor: '#e6e9ef', statusBar: 'default' },
};

/** The media query the boot script and the live listener both key off. */
export const LIGHT_QUERY = '(prefers-color-scheme: light)';

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return (THEME_CHOICES as readonly unknown[]).includes(value);
}

/** Anything unrecognised - absent, corrupt, or from an older build - is
 *  `system`, so a bad value can never strand the reader in one scheme. */
export function parseThemeChoice(raw: unknown): ThemeChoice {
  return isThemeChoice(raw) ? raw : DEFAULT_CHOICE;
}

export function resolveScheme(choice: ThemeChoice, systemPrefersLight: boolean): ColorScheme {
  if (choice === 'dark' || choice === 'light') return choice;
  return systemPrefersLight ? 'light' : 'dark';
}

/** The toggle is one button, so the three states cycle in listed order. */
export function nextThemeChoice(current: ThemeChoice): ThemeChoice {
  const index = THEME_CHOICES.indexOf(current);
  return THEME_CHOICES[(index + 1) % THEME_CHOICES.length];
}

export function readStoredChoice(): ThemeChoice {
  try {
    return parseThemeChoice(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    // Private mode or a blocked storage bucket: follow the system.
    return DEFAULT_CHOICE;
  }
}

export function storeChoice(choice: ThemeChoice): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Persisting is best-effort; the scheme still applies for this session.
  }
}

export function systemPrefersLight(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(LIGHT_QUERY).matches;
}

function setMeta(name: string, content: string): void {
  document.querySelector(`meta[name="${name}"]`)?.setAttribute('content', content);
}

/**
 * Paint a scheme. Idempotent, and the same three writes the boot script makes -
 * keep them in step, `theme.test.ts` compares them.
 */
export function applyScheme(scheme: ColorScheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', scheme);
  setMeta('theme-color', SCHEME_CHROME[scheme].themeColor);
  setMeta('apple-mobile-web-app-status-bar-style', SCHEME_CHROME[scheme].statusBar);
}

type Listener = () => void;

let choice: ThemeChoice = typeof window === 'undefined' ? DEFAULT_CHOICE : readStoredChoice();
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener();
}

/**
 * A tiny external store, so the two rendered toggles (header on desktop, tab
 * bar on a phone) are one control with one state rather than two that drift
 * apart the moment the viewport crosses the breakpoint.
 */
export const themeStore = {
  getChoice: (): ThemeChoice => choice,

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  set(next: ThemeChoice): void {
    storeChoice(next);
    if (next !== choice) {
      choice = next;
      notify();
    }
    applyScheme(resolveScheme(next, systemPrefersLight()));
  },

  /** Re-read from disk, for the cross-tab `storage` listener. */
  refresh(): void {
    const next = readStoredChoice();
    if (next !== choice) {
      choice = next;
      notify();
    }
    applyScheme(resolveScheme(choice, systemPrefersLight()));
  },
};

/**
 * Keep the live page in step with the two things that can change under it: the
 * OS switching scheme while the reader is on `system`, and another tab picking
 * a different theme. Registered once at module load, next to the store it
 * drives, exactly as `store.ts` does for progress.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) themeStore.refresh();
  });

  if (typeof window.matchMedia === 'function') {
    const query = window.matchMedia(LIGHT_QUERY);
    const onSystemChange = () => {
      // Only `system` follows the OS; an explicit choice stays put.
      if (themeStore.getChoice() === 'system') themeStore.refresh();
    };
    // This runs during module evaluation, so an older WebView that exposes
    // `matchMedia` with only the pre-2020 `addListener` API would throw here
    // and take the whole app down with it - a blank screen, not a stale theme.
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', onSystemChange);
    } else {
      query.addListener(onSystemChange);
    }
  }
}
