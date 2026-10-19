import { test, expect, type Page } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, login } from './helpers'

test.describe('Configuración', () => {
  let page: Page
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })
  test.afterAll(async () => { await page?.close() })

  test('admin de ubicaciones: alta, persistencia y baja', async () => {
    const nombre = `Consultorio Test ${ts}`
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Operativo', exact: true }).click()
    await expect(page.getByTestId('ubicaciones-card')).toBeVisible()
    await page.getByTestId('ubicacion-nueva').fill(nombre)
    await page.getByTestId('ubicacion-agregar').click()
    await expect(page.getByText('Guardado ✓')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('ubicaciones-card')).toContainText(nombre)

    // persiste al recargar
    await page.reload()
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: 'Operativo', exact: true }).click()
    await expect(page.getByTestId('ubicaciones-card')).toContainText(nombre)

    // baja
    await page.getByTestId('ubicaciones-card').locator('div').filter({ hasText: nombre }).getByRole('button', { name: 'Quitar' }).click()
    await expect(page.getByTestId('ubicaciones-card')).not.toContainText(nombre, { timeout: 10_000 })
  })

  test('la opción de Marca ya no existe en Operativo', async () => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Operativo', exact: true }).click()
    await expect(page.getByText('Nombres de módulos')).toBeVisible()
    await expect(page.getByText('Marca', { exact: true })).toHaveCount(0)
    await expect(page.getByPlaceholder('Nombre de la app')).toHaveCount(0)
  })
})
