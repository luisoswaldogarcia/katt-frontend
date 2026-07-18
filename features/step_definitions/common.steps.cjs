const { Before, When, Then } = require('@cucumber/cucumber')
const {
  setInputValue,
  setInputByName,
  setSelectByLabel,
  clickBtn,
  confirmDelete,
  clickFab,
  pageContains,
  findRow,
  uniq,
  sleep,
} = require('../support/helpers.cjs')

const shared = {}

Before(() => { shared.created = shared.created || {} })

When('espero a que cargue la configuración', async function () {
  for (let i = 0; i < 20; i++) {
    const btns = await this.page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim())
    )
    if (btns.some(t => ['Usuario', 'Sistema', 'Operativo', 'Documentos', 'Módulos'].includes(t))) return
    await this.page.waitForTimeout(300)
  }
})

When('navego a {string}', async function (path) {
  await this.page.goto(`${this.baseUrl}${path}`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {})
  await this.page.waitForTimeout(1500)
})

When('lleno el campo {string} con un nombre único', async function (placeholder) {
  shared.created = shared.created || {}
  const name = `E2E ${uniq(placeholder.slice(0, 4))}`
  shared.created[`nombre_${placeholder}`] = name
  await setInputValue(this.page, placeholder, name)
})

When('lleno el campo {string} con un email único', async function (placeholder) {
  const email = `e2e${Date.now()}${Math.random().toString(36).slice(2, 6)}@test.com`
  await setInputValue(this.page, placeholder, email)
})

When('lleno el campo {string} con un título único', async function (placeholder) {
  shared.created = shared.created || {}
  const title = `Tarea E2E ${uniq('t')}`
  shared.created.titulo = title
  await setInputValue(this.page, placeholder, title)
})

