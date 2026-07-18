import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, login } from './helpers'

test.describe('Logout', () => {
  let page: import('playwright').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('debe cerrar sesión correctamente', async () => {
    const logoutBtn = page.locator('button[aria-label="Cerrar sesión"]')
    await expect(logoutBtn).toBeVisible({ timeout: 5_000 })
    await logoutBtn.click()
    await page.waitForTimeout(2000)
    const loginForm = page.locator('input[type="email"]')
    await expect(loginForm).toBeVisible({ timeout: 10_000 })
  })
})
