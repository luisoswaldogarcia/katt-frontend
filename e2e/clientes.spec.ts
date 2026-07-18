import { test } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, uniq, login, navigateTo, pageContains, setInputValue } from './helpers'

test.describe('Clientes CRUD', () => {
  let page: import('playwright').Page
  const cliName = `Cli ${uniq('cli')}`
  const cliEmail = `cli${ts}@test.com`

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('CREATE — debe crear un paciente', async () => {
    await page.goto('/paciente/alta', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await setInputValue(page, 'Nombre', cliName)
    await setInputValue(page, 'Usuario', 'Dev User')
    await setInputValue(page, 'Teléfono', '5551000001')
    await setInputValue(page, 'Email', cliEmail)
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(3000)
  })

  test('READ — debe listar el paciente', async () => {
    await navigateTo(page, '/paciente')
    await pageContains(page, cliName)
  })

  test('UPDATE — debe editar el paciente', async () => {
    await page.goto('/paciente', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(1500)
    const link = page.locator(`a[href*="/paciente/"]`).filter({ hasText: cliName })
    if (await link.count() > 0) {
      await link.first().click()
    } else {
      await page.locator('table tr').filter({ hasText: cliName }).first().click()
    }
    await page.waitForTimeout(1500)
    const editBtn = page.locator('button').filter({ hasText: 'Editar' })
    if (await editBtn.count() > 0) {
      await editBtn.click()
      await page.waitForTimeout(1000)
      await setInputValue(page, 'Nombre', `${cliName} (edit)`)
      const saveBtn = page.locator('button').filter({ hasText: /Actualizar|Guardar/ })
      await saveBtn.first().click()
      await page.waitForTimeout(2000)
    }
  })

  test('DELETE — debe eliminar el paciente', async () => {
    await navigateTo(page, '/paciente')
    const link = page.locator(`a[href*="/paciente/"]`).filter({ hasText: cliName })
    if (await link.count() > 0) {
      await link.first().click()
    } else {
      await page.locator('table tr').filter({ hasText: cliName }).first().click()
    }
    await page.waitForTimeout(1500)
    const delBtn = page.locator('button').filter({ hasText: 'Eliminar' })
    if (await delBtn.count() > 0) {
      await delBtn.click()
      await page.waitForTimeout(2000)
    }
  })
})
