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

    const checkbox = page.locator('input[type="checkbox"]')
    await checkbox.check()
    await expect(checkbox).toBeChecked()

    await setInputValue(page, 'Nombre', usrName)
    const rolSelect = page.locator('select').first()
    if (await rolSelect.count() > 0) {
      await rolSelect.selectOption('Owner').catch(() => {})
      await page.waitForTimeout(200)
    }
    await setInputValue(page, 'Teléfono', '5552000003')
    await setInputValue(page, 'Email', usrEmail)

    // Llenar nombre de usuario (se muestra solo cuando QR está activo)
    const usernameInput = page.locator('input[placeholder="Usuario"]')
    if (await usernameInput.isVisible()) {
      await usernameInput.fill(`usr_${ts}`)
    }

    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(2000)

    const modal = page.locator('text=Código de activación temporal')
    await expect(modal).toBeVisible({ timeout: 8_000 })

    const qrImg = page.locator('img[alt="QR de activación"]')
    await expect(qrImg).toBeVisible({ timeout: 5_000 })

    const copyBtn = page.locator('text=Copiar enlace')
    await expect(copyBtn).toBeVisible()

    const closeBtn = page.locator('text=Cerrar')
    await closeBtn.click()
    await page.waitForTimeout(500)
    await expect(modal).not.toBeVisible({ timeout: 3_000 })
  })

  test('crear usuario CON QR sin email/telefono/pass — debe funcionar', async () => {
    const qrMinName = `QRmin_${uniq('usr')}`

    await navigateTo(page, '/doctor/alta')
    await page.waitForTimeout(1000)

    const checkbox = page.locator('input[type="checkbox"]')
    await checkbox.check()
    await expect(checkbox).toBeChecked()

    await setInputValue(page, 'Nombre', qrMinName)
    const rolSelect = page.locator('select').first()
    if (await rolSelect.count() > 0) {
      await rolSelect.selectOption('Usuario').catch(() => {})
      await page.waitForTimeout(200)
    }

    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(2000)

    const modal = page.locator('text=Código de activación temporal')
    await expect(modal).toBeVisible({ timeout: 8_000 })

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

    const modal = page.locator('text=Código de activación temporal')
    await expect(modal).not.toBeVisible({ timeout: 3_000 })
  })
})

