import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, uniq, login, navigateTo, setInputValue } from './helpers'

test.describe('Pacientes — sin acceso a la aplicación', () => {
  let page: import('playwright').Page
  const pacName = `PacSinAcceso_${uniq('pac')}`

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('el alta de pacientes ya no ofrece acceso ni QR', async () => {
    await navigateTo(page, '/paciente/alta')
    await page.waitForTimeout(1000)

    // Sin checkbox de acceso/QR
    await expect(page.locator('text=Generar código QR')).toHaveCount(0)
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(0)
  })

  test('crear paciente funciona sin QR (solo registro)', async () => {
    await navigateTo(page, '/paciente/alta')
    await page.waitForTimeout(800)
    await setInputValue(page, 'Nombre', pacName)
    await setInputValue(page, 'Doctor', `Doc ${uniq('doc')}`)
    await setInputValue(page, 'Teléfono', '5551234567')
    await setInputValue(page, 'Email', `pacinacceso${ts}@test.com`)
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(2500)

    // Sin modal de QR y con el paciente en la lista
    await expect(page.locator('img[alt="QR de activación"]')).toHaveCount(0)
    await navigateTo(page, '/paciente')
    await page.waitForTimeout(1500)
    // La tabla pagina: se filtra por nombre para ubicarlo
    await page.getByTestId('filtro-campo').fill('Nombre')
    await page.getByTestId('filtro-valor').fill(pacName)
    await page.getByTestId('filtro-aplicar').click()
    await expect(page.locator('table tbody tr').filter({ hasText: pacName })).toHaveCount(1)
  })
})
