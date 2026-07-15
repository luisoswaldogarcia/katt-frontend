import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { pacienteStore, citaStore, doctorStore } from '../lib/demoStore'
import type { CitaData } from '../lib/demoStore'

const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

function getCitaFutura(nombre: string): CitaData | undefined {
  const hoy = new Date().toISOString().split('T')[0]
  return citaStore.getByDateRange(hoy, '2099-12-31').find(c => c.paciente === nombre)
}

export default function ClienteCitas() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state: { ids: string[] } | null }
  const ids: string[] = state?.ids || []
  const pacientes = ids.map(id => pacienteStore.getById(id)).filter(Boolean)
  const doctores = doctorStore.getAll()

  const [ver, setVer] = useState(0)
  const [modal, setModal] = useState<string | null>(null)
  const [confirmCita, setConfirmCita] = useState<CitaData | null>(null)
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('09:00')
  const [motivo, setMotivo] = useState('')
  const [doctor, setDoctor] = useState('')

  function openModal(id: string) {
    setModal(id)
    setFecha('')
    setHora('09:00')
    setMotivo('')
    setDoctor('')
  }

  function crearCita() {
    if (!modal || !fecha || !hora || !motivo) return
    const pac = pacienteStore.getById(modal)
    if (!pac) return
    citaStore.create({ paciente: pac.nombre, doctor: doctor || pac.doctor, fecha, hora, motivo })
    setModal(null)
    setVer(v => v + 1)
  }

  function confirmarEliminar() {
    if (!confirmCita) return
    citaStore.remove(confirmCita.id)
    setConfirmCita(null)
    setVer(v => v + 1)
  }

  if (pacientes.length === 0) {
    navigate('/paciente')
    return null
  }

  void ver

  return (
    <div className="p-4 h-full overflow-y-auto space-y-3">
      {pacientes.map(pac => {
        if (!pac) return null
        const cita = getCitaFutura(pac.nombre)

        return (
          <div key={pac.id} className="rounded-lg border border-katt-200 dark:border-katt-800 bg-white/40 dark:bg-katt-900/40 backdrop-blur-xl p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-katt-500 truncate">{pac.nombre}</p>
              {cita ? (
                <p className="text-xs text-gray-600 dark:text-gray-400">{cita.fecha} · {cita.hora} — {cita.motivo}</p>
              ) : (
                <p className="text-xs text-gray-400">Sin cita futura</p>
              )}
            </div>
            {cita ? (
              <button type="button" onClick={() => setConfirmCita(cita)} className="shrink-0 px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors">
                Cancelar
              </button>
            ) : (
              <button type="button" onClick={() => openModal(pac.id!)} className="shrink-0 p-2 rounded-lg hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-katt-500"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              </button>
            )}
          </div>
        )
      })}

      {/* Modal confirmar cancelación */}
      {confirmCita && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setConfirmCita(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-katt-900 border border-katt-200 dark:border-katt-800 p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-red-500">¿Cancelar esta cita?</p>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Doctor:</span> {confirmCita.doctor}</p>
              <p><span className="font-medium">Fecha:</span> {confirmCita.fecha} · {confirmCita.hora}</p>
              <p><span className="font-medium">Motivo:</span> {confirmCita.motivo}</p>
            </div>
            <p className="text-xs text-gray-500">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirmCita(null)} className="flex-1 px-4 py-2 rounded-lg border border-katt-200 dark:border-katt-700 text-sm font-medium transition-colors hover:bg-katt-100 dark:hover:bg-katt-800">No</button>
              <button type="button" onClick={confirmarEliminar} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal agendar cita */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-katt-900 border border-katt-200 dark:border-katt-800 p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold">Agendar cita — {pacienteStore.getById(modal!)?.nombre}</p>
            <div className="space-y-3">
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required className={inputClass} />
              <input type="time" value={hora} onChange={e => setHora(e.target.value)} required className={inputClass} />
              <select value={doctor} onChange={e => setDoctor(e.target.value)} className={inputClass}>
                <option value="">Doctor asignado</option>
                {doctores.map(d => <option key={d.id} value={d.nombre}>{d.nombre}</option>)}
              </select>
              <input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Motivo" required className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2 rounded-lg border border-katt-200 dark:border-katt-700 text-sm font-medium transition-colors hover:bg-katt-100 dark:hover:bg-katt-800">Cancelar</button>
              <button type="button" onClick={crearCita} className="flex-1 px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">Agendar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
