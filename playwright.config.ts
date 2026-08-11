import { defineConfig, devices } from '@playwright/test';
import { VERCEL_BYPASS_AUTH_FILE } from './e2e/global-setup';

/**
 * Set by CI to point at a Vercel preview deployment. Locally, `pnpm e2e` runs
 * with no base URL and Playwright boots its own dev server instead (see
 * `webServer` below) - `pnpm run preview` is deliberately not used for that,
 * since the service worker it serves caches the previous build (see
 * AGENTS.md's "vite preview is served through the service worker" note).
 */
const PREVIEW_URL = process.env.PLAYWRIGHT_BASE_URL;
const DEV_URL = 'http://localhost:5173';

/**
 * Vercel "Deployment Protection" (Vercel Authentication / SSO) gates every
 * preview URL behind a login by default, which 401s CI's plain requests.
 * The fix is Vercel's "Protection Bypass for Automation" secret
 * (VERCEL_AUTOMATION_BYPASS_SECRET). It is NOT sent as a header here - every
 * request `use` makes is subject to trace recording (`trace` below), and
 * artifacts on this public repo are world-readable, so a header set here
 * would put the secret in every uploaded trace/report. Instead
 * e2e/global-setup.ts spends the secret exactly once, in an untraced
 * request outside any test, and saves only the resulting Vercel session
 * cookie to VERCEL_BYPASS_AUTH_FILE for test contexts to load as
 * `storageState` - see that file for the full explanation.
 */
const usingVercelBypass = Boolean(PREVIEW_URL && process.env.VERCEL_AUTOMATION_BYPASS_SECRET);

export default defineConfig({
  testDir: './e2e',
  // Only *.spec.ts are Playwright tests; e2e/*.test.ts is the vitest-run
  // check that every CORE-FUNCTIONALITY.md id is cited by a spec below.
  testMatch: '**/*.spec.ts',
  globalSetup: usingVercelBypass ? './e2e/global-setup.ts' : undefined,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: PREVIEW_URL ?? DEV_URL,
    trace: 'on-first-retry',
    ...(usingVercelBypass ? { storageState: VERCEL_BYPASS_AUTH_FILE } : {}),
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
