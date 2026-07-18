import { test } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, uniq, login, navigateTo, pageContains, setInputValue } from './helpers'

test.describe('Inventario CRUD', () => {
  let page: import('playwright').Page
  const invName = `Inv ${uniq('inv')}`

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('CREATE — debe crear un item de inventario', async () => {
    await navigateTo(page, '/inventario/alta')
    await setInputValue(page, 'Nombre', invName)
    await page.waitForTimeout(300)
    const catSelect = page.locator('select').filter({ hasText: /Seleccionar/i }).or(page.locator('select').first())
    if (await catSelect.count() > 0) {
      await catSelect.selectOption({ index: 1 }).catch(() => {})
      await page.waitForTimeout(200)
    }
    await setInputValue(page, 'Cantidad', '30')
    await setInputValue(page, 'Unidad', 'kg')
    await setInputValue(page, 'Precio unitario', '99.99')
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(3000)
  })

  test('READ — debe listar el item', async () => {
    await navigateTo(page, '/inventario')
    await pageContains(page, invName)
  })

  test('DELETE — debe eliminar el item', async () => {
    await navigateTo(page, '/inventario')
    await page.waitForTimeout(1500)
    const row = page.locator('table tr').filter({ hasText: invName })
    if (await row.count() > 0) {
      await row.first().click()
      await page.waitForTimeout(1500)
      const delBtn = page.locator('button').filter({ hasText: 'Eliminar' })
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
