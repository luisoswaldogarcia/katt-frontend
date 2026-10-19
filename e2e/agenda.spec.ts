import { test, expect } from 'playwright/test'
import { DEMO_EMAIL, DEMO_PASSWORD, ts, uniq, login, navigateTo, setInputByName, clickFab } from './helpers'

test.describe('Agenda', () => {
  let page: import('playwright').Page
  const doctorUnico = `Doctor E2E ${ts}`
  const motivoCita = `Cita E2E ${uniq('cita')}`

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage({ ignoreHTTPSErrors: true })
    await login(page, DEMO_EMAIL, DEMO_PASSWORD)
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('CREATE — debe crear una cita y mostrarla en el calendario', async () => {
    await navigateTo(page, '/agenda')
    await page.waitForTimeout(1000)
    const fab = page.locator('button[aria-label="Nueva cita"]')
    if (await fab.count() > 0) {
      await fab.click()
    } else {
      await clickFab(page)
    }
    await page.waitForTimeout(800)
    await setInputByName(page, 'paciente', `Paciente E2E ${ts}`)
    await setInputByName(page, 'doctor', doctorUnico)
    await setInputByName(page, 'fecha', '2026-12-25')
    await setInputByName(page, 'hora', '10:00')
    await setInputByName(page, 'motivo', motivoCita)
    const guardarBtn = page.locator('button[type="submit"]').filter({ hasText: 'Guardar' })
    if (await guardarBtn.count() > 0) {
      await guardarBtn.click()
    } else {
      await page.locator('button').filter({ hasText: 'Guardar' }).first().click()
    }
    // El calendario debe saltar a la fecha y mostrar la nueva cita
    await expect(page.locator('[data-testid="agenda-week"]')).toContainText(motivoCita, { timeout: 10_000 })
  })

  test('el motivo es opcional: la cita se crea sin él', async () => {
    await navigateTo(page, '/agenda')
    await page.waitForTimeout(800)
    await page.locator('button[aria-label="Nueva cita"]').click()
    await page.waitForTimeout(800)
    await setInputByName(page, 'paciente', `Paciente SinMotivo ${ts}`)
    await setInputByName(page, 'doctor', `Doctor SinMotivo ${ts}`)
    await setInputByName(page, 'hora', '16:00')
    await page.locator('button[type="submit"]').filter({ hasText: 'Guardar' }).click()
    await expect(page.locator('[data-testid="agenda-week"]')).toContainText(`Paciente SinMotivo ${ts}`, { timeout: 10_000 })
  })

  test('cita: autocomplete de pacientes y alta de paciente nuevo', async () => {
    await navigateTo(page, '/agenda')
    await page.locator('button[aria-label="Nueva cita"]').click()
    await page.waitForTimeout(1000)

    // El autocomplete sugiere desde la base (coincidencia difusa del paciente creado antes)
    const pacInput = page.locator('input[name="paciente"]')
    // query única por corrida (minúsculas: valida la búsqueda difusa sin acentos/mayúsculas)
    await pacInput.fill(`paciente e2e ${ts}`)
    await expect(page.locator('button').filter({ hasText: `Paciente E2E ${ts}` }).first()).toBeVisible({ timeout: 5_000 })
    await page.locator('div.fixed.inset-0').first().click({ position: { x: 5, y: 5 } })
    await page.waitForTimeout(500)

    // Los pacientes con info incompleta salen como "Paciente nuevo" y hasta arriba
    await navigateTo(page, '/paciente')
    const primeraFila = page.locator('table tbody tr').first()
    await expect(primeraFila).toContainText('Paciente nuevo', { timeout: 8_000 })
    await expect(page.locator('table tbody tr').filter({ hasText: `Paciente E2E ${ts}` }).first()).toContainText('Paciente nuevo')
  })

  test('duración, choque de horario y días bloqueados', async () => {
    const doctor = `Doctor Choque ${ts}`
    const fecha = '2026-11-10'
    await navigateTo(page, '/agenda')
    await page.waitForTimeout(800)

    // Cita de 60 min → la fila muestra la hora fin
    await page.locator('button[aria-label="Nueva cita"]').click()
    await page.waitForTimeout(800)
    await setInputByName(page, 'paciente', `Paciente Choque ${ts}`)
    await setInputByName(page, 'doctor', doctor)
    await setInputByName(page, 'fecha', fecha)
    await setInputByName(page, 'hora', '10:00')
    await page.locator('select[name="duracion"]').selectOption('60')
    await page.locator('button[type="submit"]').filter({ hasText: 'Guardar' }).click()
    await expect(page.locator('[data-testid="agenda-week"]')).toContainText(`Paciente Choque ${ts}`, { timeout: 10_000 })

    // Segunda cita solapada → aviso y botón deshabilitado
    await page.locator('button[aria-label="Nueva cita"]').click()
    await page.waitForTimeout(800)
    await setInputByName(page, 'paciente', `Paciente Solape ${ts}`)
    await setInputByName(page, 'doctor', doctor)
    await setInputByName(page, 'fecha', fecha)
    await setInputByName(page, 'hora', '10:15')
    const aviso = page.getByTestId('aviso-conflicto')
    await expect(aviso).toBeVisible({ timeout: 5_000 })
    await expect(aviso).toContainText('ya tiene una cita')
    await expect(page.locator('button[type="submit"]').filter({ hasText: 'Guardar' })).toBeDisabled()
    await page.locator('div.fixed.inset-0').first().click({ position: { x: 5, y: 5 } })
    await page.waitForTimeout(400)

    // Bloquear un día completo para un doctor → nueva cita rechazada con aviso
    await page.locator('button', { hasText: 'Bloquear día' }).click()
    await page.waitForTimeout(500)
    await setInputByName(page, 'doctor', doctor)
    await setInputByName(page, 'fecha', '2026-11-11')
    await setInputByName(page, 'motivo', `Congreso ${ts}`)
    await page.getByTestId('form-bloqueo').locator('button[type="submit"]').click()
    await page.waitForTimeout(1200)

    await page.locator('button[aria-label="Nueva cita"]').click()
    await page.waitForTimeout(800)
    await setInputByName(page, 'paciente', `Paciente Bloqueado ${ts}`)
    await setInputByName(page, 'doctor', doctor)
    await setInputByName(page, 'fecha', '2026-11-11')
    await setInputByName(page, 'hora', '09:00')
    await expect(page.getByTestId('aviso-conflicto')).toContainText('bloqueado', { timeout: 5_000 })
  })

  test('filtro por doctor muestra solo las citas de ese doctor', async () => {
    await navigateTo(page, '/agenda')
    await page.waitForTimeout(1000)

    // Cita de HOY con un doctor único (para que quede en la semana visible)
    const motivoFiltro = `Cita Filtro ${uniq('f')}`
    const doctorFiltro = `Doctor Filtro ${ts}`
    const fab = page.locator('button[aria-label="Nueva cita"]')
    await fab.click()
    await page.waitForTimeout(800)
    await setInputByName(page, 'paciente', `Paciente Filtro ${ts}`)
    await setInputByName(page, 'doctor', doctorFiltro)
    await setInputByName(page, 'hora', '09:00')
    await setInputByName(page, 'motivo', motivoFiltro)
    await page.locator('button[type="submit"]').filter({ hasText: 'Guardar' }).click()
    await expect(page.locator('[data-testid="agenda-week"]')).toContainText(motivoFiltro, { timeout: 10_000 })

    // Filtrar por ese doctor: su cita sigue visible
    const filtro = page.locator('[data-testid="agenda-filtro-doctor"]')
    await expect(filtro).toBeVisible()
    await page.waitForTimeout(800)
    await filtro.selectOption(doctorFiltro)
    await expect(page.locator('[data-testid="agenda-week"]')).toContainText(motivoFiltro)

    // Filtrar por otro doctor: la cita del primero desaparece
    await filtro.selectOption('Pacheco')
    await expect(page.locator('[data-testid="agenda-week"]')).not.toContainText(motivoFiltro)

    // "Todos los doctores" vuelve a mostrar todo
    await filtro.selectOption('')
    await expect(page.locator('[data-testid="agenda-week"]')).toContainText(motivoFiltro)
  })

  test('en móvil el selector de doctor no tapa el botón de vista mensual', async () => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/agenda')
    await page.waitForTimeout(2000)
    // El botón "Mes" cabe en pantalla
    const mes = page.getByRole('button', { name: 'Mes' })
    await expect(mes).toBeVisible()
    const mesBox = await mes.boundingBox()
    expect(mesBox!.x + mesBox!.width).toBeLessThanOrEqual(390)
    // Y el selector quedó compacto
    const selBox = await page.locator('[data-testid="agenda-filtro-doctor"]').boundingBox()
    expect(selBox!.width).toBeLessThan(130)
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('vista semanal vertical — Lunes arriba y scroll infinito', async () => {
    await navigateTo(page, '/agenda')
    const week = page.locator('[data-testid="agenda-week"]')
    await expect(week).toBeVisible({ timeout: 8_000 })
    const days = week.locator('[data-testid="agenda-day"]')

    // La semana arranca en Lunes y los días bajan en orden
    await expect(days).toHaveCount(7)
    expect((await days.first().innerText()).toLowerCase()).toContain('lunes')
    expect((await days.nth(1).innerText()).toLowerCase()).toContain('martes')
    expect((await days.nth(6).innerText()).toLowerCase()).toContain('domingo')

    // Scroll infinito hacia abajo: se cargan los días siguientes
    for (let i = 0; i < 6; i++) {
      await week.evaluate(el => { el.scrollTop = el.scrollHeight })
      await page.waitForTimeout(250)
    }
    expect(await days.count()).toBeGreaterThan(14)

    // Scroll infinito hacia arriba: se cargan días anteriores
    for (let i = 0; i < 8; i++) {
      await week.evaluate(el => { el.scrollTop = 0 })
      await page.waitForTimeout(250)
    }
    expect(await days.count()).toBeGreaterThan(21)
  })
})
