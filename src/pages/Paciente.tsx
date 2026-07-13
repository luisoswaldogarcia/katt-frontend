import { labels } from '../lib/labels'
import { pacienteStore } from '../lib/demoStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'

const columns: Column[] = [
  { key: 'nombre', label: 'Nombre', filterable: true },
  { key: 'doctor', label: labels.doctor, filterable: true },
  { key: 'proximaCita', label: 'Próxima cita', filterable: true, filterType: 'date' },
  { key: 'telefono', label: 'Teléfono', hiddenOn: 'md' },
  { key: 'email', label: 'Email', hiddenOn: 'lg' },
]

export default function Paciente() {
  return <DataTable columns={columns} fetchPage={(p) => pacienteStore.getPage(p)} basePath="/paciente" altaPath="/paciente/alta" />
}
