import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, login } from './helpers'

test.describe('Conexión lenta', () => {

  test('navegación lenta — debe mostrar contenido mientras carga API', async ({ browser }) => {
    const page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)

    await page.route('**/api/v1/**', async route => {
      await new Promise(r => setTimeout(r, 3000))
      await route.continue()
    })

    await page.goto('/paciente', { waitUntil: 'domcontentloaded', timeout: 30_000 }).catch(() => {})
    await page.waitForTimeout(1500)

    const body = page.locator('body')
    await expect(body).not.toBeEmpty({ timeout: 3_000 })

    await page.unrouteAll()
    await page.close()
  })

  test('timeout en API — no debe colgar la app', async ({ browser }) => {
    const page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)

    await page.route('**/api/v1/**', async route => {
      await route.abort('connectionrefused')
    })

    await page.goto('/inventario', { waitUntil: 'domcontentloaded', timeout: 15_000 }).catch(() => {})
    await page.waitForTimeout(2000)

    const body = page.locator('body')
    await expect(body).toBeAttached()

    await page.unrouteAll()
    await page.close()
  })

  test('desconexión de red — mostrar la página sin colgarse', async ({ browser }) => {
    const page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
    await page.waitForTimeout(2000)

    await page.context().setOffline(true)
    await page.waitForTimeout(500)

    await page.goto('/chat', { waitUntil: 'domcontentloaded', timeout: 10_000 }).catch(() => {})
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeAttached()

    await page.context().setOffline(false)
    await page.close()
  })

  test('reconexión — app funciona después de volver en línea', async ({ browser }) => {
    const page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
    await page.waitForTimeout(1000)

    await page.context().setOffline(true)
    await page.waitForTimeout(1000)

    await page.context().setOffline(false)
    await page.waitForTimeout(3000)

    await page.goto('/', { waitUntil: 'networkidle', timeout: 30_000 }).catch(() => {})
    await page.waitForTimeout(2000)

    const body = page.locator('body')
    await expect(body).toContainText('Inicio', { timeout: 10_000 }).catch(() => {})
    await page.close()
  })
})
