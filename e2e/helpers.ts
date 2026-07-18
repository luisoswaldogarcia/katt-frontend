import { expect, type Page } from 'playwright/test'

export const DEMO_EMAIL = 'admin@katt.app'
export const DEMO_PASSWORD = 'Katt2026!'
export const ts = Date.now()
export const uniq = (id: string) => `${id}_${ts}`

export type ScreenshotFn = (name: string) => Promise<void>

export async function login(page: Page, email: string, password: string) {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 30_000 }).catch(() => {})
  await page.waitForTimeout(2000)

  const emailInput = page.locator('input[type="email"]')
  await emailInput.waitFor({ state: 'visible', timeout: 15_000 })
  await emailInput.fill(email)

  const passInput = page.locator('input[type="password"]')
  await passInput.fill(password)

  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(3000)
}

export async function navigateTo(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
  await page.waitForTimeout(1500)
}

export async function pageContains(page: Page, text: string) {
  await page.waitForTimeout(500)
  await expect(page.locator('body')).toContainText(text, { timeout: 8_000 })
}

export async function setInputValue(page: Page, placeholder: string, value: string) {
  const input = page.locator(`input[placeholder="${placeholder}"], textarea[placeholder="${placeholder}"]`)
  await input.waitFor({ state: 'visible', timeout: 5_000 })
  await input.fill(value)
}

export async function setInputByName(page: Page, name: string, value: string) {
  const input = page.locator(`input[name="${name}"], textarea[name="${name}"]`)
  await input.waitFor({ state: 'visible', timeout: 5_000 })
  await input.fill(value)
}

export async function clickBtn(page: Page, texts: string | string[]) {
  const arr = Array.isArray(texts) ? texts : [texts]
  for (const t of arr) {
    const btn = page.locator('button').filter({ hasText: t })
    await btn.first().waitFor({ state: 'visible', timeout: 5_000 })
    await btn.first().click()
    await page.waitForTimeout(600)
  }
}

export async function clickRow(page: Page, name: string) {
  const row = page.locator('table tr, [class*="card"], [class*="task"]').filter({ hasText: name })
  await row.first().waitFor({ state: 'visible', timeout: 8_000 })
  await row.first().click()
  await page.waitForTimeout(1000)
}

export async function clickFab(page: Page) {
  const fab = page.locator('button[aria-label="Nueva cita"], button[aria-label="Nueva tarea"], button[aria-label="Nuevo proveedor"], button[aria-label="Nueva compra"]')
    .or(page.locator('button.fixed.bottom-6'))
  await fab.first().waitFor({ state: 'visible', timeout: 5_000 })
  await fab.first().click()
  await page.waitForTimeout(800)
}
