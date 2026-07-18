import { test } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, uniq, login, navigateTo, setInputValue, clickFab } from './helpers'

test.describe('Tareas', () => {
  let page: import('playwright').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('CREATE — debe crear una tarea', async () => {
    await navigateTo(page, '/tareas')
    await page.waitForTimeout(1500)
    const fab = page.locator('button[aria-label="Nueva tarea"]')
    if (await fab.count() > 0) {
      await fab.click()
    } else {
      await clickFab(page)
    }
    await page.waitForTimeout(800)
    const tipoSelect = page.locator('select[name="tipo"]')
    if (await tipoSelect.count() > 0) {
      await tipoSelect.selectOption({ index: 1 }).catch(() => {})
      await page.waitForTimeout(200)
    }
    await setInputValue(page, 'Título', `Tarea E2E ${uniq('tarea')}`)
    await page.locator('button[type="submit"]').filter({ hasText: /Crear/i }).click()
    await page.waitForTimeout(3000)
  })
})
