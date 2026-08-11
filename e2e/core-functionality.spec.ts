import { expect, test } from '@playwright/test';

/**
 * Implements the flows enumerated in CORE-FUNCTIONALITY.md. Each test title
 * cites the CF id it covers - e2e/core-functionality.test.ts (a vitest test,
 * not a Playwright one) fails if any CF id in that file has no citing test
 * here.
 *
 * Always runs against a production build served locally, both for `pnpm e2e`
 * and in CI (see playwright.config.ts) - never a deployed preview, so there
 * is no protected URL to reach and no bypass credential to manage. Every
 * test gets a fresh browser context, so localStorage-backed progress starts
 * empty unless a test seeds it itself.
 *
 * CF-8 (installability) is intentionally not exercised end-to-end here -
 * actually installing a PWA is flaky under CI automation. Instead the CF-8
 * test below checks the two static artefacts installability depends on: the
 * web app manifest and the service worker script both being served.
 */

test('CF-1: curriculum home lists all modules with progress', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Curriculum', level: 1 })).toBeVisible();

  const cards = page.locator('a.modulecard');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);

  const startedStat = page.locator('.stat', { hasText: 'Modules started' });
  await expect(startedStat.locator('.stat__value')).toHaveText(new RegExp(`^0/${count}$`));
});

test('CF-2: complete module renders its lesson', async ({ page }) => {
  await page.goto('/');
  await page.locator('a.modulecard', { hasText: 'lesson ready' }).first().click();

  await expect(page.getByRole('tab', { name: 'Lesson' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.lesson__body h2')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next →' })).toBeVisible();
});

