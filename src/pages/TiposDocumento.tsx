import { useState } from 'react'
import { getDocTypeCatalog, saveDocTypeCatalog, getModuleDocTypeIds, saveModuleDocTypeIds } from '../lib/documents'
import type { DocType } from '../lib/documents'
import type { Module } from '../lib/customFields'
import { labels } from '../lib/labels'

const cardClass = "rounded-xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900/50 p-4 space-y-3"
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
const btnPrimary = "px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
const listItem = "flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800"

const modules: { key: Module; label: string }[] = [
  { key: 'paciente', label: labels.paciente },
  { key: 'doctor', label: labels.doctor },
  { key: 'inventario', label: labels.inventario },
  { key: 'empresa', label: labels.empresa },
]

export default function TiposDocumento() {
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
    // Remove from all module assignments
    for (const m of modules) {
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
    <div className="p-4 h-full overflow-y-auto space-y-4">
      <h2 className="text-lg font-bold">Tipos de Documento</h2>

      {/* Crear tipo */}
      <div className={cardClass}>
        <p className="text-sm font-semibold text-katt-600 dark:text-katt-300">Catálogo de tipos</p>
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
              <button onClick={() => handleDelete(t.id)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Asignar a módulos */}
      <div className={cardClass}>
        <p className="text-sm font-semibold text-katt-600 dark:text-katt-300">Asignar a módulo</p>
        <div className="flex gap-2 flex-wrap">
          {modules.map(m => (
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
