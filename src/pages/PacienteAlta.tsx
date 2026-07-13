import { useParams, useNavigate } from 'react-router-dom'
import { labels } from '../lib/labels'
import { pacienteStore } from '../lib/demoStore'
import { DataForm } from '../components/DataForm'
import type { FormField } from '../components/DataForm'

const fields: FormField[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'doctor', label: labels.doctor },
  { key: 'proximaCita', label: 'Próxima cita', type: 'date', required: false },
  { key: 'telefono', label: 'Teléfono', type: 'tel' },
  { key: 'email', label: 'Email', type: 'email' },
]

export default function PacienteAlta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const initialData = isEdit ? pacienteStore.getById(Number(id)) : undefined

  const handleSubmit = (data: Record<string, string>, custom: Record<string, unknown>) => {
    if (isEdit) {
      pacienteStore.update(Number(id), { ...data, custom })
    } else {
      pacienteStore.create({ ...data, custom } as never)
    }
    navigate('/paciente')
  }

  return <DataForm fields={fields} module="paciente" basePath="/paciente" initialData={initialData as never} onSubmit={handleSubmit} isEdit={isEdit} />
}