test('CF-2: outline module renders a concept list instead of a lesson', async ({ page }) => {
  await page.goto('/');
  const outlineCard = page.locator('a.modulecard', { hasText: 'content coming' });
  const count = await outlineCard.count();
  test.skip(count === 0, 'no module is currently in outline status on main');

  await outlineCard.first().click();
  await expect(page.getByText('still being written')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What this module covers' })).toBeVisible();
});

test('CF-3: quiz answers score and persist across reload', async ({ page }) => {
  await page.goto('/#/module/big-o');
  await page.getByRole('tab', { name: 'Quiz' }).click();

  // Correctness does not matter for this flow - only that answering through
  // to the end scores and shows a result.
  while (
    await page
      .locator('.quiz__option')
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await page.locator('.quiz__option').first().click();
    await page.getByRole('button', { name: /Next question|See result/ }).click();
  }
  await expect(page.locator('.quiz__score')).toBeVisible();
  const scoreText = await page.locator('.quiz__score').textContent();
  const fraction = scoreText?.match(/\d+\/\d+/)?.[0];
  expect(fraction).toBeTruthy();

  await page.reload();
  await page.getByRole('tab', { name: 'Quiz' }).click();
  await expect(page.locator('.quiz__best')).toContainText(fraction!);
});

test('CF-4: drill checkboxes persist across reload', async ({ page }) => {
  await page.goto('/#/module/big-o');
  await page.getByRole('tab', { name: 'Drills' }).click();

  const firstDrill = page.locator('.drill__check').first();
  await expect(firstDrill).toHaveAttribute('aria-checked', 'false');
  await firstDrill.click();
  await expect(firstDrill).toHaveAttribute('aria-checked', 'true');

  await page.reload();
  await page.getByRole('tab', { name: 'Drills' }).click();
  await expect(page.locator('.drill__check').first()).toHaveAttribute('aria-checked', 'true');
});

test('CF-5: audio recap plays with speed and skip controls', async ({ page }) => {
  await page.goto('/#/module/big-o');

  const playButton = page.locator('.bite__play').first();
  const rateButton = page.locator('.bite__rate').first();
  const skipForward = page.locator('.bite__skip').nth(1);

  const initialRate = await rateButton.textContent();
  await playButton.click();
  await expect(playButton).toHaveAttribute('aria-label', /Pause audio/, { timeout: 15000 });

  await expect(skipForward).toBeEnabled({ timeout: 15000 });
  await skipForward.click();

  await rateButton.click();
  await expect(rateButton).not.toHaveText(initialRate ?? '1x');
});

test('CF-6: sprint view maps modules to weeks', async ({ page }) => {
  await page.goto('/#/sprint');
  await expect(page.getByRole('heading', { name: 'Five-week sprint' })).toBeVisible();

  const weeks = page.locator('.weeks > li');
  await expect(weeks).toHaveCount(5);
  await expect(weeks.first().locator('.week__module').first()).toBeVisible();
});

test('CF-7: coverage page shows study progress, Blind 75, and the VisuAlgo catalog', async ({
  page,
}) => {
  await page.goto('/#/coverage');
  await expect(page.getByRole('heading', { name: 'Coverage map' })).toBeVisible();

  const totalCount = await page.locator('.qitem').count();
  expect(totalCount).toBeGreaterThan(0);
  // By role, not by placeholder: the placeholder is copy that has to fit a
  // 320px field, so keying the test to it makes every wording change a test
  // failure.
  await page.getByRole('searchbox', { name: /Filter questions/ }).fill('array');
  await expect(page.locator('.qitem')).not.toHaveCount(totalCount);

  await page.getByRole('tab', { name: /Blind 75/ }).click();
  await expect(page.locator('table tbody tr')).toHaveCount(75);

  await page.getByRole('tab', { name: /VisuAlgo/ }).click();
  const visualgoRows = page.locator('table tbody tr');
  const visualgoCount = await visualgoRows.count();
  expect(visualgoCount).toBeGreaterThan(0);
  await expect(visualgoRows.first().getByRole('link').first()).toHaveAttribute(
    'href',
    /visualgo\.net/,
  );
});

test('CF-8: pwa manifest and service worker are served', async ({ page, baseURL }) => {
  const manifestResponse = await page.request.get(new URL('manifest.webmanifest', baseURL).href);
  expect(manifestResponse.ok()).toBeTruthy();

  const manifest = await manifestResponse.json();
  expect(manifest.name).toContain('dojo');
  expect(Array.isArray(manifest.icons) && manifest.icons.length).toBeGreaterThan(0);

  const swResponse = await page.request.get(new URL('sw.js', baseURL).href);
  expect(swResponse.ok()).toBeTruthy();
});

test('CF-9: navigation between top-level sections, module tabs, and sections', async ({
  page,
}, testInfo) => {
  // Below 860px the header nav is `display: none` and the bottom tabbar is
  // the real nav (see src/styles/global.css) - pick whichever is visible for
  // this project's viewport rather than assuming the desktop one.
  const nav = testInfo.project.name.startsWith('Mobile')
    ? page.locator('.tabbar')
    : page.locator('.header__nav');

  await page.goto('/');

  await nav.getByRole('link', { name: 'Sprint' }).click();
  await expect(page).toHaveURL(/#\/sprint$/);
  await nav.getByRole('link', { name: 'Coverage' }).click();
  await expect(page).toHaveURL(/#\/coverage$/);
  await nav.getByRole('link', { name: 'Curriculum' }).click();
  await expect(page).toHaveURL(/#\/$/);

  await page.goto('/#/module/big-o');
  await page.getByRole('tab', { name: 'Drills' }).click();
  await expect(page.getByRole('tab', { name: 'Drills' })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Lesson' }).click();

  const sectionHeading = page.locator('.lesson__body h2');
  const firstTitle = await sectionHeading.textContent();
  await page.locator('.lesson__body').click();
  await page.keyboard.press('ArrowRight');
  await expect(sectionHeading).not.toHaveText(firstTitle ?? '');

  await page.goto('/#/not-a-real-route');
  await expect(page.getByText(/not found|404/i)).toBeVisible();
});

test('CF-10: progress persists locally and merges across concurrent writes', async ({
  context,
}) => {
  const pageA = await context.newPage();
  const pageB = await context.newPage();

  await pageA.goto('/#/module/big-o');
  await pageA.getByRole('tab', { name: 'Drills' }).click();
  await pageB.goto('/#/module/big-o');
  await pageB.getByRole('tab', { name: 'Drills' }).click();

  await pageA.locator('.drill__check').nth(0).click();
  await pageB.locator('.drill__check').nth(1).click();

  await pageA.reload();
  await pageA.getByRole('tab', { name: 'Drills' }).click();
  await expect(pageA.locator('.drill__check').nth(0)).toHaveAttribute('aria-checked', 'true');
  await expect(pageA.locator('.drill__check').nth(1)).toHaveAttribute('aria-checked', 'true');
});

test('CF-11: audio playback speed persists across section navigation', async ({ page }) => {
  await page.goto('/#/module/big-o');

  const rateButton = page.locator('.bite__rate').first();
  const playButton = page.locator('.bite__play').first();

  // The rate cycles 1 -> 1.25 -> 1.5 -> 2 -> 1 and defaults to 2x on a fresh
  // context - click until it reads 2x rather than assuming a start point.
  for (let i = 0; i < 4 && (await rateButton.textContent()) !== '2x'; i++) {
    await rateButton.click();
  }
  await expect(rateButton).toHaveText('2x');

  await playButton.click();
  await expect(playButton).toHaveAttribute('aria-label', /Pause audio/, { timeout: 15000 });
  await expect
    .poll(() =>
      page
        .locator('audio')
        .first()
        .evaluate((el: HTMLMediaElement) => el.playbackRate),
    )
    .toBe(2);

  // Move to the next section - the audio element is reused, not remounted.
  await page.locator('.lesson__body').click();
  await page.keyboard.press('ArrowRight');
  await expect(rateButton).toHaveText('2x');

  await playButton.click();
  await expect(playButton).toHaveAttribute('aria-label', /Pause audio/, { timeout: 15000 });
  await expect
    .poll(() =>
      page
        .locator('audio')
        .first()
        .evaluate((el: HTMLMediaElement) => el.playbackRate),
    )
    .toBe(2);
});

test('CF-12: a module with visualizers shows a live VisuAlgo row', async ({ page }) => {
  await page.goto('/#/module/arrays-strings');
  const vizRow = page.locator('.vizrow');
  await expect(vizRow).toBeVisible();
  await expect(vizRow.getByText('Visualize it live')).toBeVisible();
  const firstLink = vizRow.locator('.vizrow__link').first();
  await expect(firstLink).toHaveAttribute('href', /visualgo\.net/);
  await expect(firstLink).toHaveAttribute('target', '_blank');
});

test('CF-12: a module without visualizers shows no VisuAlgo row', async ({ page }) => {
  await page.goto('/#/module/big-o');
  await expect(page.locator('.vizrow')).toHaveCount(0);
});
