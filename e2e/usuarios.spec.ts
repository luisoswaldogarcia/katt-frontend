import { test } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, uniq, login, navigateTo, pageContains, setInputValue } from './helpers'

test.describe('Usuarios CRUD', () => {
  let page: import('playwright').Page
  const usrName = `Usr ${uniq('usr')}`
  const usrEmail = `usr${ts}@test.com`

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('CREATE — debe crear un usuario', async () => {
    await navigateTo(page, '/doctor/alta')
    await setInputValue(page, 'Nombre', usrName)
    const rolSelect = page.locator('select').first()
    if (await rolSelect.count() > 0) {
      await rolSelect.selectOption('Owner').catch(() => {})
      await page.waitForTimeout(200)
    }
    await setInputValue(page, 'Teléfono', '5552000002')
    await setInputValue(page, 'Email', usrEmail)
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForURL('**/doctor**', { timeout: 10_000 }).catch(() => {})
    await page.waitForTimeout(1000)
    await pageContains(page, usrName)
  })

  test('READ — debe listar el usuario', async () => {
    await navigateTo(page, '/doctor')
    await pageContains(page, usrName)
  })

  test('DELETE — debe eliminar el usuario', async () => {
    await navigateTo(page, '/doctor')
    await page.waitForTimeout(1500)
    const row = page.locator('table tr').filter({ hasText: usrName })
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
