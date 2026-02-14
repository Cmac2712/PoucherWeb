import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Tell the E2E auth provider to start unauthenticated
    await page.addInitScript(() => {
      window.localStorage.setItem('e2e_start_unauthed', 'true')
    })
  })

  test('shows the login form when not authenticated', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Welcome Back')).toBeVisible()
    await expect(
      page.getByText('Sign in to access your bookmarks')
    ).toBeVisible()
    await expect(page.getByPlaceholder('email@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('Enter password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('login transitions to the authenticated view', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Welcome Back')).toBeVisible()

    await page.getByPlaceholder('email@example.com').fill('tim@testemail.com')
    await page.getByPlaceholder('Enter password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()

    // E2E auth provider accepts any credentials
    await expect(page.getByText('Poucher.io')).toBeVisible({ timeout: 5_000 })
    await expect(
      page.getByPlaceholder('Search bookmarks...')
    ).toBeVisible()
  })
})
