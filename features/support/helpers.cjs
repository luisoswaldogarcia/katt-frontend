const SLEEP_BASE = 120

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function uniq(id) {
  const ts = global.__katt_ts || (global.__katt_ts = Date.now())
  const rnd = global.__katt_rnd || (global.__katt_rnd = Math.random().toString(36).slice(2, 4))
  return `${id}_${ts}_${rnd}`
}

async function setInputValue(page, placeholder, value) {
  const done = await page.evaluate(({ ph, val }) => {
    const inp = Array.from(document.querySelectorAll('input, textarea')).find(i => i.placeholder === ph)
    if (!inp) return false
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (setter) setter.call(inp, val); else inp.value = val
    inp.dispatchEvent(new Event('input', { bubbles: true }))
    inp.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, { ph: placeholder, val: value })
  if (!done) throw new Error(`Input "${placeholder}" no encontrado`)
  await sleep(SLEEP_BASE)
}

async function setInputByName(page, name, value) {
  const done = await page.evaluate(({ nm, val }) => {
    const inp = document.querySelector(`input[name="${nm}"], textarea[name="${nm}"]`)
    if (!inp) return false
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (setter) setter.call(inp, val); else inp.value = val
    inp.dispatchEvent(new Event('input', { bubbles: true }))
    inp.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, { nm: name, val: value })
  if (!done) throw new Error(`Input name="${name}" no encontrado`)
  await sleep(SLEEP_BASE)
}

async function setSelectByLabel(page, labelText, optionText) {
  const done = await page.evaluate(({ lbl, opt }) => {
    const labels = Array.from(document.querySelectorAll('label'))
    const label = labels.find(l => l.innerText.trim().startsWith(lbl))
    if (!label) return false
    const parent = label.parentElement
    if (!parent) return false
    const select = parent.querySelector('select')
    if (!select) return false
    const idx = Array.from(select.options).findIndex(o => o.innerText.trim() === opt)
    if (idx < 0) return false
    select.selectedIndex = idx
    select.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, { lbl: labelText, opt: optionText })
  if (!done) throw new Error(`Select "${labelText}" → "${optionText}" no encontrado`)
  await sleep(SLEEP_BASE)
}

async function clickBtn(page, texts) {
  const arr = Array.isArray(texts) ? texts : [texts]
  for (let i = 0; i < 30; i++) {
    const done = await page.evaluate(tt => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        tt.some(t => b.innerText.trim() === t || b.innerText.trim().startsWith(t))
      )
      if (btn) { btn.click(); return true }
      return false
    }, arr)
    if (done) { await sleep(600); return }
    await sleep(200)
  }
  throw new Error(`Botón [${arr.join(', ')}] no encontrado`)
}

async function confirmDelete(page) {
  await sleep(500)
  for (let i = 0; i < 15; i++) {
    const done = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.offsetParent !== null
        && ['eliminar', 'sí, eliminar', 'si, eliminar', 'confirmar', 'cancelar cita']
          .includes(b.innerText.trim().toLowerCase())
      )
      if (btn) { btn.click(); return true }
      return false
    })
    if (done) { await sleep(1000); return }
    await sleep(200)
  }
}

async function clickFab(page) {
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button')).find(b =>
      (b.className || '').includes('fixed') && (b.className || '').includes('bottom-6')
    )?.click()
  })
  await sleep(800)
}

async function pageContains(page, text) {
  await sleep(300)
  const body = await page.evaluate(() => document.body.innerText)
  if (!body.includes(text)) throw new Error(`"${text}" no está en la página`)
}

async function findRow(page, name) {
  for (let i = 0; i < 20; i++) {
    const done = await page.evaluate(t => {
      const sel = 'tr, a[href*="/paciente/"], a[href*="/doctor/"], a[href*="/inventario/"], a[href*="/empresa/"]'
      const row = Array.from(document.querySelectorAll(sel)).find(r => r.innerText.includes(t))
      if (!row) return false
      if (row.tagName === 'A') window.location.href = row.href
      else row.click()
      return true
    }, name)
    if (done) { await sleep(1000); return }
    await sleep(300)
  }
  throw new Error(`Fila "${name}" no encontrada`)
}

module.exports = {
  sleep,
  uniq,
  setInputValue,
  setInputByName,
  setSelectByLabel,
  clickBtn,
  confirmDelete,
  clickFab,
  pageContains,
  findRow,
}
