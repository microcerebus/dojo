import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { request as playwrightRequest } from '@playwright/test';

/**
 * Primes the Vercel Deployment Protection bypass cookie once, outside any
 * test's trace recording, and never as a header on a traced page/context
 * request - see playwright.config.ts and .github/workflows/e2e.yml.
 *
 * globalSetup runs before any test (and before any trace starts recording),
 * using a bare APIRequestContext that Playwright never attaches to a trace.
 * VERCEL_AUTOMATION_BYPASS_SECRET is read from the environment here and
 * used exactly once, in this untraced request; only the resulting Vercel
 * session cookie - not the shared secret itself - is saved to storageState
 * and reused by test browser contexts. That keeps the actual secret out of
 * every recorded trace/report, which (being artifacts on a public repo)
 * would otherwise be world-readable.
 */
export const VERCEL_BYPASS_AUTH_FILE = 'e2e/.auth/vercel-bypass.json';

export default async function globalSetup() {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL;
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (!baseURL || !bypassSecret) return;

  const requestContext = await playwrightRequest.newContext();
  try {
    const response = await requestContext.get(`${baseURL}/?x-vercel-set-bypass-cookie=true`, {
      headers: { 'x-vercel-protection-bypass': bypassSecret },
    });
    if (!response.ok()) {
      throw new Error(
        `Failed to prime the Vercel protection bypass cookie: HTTP ${response.status()}`,
      );
    }
    mkdirSync(dirname(VERCEL_BYPASS_AUTH_FILE), { recursive: true });
    await requestContext.storageState({ path: VERCEL_BYPASS_AUTH_FILE });
  } finally {
    await requestContext.dispose();
  }
}
