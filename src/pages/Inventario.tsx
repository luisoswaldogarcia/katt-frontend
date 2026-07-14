import { inventarioStore } from '../lib/demoStore'
import { useNavigate } from 'react-router-dom'
import { DataTable } from '../components/DataTable'
import type { Column, FabMenuItem } from '../components/DataTable'

const columns: Column[] = [
  { key: 'nombre', label: 'Nombre', filterable: true },
  { key: 'categoria', label: 'Categoría', filterable: true },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'unidad', label: 'Unidad', hiddenOn: 'md' },
  { key: 'precioUnitario', label: 'Precio', hiddenOn: 'lg' },
]

export default function Inventario() {
  const navigate = useNavigate()

  const fabMenu: FabMenuItem[] = [
    {
      label: 'Nuevo',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 5v14M5 12h14" /></svg>,
      onClick: () => navigate('/inventario/alta'),
    },
    {
      label: 'Alta masiva',
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>,
      onClick: () => navigate('/inventario/carga'),
    },
  ]

  return <DataTable columns={columns} fetchPage={(p) => inventarioStore.getPage(p)} basePath="/inventario" altaPath="/inventario/alta" selectable onSelectionAction={(ids) => navigate('/inventario/movimiento', { state: { ids } })} fabMenu={fabMenu} />
}
