import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, login, navigateTo } from './helpers'

test.describe('Agente de citas', () => {
  let page: import('playwright').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('flujo completo: agendar cita con el agente desde el cuadro de texto', async () => {
    test.setTimeout(300_000) // las llamadas al LLM tardan
    await navigateTo(page, '/agenda')
    const input = page.locator('[data-testid="agente-cita-input"]')
    await expect(input).toBeVisible({ timeout: 8_000 })

    // Nombres únicos por corrida: ejercita alta de paciente + alta de doctor + confirmación
    await input.fill(`agendar cita con Paciente E2E ${ts} y el doctor Doctor E2E ${ts} el jueves a las 11`)
    await page.locator('form').filter({ has: input }).locator('button[type="submit"]').click()

    // Avanzar el flujo: elegir coincidencias o dar de alta hasta llegar a la confirmación.
    // Tras cada clic se espera a que el agente termine (input habilitado) para no repetir clics.
    for (let step = 0; step < 6; step++) {
      const card = page.locator('[data-testid="agente-cita-respuesta"]')
      await expect(card).toBeVisible({ timeout: 60_000 })
      await expect(input).toBeEnabled({ timeout: 60_000 })
      await page.waitForTimeout(300)

      const crear = page.locator('[data-testid="agente-cita-crear"]')
      const opcion = page.locator('[data-testid="agente-cita-opcion"]').first()
      const alta = page.locator('[data-testid="agente-cita-alta"]')

      // count() es instantáneo: evita esperas de timeout cuando el botón no existe
      const clickIfReady = async (loc: import('playwright').Locator) => {
        if ((await loc.count()) === 0) return false
        if (!(await loc.isEnabled().catch(() => false))) return false
        await loc.click()
        return true
      }

      if (await clickIfReady(crear)) {
        await expect(page.locator('[data-testid="agente-cita-respuesta"]')).toContainText('Cita creada', { timeout: 60_000 })
        // La cita nueva debe quedar visible en el calendario (salta a su fecha)
        await expect(page.locator('[data-testid="agenda-week"]')).toContainText(`Paciente E2E ${ts}`, { timeout: 10_000 })
        return
      }
      if (await clickIfReady(alta)) continue
      if (await clickIfReady(opcion)) continue
      throw new Error(`Paso ${step}: el agente no ofreció acciones. Card: ${await card.innerText()}`)
    }
    throw new Error('El flujo no llegó a la confirmación de la cita')
  })

  test('el cuadro acepta preguntas sin agendar y responde', async () => {
    test.setTimeout(180_000)
    await navigateTo(page, '/agenda')
    const input = page.locator('[data-testid="agente-cita-input"]')
    await input.fill('hola, ¿qué puedes hacer?')
    await page.locator('form').filter({ has: input }).locator('button[type="submit"]').click()
    const card = page.locator('[data-testid="agente-cita-respuesta"]')
    await expect(card).toBeVisible({ timeout: 60_000 })
    expect((await card.innerText()).length).toBeGreaterThan(5)
  })
})
