import { useState } from 'react'
import { getModuleCatalog, updateModuleInfo } from '../lib/moduleCatalog'
import type { ModuleCatalogItem } from '../lib/moduleCatalog'

const cardClass = "rounded-xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900/50 p-4 space-y-2"
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

export default function Modulos() {
  const [catalog, setCatalog] = useState(getModuleCatalog)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<ModuleCatalogItem>>({})

  function startEdit(item: ModuleCatalogItem) {
    setEditing(item.key)
    setForm({ nombre: item.nombre, descripcion: item.descripcion, costo: item.costo })
  }

  function saveEdit() {
    if (!editing) return
    updateModuleInfo(editing, form).then(updated => {
      setCatalog(updated)
      setEditing(null)
    })
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-4">
        <p className="text-sm text-gray-500">Configura los módulos disponibles en la plataforma y su costo mensual.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {catalog.map(mod => (
            <div key={mod.key} className={cardClass}>
              {editing === mod.key ? (
                <div className="space-y-2">
                  <input
                    value={form.nombre || ''}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Nombre"
                    className={inputClass}
                  />
                  <input
                    value={form.descripcion || ''}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    placeholder="Descripción"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={form.costo ?? 0}
                    onChange={e => setForm({ ...form, costo: Number(e.target.value) })}
                    placeholder="Costo"
                    className={inputClass}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(null)} className="px-3 py-1 rounded-lg text-xs hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                      Cancelar
                    </button>
                    <button onClick={saveEdit} className="px-3 py-1 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors">
                      Guardar
                    </button>
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
                  <p className="text-sm font-medium text-katt-500">
                    {mod.costo === 0 ? 'Incluido' : `$${mod.costo}/mes`}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
