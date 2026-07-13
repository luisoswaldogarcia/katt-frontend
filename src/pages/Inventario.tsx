import { labels } from '../lib/labels'
import { inventarioStore } from '../lib/demoStore'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'

const columns: Column[] = [
  { key: 'nombre', label: 'Nombre', filterable: true },
  { key: 'categoria', label: 'Categoría', filterable: true },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'unidad', label: 'Unidad', hiddenOn: 'md' },
  { key: 'precioUnitario', label: 'Precio', hiddenOn: 'lg' },
]

export default function Inventario() {
  const navigate = useNavigate()
  return <DataTable columns={columns} fetchPage={(p) => inventarioStore.getPage(p)} basePath="/inventario" altaPath="/inventario/alta" selectable onSelectionAction={(ids) => navigate('/inventario/movimiento', { state: { ids } })} />
}
