import { test, expect, type Page } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, login } from './helpers'

test.describe('WhatsApp — recordatorios', () => {
  let page: Page
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })
  test.afterAll(async () => { await page?.close() })

  async function abrirWhatsApp() {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'WhatsApp', exact: true }).click()
    await expect(page.getByTestId('whatsapp-card')).toBeVisible()
  }

  const toggle = () => page.getByTestId('whatsapp-master-toggle')
  // Estado deseado sin importar cómo arranque (la config persiste entre corridas)
  async function master(on: boolean) {
    const actual = await toggle().getAttribute('aria-checked')
    if (actual !== String(on)) await toggle().click()
    await expect(toggle()).toHaveAttribute('aria-checked', String(on))
  }

  test('un solo interruptor: configura mensajes, cuándo y conexión', async () => {
    await abrirWhatsApp()

    // Único interruptor de la pestaña
    await master(true)

    // Mensaje al paciente con vista previa (datos únicos por corrida)
    const plantilla = `Recordatorio ${ts} para {paciente}: tu cita es el {fecha}.`
    await page.getByTestId('whatsapp-plantilla').fill(plantilla)
    await expect(page.getByTestId('whatsapp-preview')).toContainText(`Recordatorio ${ts} para Rosa Robles: tu cita es el 21 de octubre.`)

    // Cuándo (primera regla)
    await page.getByTestId('recordatorio-dias-0').fill('2')
    await page.getByTestId('recordatorio-desde-0').fill('9')
    await page.getByTestId('recordatorio-hasta-0').fill('19')

    // Conexión de la clínica (sin switch: se usa al tener credenciales)
    await page.getByTestId('whatsapp-phone-id').fill('phone-id-demo')
    await page.getByTestId('whatsapp-token').fill('token-demo')

    await page.getByTestId('whatsapp-guardar').click()
    await expect(page.getByText('Configuración guardada ✓')).toBeVisible({ timeout: 10_000 })

    // Persiste al recargar
    await page.reload()
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: 'WhatsApp', exact: true }).click()
    await master(true)
    await expect(page.getByTestId('whatsapp-phone-id')).toHaveValue('phone-id-demo')
    await expect(page.getByTestId('recordatorio-dias-0')).toHaveValue('2')
    await expect(page.getByTestId('whatsapp-plantilla')).toHaveValue(plantilla)

    // Limpieza: apagar el interruptor maestro
    await master(false)
    await page.getByTestId('whatsapp-guardar').click()
    await expect(page.getByText('Configuración guardada ✓')).toBeVisible({ timeout: 10_000 })
  })

  test('cada usuario conecta su propio número (se usa automáticamente)', async () => {
    await abrirWhatsApp()
    await master(true)
    await page.getByTestId('mia-phone-id').fill(`pn-mio-${ts}`)
    await page.getByTestId('mia-token').fill('token-mio-demo')
    await page.getByTestId('whatsapp-guardar').click()
    await expect(page.getByText('Configuración guardada ✓')).toBeVisible({ timeout: 10_000 })

    // Al recargar: el número persiste y aparece como conectado
    await page.reload()
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: 'WhatsApp', exact: true }).click()
    await expect(page.getByTestId('mia-phone-id')).toHaveValue(`pn-mio-${ts}`)
    await expect(page.getByTestId('whatsapp-mi-cuenta')).toContainText('conectado')

    await master(false)
    await page.getByTestId('whatsapp-guardar').click()
    await expect(page.getByText('Configuración guardada ✓')).toBeVisible({ timeout: 10_000 })
  })

  test('configura a quién se le avisa y el mensaje del doctor', async () => {
    await abrirWhatsApp()
    await master(true)
    const avisos = page.getByTestId('whatsapp-avisos-card')
    await expect(avisos).toBeVisible()

    // Activar al doctor muestra su mensaje con vista previa
    await avisos.locator('input[type="checkbox"]').nth(1).check()
    await expect(page.getByTestId('whatsapp-preview-doctor')).toContainText('Dr. Pacheco')
    await page.getByTestId('whatsapp-plantilla-doctor').fill('Doc {doctor}: cita con {paciente} el {fecha}.')
    await expect(page.getByTestId('whatsapp-preview-doctor')).toContainText('Doc Dr. Pacheco: cita con Rosa Robles el 21 de octubre.')

    await page.getByTestId('whatsapp-guardar').click()
    await expect(page.getByText('Configuración guardada ✓')).toBeVisible({ timeout: 10_000 })

    // Limpieza: apagar al doctor y el interruptor
    await avisos.locator('input[type="checkbox"]').nth(1).uncheck()
    await master(false)
    await page.getByTestId('whatsapp-guardar').click()
    await expect(page.getByText('Configuración guardada ✓')).toBeVisible({ timeout: 10_000 })
  })

  test('varios recordatorios: alta, persistencia y baja', async () => {
    await abrirWhatsApp()
    await master(true)

    // Debe haber al menos una regla; agregar una segunda
    await expect(page.getByTestId('recordatorio-0')).toBeVisible()
    await page.getByTestId('recordatorio-agregar').click()
    await expect(page.getByTestId('recordatorio-1')).toBeVisible()

    await page.getByTestId('recordatorio-nombre-1').fill('2 horas antes')
    await page.getByTestId('recordatorio-dias-1').fill('0')
    await page.getByTestId('recordatorio-horas-1').fill('2')
    await page.getByTestId('recordatorio-plantilla-1').fill('¡{paciente}! Tu cita es en 2 horas.')

    await page.getByTestId('whatsapp-guardar').click()
    await expect(page.getByText('Configuración guardada ✓')).toBeVisible({ timeout: 10_000 })

    // Persisten ambas reglas al recargar
    await page.reload()
    await page.waitForTimeout(1500)
    await page.getByRole('button', { name: 'WhatsApp', exact: true }).click()
    await expect(page.getByTestId('recordatorio-nombre-1')).toHaveValue('2 horas antes')
    await expect(page.getByTestId('recordatorio-horas-1')).toHaveValue('2')

    // Quitar la segunda regla
    await page.getByTestId('recordatorio-quitar-1').click()
    await expect(page.getByTestId('recordatorio-1')).toHaveCount(0)
    await page.getByTestId('whatsapp-guardar').click()
    await expect(page.getByText('Configuración guardada ✓')).toBeVisible({ timeout: 10_000 })

    await master(false)
    await page.getByTestId('whatsapp-guardar').click()
    await expect(page.getByText('Configuración guardada ✓')).toBeVisible({ timeout: 10_000 })
  })

  test('el botón de prueba valida el teléfono', async () => {
    await abrirWhatsApp()
    await expect(page.getByTestId('whatsapp-probar')).toBeDisabled()
  })
})
