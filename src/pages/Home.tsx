import { useNavigate } from 'react-router-dom'
import { labels } from '../lib/labels'
import { pacienteStore, doctorStore, citaStore, inventarioStore, tareaStore } from '../lib/demoStore'
import { getModules } from '../lib/modules'
import { getKanbanColumns } from '../lib/kanban'

const citasHoy = [
  { id: 1, paciente: 'Juan Pérez', doctor: 'Dr. García', hora: '09:00' },
  { id: 2, paciente: 'María López', doctor: 'Dr. García', hora: '10:30' },
  { id: 3, paciente: 'Ana Torres', doctor: 'Dra. Sánchez', hora: '11:00' },
  { id: 4, paciente: 'Roberto Díaz', doctor: 'Dra. Gómez', hora: '14:00' },
]

const actividadReciente = [
  { id: 1, texto: 'Juan Pérez agendó cita', tiempo: 'Hace 5 min' },
  { id: 2, texto: 'Dra. Gómez actualizó expediente', tiempo: 'Hace 20 min' },
  { id: 3, texto: 'Nuevo paciente: Fernando Ruiz', tiempo: 'Hace 1 hora' },
  { id: 4, texto: 'Laura Mendoza canceló cita', tiempo: 'Hace 2 horas' },
]

const mensajesSinLeer = 3

function toLocalDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCitasPorSemana() {
  const diasLabel = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const days: { fecha: string; dia: string }[] = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push({ fecha: toLocalDate(d), dia: diasLabel[d.getDay()] })
  }
  const from = days[0].fecha
  const to = days[days.length - 1].fecha
  const citas = citaStore.getByDateRange(from, to)
  return days.map(({ fecha, dia }) => ({
    dia,
    count: citas.filter(c => c.fecha === fecha).length,
  }))
}

export default function Home() {
  const navigate = useNavigate()
  const modules = getModules()
  const totalPacientes = pacienteStore.getAll().length
  const totalDoctores = doctorStore.getAll().length
  const totalInventario = inventarioStore.getAll().length
  const tareasPendientes = tareaStore.getAll().filter(t => t.estado !== getKanbanColumns().slice(-1)[0]).length
  const citasPorSemana = getCitasPorSemana()
  const maxCitas = Math.max(...citasPorSemana.map(d => d.count), 1)

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Contadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div onClick={() => navigate('/paciente')} className="cursor-pointer p-4 rounded-xl bg-katt-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800 hover:border-katt-500 transition-colors">
          <p className="text-2xl font-bold text-katt-600 dark:text-katt-300">{totalPacientes}</p>
          <p className="text-xs text-gray-500">{labels.paciente}s</p>
        </div>
        <div onClick={() => navigate('/doctor')} className="cursor-pointer p-4 rounded-xl bg-katt-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800 hover:border-katt-500 transition-colors">
          <p className="text-2xl font-bold text-katt-600 dark:text-katt-300">{totalDoctores}</p>
          <p className="text-xs text-gray-500">{labels.doctor}es</p>
        </div>
        {modules.agenda && <div onClick={() => navigate('/agenda')} className="cursor-pointer p-4 rounded-xl bg-katt-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800 hover:border-katt-500 transition-colors">
          <p className="text-2xl font-bold text-katt-600 dark:text-katt-300">{citasHoy.length}</p>
          <p className="text-xs text-gray-500">Citas hoy</p>
        </div>}
        {modules.chat && <div onClick={() => navigate('/chat')} className="cursor-pointer p-4 rounded-xl bg-katt-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800 hover:border-katt-500 transition-colors">
          <p className="text-2xl font-bold text-katt-600 dark:text-katt-300">{mensajesSinLeer}</p>
          <p className="text-xs text-gray-500">Mensajes sin leer</p>
        </div>}
        {modules.inventario && <div onClick={() => navigate('/inventario')} className="cursor-pointer p-4 rounded-xl bg-katt-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800 hover:border-katt-500 transition-colors">
          <p className="text-2xl font-bold text-katt-600 dark:text-katt-300">{totalInventario}</p>
          <p className="text-xs text-gray-500">{labels.inventario}</p>
        </div>}
        {modules.tareas && <div onClick={() => navigate('/tareas')} className="cursor-pointer p-4 rounded-xl bg-katt-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800 hover:border-katt-500 transition-colors">
          <p className="text-2xl font-bold text-katt-600 dark:text-katt-300">{tareasPendientes}</p>
          <p className="text-xs text-gray-500">Tareas pendientes</p>
        </div>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Citas del día */}
        {modules.agenda && <div className="rounded-xl border border-katt-200 dark:border-katt-800 p-4 space-y-3">
          <h3 className="text-sm font-bold">Citas de hoy</h3>
          <div className="space-y-2">
            {citasHoy.map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{c.paciente}</p>
                  <p className="text-xs text-gray-500">{c.doctor}</p>
                </div>
                <span className="text-xs bg-katt-100 dark:bg-katt-800 px-2 py-1 rounded-full">{c.hora}</span>
              </div>
            ))}
          </div>
        </div>}

        {/* Gráfica citas por semana */}
        {modules.agenda && <div className="rounded-xl border border-katt-200 dark:border-katt-800 p-4 space-y-3">
          <h3 className="text-sm font-bold">Citas esta semana</h3>
          <div className="flex items-end gap-2 h-32">
            {citasPorSemana.map(d => (
              <div key={d.dia} className="flex-1 flex flex-col items-center h-full">
                <span className="text-xs text-gray-500">{d.count}</span>
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full rounded-t bg-katt-400 dark:bg-katt-500"
                    style={{ height: `${(d.count / maxCitas) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{d.dia}</span>
              </div>
            ))}
          </div>
        </div>}

        {/* Actividad reciente */}
        <div className="rounded-xl border border-katt-200 dark:border-katt-800 p-4 space-y-3">
          <h3 className="text-sm font-bold">Actividad reciente</h3>
          <div className="space-y-2">
            {actividadReciente.map(a => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span>{a.texto}</span>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{a.tiempo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tareas por estado */}
        {modules.tareas && <div className="rounded-xl border border-katt-200 dark:border-katt-800 p-4 space-y-3">
          <h3 className="text-sm font-bold">Tareas por estado</h3>
          <div className="space-y-2">
            {getKanbanColumns().map(col => {
              const count = tareaStore.getAll().filter(t => t.estado === col).length
              const total = tareaStore.getAll().length || 1
              return (
                <div key={col} className="flex items-center justify-between text-sm">
                  <span>{col}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-katt-100 dark:bg-katt-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-katt-500"
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-4">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>}

        {/* Pacientes por doctor */}
        <div className="rounded-xl border border-katt-200 dark:border-katt-800 p-4 space-y-3">
          <h3 className="text-sm font-bold">{labels.paciente}s por {labels.doctor.toLowerCase()}</h3>
          <div className="space-y-2">
            {doctorStore.getAll().map(d => {
              const count = pacienteStore.getAll().filter(p => p.doctor === d.nombre).length
              return (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span>{d.nombre}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-katt-100 dark:bg-katt-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-katt-500"
                        style={{ width: `${(count / totalPacientes) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-4">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
