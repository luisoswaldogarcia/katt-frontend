import { test } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, uniq, login, navigateTo, setInputByName, clickFab } from './helpers'

test.describe('Agenda', () => {
  let page: import('playwright').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('CREATE — debe crear una cita', async () => {
    await navigateTo(page, '/agenda')
    await page.waitForTimeout(1000)
    const fab = page.locator('button[aria-label="Nueva cita"]')
    if (await fab.count() > 0) {
      await fab.click()
    } else {
      await clickFab(page)
    }
    await page.waitForTimeout(800)
    await setInputByName(page, 'fecha', '2026-12-25')
    await setInputByName(page, 'hora', '10:00')
    await setInputByName(page, 'motivo', `Cita E2E ${uniq('cita')}`)
    const guardarBtn = page.locator('button[type="submit"]').filter({ hasText: 'Guardar' })
    if (await guardarBtn.count() > 0) {
      await guardarBtn.click()
    } else {
      await page.locator('button').filter({ hasText: 'Guardar' }).first().click()
    }
    await page.waitForTimeout(2000)
  })
})
