import { test } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, login, navigateTo, setInputByName } from './helpers'

test('probe alta de paciente desde la agenda', async ({ browser }) => {
  const page = await browser.newPage({ ignoreHTTPSErrors: true })
  page.on('response', async r => {
    if (r.url().includes('/clientes') && r.request().method() === 'POST') {
      console.log('POST clientes:', r.status(), (await r.text().catch(() => '')).slice(0, 150))
    }
    if (r.url().includes('/clientes') && r.request().method() === 'GET') {
      console.log('GET clientes:', r.status(), r.url().slice(-60))
    }
  })
  await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  await navigateTo(page, '/agenda')
  await page.waitForTimeout(800)
  const nombre = `Paciente Sonda ${ts}`
  await page.locator('button[aria-label="Nueva cita"]').click()
  await page.waitForTimeout(800)
  await setInputByName(page, 'paciente', nombre)
  await setInputByName(page, 'doctor', 'Dr. Sonda')
  await setInputByName(page, 'fecha', '2026-12-01')
  await setInputByName(page, 'hora', '11:00')
  await page.locator('button[type="submit"]').filter({ hasText: 'Guardar' }).click()
  await page.waitForTimeout(2500)

  // ¿Existe el paciente en la API?
  const found = await page.evaluate(async (n) => {
    const { api } = await import('/src/lib/api.ts').catch(() => ({ api: null }))
    return 'no-probe'
  }, nombre)
  console.log('PACIENTE BUSCADO:', nombre)
  await page.close()
})
