import { entityConfigs } from '../lib/entityConfig'
import { getModuleCatalog } from '../lib/moduleCatalog'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import type { PageResult } from '../lib/demoStore'

const { basePath, altaPath, store } = entityConfigs.empresa

const columns: Column[] = [
  { key: 'nombre', label: 'Nombre', filterable: true },
  { key: 'montoMensual', label: 'Monto/mes' },
  { key: 'statusPago', label: 'Status', filterable: true },
  { key: 'telefono', label: 'Teléfono', hiddenOn: 'md' },
]

function calcularMonto(modules?: Partial<Record<string, boolean>>): string {
  if (!modules) return '$0'
  const catalog = getModuleCatalog()
  const total = catalog.reduce((sum, m) => modules[m.key] !== false ? sum + m.costo : sum, 0)
  return `$${total}`
}

export default function Empresa() {
  const fetchPage = async (page: number): Promise<PageResult<Record<string, unknown>>> => {
    const result = await store.getPage(page)
    const data = result.data.map(e => ({
      ...e,
      montoMensual: calcularMonto((e as { modules?: Partial<Record<string, boolean>> }).modules),
      statusPago: (e as { statusPago?: string }).statusPago || 'Sin definir',
    }))
    return { ...result, data }
  }

  return <DataTable columns={columns} fetchPage={fetchPage} basePath={basePath} altaPath={altaPath} />
}
