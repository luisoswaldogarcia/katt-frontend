import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react'
import { citaStore, pacienteStore, doctorStore } from '../lib/demoStore'
import type { CitaData } from '../lib/demoStore'
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

const inputClass = 'w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500'

function Autocomplete({ name, placeholder, options, defaultValue }: { name: string; placeholder: string; options: string[]; defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue || '')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = query.length > 0
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : []

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

  const [, forceUpdate] = useState(0)
  const today = formatDate(new Date())

  // ── Agente de citas (IA) ──
  const [agenteMsg, setAgenteMsg] = useState('')
  const [agenteBusy, setAgenteBusy] = useState(false)
  const [agenteCard, setAgenteCard] = useState<AgenteCitaCard | null>(null)
  const [contexto, setContexto] = useState<Record<string, unknown>>({})
  const [lastMsg, setLastMsg] = useState('')

  async function callAgente(msg: string, ctx: Record<string, unknown>) {
    setAgenteBusy(true)
    try {
      const { api } = await import('../lib/api')
      const res = await api.create<AgenteCitaCard>('agente/cita', { message: msg, contexto: ctx, hoy: formatDate(new Date()) })
      setAgenteCard(res)
      if (res.contexto) setContexto(res.contexto)
    } catch {
      setAgenteCard({ response: 'No pude contactar al agente. Intenta de nuevo.' })
    } finally {
      setAgenteBusy(false)
    }
  }

  function handleAgenteSend(e: React.FormEvent) {
    e.preventDefault()
    const msg = agenteMsg.trim()
    if (!msg || agenteBusy) return
    setAgenteMsg('')
    setLastMsg(msg)
    callAgente(msg, contexto)
  }

  async function elegirDelAgente(kind: 'paciente' | 'doctor', item: { id: string; nombre: string }) {
    const ctx = { ...contexto, [kind]: item }
    setContexto(ctx)
    await callAgente(lastMsg || 'continuar con la cita', ctx)
  }

  async function darDeAlta(kind: 'paciente' | 'doctor', nombre: string) {
    setAgenteBusy(true)
    try {
      const { api } = await import('../lib/api')
      if (kind === 'paciente') {
        const nuevo = await api.create<{ id: string; nombre: string }>('clientes', { nombre, pendienteCompletar: true })
        const ctx = { ...contexto, paciente: { id: nuevo.id, nombre: nuevo.nombre } }
        setContexto(ctx)
        await callAgente(lastMsg || 'continuar con la cita', ctx)
      } else {
        const nuevo = await api.create<{ id: string; nombre: string }>('usuarios', { nombre, rol: 'user', generateQr: true })
        const ctx = { ...contexto, doctor: { id: nuevo.id, nombre: nuevo.nombre } }
        setContexto(ctx)
        await callAgente(lastMsg || 'continuar con la cita', ctx)
      }
    } catch {
      setAgenteBusy(false)
      setAgenteCard({ response: 'No pude crear el registro. Revisa los permisos e intenta de nuevo.' })
    }
  }

  async function crearCitaDelAgente(cita: NonNullable<AgenteCitaCard['cita']>) {
    setAgenteBusy(true)
    try {
      await citaStore.create({
        paciente: cita.paciente.nombre,
        doctor: cita.doctor.nombre,
        fecha: cita.fecha,
        hora: cita.hora,
        motivo: cita.motivo || 'Consulta',
      })
      setAgenteCard({ action: 'cita_creada', response: `¡Cita creada! ${cita.paciente.nombre} con ${cita.doctor.nombre} el ${cita.fecha} a las ${cita.hora}.` })
      setContexto({})
      setLastMsg('')
      forceUpdate(n => n + 1)
    } catch {
      setAgenteCard({ response: 'No pude crear la cita. Intenta de nuevo.' })
    } finally {
      setAgenteBusy(false)
    }
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    citaStore.create({
      paciente: fd.get('paciente') as string,
      doctor: fd.get('doctor') as string,
      fecha: fd.get('fecha') as string,
      hora: fd.get('hora') as string,
      motivo: fd.get('motivo') as string,
    })
    setShowForm(false)
    forceUpdate(n => n + 1)
  }

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editing) return
    const fd = new FormData(e.currentTarget)
    citaStore.update(editing.id, {
      paciente: fd.get('paciente') as string,
      doctor: fd.get('doctor') as string,
      fecha: fd.get('fecha') as string,
      hora: fd.get('hora') as string,
      motivo: fd.get('motivo') as string,
    })
    setEditing(null)
    setSelected(null)
    forceUpdate(n => n + 1)
  }

  function handleCancel(id: string) {
    citaStore.remove(id)
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
      <div className="px-4 pt-4 pb-2 shrink-0 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 18l6-6-6-6" /></svg>
          </button>
          <span className="text-sm font-medium capitalize">{headerLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-3 py-1.5 text-xs rounded-lg bg-katt-500 hover:bg-katt-600 text-white font-medium transition-colors">
            Hoy
          </button>
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
        </div>
      </div>

      {/* Views */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {view === 'dia' && <div className="h-full overflow-y-auto px-4 pb-4"><DayView date={currentDate} today={today} onSelect={setSelected} /></div>}
        {view === 'semana' && <WeekView date={currentDate} today={today} onSelect={setSelected} />}
        {view === 'mes' && <div className="h-full overflow-y-auto px-4 pb-4"><MonthView date={currentDate} today={today} onDayClick={d => { setCurrentDate(d); setView('dia') }} /></div>}
      </div>

      {/* Agente de citas (IA) */}
      <div className="shrink-0 border-t border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-950 px-4 py-3 space-y-2">
        {agenteCard && (
          <div data-testid="agente-cita-respuesta" className="rounded-xl border border-katt-200 dark:border-katt-800 bg-katt-50 dark:bg-katt-900/50 p-3 space-y-2 max-h-64 overflow-y-auto text-sm">
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none">🐱</span>
              <p className="min-w-0">{agenteCard.response}</p>
            </div>

            {agenteCard.action === 'elegir_paciente' && agenteCard.pacientes && (
              <div className="flex flex-wrap gap-2 pl-7">
                {agenteCard.pacientes.map(p => (
                  <button
                    key={p.id}
                    data-testid="agente-cita-opcion"
                    disabled={agenteBusy}
                    onClick={() => elegirDelAgente('paciente', p)}
                    className="px-3 py-1.5 rounded-lg bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700 text-xs font-medium transition-colors"
                  >
                    {p.nombre}{p.telefono ? ` · ${p.telefono}` : ''}
                  </button>
                ))}
              </div>
            )}

            {agenteCard.action === 'elegir_doctor' && agenteCard.doctores && (
              <div className="flex flex-wrap gap-2 pl-7">
                {agenteCard.doctores.map(d => (
                  <button
                    key={d.id}
                    data-testid="agente-cita-opcion"
                    disabled={agenteBusy}
                    onClick={() => elegirDelAgente('doctor', d)}
                    className="px-3 py-1.5 rounded-lg bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700 text-xs font-medium transition-colors"
                  >
                    {d.nombre}{d.rol ? ` · ${d.rol}` : ''}
                  </button>
                ))}
              </div>
            )}

            {(agenteCard.action === 'alta_paciente' || agenteCard.action === 'alta_doctor') && agenteCard.sugerencia && (
              <div className="pl-7">
                <button
                  data-testid="agente-cita-alta"
                  disabled={agenteBusy}
                  onClick={() => darDeAlta(agenteCard.action === 'alta_paciente' ? 'paciente' : 'doctor', agenteCard.sugerencia!.nombre)}
                  className="px-3 py-1.5 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors"
                >
                  Dar de alta a {agenteCard.sugerencia.nombre}
                </button>
              </div>
            )}

            {agenteCard.action === 'confirmar_cita' && agenteCard.cita && (
              <div className="space-y-2 pl-7">
                <div className="text-xs text-katt-500 dark:text-katt-400">
                  {agenteCard.cita.paciente.nombre} · {agenteCard.cita.doctor.nombre} · {agenteCard.cita.fecha} {agenteCard.cita.hora}{agenteCard.cita.motivo ? ` · ${agenteCard.cita.motivo}` : ''}
                </div>
                <button
                  data-testid="agente-cita-crear"
                  disabled={agenteBusy}
                  onClick={() => crearCitaDelAgente(agenteCard.cita!)}
                  className="px-3 py-1.5 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors"
                >
                  Crear cita
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleAgenteSend} className="flex items-center gap-2">
          <input
            data-testid="agente-cita-input"
            value={agenteMsg}
            onChange={e => setAgenteMsg(e.target.value)}
            placeholder="Agenda una cita con el agente: “cita con la señora Rosa Robles y el doctor Pacheco el jueves a las 11”"
            className={inputClass}
            disabled={agenteBusy}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={agenteBusy || !agenteMsg.trim()}
            className="px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 disabled:opacity-50 text-white text-sm font-medium transition-colors shrink-0"
          >
            {agenteBusy ? 'Pensando…' : 'Enviar'}
          </button>
        </form>
      </div>

      {/* FAB agregar cita */}
      <button
        onClick={() => setShowForm(true)}
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
            <form onSubmit={handleCreate} className="space-y-3">
              <Autocomplete name="paciente" placeholder={labels.paciente} options={pacienteStore.getAll().map(p => p.nombre)} />
              <Autocomplete name="doctor" placeholder={labels.doctor} options={doctorStore.getAll().map(d => d.nombre)} />
              <input name="fecha" type="date" required defaultValue={formatDate(currentDate)} className={inputClass} />
              <input name="hora" type="time" required className={inputClass} />
              <input name="motivo" required placeholder="Motivo" className={inputClass} />
              <button type="submit" className="w-full px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">
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
              <div><span className="text-katt-500 dark:text-katt-400">Hora:</span> {selected.hora}</div>
              <div><span className="text-katt-500 dark:text-katt-400">Motivo:</span> {selected.motivo}</div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditing(selected)}
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
            <form onSubmit={handleEdit} className="space-y-3">
              <Autocomplete name="paciente" placeholder={labels.paciente} options={pacienteStore.getAll().map(p => p.nombre)} defaultValue={editing.paciente} />
              <Autocomplete name="doctor" placeholder={labels.doctor} options={doctorStore.getAll().map(d => d.nombre)} defaultValue={editing.doctor} />
              <input name="fecha" type="date" required defaultValue={editing.fecha} className={inputClass} />
              <input name="hora" type="time" required defaultValue={editing.hora} className={inputClass} />
              <input name="motivo" required placeholder="Motivo" defaultValue={editing.motivo} className={inputClass} />
              <button type="submit" className="w-full px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">
                Guardar cambios
              </button>
            </form>
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

function DayView({ date, today, onSelect }: { date: Date; today: string; onSelect: (c: CitaData) => void }) {
  const key = formatDate(date)
  const citas = useMemo(() => citaStore.getByDateRange(key, key), [key])
  const isToday = key === today

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isToday ? 'border-katt-500' : 'border-katt-200 dark:border-katt-800'}`}>
      <div className="text-sm font-medium text-katt-500 dark:text-katt-400">
        {citas.length} cita{citas.length !== 1 && 's'}
      </div>
      {citas.length === 0 && <div className="text-sm text-katt-400 dark:text-katt-600 py-8 text-center">Sin citas para este día</div>}
      <div className="space-y-2">
        {citas.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className="w-full text-left p-3 rounded-lg bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700 transition-colors flex items-center gap-3"
          >
            <div className="text-xs font-bold text-katt-500 dark:text-katt-400 w-12 shrink-0">{c.hora}</div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{c.paciente}</div>
              <div className="text-xs text-katt-500 dark:text-katt-400 truncate">{c.doctor} · {c.motivo}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Week View ─── */
// Agenda vertical tipo Outlook: Lunes arriba con sus citas, luego Martes, etc.
// Scroll infinito en ambos sentidos: al acercarse a los extremos carga más semanas.

function WeekView({ date, today, onSelect }: { date: Date; today: string; onSelect: (c: CitaData) => void }) {
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
    const map: Record<string, CitaData[]> = {}
    if (days.length) {
      for (const c of citaStore.getByDateRange(formatDate(days[0]), formatDate(days[days.length - 1]))) {
        if (!map[c.fecha]) map[c.fecha] = []
        map[c.fecha].push(c)
      }
    }
    return map
  }, [days])

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
        const dayCitas = citasByDay[key] || []
        return (
          <div key={key} data-testid="agenda-day" className="pt-2 first:pt-0">
            {/* Encabezado del día (sticky) */}
            <div className="sticky top-0 z-10 flex items-center gap-3 py-2 bg-white dark:bg-katt-950">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${isToday ? 'bg-katt-500 text-white' : 'bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300'}`}>
                {d.getDate()}
              </div>
              <div className="min-w-0">
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
                {dayCitas.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onSelect(c)}
                    className="w-full text-left p-3 rounded-lg bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700 transition-colors flex items-center gap-3"
                  >
                    <div className="text-xs font-bold text-katt-500 dark:text-katt-400 w-12 shrink-0">{c.hora}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{c.paciente}</div>
                      <div className="text-xs text-katt-500 dark:text-katt-400 truncate">{c.doctor} · {c.motivo}</div>
                    </div>
                  </button>
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

function MonthView({ date, today, onDayClick }: { date: Date; today: string; onDayClick: (d: Date) => void }) {
  const monthStart = getMonthStart(date)
  const daysInMonth = getDaysInMonth(date)
  const startDow = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 // monday=0

  const from = formatDate(monthStart)
  const to = formatDate(new Date(date.getFullYear(), date.getMonth(), daysInMonth))
  const citas = useMemo(() => citaStore.getByDateRange(from, to), [from, to])

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

/* ─── Agente de citas: contrato con POST /agente/cita ─── */

interface AgenteCitaCard {
  response: string
  action?: string
  pacientes?: { id: string; nombre: string; telefono?: string; email?: string }[]
  doctores?: { id: string; nombre: string; rol?: string }[]
  sugerencia?: { nombre: string }
  faltan?: string[]
  cita?: {
    paciente: { id?: string; nombre: string }
    doctor: { id?: string; nombre: string }
    fecha: string
    hora: string
    motivo?: string
  }
  contexto?: Record<string, unknown>
}
