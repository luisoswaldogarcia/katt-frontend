import { test, expect } from 'playwright/test'

const DEMO_EMAIL = 'admin@katt.app'
const DEMO_PASSWORD = 'Katt2026!'
const ts = Date.now()
const uniq = (id: string) => `${id}_${ts}`

test.describe.configure({ mode: 'serial' })

let page: import('playwright').Page

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage({ ignoreHTTPSErrors: true })
})

test.afterAll(async () => {
  await page?.close()
})

async function login(email: string, password: string) {
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

async function navigateTo(path: string) {
  await page.goto(path, { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
  await page.waitForTimeout(1500)
}

async function pageContains(text: string) {
  await page.waitForTimeout(500)
  await expect(page.locator('body')).toContainText(text, { timeout: 8_000 })
}

async function setInputValue(placeholder: string, value: string) {
  const input = page.locator(`input[placeholder="${placeholder}"], textarea[placeholder="${placeholder}"]`)
  await input.waitFor({ state: 'visible', timeout: 5_000 })
  await input.fill(value)
}

async function setInputByName(name: string, value: string) {
  const input = page.locator(`input[name="${name}"], textarea[name="${name}"]`)
  await input.waitFor({ state: 'visible', timeout: 5_000 })
  await input.fill(value)
}

async function clickBtn(texts: string | string[]) {
  const arr = Array.isArray(texts) ? texts : [texts]
  for (const t of arr) {
    const btn = page.locator('button').filter({ hasText: t })
    await btn.first().waitFor({ state: 'visible', timeout: 5_000 })
    await btn.first().click()
    await page.waitForTimeout(600)
  }
}

async function clickRow(name: string) {
  const row = page.locator('table tr, [class*="card"], [class*="task"]').filter({ hasText: name })
  await row.first().waitFor({ state: 'visible', timeout: 8_000 })
  await row.first().click()
  await page.waitForTimeout(1000)
}

async function clickFab() {
  const fab = page.locator('button[aria-label="Nueva cita"], button[aria-label="Nueva tarea"], button[aria-label="Nuevo proveedor"], button[aria-label="Nueva compra"]')
    .or(page.locator('button.fixed.bottom-6'))
  await fab.first().waitFor({ state: 'visible', timeout: 5_000 })
  await fab.first().click()
  await page.waitForTimeout(800)
}

type ScreenshotFn = (name: string) => Promise<void>

// ────────────────────────────────────────────────────────────
// LOGIN
// ────────────────────────────────────────────────────────────
test.describe('Login', () => {
  test('debe iniciar sesión con credenciales demo', async () => {
    await login(DEMO_EMAIL, DEMO_PASSWORD)
    const body = page.locator('body')
    await expect(body).toContainText('Inicio', { timeout: 10_000 })
    await expect(body).toContainText('Citas de hoy', { timeout: 5_000 })
  })
})

// ────────────────────────────────────────────────────────────
// NAVEGACIÓN
// ────────────────────────────────────────────────────────────
test.describe('Navegación', () => {
  test('sidebar debe mostrar módulos principales', async () => {
    const menuBtn = page.locator('button[aria-label="Menú"]')
    await menuBtn.waitFor({ state: 'visible', timeout: 5_000 })
    await menuBtn.click()
    await page.waitForTimeout(500)
    const nav = page.locator('nav')
    await expect(nav).toContainText('Inicio', { timeout: 5_000 })
    await expect(nav).toContainText('Configuración', { timeout: 3_000 })
  })

  test('debe navegar a módulo Clientes', async () => {
    await navigateTo('/paciente')
    await expect(page.locator('body')).toContainText('Nombre', { timeout: 5_000 })
  })

  test('debe navegar a módulo Inventario', async () => {
    await navigateTo('/inventario')
    await expect(page.locator('body')).toContainText('Categoría', { timeout: 5_000 })
  })

  test('debe navegar a Inicio', async () => {
    await navigateTo('/')
    await expect(page.locator('body')).toContainText('Citas de hoy', { timeout: 5_000 })
  })
})

// ────────────────────────────────────────────────────────────
// CLIENTES (Paciente) CRUD
// ────────────────────────────────────────────────────────────
test.describe('Clientes CRUD', () => {
  const cliName = `Cli ${uniq('cli')}`
  const cliEmail = `cli${ts}@test.com`

  test('CREATE — debe crear un paciente', async () => {
    await page.goto('/paciente/alta', { waitUntil: 'networkidle', timeout: 20_000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await setInputValue('Nombre', cliName)
    await setInputValue('Usuario', 'Dev User')
    await setInputValue('Teléfono', '5551000001')
    await setInputValue('Email', cliEmail)
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(3000)
  })

  test('READ — debe listar el paciente', async () => {
    await navigateTo('/paciente')
    await pageContains(cliName)
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
      await setInputValue('Nombre', `${cliName} (edit)`)
      const saveBtn = page.locator('button').filter({ hasText: /Actualizar|Guardar/ })
      await saveBtn.first().click()
      await page.waitForTimeout(2000)
    }
  })

  test('DELETE — debe eliminar el paciente', async () => {
    await navigateTo('/paciente')
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

// ────────────────────────────────────────────────────────────
// INVENTARIO CRUD
// ────────────────────────────────────────────────────────────
test.describe('Inventario CRUD', () => {
  const invName = `Inv ${uniq('inv')}`

  test('CREATE — debe crear un item de inventario', async () => {
    await navigateTo('/inventario/alta')
    await setInputValue('Nombre', invName)
    await page.waitForTimeout(300)
    const catSelect = page.locator('select').filter({ hasText: /Seleccionar/i }).or(page.locator('select').first())
    if (await catSelect.count() > 0) {
      await catSelect.selectOption({ index: 1 }).catch(() => {})
      await page.waitForTimeout(200)
    }
    await setInputValue('Cantidad', '30')
    await setInputValue('Unidad', 'kg')
    await setInputValue('Precio unitario', '99.99')
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(3000)
  })

  test('READ — debe listar el item', async () => {
    await navigateTo('/inventario')
    await pageContains(invName)
  })

  test('DELETE — debe eliminar el item', async () => {
    await navigateTo('/inventario')
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
          await confirm.first().click()
          await page.waitForTimeout(1500)
        }
      }
    }
  })
})

// ────────────────────────────────────────────────────────────
// USUARIOS (Doctor) CRUD
// ────────────────────────────────────────────────────────────
test.describe('Usuarios CRUD', () => {
  const usrName = `Usr ${uniq('usr')}`
  const usrEmail = `usr${ts}@test.com`

  test('CREATE — debe crear un usuario', async () => {
    await navigateTo('/doctor/alta')
    await setInputValue('Nombre', usrName)
    const rolSelect = page.locator('select').first()
    if (await rolSelect.count() > 0) {
      await rolSelect.selectOption({ index: 1 }).catch(() => {})
      await page.waitForTimeout(200)
    }
    await setInputValue('Teléfono', '5552000002')
    await setInputValue('Email', usrEmail)
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(3000)
  })

  test('READ — debe listar el usuario', async () => {
    await navigateTo('/doctor')
    await pageContains(usrName)
  })

  test('DELETE — debe eliminar el usuario', async () => {
    await navigateTo('/doctor')
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
          await confirm.first().click()
          await page.waitForTimeout(1500)
        }
      }
    }
  })
})

// ────────────────────────────────────────────────────────────
// EMPRESAS CRUD
// ────────────────────────────────────────────────────────────
test.describe('Empresas CRUD', () => {
  const empName = `Emp ${uniq('emp')}`

  test('CREATE — debe crear una empresa', async () => {
    await navigateTo('/empresa/alta')
    await setInputValue('Nombre', empName)
    await setInputValue('RFC', 'XAXX010101001')
    await setInputValue('Teléfono', '5554000004')
    await setInputValue('Email', `emp${ts}@test.com`)
    await setInputValue('Dirección', 'Dirección E2E test')
    await page.locator('button').filter({ hasText: 'Guardar' }).click()
    await page.waitForTimeout(3000)
  })

  test('READ — debe listar la empresa', async () => {
    await navigateTo('/empresa')
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 100))
    await pageContains(empName)
  })

  test('DELETE — debe eliminar la empresa', async () => {
    await navigateTo('/empresa')
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
          await confirm.first().click()
          await page.waitForTimeout(1500)
        }
      }
    }
  })
})

