import { useNavigate } from 'react-router-dom'
import { getCustomFields } from '../lib/customFields'
import type { Module } from '../lib/customFields'

interface Field {
  key: string
  label: string
}

interface Props {
  data: Record<string, unknown>
  fields: Field[]
  module: Module
  basePath: string
  entityLabel: string
  onDelete: () => void
}

export function DataDetail({ data, fields, module, basePath, entityLabel, onDelete }: Props) {
  const navigate = useNavigate()
  const customFields = getCustomFields(module)
  const custom = data.custom as Record<string, unknown> | undefined

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-katt-200 dark:bg-katt-700 flex items-center justify-center text-xl font-bold">
            {String(data.nombre || '?')[0]}
          </div>
          <div>
            <h2 className="text-lg font-bold">{String(data.nombre)}</h2>
            <p className="text-sm text-gray-500">{entityLabel}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-katt-200 dark:border-katt-800 p-4">
          {fields.map(f => (
            <div key={f.key} className="flex justify-between text-sm">
              <span className="text-gray-500">{f.label}</span>
              <span>{String(data[f.key] || '—')}</span>
            </div>
          ))}
        </div>

        {custom && customFields.length > 0 && (
          <div className="space-y-3 rounded-lg border border-katt-200 dark:border-katt-800 p-4">
            {customFields.map(f => {
              const val = custom[f.id]
              if (val === undefined || val === '' || val === null) return null
              return (
                <div key={f.id} className="flex justify-between text-sm">
                  <span className="text-gray-500">{f.label}</span>
                  <span>{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`${basePath}/editar/${data.id}`)}
            className="flex-1 px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="flex-1 px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>

        <button
          onClick={() => navigate(basePath)}
          className="w-full px-4 py-2 rounded-lg text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors border border-katt-200 dark:border-katt-800"
        >
          Volver
        </button>
      </div>
    </div>
  )
}
