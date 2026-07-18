import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, uniq, login, navigateTo, setInputValue, pageContains } from './helpers'

test.describe('Chat', () => {
  let page: import('playwright').Page
  const userA = `ChatA ${uniq('a')}`
  const userB = `ChatB ${uniq('b')}`
  const emailA = `chata${ts}@test.com`
  const emailB = `chatb${ts}@test.com`

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('CREATE — crear usuario A', async () => {
    await navigateTo(page, '/doctor/alta')
    await setInputValue(page, 'Nombre', userA)
    const rolSelect = page.locator('select').first()
    if (await rolSelect.count() > 0) {
      await rolSelect.selectOption('Owner').catch(() => {})
      await page.waitForTimeout(200)
    }
    await setInputValue(page, 'Teléfono', '5553000003')
    await setInputValue(page, 'Email', emailA)
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForURL('**/doctor**', { timeout: 10_000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await pageContains(page, userA)
  })

  test('CREATE — crear usuario B', async () => {
    await navigateTo(page, '/doctor/alta')
    await setInputValue(page, 'Nombre', userB)
    const rolSelect = page.locator('select').first()
    if (await rolSelect.count() > 0) {
      await rolSelect.selectOption('Owner').catch(() => {})
      await page.waitForTimeout(200)
    }
    await setInputValue(page, 'Teléfono', '5553000004')
    await setInputValue(page, 'Email', emailB)
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForURL('**/doctor**', { timeout: 10_000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await pageContains(page, userB)
  })

  test('CHAT — crear conversación grupal y enviar varios mensajes', async () => {
    await navigateTo(page, '/chat')
    await page.waitForTimeout(2000)

    const nuevoBtn = page.locator('button[aria-label="Nuevo chat"]')
    await expect(nuevoBtn).toBeVisible({ timeout: 5_000 })
    await nuevoBtn.click()
    await page.waitForTimeout(800)

    await expect(page.locator('text=Nueva conversación')).toBeVisible({ timeout: 5_000 })

    const checkA = page.locator('label').filter({ hasText: userA }).locator('input[type="checkbox"]')
    await checkA.waitFor({ state: 'visible', timeout: 5_000 })
    await checkA.check()

    const checkB = page.locator('label').filter({ hasText: userB }).locator('input[type="checkbox"]')
    await checkB.waitFor({ state: 'visible', timeout: 5_000 })
    await checkB.check()
    await page.waitForTimeout(300)

    await page.locator('button').filter({ hasText: 'Crear' }).click()
    await page.waitForTimeout(1500)
    await expect(page.locator('text=Nueva conversación')).not.toBeVisible({ timeout: 3_000 }).catch(() => {})

    const msgA = `Mensaje para ${userA} ${ts}`
    const msgB = `Respuesta para ${userB} ${ts}`

    const input = page.locator('input[placeholder="Escribe un mensaje..."]')
    await input.waitFor({ state: 'visible', timeout: 5_000 })

    await input.fill(msgA)
    await page.locator('button[type="submit"]').filter({ hasText: 'Enviar' }).click()
    await page.waitForTimeout(800)

    await input.fill(msgB)
    await page.locator('button[type="submit"]').filter({ hasText: 'Enviar' }).click()
    await page.waitForTimeout(800)

    await expect(page.locator('body')).toContainText(msgA, { timeout: 5_000 })
    await expect(page.locator('body')).toContainText(msgB, { timeout: 3_000 })
  })

  test('HISTORIAL — ambos mensajes visibles en la conversación', async () => {
    const msgA = `Mensaje para ${userA} ${ts}`
    const msgB = `Respuesta para ${userB} ${ts}`

    await expect(page.locator('body')).toContainText(msgA, { timeout: 5_000 })
    await expect(page.locator('body')).toContainText(msgB, { timeout: 3_000 })

    const mensajes = await page.locator('[class*="max-w-\\[75\\%\\]"]').all()
    expect(mensajes.length).toBeGreaterThanOrEqual(2)
  })

  test('CACHE — mensajes guardados en localStorage', async () => {
    const cached = await page.evaluate(() => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('katt-chat-')) {
          try {
            const msgs = JSON.parse(localStorage.getItem(key)!)
            if (msgs.some((m: any) => m.content?.includes('Mensaje para'))) return true
          } catch {}
        }
      }
      return false
    })
    expect(cached).toBe(true)
  })

  test('PUSH — API de notificaciones disponible', async () => {
    const pushSupported = await page.evaluate(() => {
      if (!('Notification' in window) || !('PushManager' in window)) return false
      return { supported: true, permission: Notification.permission }
    })
    expect(pushSupported.supported).toBe(true)
  })
})

test.describe('Agente IA', () => {
  let page: import('playwright').Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('INICIO — crear sesión automática al cargar', async () => {
    await navigateTo(page, '/agente')
    await page.waitForTimeout(2000)

    const bienvenida = page.locator('text=¡Hola! Soy Katt')
    await expect(bienvenida).toBeVisible({ timeout: 8_000 })

    const sesionesOk = await page.evaluate(() => {
      const raw = localStorage.getItem('katt-agente-sesiones')
      if (!raw) return false
      const sesiones = JSON.parse(raw)
      return Array.isArray(sesiones) && sesiones.length > 0
    })
    expect(sesionesOk).toBe(true)
  })

  test('ENVIAR — mensaje guarda historial en localStorage', async () => {
    const msg = `Prueba de historial ${ts}`

    const input = page.locator('input[placeholder="Pregúntale a Katt..."]')
    await input.waitFor({ state: 'visible', timeout: 5_000 })
    await input.fill(msg)

    await page.locator('button[type="submit"]').filter({ hasText: 'Enviar' }).click()
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toContainText(msg, { timeout: 5_000 })

    const guardado = await page.evaluate((m) => {
      const raw = localStorage.getItem('katt-agente-sesiones')
      if (!raw) return { sesion: false, mensajes: false }
      const sesiones = JSON.parse(raw)
      if (!sesiones.length) return { sesion: false, mensajes: false }
      const msgs = JSON.parse(localStorage.getItem('katt-agente-msg-' + sesiones[0].id) || '[]')
      return {
        sesion: true,
        mensajes: msgs.some((x: any) => x.texto === m),
      }
    }, msg)
    expect(guardado.sesion).toBe(true)
    expect(guardado.mensajes).toBe(true)
  })

  test('RESPUESTA — el agente responde (o muestra error)', async () => {
    await page.waitForTimeout(3000)
    const body = page.locator('body')
    const tieneRespuesta = await body.innerText().then(t => t.includes('Katt') || t.includes('Ups, no pude') || t.includes('pregúntale'))
    expect(tieneRespuesta).toBe(true)

    const persistencia = await page.evaluate(() => {
      const raw = localStorage.getItem('katt-agente-sesiones')
      if (!raw) return false
      const sesiones = JSON.parse(raw)
      if (!sesiones.length) return false
      const msgs = JSON.parse(localStorage.getItem('katt-agente-msg-' + sesiones[0].id) || '[]')
      return msgs.length >= 3
    })
    expect(persistencia).toBe(true)
  })

  test('SESIONES — múltiples sesiones guardadas en localStorage', async () => {
    const sidebarBtn = page.locator('button').filter({ hasText: '+ Nueva conversación' })
    await sidebarBtn.waitFor({ state: 'visible', timeout: 3_000 })
    await sidebarBtn.click()
    await page.waitForTimeout(1000)

    const sesionesCount = await page.evaluate(() => {
      const raw = localStorage.getItem('katt-agente-sesiones')
      if (!raw) return 0
      return JSON.parse(raw).length
    })
    expect(sesionesCount).toBeGreaterThanOrEqual(2)

    const sidebarItems = await page.locator('aside button span.truncate').allTextContents()
    const nuevas = sidebarItems.filter(t => t.includes('Nueva conversación') || t.includes('Prueba de historial'))
    expect(nuevas.length).toBeGreaterThanOrEqual(1)
  })
})
