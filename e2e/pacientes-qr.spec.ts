import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, uniq, login, navigateTo, setInputValue } from './helpers'

test.describe('Pacientes — QR de activación', () => {
  let browser: import('playwright').Browser
  let page: import('playwright').Page
  const pacName = `PacQR_${uniq('pac')}`

  test.beforeAll(async ({ browser: b }) => {
    browser = b
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('debe mostrar checkbox "Generar código QR" en el formulario de paciente', async () => {
    await navigateTo(page, '/paciente/alta')
    await page.waitForTimeout(1000)

    const checkbox = page.locator('input[type="checkbox"]')
    await expect(checkbox).toBeVisible({ timeout: 5_000 })

    const label = page.locator('text=Generar código QR para que el paciente configure su acceso')
    await expect(label).toBeVisible()
  })

  test('crear paciente CON QR — debe mostrar modal con código QR', async () => {
    await navigateTo(page, '/paciente/alta')
    await page.waitForTimeout(1000)

    await page.locator('input[type="checkbox"]').check()
    await setInputValue(page, 'Nombre', pacName)
    await setInputValue(page, 'Teléfono', '5553000001')
    await setInputValue(page, 'Email', `pacqr${ts}@test.com`)

    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(2000)

    const modal = page.locator('text=Código de activación para paciente')
    await expect(modal).toBeVisible({ timeout: 8_000 })

    const qrImg = page.locator('img[alt="QR de activación"]')
    await expect(qrImg).toBeVisible({ timeout: 5_000 })

    const closeBtn = page.locator('text=Cerrar')
    await closeBtn.click()
    await page.waitForTimeout(500)
    await expect(modal).not.toBeVisible({ timeout: 3_000 })
  })

  test('crear paciente SIN QR — no debe mostrar QR', async () => {
    const noQrPac = `NoQrPac_${uniq('pac')}`

    await navigateTo(page, '/paciente/alta')
    await page.waitForTimeout(1000)

    const checkbox = page.locator('input[type="checkbox"]')
    if (await checkbox.isChecked()) await checkbox.uncheck()

    await setInputValue(page, 'Nombre', noQrPac)
    await setInputValue(page, 'Teléfono', '5553000002')
    await setInputValue(page, 'Email', `noqrpac${ts}@test.com`)

    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForURL('**/paciente**', { timeout: 10_000 }).catch(() => {})
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Código de activación para paciente')).not.toBeVisible({ timeout: 3_000 })
  })

  test('crear paciente QR sin email — genera placeholder', async () => {
    const noEmailPac = `NoEmail_${uniq('pac')}`

    await navigateTo(page, '/paciente/alta')
    await page.waitForTimeout(1000)

    await page.locator('input[type="checkbox"]').check()
    await setInputValue(page, 'Nombre', noEmailPac)
    await setInputValue(page, 'Teléfono', '5553000003')
    // No llenar email

    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(2000)

    await expect(page.locator('text=Código de activación para paciente')).toBeVisible({ timeout: 8_000 })

    const closeBtn = page.locator('text=Cerrar')
    await closeBtn.click()
    await page.waitForTimeout(500)
  })

  test('QR del paciente redirige a setup password', async () => {
    await navigateTo(page, '/paciente/alta')
    await page.waitForTimeout(1000)

    // Crear paciente con QR capturando el token
    const pacSetupName = `Setup_${uniq('pac')}`
    const signupToken = await new Promise<string>(resolve => {
      page.on('response', async resp => {
        if (resp.url().includes('/api/v1/clientes') && resp.status() === 201) {
          const body = await resp.json()
          if (body.signupToken) resolve(body.signupToken)
          else resolve('')
        }
      })
      ;(async () => {
        await page.locator('input[type="checkbox"]').check()
        await setInputValue(page, 'Nombre', pacSetupName)
        await setInputValue(page, 'Teléfono', '5553000004')
        await page.locator('button').filter({ hasText: 'Guardar' }).click()
        await page.waitForTimeout(2000)
        setTimeout(() => resolve(''), 3000)
      })()
    })

    expect(signupToken).toBeTruthy()
    if (!signupToken) return

    // Abrir página de setup con el token
    const setupPage = await browser.newPage({ ignoreHTTPSErrors: true })
    await setupPage.goto(`/setup?token=${signupToken}`, { waitUntil: 'networkidle', timeout: 30_000 }).catch(() => {})
    await setupPage.waitForTimeout(2000)

    await expect(setupPage.locator('text=Configura tu contraseña')).toBeVisible({ timeout: 8_000 })

    await setupPage.locator('input[type="password"]').nth(0).fill('PassPac123!')
    await setupPage.locator('input[type="password"]').nth(1).fill('PassPac123!')
    await setupPage.locator('button[type="submit"]').click()
    await setupPage.waitForTimeout(2000)

    await expect(setupPage.locator('text=Configura tu huella digital')).toBeVisible({ timeout: 8_000 })
    await setupPage.locator('text=Omitir').click()
    await setupPage.waitForTimeout(1000)
    await expect(setupPage.locator('text=¡Todo listo!')).toBeVisible({ timeout: 5_000 })
    await setupPage.close()
  })
})
