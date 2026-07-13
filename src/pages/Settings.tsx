import { useState } from 'react'
import { ThemeToggle } from '../components/ThemeToggle'
import { labels, presets } from '../lib/labels'
import type { CustomField, FieldType, Module } from '../lib/customFields'
import { fieldTypeLabels, getCustomFields, saveCustomFields } from '../lib/customFields'
import { getCategorias, saveCategorias } from '../lib/categorias'
import { getModules } from '../lib/modules'
import { getKanbanColumns, saveKanbanColumns, getTaskTypes, saveTaskTypes, getAllTableColumns, getVisibleTableColumns, saveVisibleTableColumns } from '../lib/kanban'
import type { TaskType, TaskTypeField } from '../lib/kanban'
import type { ModuleConfig } from '../lib/modules'

const sectionClass = "space-y-4 rounded-xl border border-katt-200 dark:border-katt-800 p-4"
const sectionTitle = "text-sm font-bold text-katt-600 dark:text-katt-300"
const sectionSubtitle = "text-xs text-gray-500"

const moduleOptions: { key: keyof ModuleConfig; label: string; core?: boolean }[] = [
  { key: 'paciente', label: 'Pacientes / Clientes', core: true },
  { key: 'doctor', label: 'Doctores / Empresas', core: true },
  { key: 'agenda', label: 'Agenda' },
  { key: 'inventario', label: 'Inventario' },
  { key: 'tablero', label: 'Tablero' },
  { key: 'tareas', label: 'Tareas' },
  { key: 'chat', label: 'Chat' },
  { key: 'agente', label: 'Agente' },
]

