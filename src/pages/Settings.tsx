import { useState, useEffect } from 'react'
import { getSession } from '../lib/auth'
import { ThemeToggle } from '../components/ThemeToggle'
import { labels, getLabels, saveLabels } from '../lib/labels'
import type { Labels } from '../lib/labels'
import { getBranding, saveBranding } from '../lib/branding'
import type { Branding } from '../lib/branding'
import type { CustomField, FieldType, Module } from '../lib/customFields'
import { fieldTypeLabels, getCustomFields, saveCustomFields } from '../lib/customFields'
import { getCategorias, saveCategorias } from '../lib/categorias'
import { getActiveEmpresaId, setActiveEmpresaId } from '../lib/modules'
import { empresaStore } from '../lib/demoStore'
import { getKanbanColumns, saveKanbanColumns, getTaskTypes, saveTaskTypes, getAllTableColumns, getVisibleTableColumns, saveVisibleTableColumns } from '../lib/kanban'
import type { TaskType, TaskTypeField } from '../lib/kanban'
import { getDocTypeCatalog, saveDocTypeCatalog, getModuleDocTypeIds, saveModuleDocTypeIds } from '../lib/documents'
import type { DocType } from '../lib/documents'
import { getModuleCatalog, updateModuleInfo } from '../lib/moduleCatalog'
import type { ModuleCatalogItem } from '../lib/moduleCatalog'

type Tab = 'usuario' | 'sistema' | 'operativo' | 'documentos' | 'modulos'

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
      if (s?.groups.includes('owner')) setRole('owner')
      else if (s?.groups.includes('admin') || s?.groups.includes('administrador')) setRole('admin')
    })
  }, [])
  const [moduleLabels, setModuleLabels] = useState<Labels>(getLabels)
  const [brandingState, setBrandingState] = useState<Branding>(getBranding)
  const [activeModule, setActiveModule] = useState<Module>('paciente')
  const [fields, setFields] = useState<Record<Module, CustomField[]>>({
    paciente: getCustomFields('paciente'),
    doctor: getCustomFields('doctor'),
    inventario: getCustomFields('inventario'),
    empresa: getCustomFields('empresa'),
  })
  const [categorias, setCategorias] = useState(getCategorias)
  const [newCategoria, setNewCategoria] = useState('')
  const [activeEmpresa, setActiveEmpresa] = useState<string>(() => {
    const id = getActiveEmpresaId()
    return id ? String(id) : ''
  })
  const empresas = empresaStore.getAll()
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
          {role === 'owner' && <button onClick={() => setTab('sistema')} className={tabClass(tab === 'sistema')}>Sistema</button>}
          {(role === 'owner' || role === 'admin') && <button onClick={() => setTab('operativo')} className={tabClass(tab === 'operativo')}>Operativo</button>}
          {(role === 'owner' || role === 'admin') && <button onClick={() => setTab('documentos')} className={tabClass(tab === 'documentos')}>Documentos</button>}
          {(role === 'owner' || role === 'admin') && <button onClick={() => setTab('modulos')} className={tabClass(tab === 'modulos')}>Módulos</button>}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

      {/* Tab: Usuario */}
      {tab === 'usuario' && (
        <div className="max-w-md space-y-4">
          <div className={cardClass}>
            <p className={cardTitle}>Apariencia</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tema</span>
              <ThemeToggle />
            </div>
          </div>
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
          {/* Marca */}
          <div className={cardClass}>
            <p className={cardTitle}>Marca</p>
            <p className="text-xs text-gray-500">Nombre e icono que se muestran en el sidebar.</p>
            <div className="space-y-2">
              <input
                value={brandingState.appName}
                onChange={e => {
                  const updated = { ...brandingState, appName: e.target.value }
                  setBrandingState(updated)
                  saveBranding(updated)
                }}
                placeholder="Nombre de la app"
                className={inputClass}
              />
              <div className="flex items-center gap-3">
                <img src={brandingState.appIcon} alt="" className="w-10 h-10 rounded-full object-cover border border-katt-200 dark:border-katt-700" />
                <label className={`${btnPrimary} cursor-pointer`}>
                  Cambiar icono
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        const updated = { ...brandingState, appIcon: reader.result as string }
                        setBrandingState(updated)
                        saveBranding(updated)
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

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
              {([['paciente', labels.paciente], ['doctor', labels.doctor], ['inventario', labels.inventario]] as [Module, string][]).map(([mod, label]) => (
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

          {/* Categorías de inventario */}
          <div className={cardClass}>
            <p className={cardTitle}>Categorías de inventario</p>
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
                className={`flex-1 ${inputClass}`}
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
                className={btnPrimary}
              >
                +
              </button>
            </div>
            {categorias.length > 0 && (
              <div className="space-y-1">
                {categorias.map((cat, i) => (
                  <div key={i} className={listItem}>
                    <span className="text-sm">{cat}</span>
                    <DeleteBtn onClick={() => {
                      const updated = categorias.filter((_, idx) => idx !== i)
                      setCategorias(updated)
                      saveCategorias(updated)
                    }} />
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

      {/* Tab: Módulos */}
      {tab === 'modulos' && <ModulosTab />}

        </div>{/* end flex-1 content */}
      </div>{/* end md:flex */}

      {/* Modal: nuevo campo */}
      {showFieldForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowFieldForm(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-katt-900 rounded-xl p-5 space-y-4 border border-katt-200 dark:border-katt-800">
            <h3 className="font-bold text-sm">Nuevo campo para {activeModule === 'paciente' ? labels.paciente : activeModule === 'doctor' ? labels.doctor : labels.inventario}</h3>
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
  { key: 'inventario', label: labels.inventario },
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

function ModulosTab() {
  const [catalog, setCatalog] = useState(getModuleCatalog)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<ModuleCatalogItem>>({})

  function startEdit(item: ModuleCatalogItem) {
    setEditing(item.key)
    setForm({ nombre: item.nombre, descripcion: item.descripcion, costo: item.costo })
  }

  function saveEdit() {
    if (!editing) return
    const updated = updateModuleInfo(editing, form)
    setCatalog(updated)
    setEditing(null)
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-gray-500">Configura los módulos disponibles en la plataforma y su costo mensual.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {catalog.map(mod => (
          <div key={mod.key} className={cardClass}>
            {editing === mod.key ? (
              <div className="space-y-2">
                <input value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className={inputClass} />
                <input value={form.descripcion || ''} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción" className={inputClass} />
                <input type="number" value={form.costo ?? 0} onChange={e => setForm({ ...form, costo: Number(e.target.value) })} placeholder="Costo" className={inputClass} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditing(null)} className="px-3 py-1 rounded-lg text-xs hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">Cancelar</button>
                  <button onClick={saveEdit} className={btnSmall}>Guardar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-katt-600 dark:text-katt-300">{mod.nombre}</span>
                  <button onClick={() => startEdit(mod)} className="p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500">{mod.descripcion}</p>
                <p className="text-sm font-medium text-katt-500">{mod.costo === 0 ? 'Incluido' : `$${mod.costo}/mes`}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
