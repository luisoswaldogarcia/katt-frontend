import { Fragment, useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react'
import { citaStore, pacienteStore, doctorStore, bloqueoStore } from '../lib/demoStore'
import type { CitaData } from '../lib/demoStore'
import { doctorColor } from '../lib/doctorColor'
import { getConfig } from '../lib/configApi'
import { labels } from '../lib/labels'
import { ConfirmModal } from '../components/ConfirmModal'

type View = 'dia' | 'semana' | 'mes'

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day))
  date.setHours(0, 0, 0, 0)
  return date
}

function getMonthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function getDaysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

function normText(s: string): string {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()
}

const toMin = (hora: string) => Number(String(hora).slice(0, 2)) * 60 + Number(String(hora).slice(3, 5))
const hhmm = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

// Aviso de choque de horario o día bloqueado (devuelve '' si es válida)
function conflictoDe(fd: FormData, excluirId?: string): string {
  const doctor = String(fd.get('doctor') || '')
  const fecha = String(fd.get('fecha') || '')
  const hora = String(fd.get('hora') || '')
  const dur = Number(fd.get('duracion') || 30)
  if (!doctor || !fecha || !hora) return ''
  const bloq = bloqueoStore.getAll().find(b => b.fecha === fecha && (!b.doctor || b.doctor === doctor))
  if (bloq) return `⚠ El doctor ${doctor} tiene el día bloqueado${bloq.motivo ? ` (${bloq.motivo})` : ''}`
  const ini = toMin(hora)
  const fin = ini + (dur > 0 ? dur : 30)
  for (const c of citaStore.getByDateRange(fecha, fecha)) {
    if (excluirId && c.id === excluirId) continue
    if (c.doctor && c.doctor !== doctor) continue
    const ci = toMin(c.hora)
    const cf = ci + (c.duracion && c.duracion > 0 ? c.duracion : 30)
    if (ini < cf && ci < fin) {
      return `⚠ ${doctor} ya tiene una cita de ${c.hora} a ${c.horaFin || hhmm(cf)} con ${c.paciente || 'un paciente'} — no se pueden poner citas a la misma hora`
    }
  }
  return ''
}

type Orden = 'doctor' | 'hora'

// Orden de las citas dentro de un día: por doctor y luego hora, u hora directa
function ordenarCitas(citas: CitaData[], orden: Orden): CitaData[] {
  return [...citas].sort((a, b) => {
    if (orden === 'doctor') {
      const d = String(a.doctor || '').localeCompare(String(b.doctor || ''), 'es')
      if (d !== 0) return d
    }
    return toMin(a.hora) - toMin(b.hora)
  })
}

const inputClass = 'w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500'

