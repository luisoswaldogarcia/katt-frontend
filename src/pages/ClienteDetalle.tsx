import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { labels } from '../lib/labels'
import { pacienteStore } from '../lib/demoStore'
import { DataDetail } from '../components/DataDetail'
import { Documents } from '../components/Documents'
import { getCustomFields } from '../lib/customFields'

interface Nota {
  contenido: string
  fecha: string
}

function NotaAccordion({ nota, onDelete }: { nota: Nota; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const preview = nota.contenido.split('\n')[0].slice(0, 40)
  const fecha = new Date(nota.fecha).toLocaleDateString()

  return (
    <div className="bg-katt-50 dark:bg-katt-800/40 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <div className="flex-1 min-w-0">
          <span className="text-sm truncate block">{preview}</span>
          <span className="text-[10px] text-gray-400">{fecha}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-sm whitespace-pre-wrap">{nota.contenido}</p>
          <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-500 transition-colors">Eliminar</button>
        </div>
      )}
    </div>
  )
}

function useNotas(pacienteId: string) {
  const key = `katt-notas-paciente-${pacienteId}`
  const [notas, setNotas] = useState<Nota[]>(() => JSON.parse(localStorage.getItem(key) || '[]'))

  function agregar(contenido: string) {
    const updated = [{ contenido, fecha: new Date().toISOString() }, ...notas]
    setNotas(updated)
    localStorage.setItem(key, JSON.stringify(updated))
  }

  function eliminar(index: number) {
    const updated = notas.filter((_, i) => i !== index)
    setNotas(updated)
    localStorage.setItem(key, JSON.stringify(updated))
  }

  return { notas, agregar, eliminar }
}

export default function ClienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const paciente = pacienteStore.getById(id!)
  const { notas, agregar, eliminar } = useNotas(id!)
  const [contenido, setContenido] = useState('')

  if (!paciente) {
    return <div className="p-4 text-center text-gray-500">{labels.paciente} no encontrado.</div>
  }

  return (
    <div className="p-4 h-full overflow-y-auto space-y-4">
      <DataDetail
        data={paciente as unknown as Record<string, unknown>}
        fields={[
          { key: 'doctor', label: labels.doctor },
          { key: 'proximaCita', label: 'Próxima cita' },
          { key: 'telefono', label: 'Teléfono' },
          { key: 'email', label: 'Email' },
        ]}
        module="paciente"
        basePath="/paciente"
        entityLabel={labels.paciente}
        onDelete={() => { pacienteStore.remove(id!); navigate('/paciente') }}
        bare
        hideButtons
        hideCustom
      />

      {/* Notas */}
      <div className="rounded-lg border border-katt-200 dark:border-katt-800 p-4 space-y-3">
        <h3 className="text-sm font-bold">Notas</h3>
        <div className="space-y-2">
          <textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            placeholder="Escribir nota..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500 resize-none"
          />
          <button
            type="button"
            onClick={() => { if (contenido.trim()) { agregar(contenido.trim()); setContenido('') } }}
            className="w-full px-3 py-1.5 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors"
          >Agregar nota</button>
        </div>
        <div className="max-h-[250px] overflow-y-auto space-y-3">
          {notas.length === 0 && <p className="text-xs text-gray-400">Sin notas aún</p>}
          {notas.map((nota, i) => (
            <NotaAccordion key={i} nota={nota} onDelete={() => eliminar(i)} />
          ))}
        </div>
      </div>

      {/* Documentos */}
      <Documents module="paciente" entityId={id!} />

      {/* Campos custom */}
      {(() => {
        const customFields = getCustomFields('paciente')
        const custom = paciente.custom
        if (!custom || customFields.length === 0) return null
        return (
          <div className="space-y-3 rounded-lg border border-katt-200 dark:border-katt-800 p-4">
            {customFields.map(f => {
              const val = custom[f.id]
              if (val === undefined || val === '' || val === null) return null
              const isLong = typeof val === 'string' && val.includes('\n')
              return (
                <div key={f.id} className={isLong ? 'space-y-1' : 'flex justify-between'}>
                  <span className="text-xs font-medium text-gray-500">{f.label}</span>
                  <span className={`text-sm ${isLong ? 'block whitespace-pre-wrap bg-katt-50 dark:bg-katt-800/40 rounded-lg px-3 py-2' : ''}`}>
                    {Array.isArray(val) ? val.join(', ') : String(val)}
                  </span>
                </div>
              )
            })}
          </div>
        )
      })()}

      {/* Botones al final */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/paciente/editar/${id}`)}
          className="flex-1 px-3 py-1.5 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors"
        >Editar</button>
        <button
          onClick={() => { pacienteStore.remove(id!); navigate('/paciente') }}
          className="flex-1 px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-colors"
        >Eliminar</button>
      </div>
    </div>
  )
}
