const { Before, After, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber')
const { chromium } = require('playwright')

setDefaultTimeout(90_000)

let __browser

BeforeAll(async function () {
  __browser = await chromium.launch({
    headless: false,
    args: ['--ignore-certificate-errors', '--no-sandbox'],
  })
})

AfterAll(async function () {
  if (__browser) await __browser.close().catch(() => {})
})

Before(async function () {
  this.browser = __browser
  this.context = await this.browser.newContext({
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: true,
  })
  this.page = await this.context.newPage()
})

After(async function () {
  if (this.context) await this.context.close().catch(() => {})
})
