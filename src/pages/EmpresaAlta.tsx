import { useParams, useNavigate } from 'react-router-dom'
import { empresaStore } from '../lib/demoStore'
import { DataForm } from '../components/DataForm'
import type { FormField } from '../components/DataForm'

const fields: FormField[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'rfc', label: 'RFC', required: false },
  { key: 'telefono', label: 'Teléfono', type: 'tel' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'direccion', label: 'Dirección', required: false },
]

export default function EmpresaAlta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const initialData = isEdit ? empresaStore.getById(Number(id)) : undefined

  const handleSubmit = (data: Record<string, string>, custom: Record<string, unknown>, foto?: string) => {
    if (isEdit) {
      empresaStore.update(Number(id), { ...data, custom, foto })
    } else {
      empresaStore.create({ ...data, custom, foto } as never)
    }
    navigate('/empresa')
  }

  return <DataForm fields={fields} module="empresa" basePath="/empresa" initialData={initialData as never} onSubmit={handleSubmit} isEdit={isEdit} />
}
