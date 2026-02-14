import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('app loads and renders the authenticated view', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Poucher.io')).toBeVisible({ timeout: 10_000 })
    await expect(
      page.getByPlaceholder('Search bookmarks...')
    ).toBeVisible()
    await expect(page.getByText('Add Bookmark')).toBeVisible()
  })

  test('bookmarks from MSW mock data are displayed', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Poucher.io')).toBeVisible({ timeout: 10_000 })

    await expect(page.getByRole('link', { name: 'Boundary' })).toBeVisible()
  })

  test('sidebar shows tags from mock data', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await expect(page.getByText('Poucher.io')).toBeVisible({ timeout: 10_000 })

    const sidebar = page.getByTestId('tags-container')
    await expect(sidebar.getByText('career')).toBeVisible()
    await expect(sidebar.getByText('AI')).toBeVisible()
    await expect(sidebar.getByText('CSS')).toBeVisible()
  })
})
