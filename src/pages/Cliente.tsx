import { useNavigate } from 'react-router-dom'
import { entityConfigs } from '../lib/entityConfig'
import { DataTable } from '../components/DataTable'
import type { Column } from '../components/DataTable'
import type { PageResult } from '../lib/demoStore'

const { columns, basePath, altaPath, store } = entityConfigs.paciente

// Paciente "nuevo": creado desde la cita o sin información de contacto completa
function infoIncompleta(p: Record<string, unknown>): boolean {
  return p.pendienteCompletar === true || !p.telefono || !p.email
}
const calendarIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>

const cols: Column[] = [columns[0], { key: 'estado', label: 'Estado', filterable: true }, ...columns.slice(1)]

export default function Cliente() {
  const navigate = useNavigate()
  const fetchPage = async (page: number): Promise<PageResult<Record<string, unknown>>> => {
    const result = await store.getPage(page)
    // Los pacientes con información incompleta van hasta arriba
    const data = result.data
      .map(p => ({ ...p, estado: infoIncompleta(p) ? 'Paciente nuevo' : 'Completo' }))
      .sort((a, b) => Number(infoIncompleta(b)) - Number(infoIncompleta(a)))
    return { ...result, data }
  }
  return <DataTable columns={cols} fetchPage={fetchPage} basePath={basePath} altaPath={altaPath} selectable removeItem={store.remove} onSelectionAction={(ids) => navigate('/paciente/citas', { state: { ids } })} selectionIcon={calendarIcon} />
}