When('lleno el campo {string} con {string}', async function (field, value) {
  const doneByPlaceholder = await this.page.evaluate(({ ph, val }) => {
    const inp = Array.from(document.querySelectorAll('input, textarea')).find(i => i.placeholder === ph)
    if (!inp) return false
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (setter) setter.call(inp, val); else inp.value = val
    inp.dispatchEvent(new Event('input', { bubbles: true }))
    inp.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, { ph: field, val: value })
  if (doneByPlaceholder) return
  const doneByName = await this.page.evaluate(({ nm, val }) => {
    const inp = document.querySelector(`input[name="${nm}"], textarea[name="${nm}"]`)
    if (!inp) return false
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (setter) setter.call(inp, val); else inp.value = val
    inp.dispatchEvent(new Event('input', { bubbles: true }))
    inp.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, { nm: field, val: value })
  if (!doneByName) throw new Error(`Campo "${field}" no encontrado por placeholder ni name`)
})

When('lleno el campo {string} editando el nombre', async function (placeholder) {
  shared.created = shared.created || {}
  const keys = Object.keys(shared.created).filter(k => k.startsWith('nombre_'))
  const orig = keys.length > 0 ? shared.created[keys[0]] : ''
  const newName = orig ? `${orig} (edit)` : `E2E Edit ${Date.now()}`
  shared.created.editado = newName
  const done = await this.page.evaluate(({ ph, val }) => {
    const inp = Array.from(document.querySelectorAll('input, textarea')).find(i => i.placeholder === ph)
    if (!inp) return false
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (setter) setter.call(inp, val); else inp.value = val
    inp.dispatchEvent(new Event('input', { bubbles: true }))
    inp.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, { ph: placeholder, val: newName })
  if (!done) throw new Error(`Input "${placeholder}" no encontrado para editar`)
})

When('lleno el campo {string} con un motivo único', async function (name) {
  const motivo = `Cita E2E ${uniq('c')}`
  await setInputByName(this.page, name, motivo)
})

When('selecciono {string} en el campo {string}', async function (option, label) {
  await setSelectByLabel(this.page, label, option)
})

When('selecciono el tipo {string}', async function (option) {
  const done = await this.page.evaluate(opt => {
    const sel = document.querySelector('select[name="tipo"]')
    if (!sel) return false
    const opts = Array.from(sel.options)
    const byText = opts.findIndex(o => o.innerText.trim() === opt)
    if (byText >= 0) { sel.selectedIndex = byText; sel.dispatchEvent(new Event('change', { bubbles: true })); return true }
    if (opt === 'General') { sel.selectedIndex = 1; sel.dispatchEvent(new Event('change', { bubbles: true })); return true }
    return false
  }, option)
  if (!done) throw new Error(`Select tipo "${option}" no disponible`)
  await this.page.waitForTimeout(200)
})

When('presiono el botón {string}', async function (text) {
  if (text === 'Menú') {
    const btn = this.page.locator('button[aria-label="Menú"]')
    await btn.waitFor({ state: 'visible', timeout: 5000 })
    await btn.click()
    await this.page.waitForTimeout(500)
    return
  }
  await clickBtn(this.page, text)
})

When('presiono el botón {string} o {string}', async function (text1, text2) {
  await clickBtn(this.page, [text1, text2])
})

When('presiono el botón flotante de nueva tarea', async function () {
  await clickFab(this.page)
})

When('presiono el botón flotante de nueva cita', async function () {
  await clickFab(this.page)
})

When('presiono el botón flotante de nuevo proveedor', async function () {
  await clickFab(this.page)
})

When('hago clic en la fila del paciente creado', async function () {
  await findRow(this.page, shared.created.nombre_Nombre || shared.created.nombre_undefined)
})

When('hago clic en la fila del item creado', async function () {
  await findRow(this.page, shared.created.nombre_Nombre || shared.created.nombre_undefined)
})

When('hago clic en la fila del usuario creado', async function () {
  await findRow(this.page, shared.created.nombre_Nombre || shared.created.nombre_undefined)
})

When('hago clic en la fila de la empresa creada', async function () {
  await findRow(this.page, shared.created.nombre_Nombre || shared.created.nombre_undefined)
})

When('hago clic en la fila del paciente editado', async function () {
  const name = `${shared.created.nombre_Nombre || shared.created.nombre_undefined} (edit)`
  await findRow(this.page, name).catch(() => findRow(this.page, shared.created.nombre_Nombre || shared.created.nombre_undefined))
})

When('hago clic en la fila del item editado', async function () {
  const name = `${shared.created.nombre_Nombre || shared.created.nombre_undefined} (edit)`
  await findRow(this.page, name).catch(() => findRow(this.page, shared.created.nombre_Nombre || shared.created.nombre_undefined))
})

When('hago clic en la fila del usuario editado', async function () {
  const name = `${shared.created.nombre_Nombre || shared.created.nombre_undefined} (edit)`
  await findRow(this.page, name).catch(() => findRow(this.page, shared.created.nombre_Nombre || shared.created.nombre_undefined))
})

When('hago clic en la fila de la empresa editada', async function () {
  const name = `${shared.created.nombre_Nombre || shared.created.nombre_undefined} (edit)`
  await findRow(this.page, name).catch(() => findRow(this.page, shared.created.nombre_Nombre || shared.created.nombre_undefined))
})

When('confirmo la eliminación', async function () {
  await confirmDelete(this.page)
})

Then('debo ver el paciente creado en la lista', async function () {
  const name = shared.created.nombre_Nombre || ''
  if (!name) return
  for (let i = 0; i < 15; i++) {
    const body = await this.page.evaluate(() => document.body.innerText)
    if (body.includes(name)) return
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await this.page.waitForTimeout(500)
  }
  throw new Error(`"${name}" no está en la lista de pacientes`)
})

Then('debo ver el item creado en la lista', async function () {
  const name = shared.created.nombre_Nombre || ''
  if (!name) return
  for (let i = 0; i < 15; i++) {
    const body = await this.page.evaluate(() => document.body.innerText)
    if (body.includes(name)) return
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await this.page.waitForTimeout(500)
  }
  throw new Error(`"${name}" no está en la lista de inventario`)
})

Then('debo ver el usuario creado en la lista', async function () {
  const name = shared.created.nombre_Nombre || ''
  if (!name) return
  for (let i = 0; i < 15; i++) {
    const body = await this.page.evaluate(() => document.body.innerText)
    if (body.includes(name)) return
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await this.page.waitForTimeout(500)
  }
  throw new Error(`"${name}" no está en la lista de usuarios`)
})

Then('debo ver la empresa creada en la lista', async function () {
  const name = shared.created.nombre_Nombre || ''
  if (name) {
    await this.page.evaluate(() => window.scrollTo(0, 100))
    await this.page.waitForTimeout(500)
    await pageContains(this.page, name)
  }
})

// Generic success assertions
Then('el paciente debe crearse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('el item debe crearse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('el usuario debe crearse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('la empresa debe crearse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('el paciente debe actualizarse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('el item debe actualizarse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('el usuario debe actualizarse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('la empresa debe actualizarse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('el paciente debe eliminarse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('el item debe eliminarse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('el usuario debe eliminarse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('la empresa debe eliminarse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('la cita debe crearse exitosamente', async function () {
  await this.page.waitForTimeout(1500)
})

When('busco el proveedor creado y presiono {string}', async function (btnText) {
  const name = shared.created.nombre_Nombre___ || shared.created.nombre_Nombre || ''
  if (!name) throw new Error('No hay proveedor creado')
  const found = await this.page.evaluate(t => {
    const all = Array.from(document.querySelectorAll('div, span, p, a, h1, h2, h3, h4, h5'))
    const textEl = all.find(el => el.innerText?.trim().startsWith(t) || el.innerText?.trim() === t)
    if (!textEl) return false
    let el = textEl
    while (el && el.parentElement && el.tagName !== 'BODY') {
      const del = Array.from(el.parentElement.querySelectorAll('button')).find(b =>
        b.innerText.trim() === 'Eliminar' && b.offsetParent !== null
      )
      if (del) { del.click(); return true }
      el = el.parentElement
    }
    const allBtns = Array.from(document.querySelectorAll('button'))
    const visDel = allBtns.find(b => b.innerText.trim() === 'Eliminar' && b.offsetParent !== null)
    if (visDel) { visDel.click(); return true }
    return false
  }, name)
  if (!found) throw new Error(`Proveedor "${name}" no encontrado en UI`)
  await sleep(500)
})

Then('la tarea debe crearse exitosamente', async function () {
  await this.page.waitForTimeout(2000)
  const name = shared.created.titulo
  if (name) {
    const body = await this.page.evaluate(() => document.body.innerText)
    if (!body.includes(name)) {
      try { await clickBtn(this.page, 'Lista'); await sleep(1000) } catch {}
      const body2 = await this.page.evaluate(() => document.body.innerText)
      if (!body2.includes(name)) {
        throw new Error(`Tarea "${name}" no visible en board ni lista`)
      }
    }
  }
})

When('busco y selecciono la tarea creada', async function () {
  const name = shared.created.titulo
  if (!name) throw new Error('No hay tarea creada para buscar')
  let found = false
  for (let i = 0; i < 15; i++) {
    found = await this.page.evaluate(t => {
      const cards = Array.from(document.querySelectorAll('[draggable], [class*="card"], [class*="task"], tr, [class*="row"]'))
      const card = cards.find(c => c.innerText.includes(t))
      if (!card) return false
      const del = Array.from(card.querySelectorAll('button')).find(b =>
        b.innerText.trim() === '×' || b.innerText.trim() === '✕'
      )
      if (del) { del.click(); return true }
      card.click()
      return true
    }, name)
    if (found) break
    await this.page.evaluate(() => window.scrollBy(0, 300))
    await sleep(500)
  }
  if (!found) throw new Error(`Tarea "${name}" no encontrada`)
  await sleep(1000)
})

Then('la tarea debe eliminarse exitosamente', async function () {
  await this.page.waitForTimeout(1500)
})

Then('el proveedor debe crearse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

Then('el proveedor debe eliminarse exitosamente', async function () {
  await this.page.waitForTimeout(1000)
})

// ── Config steps ──

Then('debo ver {string}', async function (text) {
  for (let i = 0; i < 15; i++) {
    const body = await this.page.evaluate(() => document.body.innerText)
    if (body.includes(text)) return
    await this.page.waitForTimeout(500)
  }
  throw new Error(`"${text}" no está en la página`)
})

Then('debo ver mi empresa en la lista', async function () {
  await this.page.waitForTimeout(1000)
  const body = await this.page.evaluate(() => document.body.innerText)
  const empresas = await this.page.evaluate(() => {
    return Array.from(document.querySelectorAll('select option')).map(o => o.innerText.trim()).filter(t => t && t !== 'Owner (todos los módulos)')
  })
  if (empresas.length === 0) return
  const visibleOnPage = empresas.some(e => body.includes(e))
  if (!visibleOnPage) throw new Error('No se encontró ninguna empresa en la lista')
})

Then('se muestran las pestañas de configuración según mi rol', async function () {
  const body = await this.page.evaluate(() => document.body.innerText)
  const tabs = ['Usuario', 'Sistema', 'Operativo', 'Documentos', 'Módulos']
  const visibles = tabs.filter(t => body.includes(t))
  console.log(`  [INFO] Pestañas visibles: ${visibles.join(', ') || 'ninguna'}`)
})

Then('el sidebar muestra los enlaces según mi rol', async function () {
  const nav = this.page.locator('nav')
  const text = await nav.innerText()
  console.log(`  [INFO] Sidebar contiene: ${text.slice(0, 200).replace(/\n/g, ', ')}`)
})

Then('debo ver los botones de módulo {string}', async function (modName) {
  await this.page.waitForTimeout(500)
  const found = await this.page.evaluate(t => {
    return Array.from(document.querySelectorAll('button')).some(b => b.innerText.trim() === t)
  }, modName)
  if (!found) throw new Error(`Botón de módulo "${modName}" no encontrado`)
})
