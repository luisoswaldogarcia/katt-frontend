import { empresaStore } from '../lib/demoStore'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'

const columns: Column[] = [
  { key: 'nombre', label: 'Nombre', filterable: true },
  { key: 'rfc', label: 'RFC', hiddenOn: 'md' },
  { key: 'telefono', label: 'Teléfono', hiddenOn: 'md' },
  { key: 'email', label: 'Email', hiddenOn: 'lg' },
]

export default function Empresa() {
  return <DataTable columns={columns} fetchPage={(p) => empresaStore.getPage(p)} basePath="/empresa" altaPath="/empresa/alta" />
}
