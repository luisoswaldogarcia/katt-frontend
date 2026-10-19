import { test, expect, type Page } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, login } from './helpers'

test.describe('WhatsApp — recordatorios', () => {
  let page: Page
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })
  test.afterAll(async () => { await page?.close() })

  test('configura la plantilla y guarda la configuración', async () => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'WhatsApp', exact: true }).click()
    await expect(page.getByTestId('whatsapp-card')).toBeVisible()

    // Editar la plantilla actualiza la vista previa (datos únicos por corrida)
    const plantilla = `Recordatorio ${ts} para {paciente}: tu cita es el {fecha}.`
    await page.getByTestId('whatsapp-plantilla').fill(plantilla)
    await expect(page.getByTestId('whatsapp-preview')).toContainText(`Recordatorio ${ts} para Rosa Robles: tu cita es el 21 de octubre.`)

    // Conexión + horario
    await page.getByTestId('whatsapp-card').locator('input[type="checkbox"]').check()
    await page.getByTestId('whatsapp-phone-id').fill('phone-id-demo')
    await page.getByTestId('whatsapp-token').fill('token-demo')
    await page.getByTestId('whatsapp-dias').fill('2')
    await page.getByTestId('whatsapp-desde').fill('9')
    await page.getByTestId('whatsapp-hasta').fill('19')

    await page.getByTestId('whatsapp-guardar').click()
    await expect(page.getByText('Configuración guardada ✓')).toBeVisible({ timeout: 10_000 })

    // Persiste al recargar
    await page.reload()
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: 'WhatsApp', exact: true }).click()
    await expect(page.getByTestId('whatsapp-phone-id')).toHaveValue('phone-id-demo')
    await expect(page.getByTestId('whatsapp-dias')).toHaveValue('2')
    await expect(page.getByTestId('whatsapp-plantilla')).toHaveValue(plantilla)

    // Limpieza: la configuración de prueba deja los recordatorios desactivados
    await page.getByTestId('whatsapp-card').locator('input[type="checkbox"]').uncheck()
    await page.getByTestId('whatsapp-guardar').click()
    await expect(page.getByText('Configuración guardada ✓')).toBeVisible({ timeout: 10_000 })
  })

  test('cada usuario conecta su propio número', async () => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'WhatsApp', exact: true }).click()
    const mia = page.getByTestId('whatsapp-mi-cuenta')
    await expect(mia).toBeVisible()

    await mia.locator('input[type="checkbox"]').check()
    await page.getByTestId('mia-phone-id').fill(`pn-mio-${ts}`)
    await page.getByTestId('mia-token').fill('token-mio-demo')
    await page.getByTestId('mia-guardar').click()
    await expect(page.getByText('Tu número quedó conectado ✓')).toBeVisible({ timeout: 10_000 })

    // persiste al recargar y el token queda guardado (sin reescribirlo)
    await page.reload()
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: 'WhatsApp', exact: true }).click()
    await expect(page.getByTestId('mia-phone-id')).toHaveValue(`pn-mio-${ts}`)
    await expect(mia).toContainText('guardado')
  })

  test('el botón de prueba valida el teléfono', async () => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'WhatsApp', exact: true }).click()
    await expect(page.getByTestId('whatsapp-card')).toBeVisible()
    // sin teléfono el botón está deshabilitado
    await expect(page.getByTestId('whatsapp-probar')).toBeDisabled()
  })
})
