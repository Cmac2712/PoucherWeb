import { test as base, expect, type Page } from '@playwright/test'

// Extends Playwright's base test with a pre-authenticated page fixture.
// The E2E auth provider auto-authenticates on load, so this fixture
// just navigates and waits for the main UI to stabilize.
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/')
    await expect(page.getByText('Poucher.io')).toBeVisible({ timeout: 10_000 })
    await page.waitForLoadState('networkidle')
    await use(page)
  },
})

export { expect }
