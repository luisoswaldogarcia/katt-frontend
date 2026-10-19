import { test, expect, type Page } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, login } from './helpers'

test.describe('Configuración', () => {
  let page: Page
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })
  test.afterAll(async () => { await page?.close() })

  test('la opción de Marca ya no existe en Operativo', async () => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Operativo', exact: true }).click()
    await expect(page.getByText('Nombres de módulos')).toBeVisible()
    await expect(page.getByText('Marca', { exact: true })).toHaveCount(0)
    await expect(page.getByPlaceholder('Nombre de la app')).toHaveCount(0)
  })
})
