import { test, expect, type Page } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, login } from './helpers'

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

    // La vista previa renderiza las variables
    await expect(page.getByTestId('whatsapp-preview')).toContainText('Rosa Robles')
    await expect(page.getByTestId('whatsapp-preview')).toContainText('Dr. Pacheco')

    // Editar la plantilla actualiza la vista previa
    await page.getByTestId('whatsapp-plantilla').fill('Recordatorio para {paciente}: tu cita es el {fecha}.')
    await expect(page.getByTestId('whatsapp-preview')).toContainText('Recordatorio para Rosa Robles: tu cita es el 21 de octubre.')

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
    await expect(page.getByTestId('whatsapp-plantilla')).toHaveValue('Recordatorio para {paciente}: tu cita es el {fecha}.')
  })

  test('el botón de prueba valida el teléfono', async () => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'WhatsApp', exact: true }).click()
    await expect(page.getByTestId('whatsapp-card')).toBeVisible()
    // sin teléfono el botón está deshabilitado
    await expect(page.getByTestId('whatsapp-probar')).toBeDisabled()
  })
})
