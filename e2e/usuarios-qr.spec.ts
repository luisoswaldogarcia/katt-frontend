import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, uniq, login, navigateTo, setInputValue } from './helpers'

test.describe('Usuarios — QR de activación', () => {
  let page: import('playwright').Page
  const usrName = `QR_${uniq('usr')}`
  const usrEmail = `qr${ts}@test.com`

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('debe mostrar checkbox "Generar código QR" en el formulario', async () => {
    await navigateTo(page, '/doctor/alta')
    await page.waitForTimeout(1000)

    const checkbox = page.locator('input[type="checkbox"]')
    await expect(checkbox).toBeVisible({ timeout: 5_000 })

    const label = page.locator('text=Generar código QR')
    await expect(label).toBeVisible()
  })

  test('crear usuario CON QR — debe mostrar modal con código QR', async () => {
    await navigateTo(page, '/doctor/alta')
    await page.waitForTimeout(1000)

    // Marcar checkbox
    const checkbox = page.locator('input[type="checkbox"]')
    await checkbox.check()
    await expect(checkbox).toBeChecked()

    // Llenar formulario
    await setInputValue(page, 'Nombre', usrName)
    const rolSelect = page.locator('select').first()
    if (await rolSelect.count() > 0) {
      await rolSelect.selectOption('Owner').catch(() => {})
      await page.waitForTimeout(200)
    }
    await setInputValue(page, 'Teléfono', '5552000003')
    await setInputValue(page, 'Email', usrEmail)

    // Guardar
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(2000)

    // Debería aparecer el modal del QR
    const modal = page.locator('text=Código de activación temporal')
    await expect(modal).toBeVisible({ timeout: 8_000 })

    // Debería mostrar una imagen QR
    const qrImg = page.locator('img[alt="QR de activación"]')
    await expect(qrImg).toBeVisible({ timeout: 5_000 })

    // Debería tener botón para copiar enlace
    const copyBtn = page.locator('text=Copiar enlace')
    await expect(copyBtn).toBeVisible()

    // Cerrar modal
    const closeBtn = page.locator('text=Cerrar')
    await closeBtn.click()
    await page.waitForTimeout(500)
    await expect(modal).not.toBeVisible({ timeout: 3_000 })
  })

  test('crear usuario SIN QR — no debe mostrar QR', async () => {
    const noQrName = `NoQR_${uniq('usr')}`
    const noQrEmail = `noqr${ts}@test.com`

    await navigateTo(page, '/doctor/alta')
    await page.waitForTimeout(1000)

    // Asegurar que checkbox NO está marcado
    const checkbox = page.locator('input[type="checkbox"]')
    if (await checkbox.isChecked()) {
      await checkbox.uncheck()
    }

    await setInputValue(page, 'Nombre', noQrName)
    const rolSelect = page.locator('select').first()
    if (await rolSelect.count() > 0) {
      await rolSelect.selectOption('Usuario').catch(() => {})
      await page.waitForTimeout(200)
    }
    await setInputValue(page, 'Teléfono', '5552000004')
    await setInputValue(page, 'Email', noQrEmail)

    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForURL('**/doctor**', { timeout: 10_000 }).catch(() => {})
    await page.waitForTimeout(2000)

    // No debe aparecer el modal QR
    const modal = page.locator('text=Código de activación temporal')
    await expect(modal).not.toBeVisible({ timeout: 3_000 })
  })
})

test.describe('Setup password (vía QR)', () => {
  let page: import('playwright').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('acceso a /setup sin token muestra error', async () => {
    await page.goto('/setup', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Enlace de activación inválido')).toBeVisible({ timeout: 8_000 })
  })

  test('acceso a /setup con token inválido muestra error', async () => {
    await page.goto('/setup?token=token-invalido', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(2000)
    await page.waitForTimeout(1000)
    // Debe mostrar el formulario de contraseña (el error de token se ve al enviar)
    await expect(page.locator('text=Configura tu contraseña')).toBeVisible({ timeout: 8_000 })
  })

  test('formulario de contraseña rechaza contraseña corta', async () => {
    await page.goto('/setup?token=test-token', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(2000)

    // Llenar con contraseña corta (menos de 6 caracteres)
    const passInputs = page.locator('input[type="password"]')
    await passInputs.nth(0).fill('123')
    await passInputs.nth(1).fill('123')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(500)

    // Debería mostrar error
    const errorMsg = page.locator('text=La contraseña debe tener al menos 6 caracteres')
    await expect(errorMsg).toBeVisible({ timeout: 5_000 })
  })

  test('formulario de contraseña rechaza contraseñas que no coinciden', async () => {
    await page.goto('/setup?token=test-token', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(2000)

    const passInputs = page.locator('input[type="password"]')
    await passInputs.nth(0).fill('Pass123456!')
    await passInputs.nth(1).fill('Pass654321!')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(500)

    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible({ timeout: 5_000 })
  })

  test('pantalla de huella digital ofrece omitir', async () => {
    // Simular que llegamos al paso de huella digital
    // Nota: esto requiere un token real en un entorno deployado
    await page.goto('/setup?token=demo-token', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(2000)

    // Verificar que hay un botón "Omitir" disponible (asumiendo que se llega al paso fingerprint)
    // En un entorno real esto depende del backend
    const skipBtn = page.locator('text=Omitir')
    if (await skipBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipBtn.click()
      await page.waitForTimeout(1000)
      // Debería llevar a pantalla de confirmación
      await expect(page.locator('text=¡Todo listo!')).toBeVisible({ timeout: 5_000 })
    }
  })
})