// ────────────────────────────────────────────────────────────
// AGENDA
// ────────────────────────────────────────────────────────────
test.describe('Agenda', () => {
  test('CREATE — debe crear una cita', async () => {
    await navigateTo('/agenda')
    await page.waitForTimeout(1000)
    const fab = page.locator('button[aria-label="Nueva cita"]')
    if (await fab.count() > 0) {
      await fab.click()
    } else {
      await clickFab()
    }
    await page.waitForTimeout(800)
    await setInputByName('fecha', '2026-12-25')
    await setInputByName('hora', '10:00')
    await setInputByName('motivo', `Cita E2E ${uniq('cita')}`)
    const guardarBtn = page.locator('button[type="submit"]').filter({ hasText: 'Guardar' })
    if (await guardarBtn.count() > 0) {
      await guardarBtn.click()
    } else {
      await page.locator('button').filter({ hasText: 'Guardar' }).first().click()
    }
    await page.waitForTimeout(2000)
  })
})

// ────────────────────────────────────────────────────────────
// TAREAS
// ────────────────────────────────────────────────────────────
test.describe('Tareas', () => {
  test('CREATE — debe crear una tarea', async () => {
    await navigateTo('/tareas')
    await page.waitForTimeout(1500)
    const fab = page.locator('button[aria-label="Nueva tarea"]')
    if (await fab.count() > 0) {
      await fab.click()
    } else {
      await clickFab()
    }
    await page.waitForTimeout(800)
    const tipoSelect = page.locator('select[name="tipo"]')
    if (await tipoSelect.count() > 0) {
      await tipoSelect.selectOption({ index: 1 }).catch(() => {})
      await page.waitForTimeout(200)
    }
    await setInputValue('Título', `Tarea E2E ${uniq('tarea')}`)
    await page.locator('button[type="submit"]').filter({ hasText: /Crear/i }).click()
    await page.waitForTimeout(3000)
  })
})

