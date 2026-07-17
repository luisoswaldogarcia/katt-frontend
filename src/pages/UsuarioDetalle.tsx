import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { labels } from '../lib/labels'
import { doctorStore, empresaStore } from '../lib/demoStore'
import { moduleLabels } from '../lib/modules'
import type { ModuleConfig } from '../lib/modules'
import { DataDetail } from '../components/DataDetail'

const listItem = "flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800"

export default function UsuarioDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const doctor = doctorStore.getById(id!)
  const [, forceUpdate] = useState(0)

  if (!doctor) {
    return <div className="p-4 text-center text-gray-500">{labels.doctor} no encontrado.</div>
  }

  const empresa = doctor.empresaId ? empresaStore.getById(doctor.empresaId) : null

  const allModuleKeys = Object.keys(moduleLabels) as (keyof ModuleConfig)[]
  const empresaModules = empresa?.modules || {}
  const activeSystemModules = empresa
    ? allModuleKeys.filter(k => empresaModules[k] !== false)
    : allModuleKeys
  const userModules = doctor.modules || {}

  function toggleModule(key: string) {
    const updated = { ...userModules, [key]: !userModules[key] }
    doctorStore.update(id!, { modules: updated })
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-4 h-full overflow-y-auto space-y-6">
      <DataDetail
        data={{ ...doctor, empresa: empresa?.nombre || 'Sin empresa' } as unknown as Record<string, unknown>}
        fields={[
          { key: 'rol', label: 'Rol' },
          { key: 'empresa', label: 'Empresa' },
          { key: 'telefono', label: 'Teléfono' },
          { key: 'email', label: 'Email' },
        ]}
        module="doctor"
        basePath="/doctor"
        entityLabel={labels.doctor}
        onDelete={async () => { await doctorStore.remove(id!); navigate('/doctor') }}
        bare
      />

      <div className="space-y-3 rounded-lg border border-katt-200 dark:border-katt-800 p-4">
        <p className="text-sm font-semibold text-katt-600 dark:text-katt-300">Módulos asignados</p>
        <p className="text-xs text-gray-500">Solo se muestran los módulos activos del sistema.</p>
        <div className="space-y-2">
          {activeSystemModules.map(key => (
            <label key={key} className={`${listItem} cursor-pointer`}>
              <span className="text-sm">{moduleLabels[key]}</span>
              <input
                type="checkbox"
                checked={!!userModules[key]}
                onChange={() => toggleModule(key)}
                className="w-4 h-4 rounded border-katt-300 text-katt-500 focus:ring-katt-500"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
