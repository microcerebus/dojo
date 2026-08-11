import { defineConfig, devices } from '@playwright/test';

/**
 * Set by CI to point at a Vercel preview deployment. Locally, `pnpm e2e` runs
 * with no base URL and Playwright boots its own dev server instead (see
 * `webServer` below) - `pnpm run preview` is deliberately not used for that,
 * since the service worker it serves caches the previous build (see
 * AGENTS.md's "vite preview is served through the service worker" note).
 */
const PREVIEW_URL = process.env.PLAYWRIGHT_BASE_URL;
const DEV_URL = 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  // Only *.spec.ts are Playwright tests; e2e/*.test.ts is the vitest-run
  // check that every CORE-FUNCTIONALITY.md id is cited by a spec below.
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: PREVIEW_URL ?? DEV_URL,
    trace: 'on-first-retry',
  },
  // Chromium only (desktop + one mobile emulation) so CI does not need to
  // install and run the WebKit/Firefox browser binaries too.
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: PREVIEW_URL
    ? undefined
    : {
        command: 'pnpm run dev',
        url: DEV_URL,
        reuseExistingServer: !process.env.CI,
      },
});
