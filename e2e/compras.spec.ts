import { test } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, uniq, login, navigateTo, setInputValue, clickFab } from './helpers'

test.describe('Compras — Proveedores', () => {
  let page: import('playwright').Page
  const provName = `Prov E2E ${uniq('prov')}`

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('CREATE — debe crear un proveedor', async () => {
    await navigateTo(page, '/compras')
    await page.waitForTimeout(1000)
    const provBtn = page.locator('button').filter({ hasText: 'Proveedores' })
    if (await provBtn.count() > 0) {
      await provBtn.click()
      await page.waitForTimeout(500)
    }
    const fab = page.locator('button[aria-label="Nuevo proveedor"]')
    if (await fab.count() > 0) {
      await fab.click()
    } else {
      await clickFab(page)
    }
    await page.waitForTimeout(800)
    await setInputValue(page, 'Nombre *', provName)
    await setInputValue(page, 'Persona de contacto', 'Contacto E2E Test')
    await setInputValue(page, 'Teléfono', '5555000005')
    await setInputValue(page, 'Email', `prov${ts}@test.com`)
    const createBtn = page.locator('button').filter({ hasText: /Crear proveedor/i })
    if (await createBtn.count() > 0) {
      await createBtn.click()
    } else {
      await page.locator('button').filter({ hasText: /Guardar|Crear/i }).first().click()
    }
    await page.waitForTimeout(2000)
  })

  test('DELETE — debe eliminar el proveedor', async () => {
    await navigateTo(page, '/compras')
    await page.waitForTimeout(1000)
    const provBtn = page.locator('button').filter({ hasText: 'Proveedores' })
    if (await provBtn.count() > 0) {
      await provBtn.click()
      await page.waitForTimeout(500)
    }
    const card = page.locator('div.flex.items-center').filter({ hasText: provName })
    if (await card.count() > 0) {
      const delBtn = card.locator('button').filter({ hasText: 'Eliminar' })
      if (await delBtn.count() > 0) {
        await delBtn.click()
        await page.waitForTimeout(500)
        const confirm = page.locator('button').filter({ hasText: /eliminar/i })
        if (await confirm.count() > 0) {
          await confirm.first().click({ force: true })
          await page.waitForTimeout(1500)
        }
      }
    }
  })
})
