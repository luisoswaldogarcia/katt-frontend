import { useState, useEffect } from 'react'
import { getSession } from '../lib/auth'
import { ThemeToggle } from '../components/ThemeToggle'
import { ConfirmModal } from '../components/ConfirmModal'
import { labels, getLabels, saveLabels } from '../lib/labels'
import type { Labels } from '../lib/labels'
import type { CustomField, FieldType, Module } from '../lib/customFields'
import { fieldTypeLabels, getCustomFields, saveCustomFields } from '../lib/customFields'
import { getActiveEmpresaId, setActiveEmpresaId } from '../lib/modules'
import { getRoles, saveRoles, MODULOS_PERMISOS, ACCIONES } from '../lib/roles'
import { api, BASE_URL } from '../lib/api'
import { getConfig, saveConfig } from '../lib/configApi'
import type { Rol, Accion } from '../lib/roles'
import { empresaStore } from '../lib/demoStore'
import { getKanbanColumns, saveKanbanColumns, getTaskTypes, saveTaskTypes, getAllTableColumns, getVisibleTableColumns, saveVisibleTableColumns } from '../lib/kanban'
import type { TaskType, TaskTypeField } from '../lib/kanban'
import { getDocTypeCatalog, saveDocTypeCatalog, getModuleDocTypeIds, saveModuleDocTypeIds } from '../lib/documents'
import type { DocType } from '../lib/documents'

type Tab = 'usuario' | 'sistema' | 'operativo' | 'documentos' | 'roles' | 'empresas' | 'calendario' | 'whatsapp'

const tabClass = (active: boolean) =>
  `px-4 py-2 text-sm font-medium rounded-lg transition-colors text-left ${active ? 'bg-katt-500 text-white' : 'hover:bg-katt-100 dark:hover:bg-katt-800 text-gray-600 dark:text-gray-400'}`

const cardClass = "rounded-xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900/50 p-4 space-y-3"
const cardTitle = "text-sm font-semibold text-katt-600 dark:text-katt-300"
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
const btnPrimary = "px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
const btnSmall = "px-3 py-1 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors"
const listItem = "flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800"

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  )
}


