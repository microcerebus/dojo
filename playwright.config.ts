import { defineConfig, devices } from '@playwright/test';

/**
 * e2e always runs against a production build served locally - `pnpm build`
 * then a static server on this port - never a deployed preview. This is a
 * deliberate architecture choice: dojo stays private behind Vercel SSO, so
 * there is no protected URL for CI to reach and no bypass credential to
 * manage or leak. Building locally also means CF-8 (PWA manifest/service
 * worker) is exercised for real on every run, not skipped.
 */
const BASE_URL = 'http://localhost:4173';

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
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  // Chromium only (desktop + one mobile emulation) so CI does not need to
  // install and run the WebKit/Firefox browser binaries too.
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm run build && pnpm run preview -- --port 4173 --strictPort',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
