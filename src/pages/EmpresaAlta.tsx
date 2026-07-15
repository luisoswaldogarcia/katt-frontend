import { useParams, useNavigate } from 'react-router-dom'
import { entityConfigs } from '../lib/entityConfig'
import { DataForm } from '../components/DataForm'
import { api } from '../lib/api'
import type { Module } from '../lib/customFields'

export default function EmpresaAlta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const config = entityConfigs.empresa
  const isEdit = !!id
  const initialData = isEdit ? config.store.getById(id) : undefined

  const handleSubmit = async (data: Record<string, string>, custom: Record<string, unknown>, foto?: string) => {
    if (isEdit) {
      await config.store.update(id, { ...data, custom, foto })
    } else {
      await api.onboard({ nombre: data.nombre, email: data.email })
    }
    navigate(config.basePath)
  }

  return <DataForm fields={config.fields} module={config.module as Module} basePath={config.basePath} initialData={initialData as never} onSubmit={handleSubmit} isEdit={isEdit} />
}
