import { test, expect } from '../fixtures/auth'

test.describe('Bookmarks', () => {
  test('can create a new bookmark', async ({ authenticatedPage: page }) => {
    await page.getByText('Add Bookmark').click()

    const urlInput = page.getByPlaceholder('https://...')
    await expect(urlInput).toBeVisible()

    await urlInput.fill('https://playwright.dev')
    await page.locator('header').getByRole('button', { name: 'Add' }).click()

    // MSW creates the bookmark — title defaults to the URL
    await expect(page.getByText('https://playwright.dev')).toBeVisible({
      timeout: 5_000,
    })
  })
})
