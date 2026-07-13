import { useParams, useNavigate } from 'react-router-dom'
import { labels } from '../lib/labels'
import { pacienteStore } from '../lib/demoStore'
import { DataDetail } from '../components/DataDetail'

export default function PacienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const paciente = pacienteStore.getById(Number(id))

  if (!paciente) {
    return <div className="p-4 text-center text-gray-500">{labels.paciente} no encontrado.</div>
  }

  return (
    <DataDetail
      data={paciente as unknown as Record<string, unknown>}
      fields={[
        { key: 'doctor', label: labels.doctor },
        { key: 'proximaCita', label: 'Próxima cita' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'email', label: 'Email' },
      ]}
      module="paciente"
      basePath="/paciente"
      entityLabel={labels.paciente}
      onDelete={() => { pacienteStore.remove(Number(id)); navigate('/paciente') }}
    />
  )
}
