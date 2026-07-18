import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD } from './helpers'

test.describe('Login', () => {
  let page: import('playwright').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('debe iniciar sesión con credenciales demo', async () => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30_000 }).catch(() => {})
    await page.waitForTimeout(2000)

    const emailInput = page.locator('input[type="email"]')
    await emailInput.waitFor({ state: 'visible', timeout: 15_000 })
    await emailInput.fill(DEMO_EMAIL)

    const passInput = page.locator('input[type="password"]')
    await passInput.fill(DEMO_PASSWORD)

    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(3000)

    const body = page.locator('body')
    await expect(body).toContainText('Inicio', { timeout: 10_000 })
    await expect(body).toContainText('Citas de hoy', { timeout: 5_000 })
  })
})
