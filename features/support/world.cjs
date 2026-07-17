const { setWorldConstructor } = require('@cucumber/cucumber')
const { chromium } = require('playwright')

class KattWorld {
  constructor({ parameters }) {
    this.baseUrl = parameters.baseUrl
    this.email = parameters.email
    this.password = parameters.password
    this.browser = null
    this.context = null
    this.page = null
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: false,
        args: ['--ignore-certificate-errors', '--no-sandbox'],
      })
    }
  }

  async newPage() {
    await this.initBrowser()
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 900 },
      ignoreHTTPSErrors: true,
    })
    this.page = await this.context.newPage()
  }

  async closePage() {
    if (this.context) {
      await this.context.close().catch(() => {})
      this.context = null
      this.page = null
    }
  }

  async closeBrowser() {
    await this.closePage()
    if (this.browser) {
      await this.browser.close().catch(() => {})
      this.browser = null
    }
  }

  async login() {
    await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {})
    await this.page.waitForTimeout(1500)
    const inputs = await this.page.$$('input')
    await inputs[0]?.click({ clickCount: 3 })
    await inputs[0]?.type(this.email, { delay: 4 })
    await inputs[1]?.click({ clickCount: 3 })
    await inputs[1]?.type(this.password, { delay: 4 })
    await this.page.click('button[type="submit"]')
    await this.page.waitForTimeout(2000)
  }

  async goto(path) {
    await this.page.goto(`${this.baseUrl}${path}`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {})
    await this.page.waitForTimeout(1000)
  }
}

setWorldConstructor(KattWorld)