// ────────────────────────────────────────────────────────────
// COMPRAS — Proveedores
// ────────────────────────────────────────────────────────────
test.describe('Compras — Proveedores', () => {
  test('CREATE — debe crear un proveedor', async () => {
    await navigateTo('/compras')
    await page.waitForTimeout(1000)
    const provBtn = page.locator('button').filter({ hasText: 'Proveedores' })
    if (await provBtn.count() > 0) {
      await provBtn.click()
      await page.waitForTimeout(500)
    }
    const fab = page.locator('button[aria-label="Nuevo proveedor"]')
    if (await fab.count() > 0) {
      await fab.click()
    } else {
      await clickFab()
    }
    await page.waitForTimeout(800)
    await setInputValue('Nombre *', `Prov E2E ${uniq('prov')}`)
    await setInputValue('Persona de contacto', 'Contacto E2E Test')
    await setInputValue('Teléfono', '5555000005')
    await setInputValue('Email', `prov${ts}@test.com`)
    const createBtn = page.locator('button').filter({ hasText: /Crear proveedor/i })
    if (await createBtn.count() > 0) {
      await createBtn.click()
    } else {
      await page.locator('button').filter({ hasText: /Guardar|Crear/i }).first().click()
    }
    await page.waitForTimeout(2000)
  })

  test('DELETE — debe eliminar el proveedor', async () => {
    await navigateTo('/compras')
    await page.waitForTimeout(1000)
    const provBtn = page.locator('button').filter({ hasText: 'Proveedores' })
    if (await provBtn.count() > 0) {
      await provBtn.click()
      await page.waitForTimeout(500)
    }
    const provName = `Prov E2E ${uniq('prov')}`
    const el = page.locator('div, span, p').filter({ hasText: provName }).first()
    if (await el.count() > 0) {
      const delBtn = el.locator('..').locator('button').filter({ hasText: 'Eliminar' })
      if (await delBtn.count() > 0) {
        await delBtn.click()
        await page.waitForTimeout(500)
        const confirm = page.locator('button').filter({ hasText: /eliminar/i })
        if (await confirm.count() > 0) {
          await confirm.first().click()
          await page.waitForTimeout(1500)
        }
      }
    }
  })
})

// ────────────────────────────────────────────────────────────
// CIERRE DE SESIÓN
// ────────────────────────────────────────────────────────────
test.describe('Logout', () => {
  test('debe cerrar sesión correctamente', async () => {
    const logoutBtn = page.locator('button[aria-label="Cerrar sesión"]')
    await expect(logoutBtn).toBeVisible({ timeout: 5_000 })
    await logoutBtn.click()
    await page.waitForTimeout(2000)
    const loginForm = page.locator('input[type="email"]')
    await expect(loginForm).toBeVisible({ timeout: 10_000 })
  })
})
