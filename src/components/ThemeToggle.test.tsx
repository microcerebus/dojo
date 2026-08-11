import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { DEFAULT_CHOICE, THEME_STORAGE_KEY, themeStore } from '../lib/theme';

beforeEach(() => {
  localStorage.clear();
  themeStore.set(DEFAULT_CHOICE);
});

describe('ThemeToggle', () => {
  it('cycles system -> dark -> light -> system, persisting each step', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle variant="tabbar" />);
    const button = screen.getByRole('button');

    expect(button).toHaveTextContent('System');

    await user.click(button);
    expect(button).toHaveTextContent('Dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    await user.click(button);
    expect(button).toHaveTextContent('Light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    await user.click(button);
    expect(button).toHaveTextContent('System');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
  });

  it('names the current state and the next one, so a cycling icon is never ambiguous', () => {
    render(<ThemeToggle variant="header" />);
    expect(screen.getByRole('button')).toHaveAccessibleName('Theme: System. Tap for Dark.');
  });

  it('keeps both rendered instances in step - they are one control, not two', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ThemeToggle variant="header" />
        <ThemeToggle variant="tabbar" />
      </>,
    );
    const [header, tabbar] = screen.getAllByRole('button');

    await user.click(header);
    expect(header).toHaveTextContent('Dark');
    expect(tabbar).toHaveTextContent('Dark');
  });

  it('exposes the choice for styling and end-to-end assertions', () => {
    render(<ThemeToggle variant="tabbar" />);
    expect(screen.getByRole('button')).toHaveAttribute('data-theme-choice', 'system');
  });
});
