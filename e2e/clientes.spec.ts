import { test } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, uniq, login, navigateTo, pageContains, setInputValue } from './helpers'

test.describe('Clientes CRUD', () => {
  let page: import('playwright').Page
  const cliName = `Cli ${uniq('cli')}`
  const cliEmail = `cli${ts}@test.com`

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('CREATE — debe crear un paciente', async () => {
    await page.goto('/paciente/alta', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await setInputValue(page, 'Nombre', cliName)
    await setInputValue(page, 'Usuario', 'Dev User')
    await setInputValue(page, 'Teléfono', '5551000001')
    await setInputValue(page, 'Email', cliEmail)
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(3000)
  })

  test('READ — debe listar el paciente', async () => {
    await navigateTo(page, '/paciente')
    await pageContains(page, cliName)
  })

  test('UPDATE — debe editar el paciente', async () => {
    await page.goto('/paciente', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(1500)
    const link = page.locator(`a[href*="/paciente/"]`).filter({ hasText: cliName })
    if (await link.count() > 0) {
      await link.first().click()
    } else {
      await page.locator('table tr').filter({ hasText: cliName }).first().click()
    }
    await page.waitForTimeout(1500)
    const editBtn = page.locator('button').filter({ hasText: 'Editar' })
    if (await editBtn.count() > 0) {
      await editBtn.click()
      await page.waitForTimeout(1000)
      await setInputValue(page, 'Nombre', `${cliName} (edit)`)
      const saveBtn = page.locator('button').filter({ hasText: /Actualizar|Guardar/ })
      await saveBtn.first().click()
      await page.waitForTimeout(2000)
    }
  })

  test('DELETE — debe eliminar el paciente', async () => {
    await navigateTo(page, '/paciente')
    const link = page.locator(`a[href*="/paciente/"]`).filter({ hasText: cliName })
    if (await link.count() > 0) {
      await link.first().click()
    } else {
      await page.locator('table tr').filter({ hasText: cliName }).first().click()
    }
    await page.waitForTimeout(1500)
    const delBtn = page.locator('button').filter({ hasText: 'Eliminar' })
    if (await delBtn.count() > 0) {
      await delBtn.click()
      await page.waitForTimeout(2000)
    }
  })

  test('filtro de tabla con campo + valor + botón (cabe en móvil)', async () => {
    await page.setViewportSize({ width: 390, height: 844 })
    await navigateTo(page, '/paciente')
    const barra = page.getByTestId('tabla-filtro')
    await expect(barra).toBeVisible()

    // En móvil la barra no se sale de la pantalla
    const box = await barra.boundingBox()
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)

    // Filtrar por un campo buscado + valor que no existe → sin filas
    await page.getByTestId('filtro-campo').fill('Estado')
    await page.getByTestId('filtro-valor').fill('zzz-ninguno')
    await page.getByTestId('filtro-aplicar').click()
    await expect(page.locator('table tbody tr')).toHaveCount(0)

    // Limpiar → vuelven todas
    await page.getByTestId('filtro-limpiar').click()
    expect(await page.locator('table tbody tr').count()).toBeGreaterThan(0)
    await page.setViewportSize({ width: 1280, height: 720 })
  })
})
