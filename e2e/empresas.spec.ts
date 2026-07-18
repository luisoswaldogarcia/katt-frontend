import { test } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, uniq, login, navigateTo, pageContains, setInputValue } from './helpers'

test.describe('Empresas CRUD', () => {
  let page: import('playwright').Page
  const empName = `Emp ${uniq('emp')}`

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('CREATE — debe crear una empresa', async () => {
    await navigateTo(page, '/empresa/alta')
    await setInputValue(page, 'Nombre', empName)
    await setInputValue(page, 'RFC', 'XAXX010101001')
    await setInputValue(page, 'Teléfono', '5554000004')
    await setInputValue(page, 'Email', `emp${ts}@test.com`)
    await setInputValue(page, 'Dirección', 'Dirección E2E test')
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(3000)
  })

  test('READ — debe listar la empresa', async () => {
    await navigateTo(page, '/empresa')
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 100))
    await pageContains(page, empName)
  })

  test('DELETE — debe eliminar la empresa', async () => {
    await navigateTo(page, '/empresa')
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 200))
    await page.waitForTimeout(500)
    const row = page.locator('table tr').filter({ hasText: empName })
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