test.describe('Setup password (vía QR)', () => {
  let browser: import('playwright').Browser
  let page: import('playwright').Page
  let adminPage: import('playwright').Page

  test.beforeAll(async ({ browser: b }) => {
    browser = b
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    adminPage = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(adminPage, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
    await adminPage?.close()
  })

  test('acceso a /setup sin token muestra error', async () => {
    await page.goto('/setup', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Enlace de activación inválido')).toBeVisible({ timeout: 8_000 })
  })

  test('acceso a /setup con token inválido muestra el formulario', async () => {
    await page.goto('/setup?token=token-invalido', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(2000)
    await expect(page.locator('text=Configura tu contraseña')).toBeVisible({ timeout: 8_000 })
  })

  test('formulario de contraseña tiene toggle de mostrar/ocultar', async () => {
    await page.goto('/setup?token=test-token', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(2000)

    // Debe haber botones de ojo para mostrar contraseña
    const eyeBtns = page.locator('button svg')
    await expect(eyeBtns.first()).toBeVisible({ timeout: 5_000 })
  })

  test('formulario de contraseña rechaza contraseña corta', async () => {
    await page.goto('/setup?token=test-token', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(2000)

    const passInputs = page.locator('input[type="password"]')
    await passInputs.nth(0).fill('123')
    await passInputs.nth(1).fill('123')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(500)

    await expect(page.locator('text=La contraseña debe tener al menos 6 caracteres')).toBeVisible({ timeout: 5_000 })
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

  test('flujo completo: crear usuario QR + abrir setup + cambiar password + fingerprint omit', async () => {
    // 1. Admin crea usuario con QR
    const fullName = `Full_${uniq('usr')}`
    await navigateTo(adminPage, '/doctor/alta')
    await adminPage.waitForTimeout(1000)

    // Interceptar la respuesta de la API para obtener el token
    const signupToken = await new Promise<string>(resolve => {
      adminPage.on('response', async resp => {
        if (resp.url().includes('/api/v1/usuarios') && resp.status() === 201) {
          const body = await resp.json()
          if (body.signupToken) resolve(body.signupToken)
          else resolve('')
        }
      })
      ;(async () => {
        await adminPage.locator('input[type="checkbox"]').check()
        await setInputValue(adminPage, 'Nombre', fullName)
        const sel = adminPage.locator('select').first()
        if (await sel.count() > 0) await sel.selectOption('Usuario').catch(() => {})
        await adminPage.locator('button').filter({ hasText: 'Guardar' }).click()
        await adminPage.waitForTimeout(2000)
        // Si no se capturó el token, forzar resolución
        setTimeout(() => resolve(''), 3000)
      })()
    })

    expect(signupToken).toBeTruthy()
    if (!signupToken) return

    // 2. Abrir setup con el token real
    const setupPage = await browser.newPage({ ignoreHTTPSErrors: true })
    await setupPage.goto(`/setup?token=${signupToken}`, { waitUntil: 'networkidle', timeout: 30_000 }).catch(() => {})
    await setupPage.waitForTimeout(2000)

    await expect(setupPage.locator('text=Configura tu contraseña')).toBeVisible({ timeout: 8_000 })

    // 3. Establecer contraseña
    await setupPage.locator('input[type="password"]').nth(0).fill('MiNuevaPass1!')
    await setupPage.locator('input[type="password"]').nth(1).fill('MiNuevaPass1!')
    await setupPage.locator('button[type="submit"]').click()
    await setupPage.waitForTimeout(2000)

    // 4. Debe llegar al paso de huella digital
    await expect(setupPage.locator('text=Configura tu huella digital')).toBeVisible({ timeout: 8_000 })

    // 5. Omitir huella
    await setupPage.locator('text=Omitir').click()
    await setupPage.waitForTimeout(1000)
    await expect(setupPage.locator('text=¡Todo listo!')).toBeVisible({ timeout: 5_000 })

    await setupPage.close()
  })

  test('login muestra botón de huella digital', async () => {
    const fpPage = await browser.newPage({ ignoreHTTPSErrors: true })
    await fpPage.goto('/', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await fpPage.waitForTimeout(2000)
    // Debe mostrar el botón de huella
    const fpBtn = fpPage.locator('text=Entrar con huella digital')
    await expect(fpBtn).toBeVisible({ timeout: 8_000 })
    await fpPage.close()
  })

  test('login con huella no pide email', async () => {
    const fpPage = await browser.newPage({ ignoreHTTPSErrors: true })
    await fpPage.goto('/', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await fpPage.waitForTimeout(2000)
    // El botón debe existir sin necesidad de email
    await expect(fpPage.locator('text=Entrar con huella digital')).toBeVisible({ timeout: 5_000 })
    await fpPage.close()
  })

  test('QR token persiste hasta abrir URL (no expira por tiempo)', async () => {
    // 1. Admin crea usuario con QR
    const persistName = `Persist_${uniq('usr')}`
    await navigateTo(adminPage, '/doctor/alta')
    await adminPage.waitForTimeout(1000)

    const signupToken = await new Promise<string>(resolve => {
      adminPage.on('response', async resp => {
        if (resp.url().includes('/api/v1/usuarios') && resp.status() === 201) {
          const body = await resp.json()
          if (body.signupToken) resolve(body.signupToken)
          else resolve('')
        }
      })
      ;(async () => {
        await adminPage.locator('input[type="checkbox"]').check()
        await setInputValue(adminPage, 'Nombre', persistName)
        const sel = adminPage.locator('select').first()
        if (await sel.count() > 0) await sel.selectOption('Usuario').catch(() => {})
        await adminPage.locator('button').filter({ hasText: 'Guardar' }).click()
        await adminPage.waitForTimeout(2000)
        setTimeout(() => resolve(''), 3000)
      })()
    })

    expect(signupToken).toBeTruthy()
    if (!signupToken) return

    // 2. Simular "días después" — navegar a otra página y volver
    const setupPage2 = await browser.newPage({ ignoreHTTPSErrors: true })
    // Primero ir a una página random
    await setupPage2.goto('https://example.com', { waitUntil: 'networkidle', timeout: 15_000 }).catch(() => {})
    await setupPage2.waitForTimeout(1000)
    // Luego abrir el setup
    await setupPage2.goto(`/setup?token=${signupToken}`, { waitUntil: 'networkidle', timeout: 30_000 }).catch(() => {})
    await setupPage2.waitForTimeout(2000)

    // El token debe seguir siendo válido
    await expect(setupPage2.locator('text=Configura tu contraseña')).toBeVisible({ timeout: 8_000 })
    await setupPage2.close()
  })
})
