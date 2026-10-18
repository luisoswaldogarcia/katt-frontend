import { test, expect } from 'playwright/test'
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

  test('vista semanal vertical — Lunes arriba y scroll infinito', async () => {
    await navigateTo(page, '/agenda')
    const week = page.locator('[data-testid="agenda-week"]')
    await expect(week).toBeVisible({ timeout: 8_000 })
    const days = week.locator('[data-testid="agenda-day"]')

    // La semana arranca en Lunes y los días bajan en orden
    await expect(days).toHaveCount(7)
    expect((await days.first().innerText()).toLowerCase()).toContain('lunes')
    expect((await days.nth(1).innerText()).toLowerCase()).toContain('martes')
    expect((await days.nth(6).innerText()).toLowerCase()).toContain('domingo')

    // Scroll infinito hacia abajo: se cargan los días siguientes
    for (let i = 0; i < 6; i++) {
      await week.evaluate(el => { el.scrollTop = el.scrollHeight })
      await page.waitForTimeout(250)
    }
    expect(await days.count()).toBeGreaterThan(14)

    // Scroll infinito hacia arriba: se cargan días anteriores
    for (let i = 0; i < 8; i++) {
      await week.evaluate(el => { el.scrollTop = 0 })
      await page.waitForTimeout(250)
    }
    expect(await days.count()).toBeGreaterThan(21)
  })
})