export default function Settings() {
  const [preset, setPreset] = useState(localStorage.getItem('katt-preset') || 'salud')
  const [activeModule, setActiveModule] = useState<Module>('paciente')
  const [fields, setFields] = useState<Record<Module, CustomField[]>>({
    paciente: getCustomFields('paciente'),
    doctor: getCustomFields('doctor'),
    inventario: getCustomFields('inventario'),
  })
  const [categorias, setCategorias] = useState(getCategorias)
  const [newCategoria, setNewCategoria] = useState('')
  const [modules, setModules] = useState(getModules)
  const [kanbanCols, setKanbanCols] = useState(getKanbanColumns)
  const [newCol, setNewCol] = useState('')
  const [taskTypes, setTaskTypes] = useState(getTaskTypes)
  const [, forceUpdate] = useState(0)
  const [showTypeForm, setShowTypeForm] = useState(false)
  const [editingType, setEditingType] = useState<TaskType | null>(null)
  const [typeName, setTypeName] = useState('')
  const [typeFields, setTypeFields] = useState<TaskTypeField[]>([])
  const [showFieldForm, setShowFieldForm] = useState(false)
  const [newField, setNewField] = useState<Partial<CustomField>>({ type: 'input', required: false, options: [] })
  const [optionInput, setOptionInput] = useState('')

  const handlePreset = (value: string) => {
    localStorage.setItem('katt-preset', value)
    setPreset(value)
    window.location.reload()
  }

  const needsOptions = (type?: FieldType) => type === 'checkbox' || type === 'radio' || type === 'select'
  const needsRange = (type?: FieldType) => type === 'range'

  const addField = () => {
    if (!newField.label || !newField.type) return
    const field: CustomField = {
      id: Date.now().toString(),
      label: newField.label!,
      type: newField.type!,
      required: newField.required || false,
      ...(needsOptions(newField.type) && { options: newField.options }),
      ...(needsRange(newField.type) && { min: newField.min ?? 0, max: newField.max ?? 10 }),
    }
    const updated = [...fields[activeModule], field]
    setFields({ ...fields, [activeModule]: updated })
    saveCustomFields(activeModule, updated)
    setNewField({ type: 'input', required: false, options: [] })
    setOptionInput('')
    setShowFieldForm(false)
  }

  const removeField = (id: string) => {
    const updated = fields[activeModule].filter(f => f.id !== id)
    setFields({ ...fields, [activeModule]: updated })
    saveCustomFields(activeModule, updated)
  }

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto">
      <h2 className="text-lg font-bold">Configuración</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* === USUARIO === */}
          <section className={sectionClass}>
            <div>
              <p className={sectionTitle}>Usuario</p>
              <p className={sectionSubtitle}>Preferencias personales</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tema</span>
              <ThemeToggle />
            </div>
          </section>

          {/* === ADMINISTRADOR DE SISTEMA === */}
          <section className={sectionClass}>
            <div>
              <p className={sectionTitle}>Administrador de sistema</p>
              <p className={sectionSubtitle}>Configuración global de la plataforma</p>
            </div>
            <div className="space-y-2">
              <span className="text-sm">Tipo de negocio</span>
              <select
                value={preset}
                onChange={e => handlePreset(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-900 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
              >
                {Object.entries(presets).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.paciente} / {val.doctor}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2 border-t border-katt-200 dark:border-katt-800">
              <span className="text-sm font-medium">Módulos activos</span>
              <div className="space-y-2">
                {moduleOptions.map(mod => (
                  <label key={mod.key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800 cursor-pointer">
                    <span className="text-sm">{mod.label}</span>
                    <input
                      type="checkbox"
                      checked={modules[mod.key]}
                      disabled={mod.core}
                      onChange={() => {
                        const updated = { ...modules, [mod.key]: !modules[mod.key] }
                        setModules(updated)
                        localStorage.setItem('katt-modules', JSON.stringify(updated))
                      }}
                      className="w-4 h-4 rounded border-katt-300 text-katt-500 focus:ring-katt-500 disabled:opacity-50"
                    />
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500">Los módulos principales no se pueden desactivar.</p>
            </div>
          </section>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* === ADMINISTRADOR OPERATIVO === */}
          <section className={sectionClass}>
            <div>
              <p className={sectionTitle}>Administrador operativo</p>
              <p className={sectionSubtitle}>Configuración de módulos y datos</p>
            </div>

            {/* Campos personalizados */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Campos personalizados</span>
                <button
                  onClick={() => setShowFieldForm(true)}
                  className="px-3 py-1 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors"
                >
                  + Campo
                </button>
              </div>

              <div className="flex gap-2">
                {([['paciente', labels.paciente], ['doctor', labels.doctor], ['inventario', labels.inventario]] as [Module, string][]).map(([mod, label]) => (
                  <button
                    key={mod}
                    onClick={() => setActiveModule(mod)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeModule === mod ? 'bg-katt-500 text-white' : 'bg-katt-100 dark:bg-katt-800'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {fields[activeModule].length === 0 && (
                <p className="text-xs text-gray-500">No hay campos personalizados para este módulo.</p>
              )}

              <div className="space-y-2">
                {fields[activeModule].map(f => (
                  <div key={f.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800">
                    <div>
                      <span className="text-sm">{f.label}</span>
                      <span className="ml-2 text-xs text-gray-500">{fieldTypeLabels[f.type]}</span>
                      {f.required && <span className="ml-1 text-xs text-red-500">*</span>}
                    </div>
                    <button
                      onClick={() => removeField(f.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Categorías de inventario */}
            <div className="space-y-3 pt-2 border-t border-katt-200 dark:border-katt-800">
              <span className="text-sm font-medium">Categorías de inventario</span>
              <div className="flex gap-2">
                <input
                  placeholder="Nueva categoría"
                  value={newCategoria}
                  onChange={e => setNewCategoria(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newCategoria.trim()) {
                      e.preventDefault()
                      const updated = [...categorias, newCategoria.trim()]
                      setCategorias(updated)
                      saveCategorias(updated)
                      setNewCategoria('')
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
                />
                <button
                  onClick={() => {
                    if (newCategoria.trim()) {
                      const updated = [...categorias, newCategoria.trim()]
                      setCategorias(updated)
                      saveCategorias(updated)
                      setNewCategoria('')
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
                >
                  +
                </button>
              </div>
              <div className="space-y-1">
                {categorias.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800">
                    <span className="text-sm">{cat}</span>
                    <button
                      onClick={() => {
                        const updated = categorias.filter((_, idx) => idx !== i)
                        setCategorias(updated)
                        saveCategorias(updated)
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Columnas del Kanban */}
            <div className="space-y-3 pt-2 border-t border-katt-200 dark:border-katt-800">
              <span className="text-sm font-medium">Columnas del tablero de tareas</span>
              <div className="flex gap-2">
                <input
                  placeholder="Nueva columna"
                  value={newCol}
                  onChange={e => setNewCol(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newCol.trim()) {
                      e.preventDefault()
                      const updated = [...kanbanCols, newCol.trim()]
                      setKanbanCols(updated)
                      saveKanbanColumns(updated)
                      setNewCol('')
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
                />
                <button
                  onClick={() => {
                    if (newCol.trim()) {
                      const updated = [...kanbanCols, newCol.trim()]
                      setKanbanCols(updated)
                      saveKanbanColumns(updated)
                      setNewCol('')
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
                >
                  +
                </button>
              </div>
              <div className="space-y-1">
                {kanbanCols.map((col, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800">
                    <span className="text-sm">{col}</span>
                    <button
                      onClick={() => {
                        const updated = kanbanCols.filter((_, idx) => idx !== i)
                        setKanbanCols(updated)
                        saveKanbanColumns(updated)
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Columnas visibles en tabla de tareas */}
            <div className="space-y-3 pt-2 border-t border-katt-200 dark:border-katt-800">
              <span className="text-sm font-medium">Columnas visibles en tabla de tareas</span>
              <div className="space-y-1">
                {getAllTableColumns().map(col => {
                  const visible = getVisibleTableColumns()
                  const checked = visible.includes(col.key)
                  return (
                    <label key={col.key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const updated = checked ? visible.filter(k => k !== col.key) : [...visible, col.key]
                          saveVisibleTableColumns(updated)
                          forceUpdate(n => n + 1)
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{col.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Tipos de tarea */}
            <div className="space-y-3 pt-2 border-t border-katt-200 dark:border-katt-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tipos de tarea</span>
                <button
                  onClick={() => { setEditingType(null); setTypeName(''); setTypeFields([]); setShowTypeForm(true) }}
                  className="px-3 py-1 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors"
                >
                  + Tipo
                </button>
              </div>
              <div className="space-y-1">
                {taskTypes.map(tt => (
                  <div key={tt.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800">
                    <div>
                      <span className="text-sm">{tt.nombre}</span>
                      <span className="ml-2 text-xs text-gray-500">{tt.fields.length} campo{tt.fields.length !== 1 && 's'}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingType(tt); setTypeName(tt.nombre); setTypeFields([...tt.fields]); setShowTypeForm(true) }}
                        className="p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          const updated = taskTypes.filter(t => t.id !== tt.id)
                          setTaskTypes(updated)
                          saveTaskTypes(updated)
                        }}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal nuevo campo */}
      {showFieldForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowFieldForm(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-katt-900 rounded-xl p-5 space-y-4 border border-katt-200 dark:border-katt-800">
            <h3 className="font-bold text-sm">Nuevo campo para {activeModule === 'paciente' ? labels.paciente : activeModule === 'doctor' ? labels.doctor : labels.inventario}</h3>
            <input
              placeholder="Nombre del campo"
              value={newField.label || ''}
              onChange={e => setNewField({ ...newField, label: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
            />
            <select
              value={newField.type}
              onChange={e => setNewField({ ...newField, type: e.target.value as FieldType, options: [] })}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
            >
              {Object.entries(fieldTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {needsOptions(newField.type as FieldType) && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    placeholder="Agregar opción"
                    value={optionInput}
                    onChange={e => setOptionInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && optionInput.trim()) {
                        e.preventDefault()
                        setNewField({ ...newField, options: [...(newField.options || []), optionInput.trim()] })
                        setOptionInput('')
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (optionInput.trim()) {
                        setNewField({ ...newField, options: [...(newField.options || []), optionInput.trim()] })
                        setOptionInput('')
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-katt-500 text-white text-sm"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(newField.options || []).map((opt, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-katt-100 dark:bg-katt-800 text-xs flex items-center gap-1">
                      {opt}
                      <button onClick={() => setNewField({ ...newField, options: newField.options?.filter((_, idx) => idx !== i) })} className="text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {needsRange(newField.type as FieldType) && (
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={newField.min ?? 0}
                  onChange={e => setNewField({ ...newField, min: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={newField.max ?? 10}
                  onChange={e => setNewField({ ...newField, max: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newField.required || false}
                onChange={e => setNewField({ ...newField, required: e.target.checked })}
                className="w-4 h-4 rounded border-katt-300 text-katt-500 focus:ring-katt-500"
              />
              <span className="text-sm">Obligatorio</span>
            </label>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowFieldForm(false)} className="px-4 py-2 rounded-lg text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                Cancelar
              </button>
              <button onClick={addField} className="px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal tipo de tarea */}
      {showTypeForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowTypeForm(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-katt-900 rounded-xl p-5 space-y-4 border border-katt-200 dark:border-katt-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm">{editingType ? 'Editar tipo de tarea' : 'Nuevo tipo de tarea'}</h3>
            <input
              placeholder="Nombre del tipo"
              value={typeName}
              onChange={e => setTypeName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
            />

            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-500">Campos del tipo</span>
              {typeFields.map((f, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-950 border border-katt-200 dark:border-katt-800">
                  <div>
                    <span className="text-xs">{f.label}</span>
                    <span className="ml-2 text-[10px] text-gray-500">{f.type}</span>
                  </div>
                  <button onClick={() => setTypeFields(typeFields.filter((_, idx) => idx !== i))} className="text-red-500 text-xs">×</button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  id="tf-label"
                  placeholder="Nombre campo"
                  className="flex-1 px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-xs focus:outline-none focus:ring-2 focus:ring-katt-500"
                />
                <select id="tf-type" className="px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-xs focus:outline-none focus:ring-2 focus:ring-katt-500">
                  <option value="text">Texto</option>
                  <option value="textarea">Texto largo</option>
                  <option value="date">Fecha</option>
                  <option value="file">Archivo</option>
                </select>
                <button
                  onClick={() => {
                    const label = (document.getElementById('tf-label') as HTMLInputElement).value.trim()
                    const type = (document.getElementById('tf-type') as HTMLSelectElement).value as TaskTypeField['type']
                    if (label) {
                      setTypeFields([...typeFields, { key: label.toLowerCase().replace(/\s+/g, '_'), label, type }])
                      ;(document.getElementById('tf-label') as HTMLInputElement).value = ''
                    }
                  }}
                  className="px-2 py-1.5 rounded-lg bg-katt-500 text-white text-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowTypeForm(false)} className="px-4 py-2 rounded-lg text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!typeName.trim()) return
                  if (editingType) {
                    const updated = taskTypes.map(t => t.id === editingType.id ? { ...t, nombre: typeName, fields: typeFields } : t)
                    setTaskTypes(updated)
                    saveTaskTypes(updated)
                  } else {
                    const newType: TaskType = { id: Date.now().toString(), nombre: typeName, fields: typeFields }
                    const updated = [...taskTypes, newType]
                    setTaskTypes(updated)
                    saveTaskTypes(updated)
                  }
                  setShowTypeForm(false)
                }}
                className="px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
              >
                {editingType ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
