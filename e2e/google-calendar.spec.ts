import { test, expect, type Page } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, login } from './helpers'

test.describe('Google Calendar', () => {
  let page: Page
  beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })
  afterAll(async () => { await page?.close() })

  test('genera el enlace de suscripción y el feed ICS responde', async () => {
    await page.goto('/settings')
    await page.getByRole('button', { name: 'Google Calendar' }).click()
    await expect(page.getByTestId('google-calendar-card')).toBeVisible()
    await page.getByTestId('generar-ics').click()

    const url = page.getByTestId('ics-url')
    await expect(url).toBeVisible({ timeout: 15_000 })
    const value = await url.inputValue()
    expect(value).toContain('/ics/')
    expect(value).toMatch(/\.ics$/)

    // El feed realmente devuelve un calendario (lo que Google va a leer)
    const res = await page.request.get(value)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('text/calendar')
    const body = await res.text()
    expect(body).toContain('BEGIN:VCALENDAR')
    expect(body).toContain('END:VCALENDAR')
    expect(body).toContain('BEGIN:VEVENT')
    expect(body).toContain('TZID=America/Mexico_City')
  })

  test('el chat del agente ya no existe', async () => {
    await page.goto('/agente')
    await page.waitForTimeout(1500)
    const texto = await page.locator('body').innerText()
    expect(texto).not.toContain('Pregunta al agente')
    expect(texto).not.toContain('Agente virtual')
  })
})