function Autocomplete({ name, placeholder, options, defaultValue }: { name: string; placeholder: string; options: string[]; defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue || '')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const q = normText(query)
  const tokens = q.split(' ').filter(Boolean)
  const filtered = (q.length > 0
    ? options.filter(o => {
        const n = normText(o)
        return n.includes(q) || (tokens.length > 0 && tokens.every(t => n.includes(t)))
      })
    : options
  ).slice(0, 6)

  return (
    <div ref={ref} className="relative">
      <input
        name={name}
        required
        placeholder={placeholder}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={inputClass}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-katt-200 dark:border-katt-700 bg-white dark:bg-katt-900 shadow-lg max-h-40 overflow-y-auto">
          {filtered.map(opt => (
            <button
              key={opt}
              type="button"
              onMouseDown={() => { setQuery(opt); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Agenda() {
  const [view, setView] = useState<View>('semana')
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selected, setSelected] = useState<CitaData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CitaData | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<CitaData | null>(null)

  const [refreshKey, forceUpdate] = useState(0)
  const [filtroDoctor, setFiltroDoctor] = useState('')
  const [aviso, setAviso] = useState('')
  const [errorForm, setErrorForm] = useState('')
  const [ubicaciones, setUbicaciones] = useState<string[]>([])
  const [showBloqueo, setShowBloqueo] = useState(false)
  const [orden, setOrden] = useState<Orden>('doctor')
  const [bloqueos, setBloqueos] = useState(bloqueoStore.getAll())
  const today = formatDate(new Date())

  useEffect(() => {
    getConfig<string[]>('ubicaciones', []).then(setUbicaciones).catch(() => {})
    bloqueoStore.fetch().then(() => setBloqueos(bloqueoStore.getAll())).catch(() => {})
  }, [])

  // Si el paciente escrito no existe en la base, se crea como "paciente nuevo"
  async function crearPacienteSiNoExiste(nombre: string) {
    const n = (nombre || '').trim()
    if (!n) return
    const existe = pacienteStore.getAll().some(p => normText(p.nombre || '') === normText(n))
    if (!existe) {
      await pacienteStore.create({ nombre: n, telefono: '', email: '', pendienteCompletar: true } as never)
    }
  }

  // Llevar el calendario a la fecha de una cita para que sea visible
  function irAFecha(fecha: string) {
    const [y, m, d] = (fecha || '').split('-').map(Number)
    if (y && m && d) setCurrentDate(new Date(y, m - 1, d))
  }

  // Opciones del filtro: doctores del módulo + los nombres que ya aparecen en citas
  const doctoresFiltro = useMemo(() => {
    void refreshKey // invalida la caché cuando cambian los datos
    const nombres = new Set<string>()
    for (const d of doctorStore.getAll()) if (d.nombre) nombres.add(d.nombre)
    for (const c of citaStore.getAll()) if (c.doctor) nombres.add(c.doctor)
    return [...nombres].sort((a, b) => a.localeCompare(b))
  }, [refreshKey])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const conf = conflictoDe(fd)
    if (conf) { setAviso(conf); return }
    setErrorForm('')
    try {
      await crearPacienteSiNoExiste(fd.get('paciente') as string)
      await citaStore.create({
        paciente: fd.get('paciente') as string,
        doctor: fd.get('doctor') as string,
        fecha: fd.get('fecha') as string,
        hora: fd.get('hora') as string,
        motivo: fd.get('motivo') as string,
        duracion: Number(fd.get('duracion') || 30),
        ubicacion: (fd.get('ubicacion') as string) || '',
      })
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'No se pudo guardar')
      return
    }
    setShowForm(false)
    forceUpdate(n => n + 1)
    irAFecha(fd.get('fecha') as string)
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editing) return
    const fd = new FormData(e.currentTarget)
    const conf = conflictoDe(fd, editing.id)
    if (conf) { setAviso(conf); return }
    setErrorForm('')
    try {
      await crearPacienteSiNoExiste(fd.get('paciente') as string)
      await citaStore.update(editing.id, {
        paciente: fd.get('paciente') as string,
        doctor: fd.get('doctor') as string,
        fecha: fd.get('fecha') as string,
        hora: fd.get('hora') as string,
        motivo: fd.get('motivo') as string,
        duracion: Number(fd.get('duracion') || 30),
        ubicacion: (fd.get('ubicacion') as string) || '',
      })
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'No se pudo guardar')
      return
    }
    setEditing(null)
    setSelected(null)
    forceUpdate(n => n + 1)
    irAFecha(fd.get('fecha') as string)
  }

  async function handleCancel(id: string) {
    await citaStore.remove(id)
    setSelected(null)
    setConfirmCancel(null)
    forceUpdate(n => n + 1)
  }

  function navigate(dir: -1 | 1) {
    const d = new Date(currentDate)
    if (view === 'dia') d.setDate(d.getDate() + dir)
    else if (view === 'semana') d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setCurrentDate(d)
  }

  function goToday() {
    setCurrentDate(new Date())
  }

  const headerLabel = useMemo(() => {
    if (view === 'dia') return currentDate.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
    if (view === 'semana') {
      const mon = getMonday(currentDate)
      const sun = addDays(mon, 6)
      return `${mon.getDate()} - ${sun.getDate()} ${sun.toLocaleDateString('es', { month: 'long', year: 'numeric' })}`
    }
    return currentDate.toLocaleDateString('es', { month: 'long', year: 'numeric' })
  }, [view, currentDate])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Controls */}
      <div className="px-4 pt-4 pb-2 shrink-0 space-y-2">
        {/* Fila 1: fecha + filtro de doctor + Hoy */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 18l6-6-6-6" /></svg>
            </button>
            <span className="text-sm font-medium capitalize">{headerLabel}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              data-testid="agenda-filtro-doctor"
              value={filtroDoctor}
              onChange={e => setFiltroDoctor(e.target.value)}
              className="w-[7.5rem] truncate px-2 py-1.5 text-xs rounded-lg border border-katt-200 dark:border-katt-700 bg-white dark:bg-katt-900 focus:outline-none focus:ring-2 focus:ring-katt-500"
            >
              <option value="">Todos los doctores</option>
              {doctoresFiltro.map(nombre => <option key={nombre} value={nombre}>{nombre}</option>)}
            </select>
            <button onClick={goToday} className="px-3 py-1.5 text-xs rounded-lg bg-katt-500 hover:bg-katt-600 text-white font-medium transition-colors">
              Hoy
            </button>
          </div>
        </div>
        {/* Fila 2: vistas + orden + bloqueo (cada grupo salta de línea si no cabe) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-katt-200 dark:border-katt-700 overflow-hidden text-xs">
            {(['dia', 'semana', 'mes'] as View[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 capitalize transition-colors ${view === v ? 'bg-katt-500 text-white' : 'hover:bg-katt-100 dark:hover:bg-katt-800'}`}
              >
                {v === 'dia' ? 'Día' : v === 'semana' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
          <select
            data-testid="agenda-orden"
            value={orden}
            onChange={e => setOrden(e.target.value as Orden)}
            className="px-2 py-1.5 text-xs rounded-lg border border-katt-200 dark:border-katt-700 bg-white dark:bg-katt-900 focus:outline-none focus:ring-2 focus:ring-katt-500"
            title="Orden de las citas"
          >
            <option value="doctor">Por doctor</option>
            <option value="hora">Por hora</option>
          </select>
          <button
            onClick={() => { setAviso(''); setErrorForm(''); setShowBloqueo(true) }}
            className="px-3 py-1.5 text-xs rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Bloquear un día completo para un doctor"
          >
            Bloquear día
          </button>
        </div>
      </div>

      {/* Views */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {view === 'dia' && <div className="h-full overflow-y-auto px-4 pb-4"><DayView date={currentDate} today={today} onSelect={setSelected} filtroDoctor={filtroDoctor} refreshKey={refreshKey} orden={orden} /></div>}
        {view === 'semana' && <WeekView date={currentDate} today={today} onSelect={setSelected} filtroDoctor={filtroDoctor} refreshKey={refreshKey} orden={orden} />}
        {view === 'mes' && <div className="h-full overflow-y-auto px-4 pb-4"><MonthView date={currentDate} today={today} onDayClick={d => { setCurrentDate(d); setView('dia') }} filtroDoctor={filtroDoctor} refreshKey={refreshKey} /></div>}
      </div>

      {/* FAB agregar cita */}
      <button
        onClick={() => { setAviso(''); setErrorForm(''); setShowForm(true) }}
        onClickCapture={() => { pacienteStore.fetch().catch(() => {}); doctorStore.fetch().catch(() => {}) }}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-katt-500 hover:bg-katt-600 text-white shadow-lg flex items-center justify-center transition-colors z-40"
        aria-label="Nueva cita"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-katt-900 rounded-xl p-5 w-full max-w-sm space-y-4 border border-katt-200 dark:border-katt-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Nueva cita</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} onInput={e => setAviso(conflictoDe(new FormData(e.currentTarget)))} className="space-y-3">
              <Autocomplete name="paciente" placeholder={labels.paciente} options={pacienteStore.getAll().map(p => p.nombre)} />
              <Autocomplete name="doctor" placeholder={labels.doctor} options={doctorStore.getAll().map(d => d.nombre)} />
              <input name="fecha" type="date" required defaultValue={formatDate(currentDate)} className={inputClass} />
              <div className="flex gap-2">
                <input name="hora" type="time" required className={inputClass} />
                <select name="duracion" defaultValue="30" className={inputClass} title="Duración de la consulta">
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hora</option>
                  <option value="90">1.5 horas</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
              <select name="ubicacion" className={inputClass} defaultValue="">
                <option value="">Sin ubicación</option>
                {ubicaciones.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input name="motivo" placeholder="Motivo (opcional)" className={inputClass} />
              {aviso && <p data-testid="aviso-conflicto" className="text-xs rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-2">{aviso}</p>}
              {errorForm && <p data-testid="error-form" className="text-xs rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-3 py-2">{errorForm}</p>}
              <button type="submit" disabled={!!aviso} className="w-full px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && !editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-katt-900 rounded-xl p-5 w-full max-w-sm space-y-3 border border-katt-200 dark:border-katt-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Detalle de cita</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-katt-500 dark:text-katt-400">{labels.paciente}:</span> {selected.paciente}</div>
              <div><span className="text-katt-500 dark:text-katt-400">{labels.doctor}:</span> {selected.doctor}</div>
              <div><span className="text-katt-500 dark:text-katt-400">Fecha:</span> {selected.fecha}</div>
              <div><span className="text-katt-500 dark:text-katt-400">Hora:</span> {selected.hora}{selected.horaFin ? ` – ${selected.horaFin}` : ''}{selected.duracion ? ` (${selected.duracion} min)` : ''}</div>
              {selected.ubicacion && <div><span className="text-katt-500 dark:text-katt-400">Ubicación:</span> {selected.ubicacion}</div>}
              <div><span className="text-katt-500 dark:text-katt-400">Motivo:</span> {selected.motivo}</div>
            </div>
            {(() => {
              const pac = pacienteStore.getAll().find(p => normText(p.nombre || '') === normText(selected.paciente || ''))
              const incompleto = pac && (pac.pendienteCompletar === true || !pac.telefono || !pac.email)
              return incompleto ? (
                <button
                  data-testid="completar-registro"
                  onClick={() => navigate(`/paciente/editar/${pac.id}`)}
                  className="w-full px-4 py-2 rounded-lg border border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-sm font-medium transition-colors"
                >
                  Completar registro del paciente
                </button>
              ) : null
            })()}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setAviso(''); setErrorForm(''); setEditing(selected) }}
                className="flex-1 px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
              >
                Modificar
              </button>
              <button
                onClick={() => setConfirmCancel(selected)}
                className="flex-1 px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
              >
                Cancelar cita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white dark:bg-katt-900 rounded-xl p-5 w-full max-w-sm space-y-4 border border-katt-200 dark:border-katt-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Modificar cita</h3>
              <button onClick={() => setEditing(null)} className="p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEdit} onInput={e => setAviso(conflictoDe(new FormData(e.currentTarget), editing.id))} className="space-y-3">
              <Autocomplete name="paciente" placeholder={labels.paciente} options={pacienteStore.getAll().map(p => p.nombre)} defaultValue={editing.paciente} />
              <Autocomplete name="doctor" placeholder={labels.doctor} options={doctorStore.getAll().map(d => d.nombre)} defaultValue={editing.doctor} />
              <input name="fecha" type="date" required defaultValue={editing.fecha} className={inputClass} />
              <div className="flex gap-2">
                <input name="hora" type="time" required defaultValue={editing.hora} className={inputClass} />
                <select name="duracion" defaultValue={String(editing.duracion || 30)} className={inputClass} title="Duración de la consulta">
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hora</option>
                  <option value="90">1.5 horas</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
              <select name="ubicacion" className={inputClass} defaultValue={editing.ubicacion || ''}>
                <option value="">Sin ubicación</option>
                {ubicaciones.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input name="motivo" placeholder="Motivo (opcional)" defaultValue={editing.motivo} className={inputClass} />
              {aviso && <p data-testid="aviso-conflicto" className="text-xs rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-2">{aviso}</p>}
              {errorForm && <p data-testid="error-form" className="text-xs rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-3 py-2">{errorForm}</p>}
              <button type="submit" disabled={!!aviso} className="w-full px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
                Guardar cambios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bloquear día modal */}
      {showBloqueo && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowBloqueo(false)}>
          <div className="bg-white dark:bg-katt-900 rounded-xl p-5 w-full max-w-sm space-y-3 border border-katt-200 dark:border-katt-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Bloquear día</h3>
              <button onClick={() => setShowBloqueo(false)} className="p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <form
              data-testid="form-bloqueo"
              onSubmit={async e => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                await bloqueoStore.create({
                  fecha: fd.get('fecha') as string,
                  doctor: fd.get('doctor') as string,
                  motivo: fd.get('motivo') as string,
                } as never)
                setBloqueos(bloqueoStore.getAll())
                forceUpdate(n => n + 1)
                setShowBloqueo(false)
              }}
              className="space-y-3"
            >
              <Autocomplete name="doctor" placeholder={labels.doctor} options={doctorStore.getAll().map(d => d.nombre)} />
              <input name="fecha" type="date" required defaultValue={formatDate(currentDate)} className={inputClass} />
              <input name="motivo" placeholder="Motivo (opcional)" className={inputClass} />
              <button type="submit" className="w-full px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
                Bloquear día
              </button>
            </form>
            {bloqueos.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-katt-100 dark:border-katt-800">
                <p className="text-xs font-medium text-katt-500 dark:text-katt-400">Días bloqueados</p>
                {bloqueos.map(b => (
                  <div key={b.id} className="flex items-center justify-between gap-2 text-xs text-katt-600 dark:text-katt-300">
                    <span className="truncate">{b.fecha} · {b.doctor || 'Todos los doctores'}{b.motivo ? ` · ${b.motivo}` : ''}</span>
                    <button
                      onClick={async () => {
                        await bloqueoStore.remove(b.id)
                        setBloqueos(bloqueoStore.getAll())
                        forceUpdate(n => n + 1)
                      }}
                      className="text-red-500 hover:underline shrink-0"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {confirmCancel && (
        <ConfirmModal
          message={`¿Cancelar la cita de ${confirmCancel.paciente}? Esta acción no se puede deshacer.`}
          onConfirm={() => handleCancel(confirmCancel.id)}
          onCancel={() => setConfirmCancel(null)}
        />
      )}
    </div>
  )
}

/* ─── Day View ─── */

function DayView({ date, today, onSelect, filtroDoctor, refreshKey, orden = 'doctor' }: { date: Date; today: string; onSelect: (c: CitaData) => void; filtroDoctor?: string; refreshKey?: number; orden?: Orden }) {
  const key = formatDate(date)
  const citas = useMemo(
    () => { void refreshKey; return citaStore.getByDateRange(key, key).filter(c => !filtroDoctor || c.doctor === filtroDoctor) },
    [key, filtroDoctor, refreshKey]
  )
  const isToday = key === today

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isToday ? 'border-katt-500' : 'border-katt-200 dark:border-katt-800'}`}>
      <div className="text-sm font-medium text-katt-500 dark:text-katt-400">
        {citas.length} cita{citas.length !== 1 && 's'}
      </div>
      {bloqueoStore.getAll().filter(b => b.fecha === key && (!filtroDoctor || !b.doctor || b.doctor === filtroDoctor)).map(b => (
        <div key={b.id} className="px-2 py-1 text-[11px] rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 inline-block">
          Bloqueado{b.doctor ? `: ${b.doctor}` : ''}{b.motivo ? ` · ${b.motivo}` : ''}
        </div>
      ))}
      {citas.length === 0 && <div className="text-sm text-katt-400 dark:text-katt-600 py-8 text-center">Sin citas para este día</div>}
      <div className="space-y-2">
        {ordenarCitas(citas, orden).map((c, i, arr) => (
          <Fragment key={c.id}>
            {orden === 'doctor' && (i === 0 || arr[i - 1].doctor !== c.doctor) && (
              <div data-testid="agenda-grupo-doctor" className="flex items-center gap-2 pt-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: doctorColor(c.doctor).dot }} />
                <span className="text-xs font-semibold text-katt-500 dark:text-katt-400">{c.doctor || 'Sin doctor'}</span>
              </div>
            )}
          <button
            data-testid="agenda-cita"
            onClick={() => onSelect(c)}
            className="w-full text-left p-3 rounded-lg bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700 transition-colors flex items-center gap-3 border-l-4"
            style={{ borderLeftColor: doctorColor(c.doctor).dot }}
          >
            <div className="text-xs font-bold text-katt-500 dark:text-katt-400 w-16 shrink-0">{c.hora}{c.horaFin ? `–${c.horaFin}` : ''}</div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{c.paciente}</div>
              <div className="text-xs text-katt-500 dark:text-katt-400 truncate">{c.doctor}{c.motivo ? ` · ${c.motivo}` : ''}</div>
            </div>
          </button>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

/* ─── Week View ─── */
// Agenda vertical tipo Outlook: Lunes arriba con sus citas, luego Martes, etc.
// Scroll infinito en ambos sentidos: al acercarse a los extremos carga más semanas.

function WeekView({ date, today, onSelect, filtroDoctor, refreshKey, orden = 'doctor' }: { date: Date; today: string; onSelect: (c: CitaData) => void; filtroDoctor?: string; refreshKey?: number; orden?: Orden }) {
  const anchorMonday = useMemo(() => getMonday(date), [date])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [pastWeeks, setPastWeeks] = useState(0)
  const [futureWeeks, setFutureWeeks] = useState(1)
  const heightRef = useRef<number | null>(null)
  const busyRef = useRef(false)

  // Reiniciar la ventana al cambiar de semana (flechas / Hoy)
  useEffect(() => {
    setPastWeeks(0)
    setFutureWeeks(1)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [anchorMonday])

  // Compensar la posición del scroll al insertar días arriba
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && heightRef.current !== null) {
      el.scrollTop += el.scrollHeight - heightRef.current
      heightRef.current = null
      busyRef.current = false
    }
  })

  const days = useMemo(() => {
    const list: Date[] = []
    const start = addDays(anchorMonday, -pastWeeks * 7)
    const total = (pastWeeks + futureWeeks) * 7
    for (let i = 0; i < total; i++) list.push(addDays(start, i))
    return list
  }, [anchorMonday, pastWeeks, futureWeeks])

  const citasByDay = useMemo(() => {
    void refreshKey // invalida la caché cuando cambian los datos
    const map: Record<string, CitaData[]> = {}
    if (days.length) {
      for (const c of citaStore.getByDateRange(formatDate(days[0]), formatDate(days[days.length - 1]))) {
        if (filtroDoctor && c.doctor !== filtroDoctor) continue
        if (!map[c.fecha]) map[c.fecha] = []
        map[c.fecha].push(c)
      }
    }
    return map
  }, [days, filtroDoctor, refreshKey])

  function onScroll() {
    const el = scrollRef.current
    if (!el || busyRef.current) return
    if (el.scrollTop < 300) {
      busyRef.current = true
      heightRef.current = el.scrollHeight
      setPastWeeks(w => w + 1)
    } else if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
      setFutureWeeks(w => w + 1)
    }
  }

  return (
    <div ref={scrollRef} onScroll={onScroll} data-testid="agenda-week" className="h-full overflow-y-auto px-4 pb-6">
      {days.map(d => {
        const key = formatDate(d)
        const isToday = key === today
        const dayCitas = ordenarCitas(citasByDay[key] || [], orden)
        return (
          <div key={key} data-testid="agenda-day" className="pt-2 first:pt-0">
            {/* Encabezado del día (sticky) */}
            <div className="sticky top-0 z-10 flex items-center gap-3 py-2 bg-white dark:bg-katt-950">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${isToday ? 'bg-katt-500 text-white' : 'bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300'}`}>
                {d.getDate()}
              </div>
              <div className="min-w-0">
                {(() => {
                  const bloqs = bloqueoStore.getAll().filter(b => b.fecha === key && (!filtroDoctor || !b.doctor || b.doctor === filtroDoctor))
                  return bloqs.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {bloqs.map(b => (
                        <span key={b.id} className="px-2 py-0.5 text-[10px] rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300">
                          Bloqueado{b.doctor ? `: ${b.doctor}` : ''}{b.motivo ? ` · ${b.motivo}` : ''}
                        </span>
                      ))}
                    </div>
                  ) : null
                })()}
                <div className="text-sm font-semibold capitalize">
                  {d.toLocaleDateString('es', { weekday: 'long' })}
                  <span className="ml-2 text-xs font-normal text-katt-500 dark:text-katt-400">{d.toLocaleDateString('es', { month: 'long' })}</span>
                </div>
                <div className="text-xs text-katt-500 dark:text-katt-400">
                  {isToday ? 'Hoy · ' : ''}{dayCitas.length} cita{dayCitas.length !== 1 && 's'}
                </div>
              </div>
            </div>
            {/* Citas del día */}
            {dayCitas.length === 0 ? (
              <div className="text-xs text-katt-400 dark:text-katt-600 py-2 pl-14">Sin citas</div>
            ) : (
              <div className="space-y-2 py-1 pl-14">
                {dayCitas.map((c, i, arr) => (
                  <Fragment key={c.id}>
                    {orden === 'doctor' && (i === 0 || arr[i - 1].doctor !== c.doctor) && (
                      <div data-testid="agenda-grupo-doctor" className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: doctorColor(c.doctor).dot }} />
                        <span className="text-xs font-semibold text-katt-500 dark:text-katt-400">{c.doctor || 'Sin doctor'}</span>
                      </div>
                    )}
                  <button
                    data-testid="agenda-cita"
                    onClick={() => onSelect(c)}
                    className="w-full text-left p-3 rounded-lg bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700 transition-colors flex items-center gap-3 border-l-4"
                    style={{ borderLeftColor: doctorColor(c.doctor).dot }}
                  >
                    <div className="text-xs font-bold text-katt-500 dark:text-katt-400 w-16 shrink-0">{c.hora}{c.horaFin ? `–${c.horaFin}` : ''}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{c.paciente}</div>
                      <div className="text-xs text-katt-500 dark:text-katt-400 truncate">{c.doctor}{c.motivo ? ` · ${c.motivo}` : ''}</div>
                    </div>
                  </button>
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Month View ─── */

function MonthView({ date, today, onDayClick, filtroDoctor, refreshKey }: { date: Date; today: string; onDayClick: (d: Date) => void; filtroDoctor?: string; refreshKey?: number }) {
  const monthStart = getMonthStart(date)
  const daysInMonth = getDaysInMonth(date)
  const startDow = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 // monday=0

  const from = formatDate(monthStart)
  const to = formatDate(new Date(date.getFullYear(), date.getMonth(), daysInMonth))
  const citas = useMemo(
    () => { void refreshKey; return citaStore.getByDateRange(from, to).filter(c => !filtroDoctor || c.doctor === filtroDoctor) },
    [from, to, filtroDoctor, refreshKey]
  )

  const citasMap = useMemo(() => {
    const map: Record<string, CitaData[]> = {}
    for (const c of citas) {
      if (!map[c.fecha]) map[c.fecha] = []
      map[c.fecha].push(c)
    }
    return map
  }, [citas])

  const cells: (number | null)[] = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-katt-500 dark:text-katt-400 font-medium">
        {DAY_NAMES.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />
          const key = formatDate(new Date(date.getFullYear(), date.getMonth(), day))
          const isToday = key === today
          const count = citasMap[key]?.length || 0

          return (
            <button
              key={i}
              onClick={() => onDayClick(new Date(date.getFullYear(), date.getMonth(), day))}
              className={`p-2 rounded-lg text-center transition-colors ${isToday ? 'bg-katt-500 text-white' : 'hover:bg-katt-100 dark:hover:bg-katt-800'}`}
            >
              <div className="text-sm font-medium">{day}</div>
              {count > 0 && (
                <div className={`text-[10px] ${isToday ? 'text-katt-100' : 'text-katt-500 dark:text-katt-400'}`}>
                  {count} cita{count > 1 && 's'}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
