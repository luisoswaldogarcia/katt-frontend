import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, login, navigateTo } from './helpers'

test.describe('Navegación', () => {
  let page: import('playwright').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('sidebar debe mostrar módulos principales', async () => {
    const menuBtn = page.locator('button[aria-label="Menú"]')
    await menuBtn.waitFor({ state: 'visible', timeout: 5_000 })
    await menuBtn.click()
    await page.waitForTimeout(500)
    const nav = page.locator('nav')
    await expect(nav).toContainText('Inicio', { timeout: 5_000 })
    await expect(nav).toContainText('Configuración', { timeout: 3_000 })
  })

  test('debe navegar a módulo Clientes', async () => {
    await navigateTo(page, '/paciente')
    await expect(page.locator('body')).toContainText('Nombre', { timeout: 5_000 })
  })

  test('debe navegar a módulo Inventario', async () => {
    await navigateTo(page, '/inventario')
    await expect(page.locator('body')).toContainText('Categoría', { timeout: 5_000 })
  })

  test('debe navegar a Inicio', async () => {
    await navigateTo(page, '/')
    await expect(page.locator('body')).toContainText('Citas de hoy', { timeout: 5_000 })
  })
})
