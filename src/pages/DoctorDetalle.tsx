import { useParams, useNavigate } from 'react-router-dom'
import { labels } from '../lib/labels'
import { doctorStore } from '../lib/demoStore'
import { DataDetail } from '../components/DataDetail'

export default function DoctorDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const doctor = doctorStore.getById(Number(id))

  if (!doctor) {
    return <div className="p-4 text-center text-gray-500">{labels.doctor} no encontrado.</div>
  }

  return (
    <DataDetail
      data={doctor as unknown as Record<string, unknown>}
      fields={[
        { key: 'rol', label: 'Rol' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'email', label: 'Email' },
      ]}
      module="doctor"
      basePath="/doctor"
      entityLabel={labels.doctor}
      onDelete={() => { doctorStore.remove(Number(id)); navigate('/doctor') }}
    />
  )
}
