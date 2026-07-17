import { useParams, useNavigate } from 'react-router-dom'
import { entityConfigs } from '../lib/entityConfig'
import { DataForm } from '../components/DataForm'
import type { Module } from '../lib/customFields'
import type { FormField } from '../components/DataForm'

interface Props {
  entity: string
  extraFields?: FormField[]
}

export function EntityAlta({ entity, extraFields }: Props) {
  const { id } = useParams()
  const navigate = useNavigate()
  const config = entityConfigs[entity]
  const isEdit = !!id
  const initialData = isEdit ? config.store.getById(id) : undefined
  const fields = extraFields || config.fields

  const handleSubmit = async (data: Record<string, string>, custom: Record<string, unknown>, foto?: string) => {
    if (isEdit) {
      await config.store.update(id, { ...data, custom, foto })
    } else {
      await config.store.create({ ...data, custom, foto } as never)
    }
    navigate(config.basePath)
  }

  return <DataForm fields={fields} module={config.module as Module} basePath={config.basePath} initialData={initialData as never} onSubmit={handleSubmit} isEdit={isEdit} />
}
