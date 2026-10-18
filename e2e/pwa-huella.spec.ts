import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, login, navigateTo } from './helpers'

test.describe('PWA', () => {
  test('la app es instalable (sin installability errors)', async ({ browser }) => {
    const context = await browser.newContext({ ignoreHTTPSErrors: true })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30_000 }).catch(() => {})
    await page.waitForTimeout(3000)
    const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors' as never) as { installabilityErrors: string[] }
    expect(installabilityErrors).toEqual([])
    await context.close()
  })
})

test.describe('Huella digital', () => {
  test('activar huella en Configuración y entrar con ella', async ({ browser }) => {
    test.setTimeout(180_000)
    const context = await browser.newContext({ ignoreHTTPSErrors: true })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('WebAuthn.enable')
    await cdp.send('WebAuthn.addVirtualAuthenticator', {
      options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true },
    })

    // 1. Login con contraseña y activar huella en Configuración > Usuario
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
    await navigateTo(page, '/settings')
    await expect(page.locator('text=Huella digital').first()).toBeVisible({ timeout: 10_000 })
    await page.locator('input[placeholder="Tu contraseña"]').fill(DEMO_PASSWORD)
    await page.locator('button').filter({ hasText: 'Activar huella' }).click()
    await expect(page.locator('text=Huella digital activada')).toBeVisible({ timeout: 30_000 })

    // 2. Cerrar sesión
    await page.locator('button[aria-label="Cerrar sesión"]').click()
    await page.waitForTimeout(2500)

    // 3. Entrar con huella (el autenticador virtual tiene la credencial)
    const fpBtn = page.locator('text=Entrar con huella digital')
    await expect(fpBtn).toBeVisible({ timeout: 10_000 })
    await fpBtn.click()
    await expect(page.locator('button[aria-label="Menú"]')).toBeVisible({ timeout: 30_000 })

    // 4. La sesión funciona: la Agenda carga datos del usuario
    await navigateTo(page, '/agenda')
    await expect(page.locator('[data-testid="agenda-week"]')).toBeVisible({ timeout: 15_000 })
    await context.close()
  })
})
