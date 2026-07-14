import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { labels } from '../lib/labels'
import { empresaStore, doctorStore } from '../lib/demoStore'
import { saveEmpresaModules, moduleLabels } from '../lib/modules'
import type { ModuleConfig } from '../lib/modules'
import { getModuleCatalog } from '../lib/moduleCatalog'
import { DataDetail } from '../components/DataDetail'

const listItem = "flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800"

export default function EmpresaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const empresa = empresaStore.getById(Number(id))
  const [, forceUpdate] = useState(0)

  if (!empresa) {
    return <div className="p-4 text-center text-gray-500">{labels.empresa} no encontrada.</div>
  }

  const usuarios = doctorStore.getAll().filter(u => u.empresaId === empresa.id)
  const empresaModules = empresa.modules || {}
  const catalog = getModuleCatalog()

  function isModuleActive(key: string): boolean {
    return empresaModules[key] !== false
  }

  function getCosto(key: string): number {
    return catalog.find(m => m.key === key)?.costo || 0
  }

  const costoTotal = (Object.keys(moduleLabels) as (keyof ModuleConfig)[])
    .filter(k => isModuleActive(k))
    .reduce((sum, k) => sum + getCosto(k), 0)

  function toggleModule(key: string) {
    const updated = { ...empresaModules, [key]: !isModuleActive(key) }
    saveEmpresaModules(empresa!.id, updated)
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-4 h-full overflow-y-auto space-y-6">
      <DataDetail
        data={empresa as unknown as Record<string, unknown>}
        fields={[
          { key: 'rfc', label: 'RFC' },
          { key: 'telefono', label: 'Teléfono' },
          { key: 'email', label: 'Email' },
          { key: 'direccion', label: 'Dirección' },
        ]}
        module="empresa"
        basePath="/empresa"
        entityLabel={labels.empresa}
        onDelete={() => { empresaStore.remove(Number(id)); navigate('/empresa') }}
        bare
      />

      <div className="space-y-3 rounded-lg border border-katt-200 dark:border-katt-800 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-katt-600 dark:text-katt-300">Módulos activos</p>
          <span className="text-sm font-bold text-katt-500">${costoTotal}/mes</span>
        </div>
        <p className="text-xs text-gray-500">Configura qué módulos tiene disponibles esta empresa.</p>
        <div className="space-y-2">
          {(Object.keys(moduleLabels) as (keyof ModuleConfig)[]).map(key => (
            <label key={key} className={`${listItem} cursor-pointer`}>
              <div>
                <span className="text-sm">{moduleLabels[key]}</span>
                {getCosto(key) > 0 && <span className="ml-2 text-xs text-gray-500">${getCosto(key)}/mes</span>}
                {getCosto(key) === 0 && <span className="ml-2 text-xs text-gray-400">Incluido</span>}
              </div>
              <input
                type="checkbox"
                checked={isModuleActive(key)}
                onChange={() => toggleModule(key)}
                className="w-4 h-4 rounded border-katt-300 text-katt-500 focus:ring-katt-500"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-katt-200 dark:border-katt-800 p-4">
        <p className="text-sm font-semibold text-katt-600 dark:text-katt-300">Usuarios asignados</p>
        {usuarios.length === 0 ? (
          <p className="text-xs text-gray-500">Sin usuarios asignados.</p>
        ) : (
          <div className="space-y-2">
            {usuarios.map(u => (
              <div key={u.id} className={listItem}>
                <span className="text-sm">{u.nombre}</span>
                <span className="text-xs text-gray-500">{u.rol}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
