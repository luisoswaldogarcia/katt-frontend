import { useState } from 'react'
import { tareaStore } from '../lib/demoStore'
import { getKanbanColumns, getTaskTypes, getAllTableColumns, getVisibleTableColumns } from '../lib/kanban'

export default function TareasLista() {
  const [filtroEstado, setFiltroEstado] = useState('')

  const columns = getKanbanColumns()
  const taskTypes = getTaskTypes()
  const visibleKeys = getVisibleTableColumns()
  const allCols = getAllTableColumns()
  const visibleCols = allCols.filter(c => visibleKeys.includes(c.key))
  const tareas = tareaStore.getAll().filter(t => !filtroEstado || t.estado === filtroEstado)

  function getTypeName(tipoId: string) {
    return taskTypes.find(t => t.id === tipoId)?.nombre || tipoId
  }

  function getCellValue(t: typeof tareas[0], key: string) {
    if (key === 'titulo') return <span className="font-medium">{t.titulo}</span>
    if (key === 'tipo') return <span className="text-xs px-2 py-0.5 rounded-full bg-katt-100 dark:bg-katt-800">{getTypeName(t.tipo)}</span>
    if (key === 'estado') return <span className="text-xs px-2 py-0.5 rounded-full bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300">{t.estado}</span>
    if (key === 'fechaLimite') return <span className="text-gray-500">{(t.campos.fechaLimite as string) || '—'}</span>
    if (key === 'monto') return <span className="text-gray-500">{(t.campos.monto as string) ? `$${t.campos.monto}` : '—'}</span>
    return null
  }

  return (
    <div className="p-4 h-full overflow-y-auto space-y-4">
      <div className="flex gap-2">
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
        >
          <option value="">Todos los estados</option>
          {columns.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-katt-200 dark:border-katt-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-katt-200 dark:border-katt-800 bg-katt-50 dark:bg-katt-900">
              {visibleCols.map(col => (
                <th key={col.key} className="text-left px-4 py-3 font-medium">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tareas.map(t => (
              <tr key={t.id} className="border-b border-katt-100 dark:border-katt-800/50 hover:bg-katt-50 dark:hover:bg-katt-800/30 transition-colors">
                {visibleCols.map(col => (
                  <td key={col.key} className="px-4 py-3">{getCellValue(t, col.key)}</td>
                ))}
              </tr>
            ))}
            {tareas.length === 0 && (
              <tr><td colSpan={visibleCols.length} className="px-4 py-8 text-center text-gray-400">Sin tareas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
