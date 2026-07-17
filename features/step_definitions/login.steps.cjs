const { Given, When, Then } = require('@cucumber/cucumber')

Given('que estoy en la página de inicio', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
  await this.page.waitForTimeout(2000)
})

Given('que he iniciado sesión', async function () {
  await this.page.goto(this.baseUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
  await this.page.waitForTimeout(2000)
  const loginForm = this.page.locator('input[type="email"]')
  if (await loginForm.isVisible().catch(() => false)) {
    await this.page.locator('input[type="email"]').first().fill(this.email)
    await this.page.locator('input[type="password"]').first().fill(this.password)
    await this.page.locator('button[type="submit"]').click()
    await this.page.waitForTimeout(2000)
  }
})

When('ingreso credenciales demo', async function () {
  await this.page.locator('input[type="email"]').first().waitFor({ state: 'visible', timeout: 10000 })
  await this.page.locator('input[type="email"]').first().fill(this.email)
  await this.page.locator('input[type="password"]').first().fill(this.password)
  await this.page.locator('button[type="submit"]').click()
  await this.page.waitForTimeout(3000)
})

Then('debo ver el dashboard con {string}', async function (text) {
  await this.page.waitForTimeout(1500)
  const body = await this.page.evaluate(() => document.body.innerText)
  if (!body.includes(text)) {
    throw new Error(`Dashboard no contiene "${text}"`)
  }
})