export default function Settings() {
  const [tab, setTab] = useState<Tab>('usuario')
  const [role, setRole] = useState<'owner'|'admin'|'other'>('other')
  useEffect(() => {
    getSession().then(s => {
      if (s?.groups.includes('owner') || s?.groups.includes('superadmin')) setRole('owner')
      else if (s?.groups.includes('admin') || s?.groups.includes('administrador')) setRole('admin')
    })
  }, [])
  const [moduleLabels, setModuleLabels] = useState<Labels>(getLabels)
  const [activeModule, setActiveModule] = useState<Module>('paciente')
  const [fields, setFields] = useState<Record<Module, CustomField[]>>({
    paciente: getCustomFields('paciente'),
    doctor: getCustomFields('doctor'),
    empresa: getCustomFields('empresa'),
  })
  const [activeEmpresa, setActiveEmpresa] = useState<string>(() => {
    const id = getActiveEmpresaId()
    return id ? String(id) : ''
  })
  const [empresas, setEmpresas] = useState(empresaStore.getAll())
  useEffect(() => {
    empresaStore.fetch().then(setEmpresas).catch(() => {})
  }, [])
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
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Configuración</h2>

      <div className="md:flex md:gap-6">
        {/* Tabs: horizontal en mobile, vertical sidebar en desktop */}
        <div className="flex gap-2 flex-wrap mb-4 md:mb-0 md:flex-col md:w-44 md:shrink-0">
          <button onClick={() => setTab('usuario')} className={tabClass(tab === 'usuario')}>Usuario</button>
          <button onClick={() => setTab('calendario')} className={tabClass(tab === 'calendario')}>Google Calendar</button>
          <button onClick={() => setTab('whatsapp')} className={tabClass(tab === 'whatsapp')}>WhatsApp</button>
          {role === 'owner' && <button onClick={() => setTab('sistema')} className={tabClass(tab === 'sistema')}>Sistema</button>}
          {(role === 'owner' || role === 'admin') && <button onClick={() => setTab('operativo')} className={tabClass(tab === 'operativo')}>Operativo</button>}
          {(role === 'owner' || role === 'admin') && <button onClick={() => setTab('documentos')} className={tabClass(tab === 'documentos')}>Documentos</button>}
          {(role === 'owner' || role === 'admin') && <button onClick={() => setTab('roles')} className={tabClass(tab === 'roles')}>Roles</button>}
          {role === 'owner' && <button onClick={() => setTab('empresas')} className={tabClass(tab === 'empresas')}>Empresas</button>}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

      {/* Tab: Usuario */}
      {tab === 'calendario' && <CalendarioTab />}

      {tab === 'whatsapp' && <WhatsAppTab />}

      {tab === 'usuario' && (
        <div className="max-w-md space-y-4">
          <div className={cardClass}>
            <p className={cardTitle}>Apariencia</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tema</span>
              <ThemeToggle />
            </div>
          </div>
          <HuellaCard />
        </div>
      )}

      {/* Tab: Sistema */}
      {tab === 'sistema' && (
        <div className="space-y-4">
          <div className={`max-w-md ${cardClass}`}>
            <p className={cardTitle}>Empresa activa</p>
            <p className="text-xs text-gray-500">Selecciona la empresa con la que estás trabajando. Esto determina los módulos disponibles.</p>
            <select
              value={activeEmpresa}
              onChange={e => {
                const val = e.target.value
                setActiveEmpresa(val)
                setActiveEmpresaId(val || null)
              }}
              className={inputClass}
            >
              <option value="">Owner (todos los módulos)</option>
              {empresas.map(e => (
                <option key={e.id} value={String(e.id)}>{e.nombre}</option>
              ))}
            </select>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <p className={cardTitle}>{labels.empresa}s</p>
              <a href="/empresa/alta" className={btnSmall}>+ {labels.empresa}</a>
            </div>
            {empresas.length === 0 ? (
              <p className="text-xs text-gray-500">No hay empresas registradas.</p>
            ) : (
              <div className="space-y-2">
                {empresas.map(emp => (
                  <a key={emp.id} href={`/empresa/${emp.id}`} className={`${listItem} hover:border-katt-400 dark:hover:border-katt-600 transition-colors`}>
                    <span className="text-sm">{emp.nombre}</span>
                    <span className="text-xs text-gray-500">{emp.telefono || ''}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Operativo */}
      {tab === 'operativo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombres de módulos */}
          <div className={cardClass}>
            <p className={cardTitle}>Nombres de módulos</p>
            <p className="text-xs text-gray-500">Personaliza cómo se llaman los módulos en la interfaz. Los cambios se aplican al recargar.</p>
            <div className="space-y-2">
              {(Object.keys(moduleLabels) as (keyof Labels)[]).map(key => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 capitalize">{key}</span>
                  <input
                    value={moduleLabels[key]}
                    onChange={e => {
                      const updated = { ...moduleLabels, [key]: e.target.value }
                      setModuleLabels(updated)
                      saveLabels(updated)
                    }}
                    className={`flex-1 ${inputClass}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Campos personalizados */}
          <div className={cardClass}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className={cardTitle}>Campos personalizados</p>
              <button onClick={() => setShowFieldForm(true)} className={btnSmall}>+ Campo</button>
            </div>
            <div className="flex gap-2">
              {([['paciente', labels.paciente], ['doctor', labels.doctor]] as [Module, string][]).map(([mod, label]) => (
                <button
                  key={mod}
                  onClick={() => setActiveModule(mod)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeModule === mod ? 'bg-katt-500 text-white' : 'bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {fields[activeModule].length === 0 ? (
              <p className="text-xs text-gray-500">No hay campos personalizados para este módulo.</p>
            ) : (
              <div className="space-y-2">
                {fields[activeModule].map(f => (
                  <div key={f.id} className={listItem}>
                    <div>
                      <span className="text-sm">{f.label}</span>
                      <span className="ml-2 text-xs text-gray-500">{fieldTypeLabels[f.type]}</span>
                      {f.required && <span className="ml-1 text-xs text-red-500">*</span>}
                    </div>
                    <DeleteBtn onClick={() => removeField(f.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columnas del tablero */}
          <div className={cardClass}>
            <p className={cardTitle}>Columnas del tablero</p>
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
                className={`flex-1 ${inputClass}`}
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
                className={btnPrimary}
              >
                +
              </button>
            </div>
            {kanbanCols.length > 0 && (
              <div className="space-y-1">
                {kanbanCols.map((col, i) => (
                  <div key={i} className={listItem}>
                    <span className="text-sm">{col}</span>
                    <DeleteBtn onClick={() => {
                      const updated = kanbanCols.filter((_, idx) => idx !== i)
                      setKanbanCols(updated)
                      saveKanbanColumns(updated)
                    }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columnas visibles en tabla de tareas */}
          <div className={cardClass}>
            <p className={cardTitle}>Columnas visibles en tabla de tareas</p>
            <div className="space-y-1">
              {getAllTableColumns().map(col => {
                const visible = getVisibleTableColumns()
                const checked = visible.includes(col.key)
                return (
                  <label key={col.key} className={`${listItem} cursor-pointer`}>
                    <span className="text-sm">{col.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const updated = checked ? visible.filter(k => k !== col.key) : [...visible, col.key]
                        saveVisibleTableColumns(updated)
                        forceUpdate(n => n + 1)
                      }}
                      className="w-4 h-4 rounded border-katt-300 text-katt-500 focus:ring-katt-500"
                    />
                  </label>
                )
              })}
            </div>
          </div>

          {/* Tipos de tarea */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <p className={cardTitle}>Tipos de tarea</p>
              <button
                onClick={() => { setEditingType(null); setTypeName(''); setTypeFields([]); setShowTypeForm(true) }}
                className={btnSmall}
              >
                + Tipo
              </button>
            </div>
            {taskTypes.length > 0 && (
              <div className="space-y-1">
                {taskTypes.map(tt => (
                  <div key={tt.id} className={listItem}>
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
                      <DeleteBtn onClick={() => {
                        const updated = taskTypes.filter(t => t.id !== tt.id)
                        setTaskTypes(updated)
                        saveTaskTypes(updated)
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Documentos */}
      {tab === 'documentos' && <TiposDocumentoTab />}

      {/* Tab: Roles */}
      {tab === 'roles' && <RolesTab />}

      {/* Tab: Empresas */}
      {tab === 'empresas' && <EmpresasTab />}

      {/* Tab: Módulos */}

        </div>{/* end flex-1 content */}
      </div>{/* end md:flex */}

      {/* Modal: nuevo campo */}
      {showFieldForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowFieldForm(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-katt-900 rounded-xl p-5 space-y-4 border border-katt-200 dark:border-katt-800">
            <h3 className="font-bold text-sm">Nuevo campo para {activeModule === 'paciente' ? labels.paciente : activeModule === 'doctor' ? labels.doctor : labels.empresa}</h3>
            <input
              placeholder="Nombre del campo"
              value={newField.label || ''}
              onChange={e => setNewField({ ...newField, label: e.target.value })}
              className={inputClass}
            />
            <select
              value={newField.type}
              onChange={e => setNewField({ ...newField, type: e.target.value as FieldType, options: [] })}
              className={inputClass}
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
                    className={`flex-1 ${inputClass}`}
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
                  className={`flex-1 ${inputClass}`}
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={newField.max ?? 10}
                  onChange={e => setNewField({ ...newField, max: Number(e.target.value) })}
                  className={`flex-1 ${inputClass}`}
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
              className={inputClass}
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

const docModules: { key: Module; label: string }[] = [
  { key: 'paciente', label: labels.paciente },
  { key: 'doctor', label: labels.doctor },
  { key: 'empresa', label: labels.empresa },
]

function TiposDocumentoTab() {
  const [catalog, setCatalog] = useState<DocType[]>(getDocTypeCatalog)
  const [nombre, setNombre] = useState('')
  const [activeModule, setActiveModule] = useState<Module>('paciente')
  const [assigned, setAssigned] = useState<string[]>(() => getModuleDocTypeIds('paciente'))

  function handleAdd() {
    if (!nombre.trim()) return
    const newType: DocType = { id: Date.now().toString(), label: nombre.trim() }
    const updated = [...catalog, newType]
    setCatalog(updated)
    saveDocTypeCatalog(updated)
    setNombre('')
  }

  function handleDelete(id: string) {
    const updated = catalog.filter(t => t.id !== id)
    setCatalog(updated)
    saveDocTypeCatalog(updated)
    for (const m of docModules) {
      const ids = getModuleDocTypeIds(m.key).filter(i => i !== id)
      saveModuleDocTypeIds(m.key, ids)
    }
    if (assigned.includes(id)) setAssigned(assigned.filter(i => i !== id))
  }

  function handleToggleAssign(id: string) {
    const updated = assigned.includes(id) ? assigned.filter(i => i !== id) : [...assigned, id]
    setAssigned(updated)
    saveModuleDocTypeIds(activeModule, updated)
  }

  function handleModuleChange(mod: Module) {
    setActiveModule(mod)
    setAssigned(getModuleDocTypeIds(mod))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={cardClass}>
        <p className={cardTitle}>Catálogo de tipos</p>
        <div className="flex gap-2">
          <input
            placeholder="Nuevo tipo de documento"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            className={`flex-1 ${inputClass}`}
          />
          <button onClick={handleAdd} className={btnPrimary}>+</button>
        </div>
        {catalog.length === 0 && <p className="text-xs text-gray-400">Sin tipos de documento</p>}
        <div className="space-y-1">
          {catalog.map(t => (
            <div key={t.id} className={listItem}>
              <span className="text-sm">{t.label}</span>
              <DeleteBtn onClick={() => handleDelete(t.id)} />
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <p className={cardTitle}>Asignar a módulo</p>
        <div className="flex gap-2 flex-wrap">
          {docModules.map(m => (
            <button
              key={m.key}
              onClick={() => handleModuleChange(m.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeModule === m.key ? 'bg-katt-500 text-white' : 'bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {catalog.length === 0 && <p className="text-xs text-gray-400">Crea tipos de documento primero</p>}
        <div className="space-y-1">
          {catalog.map(t => (
            <label key={t.id} className={`${listItem} cursor-pointer`}>
              <span className="text-sm">{t.label}</span>
              <input
                type="checkbox"
                checked={assigned.includes(t.id)}
                onChange={() => handleToggleAssign(t.id)}
                className="w-4 h-4 rounded border-katt-300 text-katt-500 focus:ring-katt-500"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Huella digital (WebAuthn en este dispositivo) ─── */

function HuellaCard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [estado, setEstado] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getSession().then(s => { if (s?.email) setEmail(s.email) })
  }, [])

  async function activar() {
    if (!email) { setEstado('No se pudo identificar tu usuario.'); return }
    if (password.length < 6) { setEstado('Escribe tu contraseña para confirmar (mínimo 6 caracteres).'); return }
    setBusy(true)
    setEstado('')
    try {
      const { api } = await import('../lib/api')
      const { startRegistration } = await import('@simplewebauthn/browser')
      const { token } = await api.create<{ token: string }>('webauthn/register/token', {})
      const options = await api.create<Record<string, unknown>>('webauthn/register/begin', { email, registerToken: token })
      const credential = await startRegistration({ optionsJSON: options as never })
      await api.create('webauthn/register/complete', { email, credential, registerToken: token, password })
      setEstado('✅ Huella digital activada en este dispositivo. Ya puedes entrar con ella.')
      setPassword('')
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') setEstado('Registro cancelado.')
      else setEstado(`No se pudo activar: ${err?.message || 'error desconocido'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={cardClass}>
      <p className={cardTitle}>Huella digital</p>
      <p className="text-xs text-gray-500">
        Activa el acceso con la huella o el PIN de este dispositivo. Confirma tu contraseña para habilitarlo.
      </p>
      <div className="flex items-center gap-2">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          className={inputClass}
          autoComplete="current-password"
        />
        <button onClick={activar} disabled={busy} className={`${btnPrimary} shrink-0`}>
          {busy ? 'Activando…' : 'Activar huella'}
        </button>
      </div>
      {estado && <p className="text-xs text-katt-500 dark:text-katt-400">{estado}</p>}
    </div>
  )
}

/* ─── WhatsApp: recordatorios de citas ─── */

interface WhatsAppCfg {
  activo?: boolean
  phoneNumberId?: string
  accessToken?: string
  templateName?: string
  plantilla?: string
  diasAntes?: number
  horaDesde?: number
  horaHasta?: number
}

const PLANTILLA_DEFAULT = 'Hola {paciente}, te recordamos tu cita con {doctor} el {fecha} a las {hora}. ¡Te esperamos!'
const VARIABLES = ['paciente', 'doctor', 'fecha', 'hora', 'motivo', 'clinica']

function renderPlantillaLocal(plantilla: string, vars: Record<string, string>) {
  return plantilla.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '')
}

function WhatsAppTab() {
  const [cfg, setCfg] = useState<WhatsAppCfg>({})
  const [telPrueba, setTelPrueba] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [probando, setProbando] = useState(false)

  useEffect(() => {
    getConfig<WhatsAppCfg>('whatsapp', {}).then(setCfg).catch(() => {})
  }, [])

  const plantilla = cfg.plantilla ?? PLANTILLA_DEFAULT
  const preview = renderPlantillaLocal(plantilla, {
    paciente: 'Rosa Robles', doctor: 'Dr. Pacheco', fecha: '21 de octubre',
    hora: '10:00', motivo: 'Limpieza', clinica: 'Tu clínica',
  })

  function set(patch: Partial<WhatsAppCfg>) { setCfg(prev => ({ ...prev, ...patch })) }

  async function guardar() {
    setGuardando(true); setMensaje('')
    try {
      await saveConfig('whatsapp', { ...cfg, plantilla })
      setMensaje('Configuración guardada ✓')
    } catch {
      setMensaje('No se pudo guardar')
    }
    setGuardando(false)
  }

  async function probar() {
    setProbando(true); setMensaje('')
    try {
      await api.create('whatsapp/test', { telefono: telPrueba })
      setMensaje('Mensaje de prueba enviado ✓')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      setMensaje(`No se pudo enviar: ${msg}`)
    }
    setProbando(false)
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-xl border border-katt-200 dark:border-katt-700 bg-white dark:bg-katt-800 text-katt-700 dark:text-katt-200 focus:outline-none focus:ring-2 focus:ring-katt-500'

  return (
    <div className="space-y-4">
      {/* Conexión */}
      <div data-testid="whatsapp-card" className="rounded-2xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className={cardTitle}>Conexión de WhatsApp</p>
          <label className="flex items-center gap-2 text-sm text-katt-600 dark:text-katt-300">
            <input type="checkbox" checked={cfg.activo === true} onChange={e => set({ activo: e.target.checked })} />
            Activar recordatorios
          </label>
        </div>
        <p className="text-xs text-katt-500 dark:text-katt-400">Los mensajes salen a nombre de la cuenta de WhatsApp Business que conectes aquí (Meta Cloud API).</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-katt-500 dark:text-katt-400 mb-1">Phone Number ID (Meta)</p>
            <input data-testid="whatsapp-phone-id" value={cfg.phoneNumberId ?? ''} onChange={e => set({ phoneNumberId: e.target.value })} className={inputCls} placeholder="1234567890" />
          </div>
          <div>
            <p className="text-xs font-medium text-katt-500 dark:text-katt-400 mb-1">Token de acceso (Meta)</p>
            <input data-testid="whatsapp-token" type="password" value={cfg.accessToken ?? ''} onChange={e => set({ accessToken: e.target.value })} className={inputCls} placeholder="EAAG..." />
          </div>
          <div>
            <p className="text-xs font-medium text-katt-500 dark:text-katt-400 mb-1">Plantilla aprobada en Meta</p>
            <input data-testid="whatsapp-template-name" value={cfg.templateName ?? 'recordatorio_cita'} onChange={e => set({ templateName: e.target.value })} className={inputCls} />
          </div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <p className="text-xs font-medium text-katt-500 dark:text-katt-400 mb-1">Teléfono de prueba (con código de país)</p>
            <input data-testid="whatsapp-tel-prueba" value={telPrueba} onChange={e => setTelPrueba(e.target.value)} className={inputCls} placeholder="5215512345678" />
          </div>
          <button data-testid="whatsapp-probar" onClick={probar} disabled={probando || !telPrueba} className="px-4 py-2 text-sm rounded-xl border border-katt-200 dark:border-katt-700 hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors disabled:opacity-50">
            {probando ? 'Enviando…' : 'Enviar prueba'}
          </button>
        </div>
      </div>

      {/* Plantilla */}
      <div data-testid="whatsapp-plantilla-card" className="rounded-2xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900 p-4 space-y-3">
        <p className={cardTitle}>Plantilla del mensaje</p>
        <div className="flex flex-wrap gap-1">
          {VARIABLES.map(v => (
            <span key={v} className="px-2 py-0.5 text-[11px] rounded-full bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300">{`{${v}}`}</span>
          ))}
        </div>
        <textarea data-testid="whatsapp-plantilla" rows={4} value={plantilla} onChange={e => set({ plantilla: e.target.value })} className={inputCls} />
        <div>
          <p className="text-xs font-medium text-katt-500 dark:text-katt-400 mb-1">Vista previa</p>
          <p data-testid="whatsapp-preview" className="text-sm rounded-xl bg-katt-50 dark:bg-katt-800 text-katt-700 dark:text-katt-200 p-3">{preview}</p>
        </div>
      </div>

      {/* Envíos */}
      <div data-testid="whatsapp-envios-card" className="rounded-2xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900 p-4 space-y-3">
        <p className={cardTitle}>¿Cuándo se mandan?</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-katt-500 dark:text-katt-400 mb-1">Días antes de la cita</p>
            <input data-testid="whatsapp-dias" type="number" min={0} max={30} value={cfg.diasAntes ?? 1} onChange={e => set({ diasAntes: Number(e.target.value) })} className={inputCls} />
          </div>
          <div>
            <p className="text-xs font-medium text-katt-500 dark:text-katt-400 mb-1">Enviar desde las (hora)</p>
            <input data-testid="whatsapp-desde" type="number" min={0} max={23} value={cfg.horaDesde ?? 9} onChange={e => set({ horaDesde: Number(e.target.value) })} className={inputCls} />
          </div>
          <div>
            <p className="text-xs font-medium text-katt-500 dark:text-katt-400 mb-1">Hasta las (hora)</p>
            <input data-testid="whatsapp-hasta" type="number" min={1} max={24} value={cfg.horaHasta ?? 19} onChange={e => set({ horaHasta: Number(e.target.value) })} className={inputCls} />
          </div>
        </div>
        <p className="text-xs text-katt-500 dark:text-katt-400">Ejemplo: 1 día antes, entre las 9 y las 19 hrs. Los mensajes que no quepan en ese horario se mandan en la siguiente corrida dentro de la ventana (se revisa cada 15 minutos).</p>
      </div>

      <button data-testid="whatsapp-guardar" onClick={guardar} disabled={guardando} className="px-4 py-2 text-sm rounded-xl bg-katt-500 hover:bg-katt-600 text-white font-medium transition-colors disabled:opacity-50">
        {guardando ? 'Guardando…' : 'Guardar configuración'}
      </button>
      {mensaje && <p className="text-xs text-katt-500 dark:text-katt-400">{mensaje}</p>}
    </div>
  )
}

/* ─── Conexión con Google Calendar ─── */

function CalendarioTab() {
  const [url, setUrl] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function generar() {
    setCargando(true)
    setMensaje('')
    try {
      const r = await api.get<{ token: string; empresaId: string }>('calendar', 'ics')
      setUrl(`${BASE_URL}/ics/${r.empresaId}/${r.token}.ics`)
    } catch {
      setMensaje('No se pudo generar el enlace. Intenta de nuevo.')
    }
    setCargando(false)
  }

  function copiar() {
    navigator.clipboard?.writeText(url).then(() => setMensaje('Enlace copiado al portapapeles')).catch(() => setMensaje('No se pudo copiar'))
  }

  return (
    <div data-testid="google-calendar-card" className="rounded-2xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900 p-4 space-y-3">
      <p className={cardTitle}>Conectar la agenda con Google Calendar</p>
      <ol className="text-sm text-katt-600 dark:text-katt-300 space-y-1 list-decimal list-inside">
        <li>Abre Google Calendar en la computadora.</li>
        <li>A la derecha, en <strong>Otros calendarios</strong>, toca <strong>+</strong> y elige <strong>Desde URL</strong>.</li>
        <li>Pega el enlace de abajo y toca <strong>Agregar calendario</strong>.</li>
      </ol>
      {!url ? (
        <button data-testid="generar-ics" onClick={generar} disabled={cargando} className="px-4 py-2 text-sm rounded-xl bg-katt-500 hover:bg-katt-600 text-white font-medium transition-colors disabled:opacity-50">
          {cargando ? 'Generando…' : 'Generar enlace de suscripción'}
        </button>
      ) : (
        <div className="flex gap-2">
          <input data-testid="ics-url" readOnly value={url} className="flex-1 min-w-0 px-3 py-2 text-xs rounded-xl border border-katt-200 dark:border-katt-700 bg-katt-50 dark:bg-katt-800 text-katt-700 dark:text-katt-200" />
          <button onClick={copiar} className="px-3 py-2 text-xs rounded-xl border border-katt-200 dark:border-katt-700 hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">Copiar</button>
        </div>
      )}
      <p className="text-xs text-katt-500 dark:text-katt-400">Google revisa el enlace periódicamente (no es en tiempo real): los cambios en la agenda tardan un rato en reflejarse.</p>
      {mensaje && <p className="text-xs text-katt-500 dark:text-katt-400">{mensaje}</p>}
    </div>
  )
}

/* ─── Catálogo de roles y permisos ─── */

const MODULOS_LABELS: Record<string, string> = {
  clientes: 'Clientes',
  usuarios: 'Usuarios',
  agenda: 'Agenda',
  tareas: 'Tareas',
  documentos: 'Documentos',
}

function RolesTab() {
  const [roles, setRoles] = useState<Rol[]>(getRoles())
  const [sel, setSel] = useState<string>(getRoles()[0]?.id || '')
  const [estado, setEstado] = useState('')
  const rol = roles.find(r => r.id === sel) || null

  function update(patch: Partial<Rol>) {
    setRoles(prev => prev.map(r => (r.id === sel ? { ...r, ...patch } : r)))
    setEstado('')
  }

  function toggleAccion(mod: string, accion: Accion) {
    if (!rol) return
    const actuales = rol.permisos[mod] || []
    const nuevos = actuales.includes(accion) ? actuales.filter(a => a !== accion) : [...actuales, accion]
    update({ permisos: { ...rol.permisos, [mod]: nuevos } })
  }

  function agregar() {
    const id = `rol_${Date.now().toString(36)}`
    setRoles(prev => [...prev, { id, nombre: 'Nuevo rol', grupo: 'user', permisos: {} }])
    setSel(id)
  }

  function eliminar() {
    if (!rol) return
    setRoles(prev => prev.filter(r => r.id !== rol.id))
    setSel('')
    setEstado('')
  }

  async function guardar() {
    await saveRoles(roles)
    setEstado('✅ Roles guardados.')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          Los roles definen qué puede hacer cada usuario. Se usan al crear usuarios y para mostrar u ocultar módulos.
        </p>
        <div className="flex gap-2">
          <button onClick={agregar} className={btnSmall}>+ Nuevo rol</button>
          <button onClick={guardar} className={btnPrimary}>Guardar cambios</button>
        </div>
      </div>
      {estado && <p className="text-xs text-katt-500 dark:text-katt-400">{estado}</p>}

      <div className="flex flex-wrap gap-2">
        {roles.map(r => (
          <button
            key={r.id}
            onClick={() => { setSel(r.id); setEstado('') }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sel === r.id ? 'bg-katt-500 text-white' : 'bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700'}`}
          >
            {r.nombre}
          </button>
        ))}
      </div>

      {rol && (
        <div className={`max-w-2xl ${cardClass}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={rol.nombre}
              onChange={e => update({ nombre: e.target.value })}
              placeholder="Nombre del rol"
              className={`flex-1 min-w-40 ${inputClass}`}
            />
            <select value={rol.grupo} onChange={e => update({ grupo: e.target.value as Rol['grupo'] })} className={inputClass}>
              <option value="owner">Grupo: owner</option>
              <option value="admin">Grupo: admin</option>
              <option value="user">Grupo: user</option>
            </select>
            <button onClick={eliminar} className="px-3 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors shrink-0">
              Eliminar
            </button>
          </div>
          <p className="text-xs text-gray-500">
            El grupo define cómo autentica en Cognito (owner, admin o user). Los permisos controlan lo que ve y hace en la app.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="py-2 pr-3">Módulo</th>
                  {ACCIONES.map(a => <th key={a} className="py-2 px-2 capitalize text-center">{a}</th>)}
                </tr>
              </thead>
              <tbody>
                {MODULOS_PERMISOS.map(mod => (
                  <tr key={mod} className="border-t border-katt-100 dark:border-katt-800">
                    <td className="py-2 pr-3">{MODULOS_LABELS[mod]}</td>
                    {ACCIONES.map(a => (
                      <td key={a} className="py-2 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={(rol.permisos[mod] || []).includes(a)}
                          onChange={() => toggleAccion(mod, a)}
                          className="rounded"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Administrador de empresas ─── */

function EmpresasTab() {
  const [empresas, setEmpresas] = useState(empresaStore.getAll())
  const [edit, setEdit] = useState<Record<string, string> | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [estado, setEstado] = useState('')
  const [confirmDel, setConfirmDel] = useState<{ id: string; nombre: string } | null>(null)
  const activaId = getActiveEmpresaId()

  function cargar() {
    empresaStore.fetch().then(setEmpresas).catch(() => setEmpresas(empresaStore.getAll()))
  }
  useEffect(() => { cargar() }, [])

  async function guardar() {
    if (!edit) return
    if (!edit.nombre?.trim()) { setEstado('El nombre es obligatorio.'); return }
    try {
      if (editId) await empresaStore.update(editId, edit)
      else await empresaStore.create(edit as never)
      setEdit(null); setEditId(null); setEstado('✅ Empresa guardada.')
      cargar()
    } catch {
      setEstado('No se pudo guardar la empresa.')
    }
  }

  async function eliminar() {
    if (!confirmDel) return
    try {
      await empresaStore.remove(confirmDel.id)
      setEstado('Empresa eliminada.')
      cargar()
    } catch {
      setEstado('No se pudo eliminar la empresa.')
    }
    setConfirmDel(null)
  }

  const campos: { key: string; label: string }[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'rfc', label: 'RFC' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    { key: 'direccion', label: 'Dirección' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          Administra las empresas de la plataforma. La empresa activa es la que estás viendo/editando en la app.
        </p>
        <button onClick={() => { setEdit({}); setEditId(null); setEstado('') }} className={btnPrimary}>+ Nueva empresa</button>
      </div>
      {estado && <p className="text-xs text-katt-500 dark:text-katt-400">{estado}</p>}

      <div className="max-w-2xl space-y-2">
        {empresas.map(e => (
          <div key={String(e.id)} className={listItem}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{e.nombre}</span>
                {String(e.id) === String(activaId) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-katt-500 text-white">Activa</span>
                )}
              </div>
              <div className="text-xs text-gray-500 truncate">{[e.rfc, e.telefono, e.email].filter(Boolean).join(' · ') || 'Sin datos de contacto'}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {String(e.id) !== String(activaId) && (
                <button onClick={() => { setActiveEmpresaId(String(e.id)); setEstado(`Empresa activa: ${e.nombre}`) }} className="px-2 py-1 rounded-lg text-xs text-katt-500 hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">Activar</button>
              )}
              <button onClick={() => { setEditId(String(e.id)); setEdit({ nombre: e.nombre || '', rfc: e.rfc || '', telefono: e.telefono || '', email: e.email || '', direccion: e.direccion || '' }); setEstado('') }} className="px-2 py-1 rounded-lg text-xs text-katt-500 hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">Editar</button>
              <button onClick={() => setConfirmDel({ id: String(e.id), nombre: e.nombre || '' })} className="px-2 py-1 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Eliminar</button>
            </div>
          </div>
        ))}
        {empresas.length === 0 && <p className="text-xs text-gray-500">No hay empresas registradas.</p>}
      </div>

      {edit && (
        <div className={`max-w-md ${cardClass}`}>
          <p className={cardTitle}>{editId ? 'Editar empresa' : 'Nueva empresa'}</p>
          {campos.map(c => (
            <input
              key={c.key}
              value={edit[c.key] || ''}
              onChange={e => setEdit({ ...edit, [c.key]: e.target.value })}
              placeholder={c.label}
              className={inputClass}
              type={c.key === 'email' ? 'email' : 'text'}
            />
          ))}
          <div className="flex gap-2">
            <button onClick={guardar} className={btnPrimary}>Guardar</button>
            <button onClick={() => { setEdit(null); setEditId(null) }} className="px-4 py-2 rounded-lg border border-katt-200 dark:border-katt-700 text-sm font-medium transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {confirmDel && (
        <ConfirmModal
          message={`¿Eliminar la empresa "${confirmDel.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={eliminar}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}
