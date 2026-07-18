import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { entityConfigs } from '../lib/entityConfig'
import { DataForm } from '../components/DataForm'
import type { Module } from '../lib/customFields'
import type { FormField } from '../components/DataForm'

interface Props {
  entity: string
  extraFields?: FormField[]
  onBeforeSubmit?: (data: Record<string, string>) => string | null
  extraData?: Record<string, unknown>
  onAfterCreate?: (result: unknown) => void
}

export function EntityAlta({ entity, extraFields, onBeforeSubmit, extraData, onAfterCreate }: Props) {
  const { id } = useParams()
  const navigate = useNavigate()
  const config = entityConfigs[entity]
  const [error, setError] = useState('')
  const isEdit = !!id
  const initialData = isEdit ? config.store.getById(id) : undefined
  const fields = extraFields || config.fields

  const handleSubmit = async (data: Record<string, string>, custom: Record<string, unknown>, foto?: string) => {
    if (onBeforeSubmit) {
      const msg = onBeforeSubmit(data)
      if (msg) { setError(msg); return }
    }
    setError('')
    try {
      if (isEdit) {
        await config.store.update(id, { ...data, custom, foto })
        navigate(config.basePath)
      } else {
        const result = await config.store.create({ ...data, ...extraData, custom, foto } as never)
        if (onAfterCreate) {
          await onAfterCreate(result)
        } else {
          navigate(config.basePath)
        }
      }
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
    }
  }

  return (
    <>
      {error && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-red-500 text-white text-sm shadow-lg">{error}</div>}
      <DataForm fields={fields} module={config.module as Module} basePath={config.basePath} initialData={initialData as never} onSubmit={handleSubmit} isEdit={isEdit} />
    </>
  )
}
