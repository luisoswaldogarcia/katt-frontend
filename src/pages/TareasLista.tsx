import { useState, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { tareaStore } from '../lib/demoStore'
import type { TareaData } from '../lib/demoStore'
import { getKanbanColumns, getTaskTypes, getAllTableColumns, getVisibleTableColumns } from '../lib/kanban'
import type { TaskType } from '../lib/kanban'
import { ConfirmModal } from '../components/ConfirmModal'

const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

type Vista = 'tablero' | 'lista'

export default function TareasLista() {
  const [vista, setVista] = useState<Vista>('tablero')
  const [, forceUpdate] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TareaData | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<TareaData | null>(null)
  const [selectedType, setSelectedType] = useState<TaskType | null>(null)
  const [filtroEstado, setFiltroEstado] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileData, setFileData] = useState<string | undefined>(undefined)

  const columns = getKanbanColumns()
  const taskTypes = getTaskTypes()
  const tareas = tareaStore.getAll()

  // --- Tablero logic ---
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    tareaStore.update(result.draggableId, { estado: result.destination.droppableId })
    forceUpdate(n => n + 1)
  }

  function openCreate() {
    setEditing(null)
    setSelectedType(null)
    setFileData(undefined)
    setShowForm(true)
  }

  function openEdit(t: TareaData) {
    setEditing(t)
    setSelectedType(taskTypes.find(tt => tt.id === t.tipo) || null)
    setFileData(t.campos.archivo as string | undefined)
    setShowForm(true)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFileData(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const campos: Record<string, unknown> = {}
    if (selectedType) {
      for (const f of selectedType.fields) {
        campos[f.key] = f.type === 'file' ? fileData : fd.get(f.key) as string
      }
    }
    const data = {
      titulo: fd.get('titulo') as string,
      tipo: fd.get('tipo') as string,
      estado: editing ? (fd.get('estado') as string) : columns[0],
      asignado: '',
      campos,
    }
    if (editing) tareaStore.update(editing.id, data)
    else tareaStore.create(data)
    setShowForm(false)
    setEditing(null)
    setFileData(undefined)
    forceUpdate(n => n + 1)
  }

  function getTypeName(tipoId: string) {
    return taskTypes.find(t => t.id === tipoId)?.nombre || tipoId
  }

  // --- Lista logic ---
  const visibleKeys = getVisibleTableColumns()
  const allCols = getAllTableColumns()
  const visibleCols = allCols.filter(c => visibleKeys.includes(c.key))
  const tareasFiltered = tareas.filter(t => !filtroEstado || t.estado === filtroEstado)

  function getCellValue(t: typeof tareas[0], key: string) {
    if (key === 'titulo') return <span className="font-medium">{t.titulo}</span>
    if (key === 'tipo') return <span className="text-xs px-2 py-0.5 rounded-full bg-katt-100 dark:bg-katt-800">{getTypeName(t.tipo)}</span>
    if (key === 'estado') return <span className="text-xs px-2 py-0.5 rounded-full bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300">{t.estado}</span>
    if (key === 'fechaLimite') return <span className="text-gray-500">{String((t.campos.fechaLimite as string) || '—')}</span>
    if (key === 'monto') return <span className="text-gray-500">{(t.campos.monto as string) ? `$${t.campos.monto}` : '—'}</span>
    return null
  }

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-katt-500 text-white' : 'hover:bg-katt-100 dark:hover:bg-katt-800'}`

  return (
    <div className="p-4 h-full overflow-y-auto space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setVista('tablero')} className={tabClass(vista === 'tablero')}>Tablero</button>
        <button onClick={() => setVista('lista')} className={tabClass(vista === 'lista')}>Lista</button>
        {vista === 'lista' && (
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="ml-auto px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
          >
            <option value="">Todos los estados</option>
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Vista Tablero */}
      {vista === 'tablero' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-col md:flex-row gap-4 md:overflow-x-auto md:pb-2">
            {columns.map(col => {
              const items = tareas.filter(t => t.estado === col)
              return (
                <div key={col} className="space-y-3 md:min-w-[260px] md:w-[260px] md:shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold truncate">{col}</h3>
                    <span className="text-xs text-gray-500">{items.length}</span>
                  </div>
                  <Droppable droppableId={col}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[100px] rounded-lg p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-katt-100 dark:bg-katt-800/50' : ''}`}
                      >
                        {items.map((t, index) => (
                          <Draggable key={t.id} draggableId={String(t.id)} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 rounded-lg border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900 space-y-2 ${snapshot.isDragging ? 'shadow-lg ring-2 ring-katt-500' : ''}`}
                              >
                                <span className="text-sm font-medium">{t.titulo}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300 font-medium">
                                    {getTypeName(t.tipo)}
                                  </span>
                                </div>
                                {t.campos.fechaLimite ? (
                                  <div className="text-xs text-gray-500">{String(t.campos.fechaLimite)}</div>
                                ) : null}
                                <div className="flex gap-1 pt-1">
                                  <button onClick={() => openEdit(t)} className="px-2 py-1 rounded text-[10px] bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700 transition-colors ml-auto">
                                    Editar
                                  </button>
                                  <button onClick={() => setConfirmDelete(t)} className="px-2 py-1 rounded text-[10px] text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                    ×
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {items.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-xs text-gray-400 text-center py-8">Sin tareas</div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      )}

      {/* Vista Lista */}
      {vista === 'lista' && (
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
              {tareasFiltered.map(t => (
                <tr key={t.id} className="border-b border-katt-100 dark:border-katt-800/50 hover:bg-katt-50 dark:hover:bg-katt-800/30 transition-colors">
                  {visibleCols.map(col => (
                    <td key={col.key} className="px-4 py-3">{getCellValue(t, col.key)}</td>
                  ))}
                </tr>
              ))}
              {tareasFiltered.length === 0 && (
                <tr><td colSpan={visibleCols.length} className="px-4 py-8 text-center text-gray-400">Sin tareas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-katt-500 hover:bg-katt-600 text-white shadow-lg flex items-center justify-center transition-colors z-40"
        aria-label="Nueva tarea"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowForm(false); setEditing(null) }}>
          <div className="bg-white dark:bg-katt-900 rounded-xl p-5 w-full max-w-sm space-y-4 border border-katt-200 dark:border-katt-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">{editing ? 'Editar tarea' : 'Nueva tarea'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                name="tipo"
                required
                defaultValue={editing?.tipo || ''}
                onChange={e => setSelectedType(taskTypes.find(t => t.id === e.target.value) || null)}
                className={inputClass}
              >
                <option value="">Seleccionar tipo</option>
                {taskTypes.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
              <input name="titulo" required placeholder="Título" defaultValue={editing?.titulo || ''} className={inputClass} />

              {editing && (
                <select name="estado" defaultValue={editing.estado} className={inputClass}>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}

              {selectedType && selectedType.fields.length > 0 && (
                <>
                  <hr className="border-katt-200 dark:border-katt-800" />
                  {selectedType.fields.map(f => {
                    if (f.type === 'textarea') return <textarea key={f.key} name={f.key} placeholder={f.label} defaultValue={editing?.campos[f.key] as string || ''} rows={2} required={f.required} className={inputClass} />
                    if (f.type === 'date') return <input key={f.key} name={f.key} type="date" placeholder={f.label} defaultValue={editing?.campos[f.key] as string || ''} required={f.required} className={inputClass} />
                    if (f.type === 'file') return (
                      <div key={f.key} className="space-y-2">
                        <button type="button" onClick={() => fileRef.current?.click()} className="w-full px-3 py-2 rounded-lg border border-dashed border-katt-300 dark:border-katt-700 text-sm text-gray-500 hover:border-katt-500 transition-colors">
                          {fileData ? '✓ Archivo cargado' : f.label}
                        </button>
                        <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
                      </div>
                    )
                    return <input key={f.key} name={f.key} placeholder={f.label} defaultValue={editing?.campos[f.key] as string || ''} required={f.required} className={inputClass} />
                  })}
                </>
              )}

              <button type="submit" className="w-full px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">
                {editing ? 'Guardar cambios' : 'Crear tarea'}
              </button>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          message={`¿Eliminar "${confirmDelete.titulo}"? Esta acción no se puede deshacer.`}
          onConfirm={() => { tareaStore.remove(confirmDelete.id); setConfirmDelete(null); forceUpdate(n => n + 1) }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
