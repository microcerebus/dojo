import { useSyncExternalStore } from 'react';
import { THEME_ICONS, THEME_LABELS, nextThemeChoice, themeStore } from '../lib/theme';

/**
 * The system/dark/light control.
 *
 * One button that cycles, not three radios: it is a three-state preference
 * that changes rarely, and on a phone a segmented control would eat a third of
 * the tab bar to save one tap. The current state is always spelled out in the
 * label rather than implied by the icon, because a cycling control whose icon
 * could mean either "you are here" or "tap for this" is the classic way to get
 * a theme switch backwards.
 *
 * Rendered twice - in the header for desktop and in the tab bar for a phone,
 * the same way the nav links are - and hidden with `display: none` at the
 * other breakpoint, so exactly one is ever in the accessibility tree. Both
 * read the same store, so they cannot disagree across a resize.
 */
export function ThemeToggle({ variant }: { variant: 'header' | 'tabbar' }) {
  const choice = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getChoice,
    themeStore.getChoice,
  );
  const next = nextThemeChoice(choice);

  return (
    <button
      type="button"
      className={`themetoggle themetoggle--${variant}`}
      data-theme-choice={choice}
      aria-label={`Theme: ${THEME_LABELS[choice]}. Tap for ${THEME_LABELS[next]}.`}
      onClick={() => themeStore.set(next)}
    >
      <span className="themetoggle__icon" aria-hidden="true">
        {THEME_ICONS[choice]}
      </span>
      <span className="themetoggle__label">{THEME_LABELS[choice]}</span>
    </button>
  );
}
