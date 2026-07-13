import { useParams, useNavigate } from 'react-router-dom'
import { doctorStore } from '../lib/demoStore'
import { DataForm } from '../components/DataForm'
import type { FormField } from '../components/DataForm'

const fields: FormField[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'especialidad', label: 'Especialidad' },
  { key: 'telefono', label: 'Teléfono', type: 'tel' },
  { key: 'email', label: 'Email', type: 'email' },
]

export default function DoctorAlta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const initialData = isEdit ? doctorStore.getById(Number(id)) : undefined

  const handleSubmit = (data: Record<string, string>, custom: Record<string, unknown>) => {
    if (isEdit) {
      doctorStore.update(Number(id), { ...data, custom })
    } else {
      doctorStore.create({ ...data, custom } as never)
    }
    navigate('/doctor')
  }

  return <DataForm fields={fields} module="doctor" basePath="/doctor" initialData={initialData as never} onSubmit={handleSubmit} isEdit={isEdit} />
}
