import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCustomFields } from '../lib/customFields'
import { ConfirmModal } from './ConfirmModal'
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
  bare?: boolean
  hideButtons?: boolean
  hideCustom?: boolean
}

export function DataDetail({ data, fields, module, basePath, entityLabel, onDelete, bare, hideButtons, hideCustom }: Props) {
  const navigate = useNavigate()
  const customFields = getCustomFields(module)
  const custom = data.custom as Record<string, unknown> | undefined
  const [showConfirm, setShowConfirm] = useState(false)

  const content = (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-katt-200 dark:bg-katt-700 flex items-center justify-center text-xl font-bold overflow-hidden">
            {data.foto ? (
              <img src={String(data.foto)} alt="" className="w-full h-full object-cover" />
            ) : (
              String(data.nombre || '?')[0]
            )}
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

        {!hideCustom && custom && customFields.length > 0 && (
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

        {!hideButtons && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`${basePath}/editar/${data.id}`)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-colors"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmModal
          message={`¿Eliminar "${String(data.nombre)}"? Esta acción no se puede deshacer.`}
          onConfirm={onDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )

  if (bare) return content

  return (
    <div className="p-4 h-full overflow-y-auto space-y-6">
      {content}
    </div>
  )
}
