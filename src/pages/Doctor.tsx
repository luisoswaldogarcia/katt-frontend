import { doctorStore } from '../lib/demoStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'

const columns: Column[] = [
  { key: 'nombre', label: 'Nombre', filterable: true },
  { key: 'especialidad', label: 'Especialidad', filterable: true },
  { key: 'telefono', label: 'Teléfono', hiddenOn: 'md' },
  { key: 'email', label: 'Email', hiddenOn: 'lg' },
]

export default function Doctor() {
  return <DataTable columns={columns} fetchPage={(p) => doctorStore.getPage(p)} basePath="/doctor" altaPath="/doctor/alta" />
}
