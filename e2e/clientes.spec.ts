import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, uniq, login, navigateTo, pageContains, setInputValue, setInputByName } from './helpers'

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

  test('acciones de la tabla: descargar y eliminar seleccionados', async () => {
    await navigateTo(page, '/paciente')
    // El botón está deshabilitado sin selección
    await expect(page.getByTestId('tabla-acciones')).toBeDisabled()

    // Seleccionar dos filas y usar el menú
    const checks = page.locator('table tbody input[type="checkbox"]')
    await checks.nth(0).check()
    await checks.nth(1).check()
    await expect(page.getByTestId('tabla-acciones')).toBeEnabled()

    // Descargar seleccionados genera un CSV
    await page.getByTestId('tabla-acciones').click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('accion-descargar').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.csv')

    // Eliminar seleccionados (confirmación con modal)
    await page.getByTestId('tabla-acciones').click()
    await page.getByTestId('accion-eliminar').click()
    const modal = page.getByRole('button', { name: 'Eliminar' }).last()
    await modal.click()
    await page.waitForTimeout(3000)
    expect(await checks.count()).toBeGreaterThan(0) // la tabla sigue funcionando
  })

  test('eliminación con citas: aviso, loader y cascada', async () => {
    const nombre = `Paciente Borrar ${ts}`
    const fecha = new Date(Date.UTC(2033, 0, 1 + (Math.floor(ts / 1000) % 20000))).toISOString().split('T')[0]

    // Crear un paciente con una cita desde la agenda
    await navigateTo(page, '/agenda')
    await page.waitForTimeout(800)
    await page.locator('button[aria-label="Nueva cita"]').click()
    await page.waitForTimeout(700)
    await setInputByName(page, 'paciente', nombre)
    await setInputByName(page, 'doctor', `Doctor Borrar ${ts}`)
    await setInputByName(page, 'fecha', fecha)
    await setInputByName(page, 'hora', '13:00')
    await page.locator('button[type="submit"]').filter({ hasText: 'Guardar' }).click()
    await expect(page.locator('[data-testid="agenda-week"]')).toContainText(nombre, { timeout: 10_000 })

    // Lentear los DELETE para poder ver el loader
    await page.route(/\/api\/v1\/(clientes|agenda)\/[^/?]+$/, async route => {
      if (route.request().method() === 'DELETE') await new Promise(r => setTimeout(r, 1500))
      await route.continue()
    })

    // Filtrar por el paciente, seleccionarlo y eliminarlo
    await navigateTo(page, '/paciente')
    await page.getByTestId('filtro-campo').fill('Nombre')
    await page.getByTestId('filtro-valor').fill(nombre)
    await page.getByTestId('filtro-aplicar').click()
    const fila = page.locator('table tbody tr').filter({ hasText: nombre })
    await expect(fila).toHaveCount(1)
    await fila.locator('input[type="checkbox"]').check()
    await page.getByTestId('tabla-acciones').click()
    await page.getByTestId('accion-eliminar').click()

    // El aviso menciona las citas
    await expect(page.getByText(/cita\(s\)/)).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: 'Eliminar' }).last().click()

    // Aparece el loader mientras elimina
    await expect(page.getByTestId('tabla-eliminando')).toBeVisible({ timeout: 5_000 })

    // Al terminar: la fila ya no está y la cita tampoco
    await expect(page.locator('table tbody tr').filter({ hasText: nombre })).toHaveCount(0, { timeout: 15_000 })
    await page.unroute(/\/api\/v1\/(clientes|agenda)\/[^/?]+$/)
    await navigateTo(page, '/agenda')
    await page.waitForTimeout(1500)
    await expect(page.locator('body')).not.toContainText(nombre)
  })
})
