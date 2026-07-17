import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSession } from '../lib/auth'
import { entityConfigs } from '../lib/entityConfig'
import { DataForm } from '../components/DataForm'
import { api } from '../lib/api'
import { setActiveEmpresaId } from '../lib/modules'
import type { Module } from '../lib/customFields'

export default function EmpresaAlta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const config = entityConfigs.empresa
  const isEdit = !!id
  const initialData = isEdit ? config.store.getById(id) : undefined
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    getSession().then(s => {
      if (!s?.groups.includes('owner')) setUnauthorized(true)
    })
  }, [])

  const handleSubmit = async (data: Record<string, string>, custom: Record<string, unknown>, foto?: string) => {
    if (isEdit) {
      await config.store.update(id, { ...data, custom, foto })
    } else {
      const res = await api.onboard(data)
      setActiveEmpresaId(res.empresaId)
    }
    navigate(config.basePath)
  }

  if (unauthorized) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Solo el usuario owner puede crear empresas.</p>
      </div>
    )
  }

  return <DataForm fields={config.fields} module={config.module as Module} basePath={config.basePath} initialData={initialData as never} onSubmit={handleSubmit} isEdit={isEdit} />
}
