import { entityConfigs } from '../lib/entityConfig'
import { DataTable } from '../components/DataTable'
import { citaStore } from '../lib/demoStore'

const { columns, basePath, altaPath, store } = entityConfigs.usuarios

export default function Usuario() {
  // Citas de los doctores seleccionados (para avisar y eliminar en cascada)
  const citasDeDoctores = (filas: Record<string, unknown>[]) => {
    const nombres = new Set(filas.map(f => String(f.nombre || '')))
    return citaStore.getAll().filter(c => nombres.has(String(c.doctor || '')))
  }
  return <DataTable
    columns={columns} fetchPage={(p) => store.getPage(p)} basePath={basePath} altaPath={altaPath}
    removeItem={store.remove}
    deleteWarning={async filas => {
      const citas = citasDeDoctores(filas)
      return citas.length > 0
        ? `Los doctores seleccionados tienen ${citas.length} cita(s). Si los eliminas, esas citas también se eliminarán.`
        : null
    }}
    beforeDelete={async filas => {
      for (const c of citasDeDoctores(filas)) await citaStore.remove(c.id)
    }}
  />
}
